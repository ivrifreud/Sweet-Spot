import { StyleSheet, Text, View } from 'react-native';

type Props = {
  count: number;
};

const CHIP_COLORS = ['#0B5F5D', '#A43E32', '#E8D7A7', '#171713'];

export function ChipStack({ count }: Props) {
  const visibleChips = Math.max(1, Math.min(8, Math.ceil(count / 10)));

  return (
    <View accessibilityLabel={`${count} chips`} style={styles.container}>
      <View style={styles.stack}>
        {Array.from({ length: visibleChips }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.chip,
              {
                bottom: index * 5,
                backgroundColor: CHIP_COLORS[index % CHIP_COLORS.length],
              },
            ]}>
            <View style={styles.chipInset} />
          </View>
        ))}
      </View>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 68,
  },
  stack: {
    width: 48,
    height: 60,
  },
  chip: {
    position: 'absolute',
    left: 3,
    width: 42,
    height: 14,
    borderRadius: 21,
    borderColor: '#171713',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipInset: {
    width: 21,
    height: 7,
    borderRadius: 11,
    borderColor: '#C89B3C',
    borderWidth: 1.5,
  },
  countBadge: {
    minWidth: 48,
    marginTop: 2,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    borderColor: '#C89B3C',
    borderWidth: 1.5,
    backgroundColor: 'rgba(17, 23, 20, 0.88)',
  },
  countText: {
    color: '#E8D7A7',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
