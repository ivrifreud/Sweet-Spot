/**
 * Sweet Spot visual direction — keep every screen consistent with this.
 * Character reference image:
 *   assets/brand/artstyle/characters-old-cartoon-hero.png
 */
export const artStyle = {
  name: 'Old-school cartoon',
  summary:
    'Classic American cartoon energy (thick ink outlines, simple shapes, soft limited shading). Not modern Disney/Pixar gloss.',
  characters: {
    vibe: 'Wholesome nerdy poker students — clear glasses, sweater vest, big expressive faces.',
    referenceImage: require('../assets/brand/artstyle/characters-old-cartoon-hero.png'),
  },
  colors: {
    teal: '#0B6B6E',
    tealNeon: '#1AD1C7',
    gold: '#D4A017',
    goldBright: '#F0C84A',
    night: '#050B14',
    ink: '#F7F1E3',
    chipRed: '#C62828',
    chipCream: '#F5E6C8',
  },
  motion: {
    feel: 'Snappy classic cartoon timing — readable squash/stretch, not hyper-real physics.',
  },
} as const;
