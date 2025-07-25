// src/components/SwipeableDayView.tsx
import React, { ReactNode, useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedGestureHandler,
  runOnJS,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type Props = {
  children: ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

export default function SwipeableDayView({
  children,
  onSwipeLeft,
  onSwipeRight,
}: Props) {
  const translateX = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number }
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: (event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        runOnJS(onSwipeLeft)();
      } else if (event.translationX > SWIPE_THRESHOLD) {
        runOnJS(onSwipeRight)();
      }
      translateX.value = withTiming(0); // reset position
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
