/* ==========================================================================
   Top-down plate illustrations for the menu preview.
   Four signature small plates, drawn from the menu descriptions:
   scallops · bacon-wrapped dates · tuna shichimi · crab cakes
   ========================================================================== */
(function () {
  let uid = 0;

  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }
  const f = (n) => Number(n).toFixed(1);

  /* Smooth closed blob through n jittered points (Catmull-Rom -> cubic Bezier) */
  function blob(cx, cy, r, wob, n, rand, sx = 1, sy = 1) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (1 + (rand() - 0.5) * wob);
      pts.push([cx + Math.cos(a) * rr * sx, cy + Math.sin(a) * rr * sy]);
    }
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)}, ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)}, ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + 'Z';
  }

  const leaf = (x, y, rot, s, c) =>
    `<path d="M0 0 C ${f(4 * s)} ${f(-5 * s)}, ${f(10 * s)} ${f(-5 * s)}, ${f(14 * s)} 0 C ${f(10 * s)} ${f(5 * s)}, ${f(4 * s)} ${f(5 * s)}, 0 0 Z" transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" fill="${c}"/>`;

  function sprigs(cx, cy, count, rand, spread = 14) {
    let out = '';
    const greens = ['#5f8a3f', '#78a24f', '#94bb66', '#4d7534'];
    for (let i = 0; i < count; i++) {
      const x = cx + (rand() - 0.5) * spread * 2;
      const y = cy + (rand() - 0.5) * spread * 2;
      out += leaf(x, y, rand() * 360, 0.55 + rand() * 0.5, greens[Math.floor(rand() * greens.length)]);
    }
    return out;
  }

  function plateBase(id, rand) {
    let rim = '';
    for (let i = 0; i < 110; i++) {
      const a = rand() * Math.PI * 2;
      const rr = 142 + rand() * 42;
      rim += `<circle cx="${f(200 + Math.cos(a) * rr)}" cy="${f(200 + Math.sin(a) * rr)}" r="${(0.45 + rand() * 1.05).toFixed(2)}"/>`;
    }
    for (let i = 0; i < 28; i++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * 132;
      rim += `<circle cx="${f(200 + Math.cos(a) * rr)}" cy="${f(200 + Math.sin(a) * rr)}" r="${(0.4 + rand() * 0.7).toFixed(2)}"/>`;
    }
    return `
      <defs>
        <radialGradient id="pg${id}" cx=".42" cy=".36" r=".78"><stop offset="0" stop-color="#fcf9f3"/><stop offset=".68" stop-color="#efe8dc"/><stop offset="1" stop-color="#d6c9b3"/></radialGradient>
        <radialGradient id="pw${id}" cx=".44" cy=".38" r=".66"><stop offset="0" stop-color="#f8f4ec"/><stop offset="1" stop-color="#e4d9c6"/></radialGradient>
        <filter id="sh${id}" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="10"/></filter>
        <filter id="fs${id}" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="2" dy="4" stdDeviation="3.2" flood-color="#3a2814" flood-opacity=".3"/></filter>
      </defs>
      <circle cx="212" cy="218" r="184" fill="rgba(34,24,14,.42)" filter="url(#sh${id})"/>
      <circle cx="200" cy="200" r="188" fill="url(#pg${id})"/>
      <circle cx="200" cy="200" r="181.5" fill="none" stroke="#b58d52" stroke-width="1.2" opacity=".55"/>
      <circle cx="200" cy="200" r="138" fill="url(#pw${id})"/>
      <circle cx="200" cy="200" r="138" fill="none" stroke="#d3c4aa" stroke-width="1.5"/>
      <path d="M 86 118 A 140 140 0 0 1 196 60" stroke="rgba(255,255,255,.85)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M 40 150 A 170 170 0 0 1 128 42" stroke="rgba(255,255,255,.6)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <g fill="#7a6a55" opacity=".3">${rim}</g>`;
  }

  /* ---------------- Compositions ---------------- */
  function scallops(id, rand) {
    const pool = blob(200, 208, 104, 0.22, 11, rand);
    const risotto = blob(200, 206, 78, 0.16, 12, rand);
    let grains = '';
    for (let i = 0; i < 170; i++) {
      const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 72;
      const x = 200 + Math.cos(a) * r, y = 206 + Math.sin(a) * r;
      grains += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${(2 + rand() * 1.3).toFixed(2)}" ry="${(1 + rand() * .5).toFixed(2)}" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})" fill="${rand() < .55 ? '#fffaf0' : '#cdb577'}"/>`;
    }
    let oil = '';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rand() * 0.3;
      oil += `<circle cx="${f(200 + Math.cos(a) * 96)}" cy="${f(208 + Math.sin(a) * 96)}" r="${(1.8 + rand() * 2.2).toFixed(2)}" fill="#7f9b3c" opacity=".75"/>`;
    }
    let zest = '';
    for (let i = 0; i < 26; i++) {
      const x = 150 + rand() * 100, y = 160 + rand() * 100;
      zest += `<rect x="${f(x)}" y="${f(y)}" width="3.2" height="1.1" rx=".5" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})" fill="#f2c230"/>`;
    }
    const sc = (x, y, r) => `
      <g filter="url(#fs${id})">
        <circle cx="${x}" cy="${y}" r="${r}" fill="#f2e2c2"/>
        <circle cx="${x}" cy="${y}" r="${r - 3.2}" fill="url(#sear${id})"/>
        <path d="M${x - r * .62} ${y - r * .28} A ${r * .7} ${r * .7} 0 0 1 ${x - r * .05} ${y - r * .66}" stroke="rgba(255,238,205,.55)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="${x}" cy="${y}" r="${r - .8}" fill="none" stroke="rgba(160,110,50,.35)" stroke-width="1"/>
      </g>`;
    return `
      <defs>
        <radialGradient id="sear${id}" cx=".46" cy=".44" r=".56"><stop offset="0" stop-color="#9a571c"/><stop offset=".5" stop-color="#c3833e"/><stop offset=".82" stop-color="#dcab68"/><stop offset="1" stop-color="#ead0a0"/></radialGradient>
        <radialGradient id="rs${id}" cx=".5" cy=".45" r=".62"><stop offset="0" stop-color="#f8f0da"/><stop offset="1" stop-color="#e2cd98"/></radialGradient>
      </defs>
      <path d="${pool}" fill="rgba(236,204,118,.38)"/>
      <path d="${pool}" fill="none" stroke="rgba(206,168,82,.35)" stroke-width="1"/>
      ${oil}
      <path d="${risotto}" fill="url(#rs${id})" filter="url(#fs${id})"/>
      <g>${grains}</g>
      ${sc(168, 180, 31)}${sc(236, 188, 30)}${sc(198, 242, 31)}
      <g>${sprigs(190, 158, 3, rand, 6)}${sprigs(258, 168, 2, rand, 6)}${sprigs(222, 222, 3, rand, 6)}</g>
      <g>${zest}</g>`;
  }

  function dates(id, rand) {
    const d = (x, y, rot) => `
      <g transform="translate(${x} ${y}) rotate(${rot})" filter="url(#fs${id})">
        <ellipse cx="-29" cy="0" rx="8" ry="12.5" fill="#f6f0e3"/>
        <ellipse cx="29" cy="0" rx="8" ry="12.5" fill="#f6f0e3"/>
        <rect x="-30" y="-17" width="60" height="34" rx="16" fill="url(#bc${id})"/>
        <path d="M-25 -9 C -12 -14, 4 -5, 23 -11" stroke="#f3cfb0" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".9"/>
        <path d="M-27 2 C -10 -2, 7 7, 25 1" stroke="#f0c3a0" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".75"/>
        <path d="M-22 11 C -8 8, 8 13, 21 9" stroke="#4a160c" stroke-width="2.2" fill="none" opacity=".55"/>
        <path d="M-20 -14 C -6 -16, 10 -16, 20 -13" stroke="rgba(255,255,255,.35)" stroke-width="1.4" fill="none"/>
      </g>`;
    let salt = '';
    for (let i = 0; i < 40; i++) {
      const x = 120 + rand() * 160, y = 125 + rand() * 150;
      salt += `<rect x="${f(x)}" y="${f(y)}" width="${(1.6 + rand() * 1.6).toFixed(1)}" height="${(1.6 + rand() * 1.6).toFixed(1)}" transform="rotate(${f(rand() * 90)} ${f(x)} ${f(y)})" fill="#ffffff" opacity=".85"/>`;
    }
    let chive = '';
    for (let i = 0; i < 22; i++) {
      const x = 118 + rand() * 164, y = 122 + rand() * 156, a = rand() * 180;
      chive += `<rect x="${f(x)}" y="${f(y)}" width="7" height="2" rx="1" transform="rotate(${f(a)} ${f(x)} ${f(y)})" fill="#4f8a35"/>`;
    }
    return `
      <defs><linearGradient id="bc${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b1502f"/><stop offset=".55" stop-color="#8a3219"/><stop offset="1" stop-color="#5e1d0e"/></linearGradient></defs>
      ${d(134, 176, -24)}${d(200, 150, -4)}${d(266, 172, 20)}${d(162, 242, -10)}${d(238, 248, 12)}
      <path d="M104 150 C 140 196, 160 118, 198 170 S 252 128, 280 196 S 320 250, 300 262" stroke="#2a110b" stroke-width="3.8" fill="none" stroke-linecap="round" opacity=".88"/>
      <path d="M118 262 C 150 226, 176 290, 204 246 S 262 290, 286 226" stroke="#2a110b" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M104 150 C 140 196, 160 118, 198 170" stroke="rgba(255,255,255,.28)" stroke-width="1" fill="none"/>
      <g>${chive}</g><g>${salt}</g>`;
  }

  function tuna(id, rand) {
    // shingled slices of seared ahi along a gentle arc
    const slices = [];
    const n = 6;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const x = 126 + t * 150;
      const y = 214 - Math.sin(t * Math.PI) * 30 + t * 6;
      const rot = -22 + t * 44;
      let specks = '';
      for (let k = 0; k < 18; k++) {
        const side = k % 4;
        const sx = side === 0 ? -15 + rand() * 3 : side === 1 ? 12 + rand() * 3 : -14 + rand() * 28;
        const sy = side < 2 ? -40 + rand() * 80 : (side === 2 ? -42 + rand() * 3 : 39 + rand() * 3);
        specks += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${(0.6 + rand() * .9).toFixed(2)}" fill="${['#1d1414', '#c8352b', '#e0782c'][Math.floor(rand() * 3)]}"/>`;
      }
      slices.push(`
        <g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" filter="url(#fs${id})">
          <rect x="-16" y="-44" width="32" height="88" rx="6" fill="#5a3b35"/>
          <rect x="-12" y="-40" width="24" height="80" rx="4" fill="url(#tu${id})"/>
          <path d="M-6 -34 L -6 34" stroke="rgba(255,255,255,.18)" stroke-width="2" stroke-linecap="round"/>
          ${specks}
        </g>`);
    }
    let seaweed = '';
    for (let i = 0; i < 26; i++) {
      const x = 104 + rand() * 60, y = 272 + rand() * 36, len = 14 + rand() * 18, a = rand() * 360;
      seaweed += `<path d="M0 0 q ${f(len / 4)} -4 ${f(len / 2)} 0 t ${f(len / 2)} 0" transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})" stroke="${rand() < .5 ? '#3f6f27' : '#5c8f34'}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    }
    let sesame = '';
    for (let i = 0; i < 18; i++) {
      const x = 102 + rand() * 66, y = 268 + rand() * 46;
      sesame += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="1.8" ry="1" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})" fill="#f4ead2"/>`;
    }
    let ponzu = '';
    for (let i = 0; i < 8; i++) {
      const a = 0.3 + i * 0.15;
      ponzu += `<circle cx="${f(200 + Math.cos(a) * 112)}" cy="${f(200 + Math.sin(a) * 112)}" r="${(2.4 + (i % 3)).toFixed(1)}" fill="#7a3d18"/>`;
    }
    return `
      <defs>
        <linearGradient id="tu${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a42a3d"/><stop offset=".5" stop-color="#d8606f"/><stop offset="1" stop-color="#a42a3d"/></linearGradient>
        <radialGradient id="so${id}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#eef5e0"/><stop offset="1" stop-color="#b9d197"/></radialGradient>
      </defs>
      ${ponzu}
      <g>${seaweed}</g><g>${sesame}</g>
      ${slices.join('')}
      <g filter="url(#fs${id})"><ellipse cx="270" cy="278" rx="31" ry="17" transform="rotate(-24 270 278)" fill="url(#so${id})"/></g>
      <path d="M250 274 C 258 264, 274 260, 286 264" stroke="rgba(255,255,255,.7)" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  }

  function crab(id, rand) {
    const crumbs = (cx, cy, r) => {
      let out = '';
      for (let i = 0; i < 60; i++) {
        const a = rand() * Math.PI * 2, rr = Math.sqrt(rand()) * (r - 4);
        out += `<circle cx="${f(cx + Math.cos(a) * rr)}" cy="${f(cy + Math.sin(a) * rr)}" r="${(0.8 + rand() * 1.6).toFixed(2)}" fill="${rand() < .5 ? '#8f4f1c' : '#f1cf8e'}" opacity=".8"/>`;
      }
      return out;
    };
    let paprika = '';
    for (let i = 0; i < 30; i++) {
      paprika += `<circle cx="${f(120 + rand() * 170)}" cy="${f(130 + rand() * 150)}" r="${(0.6 + rand() * .8).toFixed(2)}" fill="#c9481f" opacity=".85"/>`;
    }
    const cake = (x, y, r) => `
      <g filter="url(#fs${id})">
        <path d="${blob(x, y, r, 0.1, 10, rand)}" fill="url(#cc${id})"/>
        ${crumbs(x, y, r)}
        <path d="M${x - r * .6} ${y - r * .55} A ${r} ${r} 0 0 1 ${x + r * .3} ${y - r * .9}" stroke="rgba(255,240,210,.55)" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>`;
    return `
      <defs>
        <radialGradient id="cc${id}" cx=".45" cy=".4" r=".62"><stop offset="0" stop-color="#ebbb72"/><stop offset=".65" stop-color="#cf8a3e"/><stop offset="1" stop-color="#9d5a24"/></radialGradient>
      </defs>
      <path d="M112 280 C 150 300, 220 300, 262 250 S 300 170, 292 150" stroke="#e9a52f" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M116 280 C 152 296, 218 296, 258 250 S 294 172, 288 154" stroke="#f6d27c" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
      ${cake(174, 196, 50)}${cake(246, 238, 46)}
      <g transform="translate(282 132) rotate(28)" filter="url(#fs${id})">
        <path d="M0 0 A 30 30 0 0 1 60 0 Z" fill="#f4d24c"/>
        <path d="M0 0 A 30 30 0 0 1 60 0" fill="none" stroke="#e0b21d" stroke-width="3.5"/>
        <path d="M30 0 L 30 -27 M30 0 L 12 -21 M30 0 L 48 -21" stroke="#fff4c2" stroke-width="1.4"/>
      </g>
      <g>${sprigs(214, 212, 7, rand, 14)}${sprigs(150, 150, 3, rand, 8)}</g>
      <g>${paprika}</g>`;
  }

  const DISHES = { scallops, dates, tuna, crab };
  const SEEDS = { scallops: 11, dates: 23, tuna: 37, crab: 51 };

  function plateSVG(kind, label) {
    const fn = DISHES[kind];
    if (!fn) return '';
    const id = `pl${++uid}`;
    const rand = rng(SEEDS[kind] || 7);
    return `<svg viewBox="-26 -26 452 452" class="plate" role="img" aria-label="${label || kind}">${plateBase(id, rand)}${fn(id, rand)}</svg>`;
  }

  window.SSK = window.SSK || {};
  window.SSK.plateSVG = plateSVG;
})();
