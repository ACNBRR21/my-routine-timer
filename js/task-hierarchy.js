// =========================================================
// ANCHOR & FLOW — GOALS, PROJECTS & TASKS HIERARCHY ENGINE
// Incorporating Strategic Bottlenecks, Completion Dates & Google Sheets Sync
// =========================================================

const STORAGE_KEY_HIERARCHY = 'anchor_flow_goals_hierarchy';
const STORAGE_KEY_SHEETS_CONFIG = 'anchor_flow_google_sheet_config';

// Initial Starter Dataset (Glaucoma caregiving, book launch, strategic architecture)
const DEFAULT_HIERARCHY = {
  goals: [
    {
      id: 'goal-1',
      title: 'Ship Harvard Timebox Engine & Book Launch',
      category: 'work',
      priority: 'critical', // 'critical', 'high', 'medium', 'low'
      targetWeeklyHours: 15,
      targetDate: '2026-11-15',
      why: 'Democratize serial single-tasking and Harvard timeboxing to rescue knowledge workers from meeting-induced cognitive fatigue.',
      bottleneck: 'Publisher copyright review on Harvard case studies and author citations',
      color: '#8b5cf6',
      notes: 'Primary Q4 strategic publication milestone'
    },
    {
      id: 'goal-2',
      title: 'Glaucoma Caregiving Protocol & Routine Health',
      category: 'health',
      priority: 'critical',
      targetWeeklyHours: 10,
      targetDate: '2026-12-31',
      why: "Protect mother's vision through infallible medication timing; honor caregiving as a sacred life anchor alongside work.",
      bottleneck: 'Dr. Sharma clinic consultation for revised IOP medication baseline',
      color: '#ec4899',
      notes: 'Non-negotiable medication and clinical eye drops schedule'
    },
    {
      id: 'goal-3',
      title: 'Strategic Architecture & Product Scalability',
      category: 'work',
      priority: 'high',
      targetWeeklyHours: 8,
      targetDate: '2026-10-31',
      why: 'Build a private, zero-telemetry, local-first system that runs perpetually without server outages or privacy leaks.',
      bottleneck: 'Cloudflare Worker proxy verification across enterprise firewalls',
      color: '#0284c7',
      notes: 'Clean modular codebase, automated verification, local security'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      goalId: 'goal-1',
      title: 'Manuscript Revisions & Publication',
      description: 'Final review of Chapters 4-7, clinical citations, and layout',
      targetDate: '2026-10-25',
      why: 'Deliver pristine editorial and citation accuracy before sending to book printing.',
      bottleneck: 'HBR reprint permission documentation from Boston office',
      status: 'active',
      color: '#8b5cf6'
    },
    {
      id: 'proj-2',
      goalId: 'goal-1',
      title: 'Distribution & Early Reader Outreach',
      description: 'ARC distribution, release notes, executive book landing page',
      targetDate: '2026-11-10',
      why: 'Build viral early momentum with top founders and executive productivity leaders.',
      bottleneck: 'Awaiting executive early-access reader list from marketing team',
      status: 'active',
      color: '#a855f7'
    },
    {
      id: 'proj-3',
      goalId: 'goal-2',
      title: 'Daily Eye Drops & Care Anchors',
      description: 'Rigid 90m and 75m interval administration, ocular health',
      targetDate: '2026-12-31',
      why: 'Maintain zero missed medication drops to stabilize intraocular pressure.',
      bottleneck: 'Pharmacy delivery schedule for Timolol and Latanoprost refills',
      status: 'active',
      color: '#ec4899'
    },
    {
      id: 'proj-4',
      goalId: 'goal-3',
      title: 'Local-First Core Platform',
      description: 'Offline sync, resilient parser, zero-telemetry client storage',
      targetDate: '2026-10-20',
      why: 'Ensure instant sub-second local response time and complete offline resilience.',
      bottleneck: 'Cross-browser automated test runner speed under Node 24',
      status: 'active',
      color: '#0284c7'
    },
    {
      id: 'proj-misc',
      goalId: null,
      title: 'Miscellaneous Tasks',
      description: 'Ad-hoc errands, loose administrative tasks, and quick emails',
      targetDate: null,
      why: 'Keep mental bandwidth clean by clearing micro-frictions quickly.',
      bottleneck: 'None',
      status: 'active',
      color: '#64748b'
    }
  ],
  tasks: [
    {
      id: 'task-1',
      projectId: 'proj-1',
      title: 'Review Chapter 4 Manuscript Draft',
      predictedDuration: 45,
      priority: 'critical',
      completedByDate: '2026-10-12',
      bottleneck: 'Waiting for editorial feedback from Sarah',
      status: 'todo', // 'todo', 'in_progress', 'done'
      completedAt: null,
      notes: 'Check clinical citations on circadian rhythms'
    },
    {
      id: 'task-2',
      projectId: 'proj-1',
      title: 'Proofread Chapter 5 Citations & Footnotes',
      predictedDuration: 25,
      priority: 'high',
      completedByDate: '2026-10-15',
      bottleneck: 'Verify HBR reprint license numbers',
      status: 'todo',
      completedAt: null,
      notes: 'Verify Harvard Business Review references'
    },
    {
      id: 'task-3',
      projectId: 'proj-2',
      title: 'Draft Newsletter Announcing Publication Date',
      predictedDuration: 30,
      priority: 'high',
      completedByDate: '2026-10-18',
      bottleneck: 'Need finalized book cover PNG from design agency',
      status: 'todo',
      completedAt: null,
      notes: 'Highlight timeboxing templates and personal story'
    },
    {
      id: 'task-4',
      projectId: 'proj-3',
      title: "Administer Mother's Secondary Eye Drops",
      predictedDuration: 15,
      priority: 'critical',
      completedByDate: '2026-10-06',
      bottleneck: 'None - Daily recurring time anchor',
      status: 'todo',
      completedAt: null,
      notes: 'Check 75-min gap from morning anchor'
    },
    {
      id: 'task-5',
      projectId: 'proj-4',
      title: 'Code Review on Planner Gap-Detection Algorithm',
      predictedDuration: 45,
      priority: 'critical',
      completedByDate: '2026-10-10',
      bottleneck: 'Waiting on RFC 5545 recurrence edge-case fixtures',
      status: 'todo',
      completedAt: null,
      notes: 'Ensure idle slots between meetings are accurately tagged'
    },
    {
      id: 'task-6',
      projectId: 'proj-misc',
      title: 'Reply to Partnership Inquiry Email',
      predictedDuration: 15,
      priority: 'medium',
      completedByDate: '2026-10-07',
      bottleneck: 'Follow up with David on revenue share terms',
      status: 'todo',
      completedAt: null,
      notes: 'Send introductory executive summary'
    },
    {
      id: 'task-7',
      projectId: 'proj-misc',
      title: 'Pay Monthly Cloud Hosting Invoice',
      predictedDuration: 10,
      priority: 'low',
      completedByDate: '2026-10-05',
      bottleneck: 'None',
      status: 'done',
      completedAt: '2026-10-05T14:30:00.000Z',
      notes: 'Download PDF receipt for tax records'
    }
  ]
};

// --- DATA ACCESS & PERSISTENCE ---
let _inMemoryHierarchy = null;
let _inMemorySheetsConfig = null;

function getGoalsHierarchy() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY_HIERARCHY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.goals) && Array.isArray(parsed.projects) && Array.isArray(parsed.tasks)) {
          if (!parsed.projects.some(p => p.id === 'proj-misc')) {
            parsed.projects.push({
              id: 'proj-misc',
              goalId: null,
              title: 'Miscellaneous Tasks',
              description: 'Ad-hoc errands, administrative tasks, and loose ends',
              why: 'Keep mental bandwidth clean by clearing micro-frictions quickly.',
              bottleneck: 'None',
              color: '#64748b'
            });
          }
          return parsed;
        }
      }
    } else if (_inMemoryHierarchy) {
      return _inMemoryHierarchy;
    }
  } catch(e) {
    console.error('Error loading goals hierarchy from storage:', e);
  }
  const cloned = JSON.parse(JSON.stringify(DEFAULT_HIERARCHY));
  saveGoalsHierarchy(cloned);
  return cloned;
}

function saveGoalsHierarchy(data) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_HIERARCHY, JSON.stringify(data));
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('anchor_flow_goals_updated', { detail: data }));
      }
    } else {
      _inMemoryHierarchy = data;
    }
  } catch(e) {
    console.error('Error saving goals hierarchy to storage:', e);
  }
}

// --- GOAL CRUD ---

function addGoal(goalData) {
  const data = getGoalsHierarchy();
  const id = goalData.id || `goal-${Date.now()}`;
  const newGoal = {
    id,
    title: goalData.title || 'Untitled Goal',
    category: goalData.category || 'work',
    priority: goalData.priority || 'high',
    targetWeeklyHours: parseInt(goalData.targetWeeklyHours, 10) || 10,
    targetDate: goalData.targetDate || null,
    why: goalData.why || '',
    bottleneck: goalData.bottleneck || '',
    color: goalData.color || '#0284c7',
    notes: goalData.notes || ''
  };
  data.goals.push(newGoal);
  saveGoalsHierarchy(data);
  return newGoal;
}

function updateGoal(id, updates) {
  const data = getGoalsHierarchy();
  const idx = data.goals.findIndex(g => g.id === id);
  if (idx !== -1) {
    data.goals[idx] = { ...data.goals[idx], ...updates };
    saveGoalsHierarchy(data);
    return data.goals[idx];
  }
  return null;
}

function deleteGoal(id) {
  const data = getGoalsHierarchy();
  data.goals = data.goals.filter(g => g.id !== id);
  // Re-link projects under this goal to Miscellaneous or null
  data.projects.forEach(p => {
    if (p.goalId === id) p.goalId = null;
  });
  saveGoalsHierarchy(data);
}

// --- PROJECT CRUD ---

function addProject(projData) {
  const data = getGoalsHierarchy();
  const id = projData.id || `proj-${Date.now()}`;
  const newProj = {
    id,
    goalId: projData.goalId || null,
    title: projData.title || 'Untitled Project',
    description: projData.description || '',
    targetDate: projData.targetDate || null,
    why: projData.why || '',
    bottleneck: projData.bottleneck || '',
    status: projData.status || 'active',
    color: projData.color || '#8b5cf6'
  };
  data.projects.push(newProj);
  saveGoalsHierarchy(data);
  return newProj;
}

function updateProject(id, updates) {
  const data = getGoalsHierarchy();
  const idx = data.projects.findIndex(p => p.id === id);
  if (idx !== -1) {
    data.projects[idx] = { ...data.projects[idx], ...updates };
    saveGoalsHierarchy(data);
    return data.projects[idx];
  }
  return null;
}

function deleteProject(id) {
  const data = getGoalsHierarchy();
  if (id === 'proj-misc') return; // Cannot delete miscellaneous folder
  data.projects = data.projects.filter(p => p.id !== id);
  // Re-assign tasks to miscellaneous
  data.tasks.forEach(t => {
    if (t.projectId === id) t.projectId = 'proj-misc';
  });
  saveGoalsHierarchy(data);
}

// --- TASK CRUD ---

function addTask(taskData) {
  const data = getGoalsHierarchy();
  const id = taskData.id || `task-${Date.now()}`;
  const predicted = predictTaskDuration(taskData.title);
  const dur = taskData.predictedDuration ? parseInt(taskData.predictedDuration, 10) : predicted.duration;

  const newTask = {
    id,
    projectId: taskData.projectId || 'proj-misc',
    title: taskData.title || 'Untitled Task',
    predictedDuration: dur,
    priority: taskData.priority || 'medium',
    completedByDate: taskData.completedByDate || taskData.dueDate || null,
    bottleneck: taskData.bottleneck || '',
    status: taskData.status || 'todo',
    completedAt: taskData.status === 'done' ? (taskData.completedAt || new Date().toISOString()) : null,
    notes: taskData.notes || ''
  };
  data.tasks.push(newTask);
  saveGoalsHierarchy(data);
  return newTask;
}

function updateTask(id, updates) {
  const data = getGoalsHierarchy();
  const idx = data.tasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    if (updates.status === 'done' && !data.tasks[idx].completedAt) {
      updates.completedAt = new Date().toISOString();
    } else if (updates.status && updates.status !== 'done') {
      updates.completedAt = null;
    }
    data.tasks[idx] = { ...data.tasks[idx], ...updates };
    saveGoalsHierarchy(data);
    return data.tasks[idx];
  }
  return null;
}

function deleteTask(id) {
  const data = getGoalsHierarchy();
  data.tasks = data.tasks.filter(t => t.id !== id);
  saveGoalsHierarchy(data);
}

function toggleTaskStatus(id) {
  const data = getGoalsHierarchy();
  const task = data.tasks.find(t => t.id === id);
  if (task) {
    if (task.status === 'done') {
      task.status = 'todo';
      task.completedAt = null;
    } else {
      task.status = 'done';
      task.completedAt = new Date().toISOString();
    }
    saveGoalsHierarchy(data);

    // Auto-sync to Google Sheet if configured
    try {
      const cfg = getGoogleSheetConfig();
      if (cfg && cfg.autoSync && cfg.sheetUrl) {
        syncToGoogleSheet({ silent: true });
      }
    } catch(e) {}

    return task;
  }
  return null;
}

/**
 * Automatically marks a task completed when finished in the Timer or Routines,
 * logs completion timestamp and triggers Google Sheet sync.
 */
function completeTaskFromTimer(titleOrId, actualDurationMins = null) {
  const data = getGoalsHierarchy();
  let task = data.tasks.find(t => t.id === titleOrId);
  if (!task && titleOrId) {
    const s = titleOrId.toLowerCase().trim();
    task = data.tasks.find(t => t.title.toLowerCase().trim() === s || t.title.toLowerCase().includes(s) || s.includes(t.title.toLowerCase()));
  }
  if (task) {
    task.status = 'done';
    task.completedAt = new Date().toISOString();
    if (actualDurationMins) {
      task.actualDuration = actualDurationMins;
    }
    saveGoalsHierarchy(data);

    // Notify listeners
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('anchor_flow_task_completed', { detail: task }));
    }

    // Auto-sync to Google Sheet
    try {
      const cfg = getGoogleSheetConfig();
      if (cfg && cfg.autoSync && cfg.sheetUrl) {
        syncToGoogleSheet({ silent: true });
      }
    } catch(e) {}

    return task;
  }
  return null;
}

// --- SMART TASK DURATION PREDICTOR ---

function predictTaskDuration(title) {
  if (!title || typeof title !== 'string') {
    return { duration: 25, confidence: 'default', reason: 'Standard focus interval' };
  }

  const t = title.toLowerCase().trim();

  // Check explicit minute declaration (e.g. "30m", "45 mins", "15 minutes")
  const explicitMatch = t.match(/\b(\d+)\s*(?:min|mins|minutes|m)\b/i);
  if (explicitMatch) {
    return {
      duration: parseInt(explicitMatch[1], 10),
      confidence: 'high',
      reason: `User explicitly stated ${explicitMatch[1]}m`
    };
  }

  // Micro tasks (5 - 10 mins)
  if (/\b(?:quick|pay|invoice|bill|ping|slack message|check email|hydrate|water|vitamin|sign|clean desk)\b/i.test(t)) {
    return { duration: 10, confidence: 'high', reason: 'Micro task / administrative check' };
  }

  // Quick action (15 mins)
  if (/\b(?:email|reply|call|standup|eye drops|drops|followup|follow-up|update ticket|stretch|walk|file|organize|triage)\b/i.test(t)) {
    return { duration: 15, confidence: 'high', reason: 'Focused brief interaction' };
  }

  // Medium focus block (25 - 30 mins)
  if (/\b(?:review|proofread|read|prep|prepare|newsletter|draft email|deck slides|slides|outline|summary|sync notes|check)\b/i.test(t)) {
    return { duration: 25, confidence: 'medium', reason: 'Cognitive synthesis / document review' };
  }

  // Extended deep work (45 - 60 mins)
  if (/\b(?:deep work|code|develop|implement|program|write chapter|manuscript|draft spec|spec|feature|audit|refactor|design|analyze|analysis|budget)\b/i.test(t)) {
    return { duration: 45, confidence: 'high', reason: 'Deep analytical focus block' };
  }

  // Heavy strategic session (90 mins)
  if (/\b(?:architecture|strategy|master plan|q4 plan|pitch deck|quarterly review|re-architecture)\b/i.test(t)) {
    return { duration: 90, confidence: 'medium', reason: 'Strategic architecture session' };
  }

  return { duration: 25, confidence: 'default', reason: 'Standard Pomodoro / Timebox default' };
}

// --- INTELLIGENT GAP-FILLING & GOAL ADVICE HELPERS ---

function findTasksForGap(availableMinutes, excludeIds = []) {
  const data = getGoalsHierarchy();
  const pendingTasks = data.tasks.filter(t => t.status !== 'done' && !excludeIds.includes(t.id));

  // Determine matching candidates (fit in availableMinutes with at least 5m buffer)
  const maxTaskMinutes = Math.max(5, availableMinutes - 5);
  const candidates = pendingTasks.filter(t => t.predictedDuration <= maxTaskMinutes);

  // Score candidate tasks: Critical Priority (+50), High (+30), Goal Linked (+20)
  candidates.sort((a, b) => {
    let scoreA = a.priority === 'critical' ? 50 : a.priority === 'high' ? 30 : 10;
    let scoreB = b.priority === 'critical' ? 50 : b.priority === 'high' ? 30 : 10;
    scoreA += (a.predictedDuration / maxTaskMinutes) * 15;
    scoreB += (b.predictedDuration / maxTaskMinutes) * 15;
    return scoreB - scoreA;
  });

  return candidates;
}

function getCriticalGoalsMissing(plannedTaskTitles = []) {
  const data = getGoalsHierarchy();
  const criticalGoals = data.goals.filter(g => g.priority === 'critical');
  const missingGoals = [];

  criticalGoals.forEach(cg => {
    const projectIds = data.projects.filter(p => p.goalId === cg.id).map(p => p.id);
    const goalTasks = data.tasks.filter(t => projectIds.includes(t.projectId));
    
    const searchTerms = [
      cg.title.toLowerCase(),
      ...data.projects.filter(p => p.goalId === cg.id).map(p => p.title.toLowerCase()),
      ...goalTasks.map(t => t.title.toLowerCase())
    ];

    const isHit = plannedTaskTitles.some(pTitle => {
      const ptLower = pTitle.toLowerCase();
      return searchTerms.some(st => ptLower.includes(st) || st.includes(ptLower));
    });

    if (!isHit) {
      const candidateTasks = goalTasks.filter(t => t.status !== 'done');
      missingGoals.push({
        goal: cg,
        suggestedTasks: candidateTasks
      });
    }
  });

  return missingGoals;
}

// --- LOCAL DATABASE EXPORT & RESTORE ---

function exportDatabaseJSON() {
  const data = getGoalsHierarchy();
  let userProfile = {};
  let auditHistory = [];

  try {
    const pRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('anchor_flow_user_profile') : null;
    if (pRaw) userProfile = JSON.parse(pRaw);
  } catch(e) {}

  try {
    const aRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('anchor_flow_guru_history') : null;
    if (aRaw) auditHistory = JSON.parse(aRaw);
  } catch(e) {}

  const fullBackup = {
    appName: 'Anchor & Flow',
    exportTimestamp: new Date().toISOString(),
    version: '3.2.0',
    hierarchy: data,
    userProfile,
    auditHistory,
    googleSheetConfig: getGoogleSheetConfig()
  };

  const jsonStr = JSON.stringify(fullBackup, null, 2);

  if (typeof document !== 'undefined') {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `anchor_flow_database_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return jsonStr;
}

function importDatabaseJSON(jsonStr) {
  try {
    const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
    const hier = parsed.hierarchy || parsed;

    if (hier && Array.isArray(hier.goals) && Array.isArray(hier.projects) && Array.isArray(hier.tasks)) {
      saveGoalsHierarchy(hier);
      if (parsed.userProfile && typeof localStorage !== 'undefined') {
        localStorage.setItem('anchor_flow_user_profile', JSON.stringify(parsed.userProfile));
      }
      if (parsed.googleSheetConfig) {
        saveGoogleSheetConfig(parsed.googleSheetConfig);
      }
      return { success: true, goalsCount: hier.goals.length, projectsCount: hier.projects.length, tasksCount: hier.tasks.length };
    } else {
      return { success: false, error: 'Invalid database structure. Missing goals, projects, or tasks arrays.' };
    }
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// --- GOOGLE SHEETS SYNCHRONIZATION ENGINE ---

function getGoogleSheetConfig() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SHEETS_CONFIG) : null;
    if (raw) {
      return JSON.parse(raw);
    }
  } catch(e) {}
  return {
    sheetUrl: '',
    autoSync: true,
    lastSyncedAt: null
  };
}

function saveGoogleSheetConfig(config) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SHEETS_CONFIG, JSON.stringify(config));
    }
  } catch(e) {}
}

/**
 * Builds structured tabular data payload for Google Sheets sync
 */
function buildGoogleSheetPayload() {
  const data = getGoalsHierarchy();
  const analytics = getHierarchyAnalytics();
  let timerLogs = [];
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('anchor_flow_execution_history') : null;
    if (raw) timerLogs = JSON.parse(raw);
  } catch(e) {}

  return {
    appName: 'Anchor & Flow',
    syncTimestamp: new Date().toISOString(),
    goals: analytics.goalStats.summaries.map(g => ({
      id: g.id,
      title: g.title,
      category: g.category,
      priority: g.priority,
      targetWeeklyHours: g.targetWeeklyHours || 10,
      targetDate: g.targetDate || '',
      why: g.why || '',
      bottleneck: g.bottleneck || 'None',
      completedTasks: g.completedTasks,
      totalTasks: g.totalTasks,
      completionRate: g.completionRate,
      scheduleStatus: g.scheduleStatus
    })),
    projects: analytics.projectStats.summaries.map(p => {
      const parentGoal = data.goals.find(g => g.id === p.goalId);
      return {
        id: p.id,
        goalId: p.goalId || '',
        goalTitle: parentGoal ? parentGoal.title : 'Miscellaneous',
        title: p.title,
        description: p.description || '',
        targetDate: p.targetDate || '',
        why: p.why || '',
        bottleneck: p.bottleneck || 'None',
        status: p.status || 'active',
        completedTasks: p.completedTasks,
        totalTasks: p.totalTasks,
        completionRate: p.completionRate
      };
    }),
    tasks: data.tasks.map(t => {
      const proj = data.projects.find(p => p.id === t.projectId) || { title: 'Miscellaneous' };
      const goal = data.goals.find(g => g.id === proj.goalId);
      return {
        id: t.id,
        projectId: t.projectId,
        projectTitle: proj.title,
        goalTitle: goal ? goal.title : 'Miscellaneous',
        title: t.title,
        priority: t.priority,
        predictedDuration: t.predictedDuration || 15,
        completedByDate: t.completedByDate || '',
        bottleneck: t.bottleneck || 'None',
        status: t.status,
        actualStatus: t.status === 'done' ? 'FINISHED' : (t.status === 'in_progress' ? 'IN PROGRESS' : 'TODO'),
        completedAt: t.completedAt || '',
        notes: t.notes || ''
      };
    }),
    timerExecutionLog: timerLogs
  };
}

/**
 * Dispatches sync payload to user's Google Sheet Web App endpoint
 */
async function syncToGoogleSheet(options = {}) {
  const cfg = getGoogleSheetConfig();
  const payload = buildGoogleSheetPayload();

  if (!cfg.sheetUrl || !cfg.sheetUrl.trim()) {
    if (!options.silent) {
      exportHierarchyToSheetsCSV();
    }
    return { success: false, message: 'No Google Sheet Web App URL configured. Downloaded CSV backup instead.' };
  }

  try {
    const response = await fetch(cfg.sheetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    cfg.lastSyncedAt = new Date().toISOString();
    saveGoogleSheetConfig(cfg);

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('anchor_flow_sheet_synced', { detail: { timestamp: cfg.lastSyncedAt } }));
    }

    return {
      success: true,
      lastSyncedAt: cfg.lastSyncedAt,
      message: 'Successfully synced goals, projects, tasks, bottlenecks, and actual statuses to Google Sheet!'
    };
  } catch(e) {
    console.error('Error syncing to Google Sheet:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Generates and downloads a clean, multi-table CSV formatted specifically for Google Sheets import
 */
function exportHierarchyToSheetsCSV() {
  const payload = buildGoogleSheetPayload();
  let csv = '';

  // 1. Goals Table
  csv += '=== STRATEGIC GOALS ===\n';
  csv += 'Goal ID,Goal Title,Category,Priority,Target Weekly Hours,Target Finish Date,The Why (Purpose),Bottleneck / Constraint,Completed Tasks,Total Tasks,Completion Rate %,Schedule Status\n';
  payload.goals.forEach(g => {
    csv += `"${g.id}","${(g.title||'').replace(/"/g, '""')}","${g.category}","${g.priority}",${g.targetWeeklyHours},"${g.targetDate}","${(g.why||'').replace(/"/g, '""')}","${(g.bottleneck||'').replace(/"/g, '""')}",${g.completedTasks},${g.totalTasks},"${g.completionRate}%","${g.scheduleStatus}"\n`;
  });
  csv += '\n';

  // 2. Projects Table
  csv += '=== ACTIVE PROJECTS / FOLDERS ===\n';
  csv += 'Project ID,Parent Goal Title,Project Title,Description,Target Finish Date,The Why (Motivation),Bottleneck / Blocker,Status,Completed Tasks,Total Tasks,Completion Rate %\n';
  payload.projects.forEach(p => {
    csv += `"${p.id}","${(p.goalTitle||'').replace(/"/g, '""')}","${(p.title||'').replace(/"/g, '""')}","${(p.description||'').replace(/"/g, '""')}","${p.targetDate}","${(p.why||'').replace(/"/g, '""')}","${(p.bottleneck||'').replace(/"/g, '""')}","${p.status}",${p.completedTasks},${p.totalTasks},"${p.completionRate}%"\n`;
  });
  csv += '\n';

  // 3. Tasks Table
  csv += '=== ACTION TASKS REPOSITORY ===\n';
  csv += 'Task ID,Goal Title,Project / Folder,Task Title,Priority,Est Duration (mins),Completed-By Date,Bottleneck / Blocker,Actual Status,Completed At Date,Notes\n';
  payload.tasks.forEach(t => {
    csv += `"${t.id}","${(t.goalTitle||'').replace(/"/g, '""')}","${(t.projectTitle||'').replace(/"/g, '""')}","${(t.title||'').replace(/"/g, '""')}","${t.priority}",${t.predictedDuration},"${t.completedByDate}","${(t.bottleneck||'').replace(/"/g, '""')}","${t.actualStatus}","${t.completedAt}","${(t.notes||'').replace(/"/g, '""')}"\n`;
  });
  csv += '\n';

  // 4. Timer Log Table
  if (payload.timerExecutionLog && payload.timerExecutionLog.length > 0) {
    csv += '=== TIMER EXECUTION REPOSITORY ===\n';
    csv += 'Session ID,Timestamp,Task Title,Category,Planned (m),Actual (m),Velocity Ratio,Accuracy %,Status,Notes\n';
    payload.timerExecutionLog.forEach(s => {
      csv += `"${s.id}","${s.timestamp||s.dateStr}","${(s.title||'').replace(/"/g, '""')}","${s.category}",${Math.round((s.plannedSeconds||0)/60)},${Math.round((s.actualSeconds||0)/60)},${s.velocityRatio||1.0},"${s.accuracyPercent||100}%","${s.completionStatus}","${(s.notes||'').replace(/"/g, '""')}"\n`;
    });
  }

  if (typeof document !== 'undefined') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `anchor_flow_google_sheets_export_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return csv;
}

/**
 * Returns copy-pasteable Google Apps Script code for Google Sheets sync
 */
function generateGoogleAppsScriptCode() {
  return `/**
 * Anchor & Flow — Google Sheets Sync Gateway
 * Paste into: Extensions > Apps Script in your Google Sheet
 * Deploy as: Web App (Execute as: Me, Who has access: Anyone)
 */

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Update Goals Tab
    if (data.goals && data.goals.length > 0) {
      var goalRows = [
        ['Goal ID', 'Goal Title', 'Category', 'Priority', 'Target Weekly Hours', 'Target Finish Date', 'The Why (Purpose)', 'Bottleneck / Constraint', 'Completed Tasks', 'Total Tasks', 'Completion Rate %', 'Schedule Status']
      ];
      data.goals.forEach(function(g) {
        goalRows.push([
          g.id, g.title, g.category, g.priority, g.targetWeeklyHours, g.targetDate || 'No deadline', g.why || '', g.bottleneck || 'None', g.completedTasks || 0, g.totalTasks || 0, (g.completionRate || 0) + '%', g.scheduleStatus || 'Active'
        ]);
      });
      writeTab(ss, 'Goals', goalRows, '#8b5cf6');
    }

    // 2. Update Projects Tab
    if (data.projects && data.projects.length > 0) {
      var projRows = [
        ['Project ID', 'Goal Title', 'Project Title', 'Description', 'Target Finish Date', 'The Why (Motivation)', 'Bottleneck / Dependency', 'Status', 'Completed Tasks', 'Total Tasks', 'Completion Rate %']
      ];
      data.projects.forEach(function(p) {
        projRows.push([
          p.id, p.goalTitle || 'None (Misc)', p.title, p.description || '', p.targetDate || 'No deadline', p.why || '', p.bottleneck || 'None', p.status || 'active', p.completedTasks || 0, p.totalTasks || 0, (p.completionRate || 0) + '%'
        ]);
      });
      writeTab(ss, 'Projects', projRows, '#0284c7');
    }

    // 3. Update Tasks Tab (Primary Repository with Actual Status)
    if (data.tasks && data.tasks.length > 0) {
      var taskRows = [
        ['Task ID', 'Goal Title', 'Project Title', 'Task Title', 'Priority', 'Est Duration (m)', 'Completed-By Date', 'Bottleneck / Blocker', 'Actual Status', 'Completed At Timestamp', 'Notes']
      ];
      data.tasks.forEach(function(t) {
        taskRows.push([
          t.id, t.goalTitle, t.projectTitle, t.title, t.priority, t.predictedDuration || 15, t.completedByDate || 'No deadline', t.bottleneck || 'None', t.actualStatus || (t.status === 'done' ? 'FINISHED' : 'TODO'), t.completedAt || '-', t.notes || ''
        ]);
      });
      writeTab(ss, 'Tasks', taskRows, '#10b981');
    }

    // 4. Update Timer Execution Log
    if (data.timerExecutionLog && data.timerExecutionLog.length > 0) {
      var timerRows = [
        ['Session ID', 'Date & Time', 'Task Title', 'Category', 'Planned (m)', 'Actual (m)', 'Velocity Ratio', 'Accuracy %', 'Status', 'Notes']
      ];
      data.timerExecutionLog.forEach(function(s) {
        timerRows.push([
          s.id, s.timestamp || s.dateStr, s.title, s.category, Math.round((s.plannedSeconds || 0)/60), Math.round((s.actualSeconds || 0)/60), s.velocityRatio || 1.0, (s.accuracyPercent || 100) + '%', s.completionStatus || 'Completed', s.notes || ''
        ]);
      });
      writeTab(ss, 'Timer Log', timerRows, '#f59e0b');
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      syncedAt: new Date().toISOString(),
      tasksUpdated: (data.tasks || []).length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function writeTab(ss, tabName, rows, headerColor) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  } else {
    sheet.clear();
  }
  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
    var header = sheet.getRange(1, 1, 1, rows[0].length);
    header.setBackground(headerColor || '#334155');
    header.setFontColor('#ffffff');
    header.setFontWeight('bold');
    sheet.setFrozenRows(1);
    for (var col = 1; col <= rows[0].length; col++) {
      sheet.autoResizeColumn(col);
    }
  }
}`;
}

// --- FLOW GURU PROGRESS & ADHERENCE ANALYTICS ---

function getHierarchyAnalytics() {
  const data = getGoalsHierarchy();
  const now = new Date();

  // 1. Task Completion Stats
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = data.tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = data.tasks.filter(t => t.status === 'todo').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalDurationMins = data.tasks.reduce((s, t) => s + (t.predictedDuration || 15), 0);
  const completedDurationMins = data.tasks.filter(t => t.status === 'done').reduce((s, t) => s + (t.predictedDuration || 15), 0);

  // 2. Project Progress & Target Date Adherence
  const projectSummaries = data.projects.map(p => {
    const pTasks = data.tasks.filter(t => t.projectId === p.id);
    const pDone = pTasks.filter(t => t.status === 'done').length;
    const pRate = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
    const isCompleted = p.status === 'completed' || (pTasks.length > 0 && pDone === pTasks.length);

    let daysRemaining = null;
    let scheduleStatus = 'on_track'; // 'on_track', 'at_risk', 'overdue', 'no_deadline'

    if (p.targetDate) {
      const target = new Date(p.targetDate);
      const diffMs = target - now;
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (daysRemaining < 0 && !isCompleted) {
        scheduleStatus = 'overdue';
      } else if (daysRemaining <= 7 && pRate < 70 && !isCompleted) {
        scheduleStatus = 'at_risk';
      } else {
        scheduleStatus = 'on_track';
      }
    } else {
      scheduleStatus = 'no_deadline';
    }

    return {
      id: p.id,
      title: p.title,
      goalId: p.goalId,
      description: p.description,
      why: p.why || '',
      bottleneck: p.bottleneck || '',
      targetDate: p.targetDate,
      daysRemaining,
      scheduleStatus,
      totalTasks: pTasks.length,
      completedTasks: pDone,
      completionRate: pRate,
      isCompleted,
      color: p.color || '#8b5cf6'
    };
  });

  const totalProjects = data.projects.length;
  const completedProjects = projectSummaries.filter(p => p.isCompleted).length;
  const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  // 3. Goal Progress & Vision Adherence
  const goalSummaries = data.goals.map(g => {
    const childProjects = projectSummaries.filter(p => p.goalId === g.id);
    const childProjectIds = childProjects.map(p => p.id);
    const gTasks = data.tasks.filter(t => childProjectIds.includes(t.projectId));
    const gDone = gTasks.filter(t => t.status === 'done').length;
    const gRate = gTasks.length > 0 ? Math.round((gDone / gTasks.length) * 100) : 0;

    let daysRemaining = null;
    let scheduleStatus = 'on_track';

    if (g.targetDate) {
      const target = new Date(g.targetDate);
      const diffMs = target - now;
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (daysRemaining < 0 && gRate < 100) {
        scheduleStatus = 'overdue';
      } else if (daysRemaining <= 14 && gRate < 60) {
        scheduleStatus = 'at_risk';
      } else {
        scheduleStatus = 'on_track';
      }
    } else {
      scheduleStatus = 'no_deadline';
    }

    return {
      id: g.id,
      title: g.title,
      category: g.category,
      priority: g.priority,
      targetWeeklyHours: g.targetWeeklyHours,
      why: g.why || '',
      bottleneck: g.bottleneck || '',
      targetDate: g.targetDate,
      daysRemaining,
      scheduleStatus,
      childProjects,
      totalTasks: gTasks.length,
      completedTasks: gDone,
      completionRate: gRate,
      color: g.color || '#0284c7'
    };
  });

  // 4. Bottlenecks Across Hierarchy
  const goalBottlenecks = goalSummaries.filter(g => g.bottleneck && g.bottleneck.trim() && g.bottleneck.toLowerCase() !== 'none');
  const projectBottlenecks = projectSummaries.filter(p => p.bottleneck && p.bottleneck.trim() && p.bottleneck.toLowerCase() !== 'none');
  const taskBottlenecks = data.tasks.filter(t => t.status !== 'done' && t.bottleneck && t.bottleneck.trim() && t.bottleneck.toLowerCase() !== 'none');
  const totalBottlenecks = goalBottlenecks.length + projectBottlenecks.length + taskBottlenecks.length;

  // 5. Flow State / In-The-Zone Calculation
  let timeInZoneMinutes = 180; // 3 hours in 9–12 peak default
  let flowStatePercentage = 78;

  try {
    const histRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('anchor_flow_guru_history') : null;
    if (histRaw) {
      const history = JSON.parse(histRaw);
      if (Array.isArray(history) && history.length > 0) {
        const recent = history.slice(-7);
        const avgFocusHours = recent.reduce((sum, r) => sum + (r.focusHours || 3), 0) / recent.length;
        const avgMeetingHours = recent.reduce((sum, r) => sum + (r.meetingHours || 1.5), 0) / recent.length;
        timeInZoneMinutes = Math.round(avgFocusHours * 60);
        flowStatePercentage = Math.round((avgFocusHours / (avgFocusHours + avgMeetingHours)) * 100);
      }
    }
  } catch(e) {}

  return {
    taskStats: {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      todo: todoTasks,
      completionRate: taskCompletionRate,
      totalDurationMins,
      completedDurationMins
    },
    projectStats: {
      total: totalProjects,
      completed: completedProjects,
      active: totalProjects - completedProjects,
      completionRate: projectCompletionRate,
      summaries: projectSummaries
    },
    goalStats: {
      total: data.goals.length,
      critical: data.goals.filter(g => g.priority === 'critical').length,
      summaries: goalSummaries
    },
    bottleneckStats: {
      total: totalBottlenecks,
      goalBottlenecks,
      projectBottlenecks,
      taskBottlenecks
    },
    flowZone: {
      timeInZoneMinutes,
      timeInZoneHours: parseFloat((timeInZoneMinutes / 60).toFixed(1)),
      flowStatePercentage,
      statusLabel: flowStatePercentage >= 75 ? 'Deep Immersion' : flowStatePercentage >= 50 ? 'Moderate Focus' : 'Fragmented',
      statusColor: flowStatePercentage >= 75 ? '#10b981' : flowStatePercentage >= 50 ? '#f59e0b' : '#ef4444'
    }
  };
}

// Export to window and module
if (typeof window !== 'undefined') {
  window.getGoalsHierarchy = getGoalsHierarchy;
  window.saveGoalsHierarchy = saveGoalsHierarchy;
  window.addGoal = addGoal;
  window.updateGoal = updateGoal;
  window.deleteGoal = deleteGoal;
  window.addProject = addProject;
  window.updateProject = updateProject;
  window.deleteProject = deleteProject;
  window.addTask = addTask;
  window.updateTask = updateTask;
  window.deleteTask = deleteTask;
  window.toggleTaskStatus = toggleTaskStatus;
  window.completeTaskFromTimer = completeTaskFromTimer;
  window.predictTaskDuration = predictTaskDuration;
  window.findTasksForGap = findTasksForGap;
  window.getCriticalGoalsMissing = getCriticalGoalsMissing;
  window.exportDatabaseJSON = exportDatabaseJSON;
  window.importDatabaseJSON = importDatabaseJSON;
  window.getHierarchyAnalytics = getHierarchyAnalytics;
  window.getGoogleSheetConfig = getGoogleSheetConfig;
  window.saveGoogleSheetConfig = saveGoogleSheetConfig;
  window.buildGoogleSheetPayload = buildGoogleSheetPayload;
  window.syncToGoogleSheet = syncToGoogleSheet;
  window.exportHierarchyToSheetsCSV = exportHierarchyToSheetsCSV;
  window.generateGoogleAppsScriptCode = generateGoogleAppsScriptCode;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getGoalsHierarchy,
    saveGoalsHierarchy,
    addGoal,
    updateGoal,
    deleteGoal,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    completeTaskFromTimer,
    predictTaskDuration,
    findTasksForGap,
    getCriticalGoalsMissing,
    exportDatabaseJSON,
    importDatabaseJSON,
    getHierarchyAnalytics,
    getGoogleSheetConfig,
    saveGoogleSheetConfig,
    buildGoogleSheetPayload,
    syncToGoogleSheet,
    exportHierarchyToSheetsCSV,
    generateGoogleAppsScriptCode
  };
}
