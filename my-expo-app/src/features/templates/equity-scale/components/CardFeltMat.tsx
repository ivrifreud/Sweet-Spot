import { type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { artStyle } from '../../../../../theme/artStyle';
import { CARD_MAT_PAD_X, CARD_MAT_PAD_Y } from '../tableLayout';

type Variant = 'hero' | 'board';

type Props = {
  children: ReactNode;
  variant: Variant;
  /** Inner size of the card group, before the felt pad. */
  contentWidth: number;
  contentHeight: number;
};

const CARPET = {
  hero: require('../../../../../assets/brand/artstyle/felt-carpet-hero.png'),
  board: require('../../../../../assets/brand/artstyle/felt-carpet-board.png'),
} as const;

/**
 * Felt wash behind a card group. Width and height are numbers so the PNG's
 * intrinsic 360×250 / 740×210 size cannot blow the wrap up on web.
 */
export function CardFeltMat({ children, variant, contentWidth, contentHeight }: Props) {
  const width = Math.round(contentWidth + CARD_MAT_PAD_X * 2);
  const height = Math.round(contentHeight + CARD_MAT_PAD_Y * 2);

  return (
    <View style={[styles.wrap, { width, height }]}>
      <View pointerEvents="none" style={[styles.carpetClip, { width, height }]}>
        <View style={[styles.wash, { width, height }]} />
        <Image
          source={CARPET[variant]}
          resizeMode="cover"
          style={{ position: 'absolute', top: 0, left: 0, width, height }}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'visible',
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carpetClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    borderRadius: 10,
  },
  wash: {
    backgroundColor: artStyle.colors.teal,
  },
});
