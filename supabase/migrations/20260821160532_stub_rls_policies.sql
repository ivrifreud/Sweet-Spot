-- ============================================================================
-- Day 2 — Stub RLS policies
-- Tightened on Day 8 once real usage surfaces edge cases.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- no insert policy: rows are created by the handle_new_user trigger
-- (security definer), which bypasses RLS — regular users never insert here directly.


-- ----------------------------------------------------------------------------
-- elo_ratings — read-only from the client, see note above
-- ----------------------------------------------------------------------------
alter table public.elo_ratings enable row level security;

create policy "users can view own elo"
  on public.elo_ratings for select
  using (auth.uid() = user_id);

-- no insert/update policy: writes happen via a privileged function (Day 3),
-- not directly from the client.


-- ----------------------------------------------------------------------------
-- chip_stacks — read-only from the client, see note above
-- ----------------------------------------------------------------------------
alter table public.chip_stacks enable row level security;

create policy "users can view own chip stack"
  on public.chip_stacks for select
  using (auth.uid() = user_id);

-- no insert/update policy: burn/lock/regen logic (Day 5) writes via a
-- privileged function, not directly from the client.


-- ----------------------------------------------------------------------------
-- spots — content, not user data
-- ----------------------------------------------------------------------------
alter table public.spots enable row level security;

create policy "authenticated users can read spots"
  on public.spots for select
  to authenticated
  using (true);

-- no insert/update/delete policy: spot content is authored by you directly
-- in the database, not by players.


-- ----------------------------------------------------------------------------
-- calibration_sessions
-- ----------------------------------------------------------------------------
alter table public.calibration_sessions enable row level security;

create policy "users can view own calibration sessions"
  on public.calibration_sessions for select
  using (auth.uid() = user_id);

create policy "users can create own calibration sessions"
  on public.calibration_sessions for insert
  with check (auth.uid() = user_id);

create policy "users can update own calibration sessions"
  on public.calibration_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- stage_progress
-- ----------------------------------------------------------------------------
alter table public.stage_progress enable row level security;

create policy "users can view own stage progress"
  on public.stage_progress for select
  using (auth.uid() = user_id);

create policy "users can create own stage progress"
  on public.stage_progress for insert
  with check (auth.uid() = user_id);

create policy "users can update own stage progress"
  on public.stage_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- spot_attempts — append-only audit log, no update/delete for anyone
-- ----------------------------------------------------------------------------
alter table public.spot_attempts enable row level security;

create policy "users can view own spot attempts"
  on public.spot_attempts for select
  using (auth.uid() = user_id);

create policy "users can log own spot attempts"
  on public.spot_attempts for insert
  with check (auth.uid() = user_id);

-- no update/delete policy anywhere: once an attempt is logged, it's
-- permanent — this table doubles as the raw data for the Data Collection
-- plan later, so it shouldn't be editable after the fact.