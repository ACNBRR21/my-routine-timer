// =========================================================
// ANCHOR & FLOW — THE FLOW GURU (PRODUCTIVITY GURU ENGINE)
// Executive Audits, Calendar Diagnostics, Harvard & Pareto 80/20
// =========================================================

// --- 1. CALENDAR AUDITING & HEALTH DIAGNOSTIC ---
function auditCalendarSchedule(calendarEvents, userProfile) {
  const events = calendarEvents || [];
  const profile = userProfile || {};
  
  let totalMeetingMins = 0;
  const warnings = [];
  const positiveNotes = [];

  // Filter actual calendar meetings (exclude meal routine anchors for meeting load calculation)
  const actualMeetings = events.filter(e => e.isAnchor && e.sourceType !== 'routine');
  actualMeetings.forEach(e => {
    totalMeetingMins += (e.duration || 30);
  });

  const totalMeetingHours = (totalMeetingMins / 60).toFixed(1);
  const workdayMins = 480; // Standard 8-hour workday
  const meetingLoadPercent = Math.min(100, Math.round((totalMeetingMins / workdayMins) * 100));

  // A. Check for Meeting Overload (> 180 mins or > 40% of day)
  if (totalMeetingMins >= 180 || meetingLoadPercent >= 40) {
    warnings.push({
      type: 'warning',
      code: 'meeting_overload',
      severity: 'high',
      title: 'Meeting Overload Detected',
      message: `You have ${actualMeetings.length} meetings occupying ${totalMeetingHours}h (${meetingLoadPercent}% of your day). Calendar fragmentation threatens your deep work capacity.`
    });
  } else if (actualMeetings.length > 0) {
    positiveNotes.push(`Balanced meeting load (${totalMeetingHours}h across ${actualMeetings.length} syncs). Ample deep work capacity remaining.`);
  } else {
    positiveNotes.push('Pristine calendar: Zero external meetings today. Optimal conditions for unbroken deep work sprints.');
  }

  // B. Check for Back-to-Back Meetings (Zero or < 5m buffer)
  const sortedMeetings = [...actualMeetings].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  let backToBackCount = 0;

  for (let i = 0; i < sortedMeetings.length - 1; i++) {
    const cur = sortedMeetings[i];
    const nxt = sortedMeetings[i + 1];

    if (cur.endTime && nxt.startTime) {
      const curEndMins = timeStrToMinutes(cur.endTime);
      const nxtStartMins = timeStrToMinutes(nxt.startTime);
      const gap = nxtStartMins - curEndMins;

      if (gap <= 5 && gap >= -10) {
        backToBackCount++;
        warnings.push({
          type: 'warning',
          code: 'back_to_back',
          severity: 'medium',
          title: 'Zero-Buffer Cognitive Strain',
          message: `Back-to-back transition from "${cur.title}" (${cur.startTime}-${cur.endTime}) to "${nxt.title}" (${nxt.startTime}) with only ${Math.max(0, gap)}m buffer. High risk of decision fatigue.`
        });
      }
    }
  }

  // C. Check for Missing Lunch / Nutrition Anchor
  const lunchTime = profile.lunchTime || '13:00';
  const lunchMins = timeStrToMinutes(lunchTime);
  const hasLunchAnchor = events.some(e => {
    const isExplicitMeal = /lunch|meal|eat|nutrition|bio-break/i.test(e.title || '');
    const isRoutineAnchor = e.sourceType === 'routine' && Math.abs(timeStrToMinutes(e.startTime) - lunchMins) <= 60;
    return isExplicitMeal || isRoutineAnchor;
  });

  if (!hasLunchAnchor) {
    warnings.push({
      type: 'warning',
      code: 'missing_lunch',
      severity: 'medium',
      title: 'Missing Nutrition & Recovery Anchor',
      message: `No lunch or meal recovery block detected around your typical ${lunchTime} window. Brain glucose depletion will degrade cognitive endurance by mid-afternoon.`
    });
  } else {
    positiveNotes.push(`Lunch & Bio-Break anchored around ${lunchTime}. Metabolic recovery secured.`);
  }

  // D. Compute Calendar Health Score (0 - 100)
  let healthScore = 100;
  if (totalMeetingMins >= 180) healthScore -= 20;
  else if (totalMeetingMins >= 120) healthScore -= 10;

  healthScore -= (backToBackCount * 12);
  if (!hasLunchAnchor) healthScore -= 12;

  healthScore = Math.max(20, Math.min(100, healthScore));

  let statusLabel = 'Optimal Flow';
  let statusColor = '#10b981';
  if (healthScore < 60) {
    statusLabel = 'Critical Fragmentation';
    statusColor = '#ef4444';
  } else if (healthScore < 80) {
    statusLabel = 'Moderate Meeting Strain';
    statusColor = '#f59e0b';
  }

  return {
    healthScore,
    statusLabel,
    statusColor,
    totalMeetingMins,
    totalMeetingHours,
    meetingLoadPercent,
    meetingCount: actualMeetings.length,
    backToBackCount,
    hasLunchAnchor,
    warnings,
    positiveNotes
  };
}

// --- 2. TASK EXECUTION & PARETO 80/20 AUDIT ---
function auditTaskExecution(tasks, userProfile) {
  const allTasks = tasks || [];
  const profile = userProfile || {};

  const totalCount = allTasks.length;
  const completedCount = allTasks.filter(t => t.completed).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Check Harvard Top 3 Prioritization
  const top1 = allTasks.find(t => t.priorityRank === 1 || /top\s*1/i.test(t.title || t.shortName || ''));
  const top2 = allTasks.find(t => t.priorityRank === 2 || /top\s*2/i.test(t.title || t.shortName || ''));
  const top3 = allTasks.find(t => t.priorityRank === 3 || /top\s*3/i.test(t.title || t.shortName || ''));
  const hasTop3Designated = !!(top1 || top2 || top3);

  // Pareto 80/20 Analysis
  // Pareto Rule: 20% of high-leverage actions yield 80% of value.
  // In an executive workday of 6-10 tasks, 2-3 tasks constitute the vital 20%.
  let paretoStatus = 'Balanced';
  let paretoAdvice = '';

  if (totalCount > 6 && !hasTop3Designated) {
    paretoStatus = 'Diluted Focus';
    paretoAdvice = `You have ${totalCount} tasks listed without clear priority distinction. Under Pareto's 80/20 Law, attempting 7+ tasks spreads cognitive energy thin. Lock your Top 3 and batch the rest.`;
  } else if (hasTop3Designated) {
    paretoStatus = 'High Leverage (Pareto Aligned)';
    paretoAdvice = 'Your day is correctly anchored around Top 3 priorities. Focus exclusively on Top 1 before touching secondary tasks.';
  } else {
    paretoStatus = 'Manageable';
    paretoAdvice = 'Task density is light. Aim to complete high-leverage milestones early in your day.';
  }

  // Calculate Overall Executive Productivity Score (0 - 100)
  let productivityScore = 80;
  if (hasTop3Designated) productivityScore += 10;
  if (completionRate >= 60) productivityScore += 10;
  else if (completionRate > 0 && completionRate < 30) productivityScore -= 10;

  productivityScore = Math.max(25, Math.min(100, productivityScore));

  return {
    totalCount,
    completedCount,
    completionRate,
    hasTop3Designated,
    top1: top1 ? (top1.title || top1.shortName) : null,
    top2: top2 ? (top2.title || top2.shortName) : null,
    top3: top3 ? (top3.title || top3.shortName) : null,
    paretoStatus,
    paretoAdvice,
    productivityScore
  };
}

// --- 3. SYNTHESIZE GURU RECOMMENDATIONS ---
function generateGuruStrategicAdvice(calendarAudit, taskAudit, userProfile) {
  const name = userProfile ? userProfile.userName || 'Executive' : 'Executive';
  const recommendations = [];

  // Advice 1: Meeting Overload Guidance
  if (calendarAudit.meetingCount >= 3) {
    recommendations.push({
      icon: '🛡️',
      title: 'Protect Your Deep Work Hours',
      text: `With ${calendarAudit.meetingCount} meetings scheduled (${calendarAudit.totalMeetingHours}h), do not schedule more than 2 deep focus blocks today. Defer low-priority admin.`
    });
  }

  // Advice 2: Back-to-Back Warning
  if (calendarAudit.backToBackCount > 0) {
    recommendations.push({
      icon: '☕',
      title: 'Enforce Restorative Buffers',
      text: `You have ${calendarAudit.backToBackCount} back-to-back meeting sequence(s). Flow Guru advises wrapping up each call 5 minutes early to drink water and decompress.`
    });
  }

  // Advice 3: Pareto 80/20 Execution Rule
  if (!taskAudit.hasTop3Designated && taskAudit.totalCount > 3) {
    recommendations.push({
      icon: '🎯',
      title: 'Apply Pareto’s 80/20 Rule Now',
      text: 'Identify the single task that would make today a victory even if nothing else got done. Mark it as Top 1 and execute it first.'
    });
  } else {
    recommendations.push({
      icon: '⚡',
      title: 'Serial Single-Tasking Mandate',
      text: 'Napoleon and Elon Musk achieved extreme velocity by giving 100% focus to one problem at a time. Silence Slack and email while running your focus sprints.'
    });
  }

  // Advice 4: Caregiving / Health Routine
  recommendations.push({
    icon: '🧴',
    title: 'Protect Health Anchors',
    text: `Keep your medication intervals (e.g. eye drops) and lunch timing non-negotiable. Physical health is the foundation of cognitive stamina.`
  });

  return recommendations;
}

// Helper: Convert "13:45" or "10:00" to absolute minutes from midnight
function timeStrToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = String(timeStr).trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

// Helper: Convert minutes from midnight to "HH:MM"
function minutesToTimeStr(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
