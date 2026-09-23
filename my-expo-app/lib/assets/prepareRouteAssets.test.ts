import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { prepareBundledAssets } from './prepareRouteAssets';

describe('prepareRouteAssets', () => {
  it('does not statically import equity scale frames', () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'prepareRouteAssets.ts'),
      'utf8'
    );
    expect(source).not.toMatch(/from ['"][^'"]*equityScaleArt['"]/);
    expect(source).not.toMatch(/from ['"][^'"]*scaleArmLayout['"]/);
  });

  it('no-ops on an empty source list', async () => {
    await expect(prepareBundledAssets([])).resolves.toBeUndefined();
  });

  it('exposes the lockout coach clip for map warm-up', () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'prepareRouteAssets.ts'),
      'utf8'
    );
    expect(source).toMatch(/lockoutCoachAssets/);
    expect(source).toMatch(/coach-broke-lockout\.mp4/);
    expect(source).toMatch(/prepareLockoutCoachAssets/);
  });

  it('does not pull result videos in when a level node opens the equity barrel', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '../../src/features/templates/equity-scale');
    const barrel = readFileSync(join(root, 'index.ts'), 'utf8');
    const reveal = readFileSync(join(root, 'components/StageResultsReveal.tsx'), 'utf8');
    expect(barrel).not.toMatch(/ScaleResultClip/);
    expect(reveal).not.toMatch(/from ['"]\.\/ScaleResultClip['"]/);
  });
});
