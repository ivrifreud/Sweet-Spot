import { describe, expect, it } from 'vitest';

import { layoutHotSeatScene } from '../../src/features/templates/hot-seats/sceneLayout';

const PHONE = { width: 390, height: 844, topInset: 47, bottomInset: 34 };

describe('hero card layout', () => {
  it('places both skins on the approved source-art rectangles', () => {
    const garden = layoutHotSeatScene({ ...PHONE, skin: 'garden' });
    const casino = layoutHotSeatScene({ ...PHONE, skin: 'casino' });

    expect(garden.holeSlots[0]).toMatchObject({ rotation: -13 });
    expect(garden.holeSlots[1]).toMatchObject({ rotation: 10 });
    expect(garden.holeSlots[0].faceInset).toBeCloseTo((4 * garden.art.width) / 571);
    expect(garden.holeSlots[0].x + garden.holeSlots[0].width / 2).toBeCloseTo(
      garden.art.x + (258 * garden.art.width) / 571
    );
    expect(garden.holeSlots[1].x + garden.holeSlots[1].width / 2).toBeCloseTo(
      garden.art.x + (333 * garden.art.width) / 571
    );

    expect(casino.holeSlots[0]).toMatchObject({ rotation: -13 });
    expect(casino.holeSlots[1]).toMatchObject({ rotation: 10 });
    expect(casino.holeSlots[0].x + casino.holeSlots[0].width / 2).toBeCloseTo(
      casino.art.x + (258 * casino.art.width) / 571
    );
    expect(casino.holeSlots[1].x + casino.holeSlots[1].width / 2).toBeCloseTo(
      casino.art.x + (333 * casino.art.width) / 571
    );
    expect(casino.holeSlots[0].faceInset).toBeCloseTo(garden.holeSlots[0].faceInset);
  });
});
