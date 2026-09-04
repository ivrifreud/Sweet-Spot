export const CARD_MESH_COLUMNS = 5;
export const CARD_MESH_ROWS = 7;
export const MAX_PEEK_ANGLE_DEG = 16;
export const MAX_PEEK_RISE_RATIO = 0.18;

export type MeshPoint = { x: number; y: number };

export type CardMesh = {
  vertices: MeshPoint[];
  textures: MeshPoint[];
  indices: number[];
};

function clamp01(value: number) {
  'worklet';
  return Math.min(1, Math.max(0, value));
}

/**
 * Projects one point of the card onto the screen. `v=0` is the dealer edge
 * planted on the felt; `v=1` is the near edge held by the player.
 */
export function projectCardPoint(
  u: number,
  v: number,
  progress: number,
  width: number,
  height: number,
  cardIndex: number
): MeshPoint {
  'worklet';
  const cu = clamp01(u);
  const cv = clamp01(v);
  const p = clamp01(progress);
  const lead = 0.9 + cu * 0.1;
  const tuckedDelay = cardIndex === 0 ? 0.94 : 1;
  const theta = p * tuckedDelay * lead * MAX_PEEK_ANGLE_DEG * (Math.PI / 180);

  if (theta < 0.0001) {
    return { x: cu * width, y: cv * height };
  }

  const radius = height / theta;
  const alongFelt = radius * Math.sin(cv * theta);
  const heightAboveFelt = radius * (1 - Math.cos(cv * theta));
  const maxRise = height * MAX_PEEK_RISE_RATIO * p * lead * tuckedDelay;
  const projectedRise = Math.min(
    maxRise * cv * cv,
    cv * height - alongFelt + heightAboveFelt * 1.55
  );

  return {
    x: cu * width + projectedRise * (cu - 0.5) * 0.08,
    y: cv * height - projectedRise,
  };
}

export function buildCardMesh(
  width: number,
  height: number,
  progress: number,
  cardIndex: number,
  textureWidth = 140,
  textureHeight = 190
): CardMesh {
  'worklet';
  const vertices: MeshPoint[] = [];
  const textures: MeshPoint[] = [];
  const indices: number[] = [];

  for (let row = 0; row < CARD_MESH_ROWS; row += 1) {
    const v = row / (CARD_MESH_ROWS - 1);
    for (let column = 0; column < CARD_MESH_COLUMNS; column += 1) {
      const u = column / (CARD_MESH_COLUMNS - 1);
      vertices.push(projectCardPoint(u, v, progress, width, height, cardIndex));
      textures.push({ x: u * textureWidth, y: v * textureHeight });
    }
  }

  for (let row = 0; row < CARD_MESH_ROWS - 1; row += 1) {
    for (let column = 0; column < CARD_MESH_COLUMNS - 1; column += 1) {
      const topLeft = row * CARD_MESH_COLUMNS + column;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + CARD_MESH_COLUMNS;
      const bottomRight = bottomLeft + 1;
      indices.push(topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight);
    }
  }

  return { vertices, textures, indices };
}

/**
 * The face-side strip on the bent near edge. Its UVs sample the top of the
 * original card face, keeping the deck's exact upright rank/suit typography.
 */
export function buildPeekIndexMesh(
  width: number,
  height: number,
  progress: number,
  cardIndex: number,
  textureWidth = 140,
  textureHeight = 190
): CardMesh {
  'worklet';
  const columns = CARD_MESH_COLUMNS;
  const rows = 3;
  const startU = 0;
  const endU = 1;
  const startV = 0.58;
  const endV = 0.98;
  const vertices: MeshPoint[] = [];
  const textures: MeshPoint[] = [];
  const indices: number[] = [];

  for (let row = 0; row < rows; row += 1) {
    const localV = row / (rows - 1);
    const v = startV + localV * (endV - startV);
    for (let column = 0; column < columns; column += 1) {
      const localU = column / (columns - 1);
      const u = startU + localU * (endU - startU);
      vertices.push(projectCardPoint(u, v, progress, width, height, cardIndex));
      textures.push({
        x: localU * textureWidth,
        y: localV * textureHeight * 0.42,
      });
    }
  }

  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const topLeft = row * columns + column;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + columns;
      const bottomRight = bottomLeft + 1;
      indices.push(topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight);
    }
  }

  return { vertices, textures, indices };
}

export function projectedPinchCorner(
  progress: number,
  width: number,
  height: number
): MeshPoint {
  'worklet';
  return projectCardPoint(1, 1, progress, width, height, 1);
}
