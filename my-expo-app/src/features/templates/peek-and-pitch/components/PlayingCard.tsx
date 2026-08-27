import { Image, StyleSheet, View } from 'react-native';

import { SUIT_NAME, type Card } from '@/lib/cards';

import { CARD_BACK_ART, cardFaceArt } from './cardArt';

/** Kenney card art is 140×190. */
export const CARD_ASPECT = 190 / 140;

type CardFaceProps = {
  card: Card;
  width: number;
  /**
   * Print on the underside of a face-down peel. Horizontally un-mirrors the
   * backface so rank and suit read left-to-right toward the camera.
   */
  underside?: boolean;
};

/** Full face from the Kenney CC0 deck — rank, suit, and pips stay readable. */
export function CardFace({ card, width, underside = false }: CardFaceProps) {
  const height = width * CARD_ASPECT;

  return (
    <Image
      accessibilityLabel={`${card.rank === 'T' ? '10' : card.rank} of ${SUIT_NAME[card.suit]}`}
      source={cardFaceArt(card)}
      resizeMode="contain"
      style={[styles.art, { width, height }, underside ? styles.underside : null]}
    />
  );
}

/**
 * Zoomed top-left index so a peek flap can show "10" and the suit, not a clipped "1".
 */
export function PeekIndex({ card, width, height }: CardFaceProps & { height: number }) {
  const zoom = 2.15;
  const artWidth = width * zoom;
  const artHeight = artWidth * CARD_ASPECT;

  return (
    <View style={[styles.indexCrop, { width, height }]}>
      <Image
        source={cardFaceArt(card)}
        resizeMode="stretch"
        style={{ width: artWidth, height: artHeight, marginLeft: -2, marginTop: -2 }}
      />
    </View>
  );
}

type CardBackProps = {
  width: number;
  /** Solid stock for peel slices — no inner frame, which would stripe at band edges. */
  plain?: boolean;
};

export function CardBack({ width, plain = false }: CardBackProps) {
  const height = width * CARD_ASPECT;

  if (plain) {
    return (
      <View style={[styles.plainBack, { width, height }]}>
        <Image source={CARD_BACK_ART} resizeMode="cover" style={styles.fill} />
      </View>
    );
  }

  return (
    <Image
      source={CARD_BACK_ART}
      resizeMode="contain"
      style={[styles.art, { width, height }]}
    />
  );
}

const styles = StyleSheet.create({
  art: {
    backgroundColor: 'transparent',
  },
  underside: {
    transform: [{ scaleX: -1 }],
  },
  indexCrop: {
    overflow: 'hidden',
    borderRadius: 6,
    backgroundColor: '#f4f4f5',
  },
  plainBack: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  fill: {
    width: '100%',
    height: '100%',
  },
});
