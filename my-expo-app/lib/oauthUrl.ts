export function requireOAuthUrl(url: string | null | undefined): string {
  if (!url) {
    throw new Error('Could not start Google sign-in');
  }
  return url;
}
