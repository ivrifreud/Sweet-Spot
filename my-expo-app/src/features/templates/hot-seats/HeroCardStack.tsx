import { Image, StyleSheet } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { SUIT_NAME, parseCard, type CardCode } from '../../../lib/cards';
import { cardFaceArt } from '../peek-and-pitch/components/cardArt';
import type { HoleSlotFrame, SceneFrame } from './sceneLayout';
import type { HotSeatSkin } from './types';

export type HeroCardStackProps = {
  cards: readonly [CardCode, CardCode];
  outerSlots: readonly [HoleSlotFrame, HoleSlotFrame];
  art: SceneFrame;
  opacity: SharedValue<number>;
  skin: HotSeatSkin;
};

export function HeroCardStack({ cards, outerSlots, art, opacity }: HeroCardStackProps) {
  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View accessible={false} style={[StyleSheet.absoluteFill, fade]}>
      {outerSlots.map((slot, index) => {
        const code = cards[index];
        const card = parseCard(code);
        const rank = card.rank === 'T' ? '10' : card.rank;
        return (
          <Animated.View
            key={`${code}-${index}`}
            accessibilityLabel={`${rank} of ${SUIT_NAME[card.suit]}`}
            style={{
              position: 'absolute',
              left: slot.x - art.x,
              top: slot.y - art.y,
              width: slot.width,
              height: slot.height,
              transform: [{ rotate: `${slot.rotation}deg` }],
            }}>
            <Image
              accessibilityElementsHidden
              importantForAccessibility="no"
              source={cardFaceArt(card)}
              resizeMode="stretch"
              style={{
                width: slot.width,
                height: slot.height,
                borderRadius: slot.cornerRadius,
                backgroundColor: 'transparent',
              }}
            />
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}
