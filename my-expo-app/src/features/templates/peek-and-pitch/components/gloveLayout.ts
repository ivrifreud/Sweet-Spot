type Point = { x: number; y: number };

export const HERO_GLOVE_ASPECT = 0.8444;

/**
 * Size a first-person glove so the sleeve continues through the bottom of the
 * viewport instead of stopping mid-table.
 */
export function fitGloveToViewport(
  contact: Point,
  minWidth: number,
  viewportHeight: number,
  contactUv: Point,
  aspect = HERO_GLOVE_ASPECT
): { left: number; top: number; width: number; height: number } {
  const naturalHeight = minWidth * aspect;
  const sleeve = Math.max(0.2, 1 - contactUv.y);
  const neededHeight = Math.max(0, viewportHeight - contact.y) / sleeve;
  const height = Math.max(naturalHeight, neededHeight);
  const width = height / aspect;
  return {
    left: contact.x - contactUv.x * width,
    top: contact.y - contactUv.y * height,
    width,
    height,
  };
}
