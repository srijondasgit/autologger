/* ════════════════════════════════════════════════════════════
   Welog4u — js/meters.js
   Meter navigation dots, switching between meters,
   saving / finishing a session, and the results table.
   ════════════════════════════════════════════════════════════ */

// ── Build the numbered dot nav for the current meter set ────
function buildMeterNav() {
  const s   = window.W;
  const nav = document.getElementById('meter-nav');
  nav.innerHTML = '';

  s.meterNames.forEach((name, i) => {
    const dot       = document.createElement('button');
    dot.className   = 'meter-dot';
    dot.id          = `dot-${i}`;
    dot.title       = name;
    dot.textContent = i + 1;
    dot.onclick     = () => switchMeter(i);
    nav.appendChild(dot);
  });
}

// ── Switch the active meter ──────────────────────────────────
function switchMeter(idx) {
  const s = window.W;

  // Persist current meter's value before leaving it
  if (s.currentSession && s.meterNames[s.currentMeterIdx] !== undefined) {
    s.currentSession.readings[s.meterNames[s.currentMeterIdx]] = s.outputEl.value.trim();
  }

  s.currentMeterIdx = idx;
  const name = s.meterNames[idx];

  // Update header
  document.getElementById('meter-name-display').textContent = name;
  document.getElementById('meter-counter').textContent      = `${idx + 1}/${s.meterNames.length}`;

  // Refresh dot styles
  s.meterNames.forEach((_, i) => {
    const dot = document.getElementById(`dot-${i}`);
    if (!dot) return;
    const hasVal = s.currentSession && s.currentSession.readings[s.meterNames[i]];
    dot.className = 'meter-dot'
      + (i === idx  ? ' active'    : '')
      + (hasVal     ? ' has-value' : '');
  });

  // Restore this meter's saved value (if any)
  const saved = s.currentSession ? (s.currentSession.readings[name] || '') : '';
  s.outputEl.value = saved;
  delete s.outputEl.dataset.manualEdit;

  // Reset OCR state for the new meter
  s.selectedBox = null;
  s.boxes       = [];
  s.paused      = false;
  s.ctxOv.clearRect(0, 0, s.overlay.width, s.overlay.height);
  s.statusEl.textContent = 'Scanning...';
  s.hintEl.textContent   = 'Tap a bounding box to lock a value';
  document.getElementById('btn-pause').textContent = '⏸ Pause';
  document.body.classList.add('scanning');
}

// ── Save the current session and show the results table ─────
function finishSession() {
  const s = window.W;

  // Persist the last meter's value
  if (s.currentSession && s.meterNames[s.currentMeterIdx] !== undefined) {
    s.currentSession.readings[s.meterNames[s.currentMeterIdx]] = s.outputEl.value.trim();
  }

  if (s.currentSession) {
    // Replace if a session with the same name already exists, otherwise append
    const existing = s.sessions.findIndex(sess => sess.name === s.currentSession.name);
    if (existing >= 0) s.sessions[existing] = s.currentSession;
    else               s.sessions.push(s.currentSession);
  }

  s.currentSession = null;
  stopCamera(); // defined in camera.js
  showTable();  // defined in pages.js
}

// ── Build and display the results table ─────────────────────
function buildTable() {
  const s   = window.W;
  const tbl = document.getElementById('results-table');
  tbl.innerHTML = '';

  if (!s.sessions.length) {
    tbl.innerHTML = '<tr><td style="color:#336644;padding:20px">No readings yet.</td></tr>';
    return;
  }

  // ── Header row: SESSION | meter1 | meter2 | …
  const thead = document.createElement('thead');
  const hrow  = document.createElement('tr');
  const thS   = document.createElement('th');
  thS.textContent = 'SESSION';
  thS.className   = 'session-col';
  hrow.appendChild(thS);

  s.meterNames.forEach(name => {
    const th       = document.createElement('th');
    th.textContent = name;
    hrow.appendChild(th);
  });
  thead.appendChild(hrow);
  tbl.appendChild(thead);

  // ── Body rows: one per session
  const tbody = document.createElement('tbody');
  s.sessions.forEach(sess => {
    const tr  = document.createElement('tr');
    const tdS = document.createElement('td');
    tdS.className   = 'session-name';
    tdS.textContent = sess.name;
    tr.appendChild(tdS);

    s.meterNames.forEach(name => {
      const td  = document.createElement('td');
      const val = sess.readings[name] || '';
      td.textContent = val || '—';
      if (!val) td.className = 'empty';
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);
}

// ── Copy the table as CSV to the clipboard ──────────────────
function copyTableCSV() {
  const s = window.W;
  if (!s.sessions.length) return;

  let csv = 'SESSION,' + s.meterNames.join(',') + '\n';
  s.sessions.forEach(sess => {
    csv += sess.name + ',' + s.meterNames.map(n => sess.readings[n] || '').join(',') + '\n';
  });

  navigator.clipboard.writeText(csv).catch(() => {});

  const btn = event.target;
  btn.textContent = '✓ Copied!';
  setTimeout(() => btn.textContent = '⎘ Copy CSV', 1800);
}

// ── Wipe all sessions after confirmation ────────────────────
function clearAllData() {
  if (!confirm('Clear all sessions and readings?')) return;
  window.W.sessions = [];
  buildTable();
}
