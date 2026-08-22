import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';

import { px } from '../shared/svgHelpers';
import type { ResolvedGardenTheme } from '../../../theme/bennysGarden';

type Props = {
  width: number;
  height: number;
  theme: ResolvedGardenTheme;
};

function TrestleTable({
  width,
  height,
  palette,
}: {
  width: number;
  height: number;
  palette: ResolvedGardenTheme['palette'];
}) {
  const topY = px(0.52, height);
  const legY = px(0.92, height);

  return (
    <G>
      {/* Table shadow on ground */}
      <Ellipse
        cx={px(0.5, width)}
        cy={px(0.93, height)}
        rx={px(0.38, width)}
        ry={px(0.04, height)}
        fill={palette.ink}
        opacity={0.2}
      />

      {/* A-frame legs */}
      <Path
        d={`M ${px(0.18, width)} ${legY} L ${px(0.32, width)} ${topY + px(0.08, height)} L ${px(0.28, width)} ${legY} Z`}
        fill={palette.woodDark}
        stroke={palette.ink}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d={`M ${px(0.82, width)} ${legY} L ${px(0.68, width)} ${topY + px(0.08, height)} L ${px(0.72, width)} ${legY} Z`}
        fill={palette.woodDark}
        stroke={palette.ink}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Plank top */}
      {[0.14, 0.22, 0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78, 0.86].map((x, index) => (
        <Rect
          key={`plank-${index}`}
          x={px(x, width)}
          y={topY}
          width={px(0.075, width)}
          height={px(0.38, height)}
          rx={2}
          fill={index % 2 === 0 ? palette.wood : palette.woodGrain}
          stroke={palette.ink}
          strokeWidth={2}
        />
      ))}

      {/* Cross brace */}
      <Rect
        x={px(0.35, width)}
        y={topY + px(0.22, height)}
        width={px(0.3, width)}
        height={px(0.025, height)}
        fill={palette.woodDark}
        stroke={palette.ink}
        strokeWidth={1.5}
      />
    </G>
  );
}

function RoundSlatsTable({
  width,
  height,
  palette,
}: {
  width: number;
  height: number;
  palette: ResolvedGardenTheme['palette'];
}) {
  const cx = px(0.5, width);
  const cy = px(0.62, height);
  const rx = px(0.36, width);
  const ry = px(0.22, height);

  return (
    <G>
      <Ellipse
        cx={cx}
        cy={px(0.88, height)}
        rx={rx * 0.85}
        ry={px(0.035, height)}
        fill={palette.ink}
        opacity={0.18}
      />

      {/* Pedestal */}
      <Path
        d={`M ${cx - px(0.06, width)} ${cy + ry * 0.4} L ${cx} ${cy + ry * 0.9} L ${cx + px(0.06, width)} ${cy + ry * 0.4} Z`}
        fill={palette.woodDark}
        stroke={palette.ink}
        strokeWidth={2}
      />

      {/* Round slatted top */}
      <Ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={palette.wood}
        stroke={palette.ink}
        strokeWidth={2.5}
      />

      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index / 12) * Math.PI;
        const x1 = cx + Math.cos(angle) * rx * 0.15;
        const y1 = cy + Math.sin(angle) * ry * 0.15;
        const x2 = cx + Math.cos(angle) * rx * 0.9;
        const y2 = cy + Math.sin(angle) * ry * 0.9;
        return (
          <Path
            key={`slat-${index}`}
            d={`M ${x1} ${y1} L ${x2} ${y2}`}
            stroke={palette.woodGrain}
            strokeWidth={2}
            opacity={0.7}
          />
        );
      })}

      {/* Highlight edge */}
      <Path
        d={`M ${cx - rx * 0.7} ${cy - ry * 0.3} Q ${cx} ${cy - ry * 0.55} ${cx + rx * 0.5} ${cy - ry * 0.2}`}
        fill="none"
        stroke={palette.cream}
        strokeWidth={2}
        opacity={0.35}
      />
    </G>
  );
}

function LongRusticTable({
  width,
  height,
  palette,
}: {
  width: number;
  height: number;
  palette: ResolvedGardenTheme['palette'];
}) {
  const topY = px(0.5, height);

  return (
    <G>
      <Ellipse
        cx={px(0.5, width)}
        cy={px(0.94, height)}
        rx={px(0.42, width)}
        ry={px(0.035, height)}
        fill={palette.ink}
        opacity={0.22}
      />

      {/* Thick plank surface — perspective narrowing toward top */}
      <Path
        d={`M ${px(0.06, width)} ${px(0.88, height)} L ${px(0.12, width)} ${topY} L ${px(0.88, width)} ${topY} L ${px(0.94, width)} ${px(0.88, height)} Z`}
        fill={palette.woodDark}
        stroke={palette.ink}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Plank lines */}
      {[0.18, 0.3, 0.42, 0.54, 0.66, 0.78].map((x, index) => (
        <Path
          key={`long-plank-${index}`}
          d={`M ${px(x, width)} ${topY + px(0.02, height)} L ${px(x + 0.04, width)} ${px(0.86, height)}`}
          stroke={palette.woodGrain}
          strokeWidth={1.5}
          opacity={0.6}
        />
      ))}

      {/* Chipped paint edge */}
      <Path
        d={`M ${px(0.12, width)} ${topY} Q ${px(0.08, width)} ${topY + px(0.04, height)} ${px(0.1, width)} ${topY + px(0.06, height)}`}
        fill="none"
        stroke={palette.cream}
        strokeWidth={2}
        opacity={0.5}
      />

      {/* Side legs */}
      <Rect
        x={px(0.14, width)}
        y={px(0.82, height)}
        width={px(0.04, width)}
        height={px(0.1, height)}
        fill={palette.woodDark}
        stroke={palette.ink}
        strokeWidth={2}
      />
      <Rect
        x={px(0.82, width)}
        y={px(0.82, height)}
        width={px(0.04, width)}
        height={px(0.1, height)}
        fill={palette.woodDark}
        stroke={palette.ink}
        strokeWidth={2}
      />
    </G>
  );
}

export function TableLayer({ width, height, theme }: Props) {
  const { palette, layout } = theme;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {layout.table === 'trestle' && (
        <TrestleTable width={width} height={height} palette={palette} />
      )}
      {layout.table === 'roundSlats' && (
        <RoundSlatsTable width={width} height={height} palette={palette} />
      )}
      {layout.table === 'longRustic' && (
        <LongRusticTable width={width} height={height} palette={palette} />
      )}
    </Svg>
  );
}
