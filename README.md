# Anchor & Flow — Harvard Timeboxing & Reflow Timer

A client-side Harvard Timeboxing engine and chronological sequence timer designed around immutable calendar meetings (**Anchors**) and elastic work blocks (**Flow**).

Hosted live on GitHub Pages: [https://acnbrr21.github.io/my-routine-timer/](https://acnbrr21.github.io/my-routine-timer/)

---

## 1. Architecture Overview

- **Harvard Timeboxing Engine:** Structured across Brain Dump $\rightarrow$ Top 3 Priorities $\rightarrow$ Full Day Timeboxing.
- **Deterministic Real-Time Reflow:**
  - Tasks that overrun slide subsequent flow tasks forward, displaying an unobtrusive `+N min` drift chip.
  - If a task overrun threatens an anchor meeting, the task automatically splits into `Part 1` (ending at anchor start) and `continued` (resuming at anchor finish).
  - Anchors never move. Anchors never split. Anchors always win.
  - Early completions pull downstream flow forward.
- **Client-Side Calendar Ingestion:** Pure text/XML parser for RFC-5545 `.ics` files. Single timed events are mapped to exact wall-clock start times (`HH:MM`).
- **Data Governance & Privacy:** Zero server-side persistence. All schedules and audit logs live exclusively in browser `localStorage`.

---

## 2. GitHub Secrets & Security Configuration

The DeepSeek AI planning and reflection features isolate all secret keys from client-side JavaScript.

### Setting Repository Secrets
1. In your GitHub repository, navigate to **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
2. Click **New repository secret**.
3. Name: `DEEPSEEK_API_KEY`.
4. Secret: Paste your DeepSeek API key.
5. Click **Add secret**.

### Endpoint Authentication Model
- **Zero Client-Side Exposure:** `DEEPSEEK_API_KEY` is never compiled into client HTML, JS, or client logs.
- **Dispatched Actions:** The workflow `.github/workflows/deepseek-proxy.yml` runs on `workflow_dispatch` within an isolated GitHub runner.
- **Input Constraints:** Payloads are capped strictly at &le; 8,192 characters and &le; 5 MB.
- **Log Sanitization:** Python execution scripts mask authentication headers to prevent secret leakage in workflow run logs.
- **Local Fallback Option:** For development or offline environments where GitHub Actions cannot be dispatched synchronously, the client allows an optional direct key entry stored strictly in private `localStorage`.

### Secret Key Rotation Steps
1. Generate a new API key in the [DeepSeek Platform Console](https://platform.deepseek.com/).
2. In your GitHub repository, go to **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
3. Click on `DEEPSEEK_API_KEY` and click **Update**.
4. Paste the new key and save.
5. Once updated, revoke the previous key from the DeepSeek dashboard.

---

## 3. CSV Schema (Locked)

Both `Planned_Schedule.csv` and `Actual_Schedule.csv` follow this byte-identical RFC-4180 schema:

```csv
Routine,Task Name,Duration (Mins),Parent Task,Scheduled Start
```

- **Routine:** Grouping block (e.g., `Work Day`, `Morning Alignment`).
- **Task Name:** Specific milestone, meeting, or task (split rows use `— Part 1` and `— continued`).
- **Duration (Mins):** Positive integer duration in minutes (0 reserved for category headers).
- **Parent Task:** Grouping parent name if applicable.
- **Scheduled Start:** 24-hour `HH:MM` timestamp assigned to every single row.

---

## 4. Documentation & Research Reference

- [Harvard Business Review: How Timeboxing Works](https://hbr.org/2018/12/how-timeboxing-works-and-why-it-will-make-you-more-productive)
- Detailed operational walkthrough available in `guide.html`.
- Post-day reflection and velocity calibration report available in `report.html`.
