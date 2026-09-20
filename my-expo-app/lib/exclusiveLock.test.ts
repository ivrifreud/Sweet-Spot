import { describe, expect, it } from 'vitest';

import { createExclusiveLock } from './exclusiveLock';

describe('createExclusiveLock', () => {
  it('does not grant a second acquire until the first is released', () => {
    const lock = createExclusiveLock();

    expect(lock.tryAcquire()).toBe(true);
    expect(lock.tryAcquire()).toBe(false);

    lock.release();
    expect(lock.tryAcquire()).toBe(true);
  });

  it('lets only the first overlapping submit run', async () => {
    const lock = createExclusiveLock();
    const order: string[] = [];
    let releaseFirst!: () => void;
    const gate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    async function submit(label: string) {
      if (!lock.tryAcquire()) return;
      try {
        order.push(`${label}-start`);
        await gate;
        order.push(`${label}-end`);
      } finally {
        lock.release();
      }
    }

    const first = submit('a');
    const second = submit('b');
    releaseFirst();
    await Promise.all([first, second]);

    expect(order).toEqual(['a-start', 'a-end']);
  });
});
