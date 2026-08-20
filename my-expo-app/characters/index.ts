import { chippy } from './chippy';
import { professorFold } from './professorFold';
import type { CharacterId, CompanionCharacter, CompanionMoment } from './types';

export const characters: Record<CharacterId, CompanionCharacter> = {
  professor: professorFold,
  chippy,
};

export function getCharacter(id: CharacterId): CompanionCharacter {
  return characters[id];
}

export function pickQuote(character: CompanionCharacter, moment: CompanionMoment): string {
  const list = character.quotes[moment];
  return list[Math.floor(Math.random() * list.length)] ?? list[0];
}

export * from './types';
export { professorFold, chippy };
