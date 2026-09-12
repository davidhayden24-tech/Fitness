import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { computeSkeleton, LENGTHS, type Skeleton } from "../animations/pose";
import { PATTERNS, type AnimationPattern } from "../animations/patterns";
import { LIMB_PATHS } from "../animations/limbShapes";
import { colors } from "../theme";

const AnimatedG = Animated.createAnimatedComponent(G);
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
const HAIR = "#12141A";
const OUTLINE = "#12141A";

/**
 * A stylized, looping "illustrated athlete" animation standing in for real
 * exercise video/animation (see apps/backend/src/data/exercises.ts -
 * videoAssetRef is still null for every seeded exercise). Two keyframe
 * poses per movement pattern (patterns.ts) drive both a joint-position
 * skeleton (computeSkeleton, for placing round joint accents) and, more
 * importantly, each limb's own rotation angle - the Pose fields are
 * already absolute angles (pose.ts), so no trig is needed to animate
 * them: a plain linear interpolation from the pose-A angle to the pose-B
 * angle is exactly the rotation to feed a <G rotation={...}>. Each limb's
 * silhouette (limbShapes.ts) is a precomputed, static path drawn in local
 * space with its proximal joint at the origin; the wrapping <G>'s
 * animated x/y (joint position) and rotation place it correctly every
 * frame with no per-frame path recomputation.
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

  const { poseA, poseB, a, b } = useMemo(() => {
    const [poseA, poseB] = PATTERNS[pattern];
    return { poseA, poseB, a: computeSkeleton(poseA), b: computeSkeleton(poseB) };
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

  const angles = useMemo(() => {
    const result: Record<AngleKey, Animated.AnimatedInterpolation<number>> = {} as never;
    for (const key of ANGLE_KEYS) {
      result[key] = progress.interpolate({ inputRange: [0, 1], outputRange: [poseA[key], poseB[key]] });
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poseA, poseB]);

  const r = LENGTHS.headRadius;

  return (
    <View style={styles.container}>
      <Svg width={size} height={(size * VIEW_H) / VIEW_W} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        {/* Legs behind the torso/arms, so the hip and shoulder joints
            layer naturally on top of them. */}
        <AnimatedG x={points.hip.x} y={points.hip.y} rotation={angles.leftHipAngle}>
          <Path d={LIMB_PATHS.thigh} fill={SHORTS} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
        </AnimatedG>
        <AnimatedG x={points.hip.x} y={points.hip.y} rotation={angles.rightHipAngle}>
          <Path d={LIMB_PATHS.thigh} fill={SHORTS} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
        </AnimatedG>
        <AnimatedCircle cx={points.leftKnee.x} cy={points.leftKnee.y} r={4.5} fill={SKIN} stroke={OUTLINE} strokeWidth={1.2} />
        <AnimatedCircle cx={points.rightKnee.x} cy={points.rightKnee.y} r={4.5} fill={SKIN} stroke={OUTLINE} strokeWidth={1.2} />
        <AnimatedG x={points.leftKnee.x} y={points.leftKnee.y} rotation={angles.leftKneeAngle}>
          <Path d={LIMB_PATHS.shin} fill={SKIN} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
        </AnimatedG>
        <AnimatedG x={points.rightKnee.x} y={points.rightKnee.y} rotation={angles.rightKneeAngle}>
          <Path d={LIMB_PATHS.shin} fill={SKIN} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
        </AnimatedG>
        <AnimatedCircle cx={points.leftFoot.x} cy={points.leftFoot.y} r={4.5} fill={colors.text} stroke={OUTLINE} strokeWidth={1.2} />
        <AnimatedCircle cx={points.rightFoot.x} cy={points.rightFoot.y} r={4.5} fill={colors.text} stroke={OUTLINE} strokeWidth={1.2} />

        <AnimatedCircle cx={points.hip.x} cy={points.hip.y} r={6} fill={SHORTS} stroke={OUTLINE} strokeWidth={1.2} />
        <AnimatedG x={points.hip.x} y={points.hip.y} rotation={angles.torsoAngle}>
          <Path d={LIMB_PATHS.torso} fill={color} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
        </AnimatedG>
        <AnimatedCircle cx={points.shoulder.x} cy={points.shoulder.y} r={7} fill={color} stroke={OUTLINE} strokeWidth={1.2} />

        <AnimatedG x={points.shoulder.x} y={points.shoulder.y} rotation={angles.leftShoulderAngle}>
          <Path d={LIMB_PATHS.upperArm} fill={color} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
        </AnimatedG>
        <AnimatedG x={points.shoulder.x} y={points.shoulder.y} rotation={angles.rightShoulderAngle}>
          <Path d={LIMB_PATHS.upperArm} fill={color} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
        </AnimatedG>
        <AnimatedCircle cx={points.leftElbow.x} cy={points.leftElbow.y} r={4} fill={SKIN} stroke={OUTLINE} strokeWidth={1.2} />
        <AnimatedCircle cx={points.rightElbow.x} cy={points.rightElbow.y} r={4} fill={SKIN} stroke={OUTLINE} strokeWidth={1.2} />
        <AnimatedG x={points.leftElbow.x} y={points.leftElbow.y} rotation={angles.leftElbowAngle}>
          <Path d={LIMB_PATHS.forearm} fill={SKIN} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
        </AnimatedG>
        <AnimatedG x={points.rightElbow.x} y={points.rightElbow.y} rotation={angles.rightElbowAngle}>
          <Path d={LIMB_PATHS.forearm} fill={SKIN} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
        </AnimatedG>
        <AnimatedCircle cx={points.leftHand.x} cy={points.leftHand.y} r={3.2} fill={SKIN} stroke={OUTLINE} strokeWidth={1} />
        <AnimatedCircle cx={points.rightHand.x} cy={points.rightHand.y} r={3.2} fill={SKIN} stroke={OUTLINE} strokeWidth={1} />

        {/* Head + hair: an offset hair-colored circle drawn behind the
            skin circle leaves a natural crescent showing through on one
            side - simpler and more robust than hand-authoring a
            hair-shaped path. */}
        <AnimatedG x={points.head.x} y={points.head.y} rotation={angles.torsoAngle}>
          <Circle cx={-r * 0.3} cy={-r * 0.35} r={r * 1.05} fill={HAIR} />
          <Circle cx={0} cy={0} r={r} fill={SKIN} stroke={OUTLINE} strokeWidth={1.6} />
          <Path
            d={`M ${r * 0.05},${-r * 0.42} Q ${r * 0.35},${-r * 0.62} ${r * 0.62},${-r * 0.35}`}
            stroke={HAIR}
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={r * 0.38} cy={-r * 0.05} r={r * 0.24} fill="white" />
          <Circle cx={r * 0.44} cy={-r * 0.05} r={r * 0.13} fill={HAIR} />
          <Path
            d={`M ${r * 0.1},${r * 0.32} Q ${r * 0.38},${r * 0.56} ${r * 0.62},${r * 0.28}`}
            stroke={HAIR}
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
