import { describe, expect, it } from 'vitest';

import { layoutHotSeatScene } from '../../src/features/templates/hot-seats/sceneLayout';

const PHONE = { width: 390, height: 844, topInset: 47, bottomInset: 34 };

describe('hero card layout', () => {
  it('fits both cards inside one shared rounded frame', () => {
    const garden = layoutHotSeatScene({ ...PHONE, skin: 'garden' });
    const casino = layoutHotSeatScene({ ...PHONE, skin: 'casino' });
    const scale = garden.art.width / 571;

    expect(garden.holeSlots[0]).toMatchObject({ rotation: -13 });
    expect(garden.holeSlots[1]).toMatchObject({ rotation: 7 });
    expect(garden.holeSlots[0].width).toBeCloseTo(168 * scale);
    expect(garden.holeSlots[0].height).toBeCloseTo(228 * scale);
    expect(garden.holeSlots[1].width).toBeCloseTo(148 * scale);
    expect(garden.holeSlots[1].height).toBeCloseTo(230 * scale);
    expect(garden.holeSlots[0].x + garden.holeSlots[0].width / 2).toBeCloseTo(
      garden.art.x + 254 * scale
    );
    expect(garden.holeSlots[0].y + garden.holeSlots[0].height / 2).toBeCloseTo(
      garden.art.y + 858 * scale
    );
    expect(garden.holeSlots[1].x + garden.holeSlots[1].width / 2).toBeCloseTo(
      garden.art.x + 328 * scale
    );
    expect(garden.holeSlots[1].y + garden.holeSlots[1].height / 2).toBeCloseTo(
      garden.art.y + 858 * scale
    );
    expect(garden.holeSlots[1].x).toBeGreaterThan(garden.holeSlots[0].x);
    expect(garden.holeSlots[1].x).toBeLessThan(garden.holeSlots[0].x + garden.holeSlots[0].width);

    expect(garden.holeSlots[0].faceInset).toBeCloseTo(6 * scale);
    expect(garden.holeSlots[0].faceInset).toBe(garden.holeSlots[1].faceInset);
    expect(garden.holeSlots[0].cornerRadius).toBeCloseTo(14 * scale);
    expect(garden.holeSlots[1].cornerRadius).toBeCloseTo(6 * scale);
    expect(garden.holeSlots[0].cornerRadius).toBeGreaterThan(garden.holeSlots[0].faceInset);
    expect(casino.holeSlots).toEqual(garden.holeSlots);
  });
});
