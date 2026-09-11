// Regenerates apps/mobile/assets/{icon,android-icon-*,favicon,splash-icon}.png
// from the same forward-kinematics stick-figure mark used by the in-app
// exercise animations (../../src/animations/pose.ts). Requires
// playwright-core and a Chromium binary - not a project dependency, since
// this only needs to run when the brand mark changes:
//   npm install --no-save playwright-core
//   node scripts/icons/gen-icons.mjs
// (set PLAYWRIGHT_EXECUTABLE_PATH if Chromium isn't at the default path).
import { chromium } from "playwright-core";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { markSkeleton, markSvgBody, BRAND_GREEN, BRAND_DARK } from "./icon-mark.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../../assets");
mkdirSync(OUT, { recursive: true });

// At scale=1 (see markSkeleton), the star-jump pose's bounding box is
// roughly y:[-83.1, 60] relative to cy. Centering vertically requires
// cy = 100 + 11.6*scale (derived analytically from that bounding box).
function centeredCy(scale) {
  return 100 + 11.6 * scale;
}

function svgMarkup({ size, bg, markColor, scale, transparent }) {
  const cy = centeredCy(scale);
  const skeleton = markSkeleton({ cx: 100, cy, scale });
  const strokeWidth = 16 * scale;
  const body = markSvgBody(skeleton, markColor, strokeWidth);
  return `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:${transparent ? "transparent" : bg};}
    svg{display:block;}
  </style></head><body>
  <svg width="${size}" height="${size}" viewBox="0 0 200 200">
    ${transparent ? "" : `<rect x="0" y="0" width="200" height="200" fill="${bg}" />`}
    ${body}
  </svg>
  </body></html>`;
}

const FULL_SCALE = 0.95; // fills the icon with a small margin
const SAFE_ZONE_SCALE = FULL_SCALE * 0.66; // Android adaptive icon safe zone

const targets = [
  { name: "icon.png", size: 1024, bg: BRAND_GREEN, markColor: BRAND_DARK, scale: FULL_SCALE },
  { name: "android-icon-background.png", size: 512, bg: BRAND_GREEN, markColor: BRAND_GREEN, scale: 0, noMark: true },
  { name: "android-icon-foreground.png", size: 512, bg: BRAND_GREEN, markColor: BRAND_DARK, scale: SAFE_ZONE_SCALE, transparent: true },
  { name: "android-icon-monochrome.png", size: 432, bg: "#ffffff", markColor: "#ffffff", scale: SAFE_ZONE_SCALE, transparent: true },
  { name: "favicon.png", size: 48, bg: BRAND_GREEN, markColor: BRAND_DARK, scale: FULL_SCALE },
  { name: "splash-icon.png", size: 1024, bg: BRAND_GREEN, markColor: BRAND_DARK, scale: FULL_SCALE },
];

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox"],
});
for (const t of targets) {
  const ctx = await browser.newContext({ viewport: { width: t.size, height: t.size }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const html = t.noMark
    ? `<!doctype html><html><body style="margin:0;padding:0;"><svg width="${t.size}" height="${t.size}"><rect width="100%" height="100%" fill="${t.bg}"/></svg></body></html>`
    : svgMarkup(t);
  await p.setContent(html);
  await p.waitForTimeout(50);
  const outPath = `${OUT}/${t.name}`;
  await p.screenshot({ path: outPath, omitBackground: !!t.transparent });
  console.log("wrote", outPath);
  await ctx.close();
}
await browser.close();
