import { describe, expect, it } from 'vitest';

import { avatarSpriteOrigin, nearestNode, pointAlongPath, resolveHopRest } from './avatarSettle';

const anchors = [
  { x: 0, y: 200 },
  { x: 0, y: 100 },
  { x: 0, y: 0 },
];

describe('resolveHopRest', () => {
  it('rests on the destination node after a finished hop', () => {
    const destination = anchors[2]!;
    const trailEndsShort = [
      { x: 0, y: 200 },
      { x: 0, y: 40 },
    ];
    const rest = resolveHopRest({
      progress: 1,
      finished: true,
      trail: trailEndsShort,
      anchors,
      destination,
    });

    expect(rest).toEqual(destination);
    expect(rest).not.toEqual(trailEndsShort[1]);
  });

  it('snaps an interrupted hop to the nearest node on the path', () => {
    const trail = [
      { x: 0, y: 200 },
      { x: 0, y: 150 },
      { x: 0, y: 100 },
      { x: 0, y: 50 },
      { x: 0, y: 0 },
    ];
    const onTheRoad = pointAlongPath(trail, 0.3);

    expect(anchors.some((anchor) => anchor.y === onTheRoad.y)).toBe(false);

    expect(
      resolveHopRest({
        progress: 0.1,
        finished: false,
        trail,
        anchors,
        destination: anchors[2]!,
      })
    ).toEqual(anchors[0]);

    expect(
      resolveHopRest({
        progress: 0.3,
        finished: false,
        trail,
        anchors,
        destination: anchors[2]!,
      })
    ).toEqual(anchors[1]);

    expect(
      resolveHopRest({
        progress: 0.85,
        finished: false,
        trail,
        anchors,
        destination: anchors[2]!,
      })
    ).toEqual(anchors[2]);
  });

  it('steps back from the overshoot onto the destination node', () => {
    const trail = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];
    const overshot = pointAlongPath(trail, 1.08);

    expect(overshot.x).toBeGreaterThan(100);
    expect(nearestNode(overshot, trail)).toEqual(trail[1]);
    expect(
      resolveHopRest({
        progress: 1.08,
        finished: true,
        trail,
        anchors: trail,
        destination: trail[1]!,
      })
    ).toEqual(trail[1]);
  });

  it('puts the avatar feet on the node anchor', () => {
    const origin = avatarSpriteOrigin({ x: 40, y: 90 }, 84);
    expect(origin.x + 42).toBe(40);
    expect(origin.y + 84).toBe(96);
  });
});
