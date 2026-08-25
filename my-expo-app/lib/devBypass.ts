/** Dev-only credentials for bypassing Supabase auth during local demos. */
export const DEV_BYPASS_USERNAME = 'guy';
export const DEV_BYPASS_PASSWORD = '000';
export const DEV_BYPASS_USER_ID = '00000000-0000-4000-8000-dev00000001';

export function canUseDevBypass(): boolean {
  return __DEV__;
}

export function isDevBypassCredentials(identifier: string, password: string): boolean {
  if (!canUseDevBypass()) return false;
  return identifier.trim().toLowerCase() === DEV_BYPASS_USERNAME && password === DEV_BYPASS_PASSWORD;
}
