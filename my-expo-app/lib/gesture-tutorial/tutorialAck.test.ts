import { describe, expect, it } from 'vitest';

import { tutorialSeenKey } from './tutorialAck';

describe('tutorialSeenKey', () => {
  it('scopes the acknowledgement to the template', () => {
    expect(tutorialSeenKey('peek-and-pitch')).toBe(
      'sweetspot.templateTutorialSeen.peek-and-pitch'
    );
    expect(tutorialSeenKey('equity-scale')).not.toBe(tutorialSeenKey('peek-and-pitch'));
  });
});
