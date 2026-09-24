import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { ProfileStats } from '../../lib/hud/profileStats';
import { artStyle } from '../../theme/artStyle';
import { ParchmentSheet } from './ParchmentSheet';

const AVATAR = require('../../assets/brand/artstyle/characters-1930s-canonical-hero.png');

type Props = {
  visible: boolean;
  stats: ProfileStats;
  onClose: () => void;
};

export function ProfileSheet({ visible, stats, onClose }: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;

  return (
    <ParchmentSheet visible={visible} title="PLAYER CARD" onClose={onClose}>
      <View style={styles.hero}>
        <View style={styles.bustFrame}>
          <Image source={AVATAR} style={styles.bust} resizeMode="cover" />
        </View>
        <Text style={[styles.name, display]}>{stats.displayName}</Text>
        <Text style={styles.meta}>
          {stats.levelLabel} · {stats.worldLabel}
        </Text>
      </View>
      <Stat label="Stages completed" value={String(stats.stagesCompleted)} display={display} />
      <Stat label="Lessons completed" value={String(stats.lessonsCompleted)} display={display} />
      <Stat label="Current streak" value={`${stats.streakDays} days`} display={display} />
      <Stat label="Best streak" value={`${stats.streakBestDays} days`} display={display} />
    </ParchmentSheet>
  );
}

function Stat({
  label,
  value,
  display,
}: {
  label: string;
  value: string;
  display: { fontFamily: string } | null;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, display]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bustFrame: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: artStyle.colors.gold,
    backgroundColor: artStyle.colors.tobacco,
  },
  bust: {
    width: '100%',
    height: '100%',
  },
  name: {
    color: artStyle.colors.projectorBlack,
    fontSize: 26,
    letterSpacing: 1.2,
  },
  meta: {
    color: 'rgba(23,23,19,0.72)',
    fontSize: 14,
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
    fontSize: 20,
    letterSpacing: 0.8,
  },
});
