export type WorldRouteSurface = 'road' | 'bridge' | 'boardwalk';

export type WorldRoutePoint = {
  left: number;
  top: number;
  surface: WorldRouteSurface;
  nodeSafe: boolean;
  /** Round dirt pads — the path finder prefers these for checkpoints. */
  landing?: boolean;
  /** Landings that share a group form one checkpoint circle; one chip is picked inside it. */
  landingGroup?: string;
};
