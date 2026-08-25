import Svg, { Circle, Path } from 'react-native-svg';

import { artStyle } from '../../theme/artStyle';

type IconProps = {
  size?: number;
  color?: string;
};

const stroke = artStyle.colors.cream;

export function EnvelopeIcon({ size = 26, color = stroke }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M5 7.2 12 13l7-5.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PersonIcon({ size = 26, color = stroke }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Circle cx={12} cy={8} r={3.2} stroke={color} strokeWidth={1.8} />
      <Path
        d="M5.5 19.2c.8-3.2 3.3-5 6.5-5s5.7 1.8 6.5 5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function LockIcon({ size = 26, color = stroke }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        d="M7.5 11V8.2A4.5 4.5 0 0 1 12 3.7 4.5 4.5 0 0 1 16.5 8.2V11"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M6.5 11h11A1.5 1.5 0 0 1 19 12.5v7A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-7A1.5 1.5 0 0 1 6.5 11Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EyeIcon({ size = 24, color = stroke }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        d="M3 12s3.4-6.5 9-6.5S21 12 21 12s-3.4 6.5-9 6.5S3 12 3 12Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={2.4} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function EyeOffIcon({ size = 24, color = stroke }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path d="M4 5.2 19.8 21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M9.4 6.1A9.6 9.6 0 0 1 12 5.5C17.6 5.5 21 12 21 12a14 14 0 0 1-3.2 3.9M6.3 8.4A14 14 0 0 0 3 12s3.4 6.5 9 6.5c1.1 0 2.1-.2 3-.6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SpadeMark({ size = 36, color = artStyle.colors.goldBright }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" accessibilityElementsHidden>
      <Path
        d="M16 3.2c-4.8 5.4-10.6 9.8-10.6 15.1 0 3.5 2.4 6.1 5.6 6.1 1.7 0 3.2-.8 4.2-2v5.4h1.6V22.4c1 .12 2.5 2 4.2 2 3.2 0 5.6-2.6 5.6-6.1C26.6 13 20.8 8.6 16 3.2Z"
        fill={color}
      />
    </Svg>
  );
}

export function GoogleMark({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" accessibilityElementsHidden>
      <Path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <Path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <Path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 0 1 3.69 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33Z"
      />
      <Path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </Svg>
  );
}

export function AppleMark({ size = 28, color = artStyle.colors.projectorBlack }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        fill={color}
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83ZM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"
      />
    </Svg>
  );
}

/** Blue disc + white f — readable on cream social pills. */
export function FacebookMark({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Circle cx={12} cy={12} r={11} fill="#1877F2" />
      <Path
        fill="#FFFFFF"
        d="M13.4 20.1v-7.2h2.4l.4-2.8h-2.8V8.4c0-.8.3-1.4 1.5-1.4h1.4V4.5c-.2 0-1.1-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8.1v2.8h2.3v7.2h3Z"
      />
    </Svg>
  );
}
