import { describe, expect, it } from 'vitest';

import { markPerf, measurePerf, resetPerfForTests, snapshotPerf } from './marks';

describe('performance marks', () => {
  it('records a local duration without requiring a native Performance implementation', () => {
    resetPerfForTests();
    markPerf('boot-start');
    markPerf('boot-end');
    const duration = measurePerf('boot', 'boot-start', 'boot-end');
    expect(duration).not.toBeNull();
    expect(duration ?? -1).toBeGreaterThanOrEqual(0);
    expect(snapshotPerf().some((entry) => entry.name === 'boot')).toBe(true);
  });
});
