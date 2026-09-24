import type { ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEffect } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HUD_CROPS } from '../../lib/hud/medallion';
import { railRegenTicket, shouldRattleEmptyChips } from '../../lib/hud/railState';
import { artStyle } from '../../theme/artStyle';
import { LifeChips } from '../track/LifeChips';
import { HudMedallion } from './HudMedallion';

const AVATAR = require('../../assets/brand/artstyle/characters-1930s-canonical-hero.png');
const GOLD_BARS = require('../../assets/brand/hud/gold-bars-icon.jpg');
const STREAK_FLAME = require('../../assets/brand/hud/streak-flame-badge.png');
const SETTINGS_GEARS = require('../../assets/brand/hud/settings-gears-icon.jpg');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const HIT = Platform.select({ ios: 44, android: 48, default: 44 }) ?? 44;

export type MarqueeRailSheet = 'profile' | 'chips' | 'gold' | 'streak' | 'settings';

type Props = {
  remainingChips: number;
  goldCoins: number;
  streakDays: number;
  regenAt?: string | null;
  now?: Date;
  onOpenSheet: (sheet: MarqueeRailSheet) => void;
};

async function lightTap() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics unavailable on web / some devices.
  }
}

function pressPlaceholderBuy() {
  // Gold Coin purchase ships with Daily Challenge / IAP — UI affordance only.
}

/** Cream digit with a thin ink keyline; outline copies sit behind the face, not the badge corner. */
function InkedNumber({
  children,
  size,
  display,
}: {
  children: string | number;
  size: number;
  display: { fontFamily: string } | null;
}) {
  const base = [styles.inkedDigit, display, { fontSize: size, lineHeight: size * 1.05 }];
  const offsets = [
    [-1.2, 0],
    [1.2, 0],
    [0, -1.2],
    [0, 1.2],
    [-0.9, -0.9],
    [0.9, -0.9],
    [-0.9, 0.9],
    [0.9, 0.9],
  ] as const;

  return (
    <View style={styles.inkedBox}>
      {offsets.map(([dx, dy], index) => (
        <Text
          key={index}
          numberOfLines={1}
          style={[base, styles.inkedOutline, { left: dx, top: dy }]}
          accessibilityElementsHidden
          importantForAccessibility="no">
          {children}
        </Text>
      ))}
      <Text numberOfLines={1} style={[base, styles.inkedFace]}>
        {children}
      </Text>
    </View>
  );
}

function PressSlot({
  label,
  onPress,
  children,
  style,
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
  style?: object;
}) {
  const press = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        void lightTap();
        onPress();
      }}
      onPressIn={() => {
        press.value = withTiming(0.94, { duration: 90 });
      }}
      onPressOut={() => {
        press.value = withSequence(
          withTiming(1.05, { duration: 80 }),
          withSpring(1, { damping: 14, stiffness: 220 })
        );
      }}
      style={[styles.slot, style, animated]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={Math.max(6, Math.ceil((HIT - 36) / 2))}>
      {children}
    </AnimatedPressable>
  );
}

function RegenTicket({ label }: { label: string }) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  return (
    <View style={styles.ticket} accessibilityRole="text" accessibilityLabel={label}>
      <Text style={[styles.ticketText, display]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function RattlingChips({ remaining, size }: { remaining: number; size: number }) {
  const reducedMotion = useReducedMotion();
  const shake = useSharedValue(0);
  const shouldRattle = shouldRattleEmptyChips(remaining);

  useEffect(() => {
    cancelAnimation(shake);
    if (!shouldRattle || reducedMotion) {
      shake.value = 0;
      return;
    }
    shake.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 70 }),
        withTiming(-1, { duration: 70 }),
        withTiming(0, { duration: 70 }),
        withTiming(0, { duration: 900 })
      ),
      -1,
      false
    );
  }, [reducedMotion, shake, shouldRattle]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value * 2.2 }],
  }));

  return (
    <Animated.View style={style}>
      <LifeChips remaining={remaining} size={size} />
    </Animated.View>
  );
}

/**
 * Fully clear HUD over the map.
 * Gold: gold-rimmed medallion + ceramic amount pill + round Felt Green plus (purchase affordance).
 * Streak: flame medallion with the day count inked across its lower rim.
 * Chips: restored dark ink capsule behind the three lives.
 */
export function MarqueeRail({
  remainingChips,
  goldCoins,
  streakDays,
  regenAt = null,
  now = new Date(),
  onOpenSheet,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 430;
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const avatar = compact ? 38 : 44;
  const chipSize = compact ? 16 : 20;
  const icon = compact ? 36 : 42;
  const streakSize = compact ? 38 : 44;
  const pillHeight = compact ? 26 : 30;
  const plus = compact ? 26 : 30;
  const ticket = railRegenTicket({ chips: remainingChips, regenAt, now });

  return (
    <View
      style={[styles.wrap, { paddingTop: insets.top + 6 }]}
      accessibilityRole="header"
      pointerEvents="box-none">
      <View style={[styles.railInner, compact && styles.railInnerCompact]}>
        <PressSlot label="Your profile" onPress={() => onOpenSheet('profile')}>
          <View style={[styles.avatarFrame, { width: avatar, height: avatar }]}>
            <Image source={AVATAR} style={styles.avatar} resizeMode="cover" />
          </View>
        </PressSlot>

        <View style={styles.chipWrap}>
          <PressSlot
            label={
              ticket.visible
                ? `Chip stack, ${remainingChips} chips. ${ticket.label}`
                : `Chip stack, ${remainingChips} chips`
            }
            onPress={() => onOpenSheet('chips')}
            style={styles.chipCapsule}>
            <RattlingChips remaining={remainingChips} size={chipSize} />
          </PressSlot>
          {ticket.visible && ticket.label ? <RegenTicket label={ticket.label} /> : null}
        </View>

        <View style={styles.goldCluster}>
          <PressSlot
            label={`Gold Coins, ${goldCoins}. Open gold details`}
            onPress={() => onOpenSheet('gold')}
            style={styles.goldSlot}>
            <View style={styles.goldCoinFront}>
              <HudMedallion source={GOLD_BARS} size={icon} crop={HUD_CROPS.goldBars} />
            </View>
            <View
              style={[
                styles.goldPill,
                { height: pillHeight, borderRadius: pillHeight / 2, marginLeft: -icon / 2 },
                { paddingLeft: icon / 2 + 6, paddingRight: plus / 2 + 8 },
              ]}>
              <Text
                numberOfLines={1}
                style={[styles.goldAmount, compact && styles.goldAmountCompact, display]}>
                {goldCoins}
              </Text>
            </View>
          </PressSlot>
          <Pressable
            onPress={() => {
              void lightTap();
              pressPlaceholderBuy();
              onOpenSheet('gold');
            }}
            style={({ pressed }) => [
              styles.plusButton,
              { width: plus, height: plus, borderRadius: plus / 2, marginLeft: -plus / 2 - 4 },
              pressed ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Buy more Gold Coins"
            hitSlop={Math.ceil((HIT - plus) / 2)}>
            <View style={[styles.plusBevel, { borderRadius: plus / 2 }]} pointerEvents="none" />
            <View style={styles.plusBarH} pointerEvents="none" />
            <View style={styles.plusBarV} pointerEvents="none" />
          </Pressable>
        </View>

        <PressSlot
          label={`Streak, ${streakDays} days`}
          onPress={() => onOpenSheet('streak')}
          style={styles.streakSlot}>
          <HudMedallion source={STREAK_FLAME} size={streakSize} crop={HUD_CROPS.streakFlame}>
            <View style={styles.streakNumber} pointerEvents="none">
              <InkedNumber size={compact ? 17 : 20} display={display}>
                {streakDays}
              </InkedNumber>
            </View>
          </HudMedallion>
        </PressSlot>

        <PressSlot label="Settings" onPress={() => onOpenSheet('settings')}>
          <HudMedallion source={SETTINGS_GEARS} size={icon} crop={HUD_CROPS.settingsGears} />
        </PressSlot>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    elevation: 12,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  railInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 10,
    minHeight: 48,
  },
  railInnerCompact: {
    gap: 4,
    paddingHorizontal: 6,
  },
  slot: {
    minWidth: HIT,
    minHeight: HIT,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'transparent',
  },
  avatarFrame: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: artStyle.colors.gold,
    backgroundColor: 'transparent',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  chipWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCapsule: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: artStyle.colors.gold,
    backgroundColor: artStyle.colors.projectorBlack,
    minWidth: HIT,
    minHeight: HIT,
  },
  goldCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldSlot: {
    gap: 0,
  },
  goldCoinFront: {
    zIndex: 2,
    elevation: 5,
  },
  goldPill: {
    zIndex: 1,
    minWidth: 64,
    borderWidth: 1.5,
    borderColor: artStyle.colors.gold,
    backgroundColor: '#F1E6C8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  goldAmount: {
    color: artStyle.colors.tobacco,
    fontSize: 20,
    letterSpacing: 1,
    includeFontPadding: false,
  },
  goldAmountCompact: {
    fontSize: 17,
  },
  plusButton: {
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: artStyle.colors.gold,
    backgroundColor: artStyle.colors.feltGreen,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  plusBevel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '50%',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  plusBarH: {
    position: 'absolute',
    width: '52%',
    height: 3,
    borderRadius: 2,
    backgroundColor: artStyle.colors.cream,
  },
  plusBarV: {
    position: 'absolute',
    width: 3,
    height: '52%',
    borderRadius: 2,
    backgroundColor: artStyle.colors.cream,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.94 }],
  },
  streakSlot: {
    backgroundColor: 'transparent',
  },
  streakNumber: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -7,
    alignItems: 'center',
  },
  inkedBox: {
    position: 'relative',
  },
  inkedDigit: {
    letterSpacing: 0.4,
    textAlign: 'center',
    includeFontPadding: false,
  },
  inkedOutline: {
    position: 'absolute',
    color: artStyle.colors.projectorBlack,
  },
  inkedFace: {
    color: artStyle.colors.cream,
    textShadowColor: 'rgba(230,196,106,0.55)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 0 },
  },
  ticket: {
    marginTop: 2,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: artStyle.colors.oxblood,
    borderWidth: 1.5,
    borderColor: artStyle.colors.projectorBlack,
  },
  ticketText: {
    color: artStyle.colors.cream,
    fontSize: 10,
    letterSpacing: 0.8,
  },
});
