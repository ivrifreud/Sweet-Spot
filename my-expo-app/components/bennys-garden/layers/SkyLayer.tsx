import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { cloudPath, px, starPath } from '../shared/svgHelpers';
import type { ResolvedGardenTheme } from '../../../theme/bennysGarden';

type Props = {
  width: number;
  height: number;
  theme: ResolvedGardenTheme;
};

export function SkyLayer({ width, height, theme }: Props) {
  const { palette, layout, mode, showCelestial } = theme;
  const isNight = mode === 'night';

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={palette.skyTop} />
          <Stop offset="0.55" stopColor={palette.skyBottom} />
          <Stop offset="1" stopColor={palette.horizon} />
        </LinearGradient>
      </Defs>

      <Rect x={0} y={0} width={width} height={height} fill="url(#skyGrad)" />

      {/* Light mode clouds */}
      {!isNight &&
        layout.clouds.map((cloud, index) => {
          const cx = px(cloud.x, width);
          const cy = px(cloud.y, height);
          return (
            <G key={`cloud-${index}`}>
              <Path
                d={cloudPath(cx, cy, cloud.scale)}
                fill={palette.cloudShadow}
                opacity={0.35}
                transform={`translate(4, 6)`}
              />
              <Path
                d={cloudPath(cx, cy, cloud.scale)}
                fill={palette.cloud}
                stroke={palette.ink}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            </G>
          );
        })}

      {/* Night mode stars */}
      {isNight &&
        layout.stars.map((star, index) => {
          const cx = px(star.x, width);
          const cy = px(star.y, height);
          return (
            <Path
              key={`star-${index}`}
              d={starPath(cx, cy, star.size)}
              fill={palette.star}
              opacity={star.opacity}
            />
          );
        })}

      {/* Celestial body */}
      {showCelestial && isNight && (
        <G>
          <Circle
            cx={px(0.82, width)}
            cy={px(0.12, height)}
            r={px(0.06, width)}
            fill={palette.moonGlow}
          />
          <Circle
            cx={px(0.82, width)}
            cy={px(0.12, height)}
            r={px(0.035, width)}
            fill={palette.moonFill}
            stroke={palette.ink}
            strokeWidth={2}
          />
          <Path
            d={`M ${px(0.805, width)} ${px(0.115, height)} Q ${px(0.82, width)} ${px(0.1, height)} ${px(0.835, width)} ${px(0.12, height)}`}
            fill="none"
            stroke={palette.ink}
            strokeWidth={1.5}
            opacity={0.35}
          />
        </G>
      )}

      {showCelestial && !isNight && (
        <G>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const cx = px(0.78, width);
            const cy = px(0.14, height);
            const inner = px(0.05, width);
            const outer = px(0.085, width);
            const x1 = cx + Math.cos(rad) * inner;
            const y1 = cy + Math.sin(rad) * inner;
            const x2 = cx + Math.cos(rad) * outer;
            const y2 = cy + Math.sin(rad) * outer;
            return (
              <Path
                key={`ray-${angle}`}
                d={`M ${x1} ${y1} L ${x2} ${y2}`}
                stroke={palette.sunRay}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.7}
              />
            );
          })}
          <Circle
            cx={px(0.78, width)}
            cy={px(0.14, height)}
            r={px(0.045, width)}
            fill={palette.sunCore}
            stroke={palette.ink}
            strokeWidth={2.5}
          />
          <Path
            d={`M ${px(0.765, width)} ${px(0.135, height)} Q ${px(0.78, width)} ${px(0.155, height)} ${px(0.795, width)} ${px(0.135, height)}`}
            fill="none"
            stroke={palette.ink}
            strokeWidth={1.5}
            opacity={0.4}
          />
        </G>
      )}
    </Svg>
  );
}
