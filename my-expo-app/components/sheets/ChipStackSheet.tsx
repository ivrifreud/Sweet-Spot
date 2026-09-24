import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatRegenCountdown } from '../../lib/chip-stack/model';
import { artStyle } from '../../theme/artStyle';
import { LifeChips } from '../track/LifeChips';
import { ParchmentSheet } from './ParchmentSheet';

type Props = {
  visible: boolean;
  chips: number;
  regenAt: string | null;
  now?: Date;
  onClose: () => void;
};

function pressPlaceholder() {
  // Premium rebuy stays a placeholder this sprint.
}

export function ChipStackSheet({
  visible,
  chips,
  regenAt,
  now = new Date(),
  onClose,
}: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const countdown =
    chips < 3 && regenAt ? formatRegenCountdown(regenAt, now) : null;

  return (
    <ParchmentSheet visible={visible} title="CHIP STACK" onClose={onClose}>
      <View style={styles.row}>
        <LifeChips remaining={chips} size={34} />
      </View>
      <Text style={styles.copy}>
        Three poker chips gate standard stages. A miss burns one. The Daily Challenge never
        spends them.
      </Text>
      {countdown ? (
        <Text style={[styles.timer, display]} accessibilityLiveRegion="polite">
          FULL STACK IN {countdown.toUpperCase()}
        </Text>
      ) : (
        <Text style={styles.copy}>Tray is topped up.</Text>
      )}
      <Pressable
        onPress={pressPlaceholder}
        style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Buy the stack, coming soon">
        <Text style={[styles.buttonText, display]}>BUY THE STACK</Text>
      </Pressable>
    </ParchmentSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  copy: {
    color: 'rgba(23,23,19,0.82)',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  timer: {
    color: artStyle.colors.oxblood,
    fontSize: 20,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  button: {
    marginTop: 4,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: artStyle.colors.projectorBlack,
    backgroundColor: artStyle.colors.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: artStyle.colors.projectorBlack,
    fontSize: 18,
    letterSpacing: 1.4,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.97 }],
  },
});
