/* ════════════════════════════════════════════════════════════
   Welog4u — js/state.js
   Single global namespace W that holds all shared state.
   Every other JS file reads from and writes to window.W.
   No ES modules — works as a plain double-clicked file.
   ════════════════════════════════════════════════════════════ */

window.W = {

  // ── App / session state ──────────────────────────────────
  MAX_METERS:      10,
  meterNames:      [],   // string[]  — names entered on setup page
  sessions:        [],   // [{ name, readings: { meterName: value } }]
  currentSession:  null, // { name, readings } — session being captured now
  currentMeterIdx: 0,    // which meter dot is active
  sessionNameMode: '24h', // '24h' | '12h' | 'custom'

  // ── Camera state ─────────────────────────────────────────
  currentStream: null,
  torchOn:       false,
  usingRear:     true,
  torchTrack:    null,
  ocrInterval:   null,

  // ── OCR / overlay state ──────────────────────────────────
  boxes:       [],    // bounding boxes from last Tesseract scan
  processing:  false, // true while a Tesseract call is in-flight
  paused:      false, // user or auto paused the scan loop
  selectedBox: null,  // the box the user tapped to lock

  // ── DOM refs — populated by init() in pages.js ───────────
  video:    null,
  overlay:  null,
  ctxOv:    null,
  canvas:   null,
  ctx:      null,
  wrapper:  null,
  statusEl: null,
  outputEl: null,
  hintEl:   null,
};
