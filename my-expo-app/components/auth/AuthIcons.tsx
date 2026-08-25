import { StyleSheet, Text, View } from 'react-native';

import { artStyle } from '../../theme/artStyle';

type IconProps = {
  size?: number;
  color?: string;
};

const defaultColor = artStyle.colors.cream;

function TextIcon({
  glyph,
  size,
  color,
  weight = '600',
}: IconProps & { glyph: string; weight?: '500' | '600' | '700' | '800' }) {
  return (
    <View
      style={[styles.iconBox, { width: size, height: size }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Text style={[styles.glyph, { color, fontSize: size, lineHeight: size, fontWeight: weight }]}>
        {glyph}
      </Text>
    </View>
  );
}

export function EnvelopeIcon({ size = 26, color = defaultColor }: IconProps) {
  return <TextIcon glyph="✉" size={size} color={color} />;
}

export function PersonIcon({ size = 26, color = defaultColor }: IconProps) {
  return <TextIcon glyph="♙" size={size} color={color} />;
}

export function LockIcon({ size = 26, color = defaultColor }: IconProps) {
  return <TextIcon glyph="●" size={size * 0.62} color={color} />;
}

export function EyeIcon({ size = 24, color = defaultColor }: IconProps) {
  return <TextIcon glyph="◉" size={size} color={color} />;
}

export function EyeOffIcon({ size = 24, color = defaultColor }: IconProps) {
  return (
    <View
      style={[styles.iconBox, { width: size, height: size }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Text style={[styles.glyph, { color, fontSize: size, lineHeight: size }]}>◉</Text>
      <View
        style={[
          styles.slash,
          {
            width: size * 1.08,
            backgroundColor: color,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
    </View>
  );
}

export function SpadeMark({ size = 36, color = artStyle.colors.goldBright }: IconProps) {
  return <TextIcon glyph="♠" size={size} color={color} weight="800" />;
}

export function GoogleMark({ size = 28 }: { size?: number }) {
  return (
    <View
      style={[styles.google, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Text
        style={[
          styles.googleText,
          {
            fontSize: size * 0.68,
            lineHeight: size,
          },
        ]}>
        G
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  slash: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  google: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(17,23,20,0.18)',
  },
  googleText: {
    color: '#4285F4',
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
