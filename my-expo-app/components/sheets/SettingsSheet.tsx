import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { isMuted, setMuted } from '../../lib/audio';
import { artStyle } from '../../theme/artStyle';
import { ParchmentSheet } from './ParchmentSheet';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onRetakePlacement?: () => void;
  /** Preview fog parting + camera climb on the map. */
  onFogUp?: () => void;
  /** Preview the out-of-chips lockout card. */
  onPreviewLockout?: () => void;
  /** Toggle Garden / Casino map preview (dev bypass). */
  onCycleWorld?: () => void;
  worldCycleLabel?: string;
};

export function SettingsSheet({
  visible,
  onClose,
  onSignOut,
  onRetakePlacement,
  onFogUp,
  onPreviewLockout,
  onCycleWorld,
  worldCycleLabel,
}: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const [muted, setMutedState] = useState(isMuted());
  const [hapticsOn, setHapticsOn] = useState(true);

  useEffect(() => {
    if (visible) setMutedState(isMuted());
  }, [visible]);

  function confirmRetake() {
    Alert.alert(
      'Retake Placement Test?',
      'This sends you back through calibration. Your Chip Stack and Gold Coins stay put.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retake',
          style: 'destructive',
          onPress: () => {
            onClose();
            onRetakePlacement?.();
          },
        },
      ]
    );
  }

  function runAndClose(action?: () => void) {
    onClose();
    action?.();
  }

  return (
    <ParchmentSheet visible={visible} title="SETTINGS" onClose={onClose}>
      <View style={styles.row}>
        <Text style={styles.label}>Sound</Text>
        <Switch
          value={!muted}
          onValueChange={(on) => {
            const nextMuted = !on;
            setMutedState(nextMuted);
            void setMuted(nextMuted);
          }}
          accessibilityLabel="Toggle sound"
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Haptics</Text>
        <Switch
          value={hapticsOn}
          onValueChange={setHapticsOn}
          accessibilityLabel="Toggle haptics"
        />
      </View>

      {onFogUp ? (
        <Pressable
          onPress={() => runAndClose(onFogUp)}
          style={({ pressed }) => [styles.button, styles.secondary, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Fog up, preview fog and camera climb">
          <Text style={[styles.buttonTextDark, display]}>FOG UP</Text>
        </Pressable>
      ) : null}

      {onPreviewLockout ? (
        <Pressable
          onPress={() => runAndClose(onPreviewLockout)}
          style={({ pressed }) => [styles.button, styles.secondary, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Preview chip lockout">
          <Text style={[styles.buttonTextDark, display]}>LOCKOUT</Text>
        </Pressable>
      ) : null}

      {onCycleWorld ? (
        <Pressable
          onPress={() => runAndClose(onCycleWorld)}
          style={({ pressed }) => [styles.button, styles.secondary, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={
            worldCycleLabel === 'GARDEN'
              ? "Switch preview to Benny's Garden"
              : 'Switch preview to A Local Casino'
          }>
          <Text style={[styles.buttonTextDark, display]}>
            {worldCycleLabel ?? 'CASINO / GARDEN'}
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={confirmRetake}
        style={({ pressed }) => [styles.button, styles.secondary, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Retake placement test">
        <Text style={[styles.buttonTextDark, display]}>RETAKE PLACEMENT</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          onClose();
          onSignOut();
        }}
        style={({ pressed }) => [styles.button, styles.danger, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Sign out">
        <Text style={[styles.buttonText, display]}>SIGN OUT</Text>
      </Pressable>
      <Text style={styles.version}>Sweet Spot</Text>
    </ParchmentSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: artStyle.colors.tobacco,
    backgroundColor: 'rgba(232,215,167,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    color: artStyle.colors.projectorBlack,
    fontSize: 16,
  },
  button: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: artStyle.colors.projectorBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: artStyle.colors.goldBright,
  },
  danger: {
    backgroundColor: artStyle.colors.oxblood,
  },
  buttonText: {
    color: artStyle.colors.cream,
    fontSize: 17,
    letterSpacing: 1.2,
  },
  buttonTextDark: {
    color: artStyle.colors.projectorBlack,
    fontSize: 17,
    letterSpacing: 1.2,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.97 }],
  },
  version: {
    textAlign: 'center',
    color: 'rgba(23,23,19,0.55)',
    fontSize: 12,
    marginTop: 4,
  },
});
