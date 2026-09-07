import { describe, expect, it } from 'vitest';

import {
  currentWorldIdForPlacement,
  nextDevPreviewWorld,
  openStageProgressArgs,
  worldForPlacement,
} from './worldForPlacement';

describe('worldForPlacement', () => {
  it('sends Level 1 players to Benny’s Garden', () => {
    expect(worldForPlacement(1)).toEqual({
      status: 'ready',
      worldId: 'bennys-garden',
      progressLevel: 1,
    });
  });

  it('sends Level 2 players to A Local Casino', () => {
    const selected = worldForPlacement(2);
    expect(selected).toEqual({
      status: 'ready',
      worldId: 'local-casino',
      progressLevel: 2,
    });
    expect(currentWorldIdForPlacement(2)).toBe('local-casino');
  });

  it('marks the VIP Room unavailable instead of falling back to Benny', () => {
    const selected = worldForPlacement(3);
    expect(selected.status).toBe('unavailable');
    expect(selected.worldId).toBe('vip-room');
    expect(selected.progressLevel).toBe(3);
    expect(currentWorldIdForPlacement(3)).toBeNull();
    expect(currentWorldIdForPlacement(3)).not.toBe('bennys-garden');
  });
});

describe('openStageProgressArgs', () => {
  it('loads and opens progress for the placed level, not a hardcoded 1', () => {
    expect(openStageProgressArgs('user-a', 1, 4)).toEqual({
      userId: 'user-a',
      level: 1,
      stageNumber: 4,
    });
    expect(openStageProgressArgs('user-a', 2, 1)).toEqual({
      userId: 'user-a',
      level: 2,
      stageNumber: 1,
    });
    expect(openStageProgressArgs('user-b', 3, 2)).toEqual({
      userId: 'user-b',
      level: 3,
      stageNumber: 2,
    });
  });
});

describe('nextDevPreviewWorld', () => {
  it('toggles the devops map preview between Benny’s Garden and A Local Casino', () => {
    expect(nextDevPreviewWorld('bennys-garden')).toBe('local-casino');
    expect(nextDevPreviewWorld('local-casino')).toBe('bennys-garden');
  });
});
