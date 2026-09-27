import { describe, expect, it } from 'vitest';

import { DIAL_GLOVE_DISC } from '../../src/features/templates/equity-scale/components/dialGloveDisc.generated';
import { DIAL_MAX_DEG, DIAL_MIN_DEG } from '../../src/features/templates/equity-scale/dialMath';
import {
  DIAL_GLOVE_SLEEVE,
  DIAL_HAND_TILT_MAX_DEG,
  DIAL_PIVOT_ORIGIN,
  dialHandPhonePose,
  dialHandTilt,
  rotateAround,
} from '../../src/features/templates/equity-scale/components/dialGloveLayout';
import { equityTableLayout } from '../../src/features/templates/equity-scale/tableLayout';

describe('dial pivot', () => {
  it('pins rotation to the geometric center so a hub point does not orbit', () => {
    expect(DIAL_PIVOT_ORIGIN).toEqual({ x: 0.5, y: 0.5 });
    const hub = { x: 84, y: 84 };
    const spun = rotateAround(hub, hub, 90);
    expect(spun.x).toBeCloseTo(84);
    expect(spun.y).toBeCloseTo(84);
  });
});

function columnHalfWidth(screenWidth: number, table: ReturnType<typeof equityTableLayout>) {
  return (screenWidth - 2 * table.sideInset - 2 * table.buttonSize) / 2;
}

function phonePose(width: number) {
  const table = equityTableLayout({
    width,
    height: 844,
    topInset: 59,
    bottomInset: 34,
    showingOuts: true,
    boardCount: 4,
  });
  const half = columnHalfWidth(width, table);
  const pose = dialHandPhonePose({
    dialSize: table.dialSize,
    bottomClearance: table.actionBottom,
    columnHalfWidth: half,
  });
  return { table, half, pose };
}

describe('dialHandPhonePose', () => {
  it('plants a smaller glove on the right rim with the cuff below the dial', () => {
    const dialSize = 148;
    const pose = dialHandPhonePose({
      dialSize,
      bottomClearance: 40,
      columnHalfWidth: 100,
    });
    const thumbX = pose.left + pose.contact.x;
    const thumbY = pose.top + pose.contact.y;
    const hub = dialSize / 2;
    const dist = Math.hypot(thumbX - hub, thumbY - hub);
    expect(pose.width).toBeGreaterThan(dialSize * 0.9);
    expect(pose.width).toBeLessThan(dialSize * 1.3);
    expect(dist).toBeCloseTo(hub, 0);
    expect(thumbX).toBeGreaterThan(hub);
    expect(pose.top + pose.height).toBeGreaterThan(dialSize);
  });

  it('maps the wheel onto the baked dial disc', () => {
    const dialSize = 148;
    const pose = dialHandPhonePose({
      dialSize,
      bottomClearance: 40,
      columnHalfWidth: 100,
    });
    const hub = dialSize / 2;
    const mapped = {
      x: pose.left + DIAL_GLOVE_DISC.x * pose.width,
      y: pose.top + DIAL_GLOVE_DISC.y * pose.height,
      r: DIAL_GLOVE_DISC.r * pose.width,
    };
    expect(mapped.x).toBeCloseTo(hub, 0);
    expect(mapped.y).toBeCloseTo(hub, 0);
    expect(mapped.r).toBeCloseTo(hub, 0);
  });

  it('rocks slightly with dial travel', () => {
    expect(dialHandTilt(0)).toBe(0);
    expect(dialHandTilt(DIAL_MIN_DEG)).toBe(-DIAL_HAND_TILT_MAX_DEG);
    expect(dialHandTilt(DIAL_MAX_DEG)).toBe(DIAL_HAND_TILT_MAX_DEG);
  });

  it.each([375, 390, 430])(
    'stays left of Lock In and on the rim on a %ipt-wide phone',
    (width) => {
      const { table, half, pose } = phonePose(width);
      const hub = table.dialSize / 2;
      const thumbX = pose.left + pose.contact.x;
      const thumbY = pose.top + pose.contact.y;
      expect(Math.hypot(thumbX - hub, thumbY - hub)).toBeCloseTo(hub, 0);
      expect(pose.width).toBeGreaterThan(table.dialSize * 0.9);
      expect(pose.width).toBeLessThan(table.dialSize * 1.3);
      const sleeve = rotateAround(
        {
          x: pose.left + DIAL_GLOVE_SLEEVE.x * pose.width,
          y: pose.top + DIAL_GLOVE_SLEEVE.y * pose.height,
        },
        { x: thumbX, y: thumbY },
        pose.restDeg
      );
      expect(sleeve.y).toBeGreaterThan(table.dialSize);
      for (const tilt of [DIAL_MIN_DEG, 0, DIAL_MAX_DEG]) {
        const cuff = rotateAround(
          {
            x: pose.left + DIAL_GLOVE_SLEEVE.x * pose.width,
            y: pose.top + DIAL_GLOVE_SLEEVE.y * pose.height,
          },
          { x: thumbX, y: thumbY },
          pose.restDeg + dialHandTilt(tilt)
        );
        // Canvas AABB includes empty pixels; the navy cuff is the ink that can hit Lock In.
        expect(cuff.x).toBeLessThanOrEqual(hub + half - 4);
      }
    }
  );
});
