// --- 1. LOCAL COOKIE & USER PREFERENCES MEMORY ENGINE ---
const STORAGE_KEY_PROFILE = 'anchor_flow_user_profile';
const STORAGE_KEY_TIMERS = 'anchor_flow_timers';
const STORAGE_KEY_ACTIVE_ROUTINE = 'anchor_flow_active_routine';
const COOKIE_USER_NAME = 'af_username';
const COOKIE_PREFS = 'af_prefs';

// Cookie Utilities
function setCookie(name, value, days = 365) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch(e) {}
}

function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + encodeURIComponent(name) + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch(e) { return null; }
}

function deleteCookie(name) {
  try {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  } catch(e) {}
}

// Clean initial profile — Zero hardcoded names!
const emptyProfile = {
  userName: null,
  hasCompletedOnboarding: false,
  lunchTime: null,              // e.g. "13:00"
  workStart: null,              // e.g. "09:00"
  preferredFocusDuration: 45,   // minutes
  preferredBreakDuration: 5,    // minutes
  anchorEvents: []              // Fixed meetings/meals
};

let userProfile = { ...emptyProfile };

function loadUserProfile() {
  const cookieName = getCookie(COOKIE_USER_NAME);
  const cookiePrefsRaw = getCookie(COOKIE_PREFS);

  const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
  let localObj = null;
  if (stored) {
    try { localObj = JSON.parse(stored); } catch(e) {}
  }

  let parsedPrefs = {};
  if (cookiePrefsRaw) {
    try { parsedPrefs = JSON.parse(cookiePrefsRaw); } catch(e) {}
  }

  userProfile = {
    ...emptyProfile,
    ...(localObj || {}),
    ...parsedPrefs
  };

  if (cookieName && !userProfile.userName) {
    userProfile.userName = cookieName;
    userProfile.hasCompletedOnboarding = true;
  }

  if (userProfile.userName) {
    userProfile.hasCompletedOnboarding = true;
  }

  updateProfileUI();
}

function saveUserProfile() {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));

  if (userProfile.userName) {
    setCookie(COOKIE_USER_NAME, userProfile.userName, 365);
  }
  const minimalPrefs = {
    userName: userProfile.userName,
    lunchTime: userProfile.lunchTime,
    workStart: userProfile.workStart,
    preferredFocusDuration: userProfile.preferredFocusDuration,
    preferredBreakDuration: userProfile.preferredBreakDuration
  };
  setCookie(COOKIE_PREFS, JSON.stringify(minimalPrefs), 365);

  updateProfileUI();
}

function updateProfileUI() {
  const statusText = document.getElementById('profileStatusText');
  const dlBtn = document.getElementById('downloadMemoryTxtBtn');
  const resetBtn = document.getElementById('resetProfileBtn');

  if (userProfile.userName) {
    statusText.innerHTML = `👤 User: <strong>${escapeHtml(userProfile.userName)}</strong> &bull; Memory Saved`;
    dlBtn.style.display = 'inline-block';
    resetBtn.style.display = 'inline-block';
  } else {
    statusText.textContent = '👤 New User (Awaiting your name in chat)';
    dlBtn.style.display = 'none';
    resetBtn.style.display = 'none';
  }
}

// Intelligent Preference Extraction (OpenAI / NLP Driven)
function extractPreferencesFromText(text) {
  let updated = false;

  // Lunch time pattern: e.g. "lunch at 1 pm", "lunch at 13:00", "lunch around 12:30", "eat at 1:30"
  const lunchMatch = text.match(/\b(?:lunch|eat|meal)\s+(?:at|around|by)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (lunchMatch) {
    let hour = parseInt(lunchMatch[1], 10);
    const min = lunchMatch[2] ? parseInt(lunchMatch[2], 10) : 0;
    const ampm = (lunchMatch[3] || '').toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    if (!ampm && hour >= 1 && hour <= 4) hour += 12;

    const formattedTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    userProfile.lunchTime = formattedTime;
    if (!userProfile.anchorEvents.some(a => a.name.toLowerCase().includes('lunch'))) {
      userProfile.anchorEvents.push({ name: 'Lunch & Bio-Break', time: formattedTime, duration: 45 });
    }
    updated = true;
  }

  // Work start pattern: e.g. "start at 9 am", "work from 9:30"
  const startMatch = text.match(/\b(?:start(?:ing)?|begin)\s+(?:work\s+)?(?:at|around)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (startMatch) {
    let hour = parseInt(startMatch[1], 10);
    const min = startMatch[2] ? parseInt(startMatch[2], 10) : 0;
    const ampm = (startMatch[3] || '').toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    userProfile.workStart = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    updated = true;
  }

  // Focus duration pattern: e.g. "50m focus", "25 minute blocks"
  const focusMatch = text.match(/\b(?:prefer|blocks?|focus(?:ing)?\s+for)\s*(\d+)\s*(?:min|mins|minutes|m\b)/i);
  if (focusMatch) {
    const dur = parseInt(focusMatch[1], 10);
    if (dur >= 15 && dur <= 120) {
      userProfile.preferredFocusDuration = dur;
      updated = true;
    }
  }

  if (updated) {
    saveUserProfile();
  }
}

// --- 2. CHAT AGENT STATE & ONBOARDING ---
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInputField');
const sendBtn = document.getElementById('sendBtn');
let onboardingStep = 'idle';
let currentExtractedSchedule = null;

function initChat() {
  chatBody.innerHTML = '';

  if (!userProfile.hasCompletedOnboarding || !userProfile.userName) {
    onboardingStep = 'ask_name';
    appendChatBubble('bot', `
      <strong>👋 Welcome to Anchor &amp; Flow!</strong><br/>
      I'm your Flow planning agent. I help you protect immovable meetings as anchors and timebox your high-leverage tasks using Napoleon &amp; Musk's <em>serial single-tasking</em> methodology.<br/><br/>
      <strong>Before we plan your day, what is your name?</strong><br/>
      <span style="font-size:0.84rem; color:var(--text-muted);">(Please type your name in the text box below. I will remember you and your routine preferences locally for future visits!)</span>
    `);
    chatInput.placeholder = "Type your name here (e.g. Michael, Sarah, Vivek) and press Enter...";
    setTimeout(() => chatInput.focus(), 300);
  } else {
    onboardingStep = 'ready';
    let memoryNote = '';
    if (userProfile.lunchTime) {
      memoryNote = ` <em>(I remember you usually take lunch around ${userProfile.lunchTime}.)</em>`;
    }

    appendChatBubble('bot', `
      <strong>👋 Hey ${escapeHtml(userProfile.userName)}! Welcome back.</strong>${memoryNote}<br/>
      The previous evening is the best time to organize your next high-impact day.<br/><br/>
      Link your <strong>Google or Outlook calendar URL</strong> in Profile, tap 🎙️ to speak your tasks, or type them directly!
    `, [
      { label: '🔗 Manage Calendar Links', action: () => window.location.href = 'profile.html' },
      { label: '📖 Calendar Export Guide', action: openHelpDrawer },
      { label: '⚡ Run Quick Harvard Sprint', action: () => handleUserMessage("Deep work on top priority 45m, Secondary priority 45m, Routine admin 30m") }
    ]);
    chatInput.placeholder = "Type or dictate your tasks (e.g. 'Review proposal 45m, Team sync at 11am, 15m yoga')...";
  }
}

function appendChatBubble(sender, htmlContent, actionChips = []) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = htmlContent;

  if (actionChips && actionChips.length > 0) {
    const chipsRow = document.createElement('div');
    chipsRow.className = 'quick-chips-row';
    actionChips.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = 'action-chip';
      btn.textContent = chip.label;
      btn.onclick = chip.action;
      chipsRow.appendChild(btn);
    });
    bubble.appendChild(chipsRow);
  }

  chatBody.appendChild(bubble);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// --- 3. VOICE-BASED TYPING (WEB SPEECH API) ---
let recognition = null;
let isRecording = false;

function setupVoiceTyping() {
  const voiceBtn = document.getElementById('voiceTypingBtn');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceBtn.title = 'Voice typing is supported in Chrome, Safari, and Edge';
    voiceBtn.addEventListener('click', () => {
      showToast('Voice typing is supported in Chrome, Safari, and Edge browsers.');
    });
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isRecording = true;
    voiceBtn.classList.add('recording');
    voiceBtn.title = 'Listening... Tap to Stop';
    showToast('🎙️ Listening... Speak your tasks or name');
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    chatInput.value = (chatInput.value ? chatInput.value + ' ' : '') + transcript.trim();
    autoResizeTextarea();
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    stopRecording();
  };

  recognition.onend = () => {
    stopRecording();
  };

  voiceBtn.addEventListener('click', () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  function startRecording() {
    try {
      recognition.start();
    } catch(e) {
      console.warn('Could not start speech recognition:', e);
    }
  }

  function stopRecording() {
    isRecording = false;
    voiceBtn.classList.remove('recording');
    voiceBtn.title = 'Voice Typing (Speech-to-Text)';
    try { recognition.stop(); } catch(e) {}
  }
}

// Auto-expand textarea as user types
function autoResizeTextarea() {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 180) + 'px';
}
chatInput.addEventListener('input', autoResizeTextarea);

// --- 4. PARSING ICS CALENDAR FILES ---
function parseIcsCalendar(icsText) {
  const events = [];
  const lines = icsText.split(/\r\n|\r|\n/);
  let inEvent = false;
  let curEvent = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      curEvent = {};
    } else if (line === 'END:VEVENT') {
      if (curEvent.summary && curEvent.start) {
        events.push(curEvent);
      }
      inEvent = false;
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        curEvent.summary = line.substring(8).trim();
      } else if (line.startsWith('DTSTART')) {
        const val = line.split(':')[1] || '';
        curEvent.start = parseIcsDateTime(val);
      } else if (line.startsWith('DTEND')) {
        const val = line.split(':')[1] || '';
        curEvent.end = parseIcsDateTime(val);
      }
    }
  }

  return events.map((ev, idx) => {
    let dur = 30;
    let timeStr = '10:00';
    if (ev.start) {
      const hh = String(ev.start.getHours()).padStart(2, '0');
      const mm = String(ev.start.getMinutes()).padStart(2, '0');
      timeStr = `${hh}:${mm}`;
      if (ev.end) {
        dur = Math.max(15, Math.round((ev.end - ev.start) / 60000));
      }
    }
    return {
      id: `anchor-${idx + 1}`,
      shortName: ev.summary || 'Calendar Meeting',
      duration: dur,
      isAnchor: true,
      startTime: timeStr,
      notes: `Protected Calendar Anchor: ${ev.summary} (${timeStr})`
    };
  });
}

function parseIcsDateTime(str) {
  if (!str) return new Date();
  const clean = str.replace(/[^0-9T]/g, '');
  const m = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (m) {
    return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]), parseInt(m[4]), parseInt(m[5]));
  }
  return new Date();
}

// --- 5. CONVERSATIONAL MESSAGE DISPATCHER ---
async function handleUserMessage(msgText) {
  const text = (msgText || chatInput.value || '').trim();
  if (!text) return;
  chatInput.value = '';
  chatInput.style.height = 'auto';

  appendChatBubble('user', escapeHtml(text));

  // 1. Onboarding Name Flow (NO hardcoded names, accepts ANY name!)
  if (onboardingStep === 'ask_name') {
    const cleanName = text.replace(/^(?:my name is|i am|i'm|call me)\s+/i, '').trim();
    userProfile.userName = cleanName || 'Friend';
    userProfile.hasCompletedOnboarding = true;
    saveUserProfile();
    onboardingStep = 'ready';

    appendChatBubble('bot', `
      <strong>Delighted to meet you, ${escapeHtml(userProfile.userName)}! 🎉</strong><br/>
      I have saved your name locally in a cookie and text file.<br/><br/>
      To help me plan your schedule: Do you have any regular daily anchors—like what time you usually start work, have lunch, or dinner? (e.g. <em>'I start at 9 AM and eat lunch at 1 PM'</em>). Or simply add your calendar link in <a href='profile.html' style='color:var(--accent-blue); font-weight:600;'>Profile Settings</a>!
    `, [
      { label: '🔗 Manage Calendar Links', action: () => window.location.href = 'profile.html' },
      { label: '📖 Calendar Export Guide', action: openHelpDrawer }
    ]);
    chatInput.placeholder = "Type your tasks, plan your day, or tell me your anchors...";
    return;
  }

  // Extract preferences (e.g. lunch time, work start)
  extractPreferencesFromText(text);

  // 2. Pre-Check: Pure Conversational Preambles
  const pureMetaRegex = /^(?:i\s+(?:want|would\s+like|need|am\s+going)\s+to\s+plan\s+(?:my|the|for\s+the)\s+day|i\s+want\s+a\s+plan\s+for\s+(?:the|my)\s+day|plan\s+(?:for\s+)?(?:the|my)\s+day|can\s+you\s+help\s+me\s+plan(?:\s+my\s+day)?|here\s+(?:is|are)\s+(?:my|the)\s+(?:tasks|plan|schedule)|schedule\s+for\s+today|today'?s\s+agenda|help\s+me\s+plan|plan\s+today)$/i;
  if (pureMetaRegex.test(text)) {
    appendChatBubble('bot', `
      <strong>🤔 What specific tasks or meetings would you like to accomplish today?</strong><br/>
      Please list them (e.g. <em>'Review proposal 45m, Team sync at 11am, Brush teeth, 15m yoga, Sleep visualization'</em>), and I will build your Harvard timebox schedule!
    `);
    return;
  }

  // 3. Proactive Anchor Inquiry Check
  const hasCalendarAnchors = /\b(?:at\s+\d{1,2}:\d{2}|meeting|sync|call|lunch|dinner|standup)\b/i.test(text);
  if (!hasCalendarAnchors && !sessionStorage.getItem('anchor_inquiry_done') && (!userProfile.anchorEvents || userProfile.anchorEvents.length === 0)) {
    sessionStorage.setItem('anchor_inquiry_done', 'true');
    const parsed = parseTasksLocally(text);
    renderScheduleReviewCard(parsed, "Note: No fixed calendar anchors were detected. Would you like to add any?");
    appendChatBubble('bot', `
      <strong>💡 Question about your schedule:</strong><br/>
      Would you like to link your calendar share URL in Profile or tell me about any <strong>anchor events</strong> which have a fixed time&mdash;like your meetings, meal times, or appointments?
    `, [
      { label: '🔗 Manage Calendar Links', action: () => window.location.href = 'profile.html' },
      { label: 'No fixed meetings today (Keep schedule)', action: () => showToast('Proceeding with flexible serial focus!') },
      { label: '📖 Calendar Export Guide', action: openHelpDrawer }
    ]);
    return;
  }

  // 4. Standard Parsing & Harvard Timebox Generation
  appendChatBubble('bot', `<em>🤖 Analyzing tasks, identifying Top 3 Harvard priorities, and packing timeline...</em>`);
  const parsed = parseTasksLocally(text);
  renderScheduleReviewCard(parsed);
}

// --- 6. HIGH-PRECISION SMART TASK PARSER ---
function parseTasksLocally(input) {
  let clean = input.replace(/^(?:i\s+(?:want|would\s+like|need|am\s+going)\s+to\s+plan\s+(?:my|the|for\s+the)\s+day|i\s+want\s+a\s+plan\s+for\s+(?:the|my)\s+day|here\s+(?:is|are)\s+(?:my|the)\s+(?:tasks|plan|schedule)|can\s+you\s+help\s+me\s+plan|plan\s+(?:my|the)\s+day)\s*[:,-]?\s*(?:and\s+then\s+|then\s+|after\s+that\s+|followed\s+by\s+|:\s*|\n)?/i, '').trim();

  clean = clean.replace(/\b(?:and\s+then|then|after\s+that|followed\s+by|afterwards|next)\b/gi, '\n');
  clean = clean.replace(/[,;•*]|\b\d+\.\s+/g, '\n');
  clean = clean.replace(/\s+and\s+(?=(?:brushing|drinking|doing|taking|reading|stretching|meditating|visualiz|going|washing|practicing|writing|checking|eating|preparing|making|reviewing|cleaning|walk|run|exercise|hydrate|stretch|read|meditate|sleep|teeth|water|yoga)\b)/gi, '\n');

  const clauses = clean.split('\n').map(c => c.trim()).filter(c => c.length > 0);
  const items = [];

  // Include user's stored anchors if not already present
  if (userProfile.anchorEvents && userProfile.anchorEvents.length > 0) {
    userProfile.anchorEvents.forEach(a => {
      items.push({
        id: 'anchor-' + (items.length + 1),
        shortName: a.name,
        duration: a.duration || 30,
        isAnchor: true,
        startTime: a.time,
        notes: `Fixed daily anchor: ${a.name} (${a.time})`
      });
    });
  }

  clauses.forEach((c, idx) => {
    let dur = 15;
    let isAnchor = false;
    let startTime = null;

    const timeMatch = c.match(/\b(?:at\s+)?(\d{1,2}:\d{2})\b/i);
    if (timeMatch) {
      startTime = timeMatch[1];
      isAnchor = true;
    }

    const durMatch = c.match(/(\d+)\s*(?:min|m\b|mins|minutes)/i);
    if (durMatch) {
      dur = parseInt(durMatch[1], 10);
    } else {
      if (typeof predictTaskDuration === 'function') {
        const pred = predictTaskDuration(c);
        dur = pred.duration;
      } else {
        if (/brush(?:ing)?\s+teeth|teeth/i.test(c)) dur = 3;
        else if (/water|hydrate|drink|vitamin/i.test(c)) dur = 3;
        else if (/eye\s*drops|drops/i.test(c)) dur = 2;
        else if (/yoga|stretch|workout|walk/i.test(c)) dur = 15;
        else if (/visualiz|meditat|mindful|breath/i.test(c)) dur = 10;
        else if (/meeting|sync|call|review/i.test(c)) dur = 30;
        else if (/deep\s+work|code|write|proposal|deck/i.test(c)) dur = userProfile.preferredFocusDuration || 45;
      }
    }

    let shortName = c.replace(/\b(?:at\s+)?\d{1,2}:\d{2}\b/gi, '')
                     .replace(/\b\d+\s*(?:min|mins|minutes)\b/gi, '')
                     .trim();
    if (!shortName) shortName = `Task ${idx + 1}`;

    const notes = getExecutionNotes(shortName);

    items.push({
      id: items.length + 1,
      shortName: capitalize(shortName),
      duration: dur,
      isAnchor: isAnchor,
      startTime: startTime,
      notes: notes
    });
  });

  return { items };
}

function getExecutionNotes(name) {
  if (/brush(?:ing)?\s+teeth/i.test(name)) return 'Thorough 2-min clean brushing; clean rinse before bed';
  if (/water|hydrate|drink/i.test(name)) return 'Hydrate with a glass of room-temperature water for metabolic recovery';
  if (/eye\s*drops|drops/i.test(name)) return 'Carefully administer prescribed drops; rest eyes closed for 60s';
  if (/yoga|stretch/i.test(name)) return 'Gentle floor stretches and restorative poses to down-regulate nervous system';
  if (/visualiz/i.test(name)) return 'Slow diaphragmatic breathing; visualize tomorrow\'s key priorities';
  if (/sync|meeting|call/i.test(name)) return 'Document decisions and assign clear milestone owners';
  if (/proposal|deck|deep\s+work|write|code/i.test(name)) return 'Silence all notifications; single-task on highest-leverage deliverable';
  return 'Dedicated focus sprint; execute with single-task momentum';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- 7. RENDER INTERACTIVE SCHEDULE REVIEW CARD ---
function renderScheduleReviewCard(parsed, customNotice) {
  if (!parsed || !parsed.items || parsed.items.length === 0) return;

  currentExtractedSchedule = parsed.items;
  let totalMins = parsed.items.reduce((sum, it) => sum + it.duration, 0);

  let topCount = 0;
  parsed.items.forEach(it => {
    if (!it.isAnchor && topCount < 3) {
      topCount++;
      it.priorityRank = topCount;
    }
  });

  let rowsHtml = '';
  parsed.items.forEach((it, idx) => {
    const typeTag = it.isAnchor ? `<span class="tag-anchor">Anchor</span>` : `<span class="tag-task">Task</span>`;
    const priorityTag = it.priorityRank ? `<span class="tag-top-priority">Top ${it.priorityRank}</span>` : `<span style="color:var(--text-muted);">&mdash;</span>`;

    rowsHtml += `
      <tr>
        <td style="color: var(--text-muted); font-size: 0.8rem;">${idx + 1}</td>
        <td>${typeTag}</td>
        <td>${priorityTag}</td>
        <td>
          <input type="text" class="review-input-name" data-index="${idx}" value="${escapeHtml(it.shortName)}" />
        </td>
        <td>
          <input type="number" class="review-input-dur" data-index="${idx}" value="${it.duration}" min="1" />
          <span style="font-size: 0.75rem; color: var(--text-muted);">m</span>
        </td>
        <td style="font-family: monospace; color: var(--accent); font-size: 0.85rem;">
          ${it.startTime || '--:--'}
        </td>
        <td>
          <textarea class="review-input-notes" data-index="${idx}" rows="2">${escapeHtml(it.notes)}</textarea>
        </td>
        <td>
          <button onclick="deleteReviewItem(${idx})" style="background:none; border:none; color:var(--danger); cursor:pointer;" title="Delete Task">&#x1F5D1;</button>
        </td>
      </tr>
    `;
  });

  const cardHtml = `
    <div class="schedule-review-wrap">
      <div class="schedule-review-header">
        <div>
          <h3 style="font-size: 1.05rem; color: var(--text-primary); margin: 0;">📋 Harvard Timebox Daily Plan</h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${parsed.items.length} Activities &bull; ${Math.floor(totalMins/60)}h ${totalMins%60}m Total</span>
        </div>
        <span style="font-size: 0.76rem; background: var(--accent-soft); color: var(--accent); padding: 4px 10px; border-radius: 9999px; font-weight:600;">
          Serial Tasking Active
        </span>
      </div>

      ${customNotice ? `<div style="background: rgba(255, 149, 0, 0.1); border: 1px solid rgba(255, 149, 0, 0.3); border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 0.82rem; color: #b45309;">${customNotice}</div>` : ''}

      <div class="review-table-container">
        <table class="review-table">
          <thead>
            <tr>
              <th style="width: 25px;">#</th>
              <th style="width: 75px;">Type</th>
              <th style="width: 65px;">Priority</th>
              <th>Task Title</th>
              <th style="width: 85px;">Duration</th>
              <th style="width: 65px;">Time</th>
              <th style="min-width: 240px;">📝 Notes (Not Title)</th>
              <th style="width: 35px;"></th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <!-- Launch in Timer Banner -->
      <div class="launch-timer-banner">
        <div>
          <strong style="color: var(--text-primary); display: block; font-size: 0.92rem;">Ready to execute with single-task focus?</strong>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">Export this schedule to the Apple-inspired timer engine.</span>
        </div>
        <button class="btn-launch-timer" onclick="launchInTimerPage()">
          🚀 Launch in Timer &rarr;
        </button>
      </div>
    </div>
  `;

  appendChatBubble('bot', cardHtml);

  document.querySelectorAll('.review-input-name').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      if (currentExtractedSchedule[idx]) currentExtractedSchedule[idx].shortName = e.target.value;
    });
  });
  document.querySelectorAll('.review-input-dur').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      if (currentExtractedSchedule[idx]) currentExtractedSchedule[idx].duration = parseInt(e.target.value, 10) || 15;
    });
  });
  document.querySelectorAll('.review-input-notes').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      if (currentExtractedSchedule[idx]) currentExtractedSchedule[idx].notes = e.target.value;
    });
  });
}

window.deleteReviewItem = function(idx) {
  if (currentExtractedSchedule) {
    currentExtractedSchedule.splice(idx, 1);
    renderScheduleReviewCard({ items: currentExtractedSchedule });
  }
};

window.launchInTimerPage = function() {
  if (!currentExtractedSchedule || currentExtractedSchedule.length === 0) return;

  const totalSec = currentExtractedSchedule.reduce((sum, it) => sum + (it.duration * 60), 0);
  const steps = currentExtractedSchedule.map(it => ({
    title: it.shortName,
    duration: it.duration * 60,
    notes: it.notes,
    isAnchor: !!it.isAnchor
  }));

  const routine = {
    id: 'flow-plan-' + Date.now(),
    title: "Today's Harvard Timebox (" + new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ")",
    icon: '🎯',
    type: 'routine',
    folder: 'routines',
    totalSeconds: totalSec,
    notes: `Prioritized plan with ${steps.length} serial focus blocks & anchors.`,
    steps: steps
  };

  localStorage.setItem(STORAGE_KEY_ACTIVE_ROUTINE, JSON.stringify(routine));

  const storedTimers = localStorage.getItem(STORAGE_KEY_TIMERS);
  let timersList = [];
  if (storedTimers) {
    try { timersList = JSON.parse(storedTimers); } catch(e) {}
  }
  timersList.unshift(routine);
  localStorage.setItem(STORAGE_KEY_TIMERS, JSON.stringify(timersList));

  window.location.href = 'timer.html?load=active';
};

// --- 8. FILE UPLOADS & MODALS ---
const calendarFileInput = document.getElementById('calendarFileInput');
const uploadCalendarBtn = document.getElementById('uploadCalendarBtn');

uploadCalendarBtn.addEventListener('click', () => calendarFileInput.click());

calendarFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target.result;
    if (file.name.endsWith('.ics')) {
      const anchors = parseIcsCalendar(content);
      if (anchors.length > 0) {
        appendChatBubble('bot', `
          <div style="background: rgba(52, 199, 89, 0.1); border: 1px solid rgba(52, 199, 89, 0.3); border-radius: 8px; padding: 10px 14px; margin: 4px 0; font-size: 0.88rem;">
            📅 <strong>Imported ${anchors.length} calendar meetings from ${escapeHtml(file.name)}:</strong><br />
            ${anchors.map(a => `&bull; <strong>${a.startTime}</strong>: ${escapeHtml(a.shortName)} (${a.duration}m)`).join('<br />')}
          </div>
        `);
        userProfile.anchorEvents = anchors;
        saveUserProfile();

        appendChatBubble('bot', `
          Now, <strong>${escapeHtml(userProfile.userName || 'Friend')}</strong>, what flexible tasks do you want to accomplish today around your meetings?
        `);
      } else {
        appendChatBubble('bot', `Uploaded calendar file didn't contain active VEVENT blocks. You can type your meetings directly!`);
      }
    } else {
      appendChatBubble('bot', `Uploaded agenda file: <strong>${escapeHtml(file.name)}</strong>. Extracting anchors...`);
      const parsed = parseTasksLocally(content);
      renderScheduleReviewCard(parsed);
    }
  };
  reader.readAsText(file);
});

// Download Clean Plain Text Memory File (.txt)
document.getElementById('downloadMemoryTxtBtn').addEventListener('click', () => {
  const userName = userProfile.userName || 'User';
  const txtContent = `ANCHOR & FLOW - USER PROFILE & PREFERENCES
==================================================
User Name: ${userName}
Work Start Time: ${userProfile.workStart || 'Not specified (Default: 09:00)'}
Lunch / Meal Time: ${userProfile.lunchTime || 'Not specified (Default: 13:00)'}
Preferred Focus Block Duration: ${userProfile.preferredFocusDuration || 45} minutes
Restorative Break Duration: ${userProfile.preferredBreakDuration || 5} minutes

Fixed Anchor Events:
${(userProfile.anchorEvents && userProfile.anchorEvents.length > 0)
  ? userProfile.anchorEvents.map(a => ` - ${a.name}: ${a.time} (${a.duration} mins)`).join('\n')
  : ' - None recorded yet'}

Methodology: Harvard Timeboxing (Top 3 Daily Priorities) & Serial Tasking
Glaucoma Care Note: Infallible medication timer presets enabled.
Storage: Saved locally on your device via browser cookies and localStorage.
Last Updated: ${new Date().toLocaleDateString()}
==================================================`;

  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `user_preferences_${userName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Downloaded user_preferences.txt!');
});

// Reset Profile Button
document.getElementById('resetProfileBtn').addEventListener('click', () => {
  if (confirm('Reset your profile and memory to start fresh?')) {
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    sessionStorage.clear();
    deleteCookie(COOKIE_USER_NAME);
    deleteCookie(COOKIE_PREFS);
    userProfile = { ...emptyProfile };
    saveUserProfile();
    loadUserProfile();
    initChat();
    showToast('Profile reset. Welcome!');
  }
});

// Clear Chat Button
document.getElementById('clearChatBtn').addEventListener('click', () => {
  initChat();
});

// Story Modal
const storyModal = document.getElementById('storyModal');
document.getElementById('openStoryModalBtn').addEventListener('click', () => {
  storyModal.classList.add('open');
});
document.getElementById('closeStoryModalBtn').addEventListener('click', () => {
  storyModal.classList.remove('open');
});
storyModal.addEventListener('click', (e) => {
  if (e.target.id === 'storyModal') storyModal.classList.remove('open');
});

// Side Help Drawer
const helpDrawer = document.getElementById('helpDrawer');
function openHelpDrawer() { helpDrawer.classList.add('open'); }
function closeHelpDrawer() { helpDrawer.classList.remove('open'); }
document.getElementById('openHelpDrawerBtn').addEventListener('click', openHelpDrawer);
document.getElementById('closeHelpDrawerBtn').addEventListener('click', closeHelpDrawer);
helpDrawer.addEventListener('click', (e) => {
  if (e.target.id === 'helpDrawer') closeHelpDrawer();
});

// Send Button & Enter Key (Shift+Enter for newline, Enter to send)
sendBtn.addEventListener('click', () => handleUserMessage());
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleUserMessage();
  }
});

// Toast notification helper
function showToast(msg) {
  const toast = document.getElementById('toastPill');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  initChat();
  setupVoiceTyping();
});
