-- ============================================================================
-- Persist per-spot Elo on spots. submit_stage_answer reads spots.spot_elo
-- instead of a hardcoded 300 (same default, same formula).
-- ============================================================================

alter table public.spots
  add column if not exists spot_elo integer not null default 300
  check (spot_elo >= 0);

update public.spots
set spot_elo = 300
where spot_type = 'level1_stage1'
  and spot_elo is distinct from 300;


create or replace function public.submit_stage_answer(
  p_stage_progress_id uuid,
  p_spot_id uuid,
  p_chosen_answer text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_stage public.stage_progress%rowtype;
  v_spot public.spots%rowtype;
  v_stack public.chip_stacks%rowtype;
  v_attempt public.spot_attempts%rowtype;
  v_now timestamptz := now();
  v_is_correct boolean;
  v_regen_at timestamptz;
  v_expected_spot_type text;
  v_current_elo integer;
  v_score double precision;
  v_expected double precision;
  v_delta integer;
  v_spot_elo double precision;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  if p_chosen_answer is null
    or p_chosen_answer not in ('fold', 'call', 'raise')
  then
    raise exception 'invalid answer';
  end if;

  -- Always lock a user's chip row before stage rows. get_chip_stack follows
  -- the same order when it unlocks stages, avoiding cross-RPC deadlocks.
  select * into v_stack
  from public.chip_stacks
  where user_id = v_user
  for update;

  if not found then
    raise exception 'chip stack not found';
  end if;

  select * into v_stage
  from public.stage_progress
  where id = p_stage_progress_id
  for update;

  if not found then
    raise exception 'stage progress not found';
  end if;

  if v_stage.user_id <> v_user then
    raise exception 'forbidden';
  end if;

  if v_stack.chips < 3
    and v_stack.last_burned_at is not null
    and v_stack.last_burned_at + interval '12 hours' <= v_now
  then
    update public.chip_stacks
    set
      chips = 3,
      last_burned_at = null,
      updated_at = v_now
    where user_id = v_user
    returning * into v_stack;

    update public.stage_progress
    set status = 'in_progress'
    where user_id = v_user
      and status = 'locked_out';

    select * into v_stage
    from public.stage_progress
    where id = p_stage_progress_id;
  end if;

  select current_elo into v_current_elo
  from public.elo_ratings
  where user_id = v_user;

  if not found then
    raise exception 'elo_ratings row missing';
  end if;

  select * into v_attempt
  from public.spot_attempts
  where session_id = p_stage_progress_id
    and spot_id = p_spot_id
    and session_type = 'stage';

  if found then
    v_regen_at := case
      when v_stack.chips < 3 and v_stack.last_burned_at is not null
        then v_stack.last_burned_at + interval '12 hours'
      else null
    end;

    return jsonb_build_object(
      'is_correct', v_attempt.is_correct,
      'chips', v_stack.chips,
      'locked_out', v_stack.chips = 0,
      'regen_at', v_regen_at,
      'stage_status', v_stage.status,
      'already_submitted', true,
      'current_elo', v_current_elo
    );
  end if;

  if v_stage.status <> 'in_progress' then
    raise exception 'stage not in progress';
  end if;

  if v_stack.chips = 0 then
    raise exception 'chip stack locked';
  end if;

  select * into v_spot
  from public.spots
  where id = p_spot_id;

  if not found then
    raise exception 'spot not found';
  end if;

  v_spot_elo := v_spot.spot_elo;

  v_expected_spot_type :=
    'level' || v_stage.level::text || '_stage' || v_stage.stage_number::text;

  if v_spot.spot_type <> v_expected_spot_type then
    raise exception 'spot does not belong to stage';
  end if;

  v_is_correct := v_spot.correct_answer = p_chosen_answer;

  insert into public.spot_attempts (
    user_id,
    spot_id,
    session_type,
    session_id,
    is_correct,
    chosen_answer
  )
  values (
    v_user,
    p_spot_id,
    'stage',
    p_stage_progress_id,
    v_is_correct,
    p_chosen_answer
  )
  returning * into v_attempt;

  update public.stage_progress
  set spots_completed = spots_completed + 1
  where id = p_stage_progress_id
  returning * into v_stage;

  if not v_is_correct then
    update public.chip_stacks
    set
      chips = greatest(chips - 1, 0),
      last_burned_at = v_now,
      updated_at = v_now
    where user_id = v_user
    returning * into v_stack;
  end if;

  if v_stage.spots_completed >= 7 then
    update public.stage_progress
    set
      status = 'completed',
      completed_at = v_now
    where id = p_stage_progress_id
    returning * into v_stage;
  elsif v_stack.chips = 0 then
    update public.stage_progress
    set status = 'locked_out'
    where id = p_stage_progress_id
    returning * into v_stage;
  end if;

  v_score := case when v_is_correct then 1.0 else 0.0 end;
  v_expected := 1.0 / (
    1.0 + power(10.0, (v_spot_elo - v_current_elo::double precision) / 400.0)
  );
  v_delta := round((16.0 * (v_score - v_expected))::numeric)::integer;
  if (not v_is_correct) and v_spot.is_catastrophic_if_wrong then
    v_delta := v_delta * 2;
  end if;

  update public.elo_ratings
  set current_elo = greatest(0, current_elo + v_delta)
  where user_id = v_user
  returning current_elo into v_current_elo;

  v_regen_at := case
    when v_stack.chips < 3 and v_stack.last_burned_at is not null
      then v_stack.last_burned_at + interval '12 hours'
    else null
  end;

  return jsonb_build_object(
    'is_correct', v_is_correct,
    'chips', v_stack.chips,
    'locked_out', v_stack.chips = 0,
    'regen_at', v_regen_at,
    'stage_status', v_stage.status,
    'already_submitted', false,
    'current_elo', v_current_elo
  );
end;
$$;
