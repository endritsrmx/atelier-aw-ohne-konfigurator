/* Atelier AW – Seitenlogik (ohne Framework)
 * Menü, aktive Navigation, Ablauf-Linien, Anfrageformular (Demo, kein Versand) und FAQ.
 * Alle Eingaben bleiben im Arbeitsspeicher der geöffneten Seite.
 */
(function () {
  'use strict';
  var d = document;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function mq(q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; }
  function onMq(m, fn) { if (!m.addEventListener && !m.addListener) return; if (m.addEventListener) m.addEventListener('change', fn); else m.addListener(fn); }
  var reduced = mq('(prefers-reduced-motion: reduce)').matches;
  var fine = mq('(hover: hover) and (pointer: fine)').matches;

  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });


  /* ───────────── Daten (laut Datenblättern Atelier AW) ───────────── */
  var MODELS = {
    classico: { label: 'Classico Titanio', metal: 'Titan', sizes: [{ id: '36', label: '36 mm', sub: 'Zifferblatt 28,5 mm', r: 135, dr: 107 }, { id: '39', label: '39 mm', sub: 'Zifferblatt 33,5 mm', r: 146, dr: 126 }],
      dials: [{ id: 'eisblau', label: 'Eisblau', c: '#a8d4ec', light: true }, { id: 'nachtblau', label: 'Nachtblau', c: '#1c2f6e' }, { id: 'violett', label: 'Violett', c: '#7a2a9e' }, { id: 'gruen', label: 'Tannengrün', c: '#1d6a46' }, { id: 'braun', label: 'Mokka', c: '#6a4a36' }, { id: 'schwarz', label: 'Schwarz', c: '#1a1b1e' }],
      straps: ['kautschuk', 'leder', 'stoff'], back: 'Titan' },
    wsport: { label: 'W-Sport', metal: 'Stahl', sizes: [{ id: '40', label: '40 mm', sub: 'Zifferblatt 28,5 mm', r: 150, dr: 104 }],
      dials: [{ id: 'schwarz', label: 'Schwarz', c: '#17181b' }, { id: 'silber', label: 'Silber', c: '#c9ccd0', light: true }, { id: 'azur', label: 'Azurblau', c: '#1d8cc6' }, { id: 'koenigsblau', label: 'Königsblau', c: '#2343a6' }, { id: 'smaragd', label: 'Smaragd', c: '#0f6b54' }, { id: 'rot', label: 'Rot', c: '#b0241d' }],
      straps: ['stahl', 'kautschuk'], back: 'Stahl' }
  };
  var MODEL_OPTS = [{ id: 'classico', label: 'Classico Titanio', sub: 'Titan T2 · 36 / 39 mm' }, { id: 'wsport', label: 'W-Sport', sub: 'Stahl · 40 mm · Lünette' }];
  var BEZEL = [{ id: 'alu', label: 'Aluminium', sub: 'matt' }, { id: 'keramik', label: 'Keramik', sub: 'glänzend' }];
  var STRAPS = { kautschuk: { label: 'Kautschuk', c: '#1f2429' }, leder: { label: 'Leder', c: '#6b4630' }, stoff: { label: 'Stoff', c: '#33445a' }, stahl: { label: 'Stahl', c: '#b8c2ca' } };
  var BACK = [{ id: 'glas', label: 'Glasboden', sub: 'Werk sichtbar' }, { id: 'zu', label: 'Geschlossen', sub: 'Platz für Gravur' }];
  var ROTOR = [{ id: 'standard', label: 'Standard', sub: 'inklusive' }, { id: 'farbig', label: 'Farbig', sub: '+CHF 35.–' }];
  var RCOL = [{ id: 'blau', label: 'Blau', c: '#2d5e92' }, { id: 'gold', label: 'Gold', c: '#cfa65a' }, { id: 'rose', label: 'Roségold', c: '#d9a48a' }, { id: 'schwarz', label: 'Schwarz', c: '#2a2c30' }];
  var BASE = 395, ROTOR_ADD = 35;
  var DEFAULT = { model: 'classico', size: '39', bezel: 'keramik', dial: 'eisblau', strap: 'kautschuk', back: 'glas', rotor: 'standard', rcol: 'blau', view: 'front', dialText: '', engraving: '' };
  var STEPS = ['Euer Anlass', 'Gestaltung & Wünsche', 'Kontakt', 'Prüfen'];
  var NAV = ['modelle', 'anlaesse', 'sofort', 'projekte', 'zubehoer', 'ablauf', 'atelier', 'materialien', 'beispiele'];
  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return arr[0]; }
  function assign(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
  function chf(n) { return 'CHF ' + n + '.–'; }

  /* ───────────── Hilfen ───────────── */
  function setT(key, text) { $$('[data-t="' + key + '"]').forEach(function (el) { el.textContent = text; }); }
  function setIf(key, on) { $$('[data-if="' + key + '"]').forEach(function (el) { el.hidden = !on; }); }
  function focusLater(id, delay) {
    setTimeout(function () { var el = d.getElementById(id); if (el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } } }, delay == null ? 450 : delay);
  }
  function scrollToId(id) {
    var el = d.getElementById(id); if (!el) return;
    var hh = (d.querySelector('header') || {}).offsetHeight || 76;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - hh - 8, behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ───────────── Menü ───────────── */
  var menuBtn = $('#menu-btn'), menu = $('#aw-menu'), menuIcon = $('#menu-icon'), menuLabel = $('#menu-label');
  var menuOpen = false;
  function lockPage(on) {
    d.body.style.overflow = on ? 'hidden' : '';
    ['aw-main', 'aw-footer'].forEach(function (id) {
      var el = d.getElementById(id); if (!el) return;
      el.inert = on; if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }
  function openMenu() {
    menuOpen = true; menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true'); menuLabel.textContent = 'Schliessen';
    menuIcon.setAttribute('d', 'M4 1l14 12M18 1L4 13');
    lockPage(true);
    var first = $('a', menu); if (first) first.focus();
  }
  function closeMenu(refocus) {
    if (!menuOpen) return;
    menuOpen = false; menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false'); menuLabel.textContent = 'Menü';
    menuIcon.setAttribute('d', 'M0 2h22M0 7h22M0 12h22');
    lockPage(false);
    if (refocus) menuBtn.focus();
  }
  menuBtn.addEventListener('click', function () { if (menuOpen) closeMenu(true); else openMenu(); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { closeMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) closeMenu(true); });
  var mqWide = mq('(min-width: 1120px)');
  onMq(mqWide, function () { if (mqWide.matches) closeMenu(false); });

  /* ───────────── aktiver Bereich in der Navigation ───────────── */
  var navLinks = $$('[data-nav]');
  function setActive(id) {
    navLinks.forEach(function (a) { if (a.getAttribute('data-nav') === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); }); }, { rootMargin: '-40% 0px -55% 0px' });
    NAV.concat(['inhalt', 'fragen', 'anfrage']).forEach(function (id) { var el = d.getElementById(id); if (el) io.observe(el); });
  }

  /* ───────────── Ablauf-Linien ───────────── */
  var proc = d.getElementById('process');
  if (proc) {
    if ('IntersectionObserver' in window) {
      var pio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { proc.classList.add('is-on'); pio.disconnect(); } }, { threshold: 0.3 });
      pio.observe(proc);
    } else proc.classList.add('is-on');
  }

  /* ───────────── Anfrageformular (kontakt.html) ───────────── */
  function initForm() {
  var F = {};
  ['anlass', 'kundentyp', 'stueck', 'termin', 'modell', 'nachricht', 'name', 'email', 'tel'].forEach(function (k) { F[k] = d.getElementById('f-' + k); });
  var REQ = ['anlass', 'kundentyp', 'stueck', 'name', 'email'];
  var st = { step: 1, done: false, errors: {}, showErr: false, file: null, fileErr: '' };
  var fileInput = d.getElementById('f-logo-input');

  function formLive(text) { setT('formLive', text); }
  function validate(step) {
    var e = {};
    if (step === 1) {
      if (!F.anlass.value) e.anlass = 'Bitte einen Anlass wählen.';
      if (!F.kundentyp.value) e.kundentyp = 'Bitte einen Kundentyp wählen.';
      var n = String(F.stueck.value).trim();
      if (!/^\d+$/.test(n) || +n < 1 || +n > 9999) e.stueck = 'Bitte eine ganze Zahl zwischen 1 und 9999 eingeben.';
    }
    if (step === 3) {
      if (!F.name.value.trim()) e.name = 'Bitte euren Namen angeben.';
      if (!F.email.value.trim()) e.email = 'Bitte eine E-Mail-Adresse angeben.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(F.email.value.trim())) e.email = 'Bitte eine gültige E-Mail-Adresse angeben, z. B. name@beispiel.ch.';
    }
    return e;
  }
  function dash(v) { return (v && String(v).trim()) ? v : 'keine Angabe'; }
  function reviewData() {
    return [
      { title: 'Euer Anlass', step: 1, rows: [{ k: 'Anlass', v: dash(F.anlass.value) }, { k: 'Kundentyp', v: dash(F.kundentyp.value) }, { k: 'Stückzahl', v: dash(F.stueck.value) }, { k: 'Wunschtermin', v: dash(F.termin.value) }] },
      { title: 'Gestaltung & Wünsche', step: 2, rows: [{ k: 'Modell', v: F.modell.value || 'Noch offen' }].concat([
        { k: 'Logo-Datei', v: st.file ? st.file.name + ' (nicht übertragen)' : 'Keine Datei gewählt' }, { k: 'Nachricht', v: dash(F.nachricht.value) }]) },
      { title: 'Kontakt', step: 3, rows: [{ k: 'Name', v: dash(F.name.value) }, { k: 'E-Mail', v: dash(F.email.value) }, { k: 'Telefon', v: dash(F.tel.value) }] }
    ];
  }
  function mk(tag, css, text) { var e = d.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; }
  function renderReview(container, withEdit) {
    while (container.firstChild) container.removeChild(container.firstChild);
    reviewData().forEach(function (r) {
      var box = mk('div', 'border-top:1px solid rgba(28,30,34,0.25);padding-top:' + (withEdit ? 16 : 14) + 'px;display:flex;flex-direction:column;gap:' + (withEdit ? 12 : 10) + 'px');
      var h4 = mk('h4', 'margin:0;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#28496f', r.title);
      if (withEdit) {
        var head = mk('div', 'display:flex;justify-content:space-between;align-items:center;gap:12px');
        var btn = mk('button', 'min-height:44px;padding:0 6px;background:none;border:0;color:#1f3a5f;font:600 14px \'Source Sans 3\',sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer', 'Bearbeiten');
        btn.type = 'button'; btn.setAttribute('aria-label', r.title + ' bearbeiten');
        btn.addEventListener('click', function () { goStep(r.step); });
        head.appendChild(h4); head.appendChild(btn); box.appendChild(head);
      } else box.appendChild(h4);
      var dl = mk('dl', 'margin:0;display:grid;grid-template-columns:minmax(0,10em) minmax(0,1fr);gap:8px 20px');
      r.rows.forEach(function (w) {
        dl.appendChild(mk('dt', 'font-size:15px;color:#5c6570', w.k));
        dl.appendChild(mk('dd', 'margin:0;font-size:15px;overflow-wrap:anywhere;white-space:pre-wrap', w.v));
      });
      box.appendChild(dl); container.appendChild(box);
    });
  }
  function renderForm() {
    var s = st.step;
    $$('[data-step]').forEach(function (el) { el.hidden = +el.getAttribute('data-step') !== s; });
    d.getElementById('progress-bar').style.transform = 'scaleX(' + (s / 4) + ')';
    setT('stepOf', 'Schritt ' + s + ' von 4');
    $$('.step-li').forEach(function (li) { if (+li.getAttribute('data-stepnum') === s) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    d.getElementById('aw-form').setAttribute('aria-labelledby', 'step-h-' + s);
    setIf('canBack', s > 1); setIf('notLast', s < 4); setIf('isLast', s === 4);
    REQ.forEach(function (k) {
      var msg = st.errors[k] || '';
      F[k].setAttribute('aria-invalid', msg ? 'true' : 'false');
      var db = [k === 'stueck' ? 'h-stueck' : '', msg ? 'e-' + k : ''].filter(Boolean).join(' ');
      if (db) F[k].setAttribute('aria-describedby', db); else F[k].removeAttribute('aria-describedby');
      setT('er.' + k, msg); setIf('er.' + k, !!msg);
    });
    setIf('showErrSummary', st.showErr);
    setIf('notDone', !st.done); setIf('done', st.done);
    setT('msgCount', F.nachricht.value.length + ' / 2000');
    setT('fileStatus', st.file ? st.file.name + ' (' + st.file.type + ')' : 'Keine Datei gewählt');
    setIf('hasFile', !!st.file); setT('fileErr', st.fileErr); setIf('fileErr', !!st.fileErr);
    if (s === 4) renderReview($('[data-review="step"]'), true);
    if (st.done) renderReview($('[data-review="done"]'), false);
  }
  function goStep(n, focus) {
    st.step = n; st.errors = {}; st.showErr = false; st.done = false;
    formLive('Schritt ' + n + ' von 4: ' + STEPS[n - 1]);
    renderForm();
    if (focus !== false) focusLater('step-h-' + n, 60);
  }
  function failWith(step, e) {
    if (step !== st.step) formLive('Schritt ' + step + ' von 4: ' + STEPS[step - 1]);
    st.step = step; st.errors = e; st.showErr = true; st.done = false;
    renderForm();
    focusLater('f-' + Object.keys(e)[0], 30);
  }
  function formFocus() { scrollToId('anfrage'); focusLater('anfrage-h'); }
  function clearErr(k) {
    if (!st.errors[k]) return;
    delete st.errors[k];
    renderForm();
  }
  Object.keys(F).forEach(function (k) {
    var ev = F[k].tagName === 'SELECT' ? 'change' : 'input';
    F[k].addEventListener(ev, function () { clearErr(k); if (k === 'nachricht') setT('msgCount', F.nachricht.value.length + ' / 2000'); });
  });
  d.getElementById('aw-form').addEventListener('submit', function (e) { e.preventDefault(); });
  d.getElementById('btn-back').addEventListener('click', function () { goStep(Math.max(1, st.step - 1)); });
  d.getElementById('btn-next').addEventListener('click', function () {
    var e = validate(st.step);
    if (Object.keys(e).length) return failWith(st.step, e);
    goStep(st.step + 1);
  });
  d.getElementById('btn-finish').addEventListener('click', function () {
    var steps = [1, 3];
    for (var i = 0; i < steps.length; i++) { var e = validate(steps[i]); if (Object.keys(e).length) return failWith(steps[i], e); }
    st.done = true;
    formLive('Demo-Anfrage abgeschlossen. Es wurde nichts gesendet.');
    renderForm();
    focusLater('done-h', 60);
  });
  d.getElementById('btn-edit-all').addEventListener('click', function () { goStep(4); });

  // Logo-Datei: nur Name und Typ werden angezeigt, die Datei wird weder gelesen noch übertragen
  d.getElementById('f-logo').addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    var file = fileInput.files && fileInput.files[0]; if (!file) return;
    var ext = (file.name.split('.').pop() || '').toLowerCase();
    if (['svg', 'pdf', 'png'].indexOf(ext) < 0) { fileInput.value = ''; st.fileErr = 'Bitte eine SVG-, PDF- oder PNG-Datei wählen.'; return renderForm(); }
    if (file.size > 10 * 1024 * 1024) { fileInput.value = ''; st.fileErr = 'Die Datei ist grösser als 10 MB (Demo-Grenze).'; return renderForm(); }
    st.file = { name: file.name, type: ext.toUpperCase() }; st.fileErr = '';
    renderForm();
  });
  d.getElementById('f-logo-remove').addEventListener('click', function () {
    fileInput.value = ''; st.file = null; st.fileErr = ''; renderForm(); focusLater('f-logo', 30);
  });

  // Übergaben aus den Geschichten
  $$('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      F.kundentyp.value = a.getAttribute('data-cta'); clearErr('kundentyp');
      if (st.done) { st.done = false; st.step = 1; renderForm(); }
      formFocus();
    });
  });
  $$('[data-js="to-logo"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      goStep(2, false); scrollToId('anfrage'); focusLater('f-logo');
    });
  });
  // Vorbefüllung über URL (?anlass=, ?kundentyp=, ?nachricht=, ?modell=)
  var q = new URLSearchParams(location.search);
  if (q.get('anlass')) { var an = q.get('anlass'); if (!$$('option', F.anlass).some(function (o) { return o.value === an || o.textContent === an; })) { var op = d.createElement('option'); op.textContent = an; F.anlass.appendChild(op); } F.anlass.value = an; }
  if (q.get('kundentyp')) F.kundentyp.value = q.get('kundentyp');
  if (q.get('nachricht')) F.nachricht.value = q.get('nachricht').slice(0, 2000);
  if (q.get('logo')) { st.step = 2; }
  if (q.get('modell')) { var mq = q.get('modell'); $$('option', F.modell).forEach(function (o) { if (o.textContent.indexOf(mq) === 0) F.modell.value = o.textContent; }); }
  if ([].some.call(['anlass', 'kundentyp', 'nachricht', 'modell'], function (k) { return q.get(k); })) setTimeout(function () { scrollToId('anfrage'); focusLater('anfrage-h', 500); }, 150);
  renderForm();
  }

  /* ───────────── FAQ ───────────── */
  $$('.faq-btn').forEach(function (btn) {
    var panel = d.getElementById(btn.getAttribute('aria-controls')), t = null;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      clearTimeout(t);
      if (open) {
        panel.classList.add('is-shown');
        requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.add('is-open'); }); });
      } else {
        panel.classList.remove('is-open');
        t = setTimeout(function () { if (btn.getAttribute('aria-expanded') !== 'true') panel.classList.remove('is-shown'); }, reduced ? 0 : 240);
      }
    });
  });

  if (d.getElementById('aw-form')) initForm();
})();
