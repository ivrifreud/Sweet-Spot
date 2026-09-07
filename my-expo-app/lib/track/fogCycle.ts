export type FogPhase = 'closed' | 'parting' | 'hidden';

export type FogEvent =
  | { type: 'chunk-cleared'; nextChunkExists: boolean; reducedMotion: boolean }
  | { type: 'parting-finished' }
  | { type: 'camera-settled'; nextChunkExists: boolean };

export type FogCloudLayout = {
  widthFraction: number;
  topFraction: number;
  /** Painted storm height on Local Casino. Image box still uses the bitmap aspect. */
  heightFraction?: number;
  leftInsetFraction: number;
  rightInsetFraction: number;
  partLeftFraction: number;
  partRightFraction: number;
};

export type FogCloudBox = {
  top: number;
  width: number;
  height: number;
  left?: number;
  right?: number;
};

const GARDEN_FOG_LAYOUT: FogCloudLayout = {
  widthFraction: 0.53,
  topFraction: -0.12,
  leftInsetFraction: -0.03,
  rightInsetFraction: -0.03,
  partLeftFraction: -0.92,
  partRightFraction: 0.92,
};

const LOCAL_CASINO_FOG_LAYOUT: FogCloudLayout = {
  widthFraction: 0.82,
  topFraction: -0.02,
  heightFraction: 0.17,
  leftInsetFraction: -0.12,
  rightInsetFraction: -0.12,
  partLeftFraction: -1.12,
  partRightFraction: 1.12,
};

export function fogCloudLayout(worldId: string): FogCloudLayout {
  return worldId === 'local-casino' ? LOCAL_CASINO_FOG_LAYOUT : GARDEN_FOG_LAYOUT;
}

export function fogCloudBox(
  side: 'left' | 'right',
  map: { width: number; height: number },
  assetAspect: number,
  layout: FogCloudLayout
): FogCloudBox {
  const width = map.width * layout.widthFraction;
  const height = width / assetAspect;
  const top = map.height * layout.topFraction;
  if (side === 'left') {
    return { left: map.width * layout.leftInsetFraction, top, width, height };
  }
  return { right: map.width * layout.rightInsetFraction, top, width, height };
}

/** Linger, then peel — not a constant-speed sliding door. */
export function fogPartDrift(reveal: number): number {
  'worklet';
  const t = Math.min(1, Math.max(0, reveal));
  if (t <= 0.28) return t * 0.12;
  const u = (t - 0.28) / 0.72;
  return 0.0336 + u * u * (3 - 2 * u) * 0.9664;
}

/** Extra drift while fog parts — envelope is 0 at rest and after the banks leave. */
export function fogPartTremble(
  reveal: number,
  side: 'left' | 'right'
): { x: number; y: number; rotate: number } {
  'worklet';
  const t = Math.min(1, Math.max(0, reveal));
  const envelope = Math.sin(t * Math.PI);
  const freq = side === 'left' ? 8.1 : 6.7;
  const wobble =
    (Math.sin(t * Math.PI * freq) + 0.42 * Math.sin(t * Math.PI * (freq * 1.73 + 0.35))) *
    envelope;
  const sign = side === 'left' ? -1 : 1;
  return {
    x: wobble * 0.09 * sign + 0,
    y: wobble * (side === 'left' ? 1.15 : -0.95) + 0,
    rotate: wobble * (side === 'left' ? -4.6 : 3.8) + 0,
  };
}

export function initialFogPhase(completedChunks: number, chunkCount: number): FogPhase {
  if (chunkCount <= 0 || completedChunks >= chunkCount) return 'hidden';
  return 'closed';
}

export function reduceFog(phase: FogPhase, event: FogEvent): FogPhase {
  switch (event.type) {
    case 'chunk-cleared':
      if (!event.nextChunkExists) return 'hidden';
      return event.reducedMotion ? 'hidden' : 'parting';
    case 'parting-finished':
      return 'hidden';
    case 'camera-settled':
      return event.nextChunkExists ? 'closed' : 'hidden';
  }
}
