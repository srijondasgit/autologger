/* ════════════════════════════════════════════════════════════
   Welog4u — js/camera.js
   Everything to do with the device camera:
   start, stop, flip, torch, and syncing canvas sizes
   to the video dimensions and screen orientation.
   ════════════════════════════════════════════════════════════ */

// ── Stop the active camera stream and OCR interval ─────────
function stopCamera() {
  const s = window.W;
  if (s.currentStream) {
    s.currentStream.getTracks().forEach(t => t.stop());
    s.currentStream = null;
  }
  if (s.ocrInterval) {
    clearInterval(s.ocrInterval);
    s.ocrInterval = null;
  }
  document.body.classList.remove('scanning');
}

// ── Start camera (rear by default) ─────────────────────────
async function startCamera(rear = true) {
  const s = window.W;
  stopCamera();

  const constraints = {
    video: {
      facingMode: rear ? { ideal: 'environment' } : { ideal: 'user' },
      width:  { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  };

  try {
    s.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (e) {
    // Fallback — any camera at all
    try {
      s.currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    } catch (e2) {
      s.statusEl.textContent = 'Camera access denied.';
      return;
    }
  }

  s.video.srcObject = s.currentStream;

  // Grab torch track on rear camera if the device supports it
  s.torchTrack = null;
  if (rear) {
    const vt = s.currentStream.getVideoTracks()[0];
    if (vt && typeof vt.getCapabilities === 'function') {
      const caps = vt.getCapabilities();
      if (caps.torch) s.torchTrack = vt;
    }
  }

  // Wait for video metadata then play
  await new Promise((res, rej) => {
    s.video.onloadedmetadata = async () => {
      try { await s.video.play(); res(); } catch (e) { rej(e); }
    };
    s.video.onerror = rej;
  });

  // One animation frame so dimensions are finalised
  await new Promise(r => requestAnimationFrame(r));

  syncSizes();
  s.statusEl.textContent = 'Scanning...';
  document.body.classList.add('scanning');
  startOCRLoop(); // defined in ocr.js
}

// ── Sync canvas + wrapper sizes to video + screen ──────────
// Called on start, each OCR cycle, and on orientation change.
function syncSizes() {
  const s  = window.W;
  const vw = s.video.videoWidth  || 640;
  const vh = s.video.videoHeight || 480;
  const dw = s.wrapper.offsetWidth;

  let dh = Math.round(dw * vh / vw);

  // Cap video height in portrait so buttons are never pushed off-screen.
  // 42 % of viewport height in portrait, 72 % in landscape.
  const isPortrait = window.innerHeight > window.innerWidth;
  const maxH = isPortrait
    ? Math.floor(window.innerHeight * 0.42)
    : Math.floor(window.innerHeight * 0.72);

  if (dh > maxH) dh = maxH;

  s.wrapper.style.height = dh + 'px';
  s.video.style.height   = dh + 'px';
  s.overlay.width  = dw;
  s.overlay.height = dh;
  s.canvas.width   = vw;
  s.canvas.height  = vh;
}

// ── Flip between front and rear camera ─────────────────────
function switchCamera() {
  const s = window.W;
  s.usingRear  = !s.usingRear;
  s.torchOn    = false;
  s.selectedBox = null;
  document.getElementById('btn-torch').classList.remove('active');
  startCamera(s.usingRear);
}

// ── Toggle torch / flashlight ───────────────────────────────
async function toggleTorch() {
  const s = window.W;
  if (!s.torchTrack) {
    s.statusEl.textContent = 'Torch not supported on this device.';
    return;
  }
  s.torchOn = !s.torchOn;
  try {
    await s.torchTrack.applyConstraints({ advanced: [{ torch: s.torchOn }] });
    document.getElementById('btn-torch').classList.toggle('active', s.torchOn);
  } catch (e) {
    s.statusEl.textContent = 'Could not toggle torch.';
  }
}

// ── Pause / resume scan loop ────────────────────────────────
function togglePause() {
  const s   = window.W;
  s.paused  = !s.paused;
  const btn = document.getElementById('btn-pause');
  btn.textContent = s.paused ? '▶ Resume' : '⏸ Pause';

  if (!s.paused) {
    s.boxes = [];
    s.statusEl.textContent = 'Scanning...';
    s.hintEl.textContent   = s.selectedBox
      ? `Looking for "${s.selectedBox.text}"...`
      : 'Tap a bounding box to lock a value';
    document.body.classList.add('scanning');
  } else {
    s.statusEl.textContent = 'Paused.';
    document.body.classList.remove('scanning');
  }
}

// ── Reflow on resize / orientation change ───────────────────
function onLayoutChange() {
  setTimeout(() => {
    syncSizes();
    redrawBoxes(); // defined in ocr.js
  }, 120);
}

window.addEventListener('resize',            onLayoutChange);
window.addEventListener('orientationchange', onLayoutChange);
