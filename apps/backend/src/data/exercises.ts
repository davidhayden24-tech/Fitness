// Seed exercise library: ~95 no-equipment bodyweight exercises.
//
// IMPORTANT: names/descriptions here are generic, original text describing
// standard bodyweight movements (squat, push-up, plank, etc.) - common
// fitness vocabulary, not copyrighted content. `videoAssetRef` is left null
// as a placeholder; real video/animation assets still need to be supplied
// and wired up before this ships. Muscle-group and contraindication tags
// are a reasonable first pass for MVP purposes and should be reviewed by
// someone with exercise-science/PT background before this substitutes real
// injury-safe programming for real users.

import type { ContraindicationTag, Difficulty, MuscleGroup } from "@adaptfit/shared";

export interface SeedExercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: MuscleGroup[];
  difficulty: Difficulty;
  contraindications: ContraindicationTag[];
  substituteGroupId: string;
  videoAssetRef: string | null;
  defaultSets: number | null;
  defaultReps: number | null;
  defaultDurationSeconds: number | null;
}

function ex(
  id: string,
  name: string,
  description: string,
  muscleGroups: MuscleGroup[],
  difficulty: Difficulty,
  contraindications: ContraindicationTag[],
  substituteGroupId: string,
  timing: { sets?: number; reps?: number; durationSeconds?: number } = {}
): SeedExercise {
  return {
    id,
    name,
    description,
    muscleGroups,
    difficulty,
    contraindications,
    substituteGroupId,
    videoAssetRef: null,
    defaultSets: timing.sets ?? 3,
    defaultReps: timing.reps ?? null,
    defaultDurationSeconds: timing.durationSeconds ?? null,
  };
}

export const EXERCISES: SeedExercise[] = [
  // --- Push: chest / shoulders / triceps -----------------------------------
  ex("standard_pushup", "Push-Up", "Hands under shoulders, body in a straight line, lower chest to the floor and press back up.", ["chest", "shoulders", "triceps"], "intermediate", ["wrist", "shoulder"], "push_horizontal", { reps: 12 }),
  ex("knee_pushup", "Knee Push-Up", "Push-up performed from the knees to reduce load while building pressing strength.", ["chest", "shoulders", "triceps"], "beginner", ["wrist"], "push_horizontal", { reps: 12 }),
  ex("incline_pushup", "Incline Push-Up", "Push-up with hands elevated on a step or couch, reducing bodyweight load.", ["chest", "shoulders", "triceps"], "beginner", ["wrist"], "push_horizontal", { reps: 12 }),
  ex("decline_pushup", "Decline Push-Up", "Push-up with feet elevated, increasing load on the chest and shoulders.", ["chest", "shoulders", "triceps"], "advanced", ["wrist", "shoulder"], "push_horizontal", { reps: 10 }),
  ex("wide_pushup", "Wide Push-Up", "Push-up with hands set wider than shoulders to emphasize the chest.", ["chest", "shoulders", "triceps"], "intermediate", ["wrist", "shoulder"], "push_horizontal", { reps: 12 }),
  ex("diamond_pushup", "Diamond Push-Up", "Push-up with hands together under the chest to emphasize the triceps.", ["triceps", "chest"], "advanced", ["wrist", "elbow"], "push_horizontal_triceps", { reps: 10 }),
  ex("wall_pushup", "Wall Push-Up", "Standing push-up against a wall - the gentlest entry point to pressing movements.", ["chest", "shoulders", "triceps"], "beginner", [], "push_horizontal", { reps: 15 }),
  ex("pike_pushup", "Pike Push-Up", "Hips high, hands on the floor, lower the head toward the floor to emphasize shoulders.", ["shoulders", "triceps"], "advanced", ["wrist", "shoulder", "neck"], "push_vertical", { reps: 8 }),
  ex("wall_handstand_hold", "Wall Handstand Hold", "Kick up into a handstand against a wall and hold to build shoulder stability.", ["shoulders"], "advanced", ["wrist", "shoulder", "neck"], "push_vertical", { durationSeconds: 20 }),
  ex("tricep_dip_chair", "Chair Tricep Dip", "Hands on a sturdy chair edge, lower and press the body using the triceps.", ["triceps", "shoulders"], "intermediate", ["shoulder", "wrist", "elbow"], "triceps_iso", { reps: 10 }),
  ex("plank_up_down", "Plank Up-Down", "Move from forearm plank to high plank and back, one arm at a time.", ["chest", "shoulders", "triceps", "abs"], "advanced", ["wrist", "shoulder"], "push_horizontal", { reps: 10 }),

  // --- Pull / back / shoulders (equipment-free) ----------------------------
  ex("superman", "Superman", "Lying face down, lift arms and legs off the floor together to work the lower back and glutes.", ["back", "lower_back", "glutes"], "beginner", ["lower_back", "neck"], "back_extension", { reps: 12 }),
  ex("reverse_snow_angel", "Reverse Snow Angel", "Lying face down, sweep the arms overhead and back like a snow angel to work the upper back.", ["back", "shoulders"], "beginner", ["shoulder", "lower_back", "neck"], "back_extension", { reps: 12 }),
  ex("bird_dog", "Bird Dog", "On hands and knees, extend opposite arm and leg while keeping the spine neutral.", ["back", "abs", "glutes"], "beginner", ["shoulder", "wrist"], "core_stability", { reps: 10 }),
  ex("prone_y_raise", "Prone Y-Raise", "Lying face down, raise the arms overhead in a Y shape to work the lower traps.", ["back", "shoulders"], "beginner", ["shoulder", "lower_back"], "back_extension", { reps: 12 }),
  ex("prone_t_raise", "Prone T-Raise", "Lying face down, raise the arms out to the sides in a T shape to work the mid back.", ["back", "shoulders"], "beginner", ["shoulder", "lower_back"], "back_extension", { reps: 12 }),
  ex("reverse_plank", "Reverse Plank", "Seated, hands behind you, lift the hips to form a straight line facing up.", ["back", "glutes", "shoulders"], "intermediate", ["wrist", "shoulder", "lower_back"], "core_stability", { durationSeconds: 20 }),
  ex("good_morning_bodyweight", "Bodyweight Good Morning", "Hands behind head, hinge at the hips keeping a flat back, then return upright.", ["lower_back", "hamstrings", "glutes"], "intermediate", ["lower_back"], "hip_hinge", { reps: 12 }),
  ex("arm_circles", "Arm Circles", "Small controlled circles with straight arms to warm up and stabilize the shoulders.", ["shoulders"], "beginner", ["shoulder"], "shoulder_mobility", { durationSeconds: 30 }),
  ex("plank_shoulder_taps", "Plank Shoulder Taps", "From a high plank, alternate tapping each shoulder while resisting hip rotation.", ["shoulders", "abs"], "intermediate", ["wrist", "shoulder"], "core_stability", { reps: 16 }),

  // --- Biceps / forearms (isometric, equipment-free) -----------------------
  ex("towel_curl_isometric", "Self-Resistance Bicep Curl", "Curl one hand against the resistance of the other to isometrically load the biceps.", ["biceps"], "beginner", ["wrist", "elbow"], "biceps_iso", { reps: 10 }),
  ex("wall_bicep_press_iso", "Wall Bicep Press", "Press a fist upward into a wall or door frame to isometrically load the biceps.", ["biceps"], "beginner", ["elbow", "wrist"], "biceps_iso", { durationSeconds: 20 }),
  ex("static_fist_squeeze", "Static Fist Squeeze", "Squeeze the fists tightly and hold to build forearm and grip endurance.", ["forearms"], "beginner", ["wrist"], "forearm_iso", { durationSeconds: 20 }),
  ex("wrist_flexor_stretch_hold", "Wrist Flexor Stretch", "Gently extend the wrist backward and hold to stretch the forearm flexors.", ["forearms"], "beginner", ["wrist"], "forearm_iso", { durationSeconds: 20 }),

  // --- Core: flexion / rotation / stability ---------------------------------
  ex("crunch", "Crunch", "Lying on the back, curl the shoulders off the floor toward the hips.", ["abs"], "beginner", ["neck", "lower_back"], "core_flexion", { reps: 15 }),
  ex("bicycle_crunch", "Bicycle Crunch", "Alternate bringing elbow to opposite knee in a pedaling motion.", ["abs", "obliques"], "intermediate", ["neck", "lower_back"], "core_flexion", { reps: 20 }),
  ex("reverse_crunch", "Reverse Crunch", "Lying on the back, curl the hips off the floor bringing knees toward the chest.", ["abs"], "intermediate", ["lower_back", "neck"], "core_flexion", { reps: 15 }),
  ex("leg_raise", "Lying Leg Raise", "Lying on the back, raise straight legs to vertical then lower under control.", ["abs"], "intermediate", ["lower_back"], "core_flexion", { reps: 12 }),
  ex("flutter_kicks", "Flutter Kicks", "Lying on the back, alternate small up-and-down kicks with straight legs.", ["abs"], "intermediate", ["lower_back"], "core_flexion", { durationSeconds: 30 }),
  ex("plank", "Plank", "Forearms and toes on the floor, body in a straight line, hold the position.", ["abs", "shoulders"], "beginner", ["wrist", "shoulder", "lower_back"], "core_stability", { durationSeconds: 30 }),
  ex("forearm_plank", "Forearm Plank", "Plank held on the forearms rather than the hands, easing wrist load.", ["abs", "shoulders"], "beginner", ["shoulder", "lower_back"], "core_stability", { durationSeconds: 30 }),
  ex("side_plank", "Side Plank", "Balance on one hand and the outer edge of one foot, hips lifted, body straight.", ["obliques", "abs", "shoulders"], "intermediate", ["wrist", "shoulder"], "core_stability_lateral", { durationSeconds: 20 }),
  ex("side_plank_knee_bent", "Side Plank (Knees Bent)", "Side plank with the knees bent for a lower-intensity variation.", ["obliques", "abs"], "beginner", ["shoulder"], "core_stability_lateral", { durationSeconds: 20 }),
  ex("russian_twist", "Russian Twist", "Seated, lean back slightly and rotate the torso side to side.", ["obliques", "abs"], "intermediate", ["lower_back", "wrist"], "core_rotation", { reps: 20 }),
  ex("mountain_climbers", "Mountain Climbers", "From a high plank, drive knees toward the chest in a running motion.", ["abs", "quads", "shoulders"], "intermediate", ["wrist", "shoulder", "knee"], "core_dynamic", { durationSeconds: 30 }),
  ex("dead_bug", "Dead Bug", "Lying on the back, lower opposite arm and leg toward the floor while bracing the core.", ["abs", "lower_back"], "beginner", ["shoulder", "wrist"], "core_stability", { reps: 12 }),
  ex("hollow_body_hold", "Hollow Body Hold", "Lying on the back, lift shoulders and legs slightly, arms overhead, and brace.", ["abs"], "advanced", ["lower_back", "neck"], "core_flexion", { durationSeconds: 20 }),
  ex("v_up", "V-Up", "Lying flat, simultaneously raise the torso and legs to meet in a V shape.", ["abs"], "advanced", ["lower_back", "neck"], "core_flexion", { reps: 12 }),
  ex("standing_oblique_crunch", "Standing Oblique Crunch", "Standing, bring elbow and knee together to the side to work the obliques.", ["obliques", "abs"], "beginner", ["knee"], "core_rotation", { reps: 15 }),
  ex("plank_jacks", "Plank Jacks", "From a high plank, jump the feet out and in like a jumping jack.", ["abs", "quads"], "intermediate", ["wrist", "shoulder", "knee", "ankle"], "core_dynamic", { durationSeconds: 30 }),

  // --- Legs: quads / hamstrings / glutes / calves --------------------------
  ex("bodyweight_squat", "Bodyweight Squat", "Feet shoulder-width, sit the hips back and down, then stand.", ["quads", "glutes", "hamstrings"], "beginner", ["knee"], "squat", { reps: 15 }),
  ex("sumo_squat", "Sumo Squat", "Wide stance squat with toes turned out, emphasizing the inner thighs and glutes.", ["quads", "glutes"], "beginner", ["knee", "hip"], "squat", { reps: 15 }),
  ex("jump_squat", "Jump Squat", "Squat down then explode upward into a jump, landing softly.", ["quads", "glutes"], "advanced", ["knee", "ankle"], "squat_plyo", { reps: 10 }),
  ex("wall_sit", "Wall Sit", "Back against a wall, knees at 90 degrees, hold the seated position.", ["quads"], "beginner", ["knee"], "squat_iso", { durationSeconds: 30 }),
  ex("seated_leg_extension_iso", "Seated Leg Extension Hold", "Seated, extend one leg straight and hold to isolate the quad with minimal knee stress.", ["quads"], "beginner", [], "squat", { durationSeconds: 20 }),
  ex("lunge_forward", "Forward Lunge", "Step forward into a lunge, lowering the back knee toward the floor.", ["quads", "glutes", "hamstrings"], "intermediate", ["knee"], "lunge", { reps: 12 }),
  ex("lunge_reverse", "Reverse Lunge", "Step backward into a lunge - generally gentler on the front knee than stepping forward.", ["quads", "glutes", "hamstrings"], "beginner", ["knee"], "lunge", { reps: 12 }),
  ex("lunge_walking", "Walking Lunge", "Continuous forward lunges, alternating legs as you travel.", ["quads", "glutes", "hamstrings"], "intermediate", ["knee", "ankle"], "lunge", { reps: 16 }),
  ex("lateral_lunge", "Lateral Lunge", "Step out to the side and sit the hips back over the bent knee.", ["quads", "glutes", "hamstrings"], "intermediate", ["knee", "hip"], "lunge", { reps: 12 }),
  ex("curtsy_lunge", "Curtsy Lunge", "Step one leg behind and across the body into a curtsy-style lunge.", ["glutes", "quads"], "intermediate", ["knee", "hip"], "lunge", { reps: 12 }),
  ex("step_up", "Step-Up", "Step up onto a sturdy step or stair, driving through the lead leg.", ["quads", "glutes"], "intermediate", ["knee", "ankle"], "step", { reps: 12 }),
  ex("glute_bridge", "Glute Bridge", "Lying on the back, knees bent, drive the hips upward by squeezing the glutes.", ["glutes", "hamstrings", "lower_back"], "beginner", ["lower_back"], "hip_extension", { reps: 15 }),
  ex("single_leg_glute_bridge", "Single-Leg Glute Bridge", "Glute bridge performed on one leg for extra glute and stability demand.", ["glutes", "hamstrings"], "intermediate", ["lower_back"], "hip_extension", { reps: 12 }),
  ex("hip_thrust_floor", "Floor Hip Thrust", "Upper back on the floor, drive the hips up for maximum glute contraction.", ["glutes"], "intermediate", ["lower_back"], "hip_extension", { reps: 15 }),
  ex("donkey_kick", "Donkey Kick", "On hands and knees, kick one leg back and up, squeezing the glute.", ["glutes"], "beginner", ["lower_back", "wrist", "knee"], "glute_iso", { reps: 12 }),
  ex("fire_hydrant", "Fire Hydrant", "On hands and knees, lift one bent leg out to the side.", ["glutes"], "beginner", ["hip", "wrist", "knee"], "glute_iso", { reps: 12 }),
  ex("calf_raise", "Calf Raise", "Rise up onto the toes and lower under control to work the calves.", ["calves"], "beginner", ["ankle"], "calf", { reps: 20 }),
  ex("single_leg_calf_raise", "Single-Leg Calf Raise", "Calf raise performed on one leg for added intensity.", ["calves"], "intermediate", ["ankle"], "calf", { reps: 15 }),
  ex("squat_pulse", "Squat Pulse", "Hold a squat position and make small pulsing movements.", ["quads", "glutes"], "intermediate", ["knee"], "squat_iso", { durationSeconds: 30 }),
  ex("standing_march", "Standing March", "Slow, controlled marching in place, lifting knees to hip height.", ["quads", "abs"], "beginner", ["knee", "hip"], "cardio_low_impact", { durationSeconds: 30 }),
  ex("high_knees", "High Knees", "Fast, driving knee lifts in place, like a running motion.", ["quads", "abs", "calves"], "intermediate", ["knee", "ankle"], "cardio_high_impact", { durationSeconds: 30 }),
  ex("bear_crawl_hold", "Bear Crawl Hold", "Hands and toes on the floor, knees hovering just off the ground, hold the position.", ["quads", "shoulders", "abs"], "intermediate", ["wrist", "shoulder", "knee"], "full_body_stability", { durationSeconds: 20 }),
  ex("skater_hop", "Skater Hop", "Hop laterally from one foot to the other in a skating motion.", ["quads", "glutes", "calves"], "advanced", ["knee", "ankle"], "cardio_high_impact", { reps: 16 }),

  // --- Full-body / cardio ---------------------------------------------------
  ex("jumping_jacks", "Jumping Jacks", "Jump the feet out while raising the arms overhead, then back to start.", ["full_body", "cardio"], "beginner", ["knee", "shoulder", "ankle"], "cardio_high_impact", { durationSeconds: 30 }),
  ex("burpee", "Burpee", "Squat, kick back to a plank, push-up, jump feet in, then jump up.", ["full_body", "cardio"], "advanced", ["knee", "wrist", "shoulder", "lower_back"], "cardio_high_impact", { reps: 10 }),
  ex("burpee_no_pushup", "Burpee (No Push-Up)", "Burpee with the push-up removed to reduce upper-body and wrist demand.", ["full_body", "cardio"], "intermediate", ["knee", "wrist"], "cardio_high_impact", { reps: 10 }),
  ex("burpee_no_jump", "Burpee (No Jump)", "Low-impact burpee: step back to plank and step up instead of jumping.", ["full_body", "cardio"], "beginner", ["wrist"], "cardio_low_impact", { reps: 10 }),
  ex("squat_thrust", "Squat Thrust", "Like a burpee without the final jump or push-up - squat, plank, squat, stand.", ["full_body", "cardio"], "intermediate", ["knee", "wrist"], "cardio_high_impact", { reps: 12 }),
  ex("inchworm", "Inchworm", "Hinge forward, walk the hands out to a plank, then walk them back and stand.", ["full_body", "hamstrings"], "intermediate", ["wrist", "lower_back"], "full_body_stability", { reps: 8 }),
  ex("plank_walkout", "Plank Walkout", "From standing, walk the hands out to a plank and back up.", ["full_body", "abs", "shoulders"], "intermediate", ["wrist", "shoulder", "lower_back"], "full_body_stability", { reps: 10 }),
  ex("shadow_boxing", "Shadow Boxing", "Throw controlled punches in the air while staying light on your feet.", ["full_body", "cardio"], "beginner", ["shoulder"], "cardio_low_impact", { durationSeconds: 45 }),
  ex("star_jump", "Star Jump", "Jump up spreading arms and legs into a star shape, then land softly.", ["full_body", "cardio"], "intermediate", ["knee", "ankle", "shoulder"], "cardio_high_impact", { reps: 12 }),
  ex("tuck_jump", "Tuck Jump", "Jump straight up, driving the knees toward the chest.", ["full_body", "cardio", "quads"], "advanced", ["knee", "ankle"], "cardio_high_impact", { reps: 10 }),
  ex("crab_walk", "Crab Walk", "Facing up, hands and feet on the floor, walk forward and back.", ["full_body", "triceps", "glutes"], "intermediate", ["wrist", "shoulder"], "full_body_stability", { durationSeconds: 30 }),
  ex("bear_crawl_forward", "Bear Crawl", "Hands and feet on the floor, knees hovering, crawl forward and back.", ["full_body", "shoulders", "quads"], "intermediate", ["wrist", "shoulder", "knee"], "full_body_stability", { durationSeconds: 30 }),
  ex("plank_to_downward_dog", "Plank to Downward Dog", "Flow between a high plank and a downward-dog position.", ["full_body", "shoulders", "hamstrings"], "intermediate", ["wrist", "shoulder"], "full_body_stability", { reps: 10 }),

  // --- Mobility / rehab-friendly (low-impact substitution pool) ------------
  ex("cat_cow_stretch", "Cat-Cow Stretch", "On hands and knees, alternate arching and rounding the spine slowly.", ["lower_back", "abs"], "beginner", ["neck"], "mobility", { durationSeconds: 30 }),
  ex("childs_pose_hold", "Child's Pose Hold", "Kneel and sit back onto the heels, reaching the arms forward, and hold.", ["lower_back", "shoulders"], "beginner", ["knee"], "mobility", { durationSeconds: 30 }),
  ex("pelvic_tilt", "Pelvic Tilt", "Lying on the back, gently flatten and arch the lower back against the floor.", ["lower_back", "abs"], "beginner", ["neck"], "mobility", { reps: 12 }),
  ex("standing_hip_circles", "Standing Hip Circles", "Hands on hips, make slow controlled circles with the hips.", ["glutes"], "beginner", ["hip"], "mobility", { durationSeconds: 30 }),
  ex("ankle_circles", "Ankle Circles", "Slow controlled circles at the ankle joint in both directions.", ["calves"], "beginner", ["ankle"], "mobility", { durationSeconds: 20 }),
  ex("wrist_circles", "Wrist Circles", "Slow controlled circles at the wrist joint in both directions.", ["forearms"], "beginner", ["wrist"], "mobility", { durationSeconds: 20 }),
  ex("neck_rolls_gentle", "Gentle Neck Rolls", "Slow, gentle half-circles of the head to release neck tension.", ["full_body"], "beginner", ["neck"], "mobility", { durationSeconds: 20 }),
  ex("shoulder_rolls", "Shoulder Rolls", "Roll the shoulders in slow controlled circles, forward and back.", ["shoulders"], "beginner", ["shoulder"], "mobility", { durationSeconds: 20 }),
  ex("seated_torso_twist", "Seated Torso Twist", "Seated, gently rotate the torso side to side using the obliques.", ["obliques", "abs"], "beginner", ["lower_back"], "mobility", { durationSeconds: 30 }),
  ex("standing_quad_stretch", "Standing Quad Stretch", "Standing, pull one heel toward the glute and hold to stretch the quad.", ["quads"], "beginner", ["knee"], "mobility", { durationSeconds: 20 }),
  ex("standing_hamstring_stretch", "Standing Hamstring Stretch", "Hinge forward with a soft knee to stretch the back of the leg.", ["hamstrings"], "beginner", ["lower_back", "knee"], "mobility", { durationSeconds: 20 }),
  ex("seated_forward_fold", "Seated Forward Fold", "Seated with legs extended, hinge forward reaching toward the feet.", ["hamstrings", "lower_back"], "beginner", ["lower_back", "knee"], "mobility", { durationSeconds: 20 }),
  ex("figure_four_stretch", "Figure-Four Stretch", "Lying on the back, cross one ankle over the opposite knee and gently pull in.", ["glutes"], "beginner", ["knee", "hip"], "mobility", { durationSeconds: 20 }),
];
