import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';

import { px } from '../shared/svgHelpers';
import type { ResolvedGardenTheme } from '../../../theme/bennysGarden';

type Props = {
  width: number;
  height: number;
  theme: ResolvedGardenTheme;
};

export function GardenLayer({ width, height, theme }: Props) {
  const { palette, layout } = theme;
  const fenceTop = px(1 - layout.fenceHeight, height);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Stone patio */}
      <Rect
        x={0}
        y={px(0.48, height)}
        width={width}
        height={px(0.52, height)}
        fill={palette.stoneDark}
        opacity={0.25}
      />
      {[0.08, 0.22, 0.36, 0.5, 0.64, 0.78, 0.92].map((col, rowIndex) =>
        [0.5, 0.58, 0.66, 0.74, 0.82, 0.9].map((row, colIndex) => {
          const x = px(col - 0.04, width);
          const y = px(row, height);
          const w = px(0.12, width);
          const h = px(0.06, height);
          const offset = (rowIndex + colIndex) % 2 === 0 ? px(0.03, width) : 0;
          return (
            <Rect
              key={`paver-${rowIndex}-${colIndex}`}
              x={x + offset}
              y={y}
              width={w}
              height={h}
              rx={3}
              fill={(rowIndex + colIndex) % 3 === 0 ? palette.stone : palette.stoneDark}
              stroke={palette.ink}
              strokeWidth={1}
              opacity={0.85}
            />
          );
        })
      )}

      {/* Background bushes */}
      {[0.05, 0.2, 0.38, 0.55, 0.72, 0.88].map((x, index) => (
        <G key={`bush-${index}`}>
          <Ellipse
            cx={px(x, width)}
            cy={fenceTop + px(0.04, height)}
            rx={px(0.08, width)}
            ry={px(0.05, height)}
            fill={palette.foliageDark}
            stroke={palette.ink}
            strokeWidth={2}
          />
          <Ellipse
            cx={px(x + 0.03, width)}
            cy={fenceTop + px(0.02, height)}
            rx={px(0.06, width)}
            ry={px(0.04, height)}
            fill={palette.foliageMid}
            stroke={palette.ink}
            strokeWidth={1.5}
          />
        </G>
      ))}

      {/* Painted fence */}
      <Rect
        x={0}
        y={fenceTop}
        width={width}
        height={px(0.08, height)}
        fill={palette.wood}
        stroke={palette.ink}
        strokeWidth={2.5}
      />
      {Array.from({ length: 14 }).map((_, index) => {
        const x = px(0.04 + index * 0.07, width);
        return (
          <Rect
            key={`picket-${index}`}
            x={x}
            y={fenceTop - px(0.06, height)}
            width={px(0.025, width)}
            height={px(0.14, height)}
            rx={2}
            fill={palette.cream}
            stroke={palette.ink}
            strokeWidth={2}
          />
        );
      })}

      {/* Fence posts */}
      {[0.04, 0.5, 0.96].map((x, index) => (
        <Rect
          key={`post-${index}`}
          x={px(x, width) - px(0.015, width)}
          y={fenceTop - px(0.1, height)}
          width={px(0.03, width)}
          height={px(0.18, height)}
          fill={palette.woodDark}
          stroke={palette.ink}
          strokeWidth={2}
        />
      ))}

      {/* Tree canopy (optional) */}
      {layout.showTreeCanopy && (
        <G>
          <Path
            d={`M ${px(0.95, width)} ${px(0.05, height)} Q ${px(0.75, width)} ${px(0.02, height)} ${px(0.55, width)} ${px(0.08, height)} Q ${px(0.7, width)} ${px(0.15, height)} ${px(0.92, width)} ${px(0.18, height)} Z`}
            fill={palette.foliageDark}
            stroke={palette.ink}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <Path
            d={`M ${px(0.88, width)} ${px(0.1, height)} Q ${px(0.78, width)} ${px(0.06, height)} ${px(0.68, width)} ${px(0.12, height)} Q ${px(0.76, width)} ${px(0.16, height)} ${px(0.86, width)} ${px(0.15, height)} Z`}
            fill={palette.foliageLight}
            stroke={palette.ink}
            strokeWidth={1.5}
          />
          <Rect
            x={px(0.9, width)}
            y={px(0.16, height)}
            width={px(0.025, width)}
            height={px(0.12, height)}
            fill={palette.woodDark}
            stroke={palette.ink}
            strokeWidth={2}
          />
        </G>
      )}

      {/* Garden bench (optional) */}
      {layout.showBench && (
        <G>
          <Rect
            x={px(0.58, width)}
            y={px(0.46, height)}
            width={px(0.22, width)}
            height={px(0.025, height)}
            rx={3}
            fill={palette.wood}
            stroke={palette.ink}
            strokeWidth={2}
          />
          <Rect
            x={px(0.6, width)}
            y={px(0.42, height)}
            width={px(0.18, width)}
            height={px(0.025, height)}
            rx={3}
            fill={palette.woodDark}
            stroke={palette.ink}
            strokeWidth={2}
          />
          <Rect
            x={px(0.62, width)}
            y={px(0.485, height)}
            width={px(0.02, width)}
            height={px(0.04, height)}
            fill={palette.woodDark}
            stroke={palette.ink}
            strokeWidth={1.5}
          />
          <Rect
            x={px(0.74, width)}
            y={px(0.485, height)}
            width={px(0.02, width)}
            height={px(0.04, height)}
            fill={palette.woodDark}
            stroke={palette.ink}
            strokeWidth={1.5}
          />
        </G>
      )}
    </Svg>
  );
}
