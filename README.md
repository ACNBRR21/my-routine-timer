# Anchor & Flow — Harvard Timeboxing & Reflow Timer

A client-side Harvard Timeboxing engine and chronological sequence timer designed around immutable calendar meetings (**Anchors**) and elastic work blocks (**Flow**).

Hosted live on GitHub Pages: [https://acnbrr21.github.io/my-routine-timer/](https://acnbrr21.github.io/my-routine-timer/)

---

## 1. Core Architecture & Philosophy

- **Harvard Timeboxing Engine & Intelligent NLP:**
  1. **Step 1 — Multiline Brain Dump:** Paste your full unstructured agenda, meetings, habits, and tasks into a spacious, scrollable multiline editor (`Shift+Enter` for newlines).
  2. **Step 2 — Smart Task Decomposition & Title Shortening:** Natural language sentences (e.g., *"Drink water for 5 minutes, do a review for 15 minutes, drink vitamin D for 5 minutes"*) are broken down into discrete tasks with punchy 2–4 word action titles (*"Hydrate (Water)"*, *"Session Review"*, *"Take Vitamin D"*), with full context preserved in the word-wrapped Notes field.
  3. **Step 3 — Time-of-Day & Duration Awareness:**
     - **Full-Day Morning Mode (< 2:00 PM):** Engages Harvard Top-3 priority triage.
     - **Afternoon/Evening or Short Sprints (≥ 2:00 PM or ≤ 4 tasks):** Automatically bypasses the redundant Top-3 prompt, immediately organizing your tasks into direct sequential flow blocks.
  4. **Step 4 — Interactive Table Review & Natural Language Feedback:** Inspect, edit titles/durations, remove tasks, or type conversational revisions (*"make review 20 mins"*, *"add 5m stretch"*) before committing to the Cockpit.
- **Anchors vs. Flow:**
  - **Anchors (📅):** Hard wall-clock commitments. They never shift, never delay, and never split. Anchors auto-convene on time.
  - **Flow (⏱):** Flexible execution blocks that dynamically adjust, slide on overrun, or pull forward on early completion.
- **60-Second Calming Pause (🧘):** A mindful transition pause between regular tasks to prevent context-switching whiplash and reset cognitive focus. Extendable with `+1m` / `+5m` or startable on demand.
- **Open Buffer & Gap Filling (⚡):** When a task finishes early before a meeting, the cockpit smoothly enters a serene buffer countdown and suggests upcoming smaller tasks that fit inside the open gap.
- **Anchor Auto-Convene & Preemption:** When an anchor's start time arrives, the meeting auto-starts with an Apple harmonic chime. Any overrunning task is paused, with options to **Resume After Meeting** or mark **No, Task is Finished**.
- **Flow Guru Productivity Audit & Historical Anecdotes (✦):** An Apple-style slide-over inspection drawer powered primarily by OpenAI (GPT-4o-mini, fallback to DeepSeek) featuring iconic productivity anecdotes (Elon Musk's 5-minute timeboxing, Bill Gates' Think Weeks, Eisenhower's Matrix, Benjamin Franklin's 24-hour scheme) alongside live execution velocity and calibration tips.

---

## 2. Multi-Tier AI Architecture & GitHub Secrets Setup

The "Plan My Day" Harvard Timeboxer and "Flow Guru" productivity auditor utilize a resilient, multi-tier intelligence architecture:
1. **Option 1 (Primary):** OpenAI (`gpt-4o-mini` / `gpt-4o`).
2. **Option 2 (Fallback):** DeepSeek (`deepseek-chat`). If OpenAI encounters rate limits, downtime, or network errors, execution seamlessly falls back to DeepSeek.
3. **Option 3 (Public Demo Fallback):** If no API keys are entered, a built-in client-side Harvard Timeboxer engine formats routines automatically for LinkedIn visitors with zero setup.

### Setting Repository Secrets for GitHub Actions
1. In your GitHub repository, navigate to **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
2. Add your primary secret:
   * Name: `OPENAI_API_KEY`
   * Secret: Paste your OpenAI API key (`sk-proj-...`).
3. Add your fallback secret:
   * Name: `DEEPSEEK_API_KEY`
   * Secret: Paste your DeepSeek API key (`sk-...`).

### Execution Modes
- **Zero Client-Side Exposure (Proxy Workflow):** `.github/workflows/ai-proxy.yml` executes on `workflow_dispatch` within an isolated GitHub runner, securely reading repository secrets without exposing keys to client browsers.
- **Direct Client Settings:** You can also paste either or both keys into the in-app **⚙️ Settings** modal. Keys remain private, stored solely in your browser's local `localStorage`.

## 3. Repository File Structure

```text
├── .github/
│   └── workflows/
│       └── ai-proxy.yml
├── api/
│   └── ai.js
├── cloudflare-worker.js
├── index.html
├── guide.html
├── README.md
├── report.html
└── sample_schedule_template.csv
```

---

## 4. Documentation & Research Reference

- [Harvard Business Review: How Timeboxing Works](https://hbr.org/2018/12/how-timeboxing-works-and-why-it-will-make-you-more-productive)
- Detailed operational walkthrough available in `guide.html`.
- Post-day reflection and velocity calibration report available in `report.html`.


## 5. Support, Inquiries & Feedback

For technical support, feedback, bug reports, or feature requests:
* **Contact:** [rishi.roy@insead.edu](mailto:rishi.roy@insead.edu?subject=Anchor%20%26%20Flow%20Feedback)
* **GitHub Issues:** [https://github.com/acnbrr21/my-routine-timer/issues](https://github.com/acnbrr21/my-routine-timer/issues)

---
