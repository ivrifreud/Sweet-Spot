import { describe, expect, it } from 'vitest';

import {
  layoutHotSeatScene,
  opponentSeatIndexes,
  type SceneFrame,
} from '../../src/features/templates/hot-seats/sceneLayout';

const PHONES = [
  { name: '390x844', width: 390, height: 844, topInset: 47, bottomInset: 34 },
  { name: '375x667', width: 375, height: 667, topInset: 20, bottomInset: 0 },
  { name: '430x932', width: 430, height: 932, topInset: 59, bottomInset: 34 },
];

function overlaps(a: SceneFrame, b: SceneFrame) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

describe('layoutHotSeatScene', () => {
  it.each(PHONES)('parks a wide family pot beside large flop cards on $name', (phone) => {
    const scene = layoutHotSeatScene({ ...phone, communityCount: 3 });
    const minGap = phone.height >= 800 ? 8 : 4;

    expect(scene.pot.width).toBeGreaterThan(scene.pot.height);
    expect(scene.board.cardWidth).toBeGreaterThanOrEqual(phone.height >= 800 ? 72 : 60);
    expect(scene.board.cardWidth).toBeLessThanOrEqual(80);
    expect(scene.pot.x).toBeGreaterThanOrEqual(scene.board.x + scene.board.width + 8);
    expect(Math.abs(scene.pot.y + scene.pot.height / 2 - (scene.board.y + scene.board.height / 2))).toBeLessThan(
      8
    );

    expect(scene.heroStack.x).toBeGreaterThanOrEqual(12);
    expect(scene.heroStack.width).toBeLessThanOrEqual(48);
    expect(scene.heroStack.y + scene.heroStack.height).toBeLessThanOrEqual(phone.height - phone.bottomInset);
    expect(scene.heroStack.y + scene.heroStack.height).toBeLessThanOrEqual(scene.heroCards.y);
    expect(scene.heroStack.x + scene.heroStack.width + 8).toBeLessThanOrEqual(scene.story.x);

    expect(scene.position.y).toBeGreaterThanOrEqual(scene.board.y + scene.board.height + minGap);
    expect(scene.story.y).toBeGreaterThanOrEqual(scene.position.y + scene.position.height + minGap);
    expect(scene.story.y + scene.story.height + minGap).toBeLessThanOrEqual(scene.heroCards.y);

    for (const stack of [scene.opponents.left, scene.opponents.far, scene.opponents.right]) {
      expect(stack.y).toBeGreaterThanOrEqual(phone.topInset);
      expect(stack.width).toBeLessThanOrEqual(36);
      expect(stack.x).toBeGreaterThanOrEqual(0);
      expect(stack.x + stack.width).toBeLessThanOrEqual(phone.width);
      expect(overlaps(stack, scene.board)).toBe(false);
      expect(overlaps(stack, scene.pot)).toBe(false);
      expect(overlaps(stack, scene.position)).toBe(false);
      expect(overlaps(stack, scene.story)).toBe(false);
    }

    const scale = scene.art.width / 571;
    const artX = (frame: SceneFrame) => (frame.x - scene.art.x) / scale;
    // Inner edges of the painted side hands, in 571-wide art pixels.
    const leftHandEnd = 194;
    const rightHandStart = 416;
    expect(artX(scene.opponents.left)).toBeGreaterThan(leftHandEnd);
    expect(artX(scene.opponents.right) + scene.opponents.right.width / scale).toBeLessThan(rightHandStart);
    expect(overlaps(scene.opponents.left, scene.opponents.far)).toBe(false);
    expect(overlaps(scene.opponents.right, scene.opponents.far)).toBe(false);

    expect(overlaps(scene.heroStack, scene.heroCards)).toBe(false);
    expect(overlaps(scene.heroStack, scene.story)).toBe(false);
    expect(overlaps(scene.heroStack, scene.board)).toBe(false);
    expect(overlaps(scene.heroStack, scene.pot)).toBe(false);
    expect(overlaps(scene.pot, scene.board)).toBe(false);
    expect(scene.holeSlots).toHaveLength(2);
  });

  it('shrinks a full board so the family pot still sits beside the cards', () => {
    const phone = { width: 390, height: 844, topInset: 47, bottomInset: 34 };
    const flop = layoutHotSeatScene({ ...phone, communityCount: 3 });
    const river = layoutHotSeatScene({ ...phone, communityCount: 5 });

    expect(river.board.cardWidth).toBeLessThan(flop.board.cardWidth);
    expect(river.board.cardWidth).toBeGreaterThanOrEqual(48);
    expect(river.pot.x).toBeGreaterThanOrEqual(river.board.x + river.board.width + 8);
    expect(overlaps(river.pot, river.board)).toBe(false);
    expect(river.story.y + river.story.height + 8).toBeLessThanOrEqual(river.heroCards.y);
  });

  it('centers the pot when the family cards are still to come', () => {
    const scene = layoutHotSeatScene({
      width: 390,
      height: 844,
      topInset: 47,
      bottomInset: 34,
      communityCount: 0,
    });
    const potCenter = scene.pot.x + scene.pot.width / 2;
    expect(Math.abs(potCenter - 195)).toBeLessThan(2);
    const potMiddle = scene.pot.y + scene.pot.height / 2;
    expect(Math.abs(potMiddle - 422)).toBeLessThan(4);
  });
});

describe('opponentSeatIndexes', () => {
  it('puts the next actor on the left and the previous actor on the right', () => {
    expect(opponentSeatIndexes(0)).toEqual({ left: 1, far: 2, right: 3 });
    expect(opponentSeatIndexes(3)).toEqual({ left: 0, far: 1, right: 2 });
  });
});
