-- ============================================================================
-- Consecutive-day streaks for regular stage activity.
-- The client sends its local calendar day (YYYY-MM-DD). Server enforces:
--   same day: no change
--   next day: increment
--   gap day(s): reset to 1
-- Future/older days are ignored to keep updates monotonic.
-- ============================================================================

create table if not exists public.user_streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  last_active_day date,
  updated_at timestamptz not null default now()
);

alter table public.user_streaks enable row level security;

drop policy if exists "users can view own streak" on public.user_streaks;
create policy "users can view own streak"
  on public.user_streaks for select
  to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.user_streaks from anon, authenticated;

insert into public.user_streaks (user_id)
select p.id
from public.profiles p
left join public.user_streaks s on s.user_id = p.id
where s.user_id is null;

create or replace function public.get_streak_state()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_streak public.user_streaks%rowtype;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  insert into public.user_streaks (user_id)
  values (v_user)
  on conflict (user_id) do nothing;

  select * into v_streak
  from public.user_streaks
  where user_id = v_user;

  return jsonb_build_object(
    'current_streak', v_streak.current_streak,
    'best_streak', v_streak.best_streak,
    'last_active_day', v_streak.last_active_day
  );
end;
$$;

create or replace function public.mark_streak_activity(p_local_day date)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_streak public.user_streaks%rowtype;
  v_next_streak integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  if p_local_day is null then
    raise exception 'local day is required';
  end if;

  insert into public.user_streaks (user_id)
  values (v_user)
  on conflict (user_id) do nothing;

  select * into v_streak
  from public.user_streaks
  where user_id = v_user
  for update;

  if v_streak.last_active_day is null then
    v_next_streak := 1;
    update public.user_streaks
    set
      current_streak = v_next_streak,
      best_streak = greatest(best_streak, v_next_streak),
      last_active_day = p_local_day,
      updated_at = now()
    where user_id = v_user
    returning * into v_streak;
  elsif p_local_day = v_streak.last_active_day then
    null;
  elsif p_local_day = v_streak.last_active_day + 1 then
    v_next_streak := v_streak.current_streak + 1;
    update public.user_streaks
    set
      current_streak = v_next_streak,
      best_streak = greatest(best_streak, v_next_streak),
      last_active_day = p_local_day,
      updated_at = now()
    where user_id = v_user
    returning * into v_streak;
  elsif p_local_day > v_streak.last_active_day + 1 then
    v_next_streak := 1;
    update public.user_streaks
    set
      current_streak = v_next_streak,
      best_streak = greatest(best_streak, v_next_streak),
      last_active_day = p_local_day,
      updated_at = now()
    where user_id = v_user
    returning * into v_streak;
  else
    null;
  end if;

  return jsonb_build_object(
    'current_streak', v_streak.current_streak,
    'best_streak', v_streak.best_streak,
    'last_active_day', v_streak.last_active_day
  );
end;
$$;

revoke all on function public.get_streak_state() from public;
grant execute on function public.get_streak_state() to authenticated;

revoke all on function public.mark_streak_activity(date) from public;
grant execute on function public.mark_streak_activity(date) to authenticated;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.elo_ratings (user_id) values (new.id);
  insert into public.chip_stacks (user_id) values (new.id);
  insert into public.user_streaks (user_id) values (new.id);

  return new;
end;
$$ language plpgsql security definer;
