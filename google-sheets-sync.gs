/**
 * Anchor & Flow — Google Sheets Sync Gateway & Real-Time Task Repository
 * 
 * INSTRUCTIONS FOR GOOGLE SHEETS & GEMINI DEVELOPER:
 * 1. Open your target Google Sheet.
 * 2. In the top menu, go to: Extensions > Apps Script.
 * 3. Delete any default code in Code.gs and paste this entire script.
 * 4. Click 'Save', then click 'Deploy' > 'New deployment'.
 * 5. Select type: 'Web app'.
 * 6. Set Description: 'Anchor & Flow Sync'.
 * 7. Set 'Execute as': 'Me' (your email).
 * 8. Set 'Who has access': 'Anyone'.
 * 9. Click 'Deploy' and copy the generated Web App URL.
 * 10. Paste the Web App URL into Anchor & Flow (Tasks page > "📊 Google Sheet Sync" or Profile).
 * 
 * Every time you finish a task in the Timer or update goals/projects,
 * it instantly syncs into this sheet, keeping an immutable backup and
 * actual execution status for Gemini Developer applications.
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
          g.id,
          g.title,
          g.category,
          g.priority,
          g.targetWeeklyHours,
          g.targetDate || 'No deadline',
          g.why || '',
          g.bottleneck || 'None',
          g.completedTasks || 0,
          g.totalTasks || 0,
          (g.completionRate || 0) + '%',
          g.scheduleStatus || 'Active'
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
          p.id,
          p.goalTitle || 'None (Misc)',
          p.title,
          p.description || '',
          p.targetDate || 'No deadline',
          p.why || '',
          p.bottleneck || 'None',
          p.status || 'active',
          p.completedTasks || 0,
          p.totalTasks || 0,
          (p.completionRate || 0) + '%'
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
          t.id,
          t.goalTitle,
          t.projectTitle,
          t.title,
          t.priority,
          t.predictedDuration || 15,
          t.completedByDate || 'No deadline',
          t.bottleneck || 'None',
          t.actualStatus || (t.status === 'done' ? 'FINISHED' : 'TODO'),
          t.completedAt || '-',
          t.notes || ''
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
          s.id,
          s.timestamp || s.dateStr,
          s.title,
          s.category,
          Math.round((s.plannedSeconds || 0) / 60),
          Math.round((s.actualSeconds || 0) / 60),
          s.velocityRatio || 1.0,
          (s.accuracyPercent || 100) + '%',
          s.completionStatus || 'Completed',
          s.notes || ''
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

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    appName: 'Anchor & Flow Google Sheets Sync Gateway',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
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
}
