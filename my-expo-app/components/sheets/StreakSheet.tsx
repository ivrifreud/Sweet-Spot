import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { Image, StyleSheet, Text, View } from 'react-native';

import { artStyle } from '../../theme/artStyle';
import { ParchmentSheet } from './ParchmentSheet';

const STREAK_FLAME = require('../../assets/brand/hud/streak-flame-badge.png');

type Props = {
  visible: boolean;
  currentStreak: number;
  bestStreak: number;
  onClose: () => void;
};

export function StreakSheet({ visible, currentStreak, bestStreak, onClose }: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;

  return (
    <ParchmentSheet visible={visible} title="FIRE STREAK" onClose={onClose}>
      <View style={styles.hero}>
        <Image source={STREAK_FLAME} style={styles.icon} resizeMode="cover" />
      </View>
      <Text style={styles.copy}>Play at least one stage hand each day to keep the fire alive.</Text>
      <View style={styles.statRow}>
        <Text style={styles.label}>Current</Text>
        <Text style={[styles.value, display]}>{currentStreak} days</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Best</Text>
        <Text style={[styles.value, display]}>{bestStreak} days</Text>
      </View>
    </ParchmentSheet>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  copy: {
    color: 'rgba(23,23,19,0.82)',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: artStyle.colors.tobacco,
    backgroundColor: 'rgba(232,215,167,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    color: 'rgba(23,23,19,0.72)',
    fontSize: 14,
  },
  value: {
    color: artStyle.colors.projectorBlack,
    fontSize: 22,
    letterSpacing: 1,
  },
});
