// Build self-contained, single-file copies of each page into dist/.
// Fonts, stylesheets, scripts and SVG images are inlined, so every page opens
// offline straight from the file system (handy for presenting from a laptop).
// Usage: npm run bundle
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });

const read = (p) => fs.readFileSync(path.join(root, p));
const b64 = (p) => read(p).toString('base64');

function inlineCss(href) {
  const dir = path.dirname(href);
  return read(href).toString('utf8').replace(/url\("?(\.\.\/fonts\/[^")]+)"?\)/g, (_, rel) => {
    const file = path.normalize(path.join(dir, rel));
    return `url("data:font/woff2;base64,${b64(file)}")`;
  });
}

const pages = ['index', 'menu', 'brand', 'audit'];
for (const page of pages) {
  let html = read(`${page}.html`).toString('utf8');
  html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) => `<style>\n${inlineCss(href)}\n</style>`);
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) =>
    `<script>\n${read(src).toString('utf8').replace(/<\/script/gi, '<\\/script')}\n</script>`);
  html = html.replace(/(src|href)="(assets\/img\/[^"]+\.svg)"/g, (_, attr, file) =>
    `${attr}="data:image/svg+xml;base64,${b64(file)}"`);
  const out = path.join(dist, `${page}.html`);
  fs.writeFileSync(out, html);
  console.log(`dist/${page}.html  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
}
