import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { computeSkeleton, LENGTHS, type Skeleton } from "../animations/pose";
import { PATTERNS, type AnimationPattern } from "../animations/patterns";
import { colors } from "../theme";

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const VIEW_W = 120;
const VIEW_H = 160;
const CYCLE_MS = 900;

interface Props {
  pattern: AnimationPattern;
  size?: number;
  color?: string;
}

type PointKey = keyof Skeleton;
const POINT_KEYS: PointKey[] = [
  "hip",
  "shoulder",
  "head",
  "leftElbow",
  "leftHand",
  "rightElbow",
  "rightHand",
  "leftKnee",
  "leftFoot",
  "rightKnee",
  "rightFoot",
];

const BONES: [PointKey, PointKey][] = [
  ["hip", "shoulder"],
  ["shoulder", "leftElbow"],
  ["leftElbow", "leftHand"],
  ["shoulder", "rightElbow"],
  ["rightElbow", "rightHand"],
  ["hip", "leftKnee"],
  ["leftKnee", "leftFoot"],
  ["hip", "rightKnee"],
  ["rightKnee", "rightFoot"],
];

/**
 * A stylized, looping stick-figure animation standing in for real exercise
 * video/animation (see apps/backend/src/data/exercises.ts - videoAssetRef is
 * still null for every seeded exercise). Two keyframe poses per movement
 * pattern (patterns.ts) are precomputed into pixel-space skeletons, then a
 * single Animated.Value interpolates every joint's x/y between them and
 * back, forever. Interpolating pre-computed positions - rather than
 * animating joint angles and deriving sin/cos per frame - sidesteps that
 * RN's Animated API has no trig functions.
 */
export function ExerciseAnimation({ pattern, size = 140, color = colors.primary }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: CYCLE_MS, useNativeDriver: false }),
        Animated.timing(progress, { toValue: 0, duration: CYCLE_MS, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern]);

  const { a, b } = useMemo(() => {
    const [poseA, poseB] = PATTERNS[pattern];
    return { a: computeSkeleton(poseA), b: computeSkeleton(poseB) };
  }, [pattern]);

  const points = useMemo(() => {
    const result: Record<PointKey, { x: Animated.AnimatedInterpolation<number>; y: Animated.AnimatedInterpolation<number> }> = {} as never;
    for (const key of POINT_KEYS) {
      result[key] = {
        x: progress.interpolate({ inputRange: [0, 1], outputRange: [a[key].x, b[key].x] }),
        y: progress.interpolate({ inputRange: [0, 1], outputRange: [a[key].y, b[key].y] }),
      };
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b]);

  const strokeProps = { stroke: color, strokeWidth: 5, strokeLinecap: "round" as const };

  return (
    <View style={styles.container}>
      <Svg width={size} height={(size * VIEW_H) / VIEW_W} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        {BONES.map(([from, to]) => (
          <AnimatedLine
            key={`${from}-${to}`}
            x1={points[from].x}
            y1={points[from].y}
            x2={points[to].x}
            y2={points[to].y}
            {...strokeProps}
          />
        ))}
        <AnimatedCircle cx={points.head.x} cy={points.head.y} r={LENGTHS.headRadius} fill={color} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
});
