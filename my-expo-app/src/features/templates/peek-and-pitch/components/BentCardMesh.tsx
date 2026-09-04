import {
  Canvas,
  Group,
  ImageShader,
  Vertices,
  useImage,
  type SkPoint,
} from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import type { Card } from '@/lib/cards';

import { buildCardMesh, buildPeekIndexMesh } from '../cardBendMath';
import { PEEK_REVEAL_THRESHOLD, clamp01 } from '../peekMotion';
import { CARD_BACK_ART, cardFaceArt } from './cardArt';

type BentCardMeshProps = {
  card: Card;
  cardIndex: number;
  width: number;
  height: number;
  peek: SharedValue<number>;
  reduced: boolean;
};

const SOURCE_WIDTH = 140;
const SOURCE_HEIGHT = 190;

export function BentCardMesh({
  card,
  cardIndex,
  width,
  height,
  peek,
  reduced,
}: BentCardMeshProps) {
  const backImage = useImage(CARD_BACK_ART);
  const faceImage = useImage(cardFaceArt(card));
  const liftPadding = height * 0.22;

  const flatMesh = buildCardMesh(
    width,
    height,
    0,
    cardIndex,
    SOURCE_WIDTH,
    SOURCE_HEIGHT
  );
  const flatIndex = buildPeekIndexMesh(
    width,
    height,
    0,
    cardIndex,
    SOURCE_WIDTH,
    SOURCE_HEIGHT
  );

  const vertices = useDerivedValue<SkPoint[]>(() => {
    const progress = reduced ? 0 : peek.value;
    return buildCardMesh(
      width,
      height,
      progress,
      cardIndex,
      SOURCE_WIDTH,
      SOURCE_HEIGHT
    ).vertices.map((point) => ({ x: point.x, y: point.y + liftPadding }));
  });

  const indexVertices = useDerivedValue<SkPoint[]>(() => {
    const progress = reduced ? 0 : peek.value;
    return buildPeekIndexMesh(
      width,
      height,
      progress,
      cardIndex,
      SOURCE_WIDTH,
      SOURCE_HEIGHT
    ).vertices.map((point) => ({ x: point.x, y: point.y + liftPadding }));
  });

  const revealOpacity = useDerivedValue(() => {
    const delayedProgress =
      cardIndex === 0 ? clamp01((peek.value - 0.07) / 0.93) : clamp01(peek.value);
    return clamp01((delayedProgress - PEEK_REVEAL_THRESHOLD) / 0.2);
  });

  if (!backImage || !faceImage) {
    return null;
  }

  return (
    <Canvas
      pointerEvents="none"
      style={[
        styles.canvas,
        {
          top: -liftPadding,
          width,
          height: height + liftPadding,
        },
      ]}>
      <Group>
        <ImageShader image={backImage} tx="clamp" ty="clamp" />
        <Vertices
          mode="triangles"
          vertices={vertices}
          textures={flatMesh.textures}
          indices={flatMesh.indices}
        />
      </Group>

      <Group opacity={revealOpacity}>
        <ImageShader image={faceImage} tx="clamp" ty="clamp" />
        <Vertices
          mode="triangles"
          vertices={indexVertices}
          textures={flatIndex.textures}
          indices={flatIndex.indices}
        />
      </Group>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    left: 0,
  },
});
