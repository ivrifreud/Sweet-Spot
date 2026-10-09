import { StyleSheet, Text, View } from 'react-native';

import { artStyle } from '../../../../theme/artStyle';
import { useDisplayFont } from '../../../../theme/displayFont';
import type { SceneFrame } from './sceneLayout';
import type { SeatTagTone } from './seatTag';

const TONE_FILL: Record<SeatTagTone, string> = {
  idle: artStyle.colors.tagPaper,
  call: artStyle.colors.teal,
  raise: artStyle.colors.gold,
  fold: artStyle.colors.oxblood,
};

const TONE_INK: Record<SeatTagTone, string> = {
  idle: artStyle.colors.projectorBlack,
  call: artStyle.colors.cream,
  raise: artStyle.colors.projectorBlack,
  fold: artStyle.colors.cream,
};

type PlayerSeatTagProps = {
  frame: SceneFrame;
  /** Seat word. */
  banner: string;
  /** Stack. Omitted after a fold. */
  ribbon: string | null;
  /** Action. Omitted before the seat acts. */
  center: string | null;
  tone?: SeatTagTone;
  spoken: string;
};

function wash(hex: string, alpha: number) {
  const n = hex.replace('#', '');
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function textEm(text: string) {
  let em = 0;
  for (const char of text) {
    if (char === ' ') em += 0.34;
    else if ('iljt'.includes(char)) em += 0.46;
    else if ('mwMW'.includes(char)) em += 1.05;
    else em += 0.72;
  }
  return Math.max(1, em);
}

function wrapLabel(text: string, inner: number): string[] {
  if (Math.floor(inner / textEm(text)) >= 13) return [text];
  const words = text.split(' ');
  if (words.length < 2) return [text];
  if (words.length === 2) return words;
  return [words[0] ?? text, words.slice(1).join(' ')];
}

function labelFont(lines: string[], innerWidth: number, innerHeight: number) {
  let font = 15;
  for (const line of lines) font = Math.min(font, Math.floor(innerWidth / textEm(line)));
  if (lines.length * (font + 2) > innerHeight) font = Math.floor(innerHeight / lines.length) - 2;
  return Math.max(1, Math.min(15, font));
}

export function PlayerSeatTag({
  frame,
  banner,
  ribbon,
  center,
  tone = 'idle',
  spoken,
}: PlayerSeatTagProps) {
  const display = useDisplayFont();
  const fill = wash(TONE_FILL[tone], 0.84);
  const ink = TONE_INK[tone];
  const radius = frame.height / 2;
  const innerWidth = Math.max(8, frame.width - 28);
  const innerHeight = Math.max(8, frame.height - 16);
  const lines = [
    ...wrapLabel(banner, innerWidth),
    ...(center ? wrapLabel(center, innerWidth) : []),
    ...(ribbon ? [ribbon] : []),
  ];
  const fontSize = labelFont(lines, innerWidth, innerHeight);

  return (
    <View
      pointerEvents="none"
      accessibilityRole="text"
      accessibilityLabel={spoken}
      style={[
        styles.plate,
        {
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
          borderRadius: radius,
          backgroundColor: fill,
        },
      ]}>
      <View
        style={[
          styles.ring,
          {
            borderRadius: Math.max(0, radius - 4),
            borderColor: wash(ink, 0.55),
          },
        ]}>
        {lines.map((line, index) => (
          <Text
            key={`${index}-${line}`}
            allowFontScaling={false}
            numberOfLines={1}
            style={[styles.line, display, { color: ink, fontSize, lineHeight: fontSize + 2 }]}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    position: 'absolute',
    zIndex: 40,
    borderWidth: 2,
    borderColor: artStyle.colors.projectorBlack,
    padding: 3,
    shadowColor: artStyle.colors.projectorBlack,
    shadowOpacity: 0.4,
    shadowRadius: 0,
    shadowOffset: { width: 1, height: 2 },
    elevation: 3,
  },
  ring: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 8,
  },
  line: {
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});
