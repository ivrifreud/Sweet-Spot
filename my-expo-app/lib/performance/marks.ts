type PerfMeasure = {
  name: string;
  durationMs: number;
  startedAt: number;
};

const marks = new Map<string, number>();
const measures: PerfMeasure[] = [];

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function nativeMark(name: string): void {
  try {
    performance.mark?.(name);
  } catch {
    // Optional Performance API is unavailable in some test/native hosts.
  }
}

/** Local-only timing. Never posts or serializes during render. */
export function markPerf(name: string): number {
  const at = nowMs();
  marks.set(name, at);
  nativeMark(name);
  return at;
}

export function measurePerf(name: string, startMark: string, endMark?: string): number | null {
  const start = marks.get(startMark);
  if (start == null) return null;
  const end = endMark ? (marks.get(endMark) ?? nowMs()) : nowMs();
  const durationMs = end - start;
  measures.push({ name, durationMs, startedAt: start });
  try {
    performance.measure?.(name, startMark, endMark);
  } catch {
    // Measure is optional; the in-memory list is the source of truth.
  }
  if (__DEV__) {
    console.log(`[perf] ${name} ${Math.round(durationMs)}ms`);
  }
  return durationMs;
}

export function snapshotPerf(): readonly PerfMeasure[] {
  return measures.slice();
}

export function resetPerfForTests(): void {
  marks.clear();
  measures.length = 0;
}
