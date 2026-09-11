// Shared mark generator for all AdaptFit icon variants. Reuses the same
// forward-kinematics approach as apps/mobile/src/animations/pose.ts so the
// app icon is visually the same "brand" as the in-app stick-figure
// animations, just rendered bold enough to read at small sizes.

export const BRAND_GREEN = "#5BE49B";
export const BRAND_DARK = "#0F1115";

function vec(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.sin(rad), y: -Math.cos(rad) };
}
function extend(from, angleDeg, length) {
  const v = vec(angleDeg);
  return { x: from.x + v.x * length, y: from.y + v.y * length };
}

// A bold "star jump" pose - arms up and out, legs spread - reads clearly
// as an active person at any size, unlike a resting/standing figure.
export function markSkeleton({ cx = 100, cy = 100, scale = 1 } = {}) {
  const L = {
    torso: 48 * scale,
    upperArm: 32 * scale,
    forearm: 28 * scale,
    thigh: 32 * scale,
    shin: 28 * scale,
    headRadius: 16 * scale,
  };
  const hip = { x: cx, y: cy + 14 * scale };
  const shoulder = extend(hip, 0, L.torso);
  const head = extend(shoulder, 0, L.headRadius * 1.35);
  const leftHand = extend(extend(shoulder, 35, L.upperArm), 35, L.forearm);
  const rightHand = extend(extend(shoulder, -35, L.upperArm), -35, L.forearm);
  const leftFoot = extend(extend(hip, 140, L.thigh), 140, L.shin);
  const rightFoot = extend(extend(hip, -140, L.thigh), -140, L.shin);
  return { hip, shoulder, head, leftHand, rightHand, leftFoot, rightFoot, headRadius: L.headRadius };
}

export function markSvgBody(skeleton, strokeColor, strokeWidth) {
  const s = skeleton;
  const line = (a, b) =>
    `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" />`;
  return `
    <g fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round">
      ${line(s.hip, s.shoulder)}
      ${line(s.shoulder, s.leftHand)}
      ${line(s.shoulder, s.rightHand)}
      ${line(s.hip, s.leftFoot)}
      ${line(s.hip, s.rightFoot)}
    </g>
    <circle cx="${s.head.x.toFixed(1)}" cy="${s.head.y.toFixed(1)}" r="${s.headRadius}" fill="${strokeColor}" />
  `;
}
