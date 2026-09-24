// Build font-independent SVG logo files from the brand typefaces (outlined glyphs).
// Usage: npm run logos
// Outputs to assets/img/: favicon.svg, logo-wordmark-dark.svg, logo-wordmark-light.svg,
// logo-roundel-dark.svg, logo-roundel-light.svg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = path.join(root, 'node_modules/@fontsource');
const load = (p) => opentype.parse(new Uint8Array(fs.readFileSync(path.join(files, p))).buffer);

const SERIF_600 = load('cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff');
const SERIF_500I = load('cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff');
const SANS_500 = load('jost/files/jost-latin-500-normal.woff');

const INK = '#0f1517', CREAM = '#f4ede1', BRASS = '#c49a5c', BRASS_HI = '#dfbd84';
const out = path.join(root, 'assets/img');
fs.mkdirSync(out, { recursive: true });

/* Lay out a string glyph by glyph with tracking (em fraction) and kerning. */
function layout(font, text, size, tracking = 0) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(text);
  let x = 0;
  const placed = [];
  glyphs.forEach((g, i) => {
    placed.push({ g, x });
    let adv = g.advanceWidth * scale;
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * scale;
    x += adv + (i < glyphs.length - 1 ? tracking * size : 0);
  });
  return { placed, width: x, scale };
}
function textPath(font, text, size, x0, baseline, tracking = 0) {
  const { placed } = layout(font, text, size, tracking);
  return placed.map(({ g, x }) => g.getPath(x0 + x, baseline, size).toPathData(2)).join('');
}
const widthOf = (font, text, size, tracking = 0) => layout(font, text, size, tracking).width;

/* ---------- favicon ---------- */
{
  const size = 58;
  const amp = SERIF_500I.charToGlyph('&');
  const p = amp.getPath(0, 0, size);
  const bb = p.getBoundingBox();
  const dx = 32 - (bb.x1 + bb.x2) / 2, dy = 33 - (bb.y1 + bb.y2) / 2;
  const d = amp.getPath(dx, dy, size).toPathData(2);
  fs.writeFileSync(path.join(out, 'favicon.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${INK}"/><path d="${d}" fill="${BRASS_HI}"/></svg>\n`);
}

/* ---------- stacked wordmark ---------- */
function wordmark(fg, accent, bg) {
  const nameSize = 64, nameTrack = 0.16;
  const name = 'SIERRA ST.';
  const nameW = widthOf(SERIF_600, name, nameSize, nameTrack);
  const subSize = 14.5, subTrack = 0.42;
  const left = 'KITCHEN', right = 'COCKTAILS';
  const lw = widthOf(SANS_500, left, subSize, subTrack), rw = widthOf(SANS_500, right, subSize, subTrack);
  const ampSize = 30, gap = 14;
  const ampG = SERIF_500I.charToGlyph('&');
  const ampW = ampG.advanceWidth * ampSize / SERIF_500I.unitsPerEm;
  const subW = lw + gap + ampW + gap + rw;
  const W = Math.ceil(Math.max(nameW, subW) + 80), H = 170;
  const cx = W / 2;
  const nameD = textPath(SERIF_600, name, nameSize, cx - nameW / 2, 86, nameTrack);
  const sx = cx - subW / 2, sBase = 134;
  const subD = textPath(SANS_500, left, subSize, sx, sBase, subTrack) +
    textPath(SANS_500, right, subSize, sx + lw + gap + ampW + gap, sBase, subTrack);
  const ampD = ampG.getPath(sx + lw + gap, sBase + 4, ampSize).toPathData(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    (bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : '') +
    `<path d="${nameD}" fill="${fg}"/><path d="${subD}" fill="${accent}"/><path d="${ampD}" fill="${accent}"/></svg>\n`;
}
fs.writeFileSync(path.join(out, 'logo-wordmark-dark.svg'), wordmark(CREAM, BRASS_HI, INK));
fs.writeFileSync(path.join(out, 'logo-wordmark-light.svg'), wordmark(INK, '#7a5a2c', CREAM));

/* ---------- roundel (coaster mark) ---------- */
function roundel(fg, bg) {
  const S = 400, c = S / 2;
  const ringText = 'SIERRA ST. • KITCHEN & COCKTAILS • RENO, NEVADA • EST. 2016 • ';
  const size = 20.5, r = 152;
  const { placed, scale } = layout(SANS_500, ringText, size, 0);
  const natural = placed.length ? placed[placed.length - 1].x + placed[placed.length - 1].g.advanceWidth * scale : 0;
  const circ = 2 * Math.PI * r;
  const extra = (circ - natural) / placed.length;
  let paths = '';
  placed.forEach(({ g, x }, i) => {
    const adv = g.advanceWidth * scale;
    const along = x + i * extra + adv / 2;
    const deg = (along / circ) * 360;
    const gp = g.getPath(-adv / 2, 0, size).toPathData(2);
    if (gp) paths += `<path d="${gp}" transform="translate(${c} ${c}) rotate(${deg.toFixed(3)}) translate(0 ${-r})"/>`;
  });
  const ampSize = 170;
  const amp = SERIF_500I.charToGlyph('&');
  const bb = amp.getPath(0, 0, ampSize).getBoundingBox();
  const ampD = amp.getPath(c - (bb.x1 + bb.x2) / 2, c - 8 - (bb.y1 + bb.y2) / 2, ampSize).toPathData(2);
  const wave = (y, n, w) => {
    let d = `M${c - (n * w) / 2} ${y}`;
    for (let i = 0; i < n; i++) d += ` q${w / 4} -7 ${w / 2} 0 t${w / 2} 0`;
    return d;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">` +
    (bg ? `<rect width="${S}" height="${S}" fill="${bg}"/>` : '') +
    `<g fill="none" stroke="${fg}"><circle cx="${c}" cy="${c}" r="192" stroke-width="2.6"/><circle cx="${c}" cy="${c}" r="184" stroke-width="1" opacity=".6"/><circle cx="${c}" cy="${c}" r="132" stroke-width="1.6" opacity=".75"/>` +
    `<path d="${wave(c + 78, 4, 24)}" stroke-width="2"/><path d="${wave(c + 90, 3, 24)}" stroke-width="2" opacity=".7"/></g>` +
    `<g fill="${fg}">${paths}<path d="${ampD}"/></g></svg>\n`;
}
fs.writeFileSync(path.join(out, 'logo-roundel-dark.svg'), roundel(BRASS_HI, INK));
fs.writeFileSync(path.join(out, 'logo-roundel-light.svg'), roundel('#7a5a2c', CREAM));

console.log('logos written to', path.relative(root, out));
