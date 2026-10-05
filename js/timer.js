
    // =========================================================
    // TIMER+ SUITE: TIMERS, STOPWATCHES, COUNTDOWNS & ROUTINES
    // =========================================================
    let currentCreatorMode = 'timer'; // 'timer', 'stopwatch', 'countdown', 'routine'
    let currentRoutineSteps = [
      { title: 'Work Interval', duration: 25 * 60, notes: 'Deep focused execution' },
      { title: 'Rest Interval', duration: 5 * 60, notes: 'Stand up, hydrate, and stretch' }
    ];
    let stopwatchLaps = [];
    let isStopwatch = false;
    let stopwatchElapsed = 0;

    function setCreatorMode(mode) {
      currentCreatorMode = mode;
      document.getElementById('customTypeInput').value = mode;

      const titleEl = document.getElementById('customModalTitle');
      const labelPrompt = document.getElementById('customLabelPrompt');
      const labelInput = document.getElementById('customLabelInput');
      const folderSelect = document.getElementById('customFolderSelect');

      const timerFields = document.getElementById('timerSpecificFields');
      const swFields = document.getElementById('stopwatchSpecificFields');
      const cdFields = document.getElementById('countdownSpecificFields');
      const rtFields = document.getElementById('routineSpecificFields');

      timerFields.style.display = (mode === 'timer') ? 'block' : 'none';
      swFields.style.display = (mode === 'stopwatch') ? 'block' : 'none';
      cdFields.style.display = (mode === 'countdown') ? 'block' : 'none';
      rtFields.style.display = (mode === 'routine') ? 'block' : 'none';

      if (mode === 'timer') {
        titleEl.textContent = 'New Countdown Timer';
        labelPrompt.textContent = 'Timer Label / Title';
        labelInput.value = 'Focus Session';
        folderSelect.value = 'work';
      } else if (mode === 'stopwatch') {
        titleEl.textContent = 'New Stopwatch';
        labelPrompt.textContent = 'Stopwatch Title';
        labelInput.value = 'Work Sprint Stopwatch';
        folderSelect.value = 'work';
      } else if (mode === 'countdown') {
        titleEl.textContent = 'New Target Date Countdown';
        labelPrompt.textContent = 'Event / Target Name';
        labelInput.value = 'Target Milestone';
        folderSelect.value = 'work';

        // Default target date: tomorrow at 09:00
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        const isoLocal = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById('customTargetDateInput').value = isoLocal;
      } else if (mode === 'routine') {
        titleEl.textContent = 'New Multi-Segment Routine';
        labelPrompt.textContent = 'Routine Title';
        labelInput.value = 'Custom Interval Routine';
        folderSelect.value = 'workout';
        renderRoutineStepsBuilder();
      }

      document.getElementById('customTimerModal').classList.add('open');
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

    window.updateRoutineStepTitle = function(idx, val) {
      if (currentRoutineSteps[idx]) {
        currentRoutineSteps[idx].title = val.trim() || `Step ${idx + 1}`;
      }
    };

    window.updateRoutineStepDuration = function(idx, val, unit) {
      if (!currentRoutineSteps[idx]) return;
      const num = parseInt(val, 10) || 0;
      const current = currentRoutineSteps[idx].duration;
      let mins = Math.floor(current / 60);
      let secs = current % 60;
      if (unit === 'm') mins = num;
      if (unit === 's') secs = num;
      currentRoutineSteps[idx].duration = Math.max(5, mins * 60 + secs);
    };

    window.removeRoutineStep = function(idx) {
      if (currentRoutineSteps.length <= 1) return;
      currentRoutineSteps.splice(idx, 1);
      renderRoutineStepsBuilder();
    };

    window.adjustActiveTime = function(deltaSeconds) {
      if (!activeTimer || isStopwatch) return;
      secondsRemaining = Math.max(0, secondsRemaining + deltaSeconds);
      if (stepTotalSeconds < secondsRemaining) stepTotalSeconds = secondsRemaining;
      updatePlayerUI();
      showToast(`${deltaSeconds > 0 ? '+' : ''}${Math.round(deltaSeconds/60)}m applied`);
    };

// --- 1. DEFAULT TIMERS (Strictly matching Screenshots 1, 2, 3) ---
    const DEFAULT_TIMERS = [
      {
        id: 't-1',
        title: 'Timer',
        type: 'timer',
        folder: 'work',
        totalSeconds: 15 * 60,
        notes: 'Standard 15-minute execution sprint',
        steps: [{ title: 'Timer', duration: 15 * 60, notes: 'Focus sprint' }]
      },
      {
        id: 't-2',
        title: 'Timer',
        type: 'timer',
        folder: 'work',
        totalSeconds: 22 * 60,
        notes: '22-minute deep work block',
        steps: [{ title: 'Timer', duration: 22 * 60, notes: 'Deep focus' }]
      },
      {
        id: 't-3',
        title: 'Eye drops',
        icon: '🧴',
        type: 'timer',
        folder: 'health',
        totalSeconds: 90 * 60, // 1:30:00+
        notes: 'Apply prescribed eye drops and rest vision',
        steps: [{ title: 'Eye drops', duration: 90 * 60, notes: 'Apply eye drops and rest vision' }]
      },
      {
        id: 't-4',
        title: 'Timer',
        type: 'timer',
        folder: 'work',
        totalSeconds: 30 * 60,
        notes: '30-minute block',
        steps: [{ title: 'Timer', duration: 30 * 60, notes: 'Half-hour execution' }]
      },
      {
        id: 't-5',
        title: 'Eye drops',
        icon: '🧴',
        type: 'timer',
        folder: 'health',
        totalSeconds: 75 * 60, // 1:15:00
        notes: 'Secondary hydration dose for eyes',
        steps: [{ title: 'Eye drops', duration: 75 * 60, notes: 'Secondary dose' }]
      },
      {
        id: 't-6',
        title: '30 min Seq Tabata exercise',
        icon: '🔄',
        type: 'routine',
        folder: 'workout',
        totalSeconds: 30 * 60,
        notes: 'Warmup 5m, 8 Tabata rounds (20s work / 10s rest), cooldown 5m',
        steps: [
          { title: 'Warmup & Mobility', duration: 300, notes: 'Joint rotations and light jumping jacks' },
          { title: 'Tabata Round 1 (High Knees)', duration: 20, notes: 'Maximum explosive effort' },
          { title: 'Rest Interval', duration: 10, notes: 'Deep belly recovery breath' },
          { title: 'Tabata Round 2 (Burpees)', duration: 20, notes: 'Pace your reps steadily' },
          { title: 'Rest Interval', duration: 10, notes: 'Sip water' },
          { title: 'Tabata Round 3 (Mountain Climbers)', duration: 20, notes: 'Drive knees to chest' },
          { title: 'Rest Interval', duration: 10, notes: 'Down-regulate heart rate' },
          { title: 'Cooldown & Stretch', duration: 300, notes: 'Hamstrings, hip flexors, child pose' }
        ]
      }
    ];

    const STORAGE_KEY_TIMERS = 'anchor_flow_timers';
    const STORAGE_KEY_ACTIVE_ROUTINE = 'anchor_flow_active_routine';

    // State
    let timers = [];
    let currentFilter = 'all';
    let currentSegment = 'all'; // 'all' or 'active'
    let isMuted = false;

    // Active Engine State
    let activeTimer = null;
    let timerInterval = null;
    let currentStepIndex = 0;
    let secondsRemaining = 0;
    let stepTotalSeconds = 0;
    let isRunning = false;

    // Web Audio Synthesizer (Apple-style subtle harmonic chimes)
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
          // Soft harmonic two-tone bell
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
        } else if (type === 'done') {
          // Triumphant 3-chord sequence
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
        console.warn('Audio chime note:', e);
      }
    }

    // --- 2. STORAGE MANAGEMENT ---
    
    // =========================================================
    // DYNAMIC FOLDER MANAGEMENT (Timer+ Custom Categories)
    // =========================================================
    const DEFAULT_FOLDERS = [
      { id: 'all', name: 'All Timers', system: true, icon: '⏱️' },
      { id: 'work', name: 'Work & Focus', icon: '📁' },
      { id: 'health', name: 'Health & Care', icon: '🧴' },
      { id: 'workout', name: 'Workouts & HIIT', icon: '⚡' },
      { id: 'routines', name: 'Daily Routines', icon: '🔄' }
    ];
    const STORAGE_KEY_FOLDERS = 'anchor_flow_timer_folders';

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

    function renderFolderBar() {
      const bar = document.getElementById('folderScrollBar');
      if (!bar) return;
      const folders = getStoredFolders();
      let html = '';
      folders.forEach(f => {
        const isActive = f.id === currentFilter;
        html += `<button class="folder-pill ${isActive ? 'active' : ''}" data-folder="${f.id}">${f.icon ? f.icon + ' ' : ''}${escapeHtml(f.name)}</button>`;
      });
      html += `<button class="btn-manage-folders" id="openManageFoldersBarBtn" type="button" title="Add or delete custom folders">⚙️ Manage Folders</button>`;
      bar.innerHTML = html;

      bar.querySelectorAll('.folder-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          bar.querySelectorAll('.folder-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          currentFilter = pill.getAttribute('data-folder');
          renderTimersList();
        });
      });

      const mgmtBtn = document.getElementById('openManageFoldersBarBtn');
      if (mgmtBtn) mgmtBtn.addEventListener('click', openManageFoldersModal);
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

    window.renameFolder = function(folderId) {
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

    window.deleteFolder = function(folderId) {
      const folders = getStoredFolders();
      const target = folders.find(f => f.id === folderId);
      if (!target) return;
      if (!confirm(`Delete folder "${target.name}"? Any timers inside will be moved to Work & Focus.`)) return;

      // Reassign timers to 'work'
      timers.forEach(t => {
        if (t.folder === folderId) t.folder = 'work';
      });
      saveTimersToStorage();

      // Remove folder
      const updated = folders.filter(f => f.id !== folderId);
      saveStoredFolders(updated);

      if (currentFilter === folderId) currentFilter = 'all';

      renderFolderBar();
      renderFolderSelectOptions();
      renderFoldersManagementModal();
      renderTimersList();
      showToast(`Deleted folder "${target.name}"`);
    };

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
            showToast('Loaded Flow Routine from AI Planner!');
          }
        } catch (e) {}
      }
    }

    function saveTimersToStorage() {
      localStorage.setItem(STORAGE_KEY_TIMERS, JSON.stringify(timers));
    }

    // --- 3. FORMATTING HELPERS ---
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
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function showToast(msg) {
      const toast = document.getElementById('toastPill');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2600);
    }

    // --- 4. RENDER TIMERS LIST (Screenshot 1 Layout) ---
    function renderTimersList() {
      const container = document.getElementById('timersList');
      const subtitle = document.getElementById('timerCountSubtitle');

      let filtered = timers.filter(t => {
        if (currentFilter !== 'all' && t.folder !== currentFilter) return false;
        if (currentSegment === 'active') {
          return activeTimer && activeTimer.id === t.id && isRunning;
        }
        return true;
      });

      subtitle.textContent = `${filtered.length} Timer${filtered.length === 1 ? '' : 's'} Stored`;

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 48px 20px; color: var(--text-secondary);">
            <div style="font-size: 2.5rem; margin-bottom: 8px;">⏱️</div>
            <p style="font-weight: 600;">No timers in this view</p>
            <p style="font-size: 0.85rem; margin-top: 4px;">Tap the '+' button below to add your first timer or routine.</p>
          </div>
        `;
        return;
      }

      let html = '';
      filtered.forEach(t => {
        const isCurrentlyActive = activeTimer && activeTimer.id === t.id && isRunning;
        const iconSpan = t.icon ? `<span class="timer-icon-badge">${t.icon}</span>` : '';
        const typeBadge = t.type === 'routine'
          ? `<span class="timer-tag-type routine">Routine (${t.steps ? t.steps.length : 1} Steps)</span>`
          : '';
        const activeBadge = isCurrentlyActive
          ? `<span class="timer-tag-type active-now">Running</span>`
          : '';

        const playBtnClass = isCurrentlyActive ? 'timer-play-btn running' : 'timer-play-btn';
        const playBtnIcon = isCurrentlyActive ? '⏸' : '▶';

        html += `
          <div class="timer-card-row" data-id="${t.id}">
            <div class="timer-info">
              <div class="timer-label-row">
                ${iconSpan}
                <span>${escapeHtml(t.title)}</span>
                ${typeBadge}
                ${activeBadge}
              </div>
              <div class="timer-duration-display">${formatTime(t.totalSeconds)}</div>
              ${t.notes ? `<div class="timer-sub-steps">${escapeHtml(t.notes)}</div>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="${playBtnClass}" data-id="${t.id}" title="${isCurrentlyActive ? 'Pause' : 'Start'} Timer">
                ${playBtnIcon}
              </button>
              <button class="timer-delete-btn" data-id="${t.id}" title="Delete unused timer from history">
                🗑️
              </button>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;

      // Attach Delete handlers (ability to delete unused older timers)
      container.querySelectorAll('.timer-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          if (confirm('Delete this timer from your stored history?')) {
            timers = timers.filter(t => t.id !== id);
            saveTimersToStorage();
            renderTimersList();
            showToast('Deleted timer from history');
          }
        });
      });

      // Attach Play/Pause handlers
      container.querySelectorAll('.timer-play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          handlePlayTimerClick(id);
        });
      });

      // Clicking row opens execution player
      container.querySelectorAll('.timer-card-row').forEach(row => {
        row.addEventListener('click', () => {
          const id = row.getAttribute('data-id');
          openActivePlayer(id);
        });
      });
    }

    // --- 5. TIMER EXECUTION ENGINE ---
    function handlePlayTimerClick(id) {
      if (activeTimer && activeTimer.id === id) {
        if (isRunning) {
          pauseActiveTimer();
        } else {
          resumeActiveTimer();
          openActivePlayer(id);
        }
      } else {
        startTimer(id);
        openActivePlayer(id);
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
    }

    function pauseActiveTimer() {
      isRunning = false;
      clearInterval(timerInterval);
      updatePlayerUI();
      renderTimersList();
    }

    function resumeActiveTimer() {
      if (!activeTimer) return;
      isRunning = true;
      runTimerLoop();
      updatePlayerUI();
      renderTimersList();
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
        // Routine or timer complete! Check repeats
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

    function completeTimer() {
      isRunning = false;
      clearInterval(timerInterval);
      playChime('done');
      showToast(`🎉 "${activeTimer.title}" Completed!`);
      secondsRemaining = 0;
      updatePlayerUI();
      renderTimersList();
    }

    // --- 6. FULLSCREEN ACTIVE EXECUTION PLAYER ---
    function openActivePlayer(id) {
      if (!activeTimer || activeTimer.id !== id) {
        startTimer(id);
      }
      document.getElementById('activePlayerScreen').classList.add('open');
      updatePlayerUI();
    }

    function closeActivePlayer() {
      document.getElementById('activePlayerScreen').classList.remove('open');
      renderTimersList();
    }

    function updatePlayerUI() {
      if (!activeTimer) return;

      const headerTitle = document.getElementById('playerHeaderRoutineName');
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

      headerTitle.textContent = activeTimer.title;

      if (isStopwatch) {
        digits.textContent = formatTime(stopwatchElapsed);
        stepTag.textContent = 'Stopwatch (Count-Up)';
        taskTitle.textContent = activeTimer.title;
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
          digits.textContent = (d > 0 ? `${d}d ` : '') + formatTime(rem);
          stepTag.textContent = 'Target Date Countdown';
        } else {
          digits.textContent = '+' + formatTime(Math.abs(diff));
          stepTag.textContent = 'Count Up (Past Target)';
        }
        taskTitle.textContent = activeTimer.title;
        if (adjustRow) adjustRow.style.display = 'none';
        if (lapBtn) lapBtn.style.display = 'none';
        if (lapsBox) lapsBox.style.display = 'none';
        if (targetDesc) {
          targetDesc.style.display = 'block';
          targetDesc.textContent = `Target: ${new Date(activeTimer.targetDate).toLocaleString()}`;
        }
      } else {
        digits.textContent = formatTime(secondsRemaining);
        const steps = activeTimer.steps && activeTimer.steps.length > 0 ? activeTimer.steps : [{ title: activeTimer.title, duration: activeTimer.totalSeconds, notes: activeTimer.notes }];
        const currentStep = steps[currentStepIndex] || steps[0];

        stepTag.textContent = steps.length > 1 ? `Step ${currentStepIndex + 1} of ${steps.length}` : (activeTimer.repeats > 1 ? `Repeat ${(activeTimer.currentRepeat || 1)} of ${activeTimer.repeats}` : `Single Timer`);
        taskTitle.textContent = currentStep.title;

        if (adjustRow) adjustRow.style.display = 'flex';
        if (lapBtn) lapBtn.style.display = 'none';
        if (lapsBox) lapsBox.style.display = 'none';
        if (targetDesc) targetDesc.style.display = 'none';
      }

      const steps = activeTimer.steps && activeTimer.steps.length > 0 ? activeTimer.steps : [{ title: activeTimer.title, duration: activeTimer.totalSeconds, notes: activeTimer.notes }];
      const currentStep = steps[currentStepIndex] || steps[0];

      if (currentStep && currentStep.notes && currentStep.notes.trim()) {
        notesText.textContent = currentStep.notes.trim();
        notesBox.style.display = 'block';
      } else {
        notesBox.style.display = 'none';
      }

      // Play/Pause button
      if (isRunning) {
        playBtn.textContent = '⏸';
        playBtn.classList.remove('paused');
      } else {
        playBtn.textContent = '▶';
        playBtn.classList.add('paused');
      }

      // Progress Ring calculation
      const circumference = 2 * Math.PI * 130; // ~816.8
      if (!isStopwatch && stepTotalSeconds > 0) {
        const fraction = Math.max(0, Math.min(1, secondsRemaining / stepTotalSeconds));
        const offset = circumference * (1 - fraction);
        ringFill.style.strokeDashoffset = offset;
      } else {
        ringFill.style.strokeDashoffset = 0;
      }
    }

    // --- 7. "ADD TIMER" SHEET & TEMPLATES (Screenshots 2 & 3) ---
    function openAddSheet() {
      document.getElementById('addTimerSheet').classList.add('open');
    }
    function closeAddSheet() {
      document.getElementById('addTimerSheet').classList.remove('open');
    }

    function setupQuickTimers() {
      document.querySelectorAll('.quick-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const sec = parseInt(btn.getAttribute('data-sec'), 10);
          const title = `${sec < 60 ? sec + 's' : Math.floor(sec/60) + 'm'} Quick Timer`;
          const newTimer = {
            id: 'qt-' + Date.now(),
            title: title,
            type: 'timer',
            folder: 'work',
            totalSeconds: sec,
            notes: 'Quick countdown timer',
            steps: [{ title: title, duration: sec, notes: 'Quick countdown' }]
          };
          timers.unshift(newTimer);
          saveTimersToStorage();
          closeAddSheet();
          renderTimersList();
          handlePlayTimerClick(newTimer.id);
        });
      });
    }

    function setupTemplates() {
      // EMOM
      document.getElementById('tmplEmomRow').addEventListener('click', () => {
        const emom = {
          id: 'tmpl-emom-' + Date.now(),
          title: 'EMOM Workout',
          icon: '🔄',
          type: 'routine',
          folder: 'workout',
          totalSeconds: 600,
          notes: 'Every Minute On the Minute — 10 rounds of 60s',
          steps: Array.from({ length: 10 }, (_, i) => ({
            title: `EMOM Round ${i + 1}`,
            duration: 60,
            notes: 'Perform required reps, rest for remainder of minute'
          }))
        };
        saveAndLaunchRoutine(emom);
      });

      // Tabata Workout
      document.getElementById('tmplTabataRow').addEventListener('click', () => {
        const tabataSteps = [];
        for (let r = 1; r <= 8; r++) {
          tabataSteps.push({ title: `Tabata Round ${r} (Work)`, duration: 20, notes: 'Maximum explosive output' });
          tabataSteps.push({ title: `Rest Interval ${r}`, duration: 10, notes: 'Deep recovery breathing' });
        }
        const tabata = {
          id: 'tmpl-tabata-' + Date.now(),
          title: 'Tabata Workout (4 mins)',
          icon: '⚡',
          type: 'routine',
          folder: 'workout',
          totalSeconds: 240,
          notes: '8 rounds of 20s maximum effort / 10s recovery',
          steps: tabataSteps
        };
        saveAndLaunchRoutine(tabata);
      });

      // Pomodoro
      document.getElementById('tmplPomodoroRow').addEventListener('click', () => {
        const pomodoro = {
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
        };
        saveAndLaunchRoutine(pomodoro);
      });

      // 30 min Seq Tabata
      document.getElementById('tmplSeqTabataRow').addEventListener('click', () => {
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
        const seqTabata = {
          id: 'tmpl-seq-tabata-' + Date.now(),
          title: '30 min Seq Tabata exercise',
          icon: '🔄',
          type: 'routine',
          folder: 'workout',
          totalSeconds: totalSec,
          notes: 'Comprehensive 30m sequential interval training',
          steps: steps
        };
        saveAndLaunchRoutine(seqTabata);
      });

      // Harvard Top 3 Sprint
      document.getElementById('tmplHarvardRow').addEventListener('click', () => {
        const harvard = {
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
        };
        saveAndLaunchRoutine(harvard);
      });
    }

    function saveAndLaunchRoutine(routine) {
      timers.unshift(routine);
      saveTimersToStorage();
      closeAddSheet();
      renderTimersList();
      handlePlayTimerClick(routine.id);
      showToast(`Created & Started "${routine.title}"!`);
    }

    // --- 8. INITIALIZATION & EVENT LISTENERS ---
    document.addEventListener('DOMContentLoaded', () => {
      loadTimersFromStorage();
      renderTimersList();
      setupQuickTimers();
      setupTemplates();

      // Check for ?load= query parameter to auto-start routine from AI Planner
      const urlParams = new URLSearchParams(window.location.search);
      const loadId = urlParams.get('load');
      if (loadId) {
        let targetId = loadId;
        if (loadId === 'active') {
          const act = localStorage.getItem(STORAGE_KEY_ACTIVE_ROUTINE);
          if (act) {
            try { targetId = JSON.parse(act).id; } catch(e) {}
          }
        }
        const found = timers.find(t => t.id === targetId);
        if (found) {
          setTimeout(() => {
            handlePlayTimerClick(found.id);
            showToast(`Loaded "${found.title}"`);
          }, 200);
        }
      }

      // Top Navigation Folder Filter & Dynamic Categories
      renderFolderBar();
      renderFolderSelectOptions();

      // Manage Folders Modal Listeners
      const closeMgmtBtn = document.getElementById('closeManageFoldersBtn');
      if (closeMgmtBtn) closeMgmtBtn.addEventListener('click', closeManageFoldersModal);

      const addFolderBtn = document.getElementById('addFolderBtn');
      if (addFolderBtn) {
        addFolderBtn.addEventListener('click', () => {
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
        });
      }

      // Segmented Control (All | Active)
      document.getElementById('segAllBtn').addEventListener('click', () => {
        document.getElementById('segAllBtn').classList.add('active');
        document.getElementById('segActiveBtn').classList.remove('active');
        currentSegment = 'all';
        renderTimersList();
      });

      document.getElementById('segActiveBtn').addEventListener('click', () => {
        document.getElementById('segActiveBtn').classList.add('active');
        document.getElementById('segAllBtn').classList.remove('active');
        currentSegment = 'active';
        renderTimersList();
      });

      // Plus Button -> Add Sheet
      document.getElementById('openAddTimerBtn').addEventListener('click', openAddSheet);
      document.getElementById('closeAddSheetBtn').addEventListener('click', closeAddSheet);

      // Sheet backdrop click closes
      document.getElementById('addTimerSheet').addEventListener('click', (e) => {
        if (e.target.id === 'addTimerSheet') closeAddSheet();
      });

      // =========================================================
      // TIMER+ CREATOR CONTROLS (Timer, Stopwatch, Countdown, Routine)
      // =========================================================
      document.getElementById('createSingleTimerRow').addEventListener('click', () => {
        closeAddSheet();
        setCreatorMode('timer');
      });

      document.getElementById('createStopwatchRow').addEventListener('click', () => {
        closeAddSheet();
        setCreatorMode('stopwatch');
      });

      document.getElementById('createCountdownRow').addEventListener('click', () => {
        closeAddSheet();
        setCreatorMode('countdown');
      });

      document.getElementById('createRoutineRow').addEventListener('click', () => {
        closeAddSheet();
        setCreatorMode('routine');
      });

      // Add Step to Routine Builder
      const addStepBtn = document.getElementById('addRoutineStepBtn');
      if (addStepBtn) {
        addStepBtn.addEventListener('click', () => {
          currentRoutineSteps.push({
            title: `Step ${currentRoutineSteps.length + 1}`,
            duration: 5 * 60,
            notes: ''
          });
          renderRoutineStepsBuilder();
        });
      }

      document.getElementById('cancelCustomModalBtn').addEventListener('click', () => {
        document.getElementById('customTimerModal').classList.remove('open');
      });

      document.getElementById('saveCustomModalBtn').addEventListener('click', () => {
        const mode = currentCreatorMode;
        const title = document.getElementById('customLabelInput').value.trim() || 'Timer';
        const folder = document.getElementById('customFolderSelect').value || 'work';
        const notes = document.getElementById('customNotesInput').value.trim();

        if (mode === 'timer') {
          const hrs = parseInt(document.getElementById('customHoursInput').value, 10) || 0;
          const mins = parseInt(document.getElementById('customMinutesInput').value, 10) || 0;
          const secs = parseInt(document.getElementById('customSecondsInput').value, 10) || 0;
          const repeats = parseInt(document.getElementById('customRepeatsSelect').value, 10) || 1;
          const total = hrs * 3600 + mins * 60 + secs;

          if (total <= 0) {
            alert('Please enter a duration greater than 0 seconds.');
            return;
          }

          const newTimer = {
            id: 't-' + Date.now(),
            title: title,
            type: 'timer',
            folder: folder,
            totalSeconds: total,
            repeats: repeats,
            notes: notes,
            steps: [{ title: title, duration: total, notes: notes }]
          };

          timers.unshift(newTimer);
          saveTimersToStorage();
          document.getElementById('customTimerModal').classList.remove('open');
          renderTimersList();
          showToast(`Saved Timer "${title}"!`);
        } else if (mode === 'stopwatch') {
          const sw = {
            id: 'sw-' + Date.now(),
            title: title || 'Stopwatch',
            icon: '⏱',
            type: 'stopwatch',
            folder: folder,
            totalSeconds: 0,
            elapsed: 0,
            notes: notes || 'Count-up session with lap recording',
            steps: [{ title: title || 'Stopwatch', duration: 0, notes: notes }]
          };
          timers.unshift(sw);
          saveTimersToStorage();
          document.getElementById('customTimerModal').classList.remove('open');
          renderTimersList();
          showToast(`Created Stopwatch "${title}"!`);
          openActivePlayer(sw.id);
        } else if (mode === 'countdown') {
          const targetStr = document.getElementById('customTargetDateInput').value;
          if (!targetStr) {
            alert('Please select a target date and time.');
            return;
          }
          const targetDateObj = new Date(targetStr);
          const diffSec = Math.max(0, Math.round((targetDateObj.getTime() - Date.now()) / 1000));

          const cd = {
            id: 'cd-' + Date.now(),
            title: title || 'Target Countdown',
            icon: '📅',
            type: 'countdown',
            folder: folder,
            targetDate: targetDateObj.toISOString(),
            totalSeconds: diffSec,
            notes: notes || `Target: ${targetDateObj.toLocaleDateString()}`,
            steps: [{ title: title, duration: diffSec, notes: notes }]
          };
          timers.unshift(cd);
          saveTimersToStorage();
          document.getElementById('customTimerModal').classList.remove('open');
          renderTimersList();
          showToast(`Saved Countdown "${title}"!`);
        } else if (mode === 'routine') {
          if (!currentRoutineSteps || currentRoutineSteps.length === 0) {
            alert('Please add at least one step to your routine.');
            return;
          }
          const rounds = parseInt(document.getElementById('customRoundsInput').value, 10) || 1;
          const compiledSteps = [];
          for (let r = 1; r <= rounds; r++) {
            currentRoutineSteps.forEach(s => {
              compiledSteps.push({
                title: rounds > 1 ? `${s.title} (Round ${r})` : s.title,
                duration: s.duration,
                notes: s.notes || notes
              });
            });
          }
          const totalSec = compiledSteps.reduce((sum, s) => sum + s.duration, 0);

          const newRoutine = {
            id: 'rt-' + Date.now(),
            title: title || 'Custom Routine',
            icon: '🗂',
            type: 'routine',
            folder: folder,
            totalSeconds: totalSec,
            rounds: rounds,
            notes: notes || `${compiledSteps.length} segments (${Math.floor(totalSec/60)}m)`,
            steps: compiledSteps
          };

          timers.unshift(newRoutine);
          saveTimersToStorage();
          document.getElementById('customTimerModal').classList.remove('open');
          renderTimersList();
          showToast(`Saved Routine "${title}" (${compiledSteps.length} Steps)!`);
        }
      });

      // Stopwatch Lap recording button
      const lapBtn = document.getElementById('playerLapBtn');
      if (lapBtn) {
        lapBtn.addEventListener('click', () => {
          if (!isStopwatch) return;
          const lapNum = stopwatchLaps.length + 1;
          const lapTime = formatTime(stopwatchElapsed);
          stopwatchLaps.unshift({ num: lapNum, time: lapTime });
          
          const lapsBox = document.getElementById('playerLapsBox');
          const lapsList = document.getElementById('playerLapsList');
          if (lapsBox && lapsList) {
            lapsBox.style.display = 'block';
            lapsList.innerHTML = stopwatchLaps.map(l => `
              <div class="lap-row">
                <span>Lap ${l.num}</span>
                <span style="font-family: monospace; font-weight: 600;">${l.time}</span>
              </div>
            `).join('');
          }
          showToast(`Lap ${lapNum}: ${lapTime}`);
        });
      }

      // On-the-fly adjustment buttons
      const btnMinus1m = document.getElementById('btnAdjustMinus1m');
      const btnPlus1m = document.getElementById('btnAdjustPlus1m');
      const btnPlus5m = document.getElementById('btnAdjustPlus5m');
      if (btnMinus1m) btnMinus1m.onclick = () => adjustActiveTime(-60);
      if (btnPlus1m) btnPlus1m.onclick = () => adjustActiveTime(60);
      if (btnPlus5m) btnPlus5m.onclick = () => adjustActiveTime(300);

      // Player Controls
      document.getElementById('minimizePlayerBtn').addEventListener('click', closeActivePlayer);
      document.getElementById('playerPlayPauseBtn').addEventListener('click', () => {
        if (isRunning) {
          pauseActiveTimer();
        } else {
          resumeActiveTimer();
        }
      });
      document.getElementById('playerResetBtn').addEventListener('click', () => {
        if (!activeTimer) return;
        const steps = activeTimer.steps && activeTimer.steps.length > 0 ? activeTimer.steps : [{ title: activeTimer.title, duration: activeTimer.totalSeconds }];
        const currentStep = steps[currentStepIndex] || steps[0];
        secondsRemaining = currentStep.duration;
        stepTotalSeconds = currentStep.duration;
        updatePlayerUI();
      });
      document.getElementById('playerNextBtn').addEventListener('click', advanceToNextStep);

      // Sound Mute Toggle
      document.getElementById('toggleMuteBtn').addEventListener('click', () => {
        isMuted = !isMuted;
        document.getElementById('toggleMuteBtn').textContent = isMuted ? '🔇' : '🔔';
        showToast(isMuted ? 'Muted' : 'Sound Alerts Enabled');
      });

      // History Button
      document.getElementById('historyBtn').addEventListener('click', () => {
        alert('Session Log: All timer executions are automatically tracked in your browser storage.');
      });

      // Menu Button (Options)
      document.getElementById('menuBtn').addEventListener('click', () => {
        const choice = confirm('Options:\n- Click OK to Reset Timers to Default\n- Click Cancel to Return');
        if (choice) {
          timers = [...DEFAULT_TIMERS];
          saveTimersToStorage();
          renderTimersList();
          showToast('Reset to Default Timers');
        }
      });
    });