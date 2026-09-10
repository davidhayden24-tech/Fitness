import type { Pose } from "./pose";

// Each pattern is a short loop of keyframe poses. These were prototyped and
// visually checked as static SVG renders before being ported here - see the
// project notes for the prototype. They're intentionally simple: a stylized
// placeholder for real exercise video/animation, not biomechanically exact.
export const PATTERNS = {
  squat: [
    { hipX: 60, hipY: 85, torsoAngle: 5, leftShoulderAngle: 175, leftElbowAngle: 178, rightShoulderAngle: -175, rightElbowAngle: -178, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 },
    { hipX: 60, hipY: 118, torsoAngle: 15, leftShoulderAngle: 170, leftElbowAngle: 165, rightShoulderAngle: -170, rightElbowAngle: -165, leftHipAngle: 150, leftKneeAngle: 205, rightHipAngle: -150, rightKneeAngle: -205 },
  ],
  lunge: [
    { hipX: 60, hipY: 85, torsoAngle: 5, leftShoulderAngle: 165, leftElbowAngle: 160, rightShoulderAngle: -160, rightElbowAngle: -150, leftHipAngle: 165, leftKneeAngle: 178, rightHipAngle: -165, rightKneeAngle: -178 },
    { hipX: 60, hipY: 108, torsoAngle: 8, leftShoulderAngle: 165, leftElbowAngle: 160, rightShoulderAngle: -160, rightElbowAngle: -150, leftHipAngle: 145, leftKneeAngle: 220, rightHipAngle: -195, rightKneeAngle: -165 },
  ],
  pushup: [
    { hipX: 55, hipY: 95, torsoAngle: 92, leftShoulderAngle: 30, leftElbowAngle: 170, rightShoulderAngle: -30, rightElbowAngle: -170, leftHipAngle: 92, leftKneeAngle: 175, rightHipAngle: 92, rightKneeAngle: -175 },
    { hipX: 55, hipY: 100, torsoAngle: 92, leftShoulderAngle: 40, leftElbowAngle: 120, rightShoulderAngle: -40, rightElbowAngle: -120, leftHipAngle: 92, leftKneeAngle: 175, rightHipAngle: 92, rightKneeAngle: -175 },
  ],
  overhead_press: [
    { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 30, leftElbowAngle: 20, rightShoulderAngle: -30, rightElbowAngle: -20, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 },
    { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 15, leftElbowAngle: 5, rightShoulderAngle: -15, rightElbowAngle: -5, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 },
  ],
  dip: [
    { hipX: 60, hipY: 90, torsoAngle: 5, leftShoulderAngle: 160, leftElbowAngle: 178, rightShoulderAngle: -160, rightElbowAngle: -178, leftHipAngle: 150, leftKneeAngle: 95, rightHipAngle: -150, rightKneeAngle: -95 },
    { hipX: 60, hipY: 105, torsoAngle: 5, leftShoulderAngle: 155, leftElbowAngle: 130, rightShoulderAngle: -155, rightElbowAngle: -130, leftHipAngle: 150, leftKneeAngle: 95, rightHipAngle: -150, rightKneeAngle: -95 },
  ],
  back_extension: [
    { hipX: 55, hipY: 100, torsoAngle: 88, leftShoulderAngle: 60, leftElbowAngle: 60, rightShoulderAngle: 60, rightElbowAngle: 60, leftHipAngle: 88, leftKneeAngle: 178, rightHipAngle: 88, rightKneeAngle: -178 },
    { hipX: 55, hipY: 100, torsoAngle: 70, leftShoulderAngle: 30, leftElbowAngle: 30, rightShoulderAngle: 30, rightElbowAngle: 30, leftHipAngle: 88, leftKneeAngle: 178, rightHipAngle: 88, rightKneeAngle: -178 },
  ],
  plank_hold: [
    { hipX: 55, hipY: 95, torsoAngle: 92, leftShoulderAngle: 25, leftElbowAngle: 178, rightShoulderAngle: -25, rightElbowAngle: -178, leftHipAngle: 92, leftKneeAngle: 175, rightHipAngle: 92, rightKneeAngle: -175 },
    { hipX: 55, hipY: 97, torsoAngle: 90, leftShoulderAngle: 25, leftElbowAngle: 178, rightShoulderAngle: -25, rightElbowAngle: -178, leftHipAngle: 90, leftKneeAngle: 175, rightHipAngle: 90, rightKneeAngle: -175 },
  ],
  arm_circle: [
    { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 30, leftElbowAngle: 25, rightShoulderAngle: -30, rightElbowAngle: -25, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 },
    { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: -80, leftElbowAngle: -75, rightShoulderAngle: 80, rightElbowAngle: 75, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 },
  ],
  bicep_curl: [
    { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 170, leftElbowAngle: 175, rightShoulderAngle: -170, rightElbowAngle: -175, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 },
    { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 170, leftElbowAngle: 60, rightShoulderAngle: -170, rightElbowAngle: -60, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 },
  ],
  wrist_flex: [
    { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 100, leftElbowAngle: 95, rightShoulderAngle: -100, rightElbowAngle: -95, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 },
    { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 100, leftElbowAngle: 115, rightShoulderAngle: -100, rightElbowAngle: -115, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 },
  ],
  situp: [
    { hipX: 60, hipY: 100, torsoAngle: 92, leftShoulderAngle: 92, leftElbowAngle: 95, rightShoulderAngle: 92, rightElbowAngle: -95, leftHipAngle: 60, leftKneeAngle: 235, rightHipAngle: 60, rightKneeAngle: -235 },
    { hipX: 60, hipY: 100, torsoAngle: 40, leftShoulderAngle: 40, leftElbowAngle: 45, rightShoulderAngle: 40, rightElbowAngle: -45, leftHipAngle: 60, leftKneeAngle: 235, rightHipAngle: 60, rightKneeAngle: -235 },
  ],
  side_plank: [
    { hipX: 55, hipY: 100, torsoAngle: 92, leftShoulderAngle: -5, leftElbowAngle: 178, rightShoulderAngle: 45, rightElbowAngle: 30, leftHipAngle: 92, leftKneeAngle: 178, rightHipAngle: 92, rightKneeAngle: 178 },
    { hipX: 55, hipY: 102, torsoAngle: 90, leftShoulderAngle: -5, leftElbowAngle: 178, rightShoulderAngle: 45, rightElbowAngle: 30, leftHipAngle: 90, leftKneeAngle: 178, rightHipAngle: 90, rightKneeAngle: 178 },
  ],
  twist: [
    { hipX: 60, hipY: 92, torsoAngle: 5, leftShoulderAngle: 60, leftElbowAngle: 90, rightShoulderAngle: -60, rightElbowAngle: -90, leftHipAngle: 155, leftKneeAngle: 220, rightHipAngle: -155, rightKneeAngle: -220 },
    { hipX: 60, hipY: 92, torsoAngle: -20, leftShoulderAngle: 100, leftElbowAngle: 130, rightShoulderAngle: -20, rightElbowAngle: -50, leftHipAngle: 155, leftKneeAngle: 220, rightHipAngle: -155, rightKneeAngle: -220 },
  ],
  mountain_climber: [
    { hipX: 55, hipY: 95, torsoAngle: 92, leftShoulderAngle: 25, leftElbowAngle: 178, rightShoulderAngle: -25, rightElbowAngle: -178, leftHipAngle: 92, leftKneeAngle: 175, rightHipAngle: 92, rightKneeAngle: -175 },
    { hipX: 55, hipY: 95, torsoAngle: 92, leftShoulderAngle: 25, leftElbowAngle: 178, rightShoulderAngle: -25, rightElbowAngle: -178, leftHipAngle: 130, leftKneeAngle: 60, rightHipAngle: 92, rightKneeAngle: -175 },
  ],
  hip_bridge: [
    { hipX: 60, hipY: 108, torsoAngle: 92, leftShoulderAngle: 92, leftElbowAngle: 95, rightShoulderAngle: 92, rightElbowAngle: -95, leftHipAngle: 150, leftKneeAngle: 65, rightHipAngle: -150, rightKneeAngle: -65 },
    { hipX: 60, hipY: 92, torsoAngle: 100, leftShoulderAngle: 92, leftElbowAngle: 95, rightShoulderAngle: 92, rightElbowAngle: -95, leftHipAngle: 150, leftKneeAngle: 65, rightHipAngle: -150, rightKneeAngle: -65 },
  ],
  calf_raise: [
    { hipX: 60, hipY: 90, torsoAngle: 0, leftShoulderAngle: 170, leftElbowAngle: 175, rightShoulderAngle: -170, rightElbowAngle: -175, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 },
    { hipX: 60, hipY: 82, torsoAngle: 0, leftShoulderAngle: 170, leftElbowAngle: 175, rightShoulderAngle: -170, rightElbowAngle: -175, leftHipAngle: 170, leftKneeAngle: 188, rightHipAngle: -170, rightKneeAngle: -188 },
  ],
  march: [
    { hipX: 60, hipY: 90, torsoAngle: 0, leftShoulderAngle: 150, leftElbowAngle: 155, rightShoulderAngle: -60, rightElbowAngle: -90, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -140, rightKneeAngle: -220 },
    { hipX: 60, hipY: 90, torsoAngle: 0, leftShoulderAngle: 60, leftElbowAngle: 90, rightShoulderAngle: -150, rightElbowAngle: -155, leftHipAngle: 140, leftKneeAngle: 220, rightHipAngle: -170, rightKneeAngle: -178 },
  ],
  jumping_jack: [
    { hipX: 60, hipY: 90, torsoAngle: 0, leftShoulderAngle: 165, leftElbowAngle: 170, rightShoulderAngle: -165, rightElbowAngle: -170, leftHipAngle: 172, leftKneeAngle: 178, rightHipAngle: -172, rightKneeAngle: -178 },
    { hipX: 60, hipY: 78, torsoAngle: 0, leftShoulderAngle: 10, leftElbowAngle: 10, rightShoulderAngle: -10, rightElbowAngle: -10, leftHipAngle: 140, leftKneeAngle: 165, rightHipAngle: -140, rightKneeAngle: -165 },
  ],
  bear_crawl: [
    { hipX: 55, hipY: 100, torsoAngle: 100, leftShoulderAngle: 20, leftElbowAngle: 178, rightShoulderAngle: -20, rightElbowAngle: -178, leftHipAngle: 110, leftKneeAngle: 60, rightHipAngle: 100, rightKneeAngle: 175 },
    { hipX: 55, hipY: 100, torsoAngle: 100, leftShoulderAngle: 20, leftElbowAngle: 178, rightShoulderAngle: -20, rightElbowAngle: -178, leftHipAngle: 100, leftKneeAngle: 175, rightHipAngle: 110, rightKneeAngle: 60 },
  ],
  stretch_hold: [
    { hipX: 60, hipY: 92, torsoAngle: 30, leftShoulderAngle: 40, leftElbowAngle: 35, rightShoulderAngle: -40, rightElbowAngle: -35, leftHipAngle: 160, leftKneeAngle: 172, rightHipAngle: -178, rightKneeAngle: -172 },
    { hipX: 60, hipY: 92, torsoAngle: 40, leftShoulderAngle: 50, leftElbowAngle: 45, rightShoulderAngle: -50, rightElbowAngle: -45, leftHipAngle: 160, leftKneeAngle: 172, rightHipAngle: -178, rightKneeAngle: -172 },
  ],
} satisfies Record<string, [Pose, Pose]>;

export type AnimationPattern = keyof typeof PATTERNS;
