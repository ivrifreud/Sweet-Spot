import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  PokerQuestionScene,
  QUESTION_TEMPLATE_PREVIEWS,
  type QuestionTemplateId,
} from '../components/poker';
import { type LightingMode } from '../theme/bennysGarden';
import { artStyle } from '../theme/artStyle';

export function BennysGardenPreviewScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<LightingMode>('night');
  const [templateId, setTemplateId] = useState<QuestionTemplateId>(3);
  const [chipAdjustment, setChipAdjustment] = useState(0);

  const preview = QUESTION_TEMPLATE_PREVIEWS.find((item) => item.id === templateId)!;
  const table = useMemo(
    () => ({
      ...preview.table,
      chipCount: Math.max(0, preview.table.chipCount + chipAdjustment),
    }),
    [chipAdjustment, preview]
  );

  const selectTemplate = (id: QuestionTemplateId) => {
    setTemplateId(id);
    setChipAdjustment(0);
  };

  return (
    <View style={styles.root}>
      <StatusBar style={mode === 'night' ? 'light' : 'dark'} />
      <PokerQuestionScene lightingMode={mode} templateId={templateId} table={table} />

      <View style={[styles.controls, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.label}>Benny&apos;s Garden</Text>
            <Text style={styles.templateName}>{preview.name}</Text>
          </View>
          <View style={styles.toggleRow}>
            {(['night', 'light'] as LightingMode[]).map((option) => {
              const active = mode === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setMode(option)}
                  style={[styles.toggle, active && styles.toggleActive]}>
                  <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                    {option === 'night' ? 'Night' : 'Light'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templateRow}>
          {QUESTION_TEMPLATE_PREVIEWS.map((item) => {
            const active = item.id === templateId;
            return (
              <Pressable
                key={item.id}
                onPress={() => selectTemplate(item.id)}
                style={[styles.templateButton, active && styles.templateButtonActive]}>
                <Text style={[styles.templateButtonText, active && styles.toggleTextActive]}>
                  {item.id}. {item.shortName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.chipControls, { top: insets.top + 72 }]}>
        <Pressable
          accessibilityLabel="Remove ten chips"
          onPress={() => setChipAdjustment((value) => value - 10)}
          style={styles.chipButton}>
          <Text style={styles.chipButtonText}>−10</Text>
        </Pressable>
        <Text style={styles.chipLabel}>Your stack: {table.chipCount}</Text>
        <Pressable
          accessibilityLabel="Add ten chips"
          onPress={() => setChipAdjustment((value) => value + 10)}
          style={styles.chipButton}>
          <Text style={styles.chipButtonText}>+10</Text>
        </Pressable>
      </View>
    </View>
  );
}

const { colors } = artStyle;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.projectorBlack,
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.cream,
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  templateName: {
    color: colors.goldBright,
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  toggle: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.tealFaded,
    backgroundColor: 'rgba(17, 23, 20, 0.65)',
  },
  toggleActive: {
    borderColor: colors.goldBright,
    backgroundColor: colors.teal,
  },
  toggleText: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.goldBright,
  },
  templateRow: {
    paddingTop: 8,
    paddingRight: 12,
    gap: 6,
  },
  templateButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.tealFaded,
    backgroundColor: 'rgba(17, 23, 20, 0.72)',
  },
  templateButtonActive: {
    borderColor: colors.goldBright,
    backgroundColor: colors.teal,
  },
  templateButtonText: {
    color: colors.cream,
    fontSize: 11,
    fontWeight: '700',
  },
  chipControls: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(17, 23, 20, 0.82)',
  },
  chipButton: {
    minWidth: 42,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  chipButtonText: {
    color: colors.goldBright,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  chipLabel: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '700',
  },
});
