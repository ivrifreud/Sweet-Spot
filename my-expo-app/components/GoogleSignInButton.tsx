import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { authErrorMessage, signInWithGoogle } from '../lib/auth';
import { artStyle } from '../theme/artStyle';
import { GoogleMark } from './auth/AuthIcons';

type Props = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function GoogleSignInButton({ onSuccess, onError, disabled }: Props) {
  const [busy, setBusy] = useState(false);

  return (
    <SocialAuthButton
      label="Continue with Google"
      icon={<GoogleMark size={22} />}
      disabled={disabled}
      busy={busy}
      onPress={() => {
        setBusy(true);
        signInWithGoogle()
          .then(() => onSuccess?.())
          .catch((error) => onError?.(authErrorMessage(error)))
          .finally(() => setBusy(false));
      }}
    />
  );
}

type ChromeProps = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
};

/**
 * Cream chrome lives on an inner View, not Pressable.
 * Tailwind Preflight resets native-web <button> backgrounds to transparent,
 * which made black labels vanish into the dark splash art.
 */
function SocialAuthButton({ label, icon, onPress, disabled, busy }: ChromeProps) {
  return (
    <View style={styles.slot}>
      <Pressable
        disabled={disabled || busy}
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && !busy ? styles.pressed : null,
          disabled || busy ? styles.disabled : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: disabled || busy, busy: Boolean(busy) }}>
        <View style={styles.chrome}>
          {busy ? (
            <ActivityIndicator color={artStyle.colors.projectorBlack} />
          ) : (
            <View style={styles.row}>
              <View style={styles.icon}>{icon}</View>
              <Text style={styles.label}>{label}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    marginBottom: 14,
  },
  pressable: {
    width: '100%',
  },
  chrome: {
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: '#E8D7A7',
    borderWidth: 2,
    borderColor: '#E6C46A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: '#111714',
    fontSize: 15,
    fontWeight: '700',
  },
});
