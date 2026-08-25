import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GoogleSignInButton, PlaceholderSocialButton } from '../components/GoogleSignInButton';
import { EnvelopeIcon, LockIcon, PersonIcon, SpadeMark } from '../components/auth/AuthIcons';
import { AuthTextField } from '../components/auth/AuthTextField';
import { FallingChips } from '../components/splash/FallingChips';
import { authErrorMessage, signInWithEmail, signUpWithEmail } from '../lib/auth';
import { artStyle } from '../theme/artStyle';

type Mode = 'signUp' | 'signIn';

type FieldErrors = {
  email?: string;
  username?: string;
  password?: string;
  confirm?: string;
};

type Props = {
  onContinue: () => void;
};

export function AuthScreen({ onContinue }: Props) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const [mode, setMode] = useState<Mode>('signUp');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const isSignUp = mode === 'signUp';

  function switchMode(next: Mode) {
    setMode(next);
    setFieldErrors({});
    setFormError(null);
    setInfo(null);
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!email.trim() || !email.includes('@')) {
      next.email = 'Enter a valid email address.';
    }
    if (isSignUp && username.trim().length < 2) {
      next.username = 'Username needs at least 2 characters.';
    }
    if (password.length < 6) {
      next.password = 'Password needs at least 6 characters.';
    }
    if (isSignUp && confirm !== password) {
      next.confirm = 'Passwords do not match.';
    }
    return next;
  }

  async function submit() {
    const nextErrors = validate();
    setFieldErrors(nextErrors);
    setInfo(null);

    if (Object.keys(nextErrors).length > 0) {
      setFormError('There is a problem with the form.');
      return;
    }

    setFormError(null);
    setBusy(true);
    try {
      if (isSignUp) {
        const result = await signUpWithEmail({ email, password, username });
        if (result.needsEmailConfirm) {
          setInfo('Check your email to confirm the account, then sign in.');
          setMode('signIn');
          return;
        }
      } else {
        await signInWithEmail(email, password);
      }
      onContinue();
    } catch (error) {
      setFormError(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ImageBackground
      source={require('../assets/brand/splash-opener-approved.jpg')}
      style={styles.root}
      resizeMode="cover">
      <LinearGradient
        colors={['rgba(17,23,20,0.42)', 'rgba(17,23,20,0.82)', 'rgba(17,23,20,0.95)']}
        locations={[0, 0.28, 1]}
        style={StyleSheet.absoluteFill}
      />
      <FallingChips count={8} minSize={36} baseDuration={4200} zIndex={1} />

      <KeyboardAvoidingView
        style={styles.formLayer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <View style={styles.markWrap}>
            <SpadeMark size={28} />
          </View>
          <Text style={[styles.wordmark, display]}>SWEET SPOT</Text>
          <Text style={[styles.title, display]}>
            {isSignUp ? 'YOUR JOURNEY STARTS HERE' : 'WELCOME BACK'}
          </Text>
          <Text style={styles.sub}>
            {isSignUp ? 'Take the first step at the table.' : 'Sign in to keep training.'}
          </Text>

          {formError ? (
            <View
              accessible
              accessibilityRole="alert"
              accessibilityLabel={formError}
              style={styles.errorSummary}>
              <Text style={styles.errorSummaryText}>{formError}</Text>
            </View>
          ) : null}
          {info ? (
            <Text style={styles.info} accessibilityLiveRegion="polite">
              {info}
            </Text>
          ) : null}

          <View style={styles.formBlock}>
          <AuthTextField
            label="Email"
            icon={<EnvelopeIcon size={22} />}
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            error={fieldErrors.email}
            editable={!busy}
          />

          {isSignUp ? (
            <AuthTextField
              label="Username"
              icon={<PersonIcon size={22} />}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
              error={fieldErrors.username}
              editable={!busy}
            />
          ) : null}

          <AuthTextField
            label="Password"
            icon={<LockIcon size={22} />}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            password
            passwordVisible={passwordVisible}
            onTogglePassword={() => setPasswordVisible((value) => !value)}
            autoComplete={isSignUp ? 'password-new' : 'password'}
            textContentType={isSignUp ? 'newPassword' : 'password'}
            returnKeyType={isSignUp ? 'next' : 'go'}
            onSubmitEditing={isSignUp ? undefined : () => void submit()}
            error={fieldErrors.password}
            editable={!busy}
          />

          {isSignUp ? (
            <AuthTextField
              label="Confirm password"
              icon={<LockIcon size={22} />}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Confirm password"
              password
              passwordVisible={confirmVisible}
              onTogglePassword={() => setConfirmVisible((value) => !value)}
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={() => void submit()}
              error={fieldErrors.confirm}
              editable={!busy}
            />
          ) : null}
          </View>

          <View style={styles.primaryBlock}>
          <Pressable
            onPress={() => void submit()}
            disabled={busy}
            style={({ pressed }) => [
              styles.primaryPressable,
              pressed && !busy ? styles.pressed : null,
              busy ? styles.disabled : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={isSignUp ? 'Sign up' : 'Sign in'}
            accessibilityState={{ disabled: busy, busy }}>
            <View style={styles.primaryChrome}>
              {busy ? (
                <ActivityIndicator color={artStyle.colors.projectorBlack} />
              ) : (
                <Text style={[styles.primaryText, display]}>
                  {isSignUp ? 'SIGN UP' : 'SIGN IN'}
                </Text>
              )}
            </View>
          </Pressable>
          </View>

          <View style={styles.orRow} accessibilityRole="none">
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialStack}>
            <GoogleSignInButton
              disabled={busy}
              onSuccess={onContinue}
              onError={(message) => {
                setInfo(null);
                setFormError(message);
              }}
            />
            <PlaceholderSocialButton
              provider="Apple"
              disabled={busy}
              onPress={() => {
                setFormError(null);
                setInfo('Apple sign-in is coming soon.');
              }}
            />
            <PlaceholderSocialButton
              provider="Facebook"
              disabled={busy}
              onPress={() => {
                setFormError(null);
                setInfo('Facebook sign-in is coming soon.');
              }}
            />
          </View>

          <View style={styles.footerDivider} />

          <View style={styles.footerBlock}>
          <Pressable
            onPress={() => switchMode(isSignUp ? 'signIn' : 'signUp')}
            hitSlop={12}
            style={({ pressed }) => [styles.footerPressable, pressed ? styles.footerPressed : null]}
            accessibilityRole="button"
            accessibilityLabel={
              isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'
            }>
            <Text style={styles.footerMuted}>
              {isSignUp ? 'Already have an account? ' : 'Need an account? '}
              <Text style={styles.footerLink}>{isSignUp ? 'Sign in' : 'Sign up'}</Text>
            </Text>
          </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  flex: {
    flex: 1,
  },
  formLayer: {
    flex: 1,
    zIndex: 2,
  },
  socialStack: {
    marginBottom: 0,
  },
  formBlock: {
    marginBottom: 8,
  },
  primaryBlock: {
    marginTop: 6,
    marginBottom: 4,
  },
  footerBlock: {
    marginTop: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(232,215,167,0.28)',
    marginTop: 28,
    marginHorizontal: 12,
  },
  content: {
    paddingHorizontal: 28,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  markWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  wordmark: {
    color: artStyle.colors.goldBright,
    fontSize: 18,
    letterSpacing: 3.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    color: artStyle.colors.cream,
    fontSize: 26,
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 30,
  },
  sub: {
    color: 'rgba(232,215,167,0.82)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
  },
  errorSummary: {
    backgroundColor: 'rgba(164,62,50,0.18)',
    borderColor: artStyle.colors.oxblood,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  errorSummaryText: {
    color: artStyle.colors.cream,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  info: {
    color: artStyle.colors.goldBright,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  primaryPressable: {
    width: '100%',
  },
  primaryChrome: {
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: '#E6C46A',
    borderWidth: 2,
    borderColor: '#E8D7A7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primaryText: {
    color: '#111714',
    fontSize: 20,
    letterSpacing: 2,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.65,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    columnGap: 12,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(232,215,167,0.35)',
  },
  orText: {
    color: 'rgba(232,215,167,0.7)',
    fontSize: 13,
  },
  footerPressable: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  footerPressed: {
    opacity: 0.75,
  },
  footerMuted: {
    color: '#E8D7A7',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  footerLink: {
    color: '#E6C46A',
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
});
