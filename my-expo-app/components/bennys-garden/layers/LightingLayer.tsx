import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { px } from '../shared/svgHelpers';
import type { ResolvedGardenTheme } from '../../../theme/bennysGarden';

type Props = {
  width: number;
  height: number;
  theme: ResolvedGardenTheme;
};

export function LightingLayer({ width, height, theme }: Props) {
  const { palette, layout, stringLightsOn, mode } = theme;
  const bulbs = layout.stringLights;

  const wirePath = bulbs.reduce((path, bulb, index) => {
    const x = px(bulb.x, width);
    const y = px(bulb.y, height);
    return index === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
  }, '');

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="warmWash" x1="0" y1="0" x2="0" y2="1">
          <Stop
            offset="0"
            stopColor={palette.ambientGlow}
            stopOpacity={mode === 'night' ? 0.35 : 0.15}
          />
          <Stop offset="0.5" stopColor="transparent" stopOpacity={0} />
          <Stop
            offset="1"
            stopColor={palette.ambientGlow}
            stopOpacity={mode === 'night' ? 0.2 : 0.08}
          />
        </LinearGradient>
      </Defs>

      {/* Ambient warm wash from bulbs / sun */}
      <Rect x={0} y={0} width={width} height={height} fill="url(#warmWash)" />

      {/* String light wire */}
      {bulbs.length > 0 && (
        <Path
          d={wirePath}
          fill="none"
          stroke={palette.bulbWire}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Bulbs */}
      {bulbs.map((bulb, index) => {
        const cx = px(bulb.x, width);
        const cy = px(bulb.y, height);
        const r = px(bulb.radius, width);
        const lit = stringLightsOn;

        return (
          <G key={`bulb-${index}`}>
            {lit && (
              <>
                <Circle cx={cx} cy={cy} r={r * 3.5} fill={palette.bulbGlow} opacity={0.18} />
                <Circle cx={cx} cy={cy} r={r * 2} fill={palette.bulbGlow} opacity={0.28} />
              </>
            )}
            <Circle
              cx={cx}
              cy={cy + r * 0.3}
              r={r}
              fill={lit ? palette.bulbCore : palette.bulbGlass}
              stroke={palette.ink}
              strokeWidth={1.5}
            />
            <Path
              d={`M ${cx - r * 0.35} ${cy - r * 0.5} L ${cx + r * 0.35} ${cy - r * 0.5} L ${cx + r * 0.25} ${cy - r * 0.75} L ${cx - r * 0.25} ${cy - r * 0.75} Z`}
              fill={palette.tobacco}
              stroke={palette.ink}
              strokeWidth={1}
            />
            {lit && (
              <Circle
                cx={cx - r * 0.2}
                cy={cy + r * 0.1}
                r={r * 0.15}
                fill={palette.cream}
                opacity={0.6}
              />
            )}
          </G>
        );
      })}

      {/* Table-top warm pool in night mode */}
      {mode === 'night' && stringLightsOn && (
        <Path
          d={`M ${px(0.12, width)} ${px(0.55, height)} Q ${px(0.5, width)} ${px(0.48, height)} ${px(0.88, width)} ${px(0.55, height)} L ${px(0.88, width)} ${px(0.78, height)} Q ${px(0.5, width)} ${px(0.72, height)} ${px(0.12, width)} ${px(0.78, height)} Z`}
          fill={palette.goldBright}
          opacity={0.06}
        />
      )}

      {/* Light mode dappled sun patches on table */}
      {mode === 'light' && (
        <>
          <EllipsePatch
            cx={px(0.35, width)}
            cy={px(0.62, height)}
            rx={px(0.08, width)}
            ry={px(0.04, height)}
            color={palette.goldBright}
          />
          <EllipsePatch
            cx={px(0.62, width)}
            cy={px(0.58, height)}
            rx={px(0.06, width)}
            ry={px(0.035, height)}
            color={palette.goldBright}
          />
        </>
      )}

      {/* Subtle vignette */}
      <Rect x={0} y={0} width={width} height={height} fill={palette.vignette} />
    </Svg>
  );
}

function EllipsePatch({
  cx,
  cy,
  rx,
  ry,
  color,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
}) {
  return (
    <Path
      d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy}`}
      fill={color}
      opacity={0.12}
    />
  );
}
