import { Image, type ImageStyle, type StyleProp } from 'react-native';

import { CHIP_3Q_ASPECT, CHIP_FACE_ASPECT, chipArt } from '../../../../../theme/chipArt';

export type ChipView = 'face' | 'threeQuarter';

type ChipSpriteProps = {
  /** Chip diameter in px. */
  size: number;
  view?: ChipView;
  rotate?: number;
  style?: StyleProp<ImageStyle>;
};

/** One chip from the shared sprite set. Callers draw their own contact shadow. */
export function ChipSprite({ size, view = 'face', rotate = 0, style }: ChipSpriteProps) {
  const aspect = view === 'face' ? CHIP_FACE_ASPECT : CHIP_3Q_ASPECT;

  return (
    <Image
      source={view === 'face' ? chipArt.face : chipArt.threeQuarter}
      resizeMode="contain"
      style={[
        { width: size, height: size * aspect },
        rotate ? { transform: [{ rotate: `${rotate}deg` }] } : null,
        style,
      ]}
      accessibilityElementsHidden
    />
  );
}
