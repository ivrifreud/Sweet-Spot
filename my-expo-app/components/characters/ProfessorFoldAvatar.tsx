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
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import type { CompanionMood } from '../characters/types';

interface Props {
  size?: number;
  mood?: CompanionMood;
}

export function ProfessorFoldAvatar({ size = 180, mood = 'idle' }: Props) {
  const bounce = useSharedValue(0);
  const chipSpin = useSharedValue(0);
  const thinkTilt = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    if (mood === 'celebrate' || mood === 'encourage') {
      chipSpin.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
    } else {
      chipSpin.value = withTiming(0, { duration: 300 });
    }

    if (mood === 'think') {
      thinkTilt.value = withRepeat(
        withSequence(withTiming(-8, { duration: 500 }), withTiming(8, { duration: 500 })),
        -1,
        true
      );
    } else {
      thinkTilt.value = withTiming(0, { duration: 250 });
    }
  }, [mood, bounce, chipSpin, thinkTilt]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }, { rotate: `${thinkTilt.value}deg` }],
  }));

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chipSpin.value}deg` }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={bodyStyle}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          {/* felt shadow */}
          <Ellipse cx="100" cy="178" rx="52" ry="10" fill="#1B3A5F" opacity={0.12} />

          {/* legs */}
          <Rect x="78" y="142" width="14" height="28" rx="6" fill="#1B3A5F" />
          <Rect x="108" y="142" width="14" height="28" rx="6" fill="#1B3A5F" />
          <Ellipse cx="85" cy="172" rx="12" ry="6" fill="#14293F" />
          <Ellipse cx="115" cy="172" rx="12" ry="6" fill="#14293F" />

          {/* body / shirt */}
          <Path
            d="M70 88 C70 72 86 64 100 64 C114 64 130 72 130 88 L136 140 C136 148 128 154 100 154 C72 154 64 148 64 140 Z"
            fill="#1B3A5F"
          />
          <Rect x="96" y="70" width="8" height="78" fill="#F5E6C8" opacity={0.9} />
          <Circle cx="100" cy="92" r="4" fill="#C62828" />
          <Circle cx="100" cy="110" r="4" fill="#C62828" />
          <Circle cx="100" cy="128" r="4" fill="#C62828" />

          {/* chalk board on side */}
          <G transform="translate(128, 96)">
            <Rect x="0" y="0" width="36" height="28" rx="3" fill="#2F6B4F" />
            <Rect x="3" y="3" width="30" height="22" rx="2" fill="#3F8A65" />
            <SvgText x="8" y="14" fill="#F5E6C8" fontSize="8" fontWeight="700">
              π+Σ
            </SvgText>
            <SvgText x="10" y="23" fill="#F5E6C8" fontSize="7">
              73%
            </SvgText>
          </G>

          {/* arms */}
          <Path d="M72 96 C58 104 52 118 56 132" stroke="#1B3A5F" strokeWidth="12" strokeLinecap="round" fill="none" />
          <Path d="M128 96 C140 102 148 112 146 126" stroke="#1B3A5F" strokeWidth="12" strokeLinecap="round" fill="none" />

          {/* head */}
          <Circle cx="100" cy="52" r="28" fill="#F2C9A0" />
          {/* messy hair */}
          <Path
            d="M74 48 C70 28 86 18 100 20 C116 16 132 28 126 48 C120 34 108 32 100 34 C90 32 80 36 74 48 Z"
            fill="#3E2A1F"
          />
          <Path d="M78 34 C72 24 84 18 90 24" fill="#3E2A1F" />
          <Path d="M110 22 C118 14 130 22 124 32" fill="#3E2A1F" />

          {/* glasses */}
          <Circle cx="88" cy="54" r="10" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2.5" />
          <Circle cx="112" cy="54" r="10" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2.5" />
          <Line x1="98" y1="54" x2="102" y2="54" stroke="#1A1A1A" strokeWidth="2.5" />
          <Line x1="78" y1="54" x2="72" y2="50" stroke="#1A1A1A" strokeWidth="2.5" />
          <Line x1="122" y1="54" x2="128" y2="50" stroke="#1A1A1A" strokeWidth="2.5" />

          {/* eyes + smile by mood */}
          {mood === 'celebrate' ? (
            <>
              <Path d="M82 54 Q88 48 94 54" stroke="#1A1A1A" strokeWidth="2.5" fill="none" />
              <Path d="M106 54 Q112 48 118 54" stroke="#1A1A1A" strokeWidth="2.5" fill="none" />
            </>
          ) : (
            <>
              <Circle cx="88" cy="54" r="3.2" fill="#1A1A1A" />
              <Circle cx="112" cy="54" r="3.2" fill="#1A1A1A" />
            </>
          )}
          <Path
            d={mood === 'nudge' ? 'M90 68 Q100 72 110 68' : 'M88 66 Q100 76 112 66'}
            stroke="#C06A4A"
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />

          {/* blush */}
          <Ellipse cx="76" cy="62" rx="5" ry="3" fill="#E89A8A" opacity={0.55} />
          <Ellipse cx="124" cy="62" rx="5" ry="3" fill="#E89A8A" opacity={0.55} />
        </Svg>
      </Animated.View>

      {/* red poker chip in hand */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: size * 0.12,
            bottom: size * 0.18,
          },
          chipStyle,
        ]}>
        <Svg width={size * 0.22} height={size * 0.22} viewBox="0 0 40 40">
          <Circle cx="20" cy="20" r="18" fill="#C62828" />
          <Circle cx="20" cy="20" r="14" fill="none" stroke="#F5E6C8" strokeWidth="3" strokeDasharray="4 3" />
          <Circle cx="20" cy="20" r="8" fill="#F5E6C8" />
          <SvgText x="14" y="24" fill="#C62828" fontSize="10" fontWeight="700">
            π
          </SvgText>
        </Svg>
      </Animated.View>
    </View>
  );
}
