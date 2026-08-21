import { Button } from 'react-native';
import { signInWithGoogle } from '../lib/auth';

export function GoogleSignInButton() {
  return <Button title="Continue with Google" onPress={() => signInWithGoogle().catch(console.error)} />;
}