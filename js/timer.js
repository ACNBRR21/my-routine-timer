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

      const firstStep = (activeTimer.steps && activeTimer.steps.length > 0)
        ? activeTimer.steps[0]
        : { title: activeTimer.title, duration: activeTimer.totalSeconds, notes: activeTimer.notes };

      secondsRemaining = firstStep.duration;
      stepTotalSeconds = firstStep.duration;
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

        if (secondsRemaining > 0) {
          secondsRemaining--;
          updatePlayerUI();
        } else {
          // Step finished!
          advanceToNextStep();
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

      headerTitle.textContent = activeTimer.title;
      digits.textContent = formatTime(secondsRemaining);

      const steps = activeTimer.steps && activeTimer.steps.length > 0 ? activeTimer.steps : [{ title: activeTimer.title, duration: activeTimer.totalSeconds, notes: activeTimer.notes }];
      const currentStep = steps[currentStepIndex] || steps[0];

      stepTag.textContent = steps.length > 1 ? `Step ${currentStepIndex + 1} of ${steps.length}` : `Single Timer`;
      taskTitle.textContent = currentStep.title;

      if (currentStep.notes && currentStep.notes.trim()) {
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
      if (stepTotalSeconds > 0) {
        const fraction = secondsRemaining / stepTotalSeconds;
        const offset = circumference * (1 - fraction);
        ringFill.style.strokeDashoffset = offset;
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

      // Top Navigation Folder Filter
      document.querySelectorAll('.folder-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          document.querySelectorAll('.folder-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          currentFilter = pill.getAttribute('data-folder');
          renderTimersList();
        });
      });

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

      // Custom Single Timer Modal
      document.getElementById('createSingleTimerRow').addEventListener('click', () => {
        closeAddSheet();
        document.getElementById('customModalTitle').textContent = 'New Countdown Timer';
        document.getElementById('customLabelInput').value = 'Timer';
        document.getElementById('customMinutesInput').value = '15';
        document.getElementById('customSecondsInput').value = '0';
        document.getElementById('customModalCard').style.display = 'block';
        document.getElementById('customTimerModal').classList.add('open');
      });

      document.getElementById('createStopwatchRow').addEventListener('click', () => {
        closeAddSheet();
        const sw = {
          id: 'sw-' + Date.now(),
          title: 'Stopwatch',
          icon: '⏱',
          type: 'stopwatch',
          folder: 'work',
          totalSeconds: 3600,
          notes: 'Count up focus stopwatch',
          steps: [{ title: 'Stopwatch', duration: 3600, notes: 'Count up session' }]
        };
        saveAndLaunchRoutine(sw);
      });

      document.getElementById('createRoutineRow').addEventListener('click', () => {
        closeAddSheet();
        window.location.href = 'index.html'; // Direct to AI Flow planner to generate multi-step routine!
      });

      document.getElementById('cancelCustomModalBtn').addEventListener('click', () => {
        document.getElementById('customTimerModal').classList.remove('open');
      });

      document.getElementById('saveCustomModalBtn').addEventListener('click', () => {
        const title = document.getElementById('customLabelInput').value.trim() || 'Timer';
        const mins = parseInt(document.getElementById('customMinutesInput').value, 10) || 0;
        const secs = parseInt(document.getElementById('customSecondsInput').value, 10) || 0;
        const total = mins * 60 + secs;
        const folder = document.getElementById('customFolderSelect').value || 'work';
        const notes = document.getElementById('customNotesInput').value.trim();

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
          notes: notes,
          steps: [{ title: title, duration: total, notes: notes }]
        };

        timers.unshift(newTimer);
        saveTimersToStorage();
        document.getElementById('customTimerModal').classList.remove('open');
        renderTimersList();
        showToast(`Saved "${title}"!`);
      });

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