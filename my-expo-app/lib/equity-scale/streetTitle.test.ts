import { describe, expect, it } from 'vitest';

import { equityStreetTitle } from '../../src/features/templates/equity-scale/strings';

describe('equityStreetTitle', () => {
  it('names the street so outs vs equity math is obvious', () => {
    expect(equityStreetTitle('flop')).toBe('ON THE FLOP');
    expect(equityStreetTitle('turn')).toBe('ON THE TURN');
  });
});
