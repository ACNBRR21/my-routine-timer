// =========================================================
// ANCHOR & FLOW — USER PROFILE, CALENDAR LINK & DEDUPE ENGINE
// =========================================================

const STORAGE_KEY_PROFILE = 'anchor_flow_user_profile';
const STORAGE_KEY_TIMERS = 'anchor_flow_timers';
const STORAGE_KEY_ACTIVE_ROUTINE = 'anchor_flow_active_routine';
const COOKIE_USER_NAME = 'af_username';
const COOKIE_PREFS = 'af_prefs';

// Cookie Helpers
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

// Initial Default Profile (Comprehensive, customizable via profile.html)
const defaultUserProfile = {
  userName: 'Alex Smith',
  userTitle: 'Product Strategist & Architect',
  hasCompletedOnboarding: true,
  
  // Daily Regular Routine Timings
  typicalWakeTime: '07:30',
  workStartTime: '09:00',
  breakfastTime: '08:30',
  lunchTime: '13:00',
  lunchDuration: 45,
  dinnerTime: '19:30',
  sleepTarget: '23:00',
  
  // Focus Preferences
  preferredFocusDuration: 45, // minutes
  preferredBreakDuration: 5,  // minutes
  
  // Linked Calendar Share URLs (iCal / Webcal / ICS)
  linkedCalendars: [
    {
      id: 'cal-1',
      name: 'Work Outlook Calendar',
      url: 'https://outlook.office.com/owa/calendar/sample-work-token/reachcalendar.ics',
      type: 'outlook',
      color: '#0078d4',
      enabled: true,
      lastSync: new Date().toISOString()
    },
    {
      id: 'cal-2',
      name: 'Personal Google Calendar',
      url: 'https://calendar.google.com/calendar/ical/sample-user%40gmail.com/public/basic.ics',
      type: 'google',
      color: '#34a853',
      enabled: true,
      lastSync: new Date().toISOString()
    }
  ],
  
  // Daily Calendar Events (pre-populated with sample dual-calendar meetings to demonstrate live deduplication!)
  calendarEvents: [
    {
      id: 'ev-1',
      title: 'Executive Sprint Sync',
      startTime: '10:00',
      endTime: '10:45',
      duration: 45,
      calendarName: 'Work Outlook Calendar',
      sourceType: 'outlook',
      isAnchor: true
    },
    {
      id: 'ev-2',
      title: 'Executive Sprint Sync', // Duplicate event from Google to test deduplication!
      startTime: '10:00',
      endTime: '10:45',
      duration: 45,
      calendarName: 'Personal Google Calendar',
      sourceType: 'google',
      isAnchor: true
    },
    {
      id: 'ev-3',
      title: 'Healthy Lunch & Bio-Break',
      startTime: '13:00',
      endTime: '13:45',
      duration: 45,
      calendarName: 'Daily Routine Anchor',
      sourceType: 'routine',
      isAnchor: true
    },
    {
      id: 'ev-4',
      title: 'Product Design Review',
      startTime: '15:30',
      endTime: '16:30',
      duration: 60,
      calendarName: 'Work Outlook Calendar',
      sourceType: 'outlook',
      isAnchor: true
    },
    {
      id: 'ev-5',
      title: 'Evening Walk & Mobility',
      startTime: '18:00',
      endTime: '18:30',
      duration: 30,
      calendarName: 'Daily Routine Anchor',
      sourceType: 'routine',
      isAnchor: true
    }
  ],
  
  // Daily Wellness
  wellness: {
    steps: 6240,
    stepsGoal: 10000,
    waterLiters: 1.5,
    waterGoal: 2.5,
    healthyEatingScore: '85%',
    sleepDuration: '7h 12m'
  },
  
  // Statistics
  stats: {
    tasksDone: 24,
    tasksInProgress: 5,
    tasksCompletedMonth: 56,
    focusHoursWeek: 18.5,
    focusHoursToday: 2.5,
    streakDays: 12
  }
};

// Initial Default Timers (stored in history with direct delete option!)
const defaultStoredTimers = [
  {
    id: 't-1',
    title: '15:00 Focus Sprint',
    type: 'timer',
    folder: 'work',
    totalSeconds: 15 * 60,
    notes: 'High-intensity execution sprint'
  },
  {
    id: 't-2',
    title: '22:00 Deep Work',
    type: 'timer',
    folder: 'work',
    totalSeconds: 22 * 60,
    notes: '22-minute single-task block'
  },
  {
    id: 't-3',
    title: '🧴 Eye drops (Glaucoma Care)',
    icon: '🧴',
    type: 'timer',
    folder: 'health',
    totalSeconds: 90 * 60, // 1:30:00+
    notes: 'Carefully administer prescribed eye drops and rest vision'
  },
  {
    id: 't-4',
    title: '30:00 Harvard Block',
    type: 'timer',
    folder: 'work',
    totalSeconds: 30 * 60,
    notes: '30-minute timebox'
  },
  {
    id: 't-5',
    title: '🧴 Eye drops (Secondary Dose)',
    icon: '🧴',
    type: 'timer',
    folder: 'health',
    totalSeconds: 75 * 60, // 1:15:00
    notes: 'Secondary hydration dose for eyes'
  },
  {
    id: 't-6',
    title: '30 min Seq Tabata exercise',
    icon: '🔄',
    type: 'routine',
    folder: 'workout',
    totalSeconds: 30 * 60,
    notes: 'Warmup 5m, 8 Tabata rounds (20s work / 10s rest), cooldown 5m'
  }
];

// --- 2. PROFILE & STORAGE ENGINE ---
function getStoredProfile() {
  const cookieName = getCookie(COOKIE_USER_NAME);
  const cookiePrefsRaw = getCookie(COOKIE_PREFS);

  const localRaw = localStorage.getItem(STORAGE_KEY_PROFILE);
  let localData = null;
  if (localRaw) {
    try { localData = JSON.parse(localRaw); } catch(e) {}
  }

  let cookiePrefs = {};
  if (cookiePrefsRaw) {
    try { cookiePrefs = JSON.parse(cookiePrefsRaw); } catch(e) {}
  }

  const profile = {
    ...defaultUserProfile,
    ...(localData || {}),
    ...cookiePrefs
  };

  if (cookieName) {
    profile.userName = cookieName;
  }

  return profile;
}

function saveStoredProfile(profile) {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  if (profile.userName) {
    setCookie(COOKIE_USER_NAME, profile.userName, 365);
  }
  const minPrefs = {
    userName: profile.userName,
    lunchTime: profile.lunchTime,
    workStartTime: profile.workStartTime,
    preferredFocusDuration: profile.preferredFocusDuration
  };
  setCookie(COOKIE_PREFS, JSON.stringify(minPrefs), 365);
}

function getStoredTimers() {
  const raw = localStorage.getItem(STORAGE_KEY_TIMERS);
  if (raw) {
    try { return JSON.parse(raw); } catch(e) {}
  }
  saveStoredTimers(defaultStoredTimers);
  return [...defaultStoredTimers];
}

function saveStoredTimers(timers) {
  localStorage.setItem(STORAGE_KEY_TIMERS, JSON.stringify(timers));
}

function deleteTimerFromStorage(timerId) {
  const current = getStoredTimers();
  const updated = current.filter(t => t.id !== timerId);
  saveStoredTimers(updated);
  return updated;
}

// --- 3. INTELLIGENT MULTI-CALENDAR DEDUPLICATION ENGINE ---
// If user has multiple linked calendars (e.g. Outlook & Google) with the same meeting,
// Anchor & Flow merges them intelligently and only displays one clean entry!
function deduplicateCalendarEvents(events) {
  if (!events || !Array.isArray(events)) return [];

  const deduplicated = [];
  const signatureMap = new Map();

  events.forEach(ev => {
    // Normalized signature: title alphanumeric + startTime
    const cleanTitle = (ev.title || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const timeKey = (ev.startTime || '').trim();
    const signature = `${cleanTitle}_${timeKey}`;

    if (!signatureMap.has(signature)) {
      signatureMap.set(signature, {
        ...ev,
        sources: [ev.calendarName || 'Calendar']
      });
      deduplicated.push(signature);
    } else {
      // Duplicate meeting found across multiple calendars!
      const existing = signatureMap.get(signature);
      const src = ev.calendarName || 'Secondary Calendar';
      if (!existing.sources.includes(src)) {
        existing.sources.push(src);
      }
      existing.isDeduplicated = true;
      existing.dedupeNote = `Unified across: ${existing.sources.join(' & ')}`;
    }
  });

  // Extract merged list and sort chronologically by startTime
  const result = deduplicated.map(sig => signatureMap.get(sig));
  result.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  return result;
}

// --- 4. EXPORT HELPERS (TXT & JSON) ---
function generatePreferencesText(profile) {
  return `ANCHOR & FLOW — USER PROFILE & PREFERENCES
==================================================
User Name: ${profile.userName || 'Not set'}
Role / Focus: ${profile.userTitle || 'Not set'}
Work Start Time: ${profile.workStartTime || '09:00'}
Breakfast Time: ${profile.breakfastTime || '08:30'}
Lunch Time: ${profile.lunchTime || '13:00'} (${profile.lunchDuration || 45} mins)
Dinner Time: ${profile.dinnerTime || '19:30'}
Preferred Focus Duration: ${profile.preferredFocusDuration || 45} mins

Linked Calendar URLs:
${(profile.linkedCalendars && profile.linkedCalendars.length > 0)
  ? profile.linkedCalendars.map(c => ` - ${c.name} (${c.type}): ${c.url}`).join('\n')
  : ' - None linked'}

Methodology: Harvard Timeboxing (Top 3 Daily Priorities) & Serial Tasking
Care Routine Note: Mother's Glaucoma Eye Drops Infallible Presets Active.
Storage: Stored securely and privately on this local device.
Last Updated: ${new Date().toLocaleString()}
==================================================`;
}

function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Toast Notification
function showAppToast(msg) {
  let toast = document.getElementById('appToastPill');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToastPill';
    toast.className = 'toast-pill';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}
