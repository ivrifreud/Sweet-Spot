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

    expect(scene.heroStack.x).toBeGreaterThanOrEqual(8);
    expect(scene.heroStack.width).toBeLessThanOrEqual(56);
    expect(scene.heroStack.y + scene.heroStack.height).toBeLessThanOrEqual(phone.height - phone.bottomInset);
    expect(scene.heroStack.y + scene.heroStack.height).toBeLessThanOrEqual(scene.actions.y);

    const actionCenter = scene.actions.x + scene.actions.width / 2;
    expect(Math.abs(actionCenter - phone.width / 2)).toBeLessThan(2);
    expect(scene.actions.height).toBeGreaterThanOrEqual(44);
    expect(scene.actions.y + scene.actions.height + minGap).toBeLessThanOrEqual(scene.heroCards.y);
    expect(scene.actions.y + scene.actions.height).toBeLessThanOrEqual(phone.height - phone.bottomInset);
    expect(scene.arrival.y).toBeGreaterThanOrEqual(Math.max(scene.board.y + scene.board.height, scene.pot.y + scene.pot.height));
    expect(scene.arrival.y + scene.arrival.height).toBeLessThanOrEqual(scene.heroCards.y);

    for (const stack of [scene.opponents.left, scene.opponents.far, scene.opponents.right]) {
      expect(stack.y).toBeGreaterThanOrEqual(phone.topInset);
      expect(stack.width).toBeLessThanOrEqual(56);
      expect(stack.x).toBeGreaterThanOrEqual(0);
      expect(stack.x + stack.width).toBeLessThanOrEqual(phone.width);
      expect(overlaps(stack, scene.board)).toBe(false);
      expect(overlaps(stack, scene.pot)).toBe(false);
    }

    for (const hat of [scene.hats.left, scene.hats.far, scene.hats.right]) {
      expect(hat.y).toBeGreaterThanOrEqual(phone.topInset);
      expect(hat.x).toBeGreaterThanOrEqual(0);
      expect(hat.x + hat.width).toBeLessThanOrEqual(phone.width);
      expect(overlaps(hat, scene.board)).toBe(false);
      expect(overlaps(hat, scene.pot)).toBe(false);
      expect(hat.y + hat.height).toBeLessThan(scene.opponents.far.y + scene.opponents.far.height);
    }
    expect(overlaps(scene.hats.left, scene.hats.far)).toBe(false);
    expect(overlaps(scene.hats.far, scene.hats.right)).toBe(false);
    expect(scene.hats.left.height).toBeGreaterThanOrEqual(44);
    expect(scene.hats.left.width).toBeLessThanOrEqual(118);
    expect(scene.hats.left.width).toBeGreaterThan(80);

    const scale = scene.art.width / 571;
    const artX = (frame: SceneFrame) => (frame.x - scene.art.x) / scale;
    // Inner edges of the painted side hands, in 571-wide art pixels.
    // The left stack may sit against the glove and still stays off the card backs.
    const leftHandEnd = 165;
    const rightHandStart = 416;
    expect(artX(scene.opponents.left)).toBeGreaterThan(leftHandEnd);
    expect(artX(scene.opponents.right) + scene.opponents.right.width / scale).toBeLessThan(rightHandStart);
    expect(overlaps(scene.opponents.left, scene.opponents.far)).toBe(false);
    expect(overlaps(scene.opponents.right, scene.opponents.far)).toBe(false);

    expect(overlaps(scene.heroStack, scene.heroCards)).toBe(false);
    expect(overlaps(scene.heroStack, scene.actions)).toBe(false);
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
    expect(river.actions.y + river.actions.height + 8).toBeLessThanOrEqual(river.heroCards.y);
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
