import { StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { BEAM_SVG, LYRE_SVG, PLATE_SVG, SCALE_RIG, STAND_SVG } from './scaleRigArt';

const { frame, beam, plate } = SCALE_RIG;

/** Brass lyre. Render behind the beam. */
export function ScaleLyre() {
  return <SvgXml xml={LYRE_SVG} style={styles.frame} width={frame.width} height={frame.height} />;
}

/** Plinth, column, and pivot screw. Render in front of the beam so the column hides its hump. */
export function ScaleStand() {
  return <SvgXml xml={STAND_SVG} style={styles.frame} width={frame.width} height={frame.height} />;
}

/** Beam arms and end posts. Belongs inside the tilting group. */
export function ScaleBeam() {
  return <SvgXml xml={BEAM_SVG} style={styles.fill} width={beam.width} height={beam.height} />;
}

/** One hovering dish. Belongs inside the level-keeping group above an end post. */
export function ScalePlate() {
  return <SvgXml xml={PLATE_SVG} style={styles.fill} width={plate.width} height={plate.height} />;
}

const styles = StyleSheet.create({
  frame: {
    position: 'absolute',
    left: frame.left,
    top: frame.top,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
