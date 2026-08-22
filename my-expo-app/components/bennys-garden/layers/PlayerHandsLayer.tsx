import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';

import { px } from '../shared/svgHelpers';
import type { ResolvedGardenTheme } from '../../../theme/bennysGarden';

type Props = {
  width: number;
  height: number;
  theme: ResolvedGardenTheme;
};

/** Period white animation gloves — POV at bottom of frame. */
export function PlayerHandsLayer({ width, height, theme }: Props) {
  const { palette } = theme;
  const leftRestX = px(0.22, width);
  const rightRestX = px(0.72, width);
  const restY = px(0.82, height);
  const scale = width / 390;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Left forearm + cuff */}
      <G>
        <Path
          d={`M ${leftRestX - 30 * scale} ${height} L ${leftRestX - 18 * scale} ${restY + 40 * scale} Q ${leftRestX - 8 * scale} ${restY + 20 * scale} ${leftRestX} ${restY + 8 * scale}`}
          fill={palette.teal}
          stroke={palette.ink}
          strokeWidth={2.5 * scale}
          strokeLinejoin="round"
        />
        <Rect
          x={leftRestX - 22 * scale}
          y={restY + 28 * scale}
          width={36 * scale}
          height={10 * scale}
          rx={3 * scale}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2 * scale}
        />

        {/* Left glove palm */}
        <Ellipse
          cx={leftRestX + 4 * scale}
          cy={restY + 18 * scale}
          rx={28 * scale}
          ry={22 * scale}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2.5 * scale}
        />

        {/* Left fingers — thick period gloves, 3 fingers + thumb */}
        <Path
          d={`M ${leftRestX - 12 * scale} ${restY + 4 * scale} Q ${leftRestX - 18 * scale} ${restY - 18 * scale} ${leftRestX - 6 * scale} ${restY - 8 * scale} Q ${leftRestX - 2 * scale} ${restY + 2 * scale} ${leftRestX + 2 * scale} ${restY + 6 * scale} Z`}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2 * scale}
          strokeLinejoin="round"
        />
        <Path
          d={`M ${leftRestX + 2 * scale} ${restY + 2 * scale} Q ${leftRestX + 4 * scale} ${restY - 22 * scale} ${leftRestX + 14 * scale} ${restY - 10 * scale} Q ${leftRestX + 12 * scale} ${restY + 2 * scale} ${leftRestX + 8 * scale} ${restY + 8 * scale} Z`}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2 * scale}
          strokeLinejoin="round"
        />
        <Path
          d={`M ${leftRestX + 14 * scale} ${restY + 4 * scale} Q ${leftRestX + 22 * scale} ${restY - 16 * scale} ${leftRestX + 28 * scale} ${restY - 4 * scale} Q ${leftRestX + 24 * scale} ${restY + 6 * scale} ${leftRestX + 18 * scale} ${restY + 10 * scale} Z`}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2 * scale}
          strokeLinejoin="round"
        />
        <Path
          d={`M ${leftRestX + 30 * scale} ${restY + 12 * scale} Q ${leftRestX + 42 * scale} ${restY + 2 * scale} ${leftRestX + 36 * scale} ${restY + 20 * scale} Q ${leftRestX + 32 * scale} ${restY + 24 * scale} ${leftRestX + 26 * scale} ${restY + 20 * scale} Z`}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2 * scale}
          strokeLinejoin="round"
        />

        {/* Palm marks */}
        <Path
          d={`M ${leftRestX + 6 * scale} ${restY + 14 * scale} Q ${leftRestX + 10 * scale} ${restY + 20 * scale} ${leftRestX + 16 * scale} ${restY + 14 * scale}`}
          fill="none"
          stroke={palette.ink}
          strokeWidth={1.2 * scale}
          opacity={0.35}
        />
      </G>

      {/* Right forearm reaching toward center */}
      <G>
        <Path
          d={`M ${rightRestX + 30 * scale} ${height} L ${rightRestX + 18 * scale} ${restY + 44 * scale} Q ${rightRestX + 6 * scale} ${restY + 24 * scale} ${rightRestX - 4 * scale} ${restY + 10 * scale}`}
          fill={palette.teal}
          stroke={palette.ink}
          strokeWidth={2.5 * scale}
          strokeLinejoin="round"
        />
        <Rect
          x={rightRestX - 18 * scale}
          y={restY + 30 * scale}
          width={36 * scale}
          height={10 * scale}
          rx={3 * scale}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2 * scale}
        />

        <Ellipse
          cx={rightRestX - 8 * scale}
          cy={restY + 20 * scale}
          rx={30 * scale}
          ry={24 * scale}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2.5 * scale}
        />

        <Path
          d={`M ${rightRestX - 28 * scale} ${restY + 6 * scale} Q ${rightRestX - 38 * scale} ${restY - 14 * scale} ${rightRestX - 24 * scale} ${restY - 6 * scale} Q ${rightRestX - 18 * scale} ${restY + 4 * scale} ${rightRestX - 14 * scale} ${restY + 8 * scale} Z`}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2 * scale}
          strokeLinejoin="round"
        />
        <Path
          d={`M ${rightRestX - 14 * scale} ${restY + 2 * scale} Q ${rightRestX - 16 * scale} ${restY - 20 * scale} ${rightRestX - 4 * scale} ${restY - 12 * scale} Q ${rightRestX - 2 * scale} ${restY} ${rightRestX - 6 * scale} ${restY + 6 * scale} Z`}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2 * scale}
          strokeLinejoin="round"
        />
        <Path
          d={`M ${rightRestX - 2 * scale} ${restY + 4 * scale} Q ${rightRestX + 4 * scale} ${restY - 18 * scale} ${rightRestX + 14 * scale} ${restY - 6 * scale} Q ${rightRestX + 10 * scale} ${restY + 4 * scale} ${rightRestX + 4 * scale} ${restY + 8 * scale} Z`}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2 * scale}
          strokeLinejoin="round"
        />
        <Path
          d={`M ${rightRestX + 12 * scale} ${restY + 10 * scale} Q ${rightRestX + 24 * scale} ${restY - 2 * scale} ${rightRestX + 20 * scale} ${restY + 16 * scale} Q ${rightRestX + 14 * scale} ${restY + 22 * scale} ${rightRestX + 8 * scale} ${restY + 18 * scale} Z`}
          fill={palette.cream}
          stroke={palette.ink}
          strokeWidth={2 * scale}
          strokeLinejoin="round"
        />

        <Path
          d={`M ${rightRestX - 10 * scale} ${restY + 16 * scale} Q ${rightRestX - 4 * scale} ${restY + 22 * scale} ${rightRestX + 2 * scale} ${restY + 16 * scale}`}
          fill="none"
          stroke={palette.ink}
          strokeWidth={1.2 * scale}
          opacity={0.35}
        />
      </G>
    </Svg>
  );
}
