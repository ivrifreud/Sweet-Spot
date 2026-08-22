import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BennysGardenBackground } from '../components/bennys-garden';
import { BENNYS_GARDEN_VARIANTS, type LightingMode } from '../theme/bennysGarden';
import { artStyle } from '../theme/artStyle';

export function BennysGardenPreviewScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<LightingMode>('night');
  const [activeIndex, setActiveIndex] = useState(0);

  const activeVariant = BENNYS_GARDEN_VARIANTS[activeIndex];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Benny&apos;s Garden</Text>
        <Text style={styles.subtitle}>World 1 background theme — pick a layout</Text>

        <View style={styles.modeToggle}>
          {(['night', 'light'] as LightingMode[]).map((option) => {
            const selected = mode === option;
            return (
              <Pressable
                key={option}
                onPress={() => setMode(option)}
                style={[styles.modeButton, selected && styles.modeButtonActive]}>
                <Text style={[styles.modeLabel, selected && styles.modeLabelActive]}>
                  {option === 'night' ? 'Night Mode' : 'Light Mode'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.previewFrame}>
        <BennysGardenBackground variantId={activeVariant.id} mode={mode} />
        <View style={styles.previewBadge} pointerEvents="none">
          <Text style={styles.previewBadgeText}>{activeVariant.name}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.variantRow, { paddingBottom: insets.bottom + 12 }]}>
        {BENNYS_GARDEN_VARIANTS.map((variant, index) => {
          const selected = index === activeIndex;
          return (
            <Pressable
              key={variant.id}
              onPress={() => setActiveIndex(index)}
              style={[styles.variantCard, selected && styles.variantCardActive]}>
              <Text style={styles.variantNumber}>Example {index + 1}</Text>
              <Text style={styles.variantName}>{variant.name}</Text>
              <Text style={styles.variantDescription}>{variant.description}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const { colors } = artStyle;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.projectorBlack,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  title: {
    color: colors.goldBright,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: colors.cream,
    fontSize: 14,
    opacity: 0.85,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  modeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.tealFaded,
    backgroundColor: 'rgba(11, 95, 93, 0.35)',
  },
  modeButtonActive: {
    borderColor: colors.goldBright,
    backgroundColor: colors.teal,
  },
  modeLabel: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '600',
  },
  modeLabelActive: {
    color: colors.goldBright,
  },
  previewFrame: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.tobacco,
  },
  previewBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(17, 23, 20, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  previewBadgeText: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '700',
  },
  variantRow: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 10,
  },
  variantCard: {
    width: 260,
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.tealFaded,
    backgroundColor: 'rgba(11, 95, 93, 0.25)',
  },
  variantCardActive: {
    borderColor: colors.goldBright,
    backgroundColor: 'rgba(11, 95, 93, 0.55)',
  },
  variantNumber: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  variantName: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  variantDescription: {
    color: colors.cream,
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.85,
  },
});
