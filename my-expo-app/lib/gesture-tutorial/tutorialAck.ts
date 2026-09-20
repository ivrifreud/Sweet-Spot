import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'sweetspot.templateTutorialSeen.';

export function tutorialSeenKey(templateId: string): string {
  return `${KEY_PREFIX}${templateId}`;
}

export async function hasSeenTemplateTutorial(templateId: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(tutorialSeenKey(templateId))) !== null;
  } catch {
    return false;
  }
}

export async function markTemplateTutorialSeen(templateId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(tutorialSeenKey(templateId), new Date().toISOString());
  } catch {
    // A storage failure must not trap the player on the tutorial.
  }
}
