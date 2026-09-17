export type AudioWorldId = 'bennys-garden' | 'local-casino' | 'vip-room';
export type AudioLighting = 'light' | 'night';

export type AmbienceName =
  | 'garden-ambience'
  | 'garden-night-ambience'
  | 'garden-night-forest'
  | 'poker-table'
  | 'local-casino-vip-1'
  | 'local-casino-vip-2'
  | 'casino-day-ambience'
  | 'casino-night-ambience'
  | 'vip-day-ambience'
  | 'vip-night-ambience';

export type MistakeSfx = 'incorrect';
export type JackpotSfx = 'jackpot' | 'jackpotHeavy';

const BEDS: Record<AudioWorldId, Record<AudioLighting, AmbienceName>> = {
  'bennys-garden': {
    light: 'garden-ambience',
    night: 'poker-table',
  },
  'local-casino': {
    light: 'local-casino-vip-1',
    night: 'local-casino-vip-1',
  },
  'vip-room': {
    light: 'vip-day-ambience',
    night: 'vip-night-ambience',
  },
};

const LOCAL_CASINO_BEDS = ['local-casino-vip-1', 'local-casino-vip-2'] as const;

export function selectAmbienceCandidates(
  worldId: AudioWorldId = 'bennys-garden',
  lighting: AudioLighting = 'light'
): readonly AmbienceName[] {
  if (worldId === 'local-casino') return LOCAL_CASINO_BEDS;
  return [BEDS[worldId][lighting]];
}

export function selectAmbience(
  worldId: AudioWorldId = 'bennys-garden',
  lighting: AudioLighting = 'light'
): AmbienceName {
  return BEDS[worldId][lighting];
}

/** World 3 dark is the only MVP mistake sting that leaves the warm thunk. */
export function selectMistakeSfx(
  worldId: AudioWorldId = 'bennys-garden',
  lighting: AudioLighting = 'light'
): MistakeSfx {
  void worldId;
  void lighting;
  return 'incorrect';
}

export function selectJackpotSfx(
  worldId: AudioWorldId = 'bennys-garden',
  lighting: AudioLighting = 'light'
): JackpotSfx {
  if (lighting === 'night' && worldId !== 'bennys-garden') return 'jackpotHeavy';
  return 'jackpot';
}

/** Poker-table ingest is hotter than garden birds — keep it under the table talk. */
export function ambienceBedGain(name: AmbienceName): number {
  return name === 'poker-table' ? 0.4 : 1;
}

export function ambiencePlaybackVolume(name: AmbienceName, ambienceVolume: number): number {
  return ambienceVolume * ambienceBedGain(name);
}
