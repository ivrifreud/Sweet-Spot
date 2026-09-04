import { describe, expect, it } from 'vitest';

import {
  CARD_MESH_COLUMNS,
  CARD_MESH_ROWS,
  MAX_PEEK_RISE_RATIO,
  buildCardMesh,
  buildPeekIndexMesh,
  projectCardPoint,
  projectedPinchCorner,
} from '../../src/features/templates/peek-and-pitch/cardBendMath';

const WIDTH = 84;
const HEIGHT = 114;

describe('buildCardMesh', () => {
  it('builds a 5 by 7 indexed grid', () => {
    const mesh = buildCardMesh(WIDTH, HEIGHT, 1, 1);
    expect(mesh.vertices).toHaveLength(CARD_MESH_COLUMNS * CARD_MESH_ROWS);
    expect(mesh.textures).toHaveLength(mesh.vertices.length);
    expect(mesh.indices).toHaveLength((CARD_MESH_COLUMNS - 1) * (CARD_MESH_ROWS - 1) * 6);
  });

  it('keeps every dealer-edge vertex planted', () => {
    const mesh = buildCardMesh(WIDTH, HEIGHT, 1, 1);
    for (let column = 0; column < CARD_MESH_COLUMNS; column += 1) {
      expect(mesh.vertices[column].y).toBe(0);
    }
  });

  it('never lifts the pinch corner above the configured cap', () => {
    const flat = projectedPinchCorner(0, WIDTH, HEIGHT);
    const lifted = projectedPinchCorner(1, WIDTH, HEIGHT);
    expect(flat.y - lifted.y).toBeLessThanOrEqual(HEIGHT * MAX_PEEK_RISE_RATIO);
    expect(flat.y - lifted.y).toBeGreaterThanOrEqual(HEIGHT * 0.27);
    expect(lifted.y).toBeLessThan(flat.y);
  });

  it('lets the right pinch side lead the left side', () => {
    const left = projectCardPoint(0, 1, 1, WIDTH, HEIGHT, 1);
    const right = projectCardPoint(1, 1, 1, WIDTH, HEIGHT, 1);
    expect(right.y).toBeLessThan(left.y);
  });

  it('produces finite, in-range triangle indices throughout the motion', () => {
    for (const progress of [0, 0.1, 0.35, 0.7, 1]) {
      const mesh = buildCardMesh(WIDTH, HEIGHT, progress, 1);
      expect(mesh.vertices.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(
        true
      );
      expect(Math.max(...mesh.indices)).toBeLessThan(mesh.vertices.length);
      expect(Math.min(...mesh.indices)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('buildPeekIndexMesh', () => {
  it('maps the bent near-edge strip to the upright top of the original face', () => {
    const patch = buildPeekIndexMesh(WIDTH, HEIGHT, 1, 1);
    expect(patch.textures[0]).toEqual({ x: 0, y: 0 });
    expect(Math.max(...patch.textures.map((point) => point.x))).toBe(140);
    expect(Math.max(...patch.textures.map((point) => point.y))).toBeLessThan(190 * 0.51);
  });
});
