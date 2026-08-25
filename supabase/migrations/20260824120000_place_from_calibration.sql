-- ============================================================================
-- Day 4 — Persist calibration: chosen_answer audit + placement RPC.
-- elo_ratings stays client-read-only; this SECURITY DEFINER function is the
-- only writer. Placement is recomputed from spot_attempts, not trusted from
-- the client.
-- ============================================================================

alter table public.spot_attempts
  add column chosen_answer text check (chosen_answer in ('fold', 'call', 'raise'));

alter table public.spot_attempts
  add constraint spot_attempts_session_spot_key unique (session_id, spot_id);


create or replace function public.place_from_calibration(session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_session public.calibration_sessions%rowtype;
  v_cat integer;
  v_s2_total integer;
  v_s2_miss integer;
  v_placement smallint;
  v_elo integer;
  v_reason text;
  v_status text;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select * into v_session
  from public.calibration_sessions
  where id = place_from_calibration.session_id;

  if not found then
    raise exception 'session not found';
  end if;

  if v_session.user_id <> v_user then
    raise exception 'forbidden';
  end if;

  if v_session.status in ('placed_level_1', 'placed_level_2', 'placed_level_3') then
    v_placement := case v_session.status
      when 'placed_level_1' then 1
      when 'placed_level_2' then 2
      else 3
    end;
    v_elo := case v_placement
      when 1 then 300
      when 2 then 850
      else 1300
    end;
    v_reason := case v_placement
      when 1 then 'stage1_catastrophic'
      when 3 then 'stage2_full_pass'
      else 'stage2_miss'
    end;
    return jsonb_build_object(
      'placement', v_placement,
      'starting_elo', v_elo,
      'reason', v_reason
    );
  end if;

  if v_session.status <> 'in_progress' then
    raise exception 'session not in progress';
  end if;

  select count(*)::integer into v_cat
  from public.spot_attempts a
  join public.spots s on s.id = a.spot_id
  where a.session_id = place_from_calibration.session_id
    and a.session_type = 'calibration'
    and s.spot_type = 'calibration_stage1'
    and a.is_correct = false
    and s.is_catastrophic_if_wrong = true;

  if v_cat >= 2 then
    v_placement := 1;
    v_elo := 300;
    v_reason := 'stage1_catastrophic';
  else
    select
      count(*)::integer,
      count(*) filter (where a.is_correct = false)::integer
    into v_s2_total, v_s2_miss
    from public.spot_attempts a
    join public.spots s on s.id = a.spot_id
    where a.session_id = place_from_calibration.session_id
      and a.session_type = 'calibration'
      and s.spot_type = 'calibration_stage2';

    if v_s2_total < 6 then
      raise exception 'stage 2 sample incomplete';
    end if;

    if v_s2_miss = 0 then
      v_placement := 3;
      v_elo := 1300;
      v_reason := 'stage2_full_pass';
    else
      v_placement := 2;
      v_elo := 850;
      v_reason := 'stage2_miss';
    end if;
  end if;

  v_status := 'placed_level_' || v_placement::text;

  update public.calibration_sessions
  set
    status = v_status,
    completed_at = now()
  where id = place_from_calibration.session_id;

  update public.elo_ratings
  set current_elo = v_elo
  where user_id = v_user;

  if not found then
    raise exception 'elo_ratings row missing';
  end if;

  return jsonb_build_object(
    'placement', v_placement,
    'starting_elo', v_elo,
    'reason', v_reason
  );
end;
$$;

revoke all on function public.place_from_calibration(uuid) from public;
grant execute on function public.place_from_calibration(uuid) to authenticated;
