/* ==========================================================================
   Cocktail illustrations: one glass per drink on the current list.
   Colors are derived from each drink's real ingredients.
   Usage: <span data-glass="purple-rain"></span>  (hydrated by hydrateGlasses)
   ========================================================================== */
(function () {
  let uid = 0;
  const LINE = 'class="gl-line"';

  const foot = (y = 140) =>
    `<path ${LINE} d="M58.6 ${y - 44} V ${y} M61.4 ${y - 44} V ${y}"/>` +
    `<ellipse ${LINE} cx="60" cy="${y + 3}" rx="22" ry="3.4"/>`;

  const bubbles = (xs, y0, color = 'rgba(255,255,255,.75)') =>
    xs.map((x, i) =>
      `<circle class="bubble" cx="${x}" cy="${y0 - (i % 3) * 6}" r="${(i % 2) ? 0.9 : 1.3}" fill="${color}" style="animation-delay:${(i * 0.45).toFixed(2)}s"/>`
    ).join('');

  const grad = (id, top, bottom, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;

  /* ---- Glass bodies ---- */
  const coupe = (id, liquid, extra = '', garnish = '') => `
    <defs>
      ${liquid.defs}
      <clipPath id="c${id}"><path d="M21 57 C 25 74, 43 81.5, 60 81.5 C 77 81.5, 95 74, 99 57 Z"/></clipPath>
    </defs>
    <g clip-path="url(#c${id})">${liquid.body}${extra}
      <ellipse cx="60" cy="57.4" rx="39" ry="3" fill="rgba(255,255,255,.2)"/>
    </g>
    <path ${LINE} d="M16 52 C 18 77, 40 86, 60 86 C 80 86, 102 77, 104 52"/>
    <ellipse ${LINE} cx="60" cy="52" rx="44" ry="4.4"/>
    <path ${LINE} d="M57.4 86 C 58.6 92, 58.6 96, 58.6 100 M62.6 86 C 61.4 92, 61.4 96, 61.4 100"/>
    ${foot(140)}
    <path d="M25 62 C 29 72, 37 78, 45 80.5" stroke="rgba(255,255,255,.4)" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    ${garnish}`;

  const martini = (id, liquid, garnish = '') => `
    <defs>${liquid.defs}<clipPath id="c${id}"><path d="M25.5 52 L 94.5 52 L 60 90.5 Z"/></clipPath></defs>
    <g clip-path="url(#c${id})">${liquid.body}<ellipse cx="60" cy="52.4" rx="34" ry="2.4" fill="rgba(255,255,255,.2)"/></g>
    <path ${LINE} d="M17 44 L 60 93 L 103 44"/>
    <ellipse ${LINE} cx="60" cy="44" rx="43" ry="4"/>
    ${foot(140)}
    <path d="M27 51 L 50 77" stroke="rgba(255,255,255,.38)" stroke-width="1.1" stroke-linecap="round"/>
    ${garnish}`;

  const nora = (id, liquid, extra = '', garnish = '') => `
    <defs>${liquid.defs}<clipPath id="c${id}"><path d="M37.6 50 C 38 72, 47 91, 60 91 C 73 91, 82 72, 82.4 50 Z"/></clipPath></defs>
    <g clip-path="url(#c${id})">${liquid.body}${extra}</g>
    <path ${LINE} d="M36 40 C 36 70, 46 95, 60 95 C 74 95, 84 70, 84 40"/>
    <ellipse ${LINE} cx="60" cy="40" rx="24" ry="3"/>
    ${foot(140)}
    <path d="M40.5 52 C 41 68, 45 80, 50 87" stroke="rgba(255,255,255,.38)" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    ${garnish}`;

  const flute = (id, liquid, extra = '', garnish = '') => `
    <defs>${liquid.defs}<clipPath id="c${id}"><path d="M48.6 34 C 48.2 56, 51 79, 57.6 89.4 L 62.4 89.4 C 69 79, 71.8 56, 71.4 34 Z"/></clipPath></defs>
    <g clip-path="url(#c${id})">${liquid.body}${extra}</g>
    <path ${LINE} d="M47 22 C 46.4 50, 49 80, 57 93 L 63 93 C 71 80, 73.6 50, 73 22"/>
    <ellipse ${LINE} cx="60" cy="22" rx="13" ry="2"/>
    <path ${LINE} d="M58.6 93 V 140 M61.4 93 V 140"/><ellipse ${LINE} cx="60" cy="143" rx="20" ry="3.2"/>
    <path d="M50.5 38 C 50.4 56, 52 72, 55 82" stroke="rgba(255,255,255,.4)" stroke-width="1" fill="none" stroke-linecap="round"/>
    ${garnish}`;

  const rocks = (id, liquid, extra = '', garnish = '') => `
    <defs>${liquid.defs}<clipPath id="c${id}"><path d="M31.8 96 L 34.2 133 L 85.8 133 L 88.2 96 Z"/></clipPath></defs>
    <g clip-path="url(#c${id})">${liquid.body}${extra}<ellipse cx="60" cy="96.4" rx="28" ry="2.4" fill="rgba(255,255,255,.18)"/></g>
    <path ${LINE} d="M30 78 L 33 140 C 33.2 142.6, 35 144, 37.6 144 L 82.4 144 C 85 144, 86.8 142.6, 87 140 L 90 78"/>
    <ellipse ${LINE} cx="60" cy="78" rx="30" ry="3.4"/>
    <path ${LINE} d="M34.4 134 L 85.6 134" opacity=".6"/>
    <path d="M35 86 L 37.4 128" stroke="rgba(255,255,255,.35)" stroke-width="1.1" stroke-linecap="round"/>
    ${garnish}`;

  const highball = (id, liquid, extra = '', garnish = '') => `
    <defs>${liquid.defs}<clipPath id="c${id}"><path d="M39.6 46 L 41.2 137 L 78.8 137 L 80.4 46 Z"/></clipPath></defs>
    <g clip-path="url(#c${id})">${liquid.body}${extra}<ellipse cx="60" cy="46.3" rx="20" ry="1.8" fill="rgba(255,255,255,.2)"/></g>
    <path ${LINE} d="M38 34 L 40 142 C 40.1 144, 41.6 145, 43.6 145 L 76.4 145 C 78.4 145, 79.9 144, 80 142 L 82 34"/>
    <ellipse ${LINE} cx="60" cy="34" rx="22" ry="2.6"/>
    <path ${LINE} d="M41.2 138 L 78.8 138" opacity=".6"/>
    <path d="M43 42 L 44.4 132" stroke="rgba(255,255,255,.35)" stroke-width="1.1" stroke-linecap="round"/>
    ${garnish}`;

  const ice = (cubes) => cubes.map(([x, y, s, r]) =>
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="2.4" transform="rotate(${r} ${x + s / 2} ${y + s / 2})" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.42)" stroke-width=".8"/>`
  ).join('');

  const fill = (id, top, bottom, y = 20, h = 130) => ({
    defs: grad(`g${id}`, top, bottom),
    body: `<rect x="0" y="${y}" width="120" height="${h}" fill="url(#g${id})"/>`
  });

  /* ---- The drinks ---- */
  const DRINKS = {
    'purple-rain': (id) => {
      const liquid = {
        defs: grad(`g${id}`, '#5875e6', '#27378f') +
          `<radialGradient id="b${id}" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#d37ff0"/><stop offset=".55" stop-color="#9352cc"/><stop offset="1" stop-color="#5e2f9c"/></radialGradient>`,
        body: `<rect x="0" y="40" width="120" height="60" fill="url(#g${id})"/><circle class="bloom" cx="60" cy="60" r="48" fill="url(#b${id})"/>`
      };
      const garnish =
        `<path d="M86 49 c 5 -7, 14 -6, 15 0 c 1 5, -6 7, -10 4" stroke="#f28b6c" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
        `<circle class="drop" cx="60" cy="28" r="2.8" fill="#e8f07a"/>`;
      return coupe(id, liquid, '', garnish);
    },

    'first-class': (id) => highball(id, fill(id, '#f6b1bf', '#c2405f'),
      ice([[45, 58, 16, 12], [56, 80, 17, -9], [44, 100, 15, 20]]) + bubbles([50, 58, 66, 71, 53, 62], 128),
      `<circle cx="80" cy="36" r="10" fill="#f6d65a" stroke="#e0b52c" stroke-width="1"/><path d="M80 26 V46 M70 36 H90 M73 29 L87 43 M87 29 L73 43" stroke="#fff3c4" stroke-width=".8"/><circle cx="80" cy="36" r="10" fill="none" stroke="#fff6d6" stroke-width="1.4" opacity=".7"/>`),

    'perfect-place': (id) => highball(id, fill(id, '#e5edb9', '#aec46f'),
      ice([[46, 56, 16, -10], [56, 78, 16, 14], [45, 99, 15, -4]]) + bubbles([49, 57, 64, 70, 60, 52, 67], 130, 'rgba(255,255,240,.85)'),
      `<path d="M74 34 C 76 20, 90 14, 98 18 C 96 28, 86 36, 74 34 Z" fill="#5e8f3e"/><path d="M75 33 C 83 26, 90 22, 97 19" stroke="#a9cf7c" stroke-width=".9" fill="none"/>` +
      `<circle cx="70" cy="30" r="4.2" fill="#8a5aa8"/><circle cx="68.6" cy="28.8" r="1.2" fill="rgba(255,255,255,.5)"/>`),

    '395': (id) => rocks(id, fill(id, '#f6cd67', '#cf8a1f', 80, 70),
      ice([[40, 99, 20, 10], [60, 104, 19, -12]]) + bubbles([46, 58, 72], 130),
      `<g transform="translate(78 76) rotate(-18)"><ellipse cx="0" cy="0" rx="11" ry="10.4" fill="#4f8a35"/><ellipse cx="0" cy="0" rx="7.4" ry="7" fill="#b9d98c"/><circle cx="-2" cy="-2" r="1.3" fill="#f3f0cf"/><circle cx="2.4" cy="-.6" r="1.2" fill="#f3f0cf"/><circle cx="-.4" cy="2.6" r="1.2" fill="#f3f0cf"/><circle cx="2.8" cy="3" r="1" fill="#f3f0cf"/></g>`),

    'nice-dream': (id) => nora(id, fill(id, '#d56a84', '#95304c', 40, 60),
      `<rect x="30" y="49" width="60" height="9.5" fill="#f5e8de"/><path d="M30 58.5 C 45 61, 75 61, 90 58.5" stroke="#e6d2c3" stroke-width="1.2" fill="none"/>`,
      `<circle cx="52" cy="53" r="1.8" fill="#8e1f3a"/><circle cx="60" cy="52" r="1.8" fill="#8e1f3a"/><circle cx="68" cy="53" r="1.8" fill="#8e1f3a"/>`),

    'isabella': (id) => rocks(id, fill(id, '#a3522a', '#4f1f10', 80, 70),
      `<rect x="43" y="93" width="34" height="33" rx="3.5" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.5)" stroke-width=".9"/><path d="M46 97 L 58 97" stroke="rgba(255,255,255,.55)" stroke-width="1.2" stroke-linecap="round"/>`,
      `<path d="M66 70 C 76 64, 90 66, 96 74 C 88 74, 78 74, 68 78 Z" fill="#e8872c" stroke="#c9661a" stroke-width=".8"/>`),

    'the-cruz': (id) => nora(id, fill(id, '#c98434', '#6f3c12', 40, 60), '',
      `<path class="smoke" d="M56 36 C 50 28, 62 22, 56 12 C 52 6, 58 2, 56 -4" stroke="rgba(241,234,223,.55)" stroke-width="1.2" fill="none" stroke-linecap="round"/>` +
      `<path class="smoke" style="animation-delay:1.8s" d="M64 36 C 70 30, 60 22, 66 14 C 70 8, 64 2, 67 -4" stroke="rgba(241,234,223,.45)" stroke-width="1" fill="none" stroke-linecap="round"/>` +
      `<path d="M74 40 C 82 32, 92 34, 94 42 C 88 40, 82 40, 76 44 Z" fill="#e98a34"/>`),

    'moon-goddess': (id) => flute(id, fill(id, '#f8ebb6', '#dcb95a', 30, 70),
      bubbles([54, 58, 62, 66, 56, 64, 60, 58], 86, 'rgba(255,255,255,.9)'),
      `<path d="M71 24 C 75 18, 82 18, 84 23" stroke="#f3d34a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`),

    'beet-martini': (id) => martini(id, fill(id, '#c9335e', '#6d0f2b', 40, 60),
      `<path d="M92 42 c 4 -6, 11 -6, 12 -1 c 1 4, -4 6, -7 4" stroke="#f0cf4a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`),

    'bartenders-choice': (id) => `
      <defs>${grad(`g${id}`, 'rgba(223,189,132,.30)', 'rgba(196,154,92,.55)')}<clipPath id="c${id}"><path d="M35.4 70 L 38.4 137 L 81.6 137 L 84.6 70 Z"/></clipPath></defs>
      <g clip-path="url(#c${id})"><rect x="0" y="70" width="120" height="80" fill="url(#g${id})"/>${ice([[42, 76, 17, 8], [60, 82, 16, -14], [46, 100, 17, 24], [62, 108, 15, 6]])}</g>
      <path ${LINE} d="M34 50 L 37 140 C 37.2 142.6, 39 144, 41.6 144 L 78.4 144 C 81 144, 82.8 142.6, 83 140 L 86 50"/>
      <path ${LINE} d="M34 50 C 30 49, 27 46, 28 44 C 34 45, 40 47, 46 47.6 L 74 47.6 C 80 47.6, 85 48.6, 86 50"/>
      <path ${LINE} d="M38 60 L 40 136 M50 58.6 L 51 138 M62 58.6 L 62.4 138 M74 58.6 L 74 138" opacity=".22"/>
      <path d="M86 6 L 66 128" stroke="#dfbd84" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M84.4 16 l 3 1 M83.6 21 l 3 1 M82.8 26 l 3 1 M82 31 l 3 1 M81.2 36 l 3 1 M80.4 41 l 3 1" stroke="#dfbd84" stroke-width="1"/>
      <ellipse cx="86.6" cy="4" rx="2.6" ry="3.6" fill="#dfbd84"/>
      <path d="M40 60 L 41.6 128" stroke="rgba(255,255,255,.3)" stroke-width="1.1" stroke-linecap="round"/>`
  };

  const LABELS = {
    'purple-rain': 'Purple Rain, served up in a coupe',
    'first-class': 'First Class, a tall highball with a lemon wheel',
    'perfect-place': 'Perfect Place, a highball with basil and grape',
    '395': 'The 395 on the rocks with a jalapeño coin',
    'nice-dream': 'Nice Dream, a Nick and Nora with egg-white foam',
    'isabella': 'Isabella, stirred over a large cube with orange peel',
    'the-cruz': 'The Cruz, stirred with a wisp of smoke',
    'moon-goddess': 'Moon Goddess, a sparkling flute',
    'beet-martini': 'Beet Martini, garnet red in a martini glass',
    'bartenders-choice': "Bartender's Choice: a mixing glass and bar spoon"
  };

  function glassSVG(name, extraClass = '') {
    const fn = DRINKS[name];
    if (!fn) return '';
    const id = `gl${++uid}`;
    return `<svg class="glass ${extraClass}" viewBox="0 0 120 160" role="img" aria-label="${LABELS[name] || name}">${fn(id)}</svg>`;
  }

  const ROUTE_SHIELD = `<svg class="route-shield" viewBox="0 0 40 40" aria-hidden="true"><path d="M5 7 C 10 4.6, 15 4, 20 6.6 C 25 4, 30 4.6, 35 7 C 36.2 17, 35 25, 31.6 30 C 27.8 34.6, 22.6 36.4, 20 38.6 C 17.4 36.4, 12.2 34.6, 8.4 30 C 5 25, 3.8 17, 5 7 Z" fill="#f1eadf" stroke="#0f1517" stroke-width="1.6"/><path d="M5.6 12.4 H 34.4" stroke="#0f1517" stroke-width="1"/><text x="20" y="27.4" text-anchor="middle" font-family="Jost, sans-serif" font-weight="600" font-size="11.5" fill="#0f1517">395</text></svg>`;

  function injectStyles() {
    if (document.getElementById('glass-styles')) return;
    const s = document.createElement('style');
    s.id = 'glass-styles';
    s.textContent = `
      .glass .gl-line { fill: none; stroke: rgba(241,234,223,.82); stroke-width: 1.35; stroke-linejoin: round; stroke-linecap: round; }
      .on-light .glass .gl-line, .on-paper .glass .gl-line, .glass.dark-line .gl-line { stroke: rgba(27,32,34,.8); }
      .glass { overflow: visible; }`;
    document.head.appendChild(s);
  }

  function hydrateGlasses(root = document) {
    injectStyles();
    root.querySelectorAll('[data-glass]').forEach((el) => {
      if (el.dataset.hydrated) return;
      el.innerHTML = glassSVG(el.dataset.glass, el.dataset.glassClass || '');
      el.dataset.hydrated = '1';
    });
    root.querySelectorAll('[data-route-shield]').forEach((el) => { el.innerHTML = ROUTE_SHIELD; });
  }

  window.SSK = window.SSK || {};
  window.SSK.glassSVG = glassSVG;
  window.SSK.hydrateGlasses = hydrateGlasses;
})();
