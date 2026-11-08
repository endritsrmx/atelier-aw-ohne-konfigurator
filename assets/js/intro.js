/* Atelier AW – Intro
 *
 * Ablauf (volle Version, ca. 7,9 s): Gehäuseboden erscheint → Gravur «Für Anna» und Datum → kurze Pause →
 * Uhr dreht sich zum Zifferblatt, Zeiger laufen auf 10:10, «Jede Uhr ein Unikat.» → Logo fliegt in den Header,
 * das Intro blendet weich in die Startseite über.
 *
 * Wann welche Version läuft, entscheidet ein kleines Skript im <head> von index.html:
 *   full  = erster Besuch in dieser Browser-Sitzung (sessionStorage «aw-intro-seen»)
 *   short = Systemeinstellung «Bewegung reduzieren»: nur kurze Einblendung (SHORT)
 *   none  = Intro wurde in dieser Sitzung schon gezeigt
 *
 * ZEITEN ANPASSEN: alle Angaben in Sekunden ab Start in der Tabelle T unten.
 * Jede Phase ist [Beginn, Ende]; Lücken zwischen den Phasen sind die ruhigen «Stehmomente».
 * Die Gesamtdauer ergibt sich aus T.out[1].
 */
(function () {
  'use strict';

  var T = {
    stageIn:  [0.00, 0.70], // Bühne blendet ein (Opacity + leichte Skalierung)
    rim:      [0.10, 1.40], // feiner Rand zeichnet sich um den Gehäuseboden
    disc:     [0.25, 1.30], // Gehäuseboden blendet ein
    screws:   [0.70, 1.40], // Schrauben erscheinen nacheinander
    line1:    [1.60, 3.00], // Gravur Zeile 1 («Für Anna») – danach kurze Pause
    line2:    [3.20, 4.35], // Gravur Zeile 2 (Datum)   – danach Pause bis zur Drehung
    flip:     [4.80, 5.95], // Drehung zum Zifferblatt
    hands:    [5.40, 6.45], // Zeiger laufen auf 10:10
    tagline:  [6.00, 6.60], // «Jede Uhr ein Unikat.»
    progress: [0.20, 6.50], // Fortschrittslinie unten
    out:      [6.80, 7.90]  // Übergang: Logo fliegt in den Header, Intro blendet aus (Crossfade)
  };
  var SHORT = { logoIn: [0.00, 0.30], fadeOut: [0.45, 0.95] }; // kurze Einblendung bei «Bewegung reduzieren»
  var LINE1 = 'Für Anna', LINE2 = '14 · 06 · 2026', TAGLINE = 'Jede Uhr ein Unikat.';
  var LABELS = [[0, 'Gehäuse wird vorbereitet'], [1.55, 'Gravur läuft'], [4.70, 'Endkontrolle'], [6.50, 'Unikat fertig']];

  var d = document, root = d.documentElement, ov = d.getElementById('aw-intro');
  var mode = root.getAttribute('data-intro');
  if (!ov) return;
  if (mode !== 'full' && mode !== 'short') { ov.parentNode.removeChild(ov); return; }
  try { sessionStorage.setItem('aw-intro-seen', '1'); } catch (e) {}

  var NS = 'http://www.w3.org/2000/svg';
  var C = { ink: '#101820', navy: '#14283f', ivory: '#f3f0e8', ice: '#c5d4e4', dim: 'rgba(197,212,228,0.22)' };
  var LOGO = 'assets/logo/atelier-w-logo-white.svg';
  var bg = ov.querySelector('.intro-bg');

  function el(tag, css, parent) { var e = d.createElement(tag); if (css) e.style.cssText = css; if (parent) parent.appendChild(e); return e; }
  function sv(tag, attrs, parent) { var e = d.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function clamp(x) { return Math.max(0, Math.min(1, x)); }
  function seg(t, r) { return clamp((t - r[0]) / (r[1] - r[0])); }
  function eo(x) { return 1 - Math.pow(1 - x, 3); }                                       // ease-out
  function eio(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }   // ease-in-out
  function lerp(a, b, k) { return a + (b - a) * k; }

  var done = false;
  function unlock() { root.setAttribute('data-intro', 'done'); }
  function finish() {
    if (done) return; done = true;
    d.removeEventListener('keydown', onKey);
    unlock();
    if (ov.parentNode) ov.parentNode.removeChild(ov);
    if (flyer && flyer.parentNode) flyer.parentNode.removeChild(flyer);
    window.dispatchEvent(new Event('aw-intro-done'));
  }
  function onKey(e) {
    if (done) return;
    if (e.key === 'Escape') skipNow();
    else if (e.key === 'Tab' && skip) { e.preventDefault(); skip.focus(); }
  }
  d.addEventListener('keydown', onKey);
  var flyer = null, skip = null;

  /* ───────────── kurze Einblendung (prefers-reduced-motion) ───────────── */
  if (mode === 'short') {
    var mark = el('img', 'position:relative;width:min(30vmin,180px);height:auto;opacity:0', ov);
    mark.src = LOGO; mark.alt = ''; mark.setAttribute('aria-hidden', 'true');
    var s0 = null;
    var tick = function (now) {
      if (s0 === null) s0 = now;
      var t = (now - s0) / 1000;
      mark.style.opacity = seg(t, SHORT.logoIn) * (1 - seg(t, SHORT.fadeOut));
      ov.style.opacity = 1 - seg(t, SHORT.fadeOut);
      if (t >= SHORT.fadeOut[1]) return finish();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return;
  }

  /* ───────────── volle Version ───────────── */
  var canBlur = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches; // Unschärfe nur am Desktop

  var stage = el('div', 'position:relative;width:min(54vmin,420px);aspect-ratio:1/1;margin-bottom:8vh;perspective:1600px;opacity:0;will-change:transform,opacity', ov);
  stage.setAttribute('aria-hidden', 'true');
  var spin = el('div', 'position:absolute;inset:0;transform-style:preserve-3d;will-change:transform', stage);
  function face(rot) { return el('div', 'position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(' + rot + 'deg)', spin); }

  // Gehäuseboden
  var back = face(0);
  var bs = sv('svg', { viewBox: '0 0 400 400', width: '100%', height: '100%', style: 'display:block;overflow:visible' }, back);
  var defs = sv('defs', {}, bs);
  var steel = sv('radialGradient', { id: 'awSteel', cx: '38%', cy: '32%', r: '80%' }, defs);
  [['0', '#f4f6f8'], ['0.55', '#c3ccd5'], ['1', '#7d8a97']].forEach(function (s) { sv('stop', { offset: s[0], 'stop-color': s[1] }, steel); });
  var clip1 = sv('clipPath', { id: 'awC1' }, defs), r1 = sv('rect', { x: 0, y: 0, width: 0, height: 400 }, clip1);
  var clip2 = sv('clipPath', { id: 'awC2' }, defs), r2 = sv('rect', { x: 0, y: 0, width: 0, height: 400 }, clip2);
  var disc = sv('g', { opacity: 0 }, bs);
  sv('circle', { cx: 200, cy: 200, r: 182, fill: 'url(#awSteel)' }, disc);
  for (var r = 18; r < 150; r += 3.2) sv('circle', { cx: 200, cy: 200, r: r, fill: 'none', stroke: r % 2 < 1 ? '#ffffff' : '#5d6a77', 'stroke-width': 0.35, opacity: 0.32 }, disc);
  sv('circle', { cx: 200, cy: 200, r: 150, fill: 'none', stroke: '#6f7c89', 'stroke-width': 1.2 }, disc);
  sv('circle', { cx: 200, cy: 200, r: 151.5, fill: 'none', stroke: '#ffffff', 'stroke-width': 0.8, opacity: 0.7 }, disc);
  var screws = [];
  for (var i = 0; i < 6; i++) {
    var a = (i * 60 + 30) * Math.PI / 180, x = 200 + Math.sin(a) * 166, y = 200 - Math.cos(a) * 166;
    var g = sv('g', { opacity: 0 }, bs);
    sv('circle', { cx: x, cy: y, r: 6, fill: '#aab5c0', stroke: '#5d6a77', 'stroke-width': 0.8 }, g);
    sv('line', { x1: x - 4, y1: y, x2: x + 4, y2: y, stroke: '#4e5965', 'stroke-width': 1.3, transform: 'rotate(' + (i * 37) + ' ' + x + ' ' + y + ')' }, g);
    screws.push(g);
  }
  var rim = sv('circle', { cx: 200, cy: 200, r: 183, fill: 'none', stroke: C.ice, 'stroke-width': 1, transform: 'rotate(-90 200 200)' }, bs);
  var RL = 2 * Math.PI * 183; rim.style.strokeDasharray = RL; rim.style.strokeDashoffset = RL;
  function engr(txt, yy, size, clip, italic) {
    var gg = sv('g', { 'clip-path': 'url(#' + clip + ')' }, bs);
    var base = { x: 200, y: yy, 'text-anchor': 'middle', 'font-family': '"Cormorant Garamond",Georgia,serif', 'font-size': size, 'font-weight': 500, 'letter-spacing': 1.5 };
    if (italic) base['font-style'] = 'italic';
    var hi = sv('text', Object.assign({}, base, { y: yy + 1, fill: '#ffffff', opacity: 0.75 }), gg); hi.textContent = txt;
    var main = sv('text', Object.assign({}, base, { fill: '#3b4652' }), gg); main.textContent = txt;
    return main;
  }
  var t1 = engr(LINE1, 196, 46, 'awC1', true), t2 = engr(LINE2, 244, 24, 'awC2', false);
  var tip = sv('g', { opacity: 0 }, bs);
  sv('circle', { cx: 0, cy: 0, r: 9, fill: '#ffffff', opacity: 0.25 }, tip);
  sv('circle', { cx: 0, cy: 0, r: 2.4, fill: '#ffffff' }, tip);
  var sparks = [];
  for (i = 0; i < 10; i++) sparks.push(sv('circle', { r: 0.9, fill: '#ffffff', opacity: 0 }, bs));

  // Zifferblatt
  var front = face(180);
  var fs = sv('svg', { viewBox: '0 0 400 400', width: '100%', height: '100%', style: 'display:block;overflow:visible' }, front);
  var fd = sv('defs', {}, fs);
  var sun = sv('radialGradient', { id: 'awSun', cx: '50%', cy: '42%', r: '65%' }, fd);
  [['0', '#3a6a9a'], ['0.6', '#1f3a5f'], ['1', '#101c2c']].forEach(function (s) { sv('stop', { offset: s[0], 'stop-color': s[1] }, sun); });
  sv('circle', { cx: 200, cy: 200, r: 183, fill: '#c3ccd5' }, fs);
  sv('circle', { cx: 200, cy: 200, r: 170, fill: 'url(#awSun)' }, fs);
  for (i = 0; i < 60; i++) {
    var aa = i * 6 * Math.PI / 180, hr = i % 5 === 0, ra = hr ? 128 : 150;
    sv('line', { x1: 200 + Math.sin(aa) * ra, y1: 200 - Math.cos(aa) * ra, x2: 200 + Math.sin(aa) * 158, y2: 200 - Math.cos(aa) * 158, stroke: C.ivory, 'stroke-width': hr ? 3.4 : 0.9, opacity: hr ? 0.95 : 0.55 }, fs);
  }
  var hands = sv('g', {}, fs);
  var hH = sv('line', { x1: 200, y1: 212, x2: 200, y2: 128, stroke: C.ivory, 'stroke-width': 4, 'stroke-linecap': 'round' }, hands);
  var hM = sv('line', { x1: 200, y1: 216, x2: 200, y2: 72, stroke: C.ivory, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, hands);
  sv('circle', { cx: 200, cy: 200, r: 4.5, fill: C.ivory }, hands);
  var logo = el('img', 'position:absolute;left:50%;top:69%;width:26%;height:auto;transform:translate(-50%,-50%)', front);
  logo.src = LOGO; logo.alt = '';

  var tag = el('div', 'position:absolute;left:0;right:0;top:calc(100% + 22px);text-align:center;font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-weight:500;font-size:clamp(19px,2.6vmin,26px);color:' + C.ice + ';opacity:0', stage);
  tag.textContent = TAGLINE;

  // Fortschritt
  var bar = el('div', 'position:absolute;left:50%;bottom:clamp(36px,8vh,72px);width:min(360px,64vw);transform:translateX(-50%);display:flex;flex-direction:column;gap:12px;opacity:0', ov);
  bar.setAttribute('aria-hidden', 'true');
  var meta = el('div', 'display:flex;justify-content:space-between;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:' + C.ice, bar);
  var metaL = el('span', '', meta);
  var pct = el('span', 'font-variant-numeric:tabular-nums', meta);
  var track = el('div', 'position:relative;height:1px;background:' + C.dim, bar);
  var fill = el('div', 'position:absolute;inset:0;background:' + C.ivory + ';transform-origin:left;transform:scaleX(0)', track);
  var dot = el('div', 'position:absolute;top:-2px;left:-2.5px;width:5px;height:5px;border-radius:50%;background:' + C.ivory + ';box-shadow:0 0 10px 2px rgba(197,212,228,0.7);will-change:transform', track);

  skip = el('button', 'position:absolute;top:calc(clamp(16px,3vh,28px) + env(safe-area-inset-top));right:clamp(16px,3vw,32px);min-height:44px;padding:0 14px;background:none;border:1px solid ' + C.dim + ';color:' + C.ice + ';font:600 12px "Source Sans 3",sans-serif;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;border-radius:2px;opacity:0;transition:color 200ms,border-color 200ms', ov);
  skip.type = 'button'; skip.id = 'aw-intro-skip'; skip.textContent = 'Überspringen';
  skip.setAttribute('aria-label', 'Intro überspringen');

  flyer = el('img', 'position:fixed;left:0;top:0;z-index:2147483001;pointer-events:none;opacity:0;transform-origin:0 0;will-change:transform');
  flyer.src = LOGO; flyer.alt = ''; flyer.setAttribute('aria-hidden', 'true');
  d.body.appendChild(flyer);

  var t = 0, last = null, b1 = null, b2 = null, fly = null, trackW = 0;
  function skipNow() { if (t < T.out[0]) t = T.out[0]; }
  skip.addEventListener('click', skipNow);
  ov.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

  function engrave(k, b, rect, yy) {
    var xx = b.x - 4 + k * (b.width + 8);
    rect.setAttribute('width', Math.max(0, xx));
    return { x: xx, y: yy };
  }
  // Beschriftung: alte Zeile blendet kurz aus, neue weich ein
  function labelAt(time) {
    var idx = 0;
    for (var j = 0; j < LABELS.length; j++) if (time >= LABELS[j][0]) idx = j;
    var start = LABELS[idx][0], next = idx + 1 < LABELS.length ? LABELS[idx + 1][0] : Infinity;
    var op = Math.min(idx === 0 ? 1 : eo(seg(time, [start, start + 0.35])), 1 - seg(time, [next - 0.2, next]));
    return { text: LABELS[idx][1], op: op };
  }

  function frame(now) {
    if (done) return;
    // Zeit akkumulieren (max. 0,1 s pro Bild): kein Sprung nach einem Tabwechsel
    if (last !== null) t += Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!b1) { try { b1 = t1.getBBox(); b2 = t2.getBBox(); } catch (e) {} }
    if (!trackW) trackW = track.getBoundingClientRect().width;

    // Bühne ein
    var si = eo(seg(t, T.stageIn));
    var ui = eo(seg(t, [0.3, 1.0]));
    // Gehäuseboden
    rim.style.strokeDashoffset = RL * (1 - eio(seg(t, T.rim)));
    disc.setAttribute('opacity', eo(seg(t, T.disc)));
    var sStep = (T.screws[1] - T.screws[0] - 0.35) / 5;
    for (var j = 0; j < screws.length; j++) screws[j].setAttribute('opacity', eo(seg(t, [T.screws[0] + j * sStep, T.screws[0] + j * sStep + 0.35])));

    // Gravur mit Graviernadel und Funken
    var pos = null, tipOp = 0;
    if (b1) {
      var k1 = eio(seg(t, T.line1)), k2 = eio(seg(t, T.line2));
      var p1 = engrave(k1, b1, r1, b1.y + b1.height * 0.55), p2 = engrave(k2, b2, r2, b2.y + b2.height * 0.55);
      if (k1 > 0 && k1 < 1) { pos = p1; tipOp = Math.min(1, k1 * 10, (1 - k1) * 10); }
      else if (k2 > 0 && k2 < 1) { pos = p2; tipOp = Math.min(1, k2 * 10, (1 - k2) * 10); }
    }
    if (pos) {
      tip.setAttribute('transform', 'translate(' + pos.x + ' ' + (pos.y + Math.sin(t * 40) * 1.2) + ')');
      tip.setAttribute('opacity', tipOp);
      for (j = 0; j < sparks.length; j++) {
        var ph = ((t * 3 + j / sparks.length) % 1), ang = (j * 137) % 360 * Math.PI / 180;
        sparks[j].setAttribute('cx', pos.x + Math.cos(ang) * ph * 16);
        sparks[j].setAttribute('cy', pos.y - Math.abs(Math.sin(ang)) * ph * 14 + ph * ph * 10);
        sparks[j].setAttribute('opacity', (1 - ph) * 0.9 * tipOp);
      }
    } else {
      tip.setAttribute('opacity', 0);
      for (j = 0; j < sparks.length; j++) sparks[j].setAttribute('opacity', 0);
    }

    // Drehung und Zeiger
    var fp = eio(seg(t, T.flip));
    back.style.visibility = fp < 0.5 ? 'visible' : 'hidden';
    front.style.visibility = fp >= 0.5 ? 'visible' : 'hidden';
    spin.style.transform = 'rotateY(' + (fp * 180) + 'deg) scale(' + (1 - Math.sin(fp * Math.PI) * 0.08) + ')';
    var hp = eio(seg(t, T.hands));
    hM.setAttribute('transform', 'rotate(' + lerp(-120, 60, hp) + ' 200 200)');
    hH.setAttribute('transform', 'rotate(' + lerp(240, 305, hp) + ' 200 200)');

    // Tagline
    var tg = eo(seg(t, T.tagline));
    tag.style.opacity = tg * (1 - eo(seg(t, [T.out[0], T.out[0] + 0.4])));
    tag.style.transform = 'translateY(' + ((1 - tg) * 8) + 'px)';

    // Fortschritt
    var p = seg(t, T.progress), pe = p < 1 ? p * (2 - p) * 0.5 + p * 0.5 : 1;
    fill.style.transform = 'scaleX(' + pe + ')';
    dot.style.transform = 'translateX(' + (pe * trackW) + 'px)';
    pct.textContent = String(Math.round(pe * 100)).padStart(3, '0') + ' %';
    var lb = labelAt(t);
    if (metaL.textContent !== lb.text) metaL.textContent = lb.text;
    metaL.style.opacity = lb.op;

    // Ausgang: Logo fliegt an die Header-Position, Intro blendet über (Crossfade)
    var op = seg(t, T.out);
    var outFade = 1 - eo(seg(t, [T.out[0], T.out[0] + 0.35]));
    if (op > 0) {
      if (!fly) {
        var ra2 = logo.getBoundingClientRect();
        var hdr = d.querySelector('header .brand img');
        var rb = hdr ? hdr.getBoundingClientRect() : { left: 24, top: 14, width: ra2.width * 0.5, height: ra2.height * 0.5 };
        fly = { a: ra2, b: rb };
        flyer.style.width = ra2.width + 'px'; flyer.style.height = ra2.height + 'px';
        flyer.style.transform = 'translate(' + ra2.left + 'px,' + ra2.top + 'px)';
        flyer.style.opacity = 1; logo.style.opacity = 0;
      }
      var k = eio(op), A = fly.a, B = fly.b;
      var sc = lerp(1, B.height / A.height, k);
      flyer.style.transform = 'translate(' + lerp(A.left, B.left, k) + 'px,' + lerp(A.top, B.top, k) + 'px) scale(' + sc + ')';
      var so = eo(seg(t, [T.out[0], T.out[0] + 0.65]));
      stage.style.transform = 'scale(' + (1 + eo(op) * 0.1) + ')';
      stage.style.opacity = 1 - so;
      if (canBlur) stage.style.filter = 'blur(' + (so * 6) + 'px)';
      bg.style.opacity = 1 - eio(seg(t, [T.out[0] + 0.1, T.out[1] - 0.05]));
    } else {
      stage.style.transform = 'scale(' + (0.97 + si * 0.03) + ')';
      stage.style.opacity = si;
    }
    bar.style.opacity = ui * outFade;
    skip.style.opacity = ui * outFade;
    skip.style.visibility = outFade > 0.02 ? 'visible' : 'hidden';

    if (t >= T.out[1]) return finish(); // Header-Logo wird im selben Bild sichtbar, das Flug-Logo verschwindet
    requestAnimationFrame(frame);
  }

  function start() { requestAnimationFrame(frame); }
  var fontsReady = d.fonts && d.fonts.load
    ? Promise.all([d.fonts.load('italic 500 46px "Cormorant Garamond"'), d.fonts.load('500 24px "Cormorant Garamond"'), d.fonts.load('600 11px "Source Sans 3"')])
    : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (res) { setTimeout(res, 900); })]).then(start, start);
})();
