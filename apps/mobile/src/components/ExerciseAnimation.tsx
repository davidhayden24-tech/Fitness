import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { computeSkeleton, LENGTHS, type Skeleton } from "../animations/pose";
import { EXERCISE_ANIMATIONS, type ExerciseAnimationId } from "../animations/exerciseAnimations";
import { HAND_PATH, LIMB_PATHS, SHOE_COLOR, SHOE_PATH, SOLE_COLOR, SOLE_PATH } from "../animations/limbShapes";
import { colors } from "../theme";

const AnimatedG = Animated.createAnimatedComponent(G);

const VIEW_W = 120;
const VIEW_H = 160;
const CYCLE_MS = 900;

interface Props {
  pattern: ExerciseAnimationId;
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
const HAIR = "#1B1B1F";

/**
 * A stylized, looping "illustrated athlete" animation standing in for real
 * exercise video/animation (see apps/backend/src/data/exercises.ts -
 * videoAssetRef is still null for every seeded exercise). Each exercise
 * (exerciseAnimations.ts) has its own sequence of 3+ keyframe poses, not
 * just a start/end pair - `progress` sweeps through them as a multi-stop
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
 *
 * Flat-vector style (no outlines, no face) matching a reference stock
 * illustration: adjacent same-colored limbs (e.g. upper arm, forearm and
 * hand, all bare skin) rely on their own rounded-cap overlap to read as
 * one continuous shape, since there's no stroke line to separate them.
 */
export function ExerciseAnimation({ pattern, size = 140, color = colors.primary }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  const keyframes = useMemo(() => EXERCISE_ANIMATIONS[pattern], [pattern]);
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
        {/* Legs behind the torso/arms, so the hip and shoulder joints
            layer naturally on top of them. Thighs are bare skin with a
            short shorts overlay layered on top, rather than the shorts
            covering the whole thigh, so the lower thigh shows through. */}
        <AnimatedG x={points.hip.x} y={points.hip.y} rotation={angles.leftHipAngle}>
          <Path d={LIMB_PATHS.thigh} fill={SKIN} />
          <Path d={LIMB_PATHS.shorts} fill={SHORTS} />
        </AnimatedG>
        <AnimatedG x={points.hip.x} y={points.hip.y} rotation={angles.rightHipAngle}>
          <Path d={LIMB_PATHS.thigh} fill={SKIN} />
          <Path d={LIMB_PATHS.shorts} fill={SHORTS} />
        </AnimatedG>
        <AnimatedG x={points.leftKnee.x} y={points.leftKnee.y} rotation={angles.leftKneeAngle}>
          <Path d={LIMB_PATHS.shin} fill={SKIN} />
        </AnimatedG>
        <AnimatedG x={points.rightKnee.x} y={points.rightKnee.y} rotation={angles.rightKneeAngle}>
          <Path d={LIMB_PATHS.shin} fill={SKIN} />
        </AnimatedG>
        <AnimatedG x={points.leftFoot.x} y={points.leftFoot.y} rotation={angles.leftKneeAngle}>
          <Path d={SHOE_PATH} fill={SHOE_COLOR} />
          <Path d={SOLE_PATH} fill={SOLE_COLOR} />
        </AnimatedG>
        <AnimatedG x={points.rightFoot.x} y={points.rightFoot.y} rotation={angles.rightKneeAngle}>
          <Path d={SHOE_PATH} fill={SHOE_COLOR} />
          <Path d={SOLE_PATH} fill={SOLE_COLOR} />
        </AnimatedG>

        {/* Torso keeps the outfit color; arms are bare skin (a sleeveless
            tank), so upper arm, forearm and hand all share one fill and
            read as a single continuous arm. */}
        <AnimatedG x={points.hip.x} y={points.hip.y} rotation={angles.torsoAngle}>
          <Path d={LIMB_PATHS.torso} fill={color} />
        </AnimatedG>
        <AnimatedG x={points.shoulder.x} y={points.shoulder.y} rotation={angles.leftShoulderAngle}>
          <Path d={LIMB_PATHS.upperArm} fill={SKIN} />
        </AnimatedG>
        <AnimatedG x={points.shoulder.x} y={points.shoulder.y} rotation={angles.rightShoulderAngle}>
          <Path d={LIMB_PATHS.upperArm} fill={SKIN} />
        </AnimatedG>
        <AnimatedG x={points.leftElbow.x} y={points.leftElbow.y} rotation={angles.leftElbowAngle}>
          <Path d={LIMB_PATHS.forearm} fill={SKIN} />
        </AnimatedG>
        <AnimatedG x={points.rightElbow.x} y={points.rightElbow.y} rotation={angles.rightElbowAngle}>
          <Path d={LIMB_PATHS.forearm} fill={SKIN} />
        </AnimatedG>
        <AnimatedG x={points.leftHand.x} y={points.leftHand.y} rotation={angles.leftElbowAngle}>
          <Path d={HAND_PATH} fill={SKIN} />
        </AnimatedG>
        <AnimatedG x={points.rightHand.x} y={points.rightHand.y} rotation={angles.rightElbowAngle}>
          <Path d={HAND_PATH} fill={SKIN} />
        </AnimatedG>

        {/* Neck: fills the gap pose.ts leaves between the shoulder and
            the head (the head circle doesn't reach down to the shoulder
            on its own), so it shares the torso's own rotation and sits
            at the shoulder joint just like the torso does at the hip. */}
        <AnimatedG x={points.shoulder.x} y={points.shoulder.y} rotation={angles.torsoAngle}>
          <Path d={LIMB_PATHS.neck} fill={SKIN} />
        </AnimatedG>

        {/* Head + hair: a big offset hair-colored circle drawn behind the
            skin circle, swept back over the top/side of the head - no
            face, no visible ear (both fully hair-covered), matching a
            flat side-on illustration rather than a cartoon character. */}
        <AnimatedG x={points.head.x} y={points.head.y} rotation={angles.torsoAngle}>
          <Circle cx={-r * 0.22} cy={-r * 0.28} r={r * 1.32} fill={HAIR} />
          <Circle cx={0} cy={0} r={r} fill={SKIN} />
        </AnimatedG>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
});
