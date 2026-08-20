import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Line, Path, Text as SvgText } from 'react-native-svg';

import type { CompanionMood } from '../../characters/types';

interface Props {
  size?: number;
  mood?: CompanionMood;
}

export function ChippyAvatar({ size = 180, mood = 'idle' }: Props) {
  const bob = useSharedValue(0);
  const spin = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 550, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 550, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    if (mood === 'celebrate' || mood === 'encourage') {
      spin.value = withRepeat(withTiming(360, { duration: 700, easing: Easing.linear }), -1, false);
      scale.value = withRepeat(
        withSequence(withTiming(1.08, { duration: 280 }), withTiming(1, { duration: 280 })),
        -1,
        true
      );
    } else if (mood === 'think') {
      spin.value = withRepeat(
        withSequence(withTiming(12, { duration: 400 }), withTiming(-12, { duration: 400 })),
        -1,
        true
      );
      scale.value = withTiming(1, { duration: 200 });
    } else {
      spin.value = withTiming(0, { duration: 350 });
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [mood, bob, spin, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }, { rotate: `${spin.value}deg` }, { scale: scale.value }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={animatedStyle}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Ellipse cx="100" cy="176" rx="48" ry="10" fill="#C62828" opacity={0.15} />

          {/* outer chip */}
          <Circle cx="100" cy="100" r="72" fill="#C62828" />
          <Circle cx="100" cy="100" r="62" fill="none" stroke="#F5E6C8" strokeWidth="8" />
          <Circle cx="100" cy="100" r="52" fill="#B71C1C" />
          <Circle cx="100" cy="100" r="44" fill="#C62828" />

          {/* dashed cream ring marks */}
          <Circle
            cx="100"
            cy="100"
            r="57"
            fill="none"
            stroke="#F5E6C8"
            strokeWidth="3"
            strokeDasharray="6 5"
            opacity={0.95}
          />

          {/* math halo symbols */}
          <G>
            <SvgText x="92" y="38" fill="#F5E6C8" fontSize="12" fontWeight="700">
              π
            </SvgText>
            <SvgText x="150" y="78" fill="#F5E6C8" fontSize="12" fontWeight="700">
              Σ
            </SvgText>
            <SvgText x="148" y="132" fill="#F5E6C8" fontSize="11" fontWeight="700">
              %
            </SvgText>
            <SvgText x="40" y="78" fill="#F5E6C8" fontSize="12" fontWeight="700">
              +
            </SvgText>
            <SvgText x="42" y="132" fill="#F5E6C8" fontSize="12" fontWeight="700">
              =
            </SvgText>
            <SvgText x="92" y="172" fill="#F5E6C8" fontSize="11" fontWeight="700">
              ∞
            </SvgText>
          </G>

          {/* face plate */}
          <Circle cx="100" cy="100" r="36" fill="#F5E6C8" />

          {/* glasses */}
          <Circle cx="88" cy="98" r="12" fill="#FFFFFF" stroke="#1B3A5F" strokeWidth="3" />
          <Circle cx="112" cy="98" r="12" fill="#FFFFFF" stroke="#1B3A5F" strokeWidth="3" />
          <Line x1="100" y1="98" x2="100" y2="98" stroke="#1B3A5F" strokeWidth="3" />
          <Line x1="98" y1="98" x2="102" y2="98" stroke="#1B3A5F" strokeWidth="3" />

          {/* eyes */}
          {mood === 'celebrate' ? (
            <>
              <Path d="M81 98 Q88 90 95 98" stroke="#1B3A5F" strokeWidth="3" fill="none" />
              <Path d="M105 98 Q112 90 119 98" stroke="#1B3A5F" strokeWidth="2.8" fill="none" />
            </>
          ) : (
            <>
              <Circle cx="88" cy="98" r="4" fill="#1B3A5F" />
              <Circle cx="112" cy="98" r="4" fill="#1B3A5F" />
              <Circle cx="86.5" cy="96.5" r="1.3" fill="#FFFFFF" />
              <Circle cx="110.5" cy="96.5" r="1.3" fill="#FFFFFF" />
            </>
          )}

          {/* smile */}
          <Path
            d={mood === 'nudge' ? 'M90 116 Q100 120 110 116' : 'M86 114 Q100 128 114 114'}
            stroke="#C62828"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* blush */}
          <Ellipse cx="74" cy="112" rx="6" ry="3.5" fill="#E89A8A" opacity={0.65} />
          <Ellipse cx="126" cy="112" rx="6" ry="3.5" fill="#E89A8A" opacity={0.65} />
        </Svg>
      </Animated.View>
    </View>
  );
}
