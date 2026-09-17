import { type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

type Variant = 'hero' | 'board';

type Props = {
  children: ReactNode;
  variant: Variant;
};

const CARPET = {
  hero: require('../../../../../assets/brand/artstyle/felt-carpet-hero.png'),
  board: require('../../../../../assets/brand/artstyle/felt-carpet-board.png'),
} as const;

/** One felt wash behind a card group. No rail or outline — background only. */
export function CardFeltMat({ children, variant }: Props) {
  return (
    <View style={styles.wrap}>
      <Image source={CARPET[variant]} style={styles.carpet} resizeMode="cover" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 6,
    overflow: 'hidden',
    borderRadius: 12,
  },
  carpet: {
    ...StyleSheet.absoluteFillObject,
  },
});
