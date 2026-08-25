/**
 * Sweet Spot visual direction — keep every screen consistent with this.
 * Full source of truth: docs/art-style-guide.md
 */
export const artStyle = {
  name: '1930s rubber-hose cartoon',
  summary:
    'Hand-inked pie eyes, white gloves, rubber-hose limbs, flat cel paint, film grain, and a muted vintage casino palette.',
  characters: {
    vibe: 'Wholesome 1930s poker nerds — pie eyes, clear glasses, four-digit animation gloves (circle palm, exaggerated thumb, three sausage fingers), curved hose limbs, expressive title-card poses.',
    referenceImage: require('../assets/brand/artstyle/characters-1930s-approved-opener.png'),
  },
  chips: {
    vibe: 'Realistic thick 3D casino chip — dark teal, gold edge inserts, beveled spade center.',
    referenceImage: require('../assets/brand/artstyle/casino-chip-3d-reference.png'),
    exception:
      'Approved tactile 3D exception for reward physics; it does not define character or environment rendering.',
  },
  colors: {
    projectorBlack: '#111714',
    teal: '#0B5F5D',
    tealFaded: '#4F8580',
    gold: '#C89B3C',
    goldBright: '#E6C46A',
    cream: '#E8D7A7',
    tobacco: '#765337',
    oxblood: '#A43E32',
    feltGreen: '#4D8A5B',
  },
  motion: {
    character:
      'Strong key poses on 2s with anticipation, arcs, squash/stretch, one overshoot, and a held settle.',
    physics:
      'Physical props may use credible acceleration; the falling-chip effect uses distance proportional to time squared.',
  },
} as const;
