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
  scale: {
    body: require('../../../../assets/tables/equity-scale/scale-body-slot.png'),
  },
  scaleFrames: [
    require('../../../../assets/tables/equity-scale/scale-frame-l28.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l26.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l24.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l22.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l20.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l18.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l16.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l14.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l12.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l10.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l08.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l06.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l04.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-l02.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-000.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r02.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r04.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r06.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r08.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r10.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r12.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r14.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r16.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r18.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r20.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r22.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r24.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r26.png'),
    require('../../../../assets/tables/equity-scale/scale-frame-r28.png'),
  ],
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
