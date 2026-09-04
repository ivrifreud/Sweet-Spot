import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { describeHoleCards, type HoleCards as HoleCardsTuple } from '@/lib/cards';

import { artStyle } from '../../../../../theme/artStyle';
import { PEEK_REVEAL_THRESHOLD } from '../peekMotion';
import { STRINGS } from '../strings';
import { CardFace } from './PlayingCard';

type PeekHudProps = {
  cards: HoleCardsTuple;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  top: number;
  left: number;
};

const HUD_CARD_WIDTH = 52;

/**
 * Full hole-card faces while the 3D peek is only a corner lift.
 * Tracks the peek shared value so it vanishes as soon as the gloves drop.
 */
export function PeekHud({ cards, peek, muck, top, left }: PeekHudProps) {
  const motion = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return {
      opacity: interpolate(
        lift,
        [PEEK_REVEAL_THRESHOLD, PEEK_REVEAL_THRESHOLD + 0.12],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <Animated.View
      testID="peek-hole-hud"
      pointerEvents="none"
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${STRINGS.peekHud} ${describeHoleCards(cards)}`}
      style={[styles.root, { top, left }, motion]}>
      <View style={styles.row}>
        {cards.map((card, index) => (
          <View
            key={`${card.rank}${card.suit}-${index}`}
            style={[
              styles.card,
              {
                marginLeft: index === 0 ? 0 : 10,
                transform: [{ rotate: index === 0 ? '-6deg' : '7deg' }],
                zIndex: index + 1,
              },
            ]}>
            <CardFace card={card} width={HUD_CARD_WIDTH} />
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    zIndex: 60,
    elevation: 60,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(17,23,20,0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: artStyle.colors.gold,
  },
  card: {
    shadowColor: artStyle.colors.projectorBlack,
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});
