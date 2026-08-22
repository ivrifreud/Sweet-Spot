import { ImageBackground, StyleSheet, View } from 'react-native';

import type { LightingMode } from '../../theme/bennysGarden';
import { resolveBennysGardenMode } from '../../theme/bennysGarden';

type Props = {
  mode: LightingMode;
  /** Cards, chips, and game UI render in this layer above the illustration. */
  children?: React.ReactNode;
};

export function BennysGardenBackground({ mode, children }: Props) {
  const resolved = resolveBennysGardenMode(mode);

  return (
    <View style={styles.root}>
      <ImageBackground
        source={resolved.background}
        style={styles.background}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel={`Benny's Garden background, ${mode} mode`}>
        <View style={styles.playArea}>{children}</View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111714',
  },
  background: {
    flex: 1,
  },
  playArea: {
    flex: 1,
    paddingTop: '42%',
    paddingBottom: '24%',
    paddingHorizontal: '10%',
  },
});
