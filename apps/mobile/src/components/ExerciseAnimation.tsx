import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from "react-native-svg";
import { computeSkeleton, LENGTHS, type Skeleton } from "../animations/pose";
import { PATTERNS, type AnimationPattern } from "../animations/patterns";
import { HAND_PATH, LIMB_PATHS, SHOE_PATH, SOLE_PATH } from "../animations/limbShapes";
import { colors } from "../theme";

const AnimatedG = Animated.createAnimatedComponent(G);

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

type AngleKey = "torsoAngle" | "leftShoulderAngle" | "rightShoulderAngle" | "leftElbowAngle" | "rightElbowAngle" | "leftHipAngle" | "rightHipAngle" | "leftKneeAngle" | "rightKneeAngle";
const ANGLE_KEYS: AngleKey[] = [
  "torsoAngle",
  "leftShoulderAngle",
  "rightShoulderAngle",
  "leftElbowAngle",
  "rightElbowAngle",
  "leftHipAngle",
  "rightHipAngle",
  "leftKneeAngle",
  "rightKneeAngle",
];

const SKIN = "#D9A066";
const SHORTS = "#2A2E38";
const HAIR = "#5C3A21";
const OUTLINE = "#12141A";

/**
 * A stylized, looping "illustrated athlete" animation standing in for real
 * exercise video/animation (see apps/backend/src/data/exercises.ts -
 * videoAssetRef is still null for every seeded exercise). Each movement
 * pattern (patterns.ts) is a sequence of 3+ keyframe poses, not just a
 * start/end pair - `progress` sweeps through them as a multi-stop
 * piecewise-linear interpolation (Animated.interpolate natively supports
 * >2-point inputRange/outputRange), so the motion actually passes through
 * the in-between poses instead of blending only two extremes. This drives
 * both a joint-position skeleton (computeSkeleton, for placing round
 * joint accents) and, more importantly, each limb's own rotation angle -
 * the Pose fields are already absolute angles (pose.ts), so no trig is
 * needed to animate them: interpolating from one keyframe's angle to the
 * next is exactly the rotation to feed a <G rotation={...}>. Each limb's
 * silhouette (limbShapes.ts) is a precomputed, static path drawn in local
 * space with its proximal joint at the origin; the wrapping <G>'s
 * animated x/y (joint position) and rotation place it correctly every
 * frame with no per-frame path recomputation.
 */
export function ExerciseAnimation({ pattern, size = 140, color = colors.primary }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  const keyframes = useMemo(() => PATTERNS[pattern], [pattern]);
  const lastIndex = keyframes.length - 1;

  useEffect(() => {
    const easing = Easing.inOut(Easing.quad);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: lastIndex, duration: CYCLE_MS, easing, useNativeDriver: false }),
        Animated.timing(progress, { toValue: 0, duration: CYCLE_MS, easing, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern]);

  const skeletons = useMemo(() => keyframes.map(computeSkeleton), [keyframes]);
  const stops = useMemo(() => keyframes.map((_, i) => i), [keyframes]);

  const points = useMemo(() => {
    const result: Record<PointKey, { x: Animated.AnimatedInterpolation<number>; y: Animated.AnimatedInterpolation<number> }> = {} as never;
    for (const key of POINT_KEYS) {
      result[key] = {
        x: progress.interpolate({ inputRange: stops, outputRange: skeletons.map((s) => s[key].x) }),
        y: progress.interpolate({ inputRange: stops, outputRange: skeletons.map((s) => s[key].y) }),
      };
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skeletons, stops]);

  const angles = useMemo(() => {
    const result: Record<AngleKey, Animated.AnimatedInterpolation<number>> = {} as never;
    for (const key of ANGLE_KEYS) {
      result[key] = progress.interpolate({ inputRange: stops, outputRange: keyframes.map((p) => p[key]) });
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyframes, stops]);

  const r = LENGTHS.headRadius;

  return (
    <View style={styles.container}>
      <Svg width={size} height={(size * VIEW_H) / VIEW_W} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        {/* A generic light-to-dark overlay, painted on top of every solid
            shape's own bounding box (default objectBoundingBox units), to
            fake a rounded/cylindrical cross-section instead of a flat
            cartoon fill - independent of the shape's own base color, so
            it works for skin, outfit and shorts alike. */}
        <Defs>
          <LinearGradient id="shade" x1="0" y1="0" x2="1" y2="0.15">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.32} />
            <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.28} />
          </LinearGradient>
        </Defs>

        {/* Legs behind the torso/arms, so the hip and shoulder joints
            layer naturally on top of them. */}
        <AnimatedG x={points.hip.x} y={points.hip.y} rotation={angles.leftHipAngle}>
          <Path d={LIMB_PATHS.thigh} fill={SHORTS} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={LIMB_PATHS.thigh} fill="url(#shade)" />
        </AnimatedG>
        <AnimatedG x={points.hip.x} y={points.hip.y} rotation={angles.rightHipAngle}>
          <Path d={LIMB_PATHS.thigh} fill={SHORTS} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={LIMB_PATHS.thigh} fill="url(#shade)" />
        </AnimatedG>
        <AnimatedG x={points.leftKnee.x} y={points.leftKnee.y} rotation={angles.leftKneeAngle}>
          <Path d={LIMB_PATHS.shin} fill={SKIN} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={LIMB_PATHS.shin} fill="url(#shade)" />
        </AnimatedG>
        <AnimatedG x={points.rightKnee.x} y={points.rightKnee.y} rotation={angles.rightKneeAngle}>
          <Path d={LIMB_PATHS.shin} fill={SKIN} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={LIMB_PATHS.shin} fill="url(#shade)" />
        </AnimatedG>
        <AnimatedG x={points.leftFoot.x} y={points.leftFoot.y} rotation={angles.leftKneeAngle}>
          <Path d={SHOE_PATH} fill={colors.text} stroke={OUTLINE} strokeWidth={1.3} strokeLinejoin="round" />
          <Path d={SOLE_PATH} fill={SHORTS} stroke={OUTLINE} strokeWidth={1} strokeLinejoin="round" />
          <Path d={SHOE_PATH} fill="url(#shade)" />
        </AnimatedG>
        <AnimatedG x={points.rightFoot.x} y={points.rightFoot.y} rotation={angles.rightKneeAngle}>
          <Path d={SHOE_PATH} fill={colors.text} stroke={OUTLINE} strokeWidth={1.3} strokeLinejoin="round" />
          <Path d={SOLE_PATH} fill={SHORTS} stroke={OUTLINE} strokeWidth={1} strokeLinejoin="round" />
          <Path d={SHOE_PATH} fill="url(#shade)" />
        </AnimatedG>

        <AnimatedG x={points.hip.x} y={points.hip.y} rotation={angles.torsoAngle}>
          <Path d={LIMB_PATHS.torso} fill={color} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={LIMB_PATHS.torso} fill="url(#shade)" />
        </AnimatedG>
        <AnimatedG x={points.shoulder.x} y={points.shoulder.y} rotation={angles.leftShoulderAngle}>
          <Path d={LIMB_PATHS.upperArm} fill={color} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={LIMB_PATHS.upperArm} fill="url(#shade)" />
        </AnimatedG>
        <AnimatedG x={points.shoulder.x} y={points.shoulder.y} rotation={angles.rightShoulderAngle}>
          <Path d={LIMB_PATHS.upperArm} fill={color} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={LIMB_PATHS.upperArm} fill="url(#shade)" />
        </AnimatedG>
        <AnimatedG x={points.leftElbow.x} y={points.leftElbow.y} rotation={angles.leftElbowAngle}>
          <Path d={LIMB_PATHS.forearm} fill={SKIN} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={LIMB_PATHS.forearm} fill="url(#shade)" />
        </AnimatedG>
        <AnimatedG x={points.rightElbow.x} y={points.rightElbow.y} rotation={angles.rightElbowAngle}>
          <Path d={LIMB_PATHS.forearm} fill={SKIN} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={LIMB_PATHS.forearm} fill="url(#shade)" />
        </AnimatedG>
        <AnimatedG x={points.leftHand.x} y={points.leftHand.y} rotation={angles.leftElbowAngle}>
          <Path d={HAND_PATH} fill={SKIN} stroke={OUTLINE} strokeWidth={1.3} strokeLinejoin="round" />
          <Path d={HAND_PATH} fill="url(#shade)" />
        </AnimatedG>
        <AnimatedG x={points.rightHand.x} y={points.rightHand.y} rotation={angles.rightElbowAngle}>
          <Path d={HAND_PATH} fill={SKIN} stroke={OUTLINE} strokeWidth={1.3} strokeLinejoin="round" />
          <Path d={HAND_PATH} fill="url(#shade)" />
        </AnimatedG>

        {/* Neck: fills the gap pose.ts leaves between the shoulder and
            the head (the head circle doesn't reach down to the shoulder
            on its own), so it shares the torso's own rotation and sits
            at the shoulder joint just like the torso does at the hip. */}
        <AnimatedG x={points.shoulder.x} y={points.shoulder.y} rotation={angles.torsoAngle}>
          <Path d={LIMB_PATHS.neck} fill={SKIN} stroke={OUTLINE} strokeWidth={1.4} strokeLinejoin="round" />
          <Path d={LIMB_PATHS.neck} fill="url(#shade)" />
        </AnimatedG>

        {/* Head + hair: an offset hair-colored circle drawn behind the
            skin circle leaves a natural crescent showing through on one
            side - simpler and more robust than hand-authoring a
            hair-shaped path. */}
        <AnimatedG x={points.head.x} y={points.head.y} rotation={angles.torsoAngle}>
          <Circle cx={-r * 0.3} cy={-r * 0.35} r={r * 1.05} fill={HAIR} />
          <Circle cx={0} cy={0} r={r} fill={SKIN} stroke={OUTLINE} strokeWidth={1.6} />
          <Circle cx={0} cy={0} r={r} fill="url(#shade)" />
          <Path
            d={`M ${r * 0.05},${-r * 0.42} Q ${r * 0.35},${-r * 0.62} ${r * 0.62},${-r * 0.35}`}
            stroke={HAIR}
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={r * 0.16} cy={-r * 0.08} r={r * 0.15} fill="white" />
          <Circle cx={r * 0.21} cy={-r * 0.08} r={r * 0.08} fill={OUTLINE} />
          <Circle cx={r * 0.54} cy={-r * 0.08} r={r * 0.15} fill="white" />
          <Circle cx={r * 0.59} cy={-r * 0.08} r={r * 0.08} fill={OUTLINE} />
          <Path
            d={`M ${r * 0.1},${r * 0.32} Q ${r * 0.38},${r * 0.56} ${r * 0.62},${r * 0.28}`}
            stroke={OUTLINE}
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
        </AnimatedG>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
});
