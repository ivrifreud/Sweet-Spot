import { StyleSheet, View } from 'react-native';

import type { FeltPlaneConfig } from '../feltPlane';

type FeltPlaneProps = {
  width: number;
  nearY: number;
  farY: number;
  plane: FeltPlaneConfig;
};

/**
 * Invisible 3D collision surface aligned to the painted felt.
 * Card deal / drop / muck landings sample `collideWithFelt` using the same
 * pitch so they rest on this plane instead of hovering in screen space.
 */
export function FeltPlane({ width, nearY, farY, plane }: FeltPlaneProps) {
  const height = Math.max(160, nearY - farY + 180);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.plane,
        {
          width,
          top: farY - 56,
          height,
          transform: [
            { perspective: plane.perspective },
            { rotateX: `${(plane.nearRotateX + plane.farRotateX) / 2}deg` },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  plane: {
    position: 'absolute',
    left: 0,
    opacity: 0,
  },
});
