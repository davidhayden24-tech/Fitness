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

// A soft bulge-then-taper half-width curve: rises from `base` to `peak`
// (reached at t = peakAt, roughly where the muscle belly would be) then
// eases down to `tip`.
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
  return `${leftPath} ${rightPath} Z`;
}

const WIDTH_PROFILES: Record<LimbName, (t: number) => number> = {
  torso: bulge(6.5, 7, 0.3, 9),
  upperArm: bulge(5, 6.2, 0.45, 4),
  forearm: bulge(4.3, 4.3, 0.3, 2.8),
  thigh: bulge(7, 8.3, 0.4, 5.5),
  shin: bulge(5, 6.2, 0.3, 3.2),
};

export const LIMB_PATHS: Record<LimbName, string> = {
  torso: limbPath(LENGTHS.torso, WIDTH_PROFILES.torso),
  upperArm: limbPath(LENGTHS.upperArm, WIDTH_PROFILES.upperArm),
  forearm: limbPath(LENGTHS.forearm, WIDTH_PROFILES.forearm),
  thigh: limbPath(LENGTHS.thigh, WIDTH_PROFILES.thigh),
  shin: limbPath(LENGTHS.shin, WIDTH_PROFILES.shin),
};
