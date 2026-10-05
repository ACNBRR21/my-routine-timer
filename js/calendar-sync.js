// =========================================================
// ANCHOR & FLOW — USER PROFILE, CALENDAR LINK & DEDUPE ENGINE
// =========================================================

// Universal HTML Sanitizer Helper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
if (typeof window !== 'undefined') {
  window.escapeHtml = escapeHtml;
}

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

// Initial Default Profile (Clean public defaults, customizable via profile.html)
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
  // Clean default: empty list so public users can add their own Google, Outlook, or Apple calendar URLs
  linkedCalendars: [],
  
  // Daily Calendar Events (pre-populated with sample dual-calendar meetings to demonstrate live deduplication!)
  calendarEvents: [
    {
      id: 'ev-1',
      title: 'Executive Sprint Sync',
      startTime: '10:00',
      endTime: '10:45',
      duration: 45,
      dateStr: new Date().toISOString().split('T')[0],
      isToday: true,
      daysFromToday: 0,
      relativeDay: 'Today',
      calendarName: 'Work Outlook Calendar',
      sourceType: 'outlook',
      isAnchor: true
    },
    {
      id: 'ev-2',
      title: 'Executive Sprint Sync', // Duplicate event from Google to demonstrate live deduplication!
      startTime: '10:00',
      endTime: '10:45',
      duration: 45,
      dateStr: new Date().toISOString().split('T')[0],
      isToday: true,
      daysFromToday: 0,
      relativeDay: 'Today',
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
      dateStr: new Date().toISOString().split('T')[0],
      isToday: true,
      daysFromToday: 0,
      relativeDay: 'Today',
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
      dateStr: new Date().toISOString().split('T')[0],
      isToday: true,
      daysFromToday: 0,
      relativeDay: 'Today',
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
      dateStr: new Date().toISOString().split('T')[0],
      isToday: true,
      daysFromToday: 0,
      relativeDay: 'Today',
      calendarName: 'Daily Routine Anchor',
      sourceType: 'routine',
      isAnchor: true
    },
    {
      id: 'ev-6',
      title: 'Architecture Review & Roadmap',
      startTime: '11:00',
      endTime: '12:00',
      duration: 60,
      dateStr: new Date(Date.now() + 864e5).toISOString().split('T')[0],
      isToday: false,
      daysFromToday: 1,
      relativeDay: 'Tomorrow',
      calendarName: 'Work Outlook Calendar',
      sourceType: 'outlook',
      isAnchor: true
    },
    {
      id: 'ev-7',
      title: 'Client Strategy & Partnership Call',
      startTime: '14:00',
      endTime: '15:00',
      duration: 60,
      dateStr: new Date(Date.now() + 864e5 * 2).toISOString().split('T')[0],
      isToday: false,
      daysFromToday: 2,
      relativeDay: 'In 2 days',
      calendarName: 'Work Outlook Calendar',
      sourceType: 'outlook',
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
    daysActive: 14,
    focusSessionsCompleted: 38,
    totalFocusHours: '28.5h',
    calendarDeduplicationsUnified: 19
  }
};

// Default Stored Timers (Pre-loaded with eye drops care presets)
const defaultStoredTimers = [
  {
    id: 'timer-eye-drop-primary',
    title: "Mother's Eye Drops (Primary)",
    category: 'medication',
    folder: 'medication',
    totalSeconds: 90 * 60, // 1h 30m
    notes: 'Prescribed glaucoma medication interval — exact timing protected'
  },
  {
    id: 'timer-eye-drop-secondary',
    title: "Mother's Eye Drops (Secondary)",
    category: 'medication',
    folder: 'medication',
    totalSeconds: 75 * 60, // 1h 15m
    notes: 'Secondary morning/evening eye drop interval'
  },
  {
    id: 'timer-harvard-sprint',
    title: 'Harvard Focus Block',
    category: 'focus',
    folder: 'focus',
    totalSeconds: 45 * 60, // 45m
    notes: 'Standard single-tasking sprint'
  },
  {
    id: 'timer-pomodoro-classic',
    title: 'Pomodoro Focus Sprint',
    category: 'focus',
    folder: 'focus',
    totalSeconds: 25 * 60, // 25m
    notes: '25m single-task focus with 5m restorative break'
  },
  {
    id: 'timer-deep-work-block',
    title: 'Deep Work Architecture Sprint',
    category: 'deepwork',
    folder: 'deepwork',
    totalSeconds: 50 * 60, // 50m
    notes: 'Complex engineering, writing, and strategic synthesis'
  },
  {
    id: 'timer-restorative-pause',
    title: 'Restorative Bio-Break',
    category: 'break',
    folder: 'break',
    totalSeconds: 5 * 60, // 5m
    notes: 'Step away from screen, hydrate, breathe deeply'
  },
  {
    id: 'timer-tabata-energy',
    title: 'High-Energy Tabata Routine',
    category: 'workout',
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

  // Persistent recovery if linkedCalendars array was empty
  if (!profile.linkedCalendars || profile.linkedCalendars.length === 0) {
    try {
      const backupRaw = localStorage.getItem('anchor_flow_saved_calendars');
      if (backupRaw) {
        const backupCals = JSON.parse(backupRaw);
        if (Array.isArray(backupCals) && backupCals.length > 0) {
          profile.linkedCalendars = backupCals;
        }
      }
    } catch(e) {}
  }

  return profile;
}

function saveStoredProfile(profile) {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  if (profile && Array.isArray(profile.linkedCalendars)) {
    try {
      localStorage.setItem('anchor_flow_saved_calendars', JSON.stringify(profile.linkedCalendars));
    } catch(e) {}
  }
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
    if (!ev || !ev.title) return;
    // Normalized signature: title alphanumeric + dateStr + startTime
    const cleanTitle = (ev.title || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const dateKey = (ev.dateStr || (ev.isToday ? 'today' : 'undated')).trim();
    const timeKey = (ev.startTime || '').trim();
    const signature = `${cleanTitle}_${dateKey}_${timeKey}`;

    if (!signatureMap.has(signature)) {
      const sourcesList = (Array.isArray(ev.sources) && ev.sources.length > 0)
        ? [...ev.sources]
        : [ev.calendarName || 'Calendar'];

      signatureMap.set(signature, {
        ...ev,
        sources: sourcesList,
        isDeduplicated: !!ev.isDeduplicated
      });
      deduplicated.push(signature);
    } else {
      // Duplicate meeting found across multiple calendars on the same date/time!
      const existing = signatureMap.get(signature);
      const src = ev.calendarName || 'Secondary Calendar';
      if (Array.isArray(existing.sources) && !existing.sources.includes(src)) {
        existing.sources.push(src);
      }
      existing.isDeduplicated = true;
      existing.dedupeNote = `Unified across: ${existing.sources.join(' & ')}`;
    }
  });

  // Extract merged list and sort chronologically by timestamp and startTime
  const result = deduplicated.map(sig => signatureMap.get(sig));
  result.sort((a, b) => {
    const tA = (typeof a.timestamp === 'number') ? a.timestamp : 0;
    const tB = (typeof b.timestamp === 'number') ? b.timestamp : 0;
    if (tA && tB && tA !== tB) return tA - tB;
    return (a.startTime || '').localeCompare(b.startTime || '');
  });
  return result;
}

// --- 4. EXPORT HELPERS (TXT & JSON) ---
function generatePreferencesText(profile) {
  return `ANCHOR & FLOW — USER PROFILE & PREFERENCES
=================================================
Exported: ${new Date().toLocaleString()}

PERSONAL IDENTITY:
------------------
User Name: ${profile.userName || 'Not set'}
Role / Focus: ${profile.userTitle || 'Not set'}
Work Start Time: ${profile.workStartTime || '09:00'}
Breakfast Time: ${profile.breakfastTime || '08:30'}
Lunch Time: ${profile.lunchTime || '13:00'} (${profile.lunchDuration || 45} mins)
Dinner Time: ${profile.dinnerTime || '19:30'}
Preferred Focus Duration: ${profile.preferredFocusDuration || 45} mins

LINKED CALENDARS:
-----------------
${(profile.linkedCalendars && profile.linkedCalendars.length > 0)
  ? profile.linkedCalendars.map(c => ` - ${c.name} (${c.type}): ${c.url}`).join('\n')
  : 'None linked.'}

CALENDAR ANCHORS & MEETINGS:
----------------------------
${(profile.calendarEvents && profile.calendarEvents.length > 0)
  ? profile.calendarEvents.map(e => ` - [${e.dateStr || (e.isToday ? 'Today' : 'Upcoming')}] ${e.startTime} - ${e.endTime} : ${e.title} (${e.calendarName || e.sourceType})`).join('\n')
  : 'No calendar events active.'}
`;
}

function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

// Global Toast System
function showAppToast(msg, duration = 3000) {
  let toast = document.getElementById('af-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'af-global-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1e293b;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: opacity 0.25s ease, transform 0.25s ease;
      opacity: 0;
      transform: translateY(10px);
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  
  if (window._toastTimeout) clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, duration);
}

// =========================================================
// LIVE CALENDAR SYNC & MULTI-PROXY RFC 5545 PARSER ENGINE
// =========================================================

// Parses raw iCalendar (RFC 5545) text into structured meeting objects
function parseIcsTextToEvents(icsText, calendarName, sourceType, calendarId = null) {
  if (!icsText || typeof icsText !== 'string') return [];

  // 1. Line unfolding (RFC 5545 section 3.1)
  const unfolded = icsText.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const lines = unfolded.split(/\r\n|\r|\n/);

  const rawEvents = [];
  let inEvent = false;
  let cur = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      cur = {};
    } else if (line === 'END:VEVENT') {
      if (cur.summary && cur.dtstart) {
        rawEvents.push(cur);
      }
      inEvent = false;
    } else if (inEvent) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > -1) {
        const propPart = line.substring(0, colonIdx).trim().toUpperCase();
        const valPart = line.substring(colonIdx + 1).trim();

        if (propPart === 'SUMMARY' || propPart.startsWith('SUMMARY;')) {
          cur.summary = valPart.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, ' ').trim();
        } else if (propPart === 'DTSTART' || propPart.startsWith('DTSTART;')) {
          cur.dtstart = valPart;
        } else if (propPart === 'DTEND' || propPart.startsWith('DTEND;')) {
          cur.dtend = valPart;
        } else if (propPart === 'LOCATION' || propPart.startsWith('LOCATION;')) {
          cur.location = valPart.replace(/\\,/g, ',').replace(/\\;/g, ';').trim();
        } else if (propPart === 'DESCRIPTION' || propPart.startsWith('DESCRIPTION;')) {
          cur.description = valPart.replace(/\\,/g, ',').replace(/\\;/g, ';').trim();
        }
      }
    }
  }

  // 2. Parse Date-Times into Local Time
  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayD = now.getDate();
  const startOfToday = new Date(todayY, todayM, todayD).getTime();
  const todayStr = `${todayY}-${String(todayM + 1).padStart(2, '0')}-${String(todayD).padStart(2, '0')}`;

  const parsedEvents = [];

  rawEvents.forEach((ev, idx) => {
    const startObj = parseIcsDateString(ev.dtstart);
    const endObj = parseIcsDateString(ev.dtend) || new Date(startObj.getTime() + 30 * 60000);

    const evY = startObj.getFullYear();
    const evM = startObj.getMonth();
    const evD = startObj.getDate();
    const evDateStr = `${evY}-${String(evM + 1).padStart(2, '0')}-${String(evD).padStart(2, '0')}`;

    const startOfEvDay = new Date(evY, evM, evD).getTime();
    const daysFromToday = Math.round((startOfEvDay - startOfToday) / 86400000);

    const isToday = (evDateStr === todayStr);
    const isFuture = (startObj.getTime() >= now.getTime() - 4 * 3600000);

    let relativeDay = 'Today';
    if (daysFromToday === 1) relativeDay = 'Tomorrow';
    else if (daysFromToday === 2) relativeDay = 'In 2 days';
    else if (daysFromToday > 2 && daysFromToday <= 7) relativeDay = startObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    else if (daysFromToday < 0) relativeDay = 'Past';
    else relativeDay = startObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

    const durMins = Math.max(15, Math.round((endObj.getTime() - startObj.getTime()) / 60000));
    const startTimeStr = `${String(startObj.getHours()).padStart(2, '0')}:${String(startObj.getMinutes()).padStart(2, '0')}`;
    const endTimeStr = `${String(endObj.getHours()).padStart(2, '0')}:${String(endObj.getMinutes()).padStart(2, '0')}`;

    parsedEvents.push({
      id: `live-ev-${idx + 1}-${Date.now()}`,
      calendarId: calendarId || null,
      title: ev.summary || 'Calendar Meeting',
      startTime: startTimeStr,
      endTime: endTimeStr,
      duration: durMins,
      dateStr: evDateStr,
      dateFormatted: startObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      daysFromToday: daysFromToday,
      relativeDay: relativeDay,
      isToday: isToday,
      isFuture: isFuture,
      calendarName: calendarName || 'Google Calendar',
      sourceType: sourceType || 'google',
      isAnchor: true,
      timestamp: startObj.getTime()
    });
  });

  return parsedEvents;
}

// Parses ICS date strings like "20261005T093000Z" (UTC) or "20261005T140000" (Local)
function parseIcsDateString(str) {
  if (!str) return new Date();
  const clean = String(str).trim().replace(/^.*:/, '').replace(/[^0-9TZ]/g, '');

  // 1. UTC ISO format: YYYYMMDDTHHMMSSZ
  const utcMatch = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?Z$/);
  if (utcMatch) {
    const y = parseInt(utcMatch[1], 10);
    const m = parseInt(utcMatch[2], 10) - 1;
    const d = parseInt(utcMatch[3], 10);
    const h = parseInt(utcMatch[4], 10);
    const min = parseInt(utcMatch[5], 10);
    const sec = utcMatch[6] ? parseInt(utcMatch[6], 10) : 0;
    return new Date(Date.UTC(y, m, d, h, min, sec));
  }

  // 2. Local ISO format without Z: YYYYMMDDTHHMMSS
  const localMatch = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (localMatch) {
    const y = parseInt(localMatch[1], 10);
    const m = parseInt(localMatch[2], 10) - 1;
    const d = parseInt(localMatch[3], 10);
    const h = parseInt(localMatch[4], 10);
    const min = parseInt(localMatch[5], 10);
    return new Date(y, m, d, h, min, 0);
  }

  // 3. All day date format: YYYYMMDD
  const dateMatch = clean.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateMatch) {
    const y = parseInt(dateMatch[1], 10);
    const m = parseInt(dateMatch[2], 10) - 1;
    const d = parseInt(dateMatch[3], 10);
    return new Date(y, m, d, 9, 0, 0);
  }

  return new Date();
}

// High-Speed Multi-Strategy Live Calendar Fetcher (Fast Parallel Racing & CORS-Resilient)
async function fetchCalendarFromUrl(calendarUrl, onProgress = null) {
  if (!calendarUrl) throw new Error('No calendar URL provided.');

  let cleanUrl = calendarUrl.trim();
  if (cleanUrl.startsWith('webcal://')) {
    cleanUrl = 'https://' + cleanUrl.substring(9);
  }

  if (typeof onProgress === 'function') {
    onProgress({
      stage: 'attempting_strategy',
      percent: 20,
      message: 'Connecting via high-speed calendar relays...'
    });
  }

  // Fast proxy relays with strict per-request timeouts
  const endpoints = [
    { name: 'CORSProxy', url: `https://corsproxy.io/?url=${encodeURIComponent(cleanUrl)}`, timeout: 3500 },
    { name: 'CodeTabs', url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(cleanUrl)}`, timeout: 3800 },
    { name: 'AllOrigins', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`, timeout: 4200 },
    { name: 'ThingProxy', url: `https://thingproxy.freeboard.io/fetch/${cleanUrl}`, timeout: 4500 },
    { name: 'Direct Feed', url: cleanUrl, timeout: 2500 }
  ];

  async function fetchEndpoint(ep) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ep.timeout || 3800);

    try {
      const response = await fetch(ep.url, {
        method: 'GET',
        headers: { 'Accept': 'text/calendar, text/plain, */*' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      if (text && text.includes('BEGIN:VCALENDAR')) {
        return { name: ep.name, text };
      }
      throw new Error('Response did not contain valid VCALENDAR feed');
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // 1. Race the top 3 proxies in parallel for sub-2s responses!
  try {
    if (typeof onProgress === 'function') {
      onProgress({
        stage: 'attempting_strategy',
        percent: 35,
        message: 'Querying fast relays in parallel...'
      });
    }

    const fastRace = endpoints.slice(0, 3).map(ep => fetchEndpoint(ep));
    const winner = await Promise.any(fastRace);

    if (typeof onProgress === 'function') {
      onProgress({
        stage: 'feed_downloaded',
        percent: 65,
        strategyName: winner.name,
        sizeBytes: winner.text.length,
        message: `✓ Feed retrieved via ${winner.name} (${Math.round(winner.text.length / 1024)} KB)`
      });
    }
    return winner.text;
  } catch (raceErr) {
    // 2. Sequential quick fallback on remaining endpoints
    for (let i = 3; i < endpoints.length; i++) {
      const ep = endpoints[i];
      try {
        if (typeof onProgress === 'function') {
          onProgress({
            stage: 'attempting_strategy',
            percent: 50 + (i * 10),
            message: `Retrying with ${ep.name}...`
          });
        }
        const res = await fetchEndpoint(ep);
        return res.text;
      } catch (fallbackErr) {}
    }
  }

  throw new Error('Could not fetch calendar feed due to network or CORS restrictions. You can also paste iCal text directly.');
}

// Sync single calendar or all linked calendars, deduplicating and updating user profile
// Supports onProgress callback: (progress) => { percent, stage, message, calendarName }
async function syncLiveCalendar(calendarId = null, onProgress = null) {
  const profile = getStoredProfile();
  if (!profile.linkedCalendars || profile.linkedCalendars.length === 0) {
    const msg = 'No linked calendars found. Add your Google, Outlook, or Apple calendar link!';
    if (typeof onProgress === 'function') {
      onProgress({ stage: 'error', percent: 100, message: msg });
    }
    return { success: false, message: msg };
  }

  const calendarsToSync = calendarId 
    ? profile.linkedCalendars.filter(c => c.id === calendarId && c.enabled !== false)
    : profile.linkedCalendars.filter(c => c.enabled !== false);

  if (calendarsToSync.length === 0) {
    const msg = 'Selected calendar is disabled or not found.';
    if (typeof onProgress === 'function') {
      onProgress({ stage: 'error', percent: 100, message: msg });
    }
    return { success: false, message: msg };
  }

  if (typeof onProgress === 'function') {
    onProgress({
      stage: 'start',
      percent: 5,
      totalCalendars: calendarsToSync.length,
      message: `Initializing sync for ${calendarsToSync.length} calendar(s)...`
    });
  }

  let totalEventsFound = 0;
  let allNewEvents = [];
  let successfulCalendars = 0;
  let failedCalendars = [];

  for (let cIdx = 0; cIdx < calendarsToSync.length; cIdx++) {
    const cal = calendarsToSync[cIdx];
    const basePct = 10 + Math.round((cIdx / calendarsToSync.length) * 70);

    if (typeof onProgress === 'function') {
      onProgress({
        stage: 'syncing_calendar',
        percent: basePct,
        calendarName: cal.name,
        currentCalendar: cIdx + 1,
        totalCalendars: calendarsToSync.length,
        message: `Syncing "${cal.name}" (${cIdx + 1}/${calendarsToSync.length})...`
      });
    }

    try {
      const icsData = await fetchCalendarFromUrl(cal.url, (sub) => {
        if (typeof onProgress === 'function') {
          onProgress({
            stage: 'fetching_sub',
            percent: Math.min(80, basePct + 5),
            calendarName: cal.name,
            message: `${cal.name}: ${sub.message}`
          });
        }
      });

      if (typeof onProgress === 'function') {
        onProgress({
          stage: 'parsing',
          percent: Math.min(85, basePct + 15),
          calendarName: cal.name,
          message: `Parsing RFC 5545 meetings from "${cal.name}"...`
        });
      }

      const parsed = parseIcsTextToEvents(icsData, cal.name, cal.type, cal.id);
      allNewEvents = allNewEvents.concat(parsed);
      cal.lastSync = new Date().toISOString();
      cal.syncStatus = 'success';
      cal.eventCount = parsed.length;
      successfulCalendars++;
      totalEventsFound += parsed.length;

      if (typeof onProgress === 'function') {
        onProgress({
          stage: 'calendar_done',
          percent: Math.min(85, basePct + 20),
          calendarName: cal.name,
          eventsFound: parsed.length,
          message: `✓ "${cal.name}": Retrieved ${parsed.length} meetings`
        });
      }
    } catch (err) {
      console.error(`Failed to sync calendar "${cal.name}":`, err);
      cal.syncStatus = 'error';
      cal.lastError = err.message;
      failedCalendars.push(cal.name);

      if (typeof onProgress === 'function') {
        onProgress({
          stage: 'calendar_error',
          percent: Math.min(85, basePct + 20),
          calendarName: cal.name,
          error: err.message,
          message: `⚠️ Could not sync "${cal.name}": ${err.message}`
        });
      }
    }
  }

  if (typeof onProgress === 'function') {
    onProgress({
      stage: 'deduplicating',
      percent: 90,
      message: 'Unifying multi-calendar duplicates and checking timeblocks...'
    });
  }

  const routineAnchors = (profile.calendarEvents || []).filter(e => e.sourceType === 'routine');
  
  // Retain events from other linked calendars that were not part of this sync
  const otherCalendarEvents = (calendarId && profile.calendarEvents)
    ? profile.calendarEvents.filter(e => e.sourceType !== 'routine' && e.calendarId && e.calendarId !== calendarId)
    : [];

  const combinedNewEvents = otherCalendarEvents.concat(allNewEvents);
  combinedNewEvents.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  let finalEventsToKeep = [];
  if (combinedNewEvents.length > 0) {
    const todayEvents = combinedNewEvents.filter(e => e.isToday);
    const upcomingEvents = combinedNewEvents.filter(e => !e.isToday && e.isFuture);
    
    // Always include today's events, plus upcoming meetings (up to 50 across the next 30 days)
    finalEventsToKeep = todayEvents.concat(upcomingEvents).slice(0, 50);
    
    if (finalEventsToKeep.length === 0) {
      finalEventsToKeep = combinedNewEvents.slice(0, 20);
    }
  }

  profile.calendarEvents = routineAnchors.concat(finalEventsToKeep);
  profile.calendarEvents = deduplicateCalendarEvents(profile.calendarEvents);
  profile.lastSyncTimestamp = new Date().toISOString();
  saveStoredProfile(profile);

  const todayCount = profile.calendarEvents.filter(e => e.isToday && e.sourceType !== 'routine').length;
  const upcomingCount = profile.calendarEvents.filter(e => !e.isToday && e.sourceType !== 'routine').length;

  if (typeof onProgress === 'function') {
    onProgress({
      stage: 'complete',
      percent: 100,
      totalEvents: profile.calendarEvents.length,
      todayCount,
      upcomingCount,
      message: `Sync complete! ${profile.calendarEvents.length} meetings active (${todayCount} today, ${upcomingCount} upcoming).`
    });
  }

  // Global event broadcast for all tabs and UI components
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    try {
      window.dispatchEvent(new CustomEvent('anchor_flow_calendar_synced', {
        detail: {
          success: successfulCalendars > 0,
          totalEvents: profile.calendarEvents.length,
          todayCount,
          upcomingCount,
          events: profile.calendarEvents
        }
      }));
    } catch(e) {}
  }

  if (successfulCalendars > 0) {
    return {
      success: true,
      totalEvents: profile.calendarEvents.length,
      todayCount,
      upcomingCount,
      syncedCount: successfulCalendars,
      failedList: failedCalendars,
      events: profile.calendarEvents,
      message: `Successfully synced ${successfulCalendars} calendar(s)! ${profile.calendarEvents.length} meetings active and deduplicated.`
    };
  } else {
    return {
      success: false,
      message: `Could not sync calendars directly. Error: ${failedCalendars.join(', ')}`
    };
  }
}
