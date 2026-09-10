import type { AnimationPattern } from "./patterns";

// Exercises are already clustered into `substituteGroupId` groups by the
// backend seed data (apps/backend/src/data/exercises.ts) - exercises in the
// same group are biomechanically similar enough to be interchangeable
// substitutes, which also makes the group a solid proxy for "which
// placeholder animation looks like this movement." One pattern per group
// instead of one per exercise keeps ~90 exercises down to ~20 hand-checked
// animations.
const GROUP_TO_PATTERN: Record<string, AnimationPattern> = {
  push_horizontal: "pushup",
  push_horizontal_triceps: "pushup",
  push_vertical: "overhead_press",
  triceps_iso: "dip",
  back_extension: "back_extension",
  core_stability: "plank_hold",
  shoulder_mobility: "arm_circle",
  biceps_iso: "bicep_curl",
  forearm_iso: "wrist_flex",
  core_flexion: "situp",
  core_stability_lateral: "side_plank",
  core_rotation: "twist",
  core_dynamic: "mountain_climber",
  squat: "squat",
  squat_iso: "squat",
  squat_plyo: "squat",
  lunge: "lunge",
  step: "lunge",
  hip_extension: "hip_bridge",
  glute_iso: "hip_bridge",
  hip_hinge: "stretch_hold",
  calf: "calf_raise",
  cardio_low_impact: "march",
  cardio_high_impact: "jumping_jack",
  full_body_stability: "bear_crawl",
  mobility: "stretch_hold",
};

const DEFAULT_PATTERN: AnimationPattern = "stretch_hold";

export function patternForSubstituteGroup(substituteGroupId: string): AnimationPattern {
  return GROUP_TO_PATTERN[substituteGroupId] ?? DEFAULT_PATTERN;
}
