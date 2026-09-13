# Anchor & Flow — Harvard Timeboxing & Reflow Timer

A client-side Harvard Timeboxing engine and chronological sequence timer designed around immutable calendar meetings (**Anchors**) and elastic work blocks (**Flow**).

Hosted live on GitHub Pages: [https://acnbrr21.github.io/my-routine-timer/](https://acnbrr21.github.io/my-routine-timer/)

---

## 1. Core Architecture & Philosophy

- **Harvard Timeboxing Engine:** Structured around the proven 3-step methodology:
  1. **Step 1 — Brain Dump:** Capture all tasks, meetings, and ideas.
  2. **Step 2 — Set Priorities:** Identify the Top 3 highest-leverage goals (labeled A, B, C).
  3. **Step 3 — Timebox:** Schedule tasks into calendar gaps as concrete appointments with yourself.
- **Anchors vs. Flow:**
  - **Anchors (📅):** Hard wall-clock commitments. They never shift, never delay, and never split. Anchors auto-convene on time.
  - **Flow (⏱):** Flexible execution blocks that dynamically adjust, slide on overrun, or pull forward on early completion.
- **60-Second Calming Pause (🧘):** A mindful transition pause between regular tasks to prevent context-switching whiplash and reset cognitive focus. Extendable with `+1m` / `+5m` or startable on demand.
- **Open Buffer & Gap Filling (⚡):** When a task finishes early before a meeting, the cockpit smoothly enters a serene buffer countdown and suggests upcoming smaller tasks that fit inside the open gap.
- **Anchor Auto-Convene & Preemption:** When an anchor's start time arrives, the meeting auto-starts with an Apple harmonic chime. Any overrunning task is paused, with options to **Resume After Meeting** or mark **No, Task is Finished**.
- **Flow Guru Productivity Audit (✦):** An Apple-style slide-over inspection drawer powered by DeepSeek AI to evaluate execution velocity, anchor shield discipline, and pacing tips.

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
├── README.md
├── guide.html
├── index.html
└── report.html
```

---

## 4. Documentation & Research Reference

- [Harvard Business Review: How Timeboxing Works](https://hbr.org/2018/12/how-timeboxing-works-and-why-it-will-make-you-more-productive)
- Detailed operational walkthrough available in `guide.html`.
- Post-day reflection and velocity calibration report available in `report.html`.
