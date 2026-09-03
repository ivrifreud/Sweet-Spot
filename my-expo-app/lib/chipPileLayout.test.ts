import { describe, expect, it } from 'vitest';

import { getChipLayers, getChipPileHeight } from './chipPileLayout';

describe('getChipLayers', () => {
  it('stacks each later chip upward and above the previous chip', () => {
    expect(getChipLayers(5, 10)).toEqual([
      { index: 0, translateY: 0, zIndex: 0 },
      { index: 1, translateY: -10, zIndex: 1 },
      { index: 2, translateY: -20, zIndex: 2 },
      { index: 3, translateY: -30, zIndex: 3 },
      { index: 4, translateY: -40, zIndex: 4 },
    ]);
  });

  it('renders no layers for an empty or negative pile', () => {
    expect(getChipLayers(0, 10)).toEqual([]);
    expect(getChipLayers(-3, 10)).toEqual([]);
  });
});

describe('getChipPileHeight', () => {
  it('includes the chip image plus the upward travel of every later chip', () => {
    expect(getChipPileHeight(44, 5, 10)).toBe(84);
  });

  it('returns zero for an empty pile', () => {
    expect(getChipPileHeight(44, 0, 10)).toBe(0);
  });
});
