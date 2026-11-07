/* Personal desk notes live outside main so dashboard renders never interrupt editing. */
(() => {
  const key = 'concierge-desk-notes-v1';
  const layer = document.getElementById('sticky-notes');
  const stack = document.getElementById('sticky-stack');
  const status = document.getElementById('sticky-status');
  let notes = [];
  let front = 0;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) notes = saved.filter(n => n && typeof n.id === 'string' && typeof n.text === 'string' && Number.isFinite(n.x) && Number.isFinite(n.y)).slice(0, 100);
  } catch { /* A fresh stack remains usable if storage is unavailable. */ }

  function save() {
    try { localStorage.setItem(key, JSON.stringify(notes)); }
    catch { status.textContent = 'Notes cannot be saved in this browser. Keep this page open to retain them.'; }
  }
  function position(note, element) {
    note.width = Math.min(Math.max(180, Number.isFinite(note.width) ? note.width : 260), Math.max(0, window.innerWidth - 16));
    note.height = Math.min(Math.max(140, Number.isFinite(note.height) ? note.height : 250), Math.max(0, window.innerHeight - 16));
    element.style.width = `${note.width}px`;
    element.style.height = `${note.height}px`;
    note.x = Math.max(0, Math.min(note.x, window.innerWidth - element.offsetWidth));
    note.y = Math.max(0, Math.min(note.y, window.innerHeight - element.offsetHeight));
    element.style.left = `${note.x}px`;
    element.style.top = `${note.y}px`;
  }
  function mount(note) {
    const element = document.createElement('section');
    element.className = 'sticky-note';
    element.setAttribute('aria-label', 'Personal sticky note');
    element.innerHTML = `<div class="sticky-toolbar"><button type="button" class="sticky-grip" aria-label="Move note. Drag or use arrow keys; hold Shift for larger steps."></button><button type="button" class="sticky-delete" aria-label="Delete note"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15"/></svg></button></div><textarea aria-label="Note text" placeholder="Write a note…" spellcheck="true"></textarea><button type="button" class="sticky-resize" aria-label="Resize note. Drag or use arrow keys; hold Shift for larger steps." title="Resize note"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="m7 15 8-8M12 15l3-3"/></svg></button>`;
    layer.append(element);
    const field = element.querySelector('textarea');
    const grip = element.querySelector('.sticky-grip');
    field.value = note.text;
    const raise = () => { element.style.zIndex = String(++front); };
    element.addEventListener('pointerdown', raise);
    element.addEventListener('focusin', raise);
    field.addEventListener('input', () => { note.text = field.value; save(); });
    element.querySelector('.sticky-delete').addEventListener('click', () => {
      notes = notes.filter(n => n !== note);
      element.remove(); save(); stack.focus();
      status.textContent = 'Note deleted.';
    });
    let drag = null;
    grip.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX - note.x, y: e.clientY - note.y };
      grip.setPointerCapture(e.pointerId);
      element.classList.add('is-dragging');
    });
    grip.addEventListener('pointermove', e => {
      if (!drag || drag.id !== e.pointerId) return;
      note.x = e.clientX - drag.x; note.y = e.clientY - drag.y;
      position(note, element);
    });
    const stop = () => { if (!drag) return; drag = null; element.classList.remove('is-dragging'); save(); };
    grip.addEventListener('pointerup', stop);
    grip.addEventListener('pointercancel', stop);
    grip.addEventListener('lostpointercapture', stop);
    grip.addEventListener('keydown', e => {
      const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!delta) return;
      e.preventDefault();
      note.x += delta[0] * (e.shiftKey ? 40 : 10);
      note.y += delta[1] * (e.shiftKey ? 40 : 10);
      position(note, element); save();
    });
    const resize = element.querySelector('.sticky-resize');
    let sizing = null;
    resize.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      sizing = { id: e.pointerId, x: e.clientX, y: e.clientY, width: note.width, height: note.height, left: note.x, top: note.y };
      resize.setPointerCapture(e.pointerId);
    });
    const applySize = (width, height) => {
      note.width = Math.max(180, Math.min(width, window.innerWidth - note.x));
      note.height = Math.max(140, Math.min(height, window.innerHeight - note.y));
      position(note, element);
    };
    resize.addEventListener('pointermove', e => {
      if (!sizing || sizing.id !== e.pointerId) return;
      const right = sizing.left + sizing.width;
      const bottom = sizing.top + sizing.height;
      note.x = Math.max(0, Math.min(sizing.left + e.clientX - sizing.x, right - 180));
      note.y = Math.max(0, Math.min(sizing.top + e.clientY - sizing.y, bottom - 140));
      note.width = right - note.x;
      note.height = bottom - note.y;
      position(note, element);
    });
    const stopSizing = () => { if (!sizing) return; sizing = null; save(); };
    resize.addEventListener('pointerup', stopSizing);
    resize.addEventListener('pointercancel', stopSizing);
    resize.addEventListener('lostpointercapture', stopSizing);
    resize.addEventListener('keydown', e => {
      const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!delta) return;
      e.preventDefault();
      const step = e.shiftKey ? 40 : 10;
      applySize(note.width + delta[0] * step, note.height + delta[1] * step);
      save();
    });
    position(note, element); raise();
    return field;
  }
  notes.forEach(mount);
  stack.addEventListener('click', () => {
    const offset = (notes.length % 6) * 24;
    const note = { id: crypto.randomUUID(), text: '', x: window.innerWidth - 310 - offset, y: 150 + offset };
    notes.push(note); mount(note).focus(); save();
    status.textContent = 'Note added. Drag its header to move it or its top-left corner to resize. Notes save on this browser.';
  });
  window.addEventListener('resize', () => {
    [...layer.children].forEach((element, i) => position(notes[i], element));
    save();
  });
})();
