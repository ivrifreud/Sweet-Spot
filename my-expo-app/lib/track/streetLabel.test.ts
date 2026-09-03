import { describe, expect, it } from 'vitest';

import { streetLabelForBoard } from '../../src/features/templates/peek-and-pitch/street';

describe('streetLabelForBoard', () => {
  it('maps board length to street names', () => {
    expect(streetLabelForBoard(0)).toBe('Pre-flop');
    expect(streetLabelForBoard(1)).toBe('Pre-flop');
    expect(streetLabelForBoard(2)).toBe('Pre-flop');
    expect(streetLabelForBoard(3)).toBe('Flop');
    expect(streetLabelForBoard(4)).toBe('Turn');
    expect(streetLabelForBoard(5)).toBe('River');
    expect(streetLabelForBoard(6)).toBe('River');
  });
});
