import { type ReactNode, useId, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { artStyle } from '../../theme/artStyle';
import { EyeIcon, EyeOffIcon } from './AuthIcons';

type Props = {
  label: string;
  icon: ReactNode;
  error?: string;
  password?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
} & Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'keyboardType'
  | 'autoComplete'
  | 'textContentType'
  | 'autoCapitalize'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'editable'
>;

export function AuthTextField({
  label,
  icon,
  error,
  password = false,
  passwordVisible = false,
  onTogglePassword,
  ...inputProps
}: Props) {
  const errorId = useId();
  const [focused, setFocused] = useState(false);
  const invalid = Boolean(error);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.field,
          focused ? styles.fieldFocused : null,
          invalid ? styles.fieldInvalid : null,
        ]}>
        <View style={styles.icon} pointerEvents="none">
          {icon}
        </View>
        <TextInput
          {...inputProps}
          style={styles.input}
          placeholderTextColor="rgba(232,215,167,0.55)"
          secureTextEntry={password && !passwordVisible}
          autoCorrect={false}
          autoCapitalize={inputProps.autoCapitalize ?? 'none'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          accessibilityState={{ disabled: inputProps.editable === false }}
          accessibilityHint={error}
          aria-describedby={error ? errorId : undefined}
        />
        {password ? (
          <Pressable
            onPress={onTogglePassword}
            hitSlop={10}
            style={({ pressed }) => [styles.eye, pressed ? styles.eyePressed : null]}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}>
            {passwordVisible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text nativeID={errorId} style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  field: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(11,95,93,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(232,215,167,0.55)',
    paddingLeft: 14,
    paddingRight: 4,
  },
  fieldFocused: {
    borderColor: artStyle.colors.goldBright,
  },
  fieldInvalid: {
    borderColor: artStyle.colors.oxblood,
  },
  icon: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: artStyle.colors.cream,
    fontSize: 15,
    paddingVertical: 10,
  },
  eye: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePressed: {
    opacity: 0.7,
  },
  error: {
    marginTop: 4,
    marginLeft: 16,
    color: artStyle.colors.cream,
    fontSize: 12,
    lineHeight: 16,
  },
});
