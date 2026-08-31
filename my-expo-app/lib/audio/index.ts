import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  selectAmbience,
  type AmbienceName,
  type AudioLighting,
  type AudioWorldId,
} from './beds';
import {
  CORRECT_POOL,
  GARDEN_NIGHT_POOL,
  IDLE_POOL,
  INCORRECT_POOL,
  pickQueued,
  type GardenNightBed,
  type IdleCue,
} from './cues';

export type {
  AmbienceName,
  AudioLighting,
  AudioWorldId,
} from './beds';
export { selectAmbience, selectJackpotSfx, selectMistakeSfx } from './beds';
export {
  CORRECT_POOL,
  GARDEN_NIGHT_POOL,
  IDLE_POOL,
  INCORRECT_POOL,
  pickQueued,
} from './cues';

export type SfxName =
  | 'deal'
  | 'peek'
  | 'settle'
  | 'fold'
  | 'chipPickup'
  | 'call'
  | 'raise'
  | 'correctClown'
  | 'correctMelody'
  | 'correctScream'
  | 'correctCheer'
  | 'incorrectPiano'
  | 'incorrectFail'
  | 'incorrectTrombone'
  | 'idleSnore'
  | 'idleYawn'
  | 'jackpot'
  | 'jackpotHeavy'
  | 'step'
  | 'arrive'
  | 'clouds'
  | 'uiClick';

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
  ...INCORRECT_POOL,
  ...IDLE_POOL,
]);

let settings: Settings = { ...DEFAULTS };
let loaded = false;
let activeBed: AmbienceName = 'garden-ambience';
let lastNightBed: GardenNightBed | undefined;
let lastCorrect: (typeof CORRECT_POOL)[number] | undefined;
let lastIncorrect: (typeof INCORRECT_POOL)[number] | undefined;
let lastIdle: IdleCue | undefined;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let walking = false;
const lastPlayed: Partial<Record<SfxName | AmbienceName, number>> = {};

const sfxSources: Record<SfxName, number> = {
  deal: require('../../assets/audio/deal.wav'),
  peek: require('../../assets/audio/peek.wav'),
  settle: require('../../assets/audio/settle.wav'),
  fold: require('../../assets/audio/fold.wav'),
  chipPickup: require('../../assets/audio/chip-pickup.wav'),
  call: require('../../assets/audio/call.wav'),
  raise: require('../../assets/audio/raise.wav'),
  correctClown: require('../../assets/audio/correct-clown.wav'),
  correctMelody: require('../../assets/audio/correct-melody.wav'),
  correctScream: require('../../assets/audio/correct-scream.wav'),
  correctCheer: require('../../assets/audio/correct-cheer.wav'),
  incorrectPiano: require('../../assets/audio/incorrect-piano.wav'),
  incorrectFail: require('../../assets/audio/incorrect-fail.wav'),
  incorrectTrombone: require('../../assets/audio/incorrect-trombone.wav'),
  idleSnore: require('../../assets/audio/idle-snore.wav'),
  idleYawn: require('../../assets/audio/idle-yawn.wav'),
  jackpot: require('../../assets/audio/jackpot.wav'),
  jackpotHeavy: require('../../assets/audio/jackpot-heavy.wav'),
  step: require('../../assets/audio/step.wav'),
  arrive: require('../../assets/audio/arrive.wav'),
  clouds: require('../../assets/audio/clouds.wav'),
  uiClick: require('../../assets/audio/ui-click.wav'),
};

/** World 1 beds only. Metro resolves every `require` at bundle time; later-world WAVs stay on disk until those skins ship. */
const ambienceSources: Partial<Record<AmbienceName, number>> = {
  'garden-ambience': require('../../assets/audio/garden-ambience.wav'),
  'garden-night-ambience': require('../../assets/audio/garden-night-ambience.wav'),
  'garden-night-forest': require('../../assets/audio/garden-night-forest.wav'),
};

type Player = {
  play: () => void;
  pause: () => void;
  seekTo?: (value: number) => void;
  loop?: boolean;
  volume?: number;
};

const sfxPlayers: Partial<Record<SfxName, Player>> = {};
const ambiencePlayers: Partial<Record<AmbienceName, Player>> = {};

async function ensureNative(): Promise<typeof import('expo-audio') | null> {
  try {
    return await import('expo-audio');
  } catch {
    return null;
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
  try {
    await audio.setAudioModeAsync({
      playsInSilentMode: false,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
  } catch {
    // Keep gameplay running if the session cannot be configured.
  }
  for (const [name, source] of Object.entries(sfxSources) as [SfxName, number][]) {
    try {
      sfxPlayers[name] = audio.createAudioPlayer(source) as Player;
    } catch {
      // Missing native player is a silent fallback.
    }
  }
  for (const [name, source] of Object.entries(ambienceSources) as [AmbienceName, number][]) {
    try {
      const player = audio.createAudioPlayer(source) as Player;
      player.loop = true;
      ambiencePlayers[name] = player;
    } catch {
      // Missing native player is a silent fallback.
    }
  }
  return next;
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

export function playSfx(name: SfxName): void {
  if (settings.muted || settings.sfxVolume <= 0) return;
  if (!guarded(name, name === 'fold' ? 400 : 80)) return;
  const player = sfxPlayers[name];
  if (!player) return;
  try {
    player.loop = false;
    player.volume = settings.sfxVolume;
    player.seekTo?.(0);
    player.play();
    const ambience = ambiencePlayers[activeBed];
    if (ambience && !DRY_SFX.has(name) && name !== 'step') {
      ambience.volume = settings.ambienceVolume * 0.32;
      setTimeout(() => {
        if (ambiencePlayers[activeBed] && !settings.muted) {
          ambiencePlayers[activeBed]!.volume = settings.ambienceVolume;
        }
      }, 220);
    }
  } catch {
    // Ignore playback errors.
  }
}

export function playDecisionSfx(outcome: 'correct' | 'incorrect'): void {
  if (outcome === 'correct') {
    const cue = pickQueued(CORRECT_POOL, lastCorrect);
    lastCorrect = cue;
    playSfx(cue);
    return;
  }
  const cue = pickQueued(INCORRECT_POOL, lastIncorrect);
  lastIncorrect = cue;
  playSfx(cue);
}

export function playIdleSfx(): void {
  const cue = pickQueued(IDLE_POOL, lastIdle);
  lastIdle = cue;
  playSfx(cue);
}

function fireIdle(): void {
  playIdleSfx();
  idleTimer = setTimeout(fireIdle, IDLE_GAP_MS);
}

export function noteActivity(): void {
  if (!idleTimer) return;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(fireIdle, IDLE_GAP_MS);
}

export function startIdleWatch(): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(fireIdle, IDLE_GAP_MS);
}

export function stopIdleWatch(): void {
  if (!idleTimer) return;
  clearTimeout(idleTimer);
  idleTimer = null;
}

export function startWalkSfx(): void {
  walking = true;
  if (settings.muted || settings.sfxVolume <= 0) return;
  const player = sfxPlayers.step;
  if (!player) return;
  try {
    player.loop = true;
    player.volume = settings.sfxVolume * 0.85;
    player.seekTo?.(0);
    player.play();
  } catch {
    // Ignore playback errors.
  }
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

function resolveBed(worldId?: AudioWorldId, lighting: AudioLighting = 'light'): AmbienceName {
  const next = worldId ? selectAmbience(worldId, lighting) : activeBed;
  if (next !== 'garden-night-ambience' && next !== 'garden-night-forest') {
    return next;
  }
  const bed = pickQueued(GARDEN_NIGHT_POOL, lastNightBed);
  lastNightBed = bed;
  return bed;
}

export function startAmbience(worldId?: AudioWorldId, lighting: AudioLighting = 'light'): void {
  if (settings.muted || settings.ambienceVolume <= 0) return;
  const next = resolveBed(worldId, lighting);
  if (activeBed !== next) {
    pauseAllBeds();
    activeBed = next;
  }
  const player = ambiencePlayers[activeBed];
  if (!player) return;
  try {
    player.loop = true;
    player.volume = settings.ambienceVolume;
    player.play();
  } catch {
    // Ignore.
  }
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
    return;
  }
  startAmbience();
  if (walking) startWalkSfx();
}

export function isMuted(): boolean {
  return settings.muted;
}
