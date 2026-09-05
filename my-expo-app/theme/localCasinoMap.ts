/**
 * Local Casino (World 2) map palette — outdoor daytime desert town.
 * Canonical UI tokens come from artStyle; desert-only scenery hex lives here.
 * Full art contract: docs/art-style-guide.md and assets/themes/local-casino/ASSET-SPEC.md
 */
import { artStyle } from './artStyle';

const { cream, projectorBlack, tobacco, teal, oxblood, feltGreen, gold, goldBright } =
  artStyle.colors;

export const localCasinoMapTheme = {
  name: 'A Local Casino',
  treatment: 'daytime' as const,
  colors: {
    cream,
    projectorBlack,
    tobacco,
    teal,
    oxblood,
    feltGreen,
    gold,
    goldBright,
    ink: '#171713',
    dustSand: '#C7A56A',
    sunbakedOchre: '#B36A3C',
    dustRose: '#925447',
    sageCactus: '#68734F',
  },
  roles: {
    terrain: 'dustSand' as const,
    adobe: 'sunbakedOchre' as const,
    facade: 'dustRose' as const,
    vegetation: 'sageCactus' as const,
    wood: 'tobacco' as const,
    ink: 'ink' as const,
    highlight: 'cream' as const,
    void: 'projectorBlack' as const,
    casinoTrim: 'teal' as const,
    progression: 'feltGreen' as const,
    lock: 'oxblood' as const,
    labelOnInk: 'cream' as const,
    labelOnWood: 'gold' as const,
  },
  /** Casino Teal may cover at most this fraction of a map image. */
  maxTealCoverage: 0.03,
  film: {
    grainOpacity: 0.04,
    dustOpacity: 0.02,
    maxFlicker: 0.02,
  },
} as const;

export type LocalCasinoMapTheme = typeof localCasinoMapTheme;
