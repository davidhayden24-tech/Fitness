// One animation per exercise (89 total, matching apps/backend/src/data/
// exercises.ts) rather than one shared pattern per substitute group. Most
// entries are built by taking a base movement from patterns.ts (or a
// hand-authored pose for movements the base set doesn't cover - lying,
// seated, quadruped, inverted, multi-phase like a burpee) and applying a
// small set of composable tweaks: widen/narrow a stance, raise/lower
// amplitude for an isometric hold, lock one limb out for a single-limb
// variant, mirror left/right, or nudge a joint to a different target
// angle. A deterministic per-id jitter is layered on last so that even
// two exercises sharing an otherwise-identical base movement never
// render numerically identical animations.
import type { Pose } from "./pose";
import { PATTERNS, type AnimationPattern } from "./patterns";

type Keyframes = Pose[];

function base(name: AnimationPattern): Keyframes {
  return PATTERNS[name];
}

function p(from: Pose, overrides: Partial<Pose>): Pose {
  return { ...from, ...overrides };
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const result = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((key) => {
    result[key] = a[key] + (b[key] - a[key]) * t;
  });
  return result;
}

// Most custom (non-base-movement) exercises just need a start and end
// pose - this fills in a natural-looking midpoint so every animation
// still gets the 3-keyframe treatment the rest of the app relies on.
function threePhase(a: Pose, b: Pose, t = 0.5): Keyframes {
  return [a, lerpPose(a, b, t), b];
}

function seq(...poses: Pose[]): Keyframes {
  return poses;
}

function shift(kf: Keyframes, field: keyof Pose, delta: number): Keyframes {
  return kf.map((pose) => ({ ...pose, [field]: pose[field] + delta }));
}

// Scales how far each keyframe's field strays from its value at
// `baseIndex` - >1 exaggerates the range (a bigger sweep), <1 compresses
// it (an isometric hold barely moving from its starting position).
function scaleFrom(kf: Keyframes, field: keyof Pose, factor: number, baseIndex = 0): Keyframes {
  const anchor = kf[baseIndex][field];
  return kf.map((pose) => ({ ...pose, [field]: anchor + (pose[field] - anchor) * factor }));
}

function setField(kf: Keyframes, field: keyof Pose, value: number): Keyframes {
  return kf.map((pose) => ({ ...pose, [field]: value }));
}

function mirrorPose(pose: Pose): Pose {
  return {
    ...pose,
    leftShoulderAngle: pose.rightShoulderAngle,
    rightShoulderAngle: pose.leftShoulderAngle,
    leftElbowAngle: pose.rightElbowAngle,
    rightElbowAngle: pose.leftElbowAngle,
    leftHipAngle: pose.rightHipAngle,
    rightHipAngle: pose.leftHipAngle,
    leftKneeAngle: pose.rightKneeAngle,
    rightKneeAngle: pose.leftKneeAngle,
  };
}

function mirrorLR(kf: Keyframes): Keyframes {
  return kf.map(mirrorPose);
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h >>> 0;
}

const ANGLE_FIELDS: (keyof Pose)[] = [
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

function jitter(kf: Keyframes, id: string, amount = 2.5): Keyframes {
  const h = hashId(id);
  return kf.map((pose, i) => {
    const next = { ...pose };
    ANGLE_FIELDS.forEach((field, fi) => {
      const seed = (h + i * 131 + fi * 977) & 0xff;
      next[field] = pose[field] + ((seed / 255) * 2 - 1) * amount;
    });
    return next;
  });
}

// Reusable starting poses for movements the 20 base patterns don't cover.
const STAND: Pose = { hipX: 60, hipY: 85, torsoAngle: 0, leftShoulderAngle: 170, leftElbowAngle: 175, rightShoulderAngle: -170, rightElbowAngle: -175, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: -170, rightKneeAngle: -178 };
const PRONE: Pose = { hipX: 55, hipY: 95, torsoAngle: 92, leftShoulderAngle: 25, leftElbowAngle: 178, rightShoulderAngle: -25, rightElbowAngle: -178, leftHipAngle: 92, leftKneeAngle: 175, rightHipAngle: 92, rightKneeAngle: -175 };
const SUPINE: Pose = { hipX: 60, hipY: 100, torsoAngle: 90, leftShoulderAngle: 90, leftElbowAngle: 95, rightShoulderAngle: 90, rightElbowAngle: -95, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: 170, rightKneeAngle: -178 };
const QUADRUPED: Pose = { hipX: 55, hipY: 100, torsoAngle: 100, leftShoulderAngle: 20, leftElbowAngle: 178, rightShoulderAngle: -20, rightElbowAngle: -178, leftHipAngle: 100, leftKneeAngle: 60, rightHipAngle: 100, rightKneeAngle: 60 };
const SEATED: Pose = { hipX: 60, hipY: 100, torsoAngle: 8, leftShoulderAngle: 60, leftElbowAngle: 90, rightShoulderAngle: -60, rightElbowAngle: -90, leftHipAngle: 92, leftKneeAngle: 178, rightHipAngle: 92, rightKneeAngle: -178 };

// Shared custom poses referenced by more than one exercise below.
const pikeTop = p(PRONE, { torsoAngle: 108, leftShoulderAngle: 35, leftElbowAngle: 170, rightShoulderAngle: -35, rightElbowAngle: -170, leftHipAngle: 60, rightHipAngle: 60 });
const pikeBottom = p(pikeTop, { leftShoulderAngle: 48, leftElbowAngle: 120, rightShoulderAngle: -48, rightElbowAngle: -120 });
const reversePlankPose: Pose = { hipX: 55, hipY: 96, torsoAngle: 88, leftShoulderAngle: 130, leftElbowAngle: 172, rightShoulderAngle: 130, rightElbowAngle: 172, leftHipAngle: 92, leftKneeAngle: 175, rightHipAngle: 92, rightKneeAngle: 175 };
const quadrupedNeutral = p(QUADRUPED, {});
const burpeeSquatDown = p(STAND, { hipY: 100, torsoAngle: 20, leftHipAngle: 150, rightHipAngle: -150, leftKneeAngle: 205, rightKneeAngle: -205, leftShoulderAngle: 120, rightShoulderAngle: -120 });
const foldPose = p(STAND, { torsoAngle: 70, leftShoulderAngle: 90, leftElbowAngle: 88, rightShoulderAngle: -90, rightElbowAngle: -88, leftKneeAngle: 172, rightKneeAngle: -172 });

export const EXERCISE_ANIMATIONS: Record<string, Keyframes> = {
  // --- Push -----------------------------------------------------------
  standard_pushup: jitter(base("pushup"), "standard_pushup"),
  knee_pushup: jitter(setField(setField(shift(base("pushup"), "hipY", -4), "leftKneeAngle", 70), "rightKneeAngle", -70), "knee_pushup"),
  incline_pushup: jitter(shift(base("pushup"), "torsoAngle", -24), "incline_pushup"),
  decline_pushup: jitter(shift(base("pushup"), "torsoAngle", 10), "decline_pushup"),
  wide_pushup: jitter(shift(shift(base("pushup"), "leftShoulderAngle", 15), "rightShoulderAngle", -15), "wide_pushup"),
  diamond_pushup: jitter(shift(shift(base("pushup"), "leftShoulderAngle", -18), "rightShoulderAngle", 18), "diamond_pushup"),
  wall_pushup: jitter(
    threePhase(
      p(STAND, { torsoAngle: 12, leftShoulderAngle: 70, leftElbowAngle: 165, rightShoulderAngle: -70, rightElbowAngle: -165 }),
      p(STAND, { torsoAngle: 18, leftShoulderAngle: 75, leftElbowAngle: 95, rightShoulderAngle: -75, rightElbowAngle: -95 })
    ),
    "wall_pushup"
  ),
  pike_pushup: jitter(threePhase(pikeTop, pikeBottom), "pike_pushup"),
  wall_handstand_hold: jitter(
    threePhase(
      { hipX: 60, hipY: 40, torsoAngle: 178, leftShoulderAngle: 178, leftElbowAngle: 178, rightShoulderAngle: -178, rightElbowAngle: -178, leftHipAngle: 2, leftKneeAngle: 178, rightHipAngle: -2, rightKneeAngle: -178 },
      { hipX: 60, hipY: 40, torsoAngle: 178, leftShoulderAngle: 178, leftElbowAngle: 178, rightShoulderAngle: -178, rightElbowAngle: -178, leftHipAngle: 8, leftKneeAngle: 178, rightHipAngle: -8, rightKneeAngle: -178 }
    ),
    "wall_handstand_hold"
  ),
  tricep_dip_chair: jitter(base("dip"), "tricep_dip_chair"),
  plank_up_down: jitter(
    threePhase(
      p(PRONE, { leftElbowAngle: 95, rightElbowAngle: -95, leftShoulderAngle: 15, rightShoulderAngle: -15 }),
      p(PRONE, { leftElbowAngle: 178, rightElbowAngle: -178, leftShoulderAngle: 25, rightShoulderAngle: -25 })
    ),
    "plank_up_down"
  ),

  // --- Pull / back / shoulders ------------------------------------------
  superman: jitter(base("back_extension"), "superman"),
  reverse_snow_angel: jitter(scaleFrom(scaleFrom(base("back_extension"), "leftShoulderAngle", 1.8), "rightShoulderAngle", 1.8), "reverse_snow_angel"),
  bird_dog: jitter(
    threePhase(quadrupedNeutral, p(QUADRUPED, { leftShoulderAngle: -60, leftElbowAngle: -178, rightHipAngle: 175, rightKneeAngle: 178 })),
    "bird_dog"
  ),
  prone_y_raise: jitter(scaleFrom(scaleFrom(base("back_extension"), "leftShoulderAngle", 1.3), "rightShoulderAngle", 1.3), "prone_y_raise"),
  prone_t_raise: jitter(shift(shift(base("back_extension"), "leftShoulderAngle", 30), "rightShoulderAngle", 30), "prone_t_raise"),
  reverse_plank: jitter(threePhase(reversePlankPose, p(reversePlankPose, { hipY: 93 })), "reverse_plank"),
  good_morning_bodyweight: jitter(
    threePhase(
      p(STAND, { torsoAngle: 8, leftShoulderAngle: 100, leftElbowAngle: 60, rightShoulderAngle: -100, rightElbowAngle: -60 }),
      p(STAND, { torsoAngle: 65, leftShoulderAngle: 100, leftElbowAngle: 60, rightShoulderAngle: -100, rightElbowAngle: -60, leftHipAngle: 150, rightHipAngle: -150 })
    ),
    "good_morning_bodyweight"
  ),
  arm_circles: jitter(base("arm_circle"), "arm_circles"),
  plank_shoulder_taps: jitter(threePhase(p(PRONE, {}), p(PRONE, { rightShoulderAngle: -90, rightElbowAngle: -60 })), "plank_shoulder_taps"),

  // --- Biceps / forearms --------------------------------------------------
  towel_curl_isometric: jitter(base("bicep_curl"), "towel_curl_isometric"),
  wall_bicep_press_iso: jitter(scaleFrom(scaleFrom(base("bicep_curl"), "leftElbowAngle", 0.2), "rightElbowAngle", 0.2), "wall_bicep_press_iso"),
  static_fist_squeeze: jitter(scaleFrom(scaleFrom(base("wrist_flex"), "leftElbowAngle", 0.3), "rightElbowAngle", 0.3), "static_fist_squeeze"),
  wrist_flexor_stretch_hold: jitter(base("wrist_flex"), "wrist_flexor_stretch_hold"),

  // --- Core ---------------------------------------------------------------
  crunch: jitter(scaleFrom(scaleFrom(scaleFrom(base("situp"), "torsoAngle", 0.35), "leftShoulderAngle", 0.35), "rightShoulderAngle", 0.35), "crunch"),
  bicycle_crunch: jitter(
    (() => {
      const a = p(SUPINE, { torsoAngle: 70, leftShoulderAngle: 60, leftElbowAngle: 40, rightShoulderAngle: 100, rightElbowAngle: -140, leftHipAngle: 130, leftKneeAngle: 90, rightHipAngle: 170, rightKneeAngle: 178 });
      return threePhase(a, mirrorPose(a));
    })(),
    "bicycle_crunch"
  ),
  reverse_crunch: jitter(
    threePhase(
      p(SUPINE, { leftHipAngle: 165, rightHipAngle: 165, leftKneeAngle: 178, rightKneeAngle: 178 }),
      p(SUPINE, { hipY: 96, leftHipAngle: 70, rightHipAngle: 70, leftKneeAngle: 60, rightKneeAngle: 60 })
    ),
    "reverse_crunch"
  ),
  leg_raise: jitter(
    threePhase(
      p(SUPINE, { leftHipAngle: 172, rightHipAngle: 172, leftKneeAngle: 178, rightKneeAngle: 178 }),
      p(SUPINE, { leftHipAngle: 92, rightHipAngle: 92, leftKneeAngle: 178, rightKneeAngle: 178 })
    ),
    "leg_raise"
  ),
  flutter_kicks: jitter(
    threePhase(
      p(SUPINE, { leftHipAngle: 150, rightHipAngle: 175, leftKneeAngle: 178, rightKneeAngle: 178 }),
      p(SUPINE, { leftHipAngle: 175, rightHipAngle: 150, leftKneeAngle: 178, rightKneeAngle: 178 })
    ),
    "flutter_kicks"
  ),
  plank: jitter(base("plank_hold"), "plank"),
  forearm_plank: jitter(setField(setField(base("plank_hold"), "leftElbowAngle", 95), "rightElbowAngle", -95), "forearm_plank"),
  side_plank: jitter(base("side_plank"), "side_plank"),
  side_plank_knee_bent: jitter(setField(base("side_plank"), "leftKneeAngle", 130), "side_plank_knee_bent"),
  russian_twist: jitter(base("twist"), "russian_twist"),
  mountain_climbers: jitter(base("mountain_climber"), "mountain_climbers"),
  dead_bug: jitter(
    (() => {
      const a = p(SUPINE, { leftShoulderAngle: 90, leftElbowAngle: 95, rightShoulderAngle: 20, rightElbowAngle: 15, leftHipAngle: 170, leftKneeAngle: 178, rightHipAngle: 92, rightKneeAngle: 175 });
      return threePhase(a, mirrorPose(a));
    })(),
    "dead_bug"
  ),
  hollow_body_hold: jitter(
    threePhase(
      p(SUPINE, { torsoAngle: 82, leftShoulderAngle: 15, leftElbowAngle: 10, rightShoulderAngle: 15, rightElbowAngle: -10, leftHipAngle: 155, rightHipAngle: 155 }),
      p(SUPINE, { torsoAngle: 86, leftShoulderAngle: 15, leftElbowAngle: 10, rightShoulderAngle: 15, rightElbowAngle: -10, leftHipAngle: 155, rightHipAngle: 155 })
    ),
    "hollow_body_hold"
  ),
  v_up: jitter(
    threePhase(
      p(SUPINE, { leftHipAngle: 172, rightHipAngle: 172, leftKneeAngle: 178, rightKneeAngle: 178 }),
      p(SUPINE, { torsoAngle: 50, leftShoulderAngle: 40, leftElbowAngle: 35, rightShoulderAngle: 40, rightElbowAngle: -35, leftHipAngle: 100, rightHipAngle: 100, leftKneeAngle: 178, rightKneeAngle: 178 })
    ),
    "v_up"
  ),
  standing_oblique_crunch: jitter(
    threePhase(
      p(STAND, { leftShoulderAngle: 150, leftElbowAngle: 150 }),
      p(STAND, { torsoAngle: -12, leftShoulderAngle: 60, leftElbowAngle: 40, leftHipAngle: 120, leftKneeAngle: 90 })
    ),
    "standing_oblique_crunch"
  ),
  plank_jacks: jitter(
    threePhase(
      p(PRONE, { leftHipAngle: 92, rightHipAngle: 92, leftKneeAngle: 175, rightKneeAngle: -175 }),
      p(PRONE, { leftHipAngle: 70, rightHipAngle: 110, leftKneeAngle: 165, rightKneeAngle: -165 })
    ),
    "plank_jacks"
  ),

  // --- Legs -----------------------------------------------------------
  bodyweight_squat: jitter(base("squat"), "bodyweight_squat"),
  sumo_squat: jitter(scaleFrom(base("squat"), "torsoAngle", 0.6), "sumo_squat"),
  jump_squat: jitter([base("squat")[0], base("squat")[2], p(base("squat")[0], { hipY: 78, leftHipAngle: 178, rightHipAngle: -178, leftKneeAngle: 182, rightKneeAngle: -182 })], "jump_squat"),
  wall_sit: jitter(threePhase(base("squat")[2], p(base("squat")[2], { hipY: base("squat")[2].hipY - 2 })), "wall_sit"),
  seated_leg_extension_iso: jitter(
    threePhase(
      p(SEATED, { leftHipAngle: 92, rightHipAngle: 92, leftKneeAngle: 180, rightKneeAngle: 180 }),
      p(SEATED, { leftHipAngle: 92, rightHipAngle: 92, leftKneeAngle: 95, rightKneeAngle: 180 })
    ),
    "seated_leg_extension_iso"
  ),
  lunge_forward: jitter(base("lunge"), "lunge_forward"),
  lunge_reverse: jitter(mirrorLR(base("lunge")), "lunge_reverse"),
  lunge_walking: jitter(scaleFrom(base("lunge"), "hipY", 1.3), "lunge_walking"),
  lateral_lunge: jitter(shift(base("lunge"), "torsoAngle", 6), "lateral_lunge"),
  curtsy_lunge: jitter(shift(base("lunge"), "torsoAngle", -10), "curtsy_lunge"),
  step_up: jitter(scaleFrom(shift(base("lunge"), "torsoAngle", -5), "hipY", 0.8), "step_up"),
  glute_bridge: jitter(base("hip_bridge"), "glute_bridge"),
  single_leg_glute_bridge: jitter(setField(setField(base("hip_bridge"), "rightHipAngle", -170), "rightKneeAngle", -178), "single_leg_glute_bridge"),
  hip_thrust_floor: jitter(scaleFrom(base("hip_bridge"), "hipY", 1.15), "hip_thrust_floor"),
  donkey_kick: jitter(threePhase(quadrupedNeutral, p(QUADRUPED, { rightHipAngle: 175, rightKneeAngle: 90 })), "donkey_kick"),
  fire_hydrant: jitter(threePhase(quadrupedNeutral, p(QUADRUPED, { rightHipAngle: 140, rightKneeAngle: 80 })), "fire_hydrant"),
  calf_raise: jitter(base("calf_raise"), "calf_raise"),
  single_leg_calf_raise: jitter(setField(setField(base("calf_raise"), "rightHipAngle", -150), "rightKneeAngle", -220), "single_leg_calf_raise"),
  squat_pulse: jitter(threePhase(base("squat")[2], p(base("squat")[2], { hipY: base("squat")[2].hipY - 3 })), "squat_pulse"),
  standing_march: jitter(base("march"), "standing_march"),
  high_knees: jitter(scaleFrom(scaleFrom(base("march"), "leftHipAngle", 1.3), "rightHipAngle", 1.3), "high_knees"),
  bear_crawl_hold: jitter(scaleFrom(scaleFrom(base("bear_crawl"), "leftHipAngle", 0.15), "rightHipAngle", 0.15), "bear_crawl_hold"),
  skater_hop: jitter(
    threePhase(
      p(STAND, { hipY: 88, leftHipAngle: 150, leftKneeAngle: 200, rightHipAngle: -170, rightKneeAngle: -178 }),
      p(STAND, { hipY: 80, leftHipAngle: -160, leftKneeAngle: -178, rightHipAngle: 150, rightKneeAngle: 200 })
    ),
    "skater_hop"
  ),

  // --- Full-body / cardio -----------------------------------------------
  jumping_jacks: jitter(base("jumping_jack"), "jumping_jacks"),
  burpee: jitter(seq(STAND, burpeeSquatDown, p(PRONE, {}), burpeeSquatDown, p(STAND, { hipY: 75, leftShoulderAngle: 15, leftElbowAngle: 10, rightShoulderAngle: -15, rightElbowAngle: -10, leftHipAngle: 175, rightHipAngle: -175 })), "burpee"),
  burpee_no_pushup: jitter(seq(STAND, burpeeSquatDown, p(PRONE, { leftElbowAngle: 178, rightElbowAngle: -178 }), burpeeSquatDown, p(STAND, { hipY: 75, leftShoulderAngle: 15, leftElbowAngle: 10, rightShoulderAngle: -15, rightElbowAngle: -10, leftHipAngle: 175, rightHipAngle: -175 })), "burpee_no_pushup"),
  burpee_no_jump: jitter(seq(STAND, burpeeSquatDown, p(PRONE, {}), burpeeSquatDown, STAND), "burpee_no_jump"),
  squat_thrust: jitter(seq(burpeeSquatDown, p(PRONE, {}), burpeeSquatDown), "squat_thrust"),
  inchworm: jitter(seq(STAND, foldPose, p(PRONE, {}), foldPose, STAND), "inchworm"),
  plank_walkout: jitter(seq(STAND, foldPose, p(PRONE, {}), STAND), "plank_walkout"),
  shadow_boxing: jitter(
    threePhase(
      p(STAND, { leftShoulderAngle: 90, leftElbowAngle: 60, rightShoulderAngle: -90, rightElbowAngle: -60 }),
      p(STAND, { leftShoulderAngle: 70, leftElbowAngle: 175, rightShoulderAngle: -90, rightElbowAngle: -60 })
    ),
    "shadow_boxing"
  ),
  star_jump: jitter(scaleFrom(scaleFrom(base("jumping_jack"), "leftShoulderAngle", 1.2), "hipY", 1.2), "star_jump"),
  tuck_jump: jitter(threePhase(STAND, p(STAND, { hipY: 70, leftHipAngle: 100, rightHipAngle: -100, leftKneeAngle: 40, rightKneeAngle: -40 })), "tuck_jump"),
  crab_walk: jitter(threePhase(reversePlankPose, p(reversePlankPose, { leftHipAngle: 120, leftKneeAngle: 100, rightShoulderAngle: 150 })), "crab_walk"),
  bear_crawl_forward: jitter(base("bear_crawl"), "bear_crawl_forward"),
  plank_to_downward_dog: jitter(threePhase(p(PRONE, {}), pikeTop), "plank_to_downward_dog"),

  // --- Mobility / rehab-friendly ------------------------------------------
  cat_cow_stretch: jitter(threePhase(p(QUADRUPED, { torsoAngle: 85 }), p(QUADRUPED, { torsoAngle: 115 })), "cat_cow_stretch"),
  childs_pose_hold: jitter(
    threePhase(
      { hipX: 60, hipY: 110, torsoAngle: 60, leftShoulderAngle: 60, leftElbowAngle: 170, rightShoulderAngle: 60, rightElbowAngle: 170, leftHipAngle: 70, leftKneeAngle: 60, rightHipAngle: 70, rightKneeAngle: 60 },
      { hipX: 60, hipY: 110, torsoAngle: 64, leftShoulderAngle: 60, leftElbowAngle: 170, rightShoulderAngle: 60, rightElbowAngle: 170, leftHipAngle: 70, leftKneeAngle: 60, rightHipAngle: 70, rightKneeAngle: 60 }
    ),
    "childs_pose_hold"
  ),
  pelvic_tilt: jitter(
    threePhase(
      p(SUPINE, { torsoAngle: 88, leftHipAngle: 130, leftKneeAngle: 60, rightHipAngle: 130, rightKneeAngle: 60 }),
      p(SUPINE, { torsoAngle: 94, leftHipAngle: 130, leftKneeAngle: 60, rightHipAngle: 130, rightKneeAngle: 60 })
    ),
    "pelvic_tilt"
  ),
  standing_hip_circles: jitter(threePhase(p(STAND, { hipX: 58 }), p(STAND, { hipX: 62, hipY: 87 })), "standing_hip_circles"),
  ankle_circles: jitter(threePhase(p(SEATED, { leftKneeAngle: 175 }), p(SEATED, { leftKneeAngle: 195 })), "ankle_circles"),
  wrist_circles: jitter(threePhase(p(STAND, { leftShoulderAngle: 90, leftElbowAngle: 90 }), p(STAND, { leftShoulderAngle: 90, leftElbowAngle: 105 })), "wrist_circles"),
  neck_rolls_gentle: jitter(threePhase(STAND, p(STAND, { torsoAngle: 4 })), "neck_rolls_gentle"),
  shoulder_rolls: jitter(scaleFrom(scaleFrom(setField(setField(base("arm_circle"), "leftElbowAngle", 90), "rightElbowAngle", -90), "leftShoulderAngle", 0.5), "rightShoulderAngle", 0.5), "shoulder_rolls"),
  seated_torso_twist: jitter(scaleFrom(shift(base("twist"), "hipY", 8), "torsoAngle", 0.5), "seated_torso_twist"),
  standing_quad_stretch: jitter(
    threePhase(
      p(STAND, { rightHipAngle: 160, rightKneeAngle: 40, rightShoulderAngle: -140, rightElbowAngle: -30 }),
      p(STAND, { torsoAngle: 4, rightHipAngle: 160, rightKneeAngle: 40, rightShoulderAngle: -140, rightElbowAngle: -30 })
    ),
    "standing_quad_stretch"
  ),
  standing_hamstring_stretch: jitter(base("stretch_hold"), "standing_hamstring_stretch"),
  seated_forward_fold: jitter(
    threePhase(
      p(SEATED, { leftHipAngle: 92, rightHipAngle: 92, leftKneeAngle: 180, rightKneeAngle: 180, torsoAngle: 10 }),
      p(SEATED, { leftHipAngle: 92, rightHipAngle: 92, leftKneeAngle: 180, rightKneeAngle: 180, torsoAngle: 70, leftShoulderAngle: 90, leftElbowAngle: 90, rightShoulderAngle: -90, rightElbowAngle: -90 })
    ),
    "seated_forward_fold"
  ),
  figure_four_stretch: jitter(
    threePhase(
      p(SUPINE, { leftHipAngle: 130, leftKneeAngle: 60, rightHipAngle: 100, rightKneeAngle: 40 }),
      p(SUPINE, { hipY: 98, leftHipAngle: 130, leftKneeAngle: 60, rightHipAngle: 100, rightKneeAngle: 40 })
    ),
    "figure_four_stretch"
  ),
};

export type ExerciseAnimationId = keyof typeof EXERCISE_ANIMATIONS;
