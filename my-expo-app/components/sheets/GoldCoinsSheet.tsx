import { Image, StyleSheet, Text, View } from 'react-native';

import { artStyle } from '../../theme/artStyle';
import { ParchmentSheet } from './ParchmentSheet';

const GOLD_BARS = require('../../assets/brand/hud/gold-bars-icon.jpg');

type Props = {
  visible: boolean;
  goldCoins: number;
  onClose: () => void;
};

export function GoldCoinsSheet({ visible, goldCoins, onClose }: Props) {
  return (
    <ParchmentSheet visible={visible} title="GOLD COINS" onClose={onClose}>
      <View style={styles.hero}>
        <Image source={GOLD_BARS} style={styles.icon} resizeMode="cover" />
      </View>
      <Text style={styles.amount} accessibilityRole="text">
        {goldCoins}
      </Text>
      <Text style={styles.copy}>
        Gold Coins come from the Daily Challenge. Spend them later on Chip Rebuys and cosmetics.
        The Daily Challenge is coming soon — your balance stays ready.
      </Text>
    </ParchmentSheet>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: artStyle.colors.projectorBlack,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    color: artStyle.colors.projectorBlack,
  },
  copy: {
    color: 'rgba(23,23,19,0.82)',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
});
