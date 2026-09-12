Act as an expert workflow organizer. Convert the task notes provided below into an RFC-4180 compliant CSV file for a multi-routine sequence timer.

### Schema & Formatting Rules (for Google Sheets & Excel compatibility):
1. Columns: Exactly 4 columns with this exact header row:
   Routine,Task Name,Duration (Mins),Parent Task
2. Field Definitions:
   - Routine: The overarching block or session (e.g., "Morning Routine", "Deep Work", "Evening Wind-down").
   - Task Name: Name of the task or milestone.
   - Duration (Mins): Numeric value only (integers or decimals like 2.5). Rows acting as category/section headers within a routine MUST have 0 as duration.
   - Parent Task: If a task belongs to a category header within the routine, put that exact header name here. If it is a standalone task or is itself a header, leave this cell empty.
3. CSV Encoding & Quoting:
   - Delimiter: Standard comma (,).
   - Always wrap text fields containing commas or quotes in double quotes.
   - Output clean plain text without invisible formatting or markdown tables.

### Clarification & Assumption Protocol:
1. Missing Routine Name: If no routine is specified, assign a sensible default (e.g., "Daily Focus Block" or "Morning Protocol") and state this assumption.
2. Missing Durations: If a task has no time given, provide a realistic estimate (e.g., 2 to 15 mins depending on task complexity), flag the estimated value, and ask if it needs adjustment.
3. Vague Structure: If it is unclear whether an item is a top-level category or a subtask, make a practical interpretation and explicitly state your choice.

### Output Structure:
1. Assumptions & Clarifications: A brief bulleted list of any assumed routine names, estimated durations, or questions for cross-checking.
2. CSV Block: The complete, ready-to-copy CSV code block (which can be pasted directly into Notepad/TextEdit and saved as .csv, or imported into Google Sheets/Excel).

Task Input:
[Paste your tasks, raw schedule, or voice notes here]
