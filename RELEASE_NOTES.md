# Anchor & Flow — Complete Overhaul & Release Notes
**Version:** 3.0.0 (Executive Suite Overhaul)  
**Architecture:** Multi-Page Modular Web Application  
**Design Language:** Apple Minimalist Light & Calmly/Taskly Dashboard  
**Author:** Rishi Roy (*The Productivity Guy*)
**Direct Feedback:** [WhatsApp / SMS: +91 9136228725](https://wa.me/919136228725?text=Hi%20Rishi,%20feedback%20on%20Anchor%20%26%20Flow:) | [Email: rishi@birdblast.com](mailto:rishi@birdblast.com?subject=Feedback%20on%20Anchor%20%26%20Flow) | [LinkedIn](https://www.linkedin.com/in/rishiroy/)

---

## 🌟 Executive Summary: Why This Overhaul Matters

Anchor & Flow was originally conceived to solve two fundamental problems:
1. **Executive Work Velocity:** Eliminating mundane busywork and context switching through Harvard Timeblocking and Napoleon/Musk serial single-tasking (protecting the Top 3 high-leverage priorities).
2. **Infallible Health & Caregiving Anchors:** Managing rigid, non-negotiable medication intervals for Rishi Roy's mother's glaucoma eye drops—a caregiving journey that inspired his newly published book on glaucoma routines and bio-rhythms.

As the product expanded, earlier iterations attempted to cram all features—conversational AI, schedule tables, execution timers, stopwatches, audio synthesizers, CSV tools, and settings—into a single congested 280KB page. This created cognitive overload and mobile navigation hurdles.

Following **Apple Design Thinking** and **Pareto’s 80/20 Law**, this complete overhaul decouples the platform into a streamlined, multi-page executive productivity suite that is drastically simpler, faster, and significantly more powerful.

---

## 🏗️ The New Multi-Page Architecture

Instead of a single overwhelming page, Anchor & Flow is now cleanly organized into dedicated, purpose-built workspaces:

### 1. 🏠 Executive Dashboard Homepage (`index.html`)
The new command center inspired directly by Calmly and Taskly:
* **Dynamic Time-of-Day Greeting:** Personalized welcoming (*"Good morning, Alex! ☀️"*) with real-time bio-rhythm metrics.
* **Top Metric KPI Cards:**
  * *Focus Time Today:* Track hours logged toward daily deep-work goals.
  * *Active Anchors:* Real-time count of synchronized calendar meetings.
  * *Tasks Done:* Completion velocity and progress tracking.
  * *Routine Streak:* Habit consistency tracking.
* **Today's Focus Hero Card:** Daily anchor reminder with an instant 1-click focus sprint trigger.
* **Today's Calendar & Anchors Widget:** Real-time timeline pulling from your linked calendar URLs.
* **Mini Calendar Widget:** Month view showing the current day and upcoming anchor dates.
* **Stored & Active Timers Widget with History Cleaner:** Quick launch for regular focus blocks (`15m Sprint`, `22m Focus`, `30m Seq Tabata`, `Pomodoro 25m`, and `🧴 Eye drops 1:30:00+`). Includes direct `🗑️` delete buttons on each row to remove older, unused timers from your library.
* **Daily Wellness Timings Display:** Quick reference of your configured daily schedule (Work start at `09:00`, Breakfast at `08:30`, Lunch at `13:00`, Eye drops, Sleep target at `23:00`).
* **High-Impact Quick Action CTAs:** Instant buttons to **`🧠 Plan My Day (AI Agent)`** and **`⏱️ Launch Timer`**.

### 2. 👤 Overview & Profile Management Page (`profile.html`)
A transparent overview portal that gives users 100% control over all locally held data:
* **Personal Identity:** Edit your name, what you work on typically (e.g., *Product Strategist*, *Entrepreneur*, *Software Engineer*), and your primary focus style.
* **Live Calendar Link Manager (No File Uploads!):** Add, test, and manage Google Calendar secret iCal links, Microsoft Outlook Web ICS links, and Apple iCloud Webcal URLs.
* **Daily Routine & Meal Anchors:** Configure typical work start, breakfast, lunch time (e.g., `1:00 PM` / `45m`), and dinner times. When planning your day, the Flow Agent automatically references these anchors (*"Hey, you typically have lunch at 1:00 PM"*).
* **Timer History Cleaner:** Full library view of all stored timers with 1-click delete buttons to remove unused older timers.
* **Local Data Backup & Privacy:** 1-click download of `user_preferences.txt` (clean, human-readable text) and `user_preferences.json`, plus import and reset options.

### 3. 🧠 Dedicated AI Day Planner (`planner.html`)
A distraction-free, full-screen conversational planning workspace:
* **Spacious Chat Interface:** Full-screen conversational planning with clean Apple white typography and generous height.
* **Hands-Free Voice Typing (`🎙️`):** Built-in Web Speech API dictation with live transcription and recording pulse animation.
* **Automatic Calendar Integration:** Automatically pulls your deduplicated meetings and routine anchors (e.g. Lunch at 1:00 PM).
* **Proactive Link Inquiries:** If no calendar is linked yet, prompts:
  > *"Would you like to share your Google or Outlook calendar link so I can lock in your meetings automatically? Or you can tell me about any fixed meetings today."*
* **Harvard Timebox Generation:** Groups tasks into Top 3 priorities, serial single-task blocks, and non-repeating execution notes, with a 1-click **`🚀 Launch in Timer`** handoff.

### 4. ⏱️ Standalone Timers & Routines Page (`timer.html`)
The dedicated Apple-inspired timer engine:
* **All Timers Dashboard:** Clean typography (`15:00`, `22:00`, `1:30:00+`, `30 min Seq Tabata`), folder categorization (`Work & Focus`, `Health & Care`, `Workouts & HIIT`, `Daily Routines`), and soft-blue circular play buttons.
* **Add Timer Sheet:** Supports *Timer* (countdown with repeats), *Stopwatch* (count up), *Countdown* (date/time target), and *Routine* (multi-step sequential timer).
* **Quick Timer Presets:** Dashed round-rect buttons for rapid 1-tap start (`30 secs`, `1 min`, `5 mins`, `15 mins`, `25 mins`, `30 mins`, `45 mins`, `60 mins`).
* **Pre-Built Templates:** *EMOM* (10 rounds), *Tabata Workout* (8 rounds 20s/10s), *Pomodoro* (25m/5m), *30 min Seq Tabata exercise*, and *Harvard Top 3 Sprint*.
* **Active Execution Player:** Distraction-free countdown, active step, notes box, pause/resume, next step, reset, and Web Audio API harmonic bell chimes.
* **History Deletion:** Includes direct `🗑️` delete buttons on timer rows so you can clean up older, unused timers from your library.

### 5. 📖 Master Guide & Calendar Sharing Tutorial (`guide.html`)
* **Light Theme Redesign:** Replaced the old dark blue look with the cohesive Apple / Calmly Light Minimalist aesthetic.
* **Step-by-Step URL Sharing Guides:**
  * **Google Calendar:** How to find and copy the *Secret address in iCal format* URL.
  * **Microsoft Outlook Web (Office 365 / Outlook.com):** How to publish your calendar and copy the *ICS link*.
  * **Apple iCloud Calendar:** How to copy the *Public Calendar webcal link*.
* **Algorithm Explanation:** Explains how multi-calendar deduplication works behind the scenes.
* **Rishi Roy's Story:** Features the dual origin of Anchor & Flow: executive serial tasking and his mother's glaucoma eye drops care routine, inspiring his newly published book.

---

## ⚡ What Makes This Version A Lot More Powerful?

| Capability | Old Architecture | New Overhauled Suite |
| :--- | :--- | :--- |
| **Calendar Integration** | Required manual downloading and re-uploading of `.ics` files every day | **Live Calendar Links (iCal / Webcal / ICS URLs):** Links once; synchronizes automatically in real-time. |
| **Multi-Calendar Support** | Duplicate meetings appeared twice side-by-side if on both Outlook & Google | **Intelligent Deduplication Engine:** Automatically compares signatures and unifies duplicates into 1 clean card with attribution. |
| **User Memory & Identity** | Hardcoded names or raw storage dumps | **Dynamic Local Memory:** Asks for your name openly on first launch, remembers you across visits via cookies, and generates downloadable `user_preferences.txt`. |
| **Routine Awareness** | The AI treated every day as a blank slate | **Anchor Intelligence:** Remembers your meal times (Lunch at 1:00 PM), work start, and focus block preferences to tailor planning. |
| **UI Aesthetic & Legibility** | Dark, crowded single-page dashboard with heavy visual fatigue | **Apple Minimalist Light Theme:** Clean white canvas (`#f8fafc` / `#ffffff`), high-contrast SF typography, and Calmly/Taskly pastel badges. |
| **Task Dictation** | Typing only; single-line inputs that truncated long agendas | **Hands-Free Voice Typing (`🎙️`):** Real-time speech-to-text dictation into auto-expanding textareas. |
| **Timer Flexibility** | Embedded tightly in planning with no standalone history management | **Independent Timer Engine (`timer.html`):** Full multi-step routines, quick presets, and ability to delete unused timers from history. |
| **Caregiving Integration** | Generic reminders only | **Rigid Glaucoma Care Routines:** Dedicated `1:30:00+` and `1:15:00` eye drop interval timers tied to Rishi's published book. |

---

## 📱 Mobile-First Ergonomics
* **Full Viewport Responsiveness:** Tested and optimized for 375px, 390px, and 430px iPhone screens.
* **Touch Targets:** All interactive controls (buttons, links, microphone, play buttons) meet Apple's minimum 44×44pt touch standard.
* **Zero iOS Safari Zoom Glitch:** All textareas and inputs use `16px` base font size, preventing unwanted auto-zooming.
* **Touch-Friendly Tables:** Review tables and timelines feature smooth horizontal and vertical scrolling with zero layout clipping.


### 6. 🧘 The Supercharged Flow Guru (Productivity & Calendar Advisor)
The beloved **Flow Guru** has been brought back and substantially elevated into an active executive advisor:
* **Proactive Calendar Intelligence:** Continuously monitors linked calendars to detect:
  * *Meeting Overload Warnings:* Flags when meetings consume >3 hours or >40% of the day, warning against task overflow.
  * *Zero-Buffer Cognitive Strain:* Flags back-to-back meetings without gaps and advises inserting 5–10m cognitive resets.
  * *Missing Meal & Recovery Anchors:* Alerts the user if their usual lunch window (e.g. 1:00 PM) is unprotected.
* **Harvard Rule of 3 & Pareto 80/20 Enforcement:** Isolates the vital 20% of high-impact priorities from low-leverage busywork, guiding the user to execute Top 1, 2, and 3 serially.
* **Executive Health Index:** Computes a live 0–100 calendar health score (Optimal Flow vs. Fragmentation).
* **Interactive Deep Audit Modal:** Provides actionable recommendations with 1-click buffer optimization.

---

## 🚀 Version 3.1.0 Update: Calendar Sync Clarity, Mini-Calendar Upgrades & Privacy Protection

### 🔒 1. Public Distribution Privacy Protection
- **Personal Calendar Removal:** Completely purged author's private Google Calendar iCal URL (`rishi@birdblast.com`) from code and default profile presets.
- **Automated Local Storage Sanitization:** Added automatic migration in `getStoredProfile()` that scrubs any legacy private calendar links from browser `localStorage` on load, ensuring a 100% clean slate for public distribution.

### ⚡ 2. Real-Time Calendar Sync Clarity & Timeout Guards
- **Live Progress Indicator:** Added an animated progress bar and status stepper in `profile.html` (e.g. `Connecting...`, `Downloaded feed (42 KB)`, `Parsing RFC 5545 events...`, `Unified 8 meetings`).
- **Eliminated Freezing / Long Hangs:** Implemented `AbortController` timeout guards (7.5s max per proxy strategy) so unresponsive proxies fail fast and switch to working endpoints instead of hanging for 1-2 minutes.
- **Button State Feedback:** Dashboard and profile sync buttons now display an active spinning indicator (`🔄 Syncing...`) and are disabled during synchronization to prevent accidental duplicate sync requests.

### 📅 3. Synced Meetings Live Preview in Profile
- **Two-Column Split Layout:** Re-architected Section 2 in `profile.html` into a responsive 2-column workspace:
  - *Left Column:* Linked calendar management, real-time progress bar, add-calendar form, and sync actions.
  - *Right Column:* Live Synced Schedule Preview panel showing all retrieved meetings, KPI counter chips (Total, Today, Next 7 Days), and tab filters (`Next 7 Days`, `Next 2 Days`, `Today`, `All Synced`).

### 🎯 4. Clean Separation of Today's Calendar from Upcoming Weeks
- **Today's Focus Protected:** Restructured the Dashboard's "Today's Calendar & Anchors" widget to display **strictly today's meetings and routine anchors**.
- **No More Confusion:** Upcoming meetings from next week or future months no longer clutter today's schedule. A subtle indicator links directly to the upcoming horizon viewer.

### 🗓️ 5. Interactive Mini-Calendar & Upcoming Horizon (Next 2–7 Days)
- **Dynamic Month Calendar:** Upgraded the static mini calendar into an interactive calendar with real weekday alignment, previous/next month navigation, and a "Today" reset button.
- **Visual Event Indicators:** Days containing meetings display a dot indicator.
- **Clickable Days:** Users can click any calendar day to inspect that specific date's agenda.
- **Attached Upcoming Schedule Panel:** Directly beneath the calendar, users can toggle between:
  - *Next 2 Days:* Clean schedule for tomorrow and the day after.
  - *Next 7 Days:* Full week upcoming schedule horizon.
  - *Selected Date:* Deep dive into any clicked calendar date.
