export type AudioWorldId = 'bennys-garden' | 'local-casino' | 'vip-room';
export type AudioLighting = 'light' | 'night';

export type AmbienceName =
  | 'garden-ambience'
  | 'garden-night-ambience'
  | 'garden-night-forest'
  | 'casino-day-ambience'
  | 'casino-night-ambience'
  | 'vip-day-ambience'
  | 'vip-night-ambience';

export type MistakeSfx = 'incorrect' | 'incorrectBass';
export type JackpotSfx = 'jackpot' | 'jackpotHeavy';

const BEDS: Record<AudioWorldId, Record<AudioLighting, AmbienceName>> = {
  'bennys-garden': {
    light: 'garden-ambience',
    night: 'garden-night-ambience',
  },
  'local-casino': {
    light: 'casino-day-ambience',
    night: 'casino-night-ambience',
  },
  'vip-room': {
    light: 'vip-day-ambience',
    night: 'vip-night-ambience',
  },
};

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
  if (worldId === 'vip-room' && lighting === 'night') return 'incorrectBass';
  return 'incorrect';
}

export function selectJackpotSfx(
  worldId: AudioWorldId = 'bennys-garden',
  lighting: AudioLighting = 'light'
): JackpotSfx {
  if (lighting === 'night' && worldId !== 'bennys-garden') return 'jackpotHeavy';
  return 'jackpot';
}
