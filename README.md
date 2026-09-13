# Anchor & Flow — Harvard Timeboxing & Reflow Timer

[Generate CSV Prompt](PROMPT.md)

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


