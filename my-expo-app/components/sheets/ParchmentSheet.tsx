import type { ReactNode } from 'react';
import { useDisplayFont } from '../../theme/displayFont';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { artStyle } from '../../theme/artStyle';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Last line of the card. Stays on screen under the scrolling rows. */
  footer?: ReactNode;
};

/** Centered parchment card over a dimmed map — swipe down or tap scrim to close. */
export function ParchmentSheet({ visible, title, onClose, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const edge = 12;
  const available = Math.max(240, windowHeight - insets.top - insets.bottom - edge * 2);
  const footerBlock = footer ? 56 : 0;
  const bodyMaxHeight = Math.max(120, available - 72 - footerBlock);
  const bodyHeight = footer ? Math.min(220, bodyMaxHeight) : undefined;
  const reducedMotion = useReducedMotion();
  const display = useDisplayFont();
  const translateY = useSharedValue(80);
  const scale = useSharedValue(0.94);
  const backdrop = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      translateY.value = reducedMotion ? 80 : withTiming(80, { duration: 160 });
      scale.value = reducedMotion ? 0.94 : withTiming(0.94, { duration: 160 });
      backdrop.value = reducedMotion ? 0 : withTiming(0, { duration: 160 });
      return;
    }
    translateY.value = reducedMotion ? 0 : withSpring(0, { damping: 18, stiffness: 180 });
    scale.value = reducedMotion ? 1 : withSpring(1, { damping: 16, stiffness: 200 });
    backdrop.value = reducedMotion ? 1 : withTiming(1, { duration: 200 });
  }, [backdrop, reducedMotion, scale, translateY, visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value * 0.68,
  }));

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 900) {
        translateY.value = withTiming(120, { duration: 150 });
        backdrop.value = withTiming(0, { duration: 150 });
        runOnJS(onClose)();
        return;
      }
      translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
    });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View
        style={[styles.root, { paddingTop: insets.top + edge, paddingBottom: insets.bottom + edge }]}
        accessibilityViewIsModal>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close sheet"
          />
        </Animated.View>
        <Animated.View style={[styles.sheet, { maxHeight: available }, sheetStyle]}>
          <GestureDetector gesture={pan}>
            <View>
              <View style={styles.handle} accessibilityElementsHidden />
              <Text style={[styles.title, display]}>{title}</Text>
            </View>
          </GestureDetector>
          <ScrollView
            style={[styles.bodyScroll, { maxHeight: bodyMaxHeight }, bodyHeight != null ? { height: bodyHeight } : null]}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator
            bounces={false}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: artStyle.colors.tobacco,
    backgroundColor: artStyle.colors.cream,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(118,83,55,0.45)',
    marginBottom: 10,
  },
  title: {
    color: artStyle.colors.projectorBlack,
    fontSize: 22,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  bodyScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  body: {
    gap: 8,
    paddingBottom: 4,
  },
  footer: {
    marginTop: 8,
  },
});
