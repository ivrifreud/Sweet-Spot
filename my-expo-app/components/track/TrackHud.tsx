import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { isMuted, setMuted } from '../../lib/audio';
import { artStyle } from '../../theme/artStyle';
import { LifeChips } from './LifeChips';

const AVATAR = require('../../assets/brand/artstyle/characters-1930s-canonical-hero.png');
const GOLD_BARS = require('../../assets/brand/artstyle/gold-bars-transparent.png');
const STREAK_FLAME = require('../../assets/brand/artstyle/streak-flame-transparent.png');

type Props = {
  remainingChips: number;
  goldBars: number;
  streakDays: number;
  onPressAvatar?: () => void;
  onPressStreak?: () => void;
  /** When set, a back-to-tree control sits on the left of the bar. */
  onPressBack?: () => void;
};

export function TrackHud({
  remainingChips,
  goldBars,
  streakDays,
  onPressAvatar,
  onPressStreak,
  onPressBack,
}: Props) {
  const { width } = useWindowDimensions();
  /** True phone widths — keep the whole strip on one row. */
  const compact = width < 430;
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const avatar = compact ? 34 : 44;
  const chipSize = compact ? 18 : 26;
  const hit = Platform.select({ ios: 44, android: 48, default: 44 }) ?? 44;
  const [muted, setMutedState] = useState(isMuted());

  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  return (
    <View style={[styles.bar, compact && styles.barCompact]} accessibilityRole="header">
      {onPressBack ? (
        <Pressable
          onPress={onPressBack}
          hitSlop={6}
          style={({ pressed }) => [
            styles.capsule,
            styles.backCapsule,
            compact && styles.capsuleCompact,
            compact && styles.backCapsuleCompact,
            pressed ? styles.pressed : null,
            { minHeight: hit, minWidth: hit },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Back to the tree">
          <BackArrow compact={compact} />
          <Text
            numberOfLines={1}
            style={[styles.backLabel, compact && styles.backLabelCompact, display]}>
            TREE
          </Text>
        </Pressable>
      ) : null}

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
        <Text
          numberOfLines={1}
          style={[styles.capsuleValue, compact && styles.capsuleValueCompact, display]}>
          {goldBars}
        </Text>
      </View>

      <View style={[styles.capsule, compact && styles.capsuleCompact, styles.chipCapsule]}>
        <LifeChips remaining={remainingChips} size={chipSize} />
      </View>

      <View
        style={[
          styles.capsule,
          compact && styles.capsuleCompact,
          styles.streakCapsule,
          compact && styles.streakCapsuleCompact,
        ]}>
        <View style={styles.streakContent} pointerEvents="none">
          <Image
            source={STREAK_FLAME}
            style={compact ? styles.flameArtCompact : styles.flameArt}
            resizeMode="contain"
            accessibilityElementsHidden
          />
          <Text
            numberOfLines={1}
            style={[
              styles.capsuleValue,
              styles.streakValue,
              compact && styles.capsuleValueCompact,
              display,
            ]}>
            {streakDays}
          </Text>
        </View>
        <Pressable
          onPress={onPressStreak}
          disabled={!onPressStreak}
          hitSlop={Math.max(0, (hit - 36) / 2)}
          style={styles.streakButton}
          accessibilityRole={onPressStreak ? 'button' : 'text'}
          accessibilityLabel={
            onPressStreak
              ? `Streak, ${streakDays} days. Open streak details`
              : `Streak, ${streakDays} days`
          }
        />
      </View>

      <Pressable
        onPress={() => {
          const next = !muted;
          setMutedState(next);
          void setMuted(next);
        }}
        hitSlop={Math.max(0, (hit - 36) / 2)}
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

function BackArrow({ compact }: { compact: boolean }) {
  const size = compact ? 16 : 18;
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" accessibilityElementsHidden>
      <Path
        d="M11.5 3.5 5.5 9l6 5.5"
        fill="none"
        stroke={artStyle.colors.projectorBlack}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    width: '100%',
    zIndex: 2,
  },
  barCompact: {
    gap: 4,
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
    minHeight: 34,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1.5,
  },
  chipCapsule: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  streakCapsule: {
    flexGrow: 0,
    flexShrink: 0,
    width: 68,
    height: 40,
    justifyContent: 'center',
  },
  streakCapsuleCompact: {
    width: 52,
    height: 34,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  streakButton: {
    ...StyleSheet.absoluteFillObject,
  },
  muteCapsule: {
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 44,
    justifyContent: 'center',
  },
  backCapsule: {
    flexGrow: 0,
    flexShrink: 0,
    paddingHorizontal: 10,
    gap: 4,
    backgroundColor: artStyle.colors.goldBright,
    borderColor: artStyle.colors.gold,
  },
  backCapsuleCompact: {
    paddingHorizontal: 8,
  },
  backLabel: {
    color: artStyle.colors.projectorBlack,
    fontSize: 16,
    letterSpacing: 1.2,
  },
  backLabelCompact: {
    fontSize: 13,
    letterSpacing: 1,
  },
  capsuleValue: {
    color: artStyle.colors.projectorBlack,
    fontSize: 18,
    letterSpacing: 0.6,
  },
  capsuleValueCompact: {
    fontSize: 14,
  },
  goldArt: {
    width: 32,
    height: 26,
  },
  goldArtCompact: {
    width: 22,
    height: 18,
  },
  flameArt: {
    width: 26,
    height: 26,
  },
  flameArtCompact: {
    width: 18,
    height: 18,
  },
  streakValue: {
    minWidth: 12,
    textAlign: 'center',
  },
});
