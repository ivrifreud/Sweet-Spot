/** Convert normalized 0–1 coordinates to pixel values for a given canvas size. */
export function px(value: number, size: number): number {
  return value * size;
}

export function pxPair(x: number, y: number, width: number, height: number) {
  return { x: px(x, width), y: px(y, height) };
}

/** Build a simple four-point star path centered at (cx, cy). */
export function starPath(cx: number, cy: number, size: number): string {
  const s = size;
  return [
    `M ${cx} ${cy - s}`,
    `L ${cx + s * 0.28} ${cy - s * 0.28}`,
    `L ${cx + s} ${cy}`,
    `L ${cx + s * 0.28} ${cy + s * 0.28}`,
    `L ${cx} ${cy + s}`,
    `L ${cx - s * 0.28} ${cy + s * 0.28}`,
    `L ${cx - s} ${cy}`,
    `L ${cx - s * 0.28} ${cy - s * 0.28}`,
    'Z',
  ].join(' ');
}

/** Build a puffy 1930s cartoon cloud from overlapping circles. */
export function cloudPath(cx: number, cy: number, scale: number): string {
  const r = 18 * scale;
  const bumps = [
    { x: cx - r * 1.4, y: cy + r * 0.15, rad: r * 0.75 },
    { x: cx - r * 0.5, y: cy - r * 0.35, rad: r * 0.95 },
    { x: cx + r * 0.55, y: cy - r * 0.25, rad: r * 1.05 },
    { x: cx + r * 1.35, y: cy + r * 0.1, rad: r * 0.8 },
    { x: cx + r * 0.15, y: cy + r * 0.35, rad: r * 0.85 },
  ];

  return bumps
    .map(({ x, y, rad }, index) => {
      const start = index === 0 ? `M ${x - rad} ${y}` : '';
      return `${start} A ${rad} ${rad} 0 1 1 ${x + rad} ${y} A ${rad} ${rad} 0 1 1 ${x - rad} ${y}`;
    })
    .join(' ');
}
