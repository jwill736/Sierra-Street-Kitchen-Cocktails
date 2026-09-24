// Render the concept pages to PNG with headless Chromium.
// Usage: node scripts/screenshot.mjs [page ...]
//   NODE_PATH="$(npm root -g)" node scripts/screenshot.mjs index menu brand audit
// Serves the repo on a local port, then captures desktop + mobile full-page shots
// (and a notes-on variant of the homepage) into screenshots/.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, url === '/' ? 'index.html' : url);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['index', 'menu', 'brand', 'audit'];
const viewports = [
  { name: 'desktop', width: 1440, height: 900, dpr: 1 },
  { name: 'mobile', width: 390, height: 844, dpr: 2, mobile: true }
];

const browser = await chromium.launch();
const errors = [];
for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dpr, isMobile: !!vp.mobile, hasTouch: !!vp.mobile,
    timezoneId: 'America/Los_Angeles', reducedMotion: 'no-preference'
  });
  for (const p of pages) {
    const variants = p === 'index' ? ['', 'notes'] : [''];
    for (const v of variants) {
      const page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(`${p}/${vp.name}: ${e.message}`));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(`${p}/${vp.name} console: ${m.text()}`); });
      await page.goto(`${base}/${p}.html${v ? '?notes=1' : ''}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      // Reveal everything and settle animations for a static capture
      await page.addStyleTag({ content: '.reveal{opacity:1!important;transform:none!important}.mobile-reserve{display:none!important}' });
      await page.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y < h; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
      });
      await page.evaluate(() => document.querySelectorAll('[data-feature-glass] svg.glass').forEach((g) => g.classList.add('changed')));
      await page.waitForTimeout(2600);
      const file = path.join(outDir, `${p}${v ? '-' + v : ''}-${vp.name}.jpg`);
      await page.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 80 });
      // First-screen crop as well
      await page.screenshot({ path: file.replace('.jpg', '-fold.jpg'), fullPage: false, type: 'jpeg', quality: 85 });
      console.log('saved', path.relative(root, file));
      await page.close();
    }
  }
  await ctx.close();
}
await browser.close();
server.close();
if (errors.length) { console.log('\nPage errors:\n' + errors.join('\n')); process.exitCode = 1; }
