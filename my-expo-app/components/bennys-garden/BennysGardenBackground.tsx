import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useCallback, useState } from 'react';

import type { LightingMode } from '../../theme/bennysGarden';
import { resolveGardenTheme } from '../../theme/bennysGarden';
import { GardenLayer } from './layers/GardenLayer';
import { LightingLayer } from './layers/LightingLayer';
import { PlayerHandsLayer } from './layers/PlayerHandsLayer';
import { PropsLayer } from './layers/PropsLayer';
import { SkyLayer } from './layers/SkyLayer';
import { TableLayer } from './layers/TableLayer';

type Props = {
  variantId: string;
  mode: LightingMode;
  /** Optional play area overlay for cards/chips. */
  children?: React.ReactNode;
};

export function BennysGardenBackground({ variantId, mode, children }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const theme = resolveGardenTheme(variantId, mode);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }, []);

  if (!theme) {
    return <View style={styles.root} onLayout={onLayout} />;
  }

  const { width, height } = size;
  const ready = width > 0 && height > 0;

  return (
    <View style={[styles.root, { backgroundColor: theme.palette.skyBottom }]} onLayout={onLayout}>
      {ready && (
        <>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <SkyLayer width={width} height={height} theme={theme} />
          </View>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <GardenLayer width={width} height={height} theme={theme} />
          </View>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <TableLayer width={width} height={height} theme={theme} />
          </View>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <PropsLayer width={width} height={height} theme={theme} />
          </View>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LightingLayer width={width} height={height} theme={theme} />
          </View>
          <View style={styles.playArea}>{children}</View>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <PlayerHandsLayer width={width} height={height} theme={theme} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  playArea: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: '48%',
    paddingBottom: '22%',
    paddingHorizontal: '8%',
    zIndex: 2,
  },
});
