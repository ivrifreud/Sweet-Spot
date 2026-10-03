import { describe, expect, it } from 'vitest';

import { layoutHotSeatScene } from '../../src/features/templates/hot-seats/sceneLayout';

const PHONE = { width: 390, height: 844, topInset: 47, bottomInset: 34 };

describe('hero card layout', () => {
  it('uses enlarged independently sized cards without an artificial rim', () => {
    const garden = layoutHotSeatScene({ ...PHONE, skin: 'garden' });
    const casino = layoutHotSeatScene({ ...PHONE, skin: 'casino' });

    expect(garden.holeSlots[0]).toMatchObject({ rotation: -15, borderWidth: 0 });
    expect(garden.holeSlots[1]).toMatchObject({ rotation: 10, borderWidth: 0 });
    expect(garden.holeSlots[0].width).toBeCloseTo((160 * garden.art.width) / 571);
    expect(garden.holeSlots[0].height).toBeCloseTo((220 * garden.art.height) / 1024);
    expect(garden.holeSlots[1].width).toBeCloseTo((150 * garden.art.width) / 571);
    expect(garden.holeSlots[1].height).toBeCloseTo((212 * garden.art.height) / 1024);
    expect(garden.holeSlots[0].x + garden.holeSlots[0].width / 2).toBeCloseTo(
      garden.art.x + (258 * garden.art.width) / 571
    );
    expect(garden.holeSlots[1].x + garden.holeSlots[1].width / 2).toBeCloseTo(
      garden.art.x + (322 * garden.art.width) / 571
    );
    expect(garden.holeSlots[1].y + garden.holeSlots[1].height / 2).toBeCloseTo(
      garden.art.y + (863 * garden.art.height) / 1024
    );

    expect(casino.holeSlots).toEqual(garden.holeSlots);
    expect(garden.holeSlots[0].borderWidth).toBe(garden.holeSlots[1].borderWidth);
  });
});
