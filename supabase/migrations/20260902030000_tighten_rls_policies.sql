-- ============================================================================
-- Day 8 — Tighten RLS.
-- The Day 2 stub already blocked cross-user reads/writes via `auth.uid()`.
-- This pass closes the self-write integrity holes that gameplay depends on and
-- scopes every policy to the `authenticated` role (anon gets nothing):
--
--   * Progress and Elo are server-authoritative. Gameplay writes to
--     stage_progress and placement writes to calibration_sessions/elo_ratings
--     happen only inside the SECURITY DEFINER RPCs (submit_stage_answer,
--     get_chip_stack, place_from_calibration), which run as the table owner
--     and bypass RLS. The client keeps just the narrow writes it actually
--     needs (create a fresh session/stage row, log its own answers, bump its
--     own calibration counters, edit its own display name).
--   * A user can no longer mark their own stage 'completed', self-place their
--     calibration, or touch chips/Elo directly.
--
-- CAUTION: do NOT enable `force row level security` on these tables. The
-- SECURITY DEFINER functions rely on the owner's RLS bypass to write
-- elo_ratings / chip_stacks / stage_progress, which have no client write
-- policy on purpose.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- profiles — read/update own; only the display name is client-writable.
-- ----------------------------------------------------------------------------
drop policy if exists "users can view own profile" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;

create policy "users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;


-- ----------------------------------------------------------------------------
-- elo_ratings — read own only. All writes go through place_from_calibration
-- and submit_stage_answer (SECURITY DEFINER).
-- ----------------------------------------------------------------------------
drop policy if exists "users can view own elo" on public.elo_ratings;

create policy "users can view own elo"
  on public.elo_ratings for select
  to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.elo_ratings from anon, authenticated;


-- ----------------------------------------------------------------------------
-- chip_stacks — read own only. All writes go through get_chip_stack and
-- submit_stage_answer (SECURITY DEFINER).
-- ----------------------------------------------------------------------------
drop policy if exists "users can view own chip stack" on public.chip_stacks;

create policy "users can view own chip stack"
  on public.chip_stacks for select
  to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.chip_stacks from anon, authenticated;


-- ----------------------------------------------------------------------------
-- spots — content, read-only to authenticated users.
-- ----------------------------------------------------------------------------
drop policy if exists "authenticated users can read spots" on public.spots;

create policy "authenticated users can read spots"
  on public.spots for select
  to authenticated
  using (true);

revoke insert, update, delete on public.spots from anon, authenticated;


-- ----------------------------------------------------------------------------
-- calibration_sessions — create a fresh (in_progress) session, bump own
-- counters, read own. The client may NOT set `status`/`completed_at`; placement
-- is written only by place_from_calibration, so a user cannot self-place.
-- ----------------------------------------------------------------------------
drop policy if exists "users can view own calibration sessions" on public.calibration_sessions;
drop policy if exists "users can create own calibration sessions" on public.calibration_sessions;
drop policy if exists "users can update own calibration sessions" on public.calibration_sessions;

create policy "users can view own calibration sessions"
  on public.calibration_sessions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can create own calibration sessions"
  on public.calibration_sessions for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'in_progress');

create policy "users can update own calibration sessions"
  on public.calibration_sessions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Column-scope the client's UPDATE: it may only move the progress counters,
-- never the placement status.
revoke insert, update, delete on public.calibration_sessions from anon, authenticated;
grant insert on public.calibration_sessions to authenticated;
grant update (stage, errors_count, spots_answered) on public.calibration_sessions to authenticated;


-- ----------------------------------------------------------------------------
-- stage_progress — create a fresh (zeroed) stage row and read own progress.
-- The client can NO LONGER update it directly: spots_completed / status /
-- completed_at are advanced only by submit_stage_answer + get_chip_stack
-- (SECURITY DEFINER), so progression can't be forged.
-- ----------------------------------------------------------------------------
drop policy if exists "users can view own stage progress" on public.stage_progress;
drop policy if exists "users can create own stage progress" on public.stage_progress;
drop policy if exists "users can update own stage progress" on public.stage_progress;

create policy "users can view own stage progress"
  on public.stage_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can create own stage progress"
  on public.stage_progress for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and spots_completed = 0
    and status = 'in_progress'
  );

revoke insert, update, delete on public.stage_progress from anon, authenticated;
grant insert on public.stage_progress to authenticated;


-- ----------------------------------------------------------------------------
-- spot_attempts — append-only log of own answers. No update/delete for anyone.
--
-- KNOWN LIMITATION (out of scope this sprint): calibration attempts are
-- inserted by the client with a client-computed is_correct, which
-- place_from_calibration then trusts. Progression/Elo can't be forged (those
-- are locked above), but a user could still influence their own calibration
-- placement. Closing this fully means moving calibration answer submission
-- into a submit_calibration_answer RPC, mirroring submit_stage_answer.
-- ----------------------------------------------------------------------------
drop policy if exists "users can view own spot attempts" on public.spot_attempts;
drop policy if exists "users can log own spot attempts" on public.spot_attempts;

create policy "users can view own spot attempts"
  on public.spot_attempts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can log own spot attempts"
  on public.spot_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

revoke update, delete on public.spot_attempts from anon, authenticated;
