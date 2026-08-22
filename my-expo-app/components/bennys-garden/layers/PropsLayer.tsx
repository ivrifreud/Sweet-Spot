import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { px } from '../shared/svgHelpers';
import type { GardenProp, ResolvedGardenTheme } from '../../../theme/bennysGarden';

type Props = {
  width: number;
  height: number;
  theme: ResolvedGardenTheme;
};

function Mug({
  x,
  y,
  scale,
  palette,
}: {
  x: number;
  y: number;
  scale: number;
  palette: ResolvedGardenTheme['palette'];
}) {
  const s = scale;
  return (
    <G>
      <Ellipse cx={x} cy={y + 14 * s} rx={12 * s} ry={4 * s} fill={palette.ink} opacity={0.15} />
      <Path
        d={`M ${x - 10 * s} ${y + 10 * s} L ${x - 8 * s} ${y - 6 * s} Q ${x} ${y - 10 * s} ${x + 8 * s} ${y - 6 * s} L ${x + 10 * s} ${y + 10 * s} Z`}
        fill={palette.cream}
        stroke={palette.ink}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d={`M ${x + 10 * s} ${y} Q ${x + 18 * s} ${y - 2 * s} ${x + 16 * s} ${y + 8 * s}`}
        fill="none"
        stroke={palette.ink}
        strokeWidth={2}
      />
      <Path
        d={`M ${x - 4 * s} ${y - 4 * s} Q ${x} ${y - 8 * s} ${x + 5 * s} ${y - 3 * s}`}
        fill={palette.tealFaded}
        opacity={0.5}
      />
    </G>
  );
}

function Radio({
  x,
  y,
  scale,
  palette,
}: {
  x: number;
  y: number;
  scale: number;
  palette: ResolvedGardenTheme['palette'];
}) {
  const s = scale;
  return (
    <G>
      <Rect
        x={x - 22 * s}
        y={y - 12 * s}
        width={44 * s}
        height={28 * s}
        rx={4 * s}
        fill={palette.tobacco}
        stroke={palette.ink}
        strokeWidth={2}
      />
      <Circle
        cx={x + 10 * s}
        cy={y + 2 * s}
        r={8 * s}
        fill={palette.cream}
        stroke={palette.ink}
        strokeWidth={1.5}
      />
      <Rect x={x - 16 * s} y={y - 6 * s} width={18 * s} height={3 * s} rx={1} fill={palette.gold} />
      <Rect x={x - 16 * s} y={y} width={12 * s} height={2 * s} rx={1} fill={palette.teal} />
    </G>
  );
}

function Lemonade({
  x,
  y,
  scale,
  palette,
}: {
  x: number;
  y: number;
  scale: number;
  palette: ResolvedGardenTheme['palette'];
}) {
  const s = scale;
  return (
    <G>
      <Path
        d={`M ${x - 14 * s} ${y + 12 * s} L ${x - 10 * s} ${y - 14 * s} L ${x + 10 * s} ${y - 14 * s} L ${x + 14 * s} ${y + 12 * s} Z`}
        fill={palette.cream}
        stroke={palette.ink}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d={`M ${x - 8 * s} ${y - 2 * s} L ${x + 8 * s} ${y - 2 * s} L ${x + 6 * s} ${y + 8 * s} L ${x - 6 * s} ${y + 8 * s} Z`}
        fill={palette.goldBright}
        opacity={0.75}
      />
      <Rect
        x={x - 12 * s}
        y={y - 18 * s}
        width={24 * s}
        height={4 * s}
        rx={2}
        fill={palette.woodDark}
        stroke={palette.ink}
        strokeWidth={1.5}
      />
    </G>
  );
}

function PottedPlant({
  x,
  y,
  scale,
  palette,
}: {
  x: number;
  y: number;
  scale: number;
  palette: ResolvedGardenTheme['palette'];
}) {
  const s = scale;
  return (
    <G>
      <Path
        d={`M ${x - 12 * s} ${y + 10 * s} L ${x - 8 * s} ${y + 2 * s} L ${x + 8 * s} ${y + 2 * s} L ${x + 12 * s} ${y + 10 * s} Z`}
        fill={palette.tobacco}
        stroke={palette.ink}
        strokeWidth={2}
      />
      <Ellipse
        cx={x}
        cy={y - 4 * s}
        rx={16 * s}
        ry={12 * s}
        fill={palette.foliageMid}
        stroke={palette.ink}
        strokeWidth={2}
      />
      <Ellipse
        cx={x - 6 * s}
        cy={y - 8 * s}
        rx={10 * s}
        ry={8 * s}
        fill={palette.foliageLight}
        stroke={palette.ink}
        strokeWidth={1.5}
      />
    </G>
  );
}

function Birdhouse({
  x,
  y,
  scale,
  palette,
}: {
  x: number;
  y: number;
  scale: number;
  palette: ResolvedGardenTheme['palette'];
}) {
  const s = scale;
  return (
    <G>
      <Rect
        x={x - 10 * s}
        y={y - 6 * s}
        width={20 * s}
        height={16 * s}
        fill={palette.cream}
        stroke={palette.ink}
        strokeWidth={2}
      />
      <Path
        d={`M ${x - 14 * s} ${y - 6 * s} L ${x} ${y - 16 * s} L ${x + 14 * s} ${y - 6 * s} Z`}
        fill={palette.wood}
        stroke={palette.ink}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Circle
        cx={x}
        cy={y + 2 * s}
        r={4 * s}
        fill={palette.woodDark}
        stroke={palette.ink}
        strokeWidth={1.5}
      />
    </G>
  );
}

function Lantern({
  x,
  y,
  scale,
  palette,
  lit,
}: {
  x: number;
  y: number;
  scale: number;
  palette: ResolvedGardenTheme['palette'];
  lit: boolean;
}) {
  const s = scale;
  return (
    <G>
      {lit && <Circle cx={x} cy={y} r={22 * s} fill={palette.bulbGlow} opacity={0.25} />}
      <Rect
        x={x - 8 * s}
        y={y - 14 * s}
        width={16 * s}
        height={22 * s}
        rx={3 * s}
        fill={palette.teal}
        stroke={palette.ink}
        strokeWidth={2}
      />
      <Rect
        x={x - 5 * s}
        y={y - 8 * s}
        width={10 * s}
        height={10 * s}
        fill={lit ? palette.goldBright : palette.bulbGlass}
        stroke={palette.ink}
        strokeWidth={1.5}
      />
      <Path
        d={`M ${x - 4 * s} ${y - 16 * s} L ${x + 4 * s} ${y - 16 * s}`}
        stroke={palette.ink}
        strokeWidth={2}
      />
    </G>
  );
}

function SeedPacket({
  x,
  y,
  scale,
  palette,
}: {
  x: number;
  y: number;
  scale: number;
  palette: ResolvedGardenTheme['palette'];
}) {
  const s = scale;
  return (
    <G transform={`rotate(-8 ${x} ${y})`}>
      <Rect
        x={x - 14 * s}
        y={y - 10 * s}
        width={28 * s}
        height={20 * s}
        rx={2 * s}
        fill={palette.feltGreen}
        stroke={palette.ink}
        strokeWidth={2}
      />
      <Rect x={x - 10 * s} y={y - 6 * s} width={20 * s} height={3 * s} fill={palette.cream} />
      <Path
        d={`M ${x - 4 * s} ${y + 2 * s} Q ${x} ${y - 2 * s} ${x + 4 * s} ${y + 2 * s}`}
        fill={palette.gold}
        stroke={palette.ink}
        strokeWidth={1}
      />
    </G>
  );
}

function WateringCan({
  x,
  y,
  scale,
  palette,
}: {
  x: number;
  y: number;
  scale: number;
  palette: ResolvedGardenTheme['palette'];
}) {
  const s = scale;
  return (
    <G>
      <Ellipse
        cx={x}
        cy={y + 6 * s}
        rx={14 * s}
        ry={10 * s}
        fill={palette.teal}
        stroke={palette.ink}
        strokeWidth={2}
      />
      <Path
        d={`M ${x + 10 * s} ${y - 2 * s} Q ${x + 22 * s} ${y - 8 * s} ${x + 24 * s} ${y - 14 * s}`}
        fill="none"
        stroke={palette.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d={`M ${x - 6 * s} ${y - 8 * s} Q ${x} ${y - 14 * s} ${x + 4 * s} ${y - 8 * s}`}
        fill="none"
        stroke={palette.ink}
        strokeWidth={2}
      />
    </G>
  );
}

function renderProp(
  prop: GardenProp,
  palette: ResolvedGardenTheme['palette'],
  lit: boolean,
  width: number,
  height: number
) {
  const x = px(prop.x, width);
  const y = px(prop.y, height);
  const scale = (prop.scale ?? 1) * (width / 390);

  switch (prop.kind) {
    case 'mug':
      return <Mug key={`${prop.kind}-${x}-${y}`} x={x} y={y} scale={scale} palette={palette} />;
    case 'radio':
      return <Radio key={`${prop.kind}-${x}-${y}`} x={x} y={y} scale={scale} palette={palette} />;
    case 'lemonade':
      return (
        <Lemonade key={`${prop.kind}-${x}-${y}`} x={x} y={y} scale={scale} palette={palette} />
      );
    case 'pottedPlant':
      return (
        <PottedPlant key={`${prop.kind}-${x}-${y}`} x={x} y={y} scale={scale} palette={palette} />
      );
    case 'birdhouse':
      return (
        <Birdhouse key={`${prop.kind}-${x}-${y}`} x={x} y={y} scale={scale} palette={palette} />
      );
    case 'lantern':
      return (
        <Lantern
          key={`${prop.kind}-${x}-${y}`}
          x={x}
          y={y}
          scale={scale}
          palette={palette}
          lit={lit}
        />
      );
    case 'seedPacket':
      return (
        <SeedPacket key={`${prop.kind}-${x}-${y}`} x={x} y={y} scale={scale} palette={palette} />
      );
    case 'wateringCan':
      return (
        <WateringCan key={`${prop.kind}-${x}-${y}`} x={x} y={y} scale={scale} palette={palette} />
      );
    default:
      return null;
  }
}

export function PropsLayer({ width, height, theme }: Props) {
  const { palette, layout, stringLightsOn } = theme;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {layout.props.map((prop) => renderProp(prop, palette, stringLightsOn, width, height))}
    </Svg>
  );
}
