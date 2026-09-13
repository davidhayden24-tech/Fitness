import { POSE_FIELDS, type Pose } from "./pose";

// Each pattern is a short loop of keyframe poses (>=3 phases: a start
// pose, one or more in-between poses, and an end pose). ExerciseAnimation
// plays forward through all of them, then backward, for a continuous
// loop. These were prototyped and visually checked as static SVG renders
// before being ported here. They're intentionally simple: a stylized
// placeholder for real exercise video/animation, not biomechanically
// exact.

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Blend two poses field-by-field at progress `t`, with optional per-field
// overrides so a "mid" keyframe can reflect realistic staggered joint
// timing (e.g. knees bending before the torso leans) instead of a
// mechanical straight-line average of the two endpoints - that staggering
// is what keeps the in-between pose from looking like it's just sitting
// on the straight-line path between start and end.
function blend(a: Pose, b: Pose, t: number, overrides: Partial<Record<keyof Pose, number>> = {}): Pose {
  const result = {} as Pose;
  for (const key of POSE_FIELDS) {
    const ft = overrides[key] ?? t;
    result[key] = lerp(a[key], b[key], ft);
  }
  return result;
}

const squatTop: Pose = { hipX: 60, hipY: 85, torsoAngle: 5, leftShoulderAngle: 175, leftElbowAngle: 178, rightShoulderAngle: -175, rightElbowAngle: -178, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 };
const squatBottom: Pose = { hipX: 60, hipY: 118, torsoAngle: 15, leftShoulderAngle: 170, leftElbowAngle: 165, rightShoulderAngle: -170, rightElbowAngle: -165, leftHipAngle: 150, leftKneeAngle: 205, rightHipAngle: -150, rightKneeAngle: -205 };

const lungeTop: Pose = { hipX: 60, hipY: 85, torsoAngle: 5, leftShoulderAngle: 165, leftElbowAngle: 160, rightShoulderAngle: -160, rightElbowAngle: -150, leftHipAngle: 165, leftKneeAngle: 178, rightHipAngle: -165, rightKneeAngle: -178 };
const lungeBottom: Pose = { hipX: 60, hipY: 108, torsoAngle: 8, leftShoulderAngle: 165, leftElbowAngle: 160, rightShoulderAngle: -160, rightElbowAngle: -150, leftHipAngle: 145, leftKneeAngle: 220, rightHipAngle: -195, rightKneeAngle: -165 };

// The leg must extend AWAY from the torso (hip angle = torsoAngle - 180,
// not torsoAngle itself) for a straight plank line - setting it equal to
// torsoAngle instead makes the thigh collinear with (and hidden behind)
// the torso, leaving only the bent-looking shin visible and making the
// whole pose read as a folded crouch instead of a straight-body pushup.
const pushupTop: Pose = { hipX: 55, hipY: 95, torsoAngle: 92, leftShoulderAngle: 30, leftElbowAngle: 170, rightShoulderAngle: -30, rightElbowAngle: -170, leftHipAngle: -88, leftKneeAngle: -88, rightHipAngle: -88, rightKneeAngle: -88 };
const pushupBottom: Pose = { hipX: 55, hipY: 100, torsoAngle: 92, leftShoulderAngle: 40, leftElbowAngle: 120, rightShoulderAngle: -40, rightElbowAngle: -120, leftHipAngle: -88, leftKneeAngle: -88, rightHipAngle: -88, rightKneeAngle: -88 };

const overheadTop: Pose = { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 30, leftElbowAngle: 20, rightShoulderAngle: -30, rightElbowAngle: -20, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 };
const overheadBottom: Pose = { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 15, leftElbowAngle: 5, rightShoulderAngle: -15, rightElbowAngle: -5, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 };

const dipTop: Pose = { hipX: 60, hipY: 90, torsoAngle: 5, leftShoulderAngle: 160, leftElbowAngle: 178, rightShoulderAngle: -160, rightElbowAngle: -178, leftHipAngle: 150, leftKneeAngle: 95, rightHipAngle: -150, rightKneeAngle: -95 };
const dipBottom: Pose = { hipX: 60, hipY: 105, torsoAngle: 5, leftShoulderAngle: 155, leftElbowAngle: 130, rightShoulderAngle: -155, rightElbowAngle: -130, leftHipAngle: 150, leftKneeAngle: 95, rightHipAngle: -150, rightKneeAngle: -95 };

// Legs stay planted on the ground throughout - only the chest/torso
// lifts - so they use a fixed angle (opposite the resting torsoAngle, not
// whatever the torso rotates to mid-lift).
const backExtTop: Pose = { hipX: 55, hipY: 100, torsoAngle: 88, leftShoulderAngle: 60, leftElbowAngle: 60, rightShoulderAngle: 60, rightElbowAngle: 60, leftHipAngle: -92, leftKneeAngle: -92, rightHipAngle: -92, rightKneeAngle: -92 };
const backExtBottom: Pose = { hipX: 55, hipY: 100, torsoAngle: 70, leftShoulderAngle: 30, leftElbowAngle: 30, rightShoulderAngle: 30, rightElbowAngle: 30, leftHipAngle: -92, leftKneeAngle: -92, rightHipAngle: -92, rightKneeAngle: -92 };

const plankTop: Pose = { hipX: 55, hipY: 95, torsoAngle: 92, leftShoulderAngle: 25, leftElbowAngle: 178, rightShoulderAngle: -25, rightElbowAngle: -178, leftHipAngle: -88, leftKneeAngle: -88, rightHipAngle: -88, rightKneeAngle: -88 };
const plankBottom: Pose = { hipX: 55, hipY: 97, torsoAngle: 90, leftShoulderAngle: 25, leftElbowAngle: 178, rightShoulderAngle: -25, rightElbowAngle: -178, leftHipAngle: -90, leftKneeAngle: -90, rightHipAngle: -90, rightKneeAngle: -90 };

const armCircleTop: Pose = { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 30, leftElbowAngle: 25, rightShoulderAngle: -30, rightElbowAngle: -25, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 };
const armCircleBottom: Pose = { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: -80, leftElbowAngle: -75, rightShoulderAngle: 80, rightElbowAngle: 75, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 };

const curlTop: Pose = { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 170, leftElbowAngle: 175, rightShoulderAngle: -170, rightElbowAngle: -175, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 };
const curlBottom: Pose = { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 170, leftElbowAngle: 60, rightShoulderAngle: -170, rightElbowAngle: -60, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 };

const wristTop: Pose = { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 100, leftElbowAngle: 95, rightShoulderAngle: -100, rightElbowAngle: -95, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 };
const wristBottom: Pose = { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 100, leftElbowAngle: 115, rightShoulderAngle: -100, rightElbowAngle: -115, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 };

const situpTop: Pose = { hipX: 60, hipY: 100, torsoAngle: 92, leftShoulderAngle: 92, leftElbowAngle: 95, rightShoulderAngle: 92, rightElbowAngle: -95, leftHipAngle: 60, leftKneeAngle: 235, rightHipAngle: 60, rightKneeAngle: -235 };
const situpBottom: Pose = { hipX: 60, hipY: 100, torsoAngle: 40, leftShoulderAngle: 40, leftElbowAngle: 45, rightShoulderAngle: 40, rightElbowAngle: -45, leftHipAngle: 60, leftKneeAngle: 235, rightHipAngle: 60, rightKneeAngle: -235 };

const sidePlankTop: Pose = { hipX: 55, hipY: 100, torsoAngle: 92, leftShoulderAngle: -5, leftElbowAngle: 178, rightShoulderAngle: 45, rightElbowAngle: 30, leftHipAngle: -88, leftKneeAngle: -88, rightHipAngle: -88, rightKneeAngle: -88 };
const sidePlankBottom: Pose = { hipX: 55, hipY: 102, torsoAngle: 90, leftShoulderAngle: -5, leftElbowAngle: 178, rightShoulderAngle: 45, rightElbowAngle: 30, leftHipAngle: -90, leftKneeAngle: -90, rightHipAngle: -90, rightKneeAngle: -90 };

const twistTop: Pose = { hipX: 60, hipY: 92, torsoAngle: 5, leftShoulderAngle: 60, leftElbowAngle: 90, rightShoulderAngle: -60, rightElbowAngle: -90, leftHipAngle: 155, leftKneeAngle: 220, rightHipAngle: -155, rightKneeAngle: -220 };
const twistBottom: Pose = { hipX: 60, hipY: 92, torsoAngle: -20, leftShoulderAngle: 100, leftElbowAngle: 130, rightShoulderAngle: -20, rightElbowAngle: -50, leftHipAngle: 155, leftKneeAngle: 220, rightHipAngle: -155, rightKneeAngle: -220 };

// The right leg is the stationary planted leg throughout - stays a
// straight extended plank leg. The left leg drives forward and folds
// sharply as the knee comes up toward the chest.
const climberTop: Pose = { hipX: 55, hipY: 95, torsoAngle: 92, leftShoulderAngle: 25, leftElbowAngle: 178, rightShoulderAngle: -25, rightElbowAngle: -178, leftHipAngle: -88, leftKneeAngle: -88, rightHipAngle: -88, rightKneeAngle: -88 };
const climberBottom: Pose = { hipX: 55, hipY: 95, torsoAngle: 92, leftShoulderAngle: 25, leftElbowAngle: 178, rightShoulderAngle: -25, rightElbowAngle: -178, leftHipAngle: 30, leftKneeAngle: 130, rightHipAngle: -88, rightKneeAngle: -88 };

const bridgeTop: Pose = { hipX: 60, hipY: 108, torsoAngle: 92, leftShoulderAngle: 92, leftElbowAngle: 95, rightShoulderAngle: 92, rightElbowAngle: -95, leftHipAngle: 150, leftKneeAngle: 65, rightHipAngle: -150, rightKneeAngle: -65 };
const bridgeBottom: Pose = { hipX: 60, hipY: 92, torsoAngle: 100, leftShoulderAngle: 92, leftElbowAngle: 95, rightShoulderAngle: 92, rightElbowAngle: -95, leftHipAngle: 150, leftKneeAngle: 65, rightHipAngle: -150, rightKneeAngle: -65 };

const calfTop: Pose = { hipX: 60, hipY: 90, torsoAngle: 0, leftShoulderAngle: 170, leftElbowAngle: 175, rightShoulderAngle: -170, rightElbowAngle: -175, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 };
const calfBottom: Pose = { hipX: 60, hipY: 82, torsoAngle: 0, leftShoulderAngle: 170, leftElbowAngle: 175, rightShoulderAngle: -170, rightElbowAngle: -175, leftHipAngle: 170, leftKneeAngle: 188, rightHipAngle: -170, rightKneeAngle: -188 };

const marchTop: Pose = { hipX: 60, hipY: 90, torsoAngle: 0, leftShoulderAngle: 150, leftElbowAngle: 155, rightShoulderAngle: -60, rightElbowAngle: -90, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -140, rightKneeAngle: -220 };
const marchBottom: Pose = { hipX: 60, hipY: 90, torsoAngle: 0, leftShoulderAngle: 60, leftElbowAngle: 90, rightShoulderAngle: -150, rightElbowAngle: -155, leftHipAngle: 140, leftKneeAngle: 220, rightHipAngle: -170, rightKneeAngle: -178 };

const jackTop: Pose = { hipX: 60, hipY: 90, torsoAngle: 0, leftShoulderAngle: 165, leftElbowAngle: 170, rightShoulderAngle: -165, rightElbowAngle: -170, leftHipAngle: 172, leftKneeAngle: 178, rightHipAngle: -172, rightKneeAngle: -178 };
const jackBottom: Pose = { hipX: 60, hipY: 78, torsoAngle: 0, leftShoulderAngle: 10, leftElbowAngle: 10, rightShoulderAngle: -10, rightElbowAngle: -10, leftHipAngle: 140, leftKneeAngle: 165, rightHipAngle: -140, rightKneeAngle: -165 };

const bearTop: Pose = { hipX: 55, hipY: 100, torsoAngle: 100, leftShoulderAngle: 20, leftElbowAngle: 178, rightShoulderAngle: -20, rightElbowAngle: -178, leftHipAngle: -70, leftKneeAngle: -120, rightHipAngle: -80, rightKneeAngle: -5 };
const bearBottom: Pose = { hipX: 55, hipY: 100, torsoAngle: 100, leftShoulderAngle: 20, leftElbowAngle: 178, rightShoulderAngle: -20, rightElbowAngle: -178, leftHipAngle: -80, leftKneeAngle: -5, rightHipAngle: -70, rightKneeAngle: -120 };

const stretchTop: Pose = { hipX: 60, hipY: 92, torsoAngle: 30, leftShoulderAngle: 40, leftElbowAngle: 35, rightShoulderAngle: -40, rightElbowAngle: -35, leftHipAngle: 160, leftKneeAngle: 172, rightHipAngle: -178, rightKneeAngle: -172 };
const stretchBottom: Pose = { hipX: 60, hipY: 92, torsoAngle: 40, leftShoulderAngle: 50, leftElbowAngle: 45, rightShoulderAngle: -50, rightElbowAngle: -45, leftHipAngle: 160, leftKneeAngle: 172, rightHipAngle: -178, rightKneeAngle: -172 };

export const PATTERNS = {
  // Legs bend and the hip drops before the torso finishes leaning forward.
  squat: [squatTop, blend(squatTop, squatBottom, 0.5, { hipY: 0.62, leftHipAngle: 0.65, rightHipAngle: 0.65, leftKneeAngle: 0.65, rightKneeAngle: 0.65, torsoAngle: 0.35 }), squatBottom],
  lunge: [lungeTop, blend(lungeTop, lungeBottom, 0.5, { hipY: 0.62, leftHipAngle: 0.65, rightHipAngle: 0.65, leftKneeAngle: 0.65, rightKneeAngle: 0.65, torsoAngle: 0.35 }), lungeBottom],
  // Elbows bend first, shoulders (upper-arm angle) catch up.
  pushup: [pushupTop, blend(pushupTop, pushupBottom, 0.5, { leftElbowAngle: 0.65, rightElbowAngle: 0.65, leftShoulderAngle: 0.35, rightShoulderAngle: 0.35 }), pushupBottom],
  overhead_press: [overheadTop, blend(overheadTop, overheadBottom, 0.5, { leftElbowAngle: 0.6, rightElbowAngle: 0.6, leftShoulderAngle: 0.4, rightShoulderAngle: 0.4 }), overheadBottom],
  dip: [dipTop, blend(dipTop, dipBottom, 0.5, { leftElbowAngle: 0.6, rightElbowAngle: 0.6, leftShoulderAngle: 0.4, rightShoulderAngle: 0.4 }), dipBottom],
  // Torso leads the extension, arms trail slightly.
  back_extension: [backExtTop, blend(backExtTop, backExtBottom, 0.5, { torsoAngle: 0.6, leftShoulderAngle: 0.4, rightShoulderAngle: 0.4, leftElbowAngle: 0.4, rightElbowAngle: 0.4 }), backExtBottom],
  plank_hold: [plankTop, blend(plankTop, plankBottom, 0.5), plankBottom],
  // Shoulders lead the circular sweep, elbows trail.
  arm_circle: [armCircleTop, blend(armCircleTop, armCircleBottom, 0.5, { leftShoulderAngle: 0.55, rightShoulderAngle: 0.55, leftElbowAngle: 0.45, rightElbowAngle: 0.45 }), armCircleBottom],
  bicep_curl: [curlTop, blend(curlTop, curlBottom, 0.5), curlBottom],
  wrist_flex: [wristTop, blend(wristTop, wristBottom, 0.5), wristBottom],
  // Torso and arms curl up together, ahead of a plain linear blend.
  situp: [situpTop, blend(situpTop, situpBottom, 0.5, { torsoAngle: 0.55, leftShoulderAngle: 0.55, rightShoulderAngle: 0.55, leftElbowAngle: 0.55, rightElbowAngle: 0.55 }), situpBottom],
  side_plank: [sidePlankTop, blend(sidePlankTop, sidePlankBottom, 0.5), sidePlankBottom],
  // Torso rotation leads, arms follow the swing.
  twist: [twistTop, blend(twistTop, twistBottom, 0.5, { torsoAngle: 0.6, leftShoulderAngle: 0.4, rightShoulderAngle: 0.4, leftElbowAngle: 0.4, rightElbowAngle: 0.4 }), twistBottom],
  // The driving knee snaps up faster than the hip swings.
  mountain_climber: [climberTop, blend(climberTop, climberBottom, 0.5, { leftHipAngle: 0.55, leftKneeAngle: 0.65 }), climberBottom],
  // Hips drive the bridge, torso catches up.
  hip_bridge: [bridgeTop, blend(bridgeTop, bridgeBottom, 0.5, { hipY: 0.6, torsoAngle: 0.4 }), bridgeBottom],
  calf_raise: [calfTop, blend(calfTop, calfBottom, 0.5, { hipY: 0.6 }), calfBottom],
  march: [marchTop, blend(marchTop, marchBottom, 0.5), marchBottom],
  // Arms swing up ahead of the legs jumping apart.
  jumping_jack: [jackTop, blend(jackTop, jackBottom, 0.5, { leftShoulderAngle: 0.6, rightShoulderAngle: 0.6, leftElbowAngle: 0.6, rightElbowAngle: 0.6, leftHipAngle: 0.45, rightHipAngle: 0.45, leftKneeAngle: 0.45, rightKneeAngle: 0.45 }), jackBottom],
  // The reaching hand/knee pair leads the crawl step.
  bear_crawl: [bearTop, blend(bearTop, bearBottom, 0.5, { leftHipAngle: 0.6, leftKneeAngle: 0.65 }), bearBottom],
  stretch_hold: [stretchTop, blend(stretchTop, stretchBottom, 0.5, { torsoAngle: 0.55 }), stretchBottom],
} satisfies Record<string, Pose[]>;

export type AnimationPattern = keyof typeof PATTERNS;
