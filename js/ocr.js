/* ════════════════════════════════════════════════════════════
   Welog4u — js/ocr.js
   Tesseract OCR scan loop, bounding box drawing,
   tap-to-select logic, and the value output field listeners.
   ════════════════════════════════════════════════════════════ */

// ── Start the repeating OCR scan ────────────────────────────
function startOCRLoop() {
  const s = window.W;
  if (s.ocrInterval) clearInterval(s.ocrInterval);
  s.ocrInterval = setInterval(readDigits, 4200);
  readDigits(); // fire immediately, don't wait 4.2 s
}

// ── One OCR pass ────────────────────────────────────────────
async function readDigits() {
  const s = window.W;
  if (s.processing || s.paused)              return;
  if (!s.video.videoWidth || s.video.readyState < 2) return;

  s.processing = true;
  s.statusEl.textContent = 'Scanning';
  document.body.classList.add('scanning');

  try {
    // Draw current video frame to hidden canvas
    s.canvas.width  = s.video.videoWidth;
    s.canvas.height = s.video.videoHeight;
    s.ctx.drawImage(s.video, 0, 0);

    // Greyscale conversion — improves OCR accuracy on coloured displays
    const id = s.ctx.getImageData(0, 0, s.canvas.width, s.canvas.height);
    const d  = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
      d[i] = d[i+1] = d[i+2] = g;
    }
    s.ctx.putImageData(id, 0, 0);

    // Run Tesseract
    const result = await Tesseract.recognize(s.canvas, 'eng', {
      tessedit_char_whitelist: '0123456789.',
      tessedit_pageseg_mode:   '11', // SPARSE_TEXT — best for isolated numbers
    });

    syncSizes(); // re-sync in case orientation changed mid-scan
    s.boxes = [];

    const scaleX = s.overlay.width  / s.canvas.width;
    const scaleY = s.overlay.height / s.canvas.height;

    // Build box list from word-level results
    if (result.data.words) {
      result.data.words.forEach(w => {
        const t = w.text.trim();
        if (/^[0-9.]+$/.test(t)) {
          const { x0, y0, x1, y1 } = w.bbox;
          s.boxes.push({
            text:   t,
            x:      x0 * scaleX,
            y:      y0 * scaleY,
            width:  (x1 - x0) * scaleX,
            height: (y1 - y0) * scaleY,
          });
        }
      });
    }

    redrawBoxes();

    // If the user has a locked box, try to re-find it by text
    if (s.selectedBox) {
      const match = s.boxes.find(b => b.text === s.selectedBox.text);
      if (match) {
        if (!s.outputEl.dataset.manualEdit) s.outputEl.value = match.text;
        s.selectedBox = match;
        // Persist to current session
        if (s.currentSession) {
          s.currentSession.readings[s.meterNames[s.currentMeterIdx]] = s.outputEl.value.trim();
        }
        const dot = document.getElementById(`dot-${s.currentMeterIdx}`);
        if (dot && s.outputEl.value.trim()) dot.classList.add('has-value');
      }
      s.statusEl.textContent = s.boxes.length
        ? `${s.boxes.length} number${s.boxes.length > 1 ? 's' : ''} — locked on "${s.selectedBox.text}"`
        : 'Display lost — holding last value';
    } else {
      s.statusEl.textContent = s.boxes.length
        ? `${s.boxes.length} number${s.boxes.length > 1 ? 's' : ''} — tap to select`
        : 'No numbers detected';
      s.hintEl.textContent = s.boxes.length
        ? 'Tap a highlighted box to lock a value'
        : 'Tap a bounding box to lock a value';
    }

    document.body.classList.remove('scanning');
  } catch (e) {
    s.statusEl.textContent = 'OCR error. Retrying...';
    console.error(e);
  }

  s.processing = false;
}

// ── Redraw all bounding boxes on the overlay canvas ─────────
function redrawBoxes() {
  const s = window.W;
  s.ctxOv.clearRect(0, 0, s.overlay.width, s.overlay.height);
  s.boxes.forEach(box => {
    const isSel = box === s.selectedBox;
    s.ctxOv.strokeStyle = isSel ? '#ffff00' : '#00ff88';
    s.ctxOv.lineWidth   = isSel ? 3 : 2;
    s.ctxOv.strokeRect(box.x, box.y, box.width, box.height);
    s.ctxOv.fillStyle   = isSel ? '#ffff00' : '#00ff88';
    s.ctxOv.font        = '13px Courier New';
    s.ctxOv.fillText(
      box.text,
      box.x + 2,
      box.y > 14 ? box.y - 4 : box.y + box.height + 14
    );
  });
}

// ── Draw only the selected box (used right after auto-pause) ─
function drawSelectedBox() {
  const s = window.W;
  if (!s.selectedBox) return;
  s.ctxOv.strokeStyle = '#ffff00';
  s.ctxOv.lineWidth   = 3;
  s.ctxOv.strokeRect(s.selectedBox.x, s.selectedBox.y, s.selectedBox.width, s.selectedBox.height);
  s.ctxOv.fillStyle   = '#ffff00';
  s.ctxOv.font        = '13px Courier New';
  s.ctxOv.fillText(
    s.selectedBox.text,
    s.selectedBox.x + 2,
    s.selectedBox.y > 14 ? s.selectedBox.y - 4 : s.selectedBox.y + s.selectedBox.height + 14
  );
}

// ── Handle a tap / click on the overlay ─────────────────────
function handleTap(cx, cy) {
  const s    = window.W;
  const rect = s.overlay.getBoundingClientRect();
  const x    = cx - rect.left;
  const y    = cy - rect.top;

  s.boxes.forEach(box => {
    if (x >= box.x && x <= box.x + box.width &&
        y >= box.y && y <= box.y + box.height) {

      s.selectedBox    = box;
      s.outputEl.value = box.text;
      delete s.outputEl.dataset.manualEdit;

      // Save immediately to current session
      if (s.currentSession) {
        s.currentSession.readings[s.meterNames[s.currentMeterIdx]] = box.text;
      }

      // Mark the nav dot as having a value
      const dot = document.getElementById(`dot-${s.currentMeterIdx}`);
      if (dot) dot.classList.add('has-value');

      // Auto-pause so the locked value doesn't get overwritten
      if (!s.paused) {
        s.paused = true;
        document.getElementById('btn-pause').textContent = '▶ Resume';
        document.body.classList.remove('scanning');
      }

      // Redraw overlay showing only the selected box in yellow
      s.ctxOv.clearRect(0, 0, s.overlay.width, s.overlay.height);
      drawSelectedBox();

      s.hintEl.textContent   = 'Locked — tap ▶ Resume to scan again';
      s.statusEl.textContent = 'Paused — value locked ✓';
    }
  });
}

// Overlay tap listeners
document.getElementById('overlay').addEventListener('click', e => handleTap(e.clientX, e.clientY));
document.getElementById('overlay').addEventListener('touchend', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  handleTap(t.clientX, t.clientY);
}, { passive: false });

// ── Output field — track manual edits ───────────────────────
document.getElementById('output').addEventListener('input', () => {
  const s = window.W;
  s.outputEl.dataset.manualEdit = '1';
  s.hintEl.textContent = 'Manually edited';
  if (s.currentSession) {
    s.currentSession.readings[s.meterNames[s.currentMeterIdx]] = s.outputEl.value.trim();
  }
});

document.getElementById('output').addEventListener('change', () => {
  const s = window.W;
  if (!s.outputEl.value.trim()) {
    delete s.outputEl.dataset.manualEdit;
    s.selectedBox        = null;
    s.hintEl.textContent = 'Tap a bounding box to lock a value';
  }
  if (s.currentSession) {
    s.currentSession.readings[s.meterNames[s.currentMeterIdx]] = s.outputEl.value.trim();
  }
  const dot = document.getElementById(`dot-${s.currentMeterIdx}`);
  if (dot) dot.classList.toggle('has-value', !!s.outputEl.value.trim());
});

// ── Copy value to clipboard ──────────────────────────────────
function copyValue() {
  const s   = window.W;
  const val = s.outputEl.value.trim();
  if (!val) return;
  navigator.clipboard.writeText(val).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✓';
    setTimeout(() => btn.textContent = '⎘ Copy', 1500);
  }).catch(() => {
    s.outputEl.select();
    document.execCommand('copy');
  });
}
