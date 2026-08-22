import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BennysGardenBackground } from '../components/bennys-garden';
import { type LightingMode } from '../theme/bennysGarden';
import { artStyle } from '../theme/artStyle';

export function BennysGardenPreviewScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<LightingMode>('night');

  return (
    <View style={styles.root}>
      <StatusBar style={mode === 'night' ? 'light' : 'dark'} />
      <BennysGardenBackground mode={mode} />

      <View
        style={[
          styles.controls,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 },
        ]}>
        <Text style={styles.label}>Benny&apos;s Garden</Text>
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
    paddingHorizontal: 16,
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
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggle: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 2,
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
});
