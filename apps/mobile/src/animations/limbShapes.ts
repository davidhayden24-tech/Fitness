// Tapered/bulging limb silhouettes for the illustrated-athlete rendering
// in ExerciseAnimation.tsx. Pure geometry, no React/RN dependency - each
// limb's path string is precomputed once here since it never changes;
// only the wrapping <G>'s position/rotation animates per frame.
import { LENGTHS } from "./pose";

export type LimbName = "torso" | "upperArm" | "forearm" | "thigh" | "shin" | "neck" | "shorts";

interface Point {
  x: number;
  y: number;
}

function smoothSide(points: Point[]): string {
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    const next = points[i + 1];
    const mid = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
    d += ` Q ${p.x},${p.y} ${mid.x},${mid.y}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x},${last.y}`;
  return d;
}

// A rounded cap behind the proximal joint (the local +Y side, opposite
// the direction the limb extends), traced as a sampled semicircle and
// smoothed the same way as a limb's tapered sides. Baking this into each
// limb's own silhouette - rather than drawing a separate circle on top -
// is what lets two rotating limbs blend into one continuous joint bulge
// instead of needing a same-colored dot to paper over the seam between
// them. A small overlap factor keeps that blend solid even when a joint
// is bent sharply and the two attached shapes' edges aren't quite flush.
function roundedCap(radius: number, samples = 6): string {
  const overlap = radius * 1.15;
  const points: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const angle = (i / samples) * Math.PI;
    points.push({ x: overlap * Math.cos(angle), y: overlap * Math.sin(angle) });
  }
  return smoothSide(points).replace("M", "L");
}

// Silhouette in LOCAL space: the proximal joint sits at (0,0), the shape
// extends along local -Y for `length` (matching pose.ts's `extend()`
// convention, where an absolute angle of 0 points "up"/-Y), so rotating
// and translating the wrapping <G> to a joint's position/angle places
// the shape correctly with no further trig needed at render time. The
// left and right edges take independent profiles so lopsided shapes
// (a shoe's flatter sole vs. its curved instep) are possible, not just
// mirrored ones.
function asymmetricPath(length: number, leftAt: (t: number) => number, rightAt: (t: number) => number, capRadius: number, samples = 9): string {
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const y = -t * length;
    left.push({ x: -leftAt(t), y });
    right.push({ x: rightAt(t), y });
  }
  const leftPath = smoothSide(left);
  const rightPath = smoothSide(right.slice().reverse()).replace("M", "L");
  return `${leftPath} ${rightPath} ${roundedCap(capRadius)} Z`;
}

function limbPath(length: number, widthAt: (t: number) => number, samples = 9): string {
  return asymmetricPath(length, widthAt, widthAt, widthAt(0), samples);
}

// A soft bulge-then-taper half-width curve: rises from `base` to `peak`
// (reached at t = peakAt, roughly where the muscle belly would be) then
// eases down to `tip`. Wider base-to-tip contrast than a plain taper
// reads as an actual limb rather than a uniform-diameter tube.
function bulge(base: number, peak: number, peakAt: number, tip: number) {
  return (t: number) => {
    if (t <= peakAt) {
      const u = t / peakAt;
      return base + (peak - base) * Math.sin((u * Math.PI) / 2);
    }
    const u = (t - peakAt) / (1 - peakAt);
    return peak + (tip - peak) * (1 - Math.cos((u * Math.PI) / 2));
  };
}

// The gap pose.ts leaves between the shoulder and the head - `extend(
// shoulder, torsoAngle, headRadius * 1.4)` - was previously empty (the
// head circle, radius headRadius, doesn't reach all the way back down to
// the shoulder), so the head looked like it was floating. NECK_LENGTH
// matches that same distance so this limb exactly fills it.
const NECK_LENGTH = LENGTHS.headRadius * 1.4;

// Shorts are a garment layered on top of a bare (skin-colored) thigh, not
// the thigh's own color - short enough to expose the lower thigh, the
// way an actual pair of shorts would.
const SHORTS_LENGTH = LENGTHS.thigh * 0.55;

const WIDTH_PROFILES: Record<LimbName, (t: number) => number> = {
  // Narrower at the waist (proximal, hip end), wider at the shoulders
  // (distal end) than a plain torso tube - an athletic V-taper.
  torso: bulge(6, 7, 0.3, 10.5),
  upperArm: bulge(5.2, 6.4, 0.4, 3.6),
  forearm: bulge(4.4, 4.6, 0.2, 2.4),
  thigh: bulge(7, 8.5, 0.4, 5),
  shin: bulge(5.2, 6.2, 0.25, 2.8),
  neck: bulge(3.6, 3.8, 0.3, 4.2),
  shorts: bulge(7.2, 8.5, 0.6, 9),
};

export const LIMB_PATHS: Record<LimbName, string> = {
  torso: limbPath(LENGTHS.torso, WIDTH_PROFILES.torso),
  upperArm: limbPath(LENGTHS.upperArm, WIDTH_PROFILES.upperArm),
  forearm: limbPath(LENGTHS.forearm, WIDTH_PROFILES.forearm),
  thigh: limbPath(LENGTHS.thigh, WIDTH_PROFILES.thigh),
  shin: limbPath(LENGTHS.shin, WIDTH_PROFILES.shin),
  neck: limbPath(NECK_LENGTH, WIDTH_PROFILES.neck),
  shorts: limbPath(SHORTS_LENGTH, WIDTH_PROFILES.shorts),
};

// A small hand silhouette (palm + three simplified fingers - a full five
// is too fussy to read at this size) instead of a plain dot, with the
// same rounded-cap wrist so it blends into the forearm.
function handPath(): string {
  const wristW = 2.5;
  const palmLen = 2.6;
  const knuckleW = 2.9;
  const fingerLen = 2.3;
  const fingerHalfW = 0.75;
  const fingerCount = 3;

  let d = `M ${-wristW},0`;
  d += ` L ${-knuckleW},${-palmLen}`;

  for (let i = 0; i < fingerCount; i++) {
    const slotL = -knuckleW + (i / fingerCount) * 2 * knuckleW;
    const slotR = -knuckleW + ((i + 1) / fingerCount) * 2 * knuckleW;
    const cx = (slotL + slotR) / 2;
    const fL = cx - fingerHalfW;
    const fR = cx + fingerHalfW;
    const tipY = -palmLen - fingerLen;
    d += ` L ${fL},${-palmLen}`;
    d += ` L ${fL},${tipY + fingerHalfW}`;
    d += ` Q ${fL},${tipY} ${cx},${tipY}`;
    d += ` Q ${fR},${tipY} ${fR},${tipY + fingerHalfW}`;
    d += ` L ${fR},${-palmLen}`;
  }

  d += ` L ${knuckleW},${-palmLen}`;
  d += ` L ${wristW},0`;
  d += ` ${roundedCap(wristW)} Z`;
  return d;
}

export const HAND_PATH = handPath();

// A simple sneaker silhouette instead of a plain dot: an asymmetric
// shape (curved instep on one side, wider sole on the other, both
// bulging near the ball of the foot before narrowing to a rounded toe)
// extending from the ankle in the same direction the shin already
// points - there's no separate ankle-angle field in Pose, so this reuses
// the shin's own rotation, the same approximation used for the hand off
// the forearm's angle.
const SHOE_LENGTH = 7.5;
const shoeInstep = bulge(2.2, 2.6, 0.35, 1.3);
const shoeSole = bulge(3, 4.2, 0.45, 1.6);
const SHOE_CAP_RADIUS = 2.8;

export const SHOE_PATH = asymmetricPath(SHOE_LENGTH, shoeInstep, shoeSole, SHOE_CAP_RADIUS);

// A darker sole layered on top of SHOE_PATH along its exact bottom edge
// (same `shoeSole` profile and cap radius, just a shallower instep-side
// edge) for a simple two-tone sneaker look.
export const SOLE_PATH = asymmetricPath(SHOE_LENGTH, () => 0.4, shoeSole, SHOE_CAP_RADIUS);

export const SHOE_COLOR = "#2D6FE0";
export const SOLE_COLOR = "#173F8C";

// A short darker band at the very top of the upper arm - a raglan-style
// sleeve trim - drawn on top of the (bare skin) upper arm right at the
// shoulder end, matching the reference's color-blocked sleeve cap rather
// than a plain sleeveless tank.
const SLEEVE_CAP_LENGTH = LENGTHS.upperArm * 0.3;
export const SLEEVE_CAP_PATH = limbPath(SLEEVE_CAP_LENGTH, (t) => WIDTH_PROFILES.upperArm(t * 0.3));

// A thin accent stripe down one side of the shorts. asymmetricPath always
// straddles the local x=0 centerline (mirroring left/right around it), so
// it can't produce a band that sits entirely to one side - this instead
// builds a simple flat-capped rectangle offset away from center.
function sideStripe(length: number, xCenter: number, halfWidth: number, samples = 4): string {
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const y = -(i / samples) * length;
    left.push({ x: xCenter - halfWidth, y });
    right.push({ x: xCenter + halfWidth, y });
  }
  const leftPath = smoothSide(left);
  const rightPath = smoothSide(right.slice().reverse()).replace("M", "L");
  return `${leftPath} ${rightPath} Z`;
}

export const SHORTS_STRIPE_PATH = sideStripe(SHORTS_LENGTH * 0.85, 6.2, 0.55);

// A couple of short crossing lines suggesting shoelaces, in the same
// local space as SHOE_PATH (heel at the origin, toe toward -Y).
export const SHOE_LACE_PATH = (() => {
  const y1 = -SHOE_LENGTH * 0.35;
  const y2 = -SHOE_LENGTH * 0.55;
  const y3 = -SHOE_LENGTH * 0.75;
  return [
    `M ${-1.6},${y1} L ${1.6},${y1 - 1.4}`,
    `M ${-1.6},${y2} L ${1.6},${y2 - 1.4}`,
    `M ${-1.4},${y3} L ${1.4},${y3 - 1.2}`,
  ].join(" ");
})();
