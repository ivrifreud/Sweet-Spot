import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { artStyle } from '../../theme/artStyle';

type IconProps = {
  size?: number;
};

export function GearIcon({ size = 28 }: IconProps) {
  /** Cream utility gear — parchment kit language (ink outline, no glass capsule). */
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M9.4 2.2h5.2l.55 2.15 2.05.85 1.95-1.15 2.45 2.45-1.15 1.95.85 2.05 2.15.55v5.2l-2.15.55-.85 2.05 1.15 1.95-2.45 2.45-1.95-1.15-2.05.85-.55 2.15H9.4l-.55-2.15-2.05-.85-1.95 1.15-2.45-2.45 1.15-1.95-.85-2.05L2.2 14.6V9.4l2.15-.55.85-2.05-1.15-1.95 2.45-2.45 1.95 1.15 2.05-.85.55-2.15Z"
        fill={artStyle.colors.cream}
        stroke={artStyle.colors.projectorBlack}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle
        cx={12}
        cy={12}
        r={3.4}
        fill={artStyle.colors.tobacco}
        stroke={artStyle.colors.projectorBlack}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function PadlockIcon({ size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M7.5 10.2V8.1a4.5 4.5 0 0 1 9 0v2.1"
        fill="none"
        stroke={artStyle.colors.goldBright}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Rect
        x={5}
        y={10}
        width={14}
        height={11}
        rx={2.5}
        fill={artStyle.colors.gold}
        stroke={artStyle.colors.projectorBlack}
        strokeWidth={1.6}
      />
      <Circle cx={12} cy={15.2} r={1.5} fill={artStyle.colors.projectorBlack} />
      <Path
        d="M12 16.7v2.1"
        stroke={artStyle.colors.projectorBlack}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function GoldBarsIcon({ size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 26" accessibilityElementsHidden>
      <Path
        d="M3 18.5 8 11h10l5 7.5H3Z"
        fill={artStyle.colors.gold}
        stroke={artStyle.colors.projectorBlack}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M7 18.5 12 11h10l5 7.5H7Z"
        fill={artStyle.colors.goldBright}
        stroke={artStyle.colors.projectorBlack}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M10 11.2 14.5 5h8L27 11.2H10Z"
        fill={artStyle.colors.cream}
        stroke={artStyle.colors.projectorBlack}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StreakFlameIcon({ size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M12 2.5c1.8 2.4 4.8 4.2 4.8 8.1 0 3.7-2.2 6.9-4.8 6.9S7.2 14.3 7.2 10.6c0-2.4 1.1-4.2 2.2-5.5C8.4 8.2 8 9.8 8 11.2c0 1.8.8 3.2 2 3.2.9 0 1.5-.7 1.5-1.7 0-1.4-1-2.3-1-3.9 0-1.3.7-2.5 1.5-3.3Z"
        fill={artStyle.colors.oxblood}
        stroke={artStyle.colors.projectorBlack}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Path
        d="M12.2 11.4c.4.7.6 1.3.6 1.9 0 1.1-.5 1.9-1.2 1.9-.8 0-1.3-.8-1.3-1.8 0-.7.3-1.4.7-2 .2.8.6 1.3 1.2 1.3.3 0 .5-.2.5-.5 0-.4-.2-.6-.5-.8Z"
        fill={artStyle.colors.goldBright}
      />
    </Svg>
  );
}

export function PlayPlateIcon({ width = 72, height = 28 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 72 28" accessibilityElementsHidden>
      <Path
        d="M4 6h64v16H4z"
        fill={artStyle.colors.goldBright}
        stroke={artStyle.colors.projectorBlack}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path d="M4 6h64" stroke={artStyle.colors.cream} strokeWidth={1.2} opacity={0.7} />
    </Svg>
  );
}
