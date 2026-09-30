import { Image, StyleSheet, Text, View } from 'react-native';
import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';

import { SUIT_NAME, parseCard, type CardCode } from '../../../lib/cards';
import { artStyle } from '../../../../theme/artStyle';
import { cardFaceArt } from '../peek-and-pitch/components/cardArt';
import { CardFace } from '../peek-and-pitch/components/PlayingCard';
import type { SpotDecision } from '../peek-and-pitch/types';
import { actedTag } from './feedback';
import {
  type HoleSlotFrame,
  type HotSeatSceneLayout,
  type SceneFrame,
  type StackFrame,
} from './sceneLayout';
import type { HotSeatSkin } from './types';

const TABLE_ART = {
  garden: require('../../../../assets/hot-seats/bennys-garden.png'),
  casino: require('../../../../assets/hot-seats/local-casino.jpg'),
} as const;

const CHIP_STACK = require('../../../../assets/hot-seats/chip-stack.png');
const GARDEN_THUMB = require('../../../../assets/hot-seats/garden-thumb.png');

export type OpponentReadout = {
  slot: 'left' | 'far' | 'right';
  position: string;
  stack: number;
  action: SpotDecision | null;
};

type HotSeatSceneProps = {
  skin: HotSeatSkin;
  layout: HotSeatSceneLayout;
  communityCards: CardCode[];
  holeCards: CardCode[];
  pot: number;
  position: string;
  priorAction: string;
  heroStack: number;
  heroEnabled: boolean;
  heroPressed: boolean;
  opponents: OpponentReadout[];
};

export function HotSeatScene({
  skin,
  layout,
  communityCards,
  holeCards,
  pot,
  position,
  priorAction,
  heroStack,
  heroEnabled,
  heroPressed,
  opponents,
}: HotSeatSceneProps) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? styles.display : null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {skin === 'garden'
        ? [1, 0].map((index) => (
            <HoleCard
              key={holeCards[index] ?? index}
              code={holeCards[index]}
              slot={layout.holeSlots[index]}
            />
          ))
        : null}
      <Image
        accessibilityRole="image"
        accessibilityLabel={
          skin === 'garden' ? "Benny's Garden poker table" : 'A Local Casino poker table'
        }
        source={TABLE_ART[skin]}
        resizeMode="stretch"
        style={placed(layout.art)}
      />
      {skin === 'garden' ? (
        <Image
          accessibilityElementsHidden
          importantForAccessibility="no"
          source={GARDEN_THUMB}
          resizeMode="stretch"
          style={placed(layout.art)}
        />
      ) : null}
      {opponents.map((seat) => (
        <OpponentStack key={seat.slot} seat={seat} frame={layout.opponents[seat.slot]} />
      ))}
      <View accessibilityLabel={`Pot, ${pot} big blinds`} style={[styles.pot, placed(layout.pot)]}>
        <Image
          accessibilityElementsHidden
          importantForAccessibility="no"
          source={CHIP_STACK}
          resizeMode="contain"
          style={{ width: layout.pot.width, height: layout.pot.chipHeight }}
        />
      </View>
      <BoardCards cards={communityCards} layout={layout} />
      <View
        accessibilityRole="text"
        accessibilityLabel={`Your position, ${position}`}
        style={[styles.plaque, placed(layout.position)]}>
        <Text
          style={[styles.position, display]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}>
          {position}
        </Text>
      </View>
      <View
        accessibilityRole="text"
        accessibilityLabel={`What happened so far. ${priorAction}`}
        accessibilityLiveRegion="polite"
        style={[styles.plaque, styles.story, placed(layout.story)]}>
        <Text style={[styles.kicker, display]}>So far</Text>
        <Text style={styles.storyBody} numberOfLines={2}>
          {priorAction}
        </Text>
      </View>
      <View
        accessibilityLabel={`Your stack, ${heroStack} big blinds`}
        style={[
          styles.heroStack,
          placed(layout.heroStack),
          !heroEnabled && styles.heroStackLocked,
          heroPressed && styles.heroStackPressed,
        ]}>
        <Image
          accessibilityElementsHidden
          importantForAccessibility="no"
          source={CHIP_STACK}
          resizeMode="contain"
          style={{ width: layout.heroStack.width, height: layout.heroStack.imageHeight }}
        />
      </View>
    </View>
  );
}

function BoardCards({ cards, layout }: { cards: CardCode[]; layout: HotSeatSceneLayout }) {
  if (cards.length === 0) return null;
  const cardWidth = Math.min(
    layout.board.cardWidth,
    (layout.board.width - layout.board.gap * (cards.length - 1)) / cards.length
  );
  const rowWidth = cards.length * cardWidth + layout.board.gap * (cards.length - 1);
  const cardHeight = cardWidth * (190 / 140);

  return (
    <View
      accessibilityLabel={`Community cards, ${cards.join(', ')}`}
      style={[
        styles.board,
        {
          left: layout.board.x + (layout.board.width - rowWidth) / 2,
          top: layout.board.y + (layout.board.height - cardHeight) / 2,
          width: rowWidth,
          height: cardHeight,
          gap: layout.board.gap,
        },
      ]}>
      {cards.map((code) => (
        <CardFace key={code} card={parseCard(code)} width={cardWidth} />
      ))}
    </View>
  );
}

function HoleCard({ code, slot }: { code: CardCode | undefined; slot: HoleSlotFrame }) {
  if (!code) return null;
  const card = parseCard(code);
  return (
    <Image
      accessibilityLabel={`${card.rank === 'T' ? '10' : card.rank} of ${SUIT_NAME[card.suit]}`}
      source={cardFaceArt(card)}
      resizeMode="stretch"
      style={{
        position: 'absolute',
        left: slot.x,
        top: slot.y,
        width: slot.width,
        height: slot.height,
        transform: [{ rotate: `${slot.rotation}deg` }],
      }}
    />
  );
}

function OpponentStack({ seat, frame }: { seat: OpponentReadout; frame: StackFrame }) {
  const tag = actedTag(seat.action);
  const label = tag
    ? `${seat.position}, ${seat.stack} big blinds, ${tag}`
    : `${seat.position}, ${seat.stack} big blinds`;

  return (
    <View accessibilityLabel={label} style={[styles.opponent, placed(frame)]}>
      <Image
        accessibilityElementsHidden
        importantForAccessibility="no"
        source={CHIP_STACK}
        resizeMode="contain"
        style={{ width: frame.width, height: frame.imageHeight }}
      />
      {tag ? (
        <View style={[styles.stackBadge, styles.badgeAbove]}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ) : null}
    </View>
  );
}

function placed(frame: SceneFrame) {
  return {
    position: 'absolute' as const,
    left: frame.x,
    top: frame.y,
    width: frame.width,
    height: frame.height,
  };
}

const styles = StyleSheet.create({
  board: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  plaque: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: artStyle.colors.gold,
    backgroundColor: artStyle.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  position: {
    color: artStyle.colors.projectorBlack,
    fontSize: 28,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  story: {
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  kicker: {
    color: artStyle.colors.tobacco,
    fontSize: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  storyBody: {
    color: artStyle.colors.projectorBlack,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  display: {
    fontFamily: 'BebasNeue_400Regular',
  },
  heroStack: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  heroStackLocked: {
    opacity: 0.55,
  },
  heroStackPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.96 }],
  },
  opponent: {
    position: 'absolute',
    overflow: 'visible',
  },
  badgeAbove: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 2,
    alignSelf: 'center',
    left: -14,
    right: -14,
  },
  stackBadge: {
    minHeight: 18,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: artStyle.colors.tobacco,
    backgroundColor: artStyle.colors.cream,
    alignItems: 'center',
  },
  tagText: {
    color: artStyle.colors.tobacco,
    fontSize: 11,
    fontWeight: '800',
  },
});
