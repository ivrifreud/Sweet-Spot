export type FogPhase = 'closed' | 'parting' | 'hidden';

export type FogEvent =
  | { type: 'chunk-cleared'; nextChunkExists: boolean; reducedMotion: boolean }
  | { type: 'parting-finished' }
  | { type: 'camera-settled'; nextChunkExists: boolean };

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
