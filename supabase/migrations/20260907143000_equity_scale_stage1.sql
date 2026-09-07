-- ============================================================================
-- The Equity Scale: five Level 1 Stage 1 demo spots and informational outs.
-- Final correctness remains server-authoritative Call/Fold only.
-- ============================================================================

alter table public.spots
  add column if not exists template_id smallint not null default 1
    check (template_id between 1 and 6),
  add column if not exists template_payload jsonb not null default '{}'::jsonb;

alter table public.spot_attempts
  add column if not exists answer_metadata jsonb not null default '{}'::jsonb;

alter table public.spots
  add constraint spots_equity_scale_payload_check check (
    template_id <> 2
    or (
      pillar = 2
      and jsonb_typeof(template_payload) = 'object'
      and template_payload ?& array[
        'street',
        'potBeforeCall',
        'priceToCall',
        'correctOuts',
        'takeaway'
      ]
      and template_payload->>'street' in ('flop', 'turn')
      and (template_payload->>'potBeforeCall')::numeric >= 0
      and (template_payload->>'priceToCall')::numeric > 0
      and (template_payload->>'correctOuts')::integer between 0 and 20
    )
  );

update public.spots
set
  pillar = payload.pillar,
  hole_cards = payload.hole_cards,
  board = payload.board,
  pot_size = payload.pot_before_call,
  villain_action = payload.villain_action,
  correct_answer = payload.correct_answer,
  is_catastrophic_if_wrong = payload.catastrophic,
  hero_position = payload.hero_position,
  prompt = payload.takeaway,
  template_id = 2,
  template_payload = jsonb_build_object(
    'street', payload.street,
    'potBeforeCall', payload.pot_before_call,
    'priceToCall', payload.price_to_call,
    'correctOuts', payload.correct_outs,
    'takeaway', payload.takeaway
  )
from (
  values
    (
      '33333333-3333-4333-8333-333333333301'::uuid,
      2::smallint,
      array['Ah', '5h'],
      array['Kh', '9h', '2c', '7d'],
      20::numeric,
      4::numeric,
      'BB bets 4bb',
      'call',
      false,
      'BTN',
      'turn',
      9,
      'Nine hearts give about 20% equity. You need 17%, so the call earns chips.'
    ),
    (
      '33333333-3333-4333-8333-333333333302'::uuid,
      2::smallint,
      array['8s', '7s'],
      array['6s', '5d', 'Kc'],
      18::numeric,
      8::numeric,
      'BB bets 8bb',
      'call',
      false,
      'CO',
      'flop',
      8,
      'Eight straight outs hit by the river about 31%. The price needs 31%, making this barely profitable.'
    ),
    (
      '33333333-3333-4333-8333-333333333303'::uuid,
      2::smallint,
      array['Qh', 'Jh'],
      array['Ah', '7h', '2c', '9d'],
      18::numeric,
      10::numeric,
      'BTN bets 10bb',
      'fold',
      true,
      'BB',
      'turn',
      9,
      'Nine hearts give about 20% equity, but this price demands 36%. Fold the draw.'
    ),
    (
      '33333333-3333-4333-8333-333333333304'::uuid,
      2::smallint,
      array['8c', '7c'],
      array['6d', '5h', 'Ks', '2c'],
      30::numeric,
      5::numeric,
      'BTN bets 5bb',
      'call',
      false,
      'SB',
      'turn',
      8,
      'Eight straight outs give 17% equity. The small price asks for only 14%.'
    ),
    (
      '33333333-3333-4333-8333-333333333305'::uuid,
      2::smallint,
      array['Ad', 'Qd'],
      array['Jd', '8d', '2s'],
      12::numeric,
      8::numeric,
      'CO bets 8bb',
      'fold',
      true,
      'UTG',
      'flop',
      9,
      'Nine diamond outs hit by the river about 35%. This price needs 40%, above the draw.'
    )
) as payload(
  id,
  pillar,
  hole_cards,
  board,
  pot_before_call,
  price_to_call,
  villain_action,
  correct_answer,
  catastrophic,
  hero_position,
  street,
  correct_outs,
  takeaway
)
where public.spots.id = payload.id;

-- Four-argument overload keeps the established three-argument RPC available to
-- older clients. It delegates grading first, then records metadata only for a
-- newly accepted attempt.
create or replace function public.submit_stage_answer(
  p_stage_progress_id uuid,
  p_spot_id uuid,
  p_chosen_answer text,
  p_answer_metadata jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_result jsonb;
  v_selected_outs numeric;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  if p_answer_metadata is null or jsonb_typeof(p_answer_metadata) <> 'object' then
    raise exception 'answer metadata must be an object';
  end if;

  if p_answer_metadata ? 'selectedOuts' then
    if jsonb_typeof(p_answer_metadata->'selectedOuts') <> 'number' then
      raise exception 'selectedOuts must be numeric';
    end if;
    v_selected_outs := (p_answer_metadata->>'selectedOuts')::numeric;
    if v_selected_outs <> trunc(v_selected_outs)
      or v_selected_outs < 0
      or v_selected_outs > 20
    then
      raise exception 'selectedOuts must be an integer from 0 to 20';
    end if;
  end if;

  v_result := public.submit_stage_answer(
    p_stage_progress_id,
    p_spot_id,
    p_chosen_answer
  );

  if not (v_result->>'already_submitted')::boolean then
    update public.spot_attempts
    set answer_metadata = p_answer_metadata
    where user_id = v_user
      and session_type = 'stage'
      and session_id = p_stage_progress_id
      and spot_id = p_spot_id;
  end if;

  return v_result;
end;
$$;

revoke all on function public.submit_stage_answer(uuid, uuid, text, jsonb) from public;
grant execute on function public.submit_stage_answer(uuid, uuid, text, jsonb) to authenticated;
