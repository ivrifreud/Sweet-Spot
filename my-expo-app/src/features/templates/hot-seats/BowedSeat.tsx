import { StyleSheet, Text, View } from 'react-native';

import { artStyle } from '../../../../theme/artStyle';
import { CardBack } from '../peek-and-pitch/components/PlayingCard';
import { actedTag } from './feedback';
import type { SpotDecision } from '../peek-and-pitch/types';

type BowedSeatProps = {
  stack: number;
  action: SpotDecision | null;
  position: string;
};

/** One repeated body. The head stays bowed, so the seat has no readable face. */
export function BowedSeat({ stack, action, position }: BowedSeatProps) {
  const tag = actedTag(action);

  return (
    <View accessibilityLabel={`${position} seat`} style={styles.seat}>
      <View style={styles.head} />
      <View style={styles.shoulders}>
        <View style={styles.arm} />
        <CardBack width={28} />
        <View style={styles.arm} />
      </View>
      <View style={styles.torso} />
      <Text style={styles.stack}>{stack}bb</Text>
      {tag ? (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  seat: {
    width: 96,
    alignItems: 'center',
  },
  head: {
    width: 36,
    height: 28,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: artStyle.colors.tobacco,
    borderWidth: 2,
    borderColor: '#171713',
    transform: [{ translateY: 8 }, { scaleY: 0.86 }],
  },
  shoulders: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  arm: {
    width: 14,
    height: 22,
    borderRadius: 8,
    backgroundColor: artStyle.colors.cream,
    borderWidth: 2,
    borderColor: '#171713',
  },
  torso: {
    width: 58,
    height: 36,
    marginTop: -6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: artStyle.colors.teal,
    borderWidth: 2,
    borderColor: '#171713',
  },
  stack: {
    marginTop: 4,
    color: artStyle.colors.cream,
    fontSize: 12,
    fontWeight: '700',
  },
  tag: {
    marginTop: 4,
    minHeight: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: artStyle.colors.cream,
    borderWidth: 2,
    borderColor: artStyle.colors.tobacco,
    justifyContent: 'center',
  },
  tagText: {
    color: '#171713',
    fontSize: 12,
    fontWeight: '800',
  },
});
