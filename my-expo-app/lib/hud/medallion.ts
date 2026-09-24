/** Outer ink hairline + antique gold rim, per side. */
export const MEDALLION_INK_WIDTH = 1;
export const MEDALLION_RIM_WIDTH = 2;

export type MedallionCrop = {
  /** Image width / height ratio is height ÷ width (1 = square). */
  aspect?: number;
  /** >1 zooms past the baked square frame so only the drawing shows. */
  zoom?: number;
  /** 0–1 point of the source image that lands at the circle center. */
  focusX?: number;
  focusY?: number;
};

export function medallionInnerSize(size: number) {
  return Math.max(0, size - 2 * (MEDALLION_INK_WIDTH + MEDALLION_RIM_WIDTH));
}

export function medallionImageBox(
  size: number,
  { aspect = 1, zoom = 1, focusX = 0.5, focusY = 0.5 }: MedallionCrop = {}
) {
  const inner = medallionInnerSize(size);
  const width = inner * zoom;
  const height = width * aspect;
  return {
    width,
    height,
    left: inner / 2 - width * focusX,
    top: inner / 2 - height * focusY,
  };
}

/** Crops tuned to the HUD source art in assets/brand/hud. */
export const HUD_CROPS = {
  goldBars: { zoom: 1.3, focusY: 0.46 },
  settingsGears: { zoom: 1.3, focusY: 0.49 },
  streakFlame: { zoom: 1.6, aspect: 525 / 464, focusY: 0.448 },
} satisfies Record<string, MedallionCrop>;
