export type ExclusiveLock = {
  tryAcquire(): boolean;
  release(): void;
};

export function createExclusiveLock(): ExclusiveLock {
  let held = false;
  return {
    tryAcquire() {
      if (held) return false;
      held = true;
      return true;
    },
    release() {
      held = false;
    },
  };
}
