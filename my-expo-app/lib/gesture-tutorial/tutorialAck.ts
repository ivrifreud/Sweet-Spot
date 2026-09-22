import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'sweetspot.templateTutorialSeen.';
const seenThisSession = new Set<string>();

export function tutorialSeenKey(templateId: string): string {
  // Bump when the scale coach should play once more after an earlier finish was saved.
  const revision = templateId === 'equity-scale' ? 'v3.' : '';
  return `${KEY_PREFIX}${revision}${templateId}`;
}

export async function hasSeenTemplateTutorial(templateId: string): Promise<boolean> {
  const key = tutorialSeenKey(templateId);
  if (seenThisSession.has(key)) {
    return true;
  }
  try {
    const seen = (await AsyncStorage.getItem(key)) !== null;
    if (seen) {
      seenThisSession.add(key);
    }
    return seen;
  } catch {
    return false;
  }
}

export async function markTemplateTutorialSeen(templateId: string): Promise<void> {
  seenThisSession.add(tutorialSeenKey(templateId));
  try {
    await AsyncStorage.setItem(tutorialSeenKey(templateId), new Date().toISOString());
  } catch {
    // A storage failure must not trap the player on the tutorial.
  }
}
