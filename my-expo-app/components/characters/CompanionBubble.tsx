import { Text, View } from 'react-native';

import type { CompanionCharacter } from '../../characters/types';

interface Props {
  character: CompanionCharacter;
  quote: string;
}

export function CompanionBubble({ character, quote }: Props) {
  return (
    <View
      className="mx-4 rounded-3xl px-5 py-4"
      style={{
        backgroundColor: character.palette.soft,
        borderColor: character.palette.primary,
        borderWidth: 2,
      }}>
      <Text
        className="mb-2 text-right text-sm font-bold"
        style={{ color: character.palette.primary }}>
        {character.nameHe}
      </Text>
      <Text
        className="text-right text-base leading-6"
        style={{ color: character.palette.ink, writingDirection: 'rtl' }}>
        {quote}
      </Text>
    </View>
  );
}
