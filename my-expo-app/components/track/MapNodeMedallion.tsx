import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { StyleSheet, Text, View } from 'react-native';

import { ChipSprite } from '../../src/features/templates/peek-and-pitch/components/ChipSprite';
import { MAP_NODE_CHIP_SIZE, type StageStatus } from '../../lib/track/tree';
import { artStyle } from '../../theme/artStyle';
import { PadlockIcon, PlayPlateIcon } from '../hud/HudIcons';

/** Perfect circular status ring diameter (chip + ink rim). */
export const MAP_NODE_RING_PAD = 14;
export const MAP_NODE_RING_SIZE = MAP_NODE_CHIP_SIZE + MAP_NODE_RING_PAD;

type Props = {
  status: StageStatus;
  size?: number;
};

/**
 * Chip medallion inside a perfect circular status ring.
 * No stage number or title — state is ring color, PLAY plate, or padlock.
 */
export function MapNodeMedallion({ status, size = MAP_NODE_CHIP_SIZE }: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const chipSize = size;
  const ringSize = chipSize + MAP_NODE_RING_PAD;
  const locked = status === 'locked';
  const completed = status === 'completed';
  const current = status === 'current';

  return (
    <View
      style={[
        styles.wrap,
        { width: ringSize, height: ringSize + (current ? 30 : 0) },
      ]}>
      <View
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
          },
          completed && styles.ringCompleted,
          current && styles.ringCurrent,
          locked && styles.ringLocked,
        ]}
        pointerEvents="none">
        <View
          style={[
            styles.chipClip,
            {
              width: chipSize,
              height: chipSize,
              borderRadius: chipSize / 2,
            },
            locked && styles.lockedChip,
          ]}>
          <ChipSprite size={chipSize} view="face" />
        </View>
        {completed ? (
          <View
            style={[
              styles.goldRing,
              {
                width: ringSize - 4,
                height: ringSize - 4,
                borderRadius: (ringSize - 4) / 2,
              },
            ]}
          />
        ) : null}
        {completed ? (
          <View style={styles.stars} accessibilityElementsHidden>
            <View style={styles.star} />
            <View style={[styles.star, styles.starMid]} />
            <View style={styles.star} />
          </View>
        ) : null}
        {locked ? (
          <View style={styles.lockBadge}>
            <PadlockIcon size={Math.round(chipSize * 0.38)} />
          </View>
        ) : null}
      </View>
      {current ? (
        <View style={styles.playPlate} accessibilityElementsHidden>
          <PlayPlateIcon width={64} height={24} />
          <Text style={[styles.playLabel, display]}>PLAY</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,215,167,0.92)',
    borderWidth: 2.5,
    borderColor: artStyle.colors.tobacco,
  },
  ringCompleted: {
    borderColor: artStyle.colors.gold,
  },
  ringCurrent: {
    borderColor: artStyle.colors.goldBright,
  },
  ringLocked: {
    backgroundColor: 'rgba(118,83,55,0.55)',
    borderColor: artStyle.colors.projectorBlack,
  },
  chipClip: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lockedChip: {
    opacity: 0.78,
  },
  goldRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: artStyle.colors.goldBright,
  },
  stars: {
    position: 'absolute',
    top: -6,
    flexDirection: 'row',
    gap: 3,
  },
  star: {
    width: 7,
    height: 7,
    borderRadius: 1,
    backgroundColor: artStyle.colors.goldBright,
    transform: [{ rotate: '45deg' }],
  },
  starMid: {
    marginTop: -2,
  },
  lockBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPlate: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playLabel: {
    position: 'absolute',
    color: artStyle.colors.projectorBlack,
    fontSize: 13,
    letterSpacing: 1.4,
  },
});
