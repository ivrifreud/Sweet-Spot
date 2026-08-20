import { useMemo, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import {
  characters,
  pickQuote,
  type CharacterId,
  type CompanionMoment,
  type CompanionMood,
} from '../../characters';
import { ChippyAvatar } from './ChippyAvatar';
import { CompanionBubble } from './CompanionBubble';
import { ProfessorFoldAvatar } from './ProfessorFoldAvatar';

const MOMENTS: { id: CompanionMoment; label: string; mood: CompanionMood }[] = [
  { id: 'stage_start', label: 'תחילת שלב', mood: 'encourage' },
  { id: 'between_stages', label: 'בין שלבים', mood: 'idle' },
  { id: 'success', label: 'הצלחה', mood: 'celebrate' },
  { id: 'retry', label: 'ניסיון נוסף', mood: 'nudge' },
  { id: 'streak', label: 'רצף', mood: 'celebrate' },
];

function TapButton({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      // RN Web sometimes needs an explicit cursor + hitSlop for reliable clicks
      style={({ pressed }) => [
        style,
        Platform.OS === 'web' ? { cursor: 'pointer' as const } : null,
        pressed ? { opacity: 0.85 } : null,
      ]}>
      {children}
    </Pressable>
  );
}

export function CharacterCompanionPreview() {
  const [selectedId, setSelectedId] = useState<CharacterId>('professor');
  const [moment, setMoment] = useState<CompanionMoment>('between_stages');
  const [quoteSeed, setQuoteSeed] = useState(0);

  const character = characters[selectedId];
  const activeMoment = MOMENTS.find((m) => m.id === moment) ?? MOMENTS[1];

  const quote = useMemo(() => {
    void quoteSeed;
    return pickQuote(character, moment);
  }, [character, moment, quoteSeed]);

  return (
    <View className="flex-1" style={{ backgroundColor: character.palette.soft }}>
      <View className="px-5 pb-3 pt-14">
        <Text className="text-right text-3xl font-bold" style={{ color: character.palette.ink }}>
          המלווים שלך
        </Text>
        <Text className="mt-1 text-right text-base" style={{ color: character.palette.primary }}>
          בחר דמות ותראה איך היא מעודדת בין שלבים
        </Text>
      </View>

      <View className="mx-4 mb-4 flex-row gap-3">
        {(['professor', 'chippy'] as CharacterId[]).map((id) => {
          const c = characters[id];
          const active = id === selectedId;
          return (
            <TapButton
              key={id}
              onPress={() => setSelectedId(id)}
              style={{
                flex: 1,
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: active ? c.palette.primary : '#FFFFFF',
                borderWidth: 2,
                borderColor: c.palette.primary,
              }}>
              <Text
                className="text-center text-base font-bold"
                style={{ color: active ? '#FFFFFF' : c.palette.primary }}>
                {c.nameHe}
              </Text>
            </TapButton>
          );
        })}
      </View>

      <View className="items-center py-2" pointerEvents="none">
        {selectedId === 'professor' ? (
          <ProfessorFoldAvatar size={200} mood={activeMoment.mood} />
        ) : (
          <ChippyAvatar size={200} mood={activeMoment.mood} />
        )}
      </View>

      <CompanionBubble character={character} quote={quote} />

      <Text
        className="mx-5 mt-4 text-right text-sm"
        style={{ color: character.palette.ink, opacity: 0.75 }}>
        {character.taglineHe}
      </Text>

      <View className="mt-5 flex-row flex-wrap justify-end gap-2 px-4">
        {MOMENTS.map((m) => {
          const active = m.id === moment;
          return (
            <TapButton
              key={m.id}
              onPress={() => {
                setMoment(m.id);
                setQuoteSeed((s) => s + 1);
              }}
              style={{
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: active ? character.palette.accent : '#FFFFFF',
                borderWidth: 1.5,
                borderColor: character.palette.primary,
              }}>
              <Text
                className="text-sm font-semibold"
                style={{ color: active ? '#FFFFFF' : character.palette.primary }}>
                {m.label}
              </Text>
            </TapButton>
          );
        })}
      </View>

      <TapButton
        onPress={() => setQuoteSeed((s) => s + 1)}
        style={{
          marginHorizontal: 16,
          marginTop: 24,
          borderRadius: 16,
          paddingVertical: 12,
          backgroundColor: character.palette.primary,
        }}>
        <Text className="text-center text-base font-bold text-white">משפט עידוד חדש</Text>
      </TapButton>
    </View>
  );
}
