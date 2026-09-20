# Anchor & Flow — Harvard Timeboxing, Elastic Execution & Rollover Memory

> **An open-source, client-side productivity cockpit combining Harvard Timeboxing, immutable calendar anchors, adaptive flow blocks, and closing the feedback loop between time elapsed and objectives achieved.**

* **Live Interactive Web App:** [https://acnbrr21.github.io/my-routine-timer/](https://acnbrr21.github.io/my-routine-timer/)
* **Master System Guide:** [https://acnbrr21.github.io/my-routine-timer/guide.html](https://acnbrr21.github.io/my-routine-timer/guide.html)
* **CSV Import & Schema Manager:** [https://acnbrr21.github.io/my-routine-timer/csv-tools.html](https://acnbrr21.github.io/my-routine-timer/csv-tools.html)

---

## 1. Why Anchor & Flow? (The Problem with Existing Timers)

Most time management and Pomodoro timers suffer from two fatal design assumptions:
1. **Calendar Ignorance:** Floating stopwatches don't know you have an immutable client call at 2:00 PM, leading to collisions and blown schedules.
2. **The Completion Fallacy:** When a timer hits `00:00`, timers assume the work is done. In reality, time elapsed rarely equals objective achieved. Unfinished tasks disappear into the void, inducing cognitive friction and guilt.

**Anchor & Flow** solves this by dividing your day into two entities and closing the reality feedback loop:
* **Anchors (📅):** Hard wall-clock commitments. Punctual, non-negotiable, and protected.
* **Flow (⏱):** Elastic focus blocks that slide dynamically around anchors.
* **The Reality Check & Rollover Memory (↺):** When a task finishes or transitions, a 1-second reality check asks if you finished. Unfinished tasks are logged with actual time spent and automatically queued into your next AI planning session with calculated remaining duration!

---

## 2. Key Capabilities & Innovations

### A. The "One-Second Reality Check" & Rollover Memory
* When your timer expires, or when you click **Next** / **Finish Early ⏩**, the system asks:  
  *"Did you finish [Task Name]?"*
* **[✓ Yes, Completed]** &rarr; Logs the milestone, records actual elapsed seconds, and updates your velocity ratio.
* **[↺ Incomplete / In Progress]** &rarr; Offers two instant options:
  * Extend by `+5m` or `+10m` now.
  * **Park & Save to Rollover Memory:** Logs the actual minutes spent, flags the task as unfinished (`↺ Rolled Over`) in the Execution Log, and stores the remainder into your private browser storage.
* **AI Memory Loop:** When you next open **✦ Plan My Day** (e.g., planning the afternoon or tomorrow morning), the AI detects your parked tasks and prompts:  
  *"You have 1 unfinished task from earlier: **[Task Name]** (~20m remaining). Would you like to prioritize this at the top of your next plan?"*  
  Tap **+ Add Rollover Tasks to Today's Plan** to pre-populate your agenda with zero typing.

### B. Time-Aware AI Onboarding & Voice Input
* **Time-of-Day Branching:**
  * **Before 12:00 PM:** Offers **🌅 Plan the Day** (*"Please fill in all the tasks that you want to do, and with their analysis of what time they want."*).
  * **After 12:00 PM:** Offers **🕒 Plan the Rest of the Day** (afternoon focus and wrap-up).
  * **Next Few Tasks:** Rapid sprint sequence for 2–4 tasks.
  * **Single Task Timer:** Instant one-tap countdown for a single task with duration pills (`15m`, `25m`, `30m`, `45m`, `60m`, `90m`, `120m`).
* **Productivity Guru Break Opt-In (100% User Control):** The AI asks *"Would you like me to fill in small breaks to enhance productivity?"* backed by research quotes (Dr. Andrew Huberman, ultradian rhythm science). By default, **no breaks are inserted** unless you explicitly check the box.
* **🎙️ Voice Chat Dictation:** Tap **🎙️ Voice Input** to speak your schedule directly into the enlarged text box using the browser's native Web Speech API. Free, zero setup, and completely private.

### C. Clear, Widened Task Review Table
* **Expanded Duration Inputs:** The duration column accommodates **100+ minute** sessions (e.g. `120 mins`, `180 mins`, `240 mins`) with zero visual cramping, clean monospace formatting, and a clear `mins` label.
* **Full Reordering & Editing:** Reorder with `▲` / `▼`, delete, edit titles/durations, or instruct the AI naturally (*"make task 1 90 mins"*, *"move review to top"*).

### D. Multi-Tier AI Architecture (OpenAI, DeepSeek & Zero-Setup Local)
1. **Option 1 (Primary):** OpenAI (`gpt-4o-mini` / `gpt-4o`).
2. **Option 2 (Fallback):** DeepSeek (`deepseek-chat`).
3. **Option 3 (100% Offline Local):** Built-in client-side NLP rule engine that parses natural language and timeboxing without external API keys.

### E. Execution Auditing & CSV Export
* Pacing velocity multiplier (`Actual Elapsed / Target Duration`).
* Export your daily audit to CSV with one click (placed right beside the Flow Guru button in the Execution Log header).
* CSV includes: `Routine`, `Task Name`, `Type`, `Status`, `Completion State`, `Scheduled Anchor`, `Actual Start Time`, `Actual End Time`, `Target Duration`, `Time Added`, `Actual Elapsed`, `Variance`.

---

## 3. LinkedIn Announcement Template

Ready-to-use launch post for sharing on LinkedIn:

```markdown
🚀 Excited to open-source Anchor & Flow — an AI-powered execution cockpit designed to solve the two biggest flaws in modern productivity tools:

1. Traditional calendars are too rigid: a single delayed meeting throws off your whole day.
2. Floating timers (like Pomodoro) are too disconnected: they don't know when your real meetings are, and they assume when time hits 00:00, your task is finished.

Anchor & Flow divides your workday into two clean entities:
📅 Hard Anchors: Immutable calendar commitments that auto-convene on time.
⏱ Elastic Flow: Flexible work blocks that dynamically adjust between meetings.

And today, we’re introducing the "One-Second Reality Check" & Rollover Memory:
When time expires, the app asks if you actually finished. If you didn't, it logs your real time spent and parks the remainder into a smart Rollover Queue. When you open the AI planner for your next session, it greets you with your carryover tasks so nothing slips through the cracks.

Key features:
✨ Time-Aware AI Planning (Morning vs. Afternoon mode)
🎙️ Browser-Native Voice Dictation
🧘 100% User Control over Productivity Breaks
📊 Live Velocity Calibration & CSV Audit Export
🔒 100% Client-Side & Private (Zero server tracking)

Try it live (no sign-up required): https://acnbrr21.github.io/my-routine-timer/
GitHub Repo: https://github.com/acnbrr21/my-routine-timer

Feedback and pull requests welcome! Built with passion for mindful execution.

#Productivity #Timeboxing #OpenSource #AI #WebDev #DeepWork #TimeManagement
```

---

## 4. Repository Structure

```text
├── .github/
│   └── workflows/
│       └── ai-proxy.yml            # GitHub Actions serverless proxy for OpenAI/DeepSeek
├── api/
│   └── ai.js                       # Cloudflare / Vercel serverless API handler
├── cloudflare-worker.js            # Standalone Cloudflare Worker script
├── index.html                      # Complete interactive web app cockpit
├── csv-tools.html                  # Standalone CSV import & template manager
├── guide.html                      # Master documentation and system philosophy
├── report.html                     # Velocity auditing and daily debrief report
├── sample_schedule_template.csv    # Offline spreadsheet template
└── README.md                       # Documentation & open-source guide
```

---

## 5. License & Open Source

This project is licensed under the **MIT License** — free to use, modify, and distribute for personal and commercial projects.

* **Creator:** Rishi Roy ([rishi.roy@insead.edu](mailto:rishi.roy@insead.edu?subject=Anchor%20%26%20Flow%20Open%20Source))
* **Issues & Contributions:** [https://github.com/acnbrr21/my-routine-timer/issues](https://github.com/acnbrr21/my-routine-timer/issues)
