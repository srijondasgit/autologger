/* ════════════════════════════════════════════════════════════
   Welog4u — js/pages.js
   Page navigation and per-page logic:
     Page 1 — Meter Setup
     Page 2 — Session / Reading Name
     Page 3 — OCR (entry point only; heavy logic is in ocr.js)
     Page 4 — Results Table
   Also runs init() on load to wire up DOM refs in state.
   ════════════════════════════════════════════════════════════ */

// ── Switch the visible page ──────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ════════════════════════════════════════════════════════════
//  PAGE 1 — METER SETUP
// ════════════════════════════════════════════════════════════

function buildSetupPage() {
  const s    = window.W;
  const list = document.getElementById('meter-list');
  list.innerHTML = '';

  for (let i = 0; i < s.MAX_METERS; i++) {
    const row       = document.createElement('div');
    row.className   = 'meter-row';
    row.innerHTML   = `
      <span class="meter-num">${i + 1}</span>
      <input class="meter-input" id="m${i}" type="text" maxlength="10"
             placeholder="Meter ${i + 1}" autocomplete="off" spellcheck="false"
             oninput="this.value=this.value.toUpperCase().slice(0,10)" />
    `;
    list.appendChild(row);

    // Re-populate if the user came back from session page
    if (s.meterNames[i]) {
      setTimeout(() => {
        const el = document.getElementById('m' + i);
        if (el) el.value = s.meterNames[i];
      }, 0);
    }
  }

  setTimeout(() => {
    const first = document.getElementById('m0');
    if (first) first.focus();
  }, 100);

  showPage('pg-setup');
}

// Called by the "Next" button on page 1
function goToSession() {
  const s    = window.W;
  s.meterNames = [];

  for (let i = 0; i < s.MAX_METERS; i++) {
    const el = document.getElementById('m' + i);
    const v  = el ? el.value.trim() : '';
    if (v) s.meterNames.push(v);
  }

  // Always have at least one meter
  if (!s.meterNames.length) s.meterNames = ['METER 1'];

  stopCamera(); // defined in camera.js — safe to call even if no stream
  updateSessionPage();
  showPage('pg-session');
}

// ════════════════════════════════════════════════════════════
//  PAGE 2 — SESSION / READING NAME
// ════════════════════════════════════════════════════════════

// Return the start-of-hour label in the requested format
function getHourLabel(mode) {
  const now = new Date();
  now.setMinutes(0, 0, 0); // snap to hour boundary
  if (mode === '24h') {
    return now.getHours().toString().padStart(2, '0') + ':00';
  }
  let h      = now.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h          = h % 12 || 12;
  return `${h}:00 ${ampm}`;
}

// Highlight the chosen option and show / hide custom input
function selectOpt(mode) {
  const s = window.W;
  s.sessionNameMode = mode;

  ['24h', '12h', 'custom'].forEach(m => {
    const id  = m === '24h' ? 'opt-24' : m === '12h' ? 'opt-12' : 'opt-custom';
    document.getElementById(id).classList.toggle('selected', m === mode);
  });

  const wrap = document.getElementById('custom-name-wrap');
  wrap.style.display = mode === 'custom' ? 'block' : 'none';
  if (mode === 'custom') {
    setTimeout(() => document.getElementById('custom-name').focus(), 80);
  }
}

// Refresh live time previews and session chip history
function updateSessionPage() {
  const s = window.W;

  document.getElementById('val-24h').textContent = getHourLabel('24h');
  document.getElementById('val-12h').textContent = getHourLabel('12h');

  selectOpt(s.sessionNameMode);

  const histWrap = document.getElementById('session-history-wrap');
  const chips    = document.getElementById('session-chips');
  const viewBtn  = document.getElementById('btn-view-table');

  if (s.sessions.length > 0) {
    histWrap.style.display = 'block';
    viewBtn.style.display  = 'block';
    chips.innerHTML = '';
    s.sessions.forEach(sess => {
      const chip       = document.createElement('span');
      chip.className   = 'session-chip';
      chip.textContent = sess.name;
      chip.onclick     = () => showTable();
      chips.appendChild(chip);
    });
  } else {
    histWrap.style.display = 'none';
    viewBtn.style.display  = 'none';
  }
}

// Resolve the final session name from the selected mode
function getSessionName() {
  const s = window.W;
  if (s.sessionNameMode === '24h') return getHourLabel('24h');
  if (s.sessionNameMode === '12h') return getHourLabel('12h');
  const v = document.getElementById('custom-name').value.trim().toUpperCase();
  return v || `SESSION ${s.sessions.length + 1}`;
}

// Called by the "Start Reading" button on page 2
function startReading() {
  const s    = window.W;
  const name = getSessionName();

  // Initialise a fresh session with empty readings for every meter
  const readings = {};
  s.meterNames.forEach(n => readings[n] = '');
  s.currentSession  = { name, readings };
  s.currentMeterIdx = 0;

  showPage('pg-ocr');
  buildMeterNav();   // defined in meters.js
  switchMeter(0);    // defined in meters.js
  startCamera(s.usingRear); // defined in camera.js
}

// ════════════════════════════════════════════════════════════
//  PAGE 4 — TABLE
// ════════════════════════════════════════════════════════════

function showTable() {
  stopCamera();  // defined in camera.js
  buildTable();  // defined in meters.js
  showPage('pg-table');
}

// ════════════════════════════════════════════════════════════
//  INIT — runs once on page load
// ════════════════════════════════════════════════════════════

function init() {
  const s = window.W;

  // Wire up DOM refs into shared state so every module can reach them
  s.video    = document.getElementById('video');
  s.overlay  = document.getElementById('overlay');
  s.ctxOv    = s.overlay.getContext('2d');
  s.canvas   = document.getElementById('canvas');
  s.ctx      = s.canvas.getContext('2d');
  s.wrapper  = document.getElementById('cam-wrapper');
  s.statusEl = document.getElementById('status');
  s.outputEl = document.getElementById('output');
  s.hintEl   = document.getElementById('hint');

  // Show the first page
  buildSetupPage();
}

// Kick everything off
init();
