export type WorldRouteSurface = 'road' | 'bridge' | 'boardwalk';

export type WorldRoutePoint = {
  left: number;
  top: number;
  surface: WorldRouteSurface;
  nodeSafe: boolean;
};
