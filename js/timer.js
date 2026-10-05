// =========================================================
// ANCHOR & FLOW — EXECUTIVE DESKTOP TIMER+ & ROUTINES ENGINE
// 100% Robust, Error-Free, Local-First Architecture
// =========================================================

// --- 1. DEFAULT DATA & STORAGE KEYS ---
const STORAGE_KEY_TIMERS = 'anchor_flow_timers';
const STORAGE_KEY_ACTIVE_ROUTINE = 'anchor_flow_active_routine';
const STORAGE_KEY_FOLDERS = 'anchor_flow_timer_folders';

const DEFAULT_FOLDERS = [
  { id: 'all', name: 'All Timers', system: true, icon: '⏱️' },
  { id: 'work', name: 'Work & Focus', icon: '📁' },
  { id: 'health', name: 'Health & Care', icon: '🧴' },
  { id: 'workout', name: 'Workouts & HIIT', icon: '⚡' },
  { id: 'routines', name: 'Daily Routines', icon: '🔄' }
];

const DEFAULT_TIMERS = [
  {
    id: 't-1',
    title: 'Focus Sprint',
    type: 'timer',
    folder: 'work',
    totalSeconds: 15 * 60,
    notes: 'Standard 15-minute execution sprint',
    steps: [{ title: 'Focus Sprint', duration: 15 * 60, notes: 'Single-task focus' }]
  },
  {
    id: 't-2',
    title: 'Harvard Deep Work',
    type: 'timer',
    folder: 'work',
    totalSeconds: 45 * 60,
    notes: '45-minute deep focus block with zero distraction',
    steps: [{ title: 'Harvard Deep Work', duration: 45 * 60, notes: 'Deep work sprint' }]
  },
  {
    id: 't-3',
    title: 'Eye drops (Glaucoma Care)',
    icon: '🧴',
    type: 'timer',
    folder: 'health',
    totalSeconds: 90 * 60, // 1:30:00+
    notes: 'Primary prescribed eye drops for glaucoma care',
    steps: [{ title: 'Eye drops (Glaucoma Care)', duration: 90 * 60, notes: 'Rest eyes and apply drops' }]
  },
  {
    id: 't-4',
    title: 'Secondary Eye Drops',
    icon: '🧴',
    type: 'timer',
    folder: 'health',
    totalSeconds: 75 * 60, // 1:15:00
    notes: 'Secondary hydration dose for vision protection',
    steps: [{ title: 'Secondary Eye Drops', duration: 75 * 60, notes: 'Secondary hydration dose' }]
  },
  {
    id: 't-5',
    title: '30 min Seq Tabata exercise',
    icon: '🔄',
    type: 'routine',
    folder: 'workout',
    totalSeconds: 30 * 60,
    notes: 'Warmup 5m, 8 Tabata rounds (20s work / 10s rest), cooldown 5m',
    steps: [
      { title: 'Warmup & Mobility', duration: 300, notes: 'Joint rotations and light jumping jacks' },
      { title: 'Tabata Round 1 (High Knees)', duration: 20, notes: 'Maximum explosive effort' },
      { title: 'Rest Interval', duration: 10, notes: 'Deep recovery breath' },
      { title: 'Tabata Round 2 (Burpees)', duration: 20, notes: 'Pace your reps steadily' },
      { title: 'Rest Interval', duration: 10, notes: 'Sip water' },
      { title: 'Tabata Round 3 (Mountain Climbers)', duration: 20, notes: 'Drive knees to chest' },
      { title: 'Rest Interval', duration: 10, notes: 'Down-regulate heart rate' },
      { title: 'Cooldown & Stretch', duration: 300, notes: 'Hamstrings, hip flexors, child pose' }
    ]
  },
  {
    id: 't-6',
    title: 'Pomodoro Focus Block',
    icon: '🍅',
    type: 'routine',
    folder: 'work',
    totalSeconds: 30 * 60,
    notes: '25m deep work followed by 5m restorative break',
    steps: [
      { title: 'Focus Sprint', duration: 1500, notes: 'Single-task with zero distraction' },
      { title: 'Restorative Break', duration: 300, notes: 'Stand up, hydrate, look into distance' }
    ]
  }
];

// --- 2. GLOBAL STATE ---
let timers = [];
let currentFilter = 'all';
let currentSegment = 'all'; // 'all' or 'active'
let isMuted = false;
let displayMonthDate = new Date();

// Active Timer Execution Engine State
let activeTimer = null;
let timerInterval = null;
let currentStepIndex = 0;
let secondsRemaining = 0;
let stepTotalSeconds = 0;
let isRunning = false;

// Stopwatch Specific State
let isStopwatch = false;
let stopwatchElapsed = 0;
let stopwatchLaps = [];

// Creator / Editor State
let currentCreatorMode = 'timer'; // 'timer', 'stopwatch', 'countdown', 'routine'
let editingTimerId = null;
let currentRoutineSteps = [
  { title: 'Work Interval', duration: 25 * 60, notes: 'Deep focused execution' },
  { title: 'Rest Interval', duration: 5 * 60, notes: 'Stand up, hydrate, and stretch' }
];

// --- 3. AUDIO CHIME SYNTHESIZER ---
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playChime(type = 'step') {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'step') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'done') {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + i * 0.15);
        g.gain.setValueAtTime(0.2, now + i * 0.15);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
        o.start(now + i * 0.15);
        o.stop(now + i * 0.15 + 0.8);
      });
    }
  } catch (e) {
    console.warn('Audio chime warning:', e);
  }
}

// --- 4. FORMATTING & TOAST HELPERS ---
function formatTime(totalSec) {
  if (isNaN(totalSec) || totalSec < 0) totalSec = 0;
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(msg) {
  const toast = document.getElementById('toastPill');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

// --- 5. STORAGE HELPERS ---
function getStoredFolders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch(e) {}
  return [...DEFAULT_FOLDERS];
}

function saveStoredFolders(folders) {
  try {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
  } catch(e) {}
}

function loadTimersFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY_TIMERS);
  if (stored) {
    try {
      timers = JSON.parse(stored);
    } catch (e) {
      timers = [...DEFAULT_TIMERS];
    }
  } else {
    timers = [...DEFAULT_TIMERS];
    saveTimersToStorage();
  }

  // Check if coming from AI Planner with a newly generated plan!
  const activeRoutineJson = localStorage.getItem(STORAGE_KEY_ACTIVE_ROUTINE);
  if (activeRoutineJson) {
    try {
      const incoming = JSON.parse(activeRoutineJson);
      if (incoming && incoming.id && !timers.some(t => t.id === incoming.id)) {
        timers.unshift(incoming);
        saveTimersToStorage();
        showToast('Loaded Harvard Routine from AI Planner!');
      }
    } catch (e) {}
  }
}

function saveTimersToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_TIMERS, JSON.stringify(timers));
  } catch(e) {}
}

// --- 6. FOLDERS & CATEGORIES MANAGEMENT ---
function renderFolderBar() {
  const sidebarContainer = document.getElementById('sidebarFoldersList');
  if (sidebarContainer) {
    const folders = getStoredFolders();
    sidebarContainer.innerHTML = folders.map(f => {
      const count = f.id === 'all' 
        ? timers.length 
        : timers.filter(t => t.folder === f.id).length;
      const isActive = f.id === currentFilter;
      return `
        <div class="sidebar-folder-row ${isActive ? 'active' : ''}" data-folder="${f.id}">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>${f.icon || '📁'}</span>
            <span>${escapeHtml(f.name)}</span>
          </div>
          <span class="folder-count-badge">${count}</span>
        </div>
      `;
    }).join('');

    sidebarContainer.querySelectorAll('.sidebar-folder-row').forEach(row => {
      row.addEventListener('click', () => {
        sidebarContainer.querySelectorAll('.sidebar-folder-row').forEach(r => r.classList.remove('active'));
        row.classList.add('active');
        currentFilter = row.getAttribute('data-folder');
        renderTimersList();
      });
    });
  }

  const sidebarMgmtBtn = document.getElementById('sidebarManageFoldersBtn');
  if (sidebarMgmtBtn) {
    sidebarMgmtBtn.onclick = openManageFoldersModal;
  }
}

function renderFolderSelectOptions() {
  const sel = document.getElementById('customFolderSelect');
  if (!sel) return;
  const folders = getStoredFolders().filter(f => f.id !== 'all');
  const curVal = sel.value;
  sel.innerHTML = folders.map(f => `<option value="${f.id}">${f.icon ? f.icon + ' ' : ''}${escapeHtml(f.name)}</option>`).join('');
  if (curVal && folders.some(f => f.id === curVal)) {
    sel.value = curVal;
  }
}

function openManageFoldersModal() {
  renderFoldersManagementModal();
  const modal = document.getElementById('manageFoldersModal');
  if (modal) modal.classList.add('open');
}

function closeManageFoldersModal() {
  const modal = document.getElementById('manageFoldersModal');
  if (modal) modal.classList.remove('open');
}

function renderFoldersManagementModal() {
  const list = document.getElementById('foldersManagementList');
  if (!list) return;
  const folders = getStoredFolders();
  let html = '';
  folders.forEach(f => {
    const count = f.id === 'all' 
      ? timers.length 
      : timers.filter(t => t.folder === f.id).length;
    
    const isSystem = !!f.system;
    html += `
      <div class="folder-mgmt-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.2rem;">${f.icon || '📁'}</span>
          <div>
            <strong style="font-size: 0.92rem; color: var(--text-main);">${escapeHtml(f.name)}</strong>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${count} timer(s)</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          ${!isSystem ? `
            <button class="btn-cancel" onclick="renameFolder('${f.id}')" style="padding: 4px 10px; font-size: 0.78rem;">Rename</button>
            <button class="btn-cancel" onclick="deleteFolder('${f.id}')" style="padding: 4px 8px; font-size: 0.78rem; color: #ef4444;" title="Delete Folder">🗑️</button>
          ` : '<span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">System</span>'}
        </div>
      </div>
    `;
  });
  list.innerHTML = html;
}

function renameFolder(folderId) {
  if (typeof window !== 'undefined') window.renameFolder = renameFolder;
  const folders = getStoredFolders();
  const target = folders.find(f => f.id === folderId);
  if (!target) return;
  const newName = prompt('Enter new folder name:', target.name);
  if (newName && newName.trim()) {
    target.name = newName.trim();
    saveStoredFolders(folders);
    renderFolderBar();
    renderFolderSelectOptions();
    renderFoldersManagementModal();
    renderTimersList();
    showToast('Folder renamed');
  }
};

function deleteFolder(folderId) {
  if (typeof window !== 'undefined') window.deleteFolder = deleteFolder;
  const folders = getStoredFolders();
  const target = folders.find(f => f.id === folderId);
  if (!target) return;
  if (!confirm(`Delete folder "${target.name}"? Any timers inside will be moved to Work & Focus.`)) return;

  timers.forEach(t => {
    if (t.folder === folderId) t.folder = 'work';
  });
  saveTimersToStorage();

  const updated = folders.filter(f => f.id !== folderId);
  saveStoredFolders(updated);

  if (currentFilter === folderId) currentFilter = 'all';

  renderFolderBar();
  renderFolderSelectOptions();
  renderFoldersManagementModal();
  renderTimersList();
  showToast(`Deleted folder "${target.name}"`);
};

// --- 7. DYNAMIC WEEKDAYS STRIP & MONTH NAVIGATION ---
function renderWeekdaysStrip(baseDate = displayMonthDate) {
  const strip = document.getElementById('weekdaysStrip');
  if (!strip) return;

  const profile = (typeof getStoredProfile === 'function') ? getStoredProfile() : {};
  const events = profile.calendarEvents || [];

  // Find Monday of the current week for baseDate
  const day = baseDate.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + diff);

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const isCurrentDay = (dStr === todayStr);

    const dayEvents = events.filter(e => e.dateStr === dStr && e.sourceType !== 'routine');
    const dayMins = dayEvents.reduce((acc, ev) => acc + (ev.duration || 0), 0);
    
    let hoursDisplay = '--';
    if (dayMins > 0) {
      const h = Math.floor(dayMins / 60);
      const m = dayMins % 60;
      hoursDisplay = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    html += `
      <div class="weekday-col ${isCurrentDay ? 'today' : ''}" data-date="${dStr}">
        <span class="weekday-name">${dayNames[i]} ${d.getDate()}</span>
        <span class="weekday-hours">${hoursDisplay}</span>
      </div>
    `;
  }
  strip.innerHTML = html;

  strip.querySelectorAll('.weekday-col').forEach(col => {
    col.addEventListener('click', () => {
      strip.querySelectorAll('.weekday-col').forEach(c => c.classList.remove('today'));
      col.classList.add('today');
      const dStr = col.getAttribute('data-date');
      const dObj = new Date(dStr + 'T00:00:00');
      showToast(`Schedule for ${dObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`);
    });
  });
}

function updateMonthHeader() {
  const monthTitleEl = document.getElementById('centerMonthTitle');
  if (monthTitleEl) {
    monthTitleEl.textContent = displayMonthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
}

// --- 8. RENDER TIMERS LIST (Executive 3-Column Desktop Layout) ---
function renderTimersList() {
  const container = document.getElementById('timersList');
  if (!container) return;

  const searchInp = document.getElementById('headerSearchInput');
  const searchVal = searchInp ? searchInp.value.trim().toLowerCase() : '';

  let filtered = timers.filter(t => {
    if (searchVal) {
      const matchTitle = (t.title || '').toLowerCase().includes(searchVal);
      const matchNotes = (t.notes || '').toLowerCase().includes(searchVal);
      const matchFolder = (t.folder || '').toLowerCase().includes(searchVal);
      const matchSteps = (t.steps || []).some(s => (s.title || '').toLowerCase().includes(searchVal));
      if (!matchTitle && !matchNotes && !matchFolder && !matchSteps) return false;
    }

    if (currentFilter !== 'all' && t.folder !== currentFilter) return false;

    if (currentSegment === 'active') {
      return activeTimer && activeTimer.id === t.id && isRunning;
    }
    return true;
  });

  const summaryBar = document.getElementById('centerTotalFocusSummary');
  if (summaryBar) {
    const totalDurationSec = filtered.reduce((acc, cur) => acc + (cur.totalSeconds || 0), 0);
    summaryBar.innerHTML = `Total Stored: <strong>${filtered.length} Timer${filtered.length === 1 ? '' : 's'}</strong> &bull; Total Duration: <strong>${formatTime(totalDurationSec)}</strong>`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; background: #ffffff; border: 1px dashed var(--border-color); border-radius: 14px; margin-top: 10px;">
        <div style="font-size: 2.5rem; margin-bottom: 8px;">⏱️</div>
        <strong style="font-size: 1.05rem; color: var(--text-main);">No timers in this view</strong>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
          ${searchVal ? `No results matching "${escapeHtml(searchVal)}". Clear search to view all.` : 'Click "+ Add New Timer or Routine" below to create your first executive timer.'}
        </p>
      </div>
    `;
    updateRightPanelAnalytics();
    return;
  }

  let html = '';
  filtered.forEach(t => {
    const isCurrentlyActive = activeTimer && activeTimer.id === t.id && isRunning;
    const icon = t.icon || (t.type === 'routine' ? '🗂' : t.type === 'stopwatch' ? '⏲' : '⏱');
    
    let typeLabel = 'Target Timer';
    let typeClass = 'timer-tag';
    if (t.type === 'routine') {
      typeLabel = `Routine (${t.steps ? t.steps.length : 1} Steps)`;
      typeClass = 'timer-tag routine';
    } else if (t.type === 'stopwatch') {
      typeLabel = 'Stopwatch (Count-Up)';
      typeClass = 'timer-tag stopwatch';
    } else if (t.type === 'countdown') {
      typeLabel = 'Target Date Countdown';
    }

    const activeTag = isCurrentlyActive 
      ? `<span class="timer-tag" style="background:#10b981; color:#fff; font-weight:700;">● Running Now</span>` 
      : '';

    const playText = isCurrentlyActive ? '⏸ Pause' : '▶ Start';

    html += `
      <div class="timer-card-desktop ${isCurrentlyActive ? 'active-glow' : ''}" data-id="${t.id}">
        <div class="timer-card-left">
          <div class="timer-card-time">${formatTime(t.totalSeconds)}</div>
          <div class="timer-card-info">
            <div class="timer-card-title">
              <span style="margin-right: 4px;">${icon}</span>
              ${escapeHtml(t.title)}
            </div>
            <div class="timer-card-tags">
              <span class="${typeClass}">${typeLabel}</span>
              <span class="timer-tag">📁 ${escapeHtml(t.folder || 'work')}</span>
              ${t.repeats && t.repeats > 1 ? `<span class="timer-tag">🔁 ${t.repeats}x</span>` : ''}
              ${activeTag}
            </div>
            ${t.notes ? `<div class="timer-card-notes">${escapeHtml(t.notes)}</div>` : ''}
          </div>
        </div>

        <div class="timer-card-actions">
          <button class="btn-play-pill ${isCurrentlyActive ? 'running' : ''}" data-id="${t.id}" title="${isCurrentlyActive ? 'Pause' : 'Start'} Timer" type="button">
            ${playText}
          </button>
          <button class="btn-card-icon edit timer-edit-btn" data-id="${t.id}" title="Edit Timer / Routine" type="button">
            ✏️
          </button>
          <button class="btn-card-icon delete timer-delete-btn" data-id="${t.id}" title="Delete Timer" type="button">
            🗑️
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Attach Delete handlers
  container.querySelectorAll('.timer-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this timer from your stored library?')) {
        timers = timers.filter(t => t.id !== id);
        saveTimersToStorage();
        renderTimersList();
        renderFolderBar();
        showToast('Deleted timer from library');
      }
    });
  });

  // Attach Edit handlers
  container.querySelectorAll('.timer-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const t = timers.find(item => item.id === id);
      if (t) openCustomModal(t);
    });
  });

  // Attach Play/Pause handlers
  container.querySelectorAll('.btn-play-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      handlePlayTimerClick(id);
    });
  });

  // Clicking card row activates timer (unless clicking a button)
  container.querySelectorAll('.timer-card-desktop').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const id = card.getAttribute('data-id');
      handlePlayTimerClick(id);
    });
  });

  updateRightPanelAnalytics();
}

function updateRightPanelAnalytics() {
  const breakdownContainer = document.getElementById('categoryBreakdownList');
  if (!breakdownContainer) return;

  const folders = getStoredFolders().filter(f => f.id !== 'all');
  let html = '';
  const colors = ['#8b5cf6', '#ec4899', '#0284c7', '#10b981', '#f59e0b', '#3b82f6'];

  folders.forEach((f, idx) => {
    const folderTimers = timers.filter(t => t.folder === f.id);
    const sec = folderTimers.reduce((sum, t) => sum + (t.totalSeconds || 0), 0);
    const col = colors[idx % colors.length];
    html += `
      <div class="breakdown-row">
        <span class="breakdown-label"><span class="dot-color" style="background:${col};"></span> ${escapeHtml(f.name)}</span>
        <span class="breakdown-val">${formatTime(sec)}</span>
      </div>
    `;
  });
  breakdownContainer.innerHTML = html;
}

// --- 9. TIMER EXECUTION ENGINE ---
function handlePlayTimerClick(id) {
  if (activeTimer && activeTimer.id === id) {
    if (isRunning) {
      pauseActiveTimer();
    } else {
      resumeActiveTimer();
    }
  } else {
    startTimer(id);
  }
  renderTimersList();
}

function startTimer(id) {
  const target = timers.find(t => t.id === id);
  if (!target) return;

  clearInterval(timerInterval);
  activeTimer = target;
  currentStepIndex = 0;
  stopwatchLaps = [];

  isStopwatch = (target.type === 'stopwatch');

  if (isStopwatch) {
    stopwatchElapsed = target.elapsed || 0;
    secondsRemaining = 0;
    stepTotalSeconds = 0;
  } else if (target.type === 'countdown' && target.targetDate) {
    const targetMs = new Date(target.targetDate).getTime();
    const diffSec = Math.max(0, Math.round((targetMs - Date.now()) / 1000));
    secondsRemaining = diffSec;
    stepTotalSeconds = diffSec;
  } else {
    const firstStep = (activeTimer.steps && activeTimer.steps.length > 0)
      ? activeTimer.steps[0]
      : { title: activeTimer.title, duration: activeTimer.totalSeconds, notes: activeTimer.notes };

    secondsRemaining = firstStep.duration;
    stepTotalSeconds = firstStep.duration;
  }

  isRunning = true;
  playChime('step');
  runTimerLoop();
  updatePlayerUI();
  renderTimersList();
  showToast(`▶ Started "${target.title}"`);
}

function pauseActiveTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  updatePlayerUI();
  renderTimersList();
  showToast('❚❚ Paused timer');
}

function resumeActiveTimer() {
  if (!activeTimer) return;
  isRunning = true;
  runTimerLoop();
  updatePlayerUI();
  renderTimersList();
  showToast('▶ Resumed timer');
}

function runTimerLoop() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isRunning) return;

    if (isStopwatch) {
      stopwatchElapsed++;
      activeTimer.elapsed = stopwatchElapsed;
      updatePlayerUI();
    } else if (activeTimer && activeTimer.type === 'countdown' && activeTimer.targetDate) {
      const targetMs = new Date(activeTimer.targetDate).getTime();
      const diffSec = Math.round((targetMs - Date.now()) / 1000);
      secondsRemaining = diffSec;
      updatePlayerUI();
      if (diffSec <= 0 && diffSec > -2) {
        playChime('done');
      }
    } else {
      if (secondsRemaining > 0) {
        secondsRemaining--;
        updatePlayerUI();
      } else {
        advanceToNextStep();
      }
    }
  }, 1000);
}

function advanceToNextStep() {
  if (!activeTimer || !activeTimer.steps) {
    completeTimer();
    return;
  }

  if (currentStepIndex + 1 < activeTimer.steps.length) {
    currentStepIndex++;
    const nextStep = activeTimer.steps[currentStepIndex];
    secondsRemaining = nextStep.duration;
    stepTotalSeconds = nextStep.duration;
    playChime('step');
    showToast(`Next: ${nextStep.title}`);
    updatePlayerUI();
  } else {
    if (activeTimer.repeats && activeTimer.repeats > 1) {
      activeTimer.currentRepeat = (activeTimer.currentRepeat || 1) + 1;
      if (activeTimer.currentRepeat <= activeTimer.repeats) {
        currentStepIndex = 0;
        const nextStep = activeTimer.steps[0];
        secondsRemaining = nextStep.duration;
        stepTotalSeconds = nextStep.duration;
        playChime('step');
        showToast(`Repeat ${activeTimer.currentRepeat} of ${activeTimer.repeats}!`);
        updatePlayerUI();
        return;
      }
    }
    completeTimer();
  }
}

function completeTimer(finishedEarly = false) {
  if (!activeTimer) return;
  isRunning = false;
  clearInterval(timerInterval);
  playChime('done');

  // Calculate actual elapsed duration vs planned
  const plannedSec = activeTimer.totalSeconds || 60;
  let actualSec = plannedSec;
  if (finishedEarly) {
    actualSec = Math.max(60, plannedSec - secondsRemaining);
  } else if (stepTotalSeconds > plannedSec) {
    actualSec = stepTotalSeconds;
  }

  // Record session in Flow Guru execution history
  let rec = null;
  if (typeof recordExecutionSession === 'function') {
    rec = recordExecutionSession({
      title: activeTimer.title,
      category: activeTimer.folder || 'work',
      plannedSeconds: plannedSec,
      actualSeconds: actualSec,
      notes: finishedEarly ? 'Completed early via Done Early action' : 'Completed scheduled duration'
    });
  }

  secondsRemaining = 0;
  updatePlayerUI();
  renderTimersList();

  if (rec && rec.insight) {
    showToast(rec.insight, 4000);
  } else {
    showToast(`🎉 "${activeTimer.title}" Completed!`);
  }
}

function finishTaskEarly() {
  if (!activeTimer || isStopwatch) {
    showToast('Start a timer first to track adherence!');
    return;
  }
  completeTimer(true);
}
if (typeof window !== 'undefined') {
  window.finishTaskEarly = finishTaskEarly;
}

function openInterstitialModal() {
  const m = document.getElementById('interstitialResetModal');
  if (m) m.classList.add('open');
}
if (typeof window !== 'undefined') {
  window.openInterstitialModal = openInterstitialModal;
}

function completeInterstitialReset() {
  const m = document.getElementById('interstitialResetModal');
  if (m) m.classList.remove('open');
  showToast('🧘 Attention residue dissolved. Ready for peak flow!');
  if (timers.length > 0) {
    startTimer(timers[0].id);
  }
}
if (typeof window !== 'undefined') {
  window.completeInterstitialReset = completeInterstitialReset;
}

function adjustActiveTime(deltaSeconds) {
  // Also bind to window
  if (typeof window !== 'undefined') window.adjustActiveTime = adjustActiveTime;
  if (!activeTimer && timers.length > 0) {
    activeTimer = timers[0];
    secondsRemaining = activeTimer.totalSeconds;
    stepTotalSeconds = activeTimer.totalSeconds;
  }
  if (!activeTimer || isStopwatch) return;
  secondsRemaining = Math.max(0, secondsRemaining + deltaSeconds);
  if (stepTotalSeconds < secondsRemaining) stepTotalSeconds = secondsRemaining;
  updatePlayerUI();
  showToast(`${deltaSeconds > 0 ? '+' : ''}${Math.round(deltaSeconds/60)}m applied`);
};

// --- 10. UI UPDATER & PLAYER SYNCHRONIZATION ---
function openActivePlayer(id) {
  if (!activeTimer || activeTimer.id !== id) {
    startTimer(id);
  }
  const modal = document.getElementById('activePlayerScreen');
  if (modal) modal.classList.add('open');
  updatePlayerUI();
}

function closeActivePlayer() {
  const modal = document.getElementById('activePlayerScreen');
  if (modal) modal.classList.remove('open');
  renderTimersList();
}

function updatePlayerUI() {
  if (!activeTimer) return;

  const headerTitle = document.getElementById('playerRoutineTitle') || document.getElementById('playerHeaderRoutineName');
  const stepTag = document.getElementById('playerStepTag');
  const taskTitle = document.getElementById('playerTaskTitle');
  const notesBox = document.getElementById('playerTaskNotes');
  const notesText = document.getElementById('playerTaskNotesText');
  const digits = document.getElementById('playerDigits');
  const playBtn = document.getElementById('playerPlayPauseBtn');
  const ringFill = document.getElementById('playerRingFill');

  const adjustRow = document.getElementById('playerAdjustRow');
  const lapBtn = document.getElementById('playerLapBtn');
  const lapsBox = document.getElementById('playerLapsBox');
  const lapsList = document.getElementById('playerLapsList');
  const targetDesc = document.getElementById('playerTargetDateDesc');

  if (headerTitle) headerTitle.textContent = activeTimer.title || 'Timer';

  if (isStopwatch) {
    if (digits) digits.textContent = formatTime(stopwatchElapsed);
    if (stepTag) stepTag.textContent = 'Stopwatch (Count-Up)';
    if (taskTitle) taskTitle.textContent = activeTimer.title;
    if (adjustRow) adjustRow.style.display = 'none';
    if (lapBtn) lapBtn.style.display = 'inline-flex';
    if (lapsBox) lapsBox.style.display = stopwatchLaps.length > 0 ? 'block' : 'none';
    if (targetDesc) targetDesc.style.display = 'none';
  } else if (activeTimer.type === 'countdown' && activeTimer.targetDate) {
    const targetMs = new Date(activeTimer.targetDate).getTime();
    const diff = Math.round((targetMs - Date.now()) / 1000);
    if (diff >= 0) {
      const d = Math.floor(diff / 86400);
      const rem = diff % 86400;
      if (digits) digits.textContent = (d > 0 ? `${d}d ` : '') + formatTime(rem);
      if (stepTag) stepTag.textContent = 'Target Date Countdown';
    } else {
      if (digits) digits.textContent = '+' + formatTime(Math.abs(diff));
      if (stepTag) stepTag.textContent = 'Count Up (Past Target)';
    }
    if (taskTitle) taskTitle.textContent = activeTimer.title;
    if (adjustRow) adjustRow.style.display = 'none';
    if (lapBtn) lapBtn.style.display = 'none';
    if (lapsBox) lapsBox.style.display = 'none';
    if (targetDesc) {
      targetDesc.style.display = 'block';
      targetDesc.textContent = `Target: ${new Date(activeTimer.targetDate).toLocaleString()}`;
    }
  } else {
    if (digits) digits.textContent = formatTime(secondsRemaining);
    const steps = (activeTimer.steps && activeTimer.steps.length > 0) ? activeTimer.steps : [{ title: activeTimer.title, duration: activeTimer.totalSeconds, notes: activeTimer.notes }];
    const currentStep = steps[currentStepIndex] || steps[0];

    if (stepTag) stepTag.textContent = steps.length > 1 ? `Step ${currentStepIndex + 1} of ${steps.length}` : (activeTimer.repeats > 1 ? `Repeat ${(activeTimer.currentRepeat || 1)} of ${activeTimer.repeats}` : `Single Timer`);
    if (taskTitle) taskTitle.textContent = currentStep.title || activeTimer.title;

    if (adjustRow) adjustRow.style.display = 'flex';
    if (lapBtn) lapBtn.style.display = 'none';
    if (lapsBox) lapsBox.style.display = 'none';
    if (targetDesc) targetDesc.style.display = 'none';
  }

  const steps = (activeTimer.steps && activeTimer.steps.length > 0) ? activeTimer.steps : [{ title: activeTimer.title, duration: activeTimer.totalSeconds, notes: activeTimer.notes }];
  const currentStep = steps[currentStepIndex] || steps[0];

  if (currentStep && currentStep.notes && currentStep.notes.trim()) {
    if (notesText) notesText.textContent = currentStep.notes.trim();
    if (notesBox) notesBox.style.display = 'block';
  } else {
    if (notesBox) notesBox.style.display = 'none';
  }

  if (playBtn) {
    playBtn.textContent = isRunning ? '⏸' : '▶';
    if (isRunning) playBtn.classList.remove('paused');
    else playBtn.classList.add('paused');
  }

  // Progress Ring calculation for Fullscreen Player
  const circumference = 2 * Math.PI * 130; // ~816.8
  if (ringFill) {
    if (!isStopwatch && stepTotalSeconds > 0) {
      const fraction = Math.max(0, Math.min(1, secondsRemaining / stepTotalSeconds));
      const offset = circumference * (1 - fraction);
      ringFill.style.strokeDashoffset = offset;
    } else {
      ringFill.style.strokeDashoffset = 0;
    }
  }

  // Synchronize Right Column Focus Insight Widget
  const wDigits = document.getElementById('widgetDigits');
  const wSubLabel = document.getElementById('widgetSubLabel');
  const wStepTag = document.getElementById('widgetStepTag');
  const wRingFill = document.getElementById('widgetRingFill');
  const wPlayBtn = document.getElementById('widgetPlayPauseBtn');
  const wLapBtn = document.getElementById('widgetLapBtn');

  if (wDigits) {
    if (isStopwatch) {
      wDigits.textContent = formatTime(stopwatchElapsed);
      if (wSubLabel) wSubLabel.textContent = activeTimer.title;
      if (wStepTag) wStepTag.textContent = `${isRunning ? '● Running' : '❚❚ Paused'} (Stopwatch)`;
      if (wLapBtn) wLapBtn.style.display = 'inline-flex';
    } else if (activeTimer.type === 'countdown' && activeTimer.targetDate) {
      const targetMs = new Date(activeTimer.targetDate).getTime();
      const diff = Math.round((targetMs - Date.now()) / 1000);
      wDigits.textContent = (diff >= 0 ? '' : '+') + formatTime(Math.abs(diff));
      if (wSubLabel) wSubLabel.textContent = activeTimer.title;
      if (wStepTag) wStepTag.textContent = diff >= 0 ? 'Target Countdown' : 'Past Target';
      if (wLapBtn) wLapBtn.style.display = 'none';
    } else {
      wDigits.textContent = formatTime(secondsRemaining);
      const steps = (activeTimer.steps && activeTimer.steps.length > 0) ? activeTimer.steps : [{ title: activeTimer.title, duration: activeTimer.totalSeconds }];
      const currentStep = steps[currentStepIndex] || steps[0];
      if (wSubLabel) wSubLabel.textContent = currentStep.title || activeTimer.title;
      if (wStepTag) wStepTag.textContent = `${isRunning ? '● Running' : '❚❚ Paused'} (${formatTime(stepTotalSeconds)})`;
      if (wLapBtn) wLapBtn.style.display = 'none';
    }
  }

  if (wPlayBtn) {
    wPlayBtn.textContent = isRunning ? '⏸' : '▶';
    if (isRunning) wPlayBtn.classList.remove('paused');
    else wPlayBtn.classList.add('paused');
  }

  if (wRingFill) {
    const wCircumference = 2 * Math.PI * 88; // r=88 -> ~552.92
    if (!isStopwatch && stepTotalSeconds > 0) {
      const wFrac = Math.max(0, Math.min(1, secondsRemaining / stepTotalSeconds));
      const wOffset = wCircumference * (1 - wFrac);
      wRingFill.style.strokeDashoffset = wOffset;
    } else {
      wRingFill.style.strokeDashoffset = 0;
    }
  }
}

// --- 11. "ADD TIMER" SHEET & CREATOR MODAL ---
function openAddSheet() {
  const sheet = document.getElementById('addTimerSheet');
  if (sheet) sheet.classList.add('open');
}

function closeAddSheet() {
  const sheet = document.getElementById('addTimerSheet');
  if (sheet) sheet.classList.remove('open');
}

function setCreatorMode(mode) {
  currentCreatorMode = mode;
  const typeInp = document.getElementById('customTypeInput');
  if (typeInp) typeInp.value = mode;

  const titleEl = document.getElementById('customModalTitle');
  const labelPrompt = document.getElementById('customLabelPrompt');
  const labelInput = document.getElementById('customLabelInput');
  const folderSelect = document.getElementById('customFolderSelect');

  const timerFields = document.getElementById('timerSpecificFields');
  const swFields = document.getElementById('stopwatchSpecificFields');
  const cdFields = document.getElementById('countdownSpecificFields');
  const rtFields = document.getElementById('routineSpecificFields');

  if (timerFields) timerFields.style.display = (mode === 'timer') ? 'block' : 'none';
  if (swFields) swFields.style.display = (mode === 'stopwatch') ? 'block' : 'none';
  if (cdFields) cdFields.style.display = (mode === 'countdown') ? 'block' : 'none';
  if (rtFields) rtFields.style.display = (mode === 'routine') ? 'block' : 'none';

  if (!editingTimerId) {
    if (mode === 'timer') {
      if (titleEl) titleEl.textContent = 'New Countdown Timer';
      if (labelPrompt) labelPrompt.textContent = 'Timer Label / Title';
      if (labelInput) labelInput.value = 'Focus Session';
      if (folderSelect) folderSelect.value = 'work';
    } else if (mode === 'stopwatch') {
      if (titleEl) titleEl.textContent = 'New Stopwatch';
      if (labelPrompt) labelPrompt.textContent = 'Stopwatch Title';
      if (labelInput) labelInput.value = 'Work Sprint Stopwatch';
      if (folderSelect) folderSelect.value = 'work';
    } else if (mode === 'countdown') {
      if (titleEl) titleEl.textContent = 'New Target Date Countdown';
      if (labelPrompt) labelPrompt.textContent = 'Event / Target Name';
      if (labelInput) labelInput.value = 'Target Milestone';
      if (folderSelect) folderSelect.value = 'work';

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const isoLocal = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      const cdDateInp = document.getElementById('customTargetDateInput');
      if (cdDateInp) cdDateInp.value = isoLocal;
    } else if (mode === 'routine') {
      if (titleEl) titleEl.textContent = 'New Multi-Segment Routine';
      if (labelPrompt) labelPrompt.textContent = 'Routine Title';
      if (labelInput) labelInput.value = 'Custom Interval Routine';
      if (folderSelect) folderSelect.value = 'workout';
      renderRoutineStepsBuilder();
    }
  }

  const modal = document.getElementById('customTimerModal');
  if (modal) modal.classList.add('open');
}

function openCustomModal(timerToEdit = null) {
  const modal = document.getElementById('customTimerModal');
  if (!modal) return;

  const titleEl = document.getElementById('customModalTitle');
  const labelInput = document.getElementById('customLabelInput');
  const folderSelect = document.getElementById('customFolderSelect');
  const notesInput = document.getElementById('customNotesInput');
  const hrsInput = document.getElementById('customHoursInput');
  const minsInput = document.getElementById('customMinutesInput');
  const secsInput = document.getElementById('customSecondsInput');
  const repeatsSelect = document.getElementById('customRepeatsSelect');
  const targetDateInput = document.getElementById('customTargetDateInput');

  if (timerToEdit) {
    editingTimerId = timerToEdit.id;
    setCreatorMode(timerToEdit.type || 'timer');
    if (titleEl) titleEl.textContent = `Edit ${timerToEdit.type === 'routine' ? 'Routine' : 'Timer'}`;
    if (labelInput) labelInput.value = timerToEdit.title || '';
    if (folderSelect) folderSelect.value = timerToEdit.folder || 'work';
    if (notesInput) notesInput.value = timerToEdit.notes || '';

    if (timerToEdit.type === 'timer') {
      const total = timerToEdit.totalSeconds || 0;
      if (hrsInput) hrsInput.value = Math.floor(total / 3600);
      if (minsInput) minsInput.value = Math.floor((total % 3600) / 60);
      if (secsInput) secsInput.value = total % 60;
      if (repeatsSelect) repeatsSelect.value = timerToEdit.repeats || 1;
    } else if (timerToEdit.type === 'countdown' && timerToEdit.targetDate) {
      try {
        const dt = new Date(timerToEdit.targetDate);
        const iso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        if (targetDateInput) targetDateInput.value = iso;
      } catch(e) {}
    } else if (timerToEdit.type === 'routine') {
      currentRoutineSteps = (timerToEdit.steps && timerToEdit.steps.length > 0)
        ? timerToEdit.steps.map(s => ({ ...s }))
        : [{ title: 'Work', duration: 25 * 60, notes: '' }];
      renderRoutineStepsBuilder();
    }
  } else {
    editingTimerId = null;
    setCreatorMode('timer');
  }

  modal.classList.add('open');
}

function closeCustomModal() {
  const modal = document.getElementById('customTimerModal');
  if (modal) modal.classList.remove('open');
  editingTimerId = null;
}

function renderRoutineStepsBuilder() {
  const container = document.getElementById('routineStepsBuilderList');
  if (!container) return;

  let html = '';
  currentRoutineSteps.forEach((step, idx) => {
    const mins = Math.floor(step.duration / 60);
    const secs = step.duration % 60;
    html += `
      <div class="routine-step-item" data-idx="${idx}">
        <div class="routine-step-row-top">
          <span style="font-weight: 700; font-size: 0.82rem; color: var(--accent-blue);">Step ${idx + 1}</span>
          ${currentRoutineSteps.length > 1 ? `<button type="button" class="btn-delete-step" onclick="removeRoutineStep(${idx})" title="Remove Step">✕</button>` : ''}
        </div>
        <input class="form-control" type="text" placeholder="Step Name" value="${escapeHtml(step.title)}" onchange="updateRoutineStepTitle(${idx}, this.value)" style="margin-bottom: 6px;" />
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div>
            <label style="font-size: 0.72rem; color: var(--text-muted);">Mins</label>
            <input class="form-control" type="number" min="0" value="${mins}" onchange="updateRoutineStepDuration(${idx}, this.value, 'm')" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--text-muted);">Secs</label>
            <input class="form-control" type="number" min="0" max="59" value="${secs}" onchange="updateRoutineStepDuration(${idx}, this.value, 's')" />
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function updateRoutineStepTitle(idx, val) {
  if (typeof window !== 'undefined') window.updateRoutineStepTitle = updateRoutineStepTitle;
  if (currentRoutineSteps[idx]) {
    currentRoutineSteps[idx].title = val.trim() || `Step ${idx + 1}`;
  }
};

function updateRoutineStepDuration(idx, val, unit) {
  if (typeof window !== 'undefined') window.updateRoutineStepDuration = updateRoutineStepDuration;
  if (!currentRoutineSteps[idx]) return;
  const num = parseInt(val, 10) || 0;
  const current = currentRoutineSteps[idx].duration;
  let mins = Math.floor(current / 60);
  let secs = current % 60;
  if (unit === 'm') mins = num;
  if (unit === 's') secs = num;
  currentRoutineSteps[idx].duration = Math.max(5, mins * 60 + secs);
};

function removeRoutineStep(idx) {
  if (typeof window !== 'undefined') window.removeRoutineStep = removeRoutineStep;
  if (currentRoutineSteps.length <= 1) return;
  currentRoutineSteps.splice(idx, 1);
  renderRoutineStepsBuilder();
};

function saveAndLaunchRoutine(routine) {
  timers.unshift(routine);
  saveTimersToStorage();
  closeAddSheet();
  renderTimersList();
  renderFolderBar();
  startTimer(routine.id);
  showToast(`Created & Started "${routine.title}"!`);
}

function setupTemplates() {
  const templates = [
    {
      id: 'tmplTabataRow',
      create: () => {
        const tabataSteps = [];
        for (let r = 1; r <= 8; r++) {
          tabataSteps.push({ title: `Tabata Round ${r} (Work)`, duration: 20, notes: 'Maximum explosive output' });
          tabataSteps.push({ title: `Rest Interval ${r}`, duration: 10, notes: 'Deep recovery breathing' });
        }
        return {
          id: 'tmpl-tabata-' + Date.now(),
          title: 'Tabata Workout (4 mins)',
          icon: '⚡',
          type: 'routine',
          folder: 'workout',
          totalSeconds: 240,
          notes: '8 rounds of 20s maximum effort / 10s recovery',
          steps: tabataSteps
        };
      }
    },
    {
      id: 'tmplPomodoroRow',
      create: () => ({
        id: 'tmpl-pomo-' + Date.now(),
        title: 'Pomodoro Focus Block',
        icon: '🍅',
        type: 'routine',
        folder: 'work',
        totalSeconds: 1800,
        notes: '25m deep work followed by 5m restorative break',
        steps: [
          { title: 'Focus Sprint', duration: 1500, notes: 'Single-task with zero distraction' },
          { title: 'Restorative Break', duration: 300, notes: 'Stand up, hydrate, look into distance' }
        ]
      })
    },
    {
      id: 'tmplSeqTabataRow',
      create: () => {
        const steps = [
          { title: 'Warmup & Mobility', duration: 300, notes: 'Dynamic hip and shoulder mobility' }
        ];
        for (let i = 1; i <= 8; i++) {
          steps.push({ title: `Tabata Set ${i} (Work)`, duration: 20, notes: 'High intensity effort' });
          steps.push({ title: `Set ${i} Rest`, duration: 10, notes: 'Down-regulate breathing' });
        }
        steps.push({ title: 'Mid-Routine Hydration', duration: 120, notes: 'Sip water and reset focus' });
        for (let i = 9; i <= 16; i++) {
          steps.push({ title: `Tabata Set ${i} (Core)`, duration: 20, notes: 'Core stabilization' });
          steps.push({ title: `Set ${i} Rest`, duration: 10, notes: 'Deep exhale' });
        }
        steps.push({ title: 'Full Body Cooldown', duration: 300, notes: 'Static hamstring and spine stretches' });
        const totalSec = steps.reduce((sum, s) => sum + s.duration, 0);
        return {
          id: 'tmpl-seq-tabata-' + Date.now(),
          title: '30 min Seq Tabata exercise',
          icon: '🔄',
          type: 'routine',
          folder: 'workout',
          totalSeconds: totalSec,
          notes: 'Comprehensive 30m sequential interval training',
          steps: steps
        };
      }
    },
    {
      id: 'tmplHarvardRow',
      create: () => ({
        id: 'tmpl-harvard-' + Date.now(),
        title: 'Harvard Top 3 Deep Work',
        icon: '🎯',
        type: 'routine',
        folder: 'work',
        totalSeconds: (45 * 3 + 10) * 60,
        notes: '3 serial high-priority deep focus blocks with calming pauses',
        steps: [
          { title: 'Top 1: Highest Leverage Task', duration: 45 * 60, notes: 'Absolute single-task focus' },
          { title: 'Calming Pause', duration: 5 * 60, notes: 'Step away from screen, hydrate' },
          { title: 'Top 2: Secondary Critical Task', duration: 45 * 60, notes: 'Deep execution momentum' },
          { title: 'Calming Pause', duration: 5 * 60, notes: 'Light physical stretch' },
          { title: 'Top 3: Tertiary Priority', duration: 45 * 60, notes: 'Wrap up primary deliverables' }
        ]
      })
    }
  ];

  templates.forEach(t => {
    const row = document.getElementById(t.id);
    if (row) {
      row.onclick = () => saveAndLaunchRoutine(t.create());
    }
  });
}

// --- 12. INITIALIZATION & EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  loadTimersFromStorage();
  updateMonthHeader();
  renderWeekdaysStrip();
  renderFolderBar();
  renderFolderSelectOptions();
  renderTimersList();
  setupTemplates();

  // If no active timer, prime the first timer in paused state for right panel widget
  if (!activeTimer && timers.length > 0) {
    activeTimer = timers[0];
    currentStepIndex = 0;
    secondsRemaining = activeTimer.totalSeconds;
    stepTotalSeconds = activeTimer.totalSeconds;
    isRunning = false;
    updatePlayerUI();
  }

  // Header user badge sync
  try {
    const prof = (typeof getStoredProfile === 'function') ? getStoredProfile() : null;
    if (prof) {
      const avatarEl = document.getElementById('headerAvatar');
      const nameEl = document.getElementById('headerUserName');
      if (nameEl && prof.userName) nameEl.textContent = prof.userName;
      if (avatarEl && prof.userName) {
        const initials = prof.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        avatarEl.textContent = initials || 'RR';
      }
    }
  } catch(e) {}

  // Header Search Input
  const searchInp = document.getElementById('headerSearchInput');
  if (searchInp) {
    searchInp.addEventListener('input', () => renderTimersList());
  }

  // Month navigation buttons
  const prevMonthBtn = document.getElementById('btnPrevMonth');
  if (prevMonthBtn) {
    prevMonthBtn.onclick = () => {
      displayMonthDate.setMonth(displayMonthDate.getMonth() - 1);
      updateMonthHeader();
      renderWeekdaysStrip(displayMonthDate);
    };
  }
  const nextMonthBtn = document.getElementById('btnNextMonth');
  if (nextMonthBtn) {
    nextMonthBtn.onclick = () => {
      displayMonthDate.setMonth(displayMonthDate.getMonth() + 1);
      updateMonthHeader();
      renderWeekdaysStrip(displayMonthDate);
    };
  }

  // Segment controls
  const segAll = document.getElementById('segAllBtn');
  const segAct = document.getElementById('segActiveBtn');
  if (segAll && segAct) {
    segAll.onclick = () => {
      segAll.classList.add('active');
      segAct.classList.remove('active');
      currentSegment = 'all';
      renderTimersList();
    };
    segAct.onclick = () => {
      segAct.classList.add('active');
      segAll.classList.remove('active');
      currentSegment = 'active';
      renderTimersList();
    };
  }

  // Quick Preset "+" buttons
  const q15 = document.getElementById('quickTimer15');
  if (q15) {
    q15.onclick = () => {
      let t = timers.find(item => item.title === 'Focus Sprint' || item.id === 't-15m');
      if (!t) {
        t = {
          id: 't-15m',
          title: 'Focus Sprint',
          totalSeconds: 15 * 60,
          type: 'timer',
          folder: 'work',
          notes: '15-minute quick sprint',
          steps: [{ title: 'Focus Sprint', duration: 15 * 60 }]
        };
        timers.unshift(t);
        saveTimersToStorage();
        renderTimersList();
        renderFolderBar();
      }
      startTimer(t.id);
    };
  }

  const q45 = document.getElementById('quickTimer45');
  if (q45) {
    q45.onclick = () => {
      let t = timers.find(item => item.title === 'Harvard Deep Work' || item.id === 't-45m');
      if (!t) {
        t = {
          id: 't-45m',
          title: 'Harvard Deep Work',
          totalSeconds: 45 * 60,
          type: 'timer',
          folder: 'work',
          notes: '45-minute deep focus block',
          steps: [{ title: 'Harvard Deep Work', duration: 45 * 60 }]
        };
        timers.unshift(t);
        saveTimersToStorage();
        renderTimersList();
        renderFolderBar();
      }
      startTimer(t.id);
    };
  }

  const q90 = document.getElementById('quickTimer90');
  if (q90) {
    q90.onclick = () => {
      let t = timers.find(item => item.title.includes('Eye drops') && item.totalSeconds >= 5400);
      if (!t) {
        t = {
          id: 't-90m',
          title: 'Eye drops (Glaucoma Care)',
          icon: '🧴',
          totalSeconds: 90 * 60,
          type: 'timer',
          folder: 'health',
          notes: 'Primary prescribed eye drops for glaucoma care',
          steps: [{ title: 'Eye drops (Glaucoma Care)', duration: 90 * 60 }]
        };
        timers.unshift(t);
        saveTimersToStorage();
        renderTimersList();
        renderFolderBar();
      }
      startTimer(t.id);
    };
  }

  const q75 = document.getElementById('quickTimer75');
  if (q75) {
    q75.onclick = () => {
      let t = timers.find(item => item.title.includes('Eye drops') && item.totalSeconds === 4500);
      if (!t) {
        t = {
          id: 't-75m',
          title: 'Secondary Eye Drops',
          icon: '🧴',
          totalSeconds: 75 * 60,
          type: 'timer',
          folder: 'health',
          notes: 'Secondary hydration dose for vision protection',
          steps: [{ title: 'Secondary Eye Drops', duration: 75 * 60 }]
        };
        timers.unshift(t);
        saveTimersToStorage();
        renderTimersList();
        renderFolderBar();
      }
      startTimer(t.id);
    };
  }

  const qTab = document.getElementById('quickTabata');
  if (qTab) {
    qTab.onclick = () => {
      let t = timers.find(item => item.title.includes('Tabata'));
      if (!t) {
        t = {
          id: 'tmpl-seq-tabata-' + Date.now(),
          title: '30 min Seq Tabata exercise',
          icon: '🔄',
          type: 'routine',
          folder: 'workout',
          totalSeconds: 1800,
          notes: '30m interval routine',
          steps: [
            { title: 'Warmup', duration: 300 },
            { title: 'Tabata Work', duration: 20 },
            { title: 'Rest', duration: 10 },
            { title: 'Cooldown', duration: 300 }
          ]
        };
        timers.unshift(t);
        saveTimersToStorage();
        renderTimersList();
        renderFolderBar();
      }
      startTimer(t.id);
    };
  }

  const qPom = document.getElementById('quickPomodoro');
  if (qPom) {
    qPom.onclick = () => {
      let t = timers.find(item => item.title.includes('Pomodoro'));
      if (!t) {
        t = {
          id: 'pom-' + Date.now(),
          title: 'Pomodoro Focus Block',
          icon: '🍅',
          type: 'routine',
          folder: 'work',
          totalSeconds: 30 * 60,
          notes: '25m work / 5m break',
          steps: [
            { title: 'Focus Sprint', duration: 25 * 60 },
            { title: 'Restorative Break', duration: 5 * 60 }
          ]
        };
        timers.unshift(t);
        saveTimersToStorage();
        renderTimersList();
        renderFolderBar();
      }
      startTimer(t.id);
    };
  }

  // Sidebar and Center "Add Timer" buttons
  const sAdd = document.getElementById('sidebarAddTimerBtn');
  if (sAdd) sAdd.onclick = openAddSheet;
  const cAdd = document.getElementById('centerAddTimerBtn');
  if (cAdd) cAdd.onclick = openAddSheet;

  // Add Timer Sheet controls
  const closeSheetBtn = document.getElementById('closeAddSheetBtn');
  if (closeSheetBtn) closeSheetBtn.onclick = closeAddSheet;

  const addSheet = document.getElementById('addTimerSheet');
  if (addSheet) {
    addSheet.onclick = (e) => {
      if (e.target.id === 'addTimerSheet') closeAddSheet();
    };
  }

  const createSingleRow = document.getElementById('createSingleTimerRow');
  if (createSingleRow) {
    createSingleRow.onclick = () => {
      closeAddSheet();
      editingTimerId = null;
      setCreatorMode('timer');
    };
  }

  const createSwRow = document.getElementById('createStopwatchRow');
  if (createSwRow) {
    createSwRow.onclick = () => {
      closeAddSheet();
      editingTimerId = null;
      setCreatorMode('stopwatch');
    };
  }

  const createCdRow = document.getElementById('createCountdownRow');
  if (createCdRow) {
    createCdRow.onclick = () => {
      closeAddSheet();
      editingTimerId = null;
      setCreatorMode('countdown');
    };
  }

  const createRtRow = document.getElementById('createRoutineRow');
  if (createRtRow) {
    createRtRow.onclick = () => {
      closeAddSheet();
      editingTimerId = null;
      setCreatorMode('routine');
    };
  }

  // Custom Timer Creation / Edit Modal controls
  const closeCustomBtn = document.getElementById('closeCustomModalBtn');
  if (closeCustomBtn) closeCustomBtn.onclick = closeCustomModal;

  const cancelCustomBtn = document.getElementById('cancelCustomModalBtn');
  if (cancelCustomBtn) cancelCustomBtn.onclick = closeCustomModal;

  const customModal = document.getElementById('customTimerModal');
  if (customModal) {
    customModal.onclick = (e) => {
      if (e.target.id === 'customTimerModal') closeCustomModal();
    };
  }

  const addStepBtn = document.getElementById('addRoutineStepBtn');
  if (addStepBtn) {
    addStepBtn.onclick = () => {
      currentRoutineSteps.push({
        title: `Step ${currentRoutineSteps.length + 1}`,
        duration: 5 * 60,
        notes: ''
      });
      renderRoutineStepsBuilder();
    };
  }

  const saveCustomBtn = document.getElementById('saveCustomModalBtn');
  if (saveCustomBtn) {
    saveCustomBtn.onclick = () => {
      const mode = currentCreatorMode;
      const titleInp = document.getElementById('customLabelInput');
      const folderInp = document.getElementById('customFolderSelect');
      const notesInp = document.getElementById('customNotesInput');

      const title = (titleInp ? titleInp.value.trim() : '') || 'Custom Timer';
      const folder = (folderInp ? folderInp.value : '') || 'work';
      const notes = (notesInp ? notesInp.value.trim() : '');

      if (mode === 'timer') {
        const hrsInp = document.getElementById('customHoursInput');
        const minsInp = document.getElementById('customMinutesInput');
        const secsInp = document.getElementById('customSecondsInput');
        const repInp = document.getElementById('customRepeatsSelect');

        const hrs = parseInt(hrsInp ? hrsInp.value : 0, 10) || 0;
        const mins = parseInt(minsInp ? minsInp.value : 0, 10) || 0;
        const secs = parseInt(secsInp ? secsInp.value : 0, 10) || 0;
        const repeats = parseInt(repInp ? repInp.value : 1, 10) || 1;
        const total = hrs * 3600 + mins * 60 + secs;

        if (total <= 0) {
          alert('Please enter a duration greater than 0 seconds.');
          return;
        }

        if (editingTimerId) {
          const t = timers.find(item => item.id === editingTimerId);
          if (t) {
            t.title = title;
            t.folder = folder;
            t.totalSeconds = total;
            t.repeats = repeats;
            t.notes = notes;
            t.steps = [{ title: title, duration: total, notes: notes }];
          }
          showToast(`Updated Timer "${title}"!`);
        } else {
          const newTimer = {
            id: 'timer-' + Date.now(),
            title: title,
            type: 'timer',
            folder: folder,
            totalSeconds: total,
            repeats: repeats,
            notes: notes,
            steps: [{ title: title, duration: total, notes: notes }]
          };
          timers.unshift(newTimer);
          showToast(`Saved Timer "${title}"!`);
        }
      } else if (mode === 'stopwatch') {
        if (editingTimerId) {
          const t = timers.find(item => item.id === editingTimerId);
          if (t) {
            t.title = title || 'Stopwatch';
            t.folder = folder;
            t.notes = notes;
          }
          showToast(`Updated Stopwatch "${title}"!`);
        } else {
          const sw = {
            id: 'sw-' + Date.now(),
            title: title || 'Stopwatch',
            icon: '⏲',
            type: 'stopwatch',
            folder: folder,
            totalSeconds: 0,
            elapsed: 0,
            notes: notes || 'Count-up session with lap recording',
            steps: [{ title: title || 'Stopwatch', duration: 0, notes: notes }]
          };
          timers.unshift(sw);
          showToast(`Created Stopwatch "${title}"!`);
          startTimer(sw.id);
        }
      } else if (mode === 'countdown') {
        const targetDateInp = document.getElementById('customTargetDateInput');
        const targetStr = targetDateInp ? targetDateInp.value : '';
        if (!targetStr) {
          alert('Please select a target date and time.');
          return;
        }
        const targetDateObj = new Date(targetStr);
        const diffSec = Math.max(0, Math.round((targetDateObj.getTime() - Date.now()) / 1000));

        if (editingTimerId) {
          const t = timers.find(item => item.id === editingTimerId);
          if (t) {
            t.title = title;
            t.folder = folder;
            t.targetDate = targetDateObj.toISOString();
            t.totalSeconds = diffSec;
            t.notes = notes;
            t.steps = [{ title: title, duration: diffSec, notes: notes }];
          }
          showToast(`Updated Countdown "${title}"!`);
        } else {
          const cd = {
            id: 'cd-' + Date.now(),
            title: title,
            icon: '📅',
            type: 'countdown',
            folder: folder,
            targetDate: targetDateObj.toISOString(),
            totalSeconds: diffSec,
            notes: notes || `Target: ${targetDateObj.toLocaleDateString()}`,
            steps: [{ title: title, duration: diffSec, notes: notes }]
          };
          timers.unshift(cd);
          showToast(`Saved Countdown "${title}"!`);
        }
      } else if (mode === 'routine') {
        if (!currentRoutineSteps || currentRoutineSteps.length === 0) {
          alert('Please add at least one step to your routine.');
          return;
        }
        const roundsInp = document.getElementById('customRoundsInput');
        const rounds = parseInt(roundsInp ? roundsInp.value : 1, 10) || 1;
        const compiledSteps = [];
        for (let r = 1; r <= rounds; r++) {
          currentRoutineSteps.forEach((st, sIdx) => {
            compiledSteps.push({
              title: rounds > 1 ? `${st.title} (R${r})` : st.title,
              duration: st.duration,
              notes: st.notes
            });
          });
        }
        const totalSec = compiledSteps.reduce((acc, cur) => acc + cur.duration, 0);

        if (editingTimerId) {
          const t = timers.find(item => item.id === editingTimerId);
          if (t) {
            t.title = title;
            t.folder = folder;
            t.totalSeconds = totalSec;
            t.rounds = rounds;
            t.notes = notes || `${compiledSteps.length} segments (${Math.floor(totalSec/60)}m)`;
            t.steps = compiledSteps;
          }
          showToast(`Updated Routine "${title}" (${compiledSteps.length} Steps)!`);
        } else {
          const newRoutine = {
            id: 'rt-' + Date.now(),
            title: title,
            icon: '🗂',
            type: 'routine',
            folder: folder,
            totalSeconds: totalSec,
            rounds: rounds,
            notes: notes || `${compiledSteps.length} segments (${Math.floor(totalSec/60)}m)`,
            steps: compiledSteps
          };
          timers.unshift(newRoutine);
          showToast(`Saved Routine "${title}" (${compiledSteps.length} Steps)!`);
        }
      }

      saveTimersToStorage();
      closeCustomModal();
      renderTimersList();
      renderFolderBar();
    };
  }

  // Manage Folders Modal close & add folder buttons
  const closeMgmtBtn = document.getElementById('closeManageFoldersBtn');
  if (closeMgmtBtn) closeMgmtBtn.onclick = closeManageFoldersModal;

  const mgmtModal = document.getElementById('manageFoldersModal');
  if (mgmtModal) {
    mgmtModal.onclick = (e) => {
      if (e.target.id === 'manageFoldersModal') closeManageFoldersModal();
    };
  }

  const addFolderBtn = document.getElementById('addFolderBtn');
  if (addFolderBtn) {
    addFolderBtn.onclick = () => {
      const input = document.getElementById('newFolderInput');
      const name = input ? input.value.trim() : '';
      if (!name) {
        alert('Please enter a folder name.');
        return;
      }
      const folders = getStoredFolders();
      const newId = 'folder-' + Date.now();
      folders.push({
        id: newId,
        name: name,
        icon: '📁'
      });
      saveStoredFolders(folders);
      if (input) input.value = '';
      renderFolderBar();
      renderFolderSelectOptions();
      renderFoldersManagementModal();
      showToast(`Added folder "${name}"`);
    };
  }

  // Hero Quick Launch Button
  const heroBtn = document.getElementById('heroQuickLaunchBtn');
  if (heroBtn) {
    heroBtn.onclick = () => {
      if (timers.length > 0) {
        startTimer(timers[0].id);
      }
    };
  }

  // Right Widget Controls
  const wPlay = document.getElementById('widgetPlayPauseBtn');
  if (wPlay) {
    wPlay.onclick = () => {
      if (!activeTimer && timers.length > 0) {
        startTimer(timers[0].id);
      } else if (activeTimer) {
        if (isRunning) pauseActiveTimer();
        else resumeActiveTimer();
      }
    };
  }

  const wReset = document.getElementById('widgetResetBtn');
  if (wReset) {
    wReset.onclick = () => {
      if (!activeTimer) return;
      const steps = (activeTimer.steps && activeTimer.steps.length > 0) ? activeTimer.steps : [{ title: activeTimer.title, duration: activeTimer.totalSeconds }];
      const currentStep = steps[currentStepIndex] || steps[0];
      secondsRemaining = currentStep.duration || activeTimer.totalSeconds;
      stepTotalSeconds = secondsRemaining;
      updatePlayerUI();
      showToast('↺ Reset step to start');
    };
  }

  const wNext = document.getElementById('widgetNextBtn');
  if (wNext) {
    wNext.onclick = advanceToNextStep;
  }

  const wDone = document.getElementById('widgetDoneEarlyBtn');
  if (wDone) wDone.onclick = finishTaskEarly;

  const pDone = document.getElementById('playerDoneEarlyBtn');
  if (pDone) pDone.onclick = finishTaskEarly;

  const wLap = document.getElementById('widgetLapBtn');
  if (wLap) {
    wLap.onclick = () => {
      const lBtn = document.getElementById('playerLapBtn');
      if (lBtn) lBtn.click();
    };
  }

  const wM1 = document.getElementById('widgetMinus1m');
  if (wM1) wM1.onclick = () => adjustActiveTime(-60);
  const wP1 = document.getElementById('widgetPlus1m');
  if (wP1) wP1.onclick = () => adjustActiveTime(60);
  const wP5 = document.getElementById('widgetPlus5m');
  if (wP5) wP5.onclick = () => adjustActiveTime(300);

  // Open & Close fullscreen player
  const openFullBtn = document.getElementById('openActivePlayerModalBtn');
  if (openFullBtn) {
    openFullBtn.onclick = () => {
      const scr = document.getElementById('activePlayerScreen');
      if (scr) scr.classList.add('open');
    };
  }

  const minBtn = document.getElementById('playerMinimizeBtn') || document.getElementById('minimizePlayerBtn');
  if (minBtn) minBtn.onclick = closeActivePlayer;

  // Fullscreen player controls
  const pPlayBtn = document.getElementById('playerPlayPauseBtn');
  if (pPlayBtn) {
    pPlayBtn.onclick = () => {
      if (isRunning) pauseActiveTimer();
      else resumeActiveTimer();
    };
  }

  const pResetBtn = document.getElementById('playerResetBtn');
  if (pResetBtn) {
    pResetBtn.onclick = () => {
      if (!activeTimer) return;
      const steps = (activeTimer.steps && activeTimer.steps.length > 0) ? activeTimer.steps : [{ title: activeTimer.title, duration: activeTimer.totalSeconds }];
      const currentStep = steps[currentStepIndex] || steps[0];
      secondsRemaining = currentStep.duration || activeTimer.totalSeconds;
      stepTotalSeconds = secondsRemaining;
      updatePlayerUI();
      showToast('↺ Reset step to start');
    };
  }

  const pNextBtn = document.getElementById('playerNextBtn');
  if (pNextBtn) pNextBtn.onclick = advanceToNextStep;

  const pLapBtn = document.getElementById('playerLapBtn');
  if (pLapBtn) {
    pLapBtn.onclick = () => {
      if (!isStopwatch) return;
      const lapNum = stopwatchLaps.length + 1;
      const lapTime = formatTime(stopwatchElapsed);
      stopwatchLaps.unshift({ num: lapNum, time: lapTime });
      
      const lapsBox = document.getElementById('playerLapsBox');
      const lapsList = document.getElementById('playerLapsList');
      if (lapsBox && lapsList) {
        lapsBox.style.display = 'block';
        lapsList.innerHTML = stopwatchLaps.map(l => `
          <div class="lap-row" style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid rgba(0,0,0,0.06);">
            <span>Lap ${l.num}</span>
            <span style="font-family: monospace; font-weight: 600;">${l.time}</span>
          </div>
        `).join('');
      }
      showToast(`Lap ${lapNum}: ${lapTime}`);
    };
  }

  const pM1 = document.getElementById('btnAdjustMinus1m');
  if (pM1) pM1.onclick = () => adjustActiveTime(-60);
  const pP1 = document.getElementById('btnAdjustPlus1m');
  if (pP1) pP1.onclick = () => adjustActiveTime(60);
  const pP5 = document.getElementById('btnAdjustPlus5m');
  if (pP5) pP5.onclick = () => adjustActiveTime(300);

  const muteBtn = document.getElementById('toggleMuteBtn');
  if (muteBtn) {
    muteBtn.onclick = () => {
      isMuted = !isMuted;
      muteBtn.textContent = isMuted ? '🔇' : '🔔';
      showToast(isMuted ? 'Muted Chimes' : 'Sound Alerts Enabled');
    };
  }

  // History Button
  const histBtn = document.getElementById('historyBtn');
  if (histBtn) {
    histBtn.onclick = () => {
      const activeCount = timers.length;
      alert(`Executive Session History:\n\n• Stored Timers & Routines: ${activeCount}\n• Active Horizon: Today (${new Date().toLocaleDateString()})\n• Zero-telemetry local storage is active.`);
    };
  }

  // Header Menu Button
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.onclick = () => {
      if (confirm('Options:\n\nClick OK to reset timers to default presets.\nClick Cancel to keep current timers.')) {
        timers = [...DEFAULT_TIMERS];
        saveTimersToStorage();
        renderTimersList();
        renderFolderBar();
        showToast('Reset to default timers');
      }
    };
  }

  // Check for ?start= or ?load= URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const startId = urlParams.get('start') || urlParams.get('load');
  if (startId) {
    let targetId = startId;
    if (startId === 'active') {
      const act = localStorage.getItem(STORAGE_KEY_ACTIVE_ROUTINE);
      if (act) {
        try { targetId = JSON.parse(act).id; } catch(e) {}
      }
    }
    const found = timers.find(t => t.id === targetId);
    if (found) {
      setTimeout(() => {
        startTimer(found.id);
      }, 250);
    }
  }
});
