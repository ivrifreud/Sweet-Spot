import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { safePauseVideoPlayer } from '../../lib/video/safePause';
import { artStyle } from '../../theme/artStyle';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const LOCKOUT_EMOTE = require('../../assets/brand/artstyle/coach-broke-lockout.mp4');
const LOCKOUT_POSTER = require('../../assets/brand/artstyle/coach-broke-lockout.png');

function pressPlaceholder() {
  // Premium rebuy and rewarded ads are placeholders this sprint.
}

function LockoutEmote() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) {
    return (
      <Image
        source={LOCKOUT_POSTER}
        style={styles.emoteMedia}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        accessible={false}
      />
    );
  }
  return <LockoutEmoteVideo />;
}

function LockoutEmoteVideo() {
  const [ready, setReady] = useState(false);
  const player = useVideoPlayer(LOCKOUT_EMOTE, (nextPlayer) => {
    nextPlayer.loop = true;
    nextPlayer.muted = true;
  });

  const start = useCallback(() => {
    if (!player.playing) player.play();
  }, [player]);

  useEventListener(player, 'sourceLoad', () => start());
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') start();
  });

  useEffect(() => {
    start();
    return () => {
      safePauseVideoPlayer(player);
    };
  }, [player, start]);

  return (
    <View style={styles.emoteMedia}>
      {ready ? null : (
        <Image
          source={LOCKOUT_POSTER}
          style={styles.emotePoster}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          accessible={false}
        />
      )}
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="cover"
        playsInline
        surfaceType="textureView"
        onFirstFrameRender={() => setReady(true)}
        style={styles.emoteMedia}
      />
    </View>
  );
}

type Props = {
  countdown: string;
};

export function ChipLockoutCard({ countdown }: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;

  const cardOpacity = useSharedValue(0);
  const buyScale = useSharedValue(1);
  const adScale = useSharedValue(1);

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 240 });
  }, [cardOpacity]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: (1 - cardOpacity.value) * 18 }],
  }));

  const buyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buyScale.value }],
  }));

  const adStyle = useAnimatedStyle(() => ({
    transform: [{ scale: adScale.value }],
  }));

  function pressIn(scale: typeof buyScale) {
    scale.value = withTiming(0.96, { duration: 100 });
  }

  function pressOut(scale: typeof buyScale) {
    scale.value = withSequence(
      withTiming(1.03, { duration: 90 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.card, cardStyle]}>
        <View style={styles.emoteBox} pointerEvents="none" accessibilityElementsHidden>
          <LockoutEmote />
        </View>
        <Text style={[styles.kicker, display]}>THE TRAY IS EMPTY</Text>
        <Text style={[styles.title, display]}>CHIPS ARE SPENT</Text>
        <View style={styles.rule} />
        <Text style={styles.joke}>
          Twelve hours is a long sit for a busted stack. The house will slide your chips back when
          the clock says so — unless a gentleman buys the next seat, or sits through a short picture
          show.
        </Text>
        <Text style={styles.countdown}>{countdown}</Text>

        <AnimatedPressable
          onPress={pressPlaceholder}
          onPressIn={() => pressIn(buyScale)}
          onPressOut={() => pressOut(buyScale)}
          style={[styles.buyButton, buyStyle]}
          accessibilityRole="button"
          accessibilityLabel="Buy the stack"
          accessibilityHint="Placeholder for a premium rebuy. Not wired yet.">
          <Text style={[styles.buyLabel, display]}>BUY THE STACK</Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={pressPlaceholder}
          onPressIn={() => pressIn(adScale)}
          onPressOut={() => pressOut(adScale)}
          style={[styles.adButton, adStyle]}
          accessibilityRole="button"
          accessibilityLabel="Watch a reel"
          accessibilityHint="Placeholder for a rewarded ad. Not wired yet.">
          <Text style={[styles.adLabel, display]}>WATCH A REEL</Text>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    backgroundColor: 'rgba(17,23,20,0.42)',
    overflow: 'visible',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    overflow: 'visible',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: artStyle.colors.oxblood,
    backgroundColor: 'rgba(17,23,20,0.94)',
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  emoteBox: {
    width: 132,
    height: 188,
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: artStyle.colors.gold,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  emoteMedia: {
    width: '100%',
    height: '100%',
  },
  emotePoster: {
    ...StyleSheet.absoluteFillObject,
  },
  kicker: {
    color: artStyle.colors.oxblood,
    fontSize: 13,
    letterSpacing: 3.2,
    textAlign: 'center',
  },
  title: {
    color: artStyle.colors.oxblood,
    fontSize: 36,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(17,23,20,0.75)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  rule: {
    width: 118,
    height: 3,
    borderRadius: 2,
    marginTop: 12,
    backgroundColor: artStyle.colors.oxblood,
  },
  joke: {
    color: 'rgba(232,215,167,0.9)',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 16,
  },
  countdown: {
    color: artStyle.colors.goldBright,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  buyButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: artStyle.colors.cream,
    backgroundColor: artStyle.colors.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyLabel: {
    color: artStyle.colors.projectorBlack,
    fontSize: 20,
    letterSpacing: 2.2,
  },
  adButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: artStyle.colors.gold,
    backgroundColor: 'rgba(17,23,20,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  adLabel: {
    color: artStyle.colors.cream,
    fontSize: 18,
    letterSpacing: 2,
  },
});
