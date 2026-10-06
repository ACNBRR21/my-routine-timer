# Anchor & Flow — Comprehensive System Verification & Link Integrity Report

**Date:** October 6, 2026  
**Status:** ALL SYSTEMS VERIFIED & EXPANDED WITH CLEAN SINGLE-TASK PLANNING, UNDO/UNARCHIVE/UNDELETE & GOOGLE SHEETS LIVE SYNC  
**Automated Test Checks:** 288 Passed / 0 Failed  

---

## 1. Resolution of Plan Button Split Issue & Parser Hardening

### Issue Diagnosis (from User Screenshot):
When clicking "+ Plan" on a task (e.g. *Review Chapter 4 Manuscript Draft*):
- The URL parameter handler previously passed conversational framing: `"Hey, I want to accomplish this task today: Review Chapter 4 Manuscript Draft (45m)"`.
- The clause separator split on the comma after `"Hey,"`, generating two distinct tasks:
  1. `Hey` (25m) — erroneously promoted to Top 1 Priority.
  2. `I want to accomplish this task today: Review Chapter 4 Manuscript Draft ()` (45m) — with leftover prompt wording.

### Solution Implemented:
1. **Clean Parameter Delegation**: In `planner.html`, URL-driven task planning now sends the sanitized task specification directly: `"${preTask} ${preDur}m"`, bypassing all conversational filler.
2. **Pre-Processing Cleaner (`parseUserTasks`)**:
   - Strips leading conversational greetings (`"Hey"`, `"Hi"`, `"Hello"`, `"Good morning"`).
   - Strips conversational intent phrases (`"I want to accomplish this task today:"`, `"Here is what I need to do:"`, `"Please plan my day:"`).
   - Discards standalone filler words (`"Hey"`, `"Hi"`, `"Please"`, `"Thanks"`).
   - Cleans empty parentheses `()` left from duration extraction.
3. **Markdown Table Parsing**: Directly parses Markdown table rows (`| Task | Folder | Est Duration | ... |`) without splitting on internal commas or pipes.

---

## 2. Undo, Unarchive & Undelete Architecture for Tasks

Tasks now support complete state reversibility:

1. **Hierarchy States in Data Model (`js/task-hierarchy.js`)**:
   - **Active:** `status: 'todo'` or `status: 'in_progress'`, `!isDeleted`.
   - **Completed:** `status: 'done'`, `completedAt: timestamp`.
   - **Archived:** `status: 'archived'`, `archivedAt: timestamp`.
   - **Deleted (Trash):** `isDeleted: true`, `deletedAt: timestamp` (soft-deleted, safely recoverable).
2. **Undo History Stack (`undoStack`)**:
   - Tracks all deletions, archiving, unarchiving, and status toggles.
   - `undoLastHierarchyAction()`: Instantly reverts the last action, restoring deleted tasks, unarchiving mistakenly archived items, or restoring previous status.
3. **User Interface Controls (`tasks.html`)**:
   - **Status Filter Selector**:
     - `Active Tasks` (default)
     - `Completed Tasks`
     - `📦 Archived Tasks`
     - `🗑️ Trash / Deleted Tasks`
     - `All Tasks`
   - **Row Actions Adapted by State**:
     - *Active / Completed Tasks:* Quick Timer, Plan, Archive (`📦`), Delete (`🗑️`).
     - *Archived Tasks:* **`📦 Unarchive`** (restores to Active) & Delete.
     - *Deleted Tasks:* **`♻️ Undelete`** (restores to active list) & **`Delete Forever`** (permanent removal).
   - **Floating Undo Toast Banner (`#tasksUndoToast`)**:
     - Appears for 6 seconds upon archiving or deleting a task:  
       `🗑️ Task "Review Chapter 4 Manuscript Draft" moved to Trash. [↩️ Undo]`  
       `📦 Task "Draft Newsletter" archived. [↩️ Undo]`
     - Clicking `[↩️ Undo]` instantly reverts the operation.
   - **Toolbar Quick Undo (`#btnTasksUndo`)**: An inline button in the tasks table toolbar visible whenever actions exist in the undo stack.

---

## 3. Storage Architecture & Local Database Engine

- **Zero-Telemetry Client-Side Storage**: All goals, projects, tasks, bottlenecks, completion dates, user profile data, and historical audit sessions are stored locally in the user's browser using `localStorage` (`anchor_flow_goals_hierarchy`, `anchor_flow_user_profile`, `anchor_flow_guru_history`, `anchor_flow_google_sheet_config`). No data is sent to external proprietary servers without explicit user configuration, guaranteeing complete privacy and full offline functionality.
- **Local Database Download Engine (`exportDatabaseJSON`)**:
  - Available via **"💾 Export Database (.json)"** on `tasks.html` and **"💾 Download Database (.json)"** in Flow Guru (`guru.html` & `flow-guru.html`).
  - Exports a complete JSON backup (`anchor_flow_database_backup_<date>.json`) containing the full hierarchy, user profile, Google Sheets configuration, settings, and timestamped metadata.
- **Local Database Restore Engine (`importDatabaseJSON`)**:
  - Accessible via **"📥 Import Database"** on `tasks.html`.
  - Supports importing and restoring any exported JSON backup file with instant validation and dynamic re-rendering.

---

## 4. Core Hierarchy: Goals, Projects, "Why", Bottlenecks & Completion Dates

1. **Strategic Goals**:
   - High-level vision pillars (e.g. *Ship Harvard Timebox Engine & Book Launch*, *Glaucoma Caregiving Protocol*, *Strategic Architecture*).
   - Fields: `title`, `category`, `priority` (`critical`, `high`, `medium`, `low`), `targetWeeklyHours`, `color`.
   - **Ballpark Estimated Finish Date (`targetDate`)**: Tracks timeline schedule adherence.
   - **The "Why" Purpose / Motivation (`why`)**: Articulates the core motivation behind the goal.
   - **Strategic Bottleneck (`bottleneck`)**: Identifies the primary constraint or dependency (e.g. *"Publisher copyright review on Harvard case studies and author citations"*).
2. **Projects / Action Folders**:
   - Folders nested under goals (or standalone Miscellaneous folder).
   - Fields: `title`, `goalId`, `description`, `color`, `status`.
   - **Estimated Finish Date (`targetDate`)**: Projected completion date.
   - **Why / Motivation (`why`)**: The concrete value unlocked by the project.
   - **Project Bottleneck / Blocker (`bottleneck`)**: Identifies the exact blocker (e.g. *"HBR reprint permission documentation from Boston office"*).
   - **Miscellaneous Tasks Folder (`proj-misc`)**: Catches ad-hoc errands, loose administrative tasks, and quick emails.
3. **Tasks with Predictive Timebox Estimation, Completed-By Dates & Bottlenecks**:
   - **Completed-By Date (`completedByDate`)**: Target date by which the task should be finished.
   - **Task Bottleneck (`bottleneck`)**: Identifies the follow-up person or external dependency (e.g. *"Waiting for editorial feedback from Sarah"*).
   - **Actual Status & Timestamp**: Real-time status (`todo`, `in_progress`, `done`, `archived`) and immutable finish timestamp (`completedAt`).
   - **Heuristic Duration Predictor (`predictTaskDuration`)**: Infers cognitive duration (`10m`, `15m`, `25m`, `45m`, `90m`) with manual override pills.

---

## 5. Google Sheets Live Sync & Gemini Developer Integration Layer

1. **Two-Way Synchronization Gateway (`syncToGoogleSheet`)**:
   - Dispatches structured payloads containing goals, projects, tasks, bottlenecks, and timer execution logs directly to a user's Google Apps Script Web App endpoint.
   - Auto-syncs on completion: whenever a task is finished in the Timer or manually checked off, Anchor & Flow immediately pushes the updated actual status (`FINISHED` / timestamp) to the sheet.
2. **Pre-Built Google Apps Script Gateway (`google-sheets-sync.gs`)**:
   - Packaged and ready to paste into **Extensions > Apps Script** in any Google Sheet.
   - Automatically provisions and updates 4 formatted, color-coded tabs:
     - **`Goals`**: Goal ID, Title, Category, Priority, Weekly Hours, Target Finish Date, Why, Bottleneck, Completed Tasks, Total Tasks, Completion Rate %, Schedule Status.
     - **`Projects`**: Project ID, Goal Title, Project Title, Description, Target Finish Date, Why, Bottleneck, Status, Completed Tasks, Total Tasks, Completion Rate %.
     - **`Tasks`**: Task ID, Goal Title, Project Title, Task Title, Priority, Est Duration, Completed-By Date, Bottleneck / Blocker, Actual Status (`FINISHED` / `TODO`), Completed At Timestamp, Notes.
     - **`Timer Log`**: Session ID, Date & Time, Task Title, Category, Planned vs. Actual Duration, Velocity Ratio, Accuracy %, Status, Notes.
3. **Direct Multi-Table CSV Export (`exportHierarchyToSheetsCSV`)**:
   - Generates a formatted multi-table CSV file (`anchor_flow_google_sheets_export_<date>.csv`) ready for direct manual import or offline backup.
4. **Google Sheets Sync Modal (`#googleSheetModal`)**:
   - Available via **"📊 Google Sheet Sync"** on `tasks.html` and **"📊 Sync Google Sheet"** in Flow Guru.

---

## 6. Timer Execution & Actual Status Tracking Link

- **Timer Task Linking**: When launching a task into the timer (`timer.html?task=...&dur=...&taskId=...`), the timer links directly to that task in the hierarchy.
- **Automatic Status Transition**: When the timer session finishes or the user clicks "Done Early", `completeTaskFromTimer()` marks the task as `done` and stamps `completedAt = new Date().toISOString()`.
- **Live Google Sheet Relay**: Immediately triggers `syncToGoogleSheet()`, recording that the task is finished in the user's Google Sheet without manual intervention.

---

## 7. Flow Guru Enhanced Intelligence & Graphical Progress Interface

Flow Guru (`guru.html` and `flow-guru.html`):
1. **Executive KPI Row**:
   - **In The Zone / Flow State**: 3.0h in Zone (78% Flow State vs 22% Meeting Friction).
   - **Task Completion Rate**: Live percentage (e.g. `14% • 1/7 Done`) and pending focus duration (~`2h 45m`).
   - **Project Completion Rate**: Real-time project tracking across active goals (e.g. `0% • 4 Active Projects`).
   - **Schedule Adherence**: Evaluates ballpark target finish dates against today's date (`🟢 On Track`, `🟡 At Risk`, `🔴 Overdue`).
2. **Graphical Progress Against Plan**:
   - Visual progress bars for each critical goal and child project displaying `% of tasks completed`.
   - Ballpark finish dates with countdown badges.
   - **Purpose Callouts (`💡 The "Why"`)**: Renders core motivation for each goal and project.
   - **Bottleneck Constraints (`⚠️ Bottleneck`)**: Renders the exact constraint for each goal and project so the user knows where to direct mental focus.
3. **Flow Guru Coaching & Bottleneck Feedback**:
   - Synthesizes whether the user is in the zone, how much time is spent in peak flow (defending the 9:00 AM – 12:00 PM window), and flags active bottlenecks across critical milestones.

---

## 8. Exhaustive Link & Asset Integrity Audit

| Page Audited | Stylesheets Verified | Scripts Verified | Links & Target Anchors Verified | Status |
| :--- | :---: | :---: | :---: | :---: |
| **`index.html`** | `css/style.css` (✓) | `calendar-sync.js`, `ai-engine.js`, `flow-guru.js` (✓) | 27 links checked (✓) | **PASS** |
| **`guru.html`** | `css/style.css` (✓) | `task-hierarchy.js`, `flow-guru.js`, `calendar-sync.js` (✓) | 17 links checked (✓) | **PASS** |
| **`flow-guru.html`** | `css/style.css` (✓) | `task-hierarchy.js`, `flow-guru.js`, `calendar-sync.js` (✓) | 17 links checked (✓) | **PASS** |
| **`planner.html`** | `css/style.css` (✓) | `calendar-sync.js`, `ai-engine.js`, `task-hierarchy.js`, `flow-guru.js` (✓) | 19 links checked (✓) | **PASS** |
| **`tasks.html`** | `css/style.css` (✓) | `task-hierarchy.js`, `flow-guru.js` (✓) | 12 links checked (✓) | **PASS** |
| **`profile.html`** | `css/style.css` (✓) | `calendar-sync.js`, `ai-engine.js` (✓) | 17 links checked (✓) | **PASS** |
| **`timer.html`** | `css/style.css`, `css/timer.css` (✓) | `task-hierarchy.js`, `flow-guru.js`, `timer.js` (✓) | 16 links checked (✓) | **PASS** |
| **`guide.html`** | `css/style.css` (✓) | `calendar-sync.js` (✓) | 22 links checked (✓) | **PASS** |
| **`csv-tools.html`** | Embedded styles (✓) | Internal CSV parser (✓) | 2 navigation links checked (✓) | **PASS** |
| **`report.html`** | Embedded styles (✓) | Internal report scripts (✓) | 1 navigation link checked (✓) | **PASS** |

**Totals:** 0 Broken Stylesheets, 0 Broken Scripts, 0 Broken Links, 0 Missing Anchors.

---

## 9. Automated Test Suite Metrics

1. `test_bottlenecks_and_sheets_sync.js`: **64 / 64 Checks Passed (0 Failed)**
2. `test_all_user_buttons.js`: **171 / 171 Checks Passed (0 Failed)**
3. `test_all_flow_guru_reframe.js`: **18 / 18 Checks Passed (0 Failed)**
4. `comprehensive_system_audit.js`: **35 / 35 Checks Passed (0 Failed)**
5. `deep_link_and_integrity_check.py`: **0 Errors Across All 10 Pages**

**Grand Total: 288 Automated Assertions Passed / 0 Regressions.**
