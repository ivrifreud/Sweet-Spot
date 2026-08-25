-- ============================================================================
-- Calibration spots: position + banner copy, deterministic sequence per type.
-- ============================================================================

alter table public.spots
  add column hero_position text check (
    hero_position in ('UTG', 'MP', 'CO', 'BTN', 'SB', 'BB')
  ),
  add column prompt text;

alter table public.spots
  add constraint spots_spot_type_sequence_order_key unique (spot_type, sequence_order);
