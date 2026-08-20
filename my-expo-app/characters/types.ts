export type CharacterId = 'professor' | 'chippy';

export type CompanionMood =
  | 'idle'
  | 'encourage'
  | 'celebrate'
  | 'think'
  | 'nudge';

export type CompanionMoment =
  | 'stage_start'
  | 'between_stages'
  | 'success'
  | 'retry'
  | 'streak';

export interface CharacterPalette {
  primary: string;
  secondary: string;
  accent: string;
  soft: string;
  ink: string;
}

export interface CompanionCharacter {
  id: CharacterId;
  nameHe: string;
  nameEn: string;
  taglineHe: string;
  personalityHe: string;
  palette: CharacterPalette;
  quotes: Record<CompanionMoment, string[]>;
}
