import { useCallback, useState } from 'react';

import { getCharacter, pickQuote } from '../characters';
import type { CharacterId, CompanionMoment, CompanionMood } from '../characters/types';

const MOMENT_TO_MOOD: Record<CompanionMoment, CompanionMood> = {
  stage_start: 'encourage',
  between_stages: 'idle',
  success: 'celebrate',
  retry: 'nudge',
  streak: 'celebrate',
};

export function useCompanion(initialId: CharacterId = 'professor') {
  const [characterId, setCharacterId] = useState<CharacterId>(initialId);
  const [moment, setMoment] = useState<CompanionMoment>('between_stages');
  const [quote, setQuote] = useState(() => pickQuote(getCharacter(initialId), 'between_stages'));

  const character = getCharacter(characterId);
  const mood = MOMENT_TO_MOOD[moment];

  const speak = useCallback(
    (nextMoment: CompanionMoment, nextId?: CharacterId) => {
      const id = nextId ?? characterId;
      if (nextId) setCharacterId(nextId);
      setMoment(nextMoment);
      setQuote(pickQuote(getCharacter(id), nextMoment));
    },
    [characterId]
  );

  return {
    character,
    characterId,
    setCharacterId,
    moment,
    mood,
    quote,
    speak,
  };
}
