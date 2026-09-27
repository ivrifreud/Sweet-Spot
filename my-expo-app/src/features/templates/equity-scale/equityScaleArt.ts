/**
 * World tables, the bronze rotary dial disc, and matching medallion CTAs.
 */
import type { AudioWorldId } from '../../../../lib/audio';
import type { EquityWorldSkin } from './types';

export const equityScaleArt = {
  backgrounds: {
    garden: require('../../../../assets/tables/equity-scale/scene-background-garden.jpeg'),
    casino: require('../../../../assets/tables/equity-scale/scene-background-casino.jpeg'),
    vip: require('../../../../assets/tables/equity-scale/scene-background-vip.jpeg'),
  },
  /** Live rig layers cut by scripts/cut-scale-rig.py; placement in scaleRigLayout.generated.ts. */
  scale: {
    body: require('../../../../assets/tables/equity-scale/scale-rig-body.png'),
    hoseLeft: require('../../../../assets/tables/equity-scale/scale-rig-hose-left.png'),
    hoseRight: require('../../../../assets/tables/equity-scale/scale-rig-hose-right.png'),
    panLeft: require('../../../../assets/tables/equity-scale/scale-rig-pan-left.png'),
    panRight: require('../../../../assets/tables/equity-scale/scale-rig-pan-right.png'),
  },
  dialHand: {
    pinchBack: require('../../../../assets/tables/equity-scale/dial-hand-pinch-back.png'),
    pinchFront: require('../../../../assets/tables/equity-scale/dial-hand-pinch-front.png'),
  },
  dial: require('../../../../assets/tables/equity-scale/rotary-dial.png'),
  buttons: {
    lockIn: require('../../../../assets/tables/equity-scale/button-lock-in.png'),
    call: require('../../../../assets/tables/equity-scale/button-call.png'),
    fold: require('../../../../assets/tables/equity-scale/button-fold.png'),
  },
} as const;

export function backgroundForSkin(skin: EquityWorldSkin) {
  return equityScaleArt.backgrounds[skin];
}

export function ambienceForSkin(skin: EquityWorldSkin): AudioWorldId {
  if (skin === 'casino') return 'local-casino';
  if (skin === 'vip') return 'vip-room';
  return 'bennys-garden';
}
