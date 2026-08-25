import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'sweetspot.placementSeen.';

export function placementSeenKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

/**
 * The level reveal is a one-time moment. Once the player moves past it, they
 * never land back on it — including after a restart — so the acknowledgement is
 * stored on the device rather than kept in component state.
 */
export async function hasSeenPlacement(userId: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(placementSeenKey(userId))) !== null;
  } catch {
    // Treat unreadable storage as a first view rather than blocking the flow.
    return false;
  }
}

export async function markPlacementSeen(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(placementSeenKey(userId), new Date().toISOString());
  } catch {
    // A storage failure must not stop the player from moving on.
  }
}
