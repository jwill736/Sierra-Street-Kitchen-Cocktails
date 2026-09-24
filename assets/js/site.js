/* ==========================================================================
   Sierra St. Kitchen & Cocktails: rebrand concept, site behaviour
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Hours: one source of truth (mirrors sierrastkitchen.com, Sept 2026).
     Sun=0 … Sat=6, [open, close] in 24h. Golden Hour 4:00–5:30 daily.
     ------------------------------------------------------------------ */
  const HOURS = { 0: [16, 21], 1: [16, 21], 2: [16, 21], 3: [16, 21], 4: [16, 21], 5: [16, 24], 6: [16, 24] };
  const GOLDEN = [16 * 60, 17 * 60 + 30];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const fmtHour = (h) => (h === 24 ? 'midnight' : h === 12 ? 'noon' : `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`);

  function renoNow() {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
      }).formatToParts(new Date());
      const get = (t) => (parts.find((p) => p.type === t) || {}).value;
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
      const h = parseInt(get('hour'), 10) % 24;
      return { day, minutes: h * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      const d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function currentStatus() {
    const { day, minutes } = renoNow();
    const [o, c] = HOURS[day];
    const open = o * 60, close = c * 60;
    if (minutes < open) return { state: 'closed', text: 'Opens today at 4 PM', sub: 'Golden Hour 4–5:30' };
    if (minutes < GOLDEN[1]) return { state: 'golden', text: 'Open now · Golden Hour until 5:30', sub: `Until ${fmtHour(c)}` };
    if (minutes < close - 30) return { state: 'open', text: `Open now · until ${fmtHour(c)}`, sub: 'Walk-ins welcome at the bar' };
    if (minutes < close) return { state: 'soon', text: `Last call soon · closing at ${fmtHour(c)}`, sub: '' };
    return { state: 'closed', text: `Closed now · back ${DAYS[(day + 1) % 7]} at 4 PM`, sub: '' };
  }

  function renderStatus() {
    const s = currentStatus();
    $$('[data-status]').forEach((el) => {
      el.dataset.state = s.state;
      const t = $('.st-text', el); if (t) t.textContent = s.text;
      const sub = $('.st-sub', el);
      if (sub) { sub.textContent = s.sub; sub.hidden = !s.sub; }
      const sep = $('.sep', el); if (sep) sep.hidden = !s.sub;
    });
    const { day } = renoNow();
    $$('[data-today-name]').forEach((el) => { el.textContent = DAYS[day]; });
    $$('.hours tr[data-day]').forEach((tr) => {
      tr.classList.toggle('today', tr.dataset.day.split(',').map(Number).includes(day));
    });
  }

  /* ------------------------------------------------------------------
     Hero: "river lights": dusk over the Sierra, the far bank lit up,
     reflections shimmering on the Truckee.
     ------------------------------------------------------------------ */
  function riverLights(canvas) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, lights = [], stat = null, raf = 0, visible = true, horizon = 0, moon = null;

    function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

    function build() {
      const rand = seeded(20160501);
      horizon = Math.round(h * (w < 700 ? 0.62 : 0.58));
      stat = document.createElement('canvas');
      stat.width = Math.round(w * dpr); stat.height = Math.round(h * dpr);
      const s = stat.getContext('2d');
      s.setTransform(dpr, 0, 0, dpr, 0, 0);

      // sky
      const sky = s.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, '#070b0d');
      sky.addColorStop(0.45, '#0e141d');
      sky.addColorStop(0.82, '#241f31');
      sky.addColorStop(1, '#3b2b35');
      s.fillStyle = sky; s.fillRect(0, 0, w, horizon);

      // stars
      for (let i = 0; i < Math.round(w / 9); i++) {
        const x = rand() * w, y = rand() * horizon * 0.62, r = rand() * 0.9 + 0.2;
        s.fillStyle = `rgba(241,234,223,${(0.12 + rand() * 0.4).toFixed(2)})`;
        s.beginPath(); s.arc(x, y, r, 0, Math.PI * 2); s.fill();
      }

      // moon (a nod to the Moon Goddess)
      moon = { x: w * (w < 700 ? 0.8 : 0.78), y: horizon * 0.3, r: Math.max(9, Math.min(18, w / 90)) };
      const glow = s.createRadialGradient(moon.x, moon.y, 0, moon.x, moon.y, moon.r * 9);
      glow.addColorStop(0, 'rgba(246,230,190,.28)'); glow.addColorStop(1, 'rgba(246,230,190,0)');
      s.fillStyle = glow; s.fillRect(moon.x - moon.r * 9, moon.y - moon.r * 9, moon.r * 18, moon.r * 18);
      s.fillStyle = '#f3e7c9'; s.beginPath(); s.arc(moon.x, moon.y, moon.r, 0, Math.PI * 2); s.fill();
      s.fillStyle = 'rgba(200,185,150,.35)';
      s.beginPath(); s.arc(moon.x - moon.r * .3, moon.y - moon.r * .2, moon.r * .22, 0, Math.PI * 2); s.fill();
      s.beginPath(); s.arc(moon.x + moon.r * .25, moon.y + moon.r * .3, moon.r * .15, 0, Math.PI * 2); s.fill();

      // ridgelines: the Sierra in silhouette
      const ridge = (base, amp, color, seed) => {
        const r = seeded(seed);
        const p = [r() * 6, r() * 6, r() * 6];
        s.fillStyle = color; s.beginPath(); s.moveTo(0, horizon);
        for (let x = 0; x <= w; x += 6) {
          const t = x / w;
          const y = base - amp * (0.55 * Math.sin(t * 5.1 + p[0]) + 0.3 * Math.sin(t * 13.7 + p[1]) + 0.15 * Math.sin(t * 31 + p[2]));
          s.lineTo(x, y);
        }
        s.lineTo(w, horizon); s.closePath(); s.fill();
      };
      ridge(horizon - h * 0.085, h * 0.05, '#1b1d2b', 7);
      ridge(horizon - h * 0.035, h * 0.03, '#10141b', 19);

      // far bank glow + city lights
      const bank = s.createLinearGradient(0, horizon - 30, 0, horizon);
      bank.addColorStop(0, 'rgba(231,184,114,0)'); bank.addColorStop(1, 'rgba(231,184,114,.16)');
      s.fillStyle = bank; s.fillRect(0, horizon - 30, w, 30);
      s.fillStyle = '#0b1013'; s.fillRect(0, horizon - 3, w, 3);

      lights = [];
      const count = Math.round(w / 26);
      for (let i = 0; i < count; i++) {
        const x = rand() * w;
        const k = rand();
        const color = k < 0.7 ? [236, 188, 118] : k < 0.88 ? [168, 196, 214] : [165, 133, 214];
        const y = horizon - 4 - rand() * 16;
        const size = 0.7 + rand() * 1.5;
        const g = s.createRadialGradient(x, y, 0, x, y, size * 6);
        g.addColorStop(0, `rgba(${color},.55)`); g.addColorStop(1, `rgba(${color},0)`);
        s.fillStyle = g; s.fillRect(x - size * 6, y - size * 6, size * 12, size * 12);
        s.fillStyle = `rgba(${color},.95)`; s.beginPath(); s.arc(x, y, size, 0, Math.PI * 2); s.fill();
        if (rand() < 0.55) lights.push({ x, color, strength: 0.35 + rand() * 0.75, width: 6 + rand() * 22, phase: rand() * 6.28, speed: 0.35 + rand() * 0.7 });
      }
      lights.push({ x: moon.x, color: [243, 231, 201], strength: 1.25, width: 34, phase: 1.2, speed: 0.5 });

      // water
      const water = s.createLinearGradient(0, horizon, 0, h);
      water.addColorStop(0, '#141d26'); water.addColorStop(0.5, '#0d1418'); water.addColorStop(1, '#070a0c');
      s.fillStyle = water; s.fillRect(0, horizon, w, h - horizon);
      s.fillStyle = 'rgba(255,226,170,.10)'; s.fillRect(0, horizon, w, 1);
    }

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      draw(performance.now());
    }

    function draw(t) {
      const time = t / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(stat, 0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const span = h - horizon;
      for (const L of lights) {
        const [r, g, b] = L.color;
        const p = L.phase;
        for (let y = horizon + 3; y < h; y += 4) {
          const depth = (y - horizon) / span;
          // broken, shimmering dashes: three incommensurate waves for the drift,
          // a fast "presence" wave to open gaps between the glints
          const drift = Math.sin(y * 0.041 + time * 0.55 * L.speed + p) * 0.55 +
                        Math.sin(y * 0.113 - time * 0.9 * L.speed + p * 1.7) * 0.3 +
                        Math.sin(y * 0.271 + time * 1.6 + p * 2.3) * 0.15;
          const presence = 0.5 + 0.5 * Math.sin(y * 0.37 + time * 2.2 * L.speed + p * 3.1) * Math.cos(y * 0.089 - time * 0.7 + p);
          if (presence < 0.34) continue;
          const len = L.width * (0.3 + depth * 1.7) * (0.35 + presence);
          const a = L.strength * Math.pow(1 - depth, 1.5) * presence;
          if (a < 0.03 || len < 1) continue;
          ctx.fillStyle = `rgba(${r},${g},${b},${(a * 0.46).toFixed(3)})`;
          ctx.fillRect(L.x + drift * (3 + depth * 22) - len / 2, y, len, 1.2 + depth * 1.6);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    function loop(t) {
      draw(t);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    }

    resize();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
    if (reduceMotion) { draw(4200); return; }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && visible) raf = requestAnimationFrame(loop);
    });
  }

  /* ------------------------------------------------------------------
     Roundel (coaster mark), drawn inline so it uses the page fonts
     ------------------------------------------------------------------ */
  let rid = 0;
  function roundelSVG() {
    const id = `rp${++rid}`;
    return `<svg viewBox="0 0 200 200" class="roundel-svg" aria-hidden="true">
      <defs><path id="${id}" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"/></defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="1.3"/>
      <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width=".5" opacity=".6"/>
      <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" stroke-width=".8" opacity=".7"/>
      <text font-family="Jost, sans-serif" font-weight="500" font-size="10.4" letter-spacing="2.4" fill="currentColor">
        <textPath href="#${id}" startOffset="0" textLength="470" lengthAdjust="spacing">SIERRA ST. • KITCHEN &amp; COCKTAILS • RENO, NEVADA • EST. 2016 •</textPath>
      </text>
      <text x="100" y="121" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-style="italic" font-weight="500" font-size="80" fill="currentColor">&amp;</text>
      <path d="M76 138 q6 -3.6 12 0 t12 0 t12 0 t12 0" fill="none" stroke="currentColor" stroke-width="1"/>
      <path d="M82 144 q6 -3.6 12 0 t12 0 t12 0" fill="none" stroke="currentColor" stroke-width="1" opacity=".7"/>
    </svg>`;
  }
  const hydrateRoundels = () => $$('[data-roundel]').forEach((el) => { el.innerHTML = roundelSVG(); });

  /* ------------------------------------------------------------------ Header */
  function header() {
    const hd = $('.site-header');
    if (!hd) return;
    const threshold = () => (document.body.classList.contains('page-home') ? 260 : 120);
    const onScroll = () => {
      const stuck = window.scrollY > threshold();
      if (stuck !== hd.classList.contains('is-stuck')) hd.classList.toggle('is-stuck', stuck);
      const mr = $('.mobile-reserve');
      if (mr) mr.classList.toggle('show', window.scrollY > window.innerHeight * 0.75);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const mb = $('.menu-btn');
    if (mb) {
      mb.addEventListener('click', () => {
        const open = document.body.classList.toggle('nav-open');
        mb.setAttribute('aria-expanded', String(open));
      });
      $$('.nav-links a').forEach((a) => a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        mb.setAttribute('aria-expanded', 'false');
      }));
    }
  }

  /* ------------------------------------------------------------------ Reveal */
  function reveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((e) => io.observe(e));
  }

  /* ------------------------------------------------------------------ Purple Rain */
  function purpleRain() {
    const holder = $('[data-feature-glass]');
    if (!holder) return;
    const glass = $('svg.glass', holder);
    if (!glass) return;
    const play = () => {
      glass.classList.remove('changed', 'pouring');
      void glass.getBoundingClientRect();
      glass.classList.add('pouring');
      setTimeout(() => glass.classList.add('changed'), reduceMotion ? 0 : 750);
    };
    glass.addEventListener('click', play);
    const hint = $('[data-play-rain]');
    if (hint) hint.addEventListener('click', play);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(play, 400); io.disconnect(); } }, { threshold: 0.5 });
      io.observe(holder);
    } else { glass.classList.add('changed'); }
  }

  /* ------------------------------------------------------------------ Plates */
  function plates() {
    const stack = $('[data-plate-stack]');
    if (!stack || !window.SSK || !window.SSK.plateSVG) return;
    const kinds = [
      ['scallops', 'Seared scallops on parmesan risotto'],
      ['dates', 'Bacon-wrapped dates with goat cheese and balsamic'],
      ['tuna', 'Tuna shichimi togarashi with cucumber-sake sorbet'],
      ['crab', 'Crab cakes with saffron-lemon aioli']
    ];
    stack.innerHTML = kinds.map(([k, label], i) =>
      `<div class="plate-layer${i === 0 ? ' active' : ''}" data-kind="${k}">${window.SSK.plateSVG(k, label)}</div>`).join('');
    const caption = $('[data-plate-caption]');
    const setPlate = (k) => {
      $$('.plate-layer', stack).forEach((l) => l.classList.toggle('active', l.dataset.kind === k));
      $$('[data-plate]').forEach((li) => li.classList.toggle('is-shown', li.dataset.plate === k));
      const match = kinds.find(([kk]) => kk === k);
      if (caption && match) caption.textContent = match[1];
    };
    $$('[data-plate]').forEach((li) => {
      ['mouseenter', 'focusin', 'click'].forEach((ev) => li.addEventListener(ev, () => setPlate(li.dataset.plate)));
    });
    setPlate('scallops');
    if (!reduceMotion) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return; ticking = true;
        requestAnimationFrame(() => { stack.style.transform = `rotate(${(window.scrollY * 0.025).toFixed(2)}deg)`; ticking = false; });
      }, { passive: true });
    }
  }

  /* ------------------------------------------------------------------ Reservations (prototype) */
  function reservations() {
    const dlg = $('#reserve');
    if (!dlg) return;
    const state = { party: 2, dayOffset: 0, time: '7:00 PM', show: false, occasion: '' };
    const { day: today } = renoNow();

    const datesEl = $('[data-dates]', dlg), slotsEl = $('[data-slots]', dlg);
    const out = $('[data-party]', dlg), summary = $('[data-summary]', dlg);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function dateFor(offset) { const d = new Date(); d.setDate(d.getDate() + offset); return d; }
    function renderDates() {
      datesEl.innerHTML = Array.from({ length: 7 }, (_, i) => {
        const d = dateFor(i);
        const label = i === 0 ? 'Tonight' : i === 1 ? 'Tomorrow' : DAYS[(today + i) % 7].slice(0, 3);
        return `<button type="button" class="chip" aria-pressed="${i === state.dayOffset}" data-offset="${i}">${label}<small>${monthNames[d.getMonth()]} ${d.getDate()}</small></button>`;
      }).join('');
    }
    function slotsFor(offset) {
      const dow = (today + offset) % 7;
      const lastSeat = HOURS[dow][1] === 24 ? 22 * 60 : 20 * 60 + 30;
      const out = [];
      for (let m = 16 * 60; m <= lastSeat; m += 30) out.push(m);
      return out;
    }
    const label = (m) => { const h = Math.floor(m / 60), mm = m % 60; return `${h > 12 ? h - 12 : h}:${mm ? '30' : '00'} PM`; };
    function renderSlots() {
      const list = slotsFor(state.dayOffset);
      let s = 17 + state.dayOffset * 5 + state.party;
      const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      if (!list.map(label).includes(state.time)) state.time = label(list[Math.min(6, list.length - 1)]);
      slotsEl.innerHTML = list.map((m) => {
        const l = label(m);
        const booked = l !== state.time && r() < 0.22;
        return `<button type="button" class="chip" data-time="${l}" aria-pressed="${l === state.time}" ${booked ? 'disabled title="Fully booked"' : ''}>${l.replace(' PM', '')}<small>${m < GOLDEN[1] ? 'Golden Hr' : 'PM'}</small></button>`;
      }).join('');
    }
    function renderSummary() {
      const d = dateFor(state.dayOffset);
      const when = state.dayOffset === 0 ? 'Tonight' : `${DAYS[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;
      out.textContent = `${state.party} ${state.party === 1 ? 'guest' : 'guests'}`;
      summary.innerHTML = `${when} at ${state.time}<small>Party of ${state.party}${state.show ? ' · paced for showtime' : ''}${state.occasion ? ' · ' + state.occasion : ''}</small>`;
    }
    function renderAll() { renderDates(); renderSlots(); renderSummary(); }

    dlg.addEventListener('click', (e) => {
      const t = e.target.closest('button');
      if (e.target === dlg) { dlg.close(); return; }
      if (!t) return;
      if (t.dataset.offset !== undefined) { state.dayOffset = +t.dataset.offset; renderAll(); }
      else if (t.dataset.time) { state.time = t.dataset.time; renderSlots(); renderSummary(); }
      else if (t.dataset.step) {
        state.party = Math.max(1, Math.min(12, state.party + +t.dataset.step));
        renderSlots(); renderSummary();
      } else if (t.dataset.occasion !== undefined) {
        state.occasion = state.occasion === t.dataset.occasion ? '' : t.dataset.occasion;
        $$('[data-occasion]', dlg).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.occasion === state.occasion)));
        renderSummary();
      } else if (t.classList.contains('switch')) {
        state.show = !state.show; t.setAttribute('aria-checked', String(state.show)); renderSummary();
      } else if (t.dataset.submit !== undefined) {
        dlg.classList.add('done');
        const doneText = $('[data-done-summary]', dlg);
        if (doneText) doneText.textContent = summary.firstChild ? summary.firstChild.textContent : '';
      } else if (t.dataset.close !== undefined) { dlg.close(); }
    });
    dlg.addEventListener('close', () => dlg.classList.remove('done'));

    function open(opts = {}) {
      Object.assign(state, opts);
      renderAll();
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    }
    $$('[data-open-reserve]').forEach((b) => b.addEventListener('click', (e) => {
      e.preventDefault();
      open(b.dataset.show ? { show: true } : {});
    }));

    // Hero quick-reserve bar
    const qr = $('[data-quick-reserve]');
    if (qr) {
      const partySel = $('select[name="party"]', qr), dateSel = $('select[name="date"]', qr), timeSel = $('select[name="time"]', qr);
      dateSel.innerHTML = Array.from({ length: 7 }, (_, i) => {
        const d = dateFor(i);
        const l = i === 0 ? 'Tonight' : i === 1 ? 'Tomorrow' : `${DAYS[(today + i) % 7].slice(0, 3)}, ${monthNames[d.getMonth()]} ${d.getDate()}`;
        return `<option value="${i}">${l}</option>`;
      }).join('');
      const fillTimes = () => {
        const cur = timeSel.value || '7:00 PM';
        timeSel.innerHTML = slotsFor(+dateSel.value).map((m) => `<option${label(m) === cur ? ' selected' : ''}>${label(m)}</option>`).join('');
        if (!timeSel.value) timeSel.value = '7:00 PM';
      };
      dateSel.addEventListener('change', fillTimes);
      fillTimes(); timeSel.value = '7:00 PM';
      qr.addEventListener('submit', (e) => {
        e.preventDefault();
        open({ party: +partySel.value, dayOffset: +dateSel.value, time: timeSel.value });
      });
    }
  }

  /* ------------------------------------------------------------------ Inquiry (prototype) */
  function inquiry() {
    const dlg = $('#inquire');
    if (!dlg) return;
    $$('[data-open-inquire]').forEach((b) => b.addEventListener('click', (e) => {
      e.preventDefault();
      const pick = b.dataset.pkg;
      if (pick) { const sel = $('select[name="pkg"]', dlg); if (sel) sel.value = pick; }
      dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', '');
    }));
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
      const t = e.target.closest('button');
      if (t && t.dataset.close !== undefined) dlg.close();
    });
    const form = $('form', dlg);
    form.addEventListener('submit', (e) => { e.preventDefault(); dlg.classList.add('done'); });
    dlg.addEventListener('close', () => dlg.classList.remove('done'));
  }

  /* ------------------------------------------------------------------ Newsletter */
  function newsletter() {
    $$('[data-newsletter]').forEach((f) => f.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = f.parentElement.querySelector('.nl-note');
      if (note) note.textContent = 'You’re on the River Letter. (Concept prototype: nothing was sent.)';
      f.reset();
    }));
  }

  /* ------------------------------------------------------------------ Pitch notes */
  function pitchNotes() {
    const btn = $('[data-notes-toggle]');
    const notes = $$('.pitch-note');
    notes.forEach((n, i) => {
      if (!$('.pn-n', n)) n.insertAdjacentHTML('afterbegin', `<span class="pn-n">${i + 1}</span>`);
    });
    const count = $('[data-notes-count]'); if (count) count.textContent = notes.length;
    const set = (on) => {
      document.body.classList.toggle('notes-on', on);
      if (btn) btn.setAttribute('aria-pressed', String(on));
    };
    const params = new URLSearchParams(location.search);
    set(params.get('notes') === '1');
    if (btn) btn.addEventListener('click', () => set(!document.body.classList.contains('notes-on')));
  }

  /* ------------------------------------------------------------------ Menu page scrollspy */
  function scrollspy() {
    const tabs = $$('.menu-tabs a');
    if (!tabs.length || !('IntersectionObserver' in window)) return;
    const map = new Map(tabs.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          tabs.forEach((a) => a.classList.remove('active'));
          const a = map.get(en.target.id);
          if (a) { a.classList.add('active'); a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ------------------------------------------------------------------ Boot */
  document.addEventListener('DOMContentLoaded', () => {
    if (window.SSK && window.SSK.hydrateGlasses) window.SSK.hydrateGlasses();
    if (window.SSK && window.SSK.plateSVG) {
      $$('[data-plate-static]').forEach((el) => { el.innerHTML = window.SSK.plateSVG(el.dataset.plateStatic, el.getAttribute('aria-label') || el.dataset.plateStatic); });
    }
    hydrateRoundels();
    const canvas = $('canvas.river');
    if (canvas) riverLights(canvas);
    renderStatus();
    setInterval(renderStatus, 60 * 1000);
    header();
    reveal();
    purpleRain();
    plates();
    reservations();
    inquiry();
    newsletter();
    pitchNotes();
    scrollspy();
  });
})();
