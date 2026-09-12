// Tapered/bulging limb silhouettes for the illustrated-athlete rendering
// in ExerciseAnimation.tsx. Pure geometry, no React/RN dependency - each
// limb's path string is precomputed once here since it never changes;
// only the wrapping <G>'s position/rotation animates per frame.
import { LENGTHS } from "./pose";

export type LimbName = "torso" | "upperArm" | "forearm" | "thigh" | "shin";

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
// the shape correctly with no further trig needed at render time.
function limbPath(length: number, widthAt: (t: number) => number, samples = 9): string {
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
  const rightPath = smoothSide(right.slice().reverse()).replace("M", "L");
  return `${leftPath} ${rightPath} ${roundedCap(widthAt(0))} Z`;
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

const WIDTH_PROFILES: Record<LimbName, (t: number) => number> = {
  torso: bulge(6.5, 7, 0.3, 9),
  upperArm: bulge(5.2, 6.4, 0.4, 3.6),
  forearm: bulge(4.4, 4.6, 0.2, 2.4),
  thigh: bulge(7, 8.5, 0.4, 5),
  shin: bulge(5.2, 6.2, 0.25, 2.8),
};

export const LIMB_PATHS: Record<LimbName, string> = {
  torso: limbPath(LENGTHS.torso, WIDTH_PROFILES.torso),
  upperArm: limbPath(LENGTHS.upperArm, WIDTH_PROFILES.upperArm),
  forearm: limbPath(LENGTHS.forearm, WIDTH_PROFILES.forearm),
  thigh: limbPath(LENGTHS.thigh, WIDTH_PROFILES.thigh),
  shin: limbPath(LENGTHS.shin, WIDTH_PROFILES.shin),
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
