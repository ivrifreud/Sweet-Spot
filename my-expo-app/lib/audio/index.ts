import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  selectAmbience,
  selectJackpotSfx,
  selectMistakeSfx,
  type AmbienceName,
  type AudioLighting,
  type AudioWorldId,
} from './beds';

export type {
  AmbienceName,
  AudioLighting,
  AudioWorldId,
} from './beds';
export { selectAmbience, selectJackpotSfx, selectMistakeSfx } from './beds';

export type SfxName =
  | 'deal'
  | 'peek'
  | 'settle'
  | 'fold'
  | 'chipPickup'
  | 'call'
  | 'raise'
  | 'correct'
  | 'incorrect'
  | 'incorrectBass'
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

let settings: Settings = { ...DEFAULTS };
let loaded = false;
let activeBed: AmbienceName = 'garden-ambience';
const lastPlayed: Partial<Record<SfxName | AmbienceName, number>> = {};

const sfxSources: Record<SfxName, number> = {
  deal: require('../../assets/audio/deal.wav'),
  peek: require('../../assets/audio/peek.wav'),
  settle: require('../../assets/audio/settle.wav'),
  fold: require('../../assets/audio/fold.wav'),
  chipPickup: require('../../assets/audio/chip-pickup.wav'),
  call: require('../../assets/audio/call.wav'),
  raise: require('../../assets/audio/raise.wav'),
  correct: require('../../assets/audio/correct.wav'),
  incorrect: require('../../assets/audio/incorrect.wav'),
  incorrectBass: require('../../assets/audio/incorrect-bass.wav'),
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

export function playSfx(name: SfxName): void {
  if (settings.muted || settings.sfxVolume <= 0) return;
  if (!guarded(name)) return;
  const player = sfxPlayers[name];
  if (!player) return;
  try {
    player.volume = settings.sfxVolume;
    player.seekTo?.(0);
    player.play();
    const ambience = ambiencePlayers[activeBed];
    if (ambience && name !== 'correct' && name !== 'incorrect' && name !== 'incorrectBass') {
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

export function playDecisionSfx(
  outcome: 'correct' | 'incorrect',
  options?: {
    jackpot?: boolean;
    worldId?: AudioWorldId;
    lighting?: AudioLighting;
  }
): void {
  const worldId = options?.worldId ?? 'bennys-garden';
  const lighting = options?.lighting ?? 'light';
  if (outcome === 'correct') {
    playSfx('correct');
    if (options?.jackpot) {
      playSfx(selectJackpotSfx(worldId, lighting));
    }
    return;
  }
  playSfx(selectMistakeSfx(worldId, lighting));
}

export function startAmbience(worldId?: AudioWorldId, lighting: AudioLighting = 'light'): void {
  if (settings.muted || settings.ambienceVolume <= 0) return;
  const next = worldId ? selectAmbience(worldId, lighting) : activeBed;
  if (activeBed !== next) {
    try {
      ambiencePlayers[activeBed]?.pause();
    } catch {
      // Ignore.
    }
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
    Object.values(ambiencePlayers).forEach((player) => player?.pause());
  } catch {
    // Ignore.
  }
}

export async function setMuted(muted: boolean): Promise<void> {
  settings = { ...settings, muted };
  await persist();
  if (muted) stopAmbience();
  else startAmbience();
}

export function isMuted(): boolean {
  return settings.muted;
}
