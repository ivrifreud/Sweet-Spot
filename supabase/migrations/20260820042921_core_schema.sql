-- ============================================================================
-- Sweet Spot — Sprint 1 Core Schema
-- Covers: profiles, elo_ratings, chip_stacks, spots, calibration_sessions,
--         stage_progress, spot_attempts
-- Run this in the Supabase SQL Editor, or via `supabase db push` if you set
-- up the CLI with a migrations folder (recommended — see note at bottom).
-- ============================================================================

-- gen_random_uuid() ships with the pgcrypto extension, which Supabase
-- enables by default on new projects. Uncomment if you get a "function
-- gen_random_uuid() does not exist" error:
-- create extension if not exists pgcrypto;


-- ----------------------------------------------------------------------------
-- 1. profiles
-- One row per user, extending Supabase's built-in auth.users. You don't add
-- app-specific columns directly to auth.users — this is the standard pattern.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 2. elo_ratings
-- One row per user. `level` is denormalized from `current_elo` so every other
-- table (and the app) can filter/join on level without recomputing the
-- bucket math every time. A trigger below keeps the two in sync automatically.
--
-- MVP buckets (from the Ranking & Elo spec):
--   Level 1 (Amateur):       0 –  599
--   Level 2 (Beginner):    600 – 1099
--   Level 3 (Intermediate): 1100 – 1499
-- ----------------------------------------------------------------------------
create table public.elo_ratings (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  current_elo integer  not null default 300,
  level       smallint not null default 1 check (level in (1, 2, 3)),
  updated_at  timestamptz not null default now()
);

create or replace function public.sync_elo_level()
returns trigger as $$
begin
  new.level := case
    when new.current_elo >= 1100 then 3
    when new.current_elo >= 600  then 2
    else 1
  end;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_sync_elo_level
  before insert or update of current_elo on public.elo_ratings
  for each row execute function public.sync_elo_level();


-- ----------------------------------------------------------------------------
-- 3. chip_stacks
-- One row per user. Regeneration (12h cooldown) is computed at read time in
-- application code, not by a background job — see the note below the table.
-- ----------------------------------------------------------------------------
create table public.chip_stacks (
  user_id        uuid primary key references public.profiles(id) on delete cascade,
  chips          smallint not null default 3 check (chips between 0 and 3),
  last_burned_at timestamptz,
  updated_at     timestamptz not null default now()
);

-- Regen logic lives in the app/API layer, e.g.:
--   effective_chips = chips >= 3 OR last_burned_at IS NULL
--     ? chips
--     : (now() - last_burned_at >= interval '12 hours' ? 3 : chips)
-- Keeping this out of the DB avoids needing a cron job for Sprint 1;
-- revisit if you need server-authoritative regen later.


-- ----------------------------------------------------------------------------
-- 4. spots
-- Content, not user data — hand-authored for Sprint 1 (calibration + Level 1
-- Stage 1). `pillar` is nullable because calibration spots test general
-- pre-flop/post-flop instinct rather than one specific pillar.
-- ----------------------------------------------------------------------------
create table public.spots (
  id                       uuid primary key default gen_random_uuid(),
  spot_type                text not null check (
                              spot_type in ('calibration_stage1', 'calibration_stage2', 'level1_stage1')
                            ),
  pillar                   smallint check (pillar between 1 and 6),
  hole_cards                text[] not null,
  board                    text[] not null default '{}',
  pot_size                 numeric,
  villain_action           text,
  correct_answer           text not null check (correct_answer in ('fold', 'call', 'raise')),
  is_catastrophic_if_wrong boolean not null default false,
  sequence_order           smallint not null,
  created_at               timestamptz not null default now()
);

-- `is_catastrophic_if_wrong` is what the calibration routing logic reads:
-- Stage 1 fails the user to Level 1 on 2+ wrong answers among spots flagged
-- true here. Mark it true on spots designed to test hard pre-flop leaks
-- (e.g., calling a raise with 72o), false on subtler ones.


-- ----------------------------------------------------------------------------
-- 5. calibration_sessions
-- Tracks one user's run through the two-stage Adaptive Calibration Engine.
-- `status` starts as 'in_progress' and ends as the placement outcome.
-- ----------------------------------------------------------------------------
create table public.calibration_sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  stage          smallint not null default 1 check (stage in (1, 2)),
  errors_count   smallint not null default 0,
  spots_answered smallint not null default 0,
  status         text not null default 'in_progress' check (
                    status in ('in_progress', 'placed_level_1', 'placed_level_2', 'placed_level_3')
                  ),
  started_at     timestamptz not null default now(),
  completed_at   timestamptz
);


-- ----------------------------------------------------------------------------
-- 6. stage_progress
-- Tracks a user's progress through a real level's stage (post-calibration
-- gameplay). One row per (user, level, stage_number).
-- ----------------------------------------------------------------------------
create table public.stage_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  level            smallint not null check (level in (1, 2, 3)),
  stage_number     smallint not null default 1,
  spots_completed  smallint not null default 0,
  status           text not null default 'in_progress' check (
                      status in ('in_progress', 'completed', 'locked_out')
                    ),
  started_at       timestamptz not null default now(),
  completed_at     timestamptz,
  unique (user_id, level, stage_number)
);


-- ----------------------------------------------------------------------------
-- 7. spot_attempts  (recommended addition — not in the original 6-table list)
-- A per-answer audit log. Without this, the calibration routing logic and
-- the Chip Stack burn logic have nothing to read from except counters you'd
-- have to increment blindly — this table makes both queryable and
-- debuggable, and doubles as the raw data the Data Collection plan wants
-- (accuracy by spot, response time, etc.) later.
-- ----------------------------------------------------------------------------
create table public.spot_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  spot_id      uuid not null references public.spots(id),
  session_type text not null check (session_type in ('calibration', 'stage')),
  session_id   uuid not null,  -- calibration_sessions.id or stage_progress.id, per session_type
  is_correct   boolean not null,
  answered_at  timestamptz not null default now()
);

create index idx_spot_attempts_user on public.spot_attempts(user_id);
create index idx_spot_attempts_session on public.spot_attempts(session_type, session_id);


-- ----------------------------------------------------------------------------
-- RLS preview (stubbed properly on Day 2, tightened on Day 8 — see the
-- Sprint 1 Proposal). Every user-owned table above already has a user_id
-- column, which is exactly what RLS policies will filter on, e.g.:
--
--   alter table public.elo_ratings enable row level security;
--   create policy "users read own elo" on public.elo_ratings
--     for select using (auth.uid() = user_id);
--
-- `spots` is content, not user data — it should be readable by any
-- authenticated user and not user-scoped at all.
-- ----------------------------------------------------------------------------