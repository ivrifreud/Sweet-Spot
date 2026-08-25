import { describe, expect, it } from 'vitest';

import { placementSeenKey } from './placementAck';

describe('placementSeenKey', () => {
  it('scopes the acknowledgement to the signed-in user', () => {
    expect(placementSeenKey('user-a')).toBe('sweetspot.placementSeen.user-a');
    expect(placementSeenKey('user-b')).not.toBe(placementSeenKey('user-a'));
  });
});
