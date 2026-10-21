(function () {
  'use strict';

  /* Keep APP_VERSION in step with VERSION in sw.js */
  const APP_VERSION = '1.0.1';
  const CHANGELOG = [
    { v: '1.0.1', d: '21 Oct 2026', n: ['Icons now sit alongside the other files, with no separate folder'] },
    {
      v: '1.0.0', d: '21 Oct 2026', n: [
        'Number to title and title to number games, 10 rounds each',
        'Multiple choice, or the harder type-it-in version',
        'Test main chapters only, or include sub-chapters',
        '737 and 787 chapter lists',
        'Chapters overview with expandable sub-chapters, plus search',
        'Works offline and updates itself in the background'
      ]
    }
  ];
  const ROUNDS = 10;

  /* ---------- helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const vibrate = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* ignore */ } };
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const norm = (s) => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }

  /* ---------- icons ---------- */
  const svg = (inner) => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + inner + '</svg>';
  const I = {
    bolt: svg('<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>'),
    list: svg('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
    search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    x: svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
    chev: svg('<path d="m9 6 6 6-6 6"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5" style="stroke-width:2.4"/>'),
    xs: svg('<path d="M7 7l10 10M17 7 7 17" style="stroke-width:2.4"/>'),
    hash: svg('<path d="M9.5 4 7.5 20M16.5 4l-2 16M4.5 9h16M3.5 15h16"/>'),
    lines: svg('<path d="M4 7h16M4 12h16M4 17h9"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>'),
    moon: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>'),
    clear: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor;stroke:none"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6" style="stroke:var(--card);stroke-width:1.8;stroke-linecap:round;fill:none"/></svg>'
  };
  $$('[data-icon]').forEach((el) => { el.innerHTML = I[el.dataset.icon] || ''; });

  /* Logo (same linear aircraft as the app icon) */
  (function () {
    const half = [[50, 6], [55, 13], [55, 36], [94, 60], [94, 67], [55, 56], [55, 76], [72, 87], [72, 93], [54, 88], [50, 90]];
    const full = half.concat(half.slice(1, -1).reverse().map((p) => [100 - p[0], p[1]]));
    const d = 'M' + full.map((p) => p.join(' ')).join('L') + 'Z';
    const html = '<svg viewBox="0 0 100 100"><g transform="translate(50 50) rotate(45) scale(.66) translate(-50 -50)"><path d="' + d + '" fill="rgba(255,255,255,.18)" stroke="#fff" stroke-width="3.6" stroke-linejoin="round"/></g></svg>';
    $$('[data-logo]').forEach((el) => { el.innerHTML = html; });
  })();

  /* ---------- settings + theme ---------- */
  const SKEY = 'ata.settings.v1', BKEY = 'ata.best.v1';
  const S = Object.assign({ aircraft: '737', scope: 'main', style: 'choice', theme: null }, store.get(SKEY, {}));
  const best = store.get(BKEY, {});
  const persist = () => store.set(SKEY, S);
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = () => S.theme || (mq.matches ? 'dark' : 'light');

  function syncSegs(key) {
    $$('.seg[data-seg="' + key + '"]').forEach((seg) => {
      const btns = $$('button', seg);
      const val = key === 'theme' ? theme() : S[key];
      const idx = Math.max(0, btns.findIndex((b) => b.dataset.v === val));
      seg.style.setProperty('--n', btns.length);
      seg.style.setProperty('--i', idx);
      btns.forEach((b, i) => { b.classList.toggle('on', i === idx); b.setAttribute('aria-pressed', i === idx); });
    });
  }
  function applyTheme() {
    const t = theme();
    document.documentElement.dataset.theme = t;
    document.documentElement.style.colorScheme = t;
    const m = $('meta[name="theme-color"]'); if (m) m.content = t === 'dark' ? '#000000' : '#f2f2f7';
    syncSegs('theme');
  }
  if (mq.addEventListener) mq.addEventListener('change', () => { if (!S.theme) applyTheme(); });

  /* ---------- data ---------- */
  const chapters = () => window.getChapters(S.aircraft);
  function pool() {
    const out = [];
    chapters().forEach((c) => {
      out.push({ num: c.num, title: c.title, sub: false, parent: null });
      if (S.scope === 'sub') c.subs.forEach((s) => { if (!/-00$/.test(s.num)) out.push({ num: s.num, title: s.title, sub: true, parent: c.title }); });
    });
    return out;
  }

  /* ---------- tabs + scroll chrome ---------- */
  const TABS = ['train', 'chapters', 'search'];
  let tab = 'train';
  function setTab(t) {
    if (t === tab) { const v = $('#v-' + t); if (v) v.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    tab = t;
    $$('.view').forEach((v) => v.classList.toggle('active', v.id === 'v-' + t));
    $$('.tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
    $('#tabbar').style.setProperty('--i', TABS.indexOf(t));
  }
  $$('.view').forEach((v) => {
    v.addEventListener('scroll', () => {
      const y = v.scrollTop;
      v.classList.toggle('scrolled', y > 4);
      v.classList.toggle('titled', y > 40);
    }, { passive: true });
  });

  /* ---------- footer version + hold for changelog ---------- */
  $$('.foot').forEach((f) => { f.innerHTML = '<button type="button" class="ver" data-ver aria-label="App version ' + APP_VERSION + '. Hold for what\'s new">v' + APP_VERSION + '</button>'; });
  let holdT = 0, holdEl = null, hx = 0, hy = 0;
  const cancelHold = () => { clearTimeout(holdT); if (holdEl) holdEl.classList.remove('holding'); holdEl = null; };
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-ver]'); if (!b) return;
    holdEl = b; hx = e.clientX; hy = e.clientY; b.classList.add('holding');
    holdT = setTimeout(() => { cancelHold(); vibrate(14); openChangelog(); }, 450);
  });
  document.addEventListener('pointermove', (e) => { if (holdEl && Math.hypot(e.clientX - hx, e.clientY - hy) > 10) cancelHold(); });
  ['pointerup', 'pointercancel'].forEach((ev) => document.addEventListener(ev, cancelHold));
  document.addEventListener('contextmenu', (e) => { if (e.target.closest('[data-ver]')) e.preventDefault(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-ver]')) openChangelog(); });

  /* ---------- layers (sheet / action sheet) ---------- */
  function openLayer(el) { el.hidden = false; void el.offsetWidth; requestAnimationFrame(() => el.classList.add('show')); }
  function closeLayer(el) { el.classList.remove('show'); setTimeout(() => { if (!el.classList.contains('show')) el.hidden = true; }, 480); }

  function buildSheet() {
    const cur = CHANGELOG[0];
    $('#sheet .panel').innerHTML =
      '<div class="drag"><div class="grab"></div></div>' +
      '<div class="sh-head"><h2>What\'s new</h2><button type="button" class="sh-done" data-close>Done</button></div>' +
      '<p class="sh-ver">Version ' + APP_VERSION + ' &middot; Released ' + esc(cur.d) + '</p>' +
      '<div class="sh-label">Appearance</div>' +
      '<div class="seg" data-seg="theme"><span class="thumb"></span>' +
      '<button type="button" data-v="light">' + I.sun + 'Light</button>' +
      '<button type="button" data-v="dark">' + I.moon + 'Dark</button></div>' +
      '<div class="log">' + CHANGELOG.map((c) => '<h3>' + esc(c.v) + ' <span style="color:var(--label2);font-weight:400">&middot; ' + esc(c.d) + '</span></h3><ul>' + c.n.map((n) => '<li>' + esc(n) + '</li>').join('') + '</ul>').join('') + '</div>';
    syncSegs('theme');
    enableDrag($('#sheet'));
  }
  function openChangelog() { openLayer($('#sheet')); }
  function enableDrag(layer) {
    const panel = $('.panel', layer), handle = $('.drag', panel);
    let sy = 0, dy = 0, drag = false;
    handle.addEventListener('pointerdown', (e) => { drag = true; sy = e.clientY; dy = 0; panel.style.transition = 'none'; handle.setPointerCapture(e.pointerId); });
    handle.addEventListener('pointermove', (e) => { if (!drag) return; dy = Math.max(0, e.clientY - sy); panel.style.transform = 'translateY(' + dy + 'px)'; });
    const end = () => { if (!drag) return; drag = false; panel.style.transition = ''; panel.style.transform = ''; if (dy > 90) closeLayer(layer); };
    handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
  }

  /* ---------- Train ---------- */
  function renderTrain() {
    ['n2t', 't2n'].forEach((g) => {
      const b = best[[S.aircraft, g, S.scope, S.style].join('|')];
      const el = $('[data-best="' + g + '"]');
      el.hidden = b === undefined;
      if (b !== undefined) el.textContent = 'Best ' + b + '/' + ROUNDS;
    });
  }

  /* ---------- Chapters ---------- */
  const openSet = new Set();
  function renderChapters() {
    const chs = chapters();
    const subs = chs.reduce((a, c) => a + c.subs.length, 0);
    $('#ch-count').textContent = chs.length + ' chapters \u00b7 ' + subs + ' sub-chapters';
    $('#ch-list').innerHTML = chs.map((c) =>
      '<div class="ch' + (openSet.has(c.num) ? ' open' : '') + '" data-ch="' + c.num + '">' +
      '<button type="button" class="ch-head" data-toggle="' + c.num + '" aria-expanded="' + openSet.has(c.num) + '"><span class="n">' + c.num + '</span><span class="t">' + esc(c.title) + '</span><span class="cnt">' + c.subs.length + '</span><span class="chev">' + I.chev + '</span></button>' +
      '<div class="ch-subs"><div class="in">' + c.subs.map((s) => '<div class="sub" data-sub="' + s.num + '"><span class="n">' + s.num + '</span><span class="t">' + esc(s.title) + '</span></div>').join('') + '</div></div></div>'
    ).join('');
    updateExpandBtn();
  }
  function updateExpandBtn() {
    const all = chapters().every((c) => openSet.has(c.num));
    $('#expand-btn').textContent = all ? 'Collapse all' : 'Expand all';
  }
  function toggleChapter(num) {
    const el = $('.ch[data-ch="' + num + '"]'); if (!el) return;
    const open = !el.classList.contains('open');
    el.classList.toggle('open', open);
    $('.ch-head', el).setAttribute('aria-expanded', open);
    if (open) openSet.add(num); else openSet.delete(num);
    updateExpandBtn();
  }
  function toggleAll() {
    const chs = chapters();
    const all = chs.every((c) => openSet.has(c.num));
    chs.forEach((c) => { if (all) openSet.delete(c.num); else openSet.add(c.num); });
    $$('.ch').forEach((el) => { const o = openSet.has(el.dataset.ch); el.classList.toggle('open', o); $('.ch-head', el).setAttribute('aria-expanded', o); });
    updateExpandBtn();
  }
  function goTo(num) {
    const main = num.slice(0, 2);
    openSet.add(main);
    setTab('chapters');
    const el = $('.ch[data-ch="' + main + '"]'); if (!el) return;
    el.classList.add('open'); $('.ch-head', el).setAttribute('aria-expanded', 'true'); updateExpandBtn();
    const target = num.indexOf('-') > -1 ? $('[data-sub="' + num + '"]', el) : $('.ch-head', el);
    const view = $('#v-chapters');
    setTimeout(() => {
      const vr = view.getBoundingClientRect(), tr = target.getBoundingClientRect();
      view.scrollTo({ top: view.scrollTop + tr.top - vr.top - 130, behavior: 'smooth' });
      target.classList.remove('flash'); void target.offsetWidth; target.classList.add('flash');
    }, 80);
  }

  /* ---------- Search ---------- */
  function hl(text, q) {
    const safe = esc(text);
    if (!q) return safe;
    const toks = q.split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!toks.length) return safe;
    return safe.replace(new RegExp('(' + toks.join('|') + ')', 'ig'), '<mark>$1</mark>');
  }
  function renderSearch() {
    const raw = $('#s-input').value.trim();
    $('#sbar').classList.toggle('has', raw.length > 0);
    const box = $('#s-results');
    if (!raw) {
      box.innerHTML = '<div class="empty"><div class="e-ico">' + I.search + '</div><strong>Search ' + S.aircraft + ' chapters</strong>Try a number like 32-40, or a word like hydraulic.</div>';
      return;
    }
    const q = raw.toLowerCase();
    const numeric = /^[\d\s-]+$/.test(q);
    let test;
    if (numeric) {
      const d = q.replace(/\D/g, '');
      const prefix = d.length > 2 ? d.slice(0, 2) + '-' + d.slice(2) : d;
      test = (num) => num.indexOf(prefix) === 0;
    } else {
      const toks = q.split(/\s+/).filter(Boolean);
      test = (num, title) => toks.every((t) => title.toLowerCase().indexOf(t) > -1);
    }
    const mains = [], subs = [];
    chapters().forEach((c) => {
      if (test(c.num, c.title)) mains.push({ num: c.num, title: c.title });
      c.subs.forEach((s) => { if (test(s.num, s.title)) subs.push({ num: s.num, title: s.title, parent: c.title }); });
    });
    if (!mains.length && !subs.length) {
      box.innerHTML = '<div class="empty"><div class="e-ico">' + I.search + '</div><strong>No results</strong>Nothing in the ' + S.aircraft + ' list matches \u201c' + esc(raw) + '\u201d.</div>';
      return;
    }
    const hq = numeric ? q.replace(/\s+/g, '') : q;
    const row = (r, isSub) =>
      '<button type="button" class="res" data-go="' + r.num + '"><span class="n" style="' + (isSub ? 'font-weight:600;color:var(--label2);font-size:15px' : '') + '">' + (numeric ? hl(r.num, hq) : r.num) + '</span><span class="rt"><span class="t">' + (numeric ? esc(r.title) : hl(r.title, q)) + '</span>' + (isSub ? '<span class="p">' + esc(r.parent) + '</span>' : '') + '</span><span class="chev">' + I.chev + '</span></button>';
    box.innerHTML =
      (mains.length ? '<div class="group-t">Chapters</div><div class="card list">' + mains.map((r) => row(r, false)).join('') + '</div>' : '') +
      (subs.length ? '<div class="group-t">Sub-chapters</div><div class="card list">' + subs.map((r) => row(r, true)).join('') + '</div>' : '');
  }

  /* ---------- Quiz ---------- */
  const Q = { on: false, done: false, game: '', cfg: null, qs: [], i: 0, score: 0, log: [], locked: false, advancing: false, typed: false, state: 'answering', timer: 0, swapT: 0 };
  const quiz = $('#quiz'), stage = $('#q-stage'), bottom = $('#q-bottom');

  function buildQuestions(game) {
    const P = pool();
    return shuffle(P).slice(0, Math.min(ROUNDS, P.length)).map((it) => {
      const same = P.filter((x) => x.sub === it.sub && x !== it);
      let opts;
      if (game === 'n2t') {
        const seen = new Set([it.title]), d = [];
        for (const x of shuffle(same)) { if (!seen.has(x.title)) { seen.add(x.title); d.push(x.title); } if (d.length === 3) break; }
        opts = shuffle([it.title].concat(d));
      } else {
        opts = shuffle([it.num].concat(shuffle(same).slice(0, 3).map((x) => x.num)));
      }
      return { it, opts };
    });
  }
  const answerOf = (it) => (Q.game === 'n2t' ? it.title : it.num);

  function startQuiz(game) {
    Object.assign(Q, { on: true, done: false, game, cfg: { aircraft: S.aircraft, scope: S.scope, style: S.style }, qs: buildQuestions(game), i: 0, score: 0, log: [], locked: false, advancing: false, typed: S.style === 'type', state: 'answering' });
    clearTimeout(Q.timer);
    $('#q-chip').textContent = S.aircraft;
    $('#q-dots').innerHTML = Q.qs.map(() => '<i></i>').join('');
    $('#q-result').classList.remove('show');
    $('#q-play').classList.remove('gone');
    bottom.innerHTML = Q.typed ? formHTML() : '';
    quiz.classList.add('open'); quiz.setAttribute('aria-hidden', 'false');
    showQuestion(true);
    if (Q.typed) { const inp = $('#q-input'); if (inp) inp.focus({ preventScroll: true }); }
  }

  function stageHTML(it) {
    if (Q.game === 'n2t') return '<div class="q-label">' + (it.sub ? 'ATA sub-chapter' : 'ATA chapter') + '</div><div class="q-big">' + esc(it.num) + '</div>';
    return '<div class="q-label">' + (it.sub ? 'ATA sub-chapter title' : 'ATA chapter title') + '</div><div class="q-title">' + esc(it.title) + '</div>' + (it.sub ? '<div class="q-ctx">in ' + esc(it.parent) + '</div>' : '');
  }
  function optionsHTML(q) {
    const num = Q.game === 't2n';
    return '<div class="opts' + (num ? ' grid' : '') + '">' + q.opts.map((o, i) => '<button type="button" class="opt' + (num ? ' num' : '') + '" data-opt="' + i + '">' + esc(o) + '</button>').join('') + '</div>' +
      '<div class="q-next" id="q-next"><button type="button" class="btn primary" data-act="next">Next</button></div>';
  }
  function formHTML() {
    const n2t = Q.game === 'n2t';
    const numeric = !n2t && Q.cfg.scope === 'main';
    const ph = n2t ? 'Type the title' : (Q.cfg.scope === 'sub' ? 'Number, like 21-30' : 'Chapter number');
    return '<form class="q-form" id="q-form" autocomplete="off" novalidate>' +
      '<input id="q-input" class="q-input" type="text"' + (numeric ? ' inputmode="numeric"' : '') + ' enterkeyhint="done" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" placeholder="' + ph + '" aria-label="Your answer">' +
      '<div class="q-msg" id="q-msg" aria-live="polite"></div>' +
      '<div class="q-row"><button type="button" class="btn sec" data-act="idk">I don\u2019t know</button><button type="submit" class="btn primary" id="q-go">Check</button></div></form>';
  }
  function resetForm() {
    const inp = $('#q-input'); if (!inp) return;
    inp.value = ''; inp.className = 'q-input';
    const m = $('#q-msg'); m.className = 'q-msg'; m.innerHTML = '';
    $('#q-form').classList.remove('review');
    $('#q-go').textContent = 'Check';
  }

  function swap(fn, first) {
    const els = [stage]; if (!Q.typed) els.push(bottom);
    const run = () => {
      fn();
      els.forEach((e) => { e.classList.remove('out'); e.classList.add('in'); });
      setTimeout(() => els.forEach((e) => e.classList.remove('in')), 560);
    };
    clearTimeout(Q.swapT);
    if (first) { run(); return; }
    els.forEach((e) => { e.classList.remove('in'); e.classList.add('out'); });
    Q.swapT = setTimeout(run, 190);
  }

  function showQuestion(first) {
    const q = Q.qs[Q.i];
    $('#q-count').textContent = (Q.i + 1) + ' of ' + Q.qs.length;
    $$('#q-dots i').forEach((d, i) => { if (i === Q.i) d.classList.add('cur'); });
    swap(() => {
      Q.locked = false; Q.advancing = false; Q.state = 'answering';
      stage.innerHTML = stageHTML(q.it);
      if (Q.typed) resetForm(); else bottom.innerHTML = optionsHTML(q);
    }, first);
  }

  function finish(ok, given, auto) {
    const q = Q.qs[Q.i];
    Q.log.push({ it: q.it, ok, given });
    if (ok) Q.score++;
    const dot = $$('#q-dots i')[Q.i]; dot.classList.remove('cur'); dot.classList.add(ok ? 'ok' : 'no');
    if (!ok) vibrate(30);
    if (ok && auto) Q.timer = setTimeout(next, Q.typed ? 900 : 800);
    else showNext();
  }
  function showNext() {
    const last = Q.i === Q.qs.length - 1;
    if (Q.typed) { $('#q-form').classList.add('review'); $('#q-go').textContent = last ? 'See results' : 'Next'; }
    else { const n = $('#q-next'); if (n) { $('.btn', n).textContent = last ? 'See results' : 'Next'; n.classList.add('show'); } }
  }
  function next() {
    clearTimeout(Q.timer);
    if (!Q.on || Q.advancing) return;
    Q.advancing = true;
    if (Q.i >= Q.qs.length - 1) { showResult(); return; }
    Q.i++;
    showQuestion(false);
  }

  function handleChoice(i) {
    if (Q.locked || !Q.on) return;
    Q.locked = true;
    const q = Q.qs[Q.i], right = answerOf(q.it), val = q.opts[i], ok = val === right;
    $$('.opt', bottom).forEach((b, j) => {
      const isRight = q.opts[j] === right;
      b.classList.add(isRight ? 'ok' : (j === i ? 'no' : 'dim'));
      if (isRight || j === i) b.insertAdjacentHTML('beforeend', '<span class="mark">' + (isRight ? I.check : I.xs) + '</span>');
    });
    finish(ok, val, true);
  }

  function checkTyped(it, val) {
    if (Q.game === 'n2t') {
      const a = norm(val), c = norm(it.title);
      if (a === c) return 'exact';
      const tol = c.length >= 24 ? 2 : c.length >= 8 ? 1 : 0;
      return lev(a, c) <= tol ? 'close' : 'wrong';
    }
    const d = val.replace(/\D/g, ''), n = it.num.replace(/\D/g, '');
    return d && (d === n || (!it.sub && d === n + '00')) ? 'exact' : 'wrong';
  }
  function submitTyped() {
    const inp = $('#q-input'), val = inp.value.trim();
    if (!val) { inp.classList.remove('no'); void inp.offsetWidth; inp.classList.add('no'); setTimeout(() => inp.classList.remove('no'), 450); return; }
    const it = Q.qs[Q.i].it, res = checkTyped(it, val), msg = $('#q-msg');
    Q.state = 'review';
    if (res === 'exact') { inp.classList.add('ok'); msg.className = 'q-msg ok'; msg.textContent = 'Correct'; finish(true, val, true); $('#q-form').classList.add('review'); }
    else if (res === 'close') { inp.classList.add('ok'); msg.className = 'q-msg ok'; msg.innerHTML = 'Correct \u2014 it\u2019s <b>' + esc(answerOf(it)) + '</b>'; finish(true, val, false); }
    else { inp.classList.add('no'); msg.className = 'q-msg no'; msg.innerHTML = 'Answer: <b>' + esc(answerOf(it)) + '</b>'; finish(false, val, false); }
  }
  function giveUp() {
    if (Q.state !== 'answering' || Q.advancing) return;
    Q.state = 'review';
    $('#q-input').classList.add('no');
    const m = $('#q-msg'); m.className = 'q-msg no'; m.innerHTML = 'Answer: <b>' + esc(answerOf(Q.qs[Q.i].it)) + '</b>';
    finish(false, '', false);
  }
  document.addEventListener('submit', (e) => {
    if (e.target.id !== 'q-form') return;
    e.preventDefault();
    if (Q.advancing) return;
    if (Q.state === 'review') { next(); focusInput(); } else submitTyped();
  });
  function focusInput() { const inp = $('#q-input'); if (Q.typed && inp) inp.focus({ preventScroll: true }); }

  function showResult() {
    Q.done = true;
    const total = Q.qs.length, score = Q.score;
    const key = [Q.cfg.aircraft, Q.game, Q.cfg.scope, Q.cfg.style].join('|');
    const prev = best[key];
    const improved = prev !== undefined && score > prev;
    if (prev === undefined || score > prev) { best[key] = score; store.set(BKEY, best); }
    const ratio = score / total;
    const color = ratio >= .8 ? 'var(--green)' : ratio >= .5 ? 'var(--accent)' : 'var(--orange)';
    const head = score === total ? 'Perfect round' : ratio >= .8 ? 'Excellent' : ratio >= .6 ? 'Good work' : ratio >= .4 ? 'Getting there' : 'Keep going';
    const gameName = Q.game === 'n2t' ? 'Number to title' : 'Title to number';
    const bits = [Q.cfg.aircraft, gameName, Q.cfg.scope === 'sub' ? 'with sub-chapters' : 'main chapters', Q.cfg.style === 'type' ? 'typed' : 'multiple choice'];
    const missed = Q.log.filter((l) => !l.ok);
    const C = 2 * Math.PI * 84;
    const review = missed.length ?
      '<h2 class="section" style="font-size:20px;margin-top:28px">To review</h2><div class="card list rv-list">' + missed.map((l) => {
        const q = Q.game === 'n2t' ? esc(l.it.num) : esc(l.it.title) + (l.it.sub ? ' <span style="opacity:.8">in ' + esc(l.it.parent) + '</span>' : '');
        const a = Q.game === 'n2t' ? esc(l.it.title) : esc(l.it.num);
        return '<div class="rv"><div class="rv-q">' + q + '</div><div class="rv-a">' + a + '</div>' + (l.given ? '<div class="rv-g">You said ' + esc(l.given) + '</div>' : '<div class="rv-g">Skipped</div>') + '</div>';
      }).join('') + '</div>' : '';
    $('#q-result').innerHTML =
      '<div class="r-scroll">' +
      '<div class="ring"><svg viewBox="0 0 200 200"><circle class="track" cx="100" cy="100" r="84"/><circle class="val" id="r-val" cx="100" cy="100" r="84" stroke="' + color + '" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/></svg><div class="ring-t"><b id="r-num">0</b><span>/' + total + '</span></div></div>' +
      '<div class="r-head">' + head + '</div><div class="r-sub">' + esc(bits.join(' \u00b7 ')) + '</div>' +
      '<div class="r-best' + (improved ? ' new' : '') + '">' + (improved ? 'New best' : 'Best ' + best[key] + '/' + total) + '</div>' + review + '</div>' +
      '<div class="r-actions"><button type="button" class="btn primary" data-act="again">Play again</button><button type="button" class="btn sec" data-act="done">Done</button></div>';
    $('#q-count').textContent = 'Results';
    swap(() => { $('#q-play').classList.add('gone'); $('#q-result').classList.add('show'); }, true);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const v = $('#r-val'); if (v) v.style.strokeDashoffset = C * (1 - ratio);
      const n = $('#r-num'), t0 = performance.now(), dur = 900;
      const tick = (t) => { const p = Math.min(1, (t - t0) / dur); n.textContent = Math.round(score * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }));
    renderTrain();
  }

  function closeQuiz() {
    clearTimeout(Q.timer); clearTimeout(Q.swapT);
    Q.on = false;
    const a = document.activeElement; if (a && a.blur) a.blur();
    quiz.classList.remove('open'); quiz.setAttribute('aria-hidden', 'true');
    quiz.style.height = ''; quiz.style.top = '';
    renderTrain();
    setTimeout(() => { if (!Q.on) { stage.innerHTML = ''; bottom.innerHTML = ''; } maybeReload(); }, 620);
  }
  function requestClose() {
    if (Q.on && !Q.done && Q.log.length < Q.qs.length) openLayer($('#confirm'));
    else closeQuiz();
  }

  /* keep the quiz above the on-screen keyboard */
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const sync = () => {
      if (!Q.on) return;
      if (Math.abs(vv.height - window.innerHeight) > 60) { quiz.style.height = vv.height + 'px'; quiz.style.top = vv.offsetTop + 'px'; }
      else { quiz.style.height = ''; quiz.style.top = ''; }
    };
    vv.addEventListener('resize', sync); vv.addEventListener('scroll', sync);
  }

  /* ---------- events ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target; let el;
    if ((el = t.closest('.seg button'))) {
      const seg = el.closest('.seg'), key = seg.dataset.seg, v = el.dataset.v;
      if (key === 'theme') {
        if (theme() === v) return;
        document.documentElement.classList.add('theme-anim');
        S.theme = v; applyTheme(); persist();
        setTimeout(() => document.documentElement.classList.remove('theme-anim'), 450);
        return;
      }
      if (S[key] === v) return;
      S[key] = v; persist(); syncSegs(key);
      if (key === 'aircraft') { renderChapters(); renderSearch(); }
      renderTrain();
    }
    else if ((el = t.closest('[data-game]'))) startQuiz(el.dataset.game);
    else if ((el = t.closest('[data-toggle]'))) toggleChapter(el.dataset.toggle);
    else if ((el = t.closest('[data-go]'))) goTo(el.dataset.go);
    else if ((el = t.closest('.tabbar button'))) setTab(el.dataset.tab);
    else if ((el = t.closest('[data-opt]'))) handleChoice(+el.dataset.opt);
    else if ((el = t.closest('[data-act]'))) {
      const a = el.dataset.act;
      if (a === 'next') next();
      else if (a === 'idk') { giveUp(); focusInput(); }
      else if (a === 'expand') toggleAll();
      else if (a === 'again') startQuiz(Q.game);
      else if (a === 'done') closeQuiz();
      else if (a === 'end-round') { closeLayer($('#confirm')); closeQuiz(); }
    }
    else if ((el = t.closest('[data-close]'))) { const layer = el.closest('.layer'); if (layer) closeLayer(layer); }
    else if (t.closest('#q-close')) requestClose();
    else if (t.closest('#s-clear')) { const i = $('#s-input'); i.value = ''; renderSearch(); i.focus(); }
  });
  $('#s-input').addEventListener('input', renderSearch);
  $('#s-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });

  /* ---------- boot ---------- */
  applyTheme();
  ['aircraft', 'scope', 'style'].forEach(syncSegs);
  buildSheet();
  renderTrain(); renderChapters(); renderSearch();
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('boot')));
  window.addEventListener('load', () => setTimeout(() => { const s = $('#splash'); s.classList.add('hide'); setTimeout(() => s.remove(), 600); }, 650));

  /* ---------- service worker + auto update ---------- */
  let pendingReload = false;
  function maybeReload() { if (pendingReload && !Q.on) location.reload(); }
  if ('serviceWorker' in navigator) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.update();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update(); });
    }).catch(() => { /* ignore */ });
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return;
      reloaded = true; pendingReload = true; maybeReload();
    });
  }
})();
