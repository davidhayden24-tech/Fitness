// A minimal 2D stick-figure rig. Every joint angle is absolute (0 = up,
// 90 = right, 180 = down, -90 = left), which keeps keyframe authoring in
// patterns.ts simple - no composing rotations relative to a parent limb.
// This trades biomechanical precision for something easy to reason about
// and to get visibly right without a real rendering/animation tool.

export interface Pose {
  hipX: number;
  hipY: number;
  torsoAngle: number;
  leftShoulderAngle: number;
  leftElbowAngle: number;
  rightShoulderAngle: number;
  rightElbowAngle: number;
  leftHipAngle: number;
  leftKneeAngle: number;
  rightHipAngle: number;
  rightKneeAngle: number;
}

export const POSE_FIELDS: (keyof Pose)[] = [
  "hipX",
  "hipY",
  "torsoAngle",
  "leftShoulderAngle",
  "leftElbowAngle",
  "rightShoulderAngle",
  "rightElbowAngle",
  "leftHipAngle",
  "leftKneeAngle",
  "rightHipAngle",
  "rightKneeAngle",
];

export const LENGTHS = {
  torso: 34,
  upperArm: 20,
  forearm: 18,
  thigh: 24,
  shin: 22,
  headRadius: 11,
};

export interface Point {
  x: number;
  y: number;
}

export interface Skeleton {
  hip: Point;
  shoulder: Point;
  head: Point;
  leftElbow: Point;
  leftHand: Point;
  rightElbow: Point;
  rightHand: Point;
  leftKnee: Point;
  leftFoot: Point;
  rightKnee: Point;
  rightFoot: Point;
}

function vec(angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.sin(rad), y: -Math.cos(rad) };
}

function extend(from: Point, angleDeg: number, length: number): Point {
  const v = vec(angleDeg);
  return { x: from.x + v.x * length, y: from.y + v.y * length };
}

export function computeSkeleton(pose: Pose): Skeleton {
  const hip = { x: pose.hipX, y: pose.hipY };
  const shoulder = extend(hip, pose.torsoAngle, LENGTHS.torso);
  const head = extend(shoulder, pose.torsoAngle, LENGTHS.headRadius * 1.4);
  const leftElbow = extend(shoulder, pose.leftShoulderAngle, LENGTHS.upperArm);
  const leftHand = extend(leftElbow, pose.leftElbowAngle, LENGTHS.forearm);
  const rightElbow = extend(shoulder, pose.rightShoulderAngle, LENGTHS.upperArm);
  const rightHand = extend(rightElbow, pose.rightElbowAngle, LENGTHS.forearm);
  const leftKnee = extend(hip, pose.leftHipAngle, LENGTHS.thigh);
  const leftFoot = extend(leftKnee, pose.leftKneeAngle, LENGTHS.shin);
  const rightKnee = extend(hip, pose.rightHipAngle, LENGTHS.thigh);
  const rightFoot = extend(rightKnee, pose.rightKneeAngle, LENGTHS.shin);
  return { hip, shoulder, head, leftElbow, leftHand, rightElbow, rightHand, leftKnee, leftFoot, rightKnee, rightFoot };
}
