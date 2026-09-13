// Body-part silhouettes for the illustrated-athlete rendering in
// ExerciseAnimation.tsx. Pure geometry, no React/RN dependency - each
// shape's path string is precomputed once here since it never changes;
// only the wrapping <G>'s position/rotation animates per frame.
import { LENGTHS } from "./pose";

export type LimbName = "torso" | "upperArm" | "forearm" | "thigh" | "shin" | "neck";

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

// A short "cap" overlay covering only the proximal `fraction` of a limb's
// own length and width curve (rounded proximal joint, flat hem at the cut
// point) - drawn on top of a limb whose base fill is bare skin, this is
// what turns a bare thigh/upper-arm into one wearing shorts/a short
// sleeve without needing a separate width profile: it reuses the parent
// limb's exact taper up to the cut so the hem sits flush against it.
function limbCapPath(totalLength: number, widthAt: (t: number) => number, fraction: number): string {
  const cutLength = totalLength * fraction;
  const scaledWidthAt = (t: number) => widthAt(t * fraction);
  return asymmetricPath(cutLength, scaledWidthAt, scaledWidthAt, widthAt(0));
}

// Same idea as limbPath, but rounded at BOTH ends instead of just the
// proximal joint. Only the torso needs this: its distal end (the
// shoulders) isn't covered by a single child's own rounded cap the way
// every other limb's distal end is (two separate arms each contribute a
// small cap there, not one that spans the full shoulder width), so a
// flat-cut torso tip was sticking out past the arms as a stray wedge
// beside the neck. Rounding the torso's own tip fixes that at the root
// instead of just capping how wide the shoulders are allowed to be.
function limbPathRoundedBothEnds(length: number, widthAt: (t: number) => number, samples = 9): string {
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const w = widthAt(t);
    const y = -t * length;
    left.push({ x: -w, y });
    right.push({ x: w, y });
  }
  const leftPath = smoothSide(left);
  const tipW = widthAt(1);
  const distalSamples = 5;
  const distalPoints: Point[] = [];
  for (let i = 0; i <= distalSamples; i++) {
    const angle = (i / distalSamples) * Math.PI;
    distalPoints.push({ x: -tipW * Math.cos(angle), y: -length - tipW * Math.sin(angle) });
  }
  const distalCap = smoothSide(distalPoints).replace("M", "L");
  const rightPath = smoothSide(right.slice().reverse()).replace("M", "L");
  return `${leftPath} ${distalCap} ${rightPath} ${roundedCap(widthAt(0))} Z`;
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

const WIDTH_PROFILES: Record<LimbName, (t: number) => number> = {
  // Narrower at the waist (proximal, hip end), wider at the shoulders
  // (distal end) - an athletic V-taper. The rounded-both-ends torso path
  // means this can be as wide as looks right without the flat-tip wedge
  // problem a plain limbPath would have here.
  torso: bulge(5.6, 6.6, 0.3, 10.2),
  upperArm: bulge(4.9, 6.1, 0.4, 3.3),
  forearm: bulge(4.1, 4.3, 0.2, 2.2),
  thigh: bulge(6.6, 8, 0.4, 4.6),
  shin: bulge(4.9, 5.8, 0.25, 2.5),
  neck: bulge(3.6, 3.8, 0.3, 4.2),
};

export const LIMB_PATHS: Record<LimbName, string> = {
  torso: limbPathRoundedBothEnds(LENGTHS.torso, WIDTH_PROFILES.torso),
  upperArm: limbPath(LENGTHS.upperArm, WIDTH_PROFILES.upperArm),
  forearm: limbPath(LENGTHS.forearm, WIDTH_PROFILES.forearm),
  thigh: limbPath(LENGTHS.thigh, WIDTH_PROFILES.thigh),
  shin: limbPath(LENGTHS.shin, WIDTH_PROFILES.shin),
  neck: limbPath(NECK_LENGTH, WIDTH_PROFILES.neck),
};

// Shorts: a cap over the top ~42% of the thigh, matching a reference
// photo's hem line (roughly knee-to-hip-distance-wise between the waist
// and the knee). The upper arm's own shirt sleeve needs no equivalent -
// the reference's sleeve runs almost the full upper-arm segment, so that
// limb is just colored as shirt fabric directly rather than layered.
export const SHORTS_PATH = limbCapPath(LENGTHS.thigh, WIDTH_PROFILES.thigh, 0.42);

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

// A sneaker silhouette instead of a plain dot: an asymmetric shape
// (curved instep on one side, wider sole on the other, both bulging near
// the ball of the foot before narrowing to a rounded toe) extending from
// the ankle in the same direction the shin already points - there's no
// separate ankle-angle field in Pose, so this reuses the shin's own
// rotation, the same approximation used for the hand off the forearm's
// angle.
const SHOE_LENGTH = 7.5;
const shoeInstep = bulge(2.2, 2.6, 0.35, 1.3);
const shoeSole = bulge(3, 4.2, 0.45, 1.6);
const SHOE_CAP_RADIUS = 2.8;

export const SHOE_PATH = asymmetricPath(SHOE_LENGTH, shoeInstep, shoeSole, SHOE_CAP_RADIUS);

// A darker sole layered on top of SHOE_PATH along its exact bottom edge
// (same `shoeSole` profile and cap radius, just a shallower instep-side
// edge) for a simple two-tone sneaker look.
export const SOLE_PATH = asymmetricPath(SHOE_LENGTH, () => 0.4, shoeSole, SHOE_CAP_RADIUS);

export const SHOE_COLOR = "#1356BB";
export const SOLE_COLOR = "#EFF3F8";

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
