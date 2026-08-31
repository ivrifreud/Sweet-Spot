import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { isMuted, setMuted } from '../../lib/audio';
import { artStyle } from '../../theme/artStyle';
import { LifeChips } from './LifeChips';

const AVATAR = require('../../assets/brand/artstyle/characters-1930s-canonical-hero.png');
const GOLD_BARS = require('../../assets/brand/artstyle/gold-bars-hud.png');
const STREAK_FLAME = require('../../assets/brand/artstyle/streak-flame-hud.png');

type Props = {
  remainingChips: number;
  goldBars: number;
  streakDays: number;
  onPressAvatar?: () => void;
};

export function TrackHud({ remainingChips, goldBars, streakDays, onPressAvatar }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 420;
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const avatar = compact ? 40 : 44;
  const chipSize = compact ? 22 : 26;
  const hit = Platform.select({ ios: 44, android: 48, default: 44 }) ?? 44;
  const [muted, setMutedState] = useState(isMuted());

  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  return (
    <View style={styles.bar} accessibilityRole="header">
      <Pressable
        onPress={onPressAvatar}
        disabled={!onPressAvatar}
        hitSlop={Math.max(0, (hit - avatar) / 2 + 6)}
        style={({ pressed }) => [
          styles.avatarFrame,
          { width: avatar, height: avatar, minWidth: avatar, minHeight: avatar },
          pressed && onPressAvatar ? styles.pressed : null,
        ]}
        accessibilityRole={onPressAvatar ? 'button' : 'image'}
        accessibilityLabel="Your profile">
        <Image source={AVATAR} style={styles.avatar} resizeMode="cover" />
      </Pressable>

      <View
        style={[styles.capsule, compact && styles.capsuleCompact]}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`Gold bars, ${goldBars}`}>
        <Image
          source={GOLD_BARS}
          style={compact ? styles.goldArtCompact : styles.goldArt}
          resizeMode="contain"
          accessibilityElementsHidden
        />
        <Text numberOfLines={1} style={[styles.capsuleValue, compact && styles.capsuleValueCompact, display]}>
          {goldBars}
        </Text>
      </View>

      <View style={[styles.capsule, compact && styles.capsuleCompact, styles.chipCapsule]}>
        <LifeChips remaining={remainingChips} size={chipSize} />
      </View>

      <View
        style={[styles.capsule, compact && styles.capsuleCompact]}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`Streak, ${streakDays} days`}>
        <Image
          source={STREAK_FLAME}
          style={compact ? styles.flameArtCompact : styles.flameArt}
          resizeMode="contain"
          accessibilityElementsHidden
        />
        <Text numberOfLines={1} style={[styles.capsuleValue, compact && styles.capsuleValueCompact, display]}>
          {streakDays}
        </Text>
      </View>

      <Pressable
        onPress={() => {
          const next = !muted;
          setMutedState(next);
          void setMuted(next);
        }}
        hitSlop={Math.max(0, (hit - 40) / 2)}
        style={({ pressed }) => [
          styles.capsule,
          compact && styles.capsuleCompact,
          styles.muteCapsule,
          pressed ? styles.pressed : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={muted ? 'Unmute sound' : 'Mute sound'}>
        <Text style={[styles.capsuleValue, compact && styles.capsuleValueCompact, display]}>
          {muted ? 'MUTE' : 'SFX'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  avatarFrame: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: artStyle.colors.gold,
    backgroundColor: artStyle.colors.tobacco,
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.96 }],
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: artStyle.colors.gold,
    backgroundColor: artStyle.colors.cream,
    gap: 4,
    flexShrink: 1,
  },
  capsuleCompact: {
    minHeight: 36,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipCapsule: {
    flexGrow: 0,
    flexShrink: 1,
  },
  muteCapsule: {
    flexGrow: 0,
    minWidth: 44,
    justifyContent: 'center',
  },
  capsuleValue: {
    color: artStyle.colors.projectorBlack,
    fontSize: 18,
    letterSpacing: 0.6,
  },
  capsuleValueCompact: {
    fontSize: 16,
  },
  goldArt: {
    width: 32,
    height: 26,
  },
  goldArtCompact: {
    width: 26,
    height: 22,
  },
  flameArt: {
    width: 26,
    height: 26,
    borderRadius: 7,
  },
  flameArtCompact: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
});
