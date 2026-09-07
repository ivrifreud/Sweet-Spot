import { describe, expect, it } from 'vitest';

import { layoutCommunityBoard } from './communityBoardLayout';

const PHONE = {
  cardCount: 4,
  viewportWidth: 390,
  maxWidth: 390 * 0.76,
  farY: 287,
  nearY: 743,
};

describe('layoutCommunityBoard', () => {
  it('centers the row on the phone and in the middle of the felt', () => {
    const board = layoutCommunityBoard(PHONE);
    expect(board.left + board.width / 2).toBeCloseTo(PHONE.viewportWidth / 2);
    expect(board.top + board.height / 2).toBeCloseTo((PHONE.farY + PHONE.nearY) / 2);
  });

  it('keeps full card faces readable from the hero rail', () => {
    const board = layoutCommunityBoard(PHONE);
    expect(board.height).toBeGreaterThan(board.cardWidth);
    expect(board.rotateZ).toBe(180);
    expect(board.rotateX).toBe(0);
    expect(board.scale).toBe(1);
  });

  it('parks teaching hints below the cards, not over them', () => {
    const board = layoutCommunityBoard(PHONE);
    expect(board.hintTop).toBeGreaterThanOrEqual(board.top + board.height + 32);
  });
});
