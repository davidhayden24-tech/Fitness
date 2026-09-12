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

const SKIN = "#D9A066";
const SHORTS = "#2A2E38";
const OUTLINE = "#12141A";

// Outfit-colored segments (shirt torso + sleeves/shorts) are drawn wider
// than the bare-skin segments (forearms/shins), and legs are drawn before
// the torso/arms so shoulder and hip joints layer naturally on top.
const BONES: { from: PointKey; to: PointKey; color: "outfit" | "shorts" | "skin"; width: number }[] = [
  { from: "hip", to: "leftKnee", color: "shorts", width: 13 },
  { from: "hip", to: "rightKnee", color: "shorts", width: 13 },
  { from: "leftKnee", to: "leftFoot", color: "skin", width: 9 },
  { from: "rightKnee", to: "rightFoot", color: "skin", width: 9 },
  { from: "hip", to: "shoulder", color: "outfit", width: 16 },
  { from: "shoulder", to: "leftElbow", color: "outfit", width: 10 },
  { from: "shoulder", to: "rightElbow", color: "outfit", width: 10 },
  { from: "leftElbow", to: "leftHand", color: "skin", width: 8 },
  { from: "rightElbow", to: "rightHand", color: "skin", width: 8 },
];
const FEET: PointKey[] = ["leftFoot", "rightFoot"];

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

  const boneColor = { outfit: color, shorts: SHORTS, skin: SKIN };

  return (
    <View style={styles.container}>
      <Svg width={size} height={(size * VIEW_H) / VIEW_W} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        {/* Each bone's outline is drawn immediately before its own fill (not
            all outlines first) so a later bone's outline cuts a visible
            border into any earlier bone's fill where they cross - poses
            viewed edge-on (a pushup's arms/torso, say) unavoidably overlap,
            and without this they merge into a shapeless blob instead of
            reading as separate limbs. */}
        {BONES.map(({ from, to, color: tone, width }) => (
          <React.Fragment key={`${from}-${to}`}>
            <AnimatedLine
              x1={points[from].x}
              y1={points[from].y}
              x2={points[to].x}
              y2={points[to].y}
              stroke={OUTLINE}
              strokeWidth={width + 3}
              strokeLinecap="round"
            />
            <AnimatedLine
              x1={points[from].x}
              y1={points[from].y}
              x2={points[to].x}
              y2={points[to].y}
              stroke={boneColor[tone]}
              strokeWidth={width}
              strokeLinecap="round"
            />
          </React.Fragment>
        ))}
        <AnimatedCircle cx={points.head.x} cy={points.head.y} r={LENGTHS.headRadius + 1.5} fill={OUTLINE} />
        <AnimatedCircle cx={points.head.x} cy={points.head.y} r={LENGTHS.headRadius} fill={SKIN} />
        {FEET.map((key) => (
          <React.Fragment key={key}>
            <AnimatedCircle cx={points[key].x} cy={points[key].y} r={6.5} fill={OUTLINE} />
            <AnimatedCircle cx={points[key].x} cy={points[key].y} r={5} fill={colors.text} />
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
});
