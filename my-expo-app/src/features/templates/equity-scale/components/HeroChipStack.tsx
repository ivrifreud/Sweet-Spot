import { StyleSheet, View } from 'react-native';

import {
  HERO_PLAY_CHIPS,
  layoutHeroChipCluster,
} from '../../../../../lib/chipPileLayout';
import { CHIP_3Q_ASPECT, CHIP_EDGE_RATIO } from '../../../../../theme/chipArt';
import { ChipPile } from '../../peek-and-pitch/components/ChipPile';

type Props = {
  bottom: number;
};

const CHIP_SIZE = 28;

/** Hero chip cluster in the lower-left, under Call — same piles as Peek and Pitch. */
export function HeroChipStack({ bottom }: Props) {
  const overlapOffset = CHIP_SIZE * CHIP_EDGE_RATIO;
  const chipHeight = CHIP_SIZE * CHIP_3Q_ASPECT;
  const cluster = layoutHeroChipCluster(CHIP_SIZE, chipHeight, overlapOffset, HERO_PLAY_CHIPS);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      accessibilityLabel="Your chips"
      style={[styles.root, { bottom }]}>
      <View style={{ width: cluster.width, height: cluster.height }}>
        {cluster.piles.map((pile) => (
          <View
            key={pile.key}
            style={{
              position: 'absolute',
              left: pile.x,
              bottom: pile.bottom,
              zIndex: pile.zIndex,
            }}>
            <ChipPile
              chipCount={pile.chips}
              size={CHIP_SIZE}
              overlapOffset={overlapOffset}
              rotate={pile.rotate}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 4,
    zIndex: 48,
  },
});
