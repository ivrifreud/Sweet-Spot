import { describe, expect, it } from 'vitest';

import { requireOAuthUrl } from './oauthUrl';

describe('requireOAuthUrl', () => {
  it('throws when Google sign-in does not return a URL', () => {
    expect(() => requireOAuthUrl(undefined)).toThrow(/could not start google sign-in/i);
    expect(() => requireOAuthUrl(null)).toThrow(/could not start google sign-in/i);
    expect(() => requireOAuthUrl('')).toThrow(/could not start google sign-in/i);
  });

  it('returns the URL when sign-in provides one', () => {
    expect(requireOAuthUrl('https://accounts.google.com/o/oauth2')).toBe(
      'https://accounts.google.com/o/oauth2'
    );
  });
});
