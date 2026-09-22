import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ambiencePlaybackVolume,
  selectAmbienceCandidates,
  type AmbienceName,
  type AudioLighting,
  type AudioWorldId,
} from './beds';
import {
  CORRECT_LAYER_CUES,
  CORRECT_POOL,
  IDLE_POOL,
  INCORRECT_POOL,
  pickQueued,
  shouldReplayDecisionSting,
  type IdleCue,
} from './cues';

export type { AmbienceName, AudioLighting, AudioWorldId } from './beds';
export { selectAmbience, selectJackpotSfx, selectMistakeSfx } from './beds';
export { CORRECT_LAYER_CUES, CORRECT_POOL, IDLE_POOL, INCORRECT_POOL, pickQueued } from './cues';

export type SfxName =
  | 'deal'
  | 'peek'
  | 'settle'
  | 'fold'
  | 'chipPickup'
  | 'call'
  | 'check'
  | 'raise'
  | 'correct'
  | 'correctCasinoCoins'
  | 'confetti'
  | 'incorrect'
  | 'jackpot'
  | 'jackpotHeavy'
  | 'step'
  | 'arrive'
  | 'clouds'
  | 'windSwoosh'
  | 'uiClick'
  | 'nodePress'
  | 'scaleButton'
  | 'shuffle'
  | 'dial';

type Settings = {
  muted: boolean;
  sfxVolume: number;
  ambienceVolume: number;
};

const STORAGE_KEY = 'sweet-spot-audio';
const DEFAULTS: Settings = { muted: false, sfxVolume: 1, ambienceVolume: 0.28 };
const IDLE_GAP_MS = 22000;
const DRY_SFX: ReadonlySet<SfxName> = new Set([
  ...CORRECT_POOL,
  ...CORRECT_LAYER_CUES,
  ...INCORRECT_POOL,
  ...IDLE_POOL,
]);
const OVERLAP_SFX: ReadonlySet<SfxName> = new Set([...CORRECT_LAYER_CUES, 'correctCasinoCoins']);

let settings: Settings = { ...DEFAULTS };
let loaded = false;
let activeBed: AmbienceName = 'garden-ambience';
let lastAmbience: AmbienceName | undefined;
let lastCorrect: (typeof CORRECT_POOL)[number] | undefined;
let lastIncorrect: (typeof INCORRECT_POOL)[number] | undefined;
let lastIdle: IdleCue | undefined;
let lastDecisionKey: string | undefined;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let walking = false;
let dialing = false;
let peeking = false;
const lastPlayed: Partial<Record<SfxName | AmbienceName, number>> = {};

const sfxSources: Record<SfxName, number> = {
  deal: require('../../assets/audio/deal.wav'),
  peek: require('../../assets/audio/peek.wav'),
  settle: require('../../assets/audio/settle.wav'),
  fold: require('../../assets/audio/fold.wav'),
  chipPickup: require('../../assets/audio/chip-pickup.wav'),
  call: require('../../assets/audio/call.wav'),
  check: require('../../assets/audio/check.wav'),
  raise: require('../../assets/audio/raise.wav'),
  correct: require('../../assets/audio/correct.wav'),
  correctCasinoCoins: require('../../assets/audio/correct-casino-coins.wav'),
  confetti: require('../../assets/audio/confetti.wav'),
  incorrect: require('../../assets/audio/incorrect.wav'),
  jackpot: require('../../assets/audio/jackpot.wav'),
  jackpotHeavy: require('../../assets/audio/jackpot-heavy.wav'),
  step: require('../../assets/audio/step.wav'),
  arrive: require('../../assets/audio/arrive.wav'),
  clouds: require('../../assets/audio/clouds.wav'),
  windSwoosh: require('../../assets/audio/wind-swoosh.wav'),
  uiClick: require('../../assets/audio/ui-click.wav'),
  nodePress: require('../../assets/audio/node-press.wav'),
  scaleButton: require('../../assets/audio/scale-button.wav'),
  shuffle: require('../../assets/audio/shuffle.wav'),
  dial: require('../../assets/audio/dial.wav'),
};

/** World 1 beds only. Metro resolves every `require` at bundle time; later-world WAVs stay on disk until those skins ship. Night garden uses poker-table.wav. */
const ambienceSources: Partial<Record<AmbienceName, number>> = {
  'garden-ambience': require('../../assets/audio/garden-ambience.wav'),
  'poker-table': require('../../assets/audio/poker-table.wav'),
  'local-casino-vip-1': require('../../assets/audio/local-casino-vip-1.wav'),
  'local-casino-vip-2': require('../../assets/audio/local-casino-vip-2.wav'),
};

type Player = {
  play: () => void;
  pause: () => void;
  seekTo?: (value: number) => void;
  duration?: number;
  loop?: boolean;
  volume?: number;
};

const sfxPlayers: Partial<Record<SfxName, Player>> = {};
const ambiencePlayers: Partial<Record<AmbienceName, Player>> = {};
let nativeAudio: typeof import('expo-audio') | null | undefined;
let audioModeReady = false;

async function ensureNative(): Promise<typeof import('expo-audio') | null> {
  if (nativeAudio !== undefined) return nativeAudio;
  try {
    nativeAudio = await import('expo-audio');
  } catch {
    nativeAudio = null;
  }
  return nativeAudio;
}

async function ensureAudioMode(
  audio: NonNullable<Awaited<ReturnType<typeof ensureNative>>>
): Promise<void> {
  if (audioModeReady) return;
  try {
    await audio.setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
    audioModeReady = true;
  } catch {
    // Keep gameplay running if the session cannot be configured.
  }
}

async function ensureSfxPlayer(name: SfxName): Promise<Player | undefined> {
  if (sfxPlayers[name]) return sfxPlayers[name];
  const audio = await ensureNative();
  if (!audio) return undefined;
  await ensureAudioMode(audio);
  if (sfxPlayers[name]) return sfxPlayers[name];
  try {
    const player = audio.createAudioPlayer(sfxSources[name]) as Player;
    player.loop = false;
    player.pause();
    sfxPlayers[name] = player;
    return player;
  } catch {
    return undefined;
  }
}

async function ensureAmbiencePlayer(name: AmbienceName): Promise<Player | undefined> {
  if (ambiencePlayers[name]) return ambiencePlayers[name];
  const source = ambienceSources[name];
  if (source == null) return undefined;
  const audio = await ensureNative();
  if (!audio) return undefined;
  await ensureAudioMode(audio);
  if (ambiencePlayers[name]) return ambiencePlayers[name];
  try {
    const player = audio.createAudioPlayer(source) as Player;
    player.loop = true;
    ambiencePlayers[name] = player;
    return player;
  } catch {
    return undefined;
  }
}

export async function loadAudioSettings(): Promise<Settings> {
  if (loaded) return settings;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) settings = { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    settings = { ...DEFAULTS };
  }
  loaded = true;
  return settings;
}

async function persist(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Mute state is best-effort.
  }
}

export async function preloadAudio(): Promise<Settings> {
  const next = await loadAudioSettings();
  const audio = await ensureNative();
  if (!audio) return next;
  await ensureAudioMode(audio);
  return next;
}

export async function prepareWorldAmbience(
  worldId?: AudioWorldId,
  lighting: AudioLighting = 'light'
): Promise<void> {
  const next = resolveBed(worldId, lighting);
  await ensureAmbiencePlayer(next);
}

function guarded(name: SfxName | AmbienceName, gapMs = 80): boolean {
  const now = Date.now();
  if ((lastPlayed[name] ?? 0) + gapMs > now) return false;
  lastPlayed[name] = now;
  return true;
}

function pauseAllBeds(): void {
  Object.values(ambiencePlayers).forEach((player) => {
    try {
      player?.pause();
    } catch {
      // Ignore.
    }
  });
}

function pauseOneShotSfx(except?: SfxName): void {
  (Object.entries(sfxPlayers) as [SfxName, Player | undefined][]).forEach(([name, player]) => {
    if (!player || name === except || name === 'step' || name === 'dial' || name === 'peek') return;
    // Correct / incorrect stings own the moment — never clip them for a later cue.
    if (DRY_SFX.has(name)) return;
    if (except && OVERLAP_SFX.has(except) && OVERLAP_SFX.has(name)) return;
    try {
      player.loop = false;
      player.pause();
    } catch {
      // Ignore.
    }
  });
}

function duckTableBed(): void {
  const ambience = ambiencePlayers[activeBed];
  if (!ambience) return;
  const bedVolume = ambiencePlaybackVolume(activeBed, settings.ambienceVolume);
  ambience.volume = bedVolume * 0.32;
  setTimeout(() => {
    if (ambiencePlayers[activeBed] && !settings.muted) {
      ambiencePlayers[activeBed]!.volume = ambiencePlaybackVolume(
        activeBed,
        settings.ambienceVolume
      );
    }
  }, 220);
}

function playReadySfx(name: SfxName, player: Player): void {
  try {
    pauseOneShotSfx(name);
    player.loop = false;
    player.volume = settings.sfxVolume * (name === 'confetti' ? 0.55 : 1);
    const seek = player.seekTo?.(0) as unknown as Promise<void> | void;
    if (seek && typeof (seek as Promise<void>).then === 'function') {
      (seek as Promise<void>).then(() => player.play()).catch(() => player.play());
    } else {
      player.play();
    }
    if (!DRY_SFX.has(name) && name !== 'step') duckTableBed();
  } catch {
    // Ignore playback errors.
  }
}

/**
 * Check is a double-tap. The first press parks the cue at the start so the
 * second press can call play() without waiting on seekTo.
 */
let checkToken = 0;
let checkReadyFor = -1;
let checkSeekDone: Promise<void> | null = null;

function seekCheckToStart(player: Player, token: number): void {
  try {
    player.loop = false;
    player.pause();
    player.volume = settings.sfxVolume;
    const done = () => {
      if (token === checkToken) checkReadyFor = token;
    };
    const seek = player.seekTo?.(0) as unknown as Promise<void> | void;
    if (seek && typeof (seek as Promise<void>).then === 'function') {
      checkSeekDone = (seek as Promise<void>).then(done, done);
    } else {
      checkSeekDone = null;
      done();
    }
  } catch {
    checkSeekDone = null;
  }
}

/** Park the check cue at the start. Call on the first tap of a check. */
export function queueCheckSfx(): void {
  if (settings.muted || settings.sfxVolume <= 0) return;
  const existing = sfxPlayers.check;
  if (existing && checkReadyFor === checkToken && checkReadyFor !== -1) return;
  const token = ++checkToken;
  checkReadyFor = -1;
  if (existing) {
    seekCheckToStart(existing, token);
    return;
  }
  void ensureSfxPlayer('check').then((player) => {
    if (player && token === checkToken) seekCheckToStart(player, token);
  });
}

function startCheckPlayer(player: Player, token: number): void {
  if (token !== checkToken) return;
  if (settings.muted || settings.sfxVolume <= 0) return;
  try {
    pauseOneShotSfx('check');
    stopPeekSfx();
    player.loop = false;
    player.volume = settings.sfxVolume;
    player.play();
    duckTableBed();
    checkReadyFor = -1;
  } catch {
    // Ignore playback errors.
  }
}

/** Start the parked check cue. Call on the second tap's finger-down. */
export function playCheckSfx(): void {
  if (settings.muted || settings.sfxVolume <= 0) return;
  if (!guarded('check', 80)) return;
  const token = checkToken;
  const player = sfxPlayers.check;
  const afterSeek = (ready: Player) => startCheckPlayer(ready, token);
  if (!player) {
    void ensureSfxPlayer('check').then((ready) => {
      if (!ready) return;
      const seek = ready.seekTo?.(0) as unknown as Promise<void> | void;
      if (seek && typeof (seek as Promise<void>).then === 'function') {
        void (seek as Promise<void>).then(() => afterSeek(ready)).catch(() => afterSeek(ready));
      } else {
        afterSeek(ready);
      }
    });
    return;
  }
  if (checkReadyFor === token) {
    afterSeek(player);
    return;
  }
  const pending = checkSeekDone;
  if (pending) {
    void pending.then(() => afterSeek(player));
    return;
  }
  const seek = player.seekTo?.(0) as unknown as Promise<void> | void;
  if (seek && typeof (seek as Promise<void>).then === 'function') {
    void (seek as Promise<void>).then(() => afterSeek(player)).catch(() => afterSeek(player));
  } else {
    afterSeek(player);
  }
}

export function playSfx(name: SfxName): void {
  if (settings.muted || settings.sfxVolume <= 0) return;
  if (!guarded(name, name === 'fold' ? 400 : 80)) return;
  const existing = sfxPlayers[name];
  if (existing) {
    playReadySfx(name, existing);
    return;
  }
  void ensureSfxPlayer(name).then((player) => {
    if (player) playReadySfx(name, player);
  });
}

export function playDecisionSfx(outcome: 'correct' | 'incorrect', key?: string): void {
  if (__DEV__) {
    console.log('[sfx] decision', outcome, key, 'player=', Boolean(sfxPlayers.incorrect));
  }
  if (!shouldReplayDecisionSting(key, lastDecisionKey)) return;
  if (key) lastDecisionKey = key;
  if (outcome === 'correct') {
    lastCorrect = 'correct';
    CORRECT_LAYER_CUES.forEach((cue) => playSfx(cue));
    return;
  }
  const cue = pickQueued(INCORRECT_POOL, lastIncorrect);
  lastIncorrect = cue;
  playSfx(cue);
}

export function playIdleSfx(): void {
  if (IDLE_POOL.length === 0) return;
  const cue = pickQueued(IDLE_POOL, lastIdle);
  lastIdle = cue;
  playSfx(cue);
}

function fireIdle(): void {
  playIdleSfx();
  if (IDLE_POOL.length === 0) return;
  idleTimer = setTimeout(fireIdle, IDLE_GAP_MS);
}

export function noteActivity(): void {
  if (!idleTimer) return;
  clearTimeout(idleTimer);
  idleTimer = IDLE_POOL.length === 0 ? null : setTimeout(fireIdle, IDLE_GAP_MS);
}

export function startIdleWatch(): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = null;
  if (IDLE_POOL.length === 0) return;
  idleTimer = setTimeout(fireIdle, IDLE_GAP_MS);
}

export function stopIdleWatch(): void {
  if (!idleTimer) return;
  clearTimeout(idleTimer);
  idleTimer = null;
}

function startLoopedSfx(player: Player, volume: number): void {
  try {
    player.loop = true;
    player.volume = volume;
    player.seekTo?.(0);
    player.play();
  } catch {
    // Ignore playback errors.
  }
}

export function startWalkSfx(): void {
  walking = true;
  if (settings.muted || settings.sfxVolume <= 0) return;
  const player = sfxPlayers.step;
  if (player) {
    startLoopedSfx(player, settings.sfxVolume * 0.85);
    return;
  }
  void ensureSfxPlayer('step').then((ready) => {
    if (ready && walking && !settings.muted) startLoopedSfx(ready, settings.sfxVolume * 0.85);
  });
}

function pauseWalkPlayer(): void {
  const player = sfxPlayers.step;
  if (!player) return;
  try {
    player.loop = false;
    player.pause();
    player.seekTo?.(0);
  } catch {
    // Ignore.
  }
}

export function stopWalkSfx(): void {
  walking = false;
  pauseWalkPlayer();
}

export function startDialSfx(): void {
  dialing = true;
  if (settings.muted || settings.sfxVolume <= 0) return;
  const player = sfxPlayers.dial;
  if (player) {
    startLoopedSfx(player, settings.sfxVolume);
    return;
  }
  void ensureSfxPlayer('dial').then((ready) => {
    if (ready && dialing && !settings.muted) startLoopedSfx(ready, settings.sfxVolume);
  });
}

function pauseDialPlayer(): void {
  const player = sfxPlayers.dial;
  if (!player) return;
  try {
    player.loop = false;
    player.pause();
    player.seekTo?.(0);
  } catch {
    // Ignore.
  }
}

export function stopDialSfx(): void {
  dialing = false;
  pauseDialPlayer();
}

export function startPeekSfx(): void {
  peeking = true;
  if (settings.muted || settings.sfxVolume <= 0) return;
  const player = sfxPlayers.peek;
  if (player) {
    startLoopedSfx(player, settings.sfxVolume);
    return;
  }
  void ensureSfxPlayer('peek').then((ready) => {
    if (ready && peeking && !settings.muted) startLoopedSfx(ready, settings.sfxVolume);
  });
}

function pausePeekPlayer(): void {
  const player = sfxPlayers.peek;
  if (!player) return;
  try {
    player.loop = false;
    player.pause();
    player.seekTo?.(0);
  } catch {
    // Ignore.
  }
}

export function stopPeekSfx(): void {
  peeking = false;
  pausePeekPlayer();
}

function resolveBed(worldId?: AudioWorldId, lighting: AudioLighting = 'light'): AmbienceName {
  const candidates = worldId ? selectAmbienceCandidates(worldId, lighting) : [activeBed];
  const next = pickQueued(candidates, lastAmbience);
  lastAmbience = next;
  return next;
}

function playAmbiencePlayer(player: Player, bed: AmbienceName): void {
  try {
    player.loop = true;
    player.volume = ambiencePlaybackVolume(bed, settings.ambienceVolume);
    if (
      (bed === 'garden-ambience' || bed === 'poker-table' || bed.startsWith('local-casino-vip-')) &&
      player.duration &&
      player.duration > 1
    ) {
      player.seekTo?.(Math.random() * player.duration);
    }
    player.play();
  } catch {
    // Ignore.
  }
}

export function startAmbience(worldId?: AudioWorldId, lighting: AudioLighting = 'light'): void {
  if (settings.muted || settings.ambienceVolume <= 0) return;
  const next = resolveBed(worldId, lighting);
  if (activeBed !== next) {
    pauseAllBeds();
    activeBed = next;
  }
  const player = ambiencePlayers[activeBed];
  if (player) {
    playAmbiencePlayer(player, activeBed);
    return;
  }
  const bed = activeBed;
  void ensureAmbiencePlayer(bed).then((ready) => {
    if (ready && activeBed === bed && !settings.muted) playAmbiencePlayer(ready, bed);
  });
}

export function stopAmbience(): void {
  try {
    pauseAllBeds();
  } catch {
    // Ignore.
  }
}

export async function setMuted(muted: boolean): Promise<void> {
  settings = { ...settings, muted };
  await persist();
  if (muted) {
    stopAmbience();
    pauseWalkPlayer();
    pauseDialPlayer();
    pausePeekPlayer();
    return;
  }
  startAmbience();
  if (walking) startWalkSfx();
  if (dialing) startDialSfx();
  if (peeking) startPeekSfx();
}

export function isMuted(): boolean {
  return settings.muted;
}
