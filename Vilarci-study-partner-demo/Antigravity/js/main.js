// js/main.js — Vilarci Study Partner (Teacher & Coaching Institute Portal)
// Comprehensive SPA controller managing:
// 1. Dual Operator Modes (Coaching Institute with Multi-Teacher vs Independent Solo Teacher)
// 2. Subject-wise Teacher Assignments across Batches
// 3. Live Attendance Terminal & QR Generator
// 4. Points & Academic Honors Dispenser Desk with Real-time Peer Motivation Preview
// 5. Assessments, Fees, Curriculum Tracking & Marksheet Issuance

(function () {
  'use strict';

  // ─── APPLICATION STATE ───────────────────────────────────────────────────────
  var STATE = {
    operators: [],
    teachers: [],
    batches: [],
    students: [],
    syllabus_topics: [],
    tests: [],
    invoices: [],
    points_dispatches: [],
    issued_marksheets: [],
    today_sessions: []
  };

  var currentOperatorId = 'op-stellar';
  var currentBatchId = 'batch-10-m';

  // ─── INITIALIZATION ──────────────────────────────────────────────────────────
  function init() {
    loadState();
    setupRouting();
    setupOperatorSwitcher();
    setupModals();
    setupThemeToggle();
    setupForms();

    // Trigger initial route
    handleRoute();
  }

  function loadState() {
    var stored = localStorage.getItem('vilarci_partner_state_v1');
    if (stored) {
      try {
        STATE = JSON.parse(stored);
      } catch (e) {
        STATE = JSON.parse(JSON.stringify(window.PARTNER_DATA));
      }
    } else {
      STATE = JSON.parse(JSON.stringify(window.PARTNER_DATA));
    }
  }

  function saveState() {
    localStorage.setItem('vilarci_partner_state_v1', JSON.stringify(STATE));
  }

  function getActiveOperator() {
    return STATE.operators.find(function (op) { return op.id === currentOperatorId; }) || STATE.operators[0];
  }

  function getActiveBatch() {
    return STATE.batches.find(function (b) { return b.id === currentBatchId; }) || STATE.batches[0];
  }

  // ─── ROUTING ENGINE ─────────────────────────────────────────────────────────
  function setupRouting() {
    window.addEventListener('hashchange', handleRoute);
  }

  function handleRoute() {
    var hash = window.location.hash.replace('#', '') || 'dashboard';
    var validViews = ['dashboard', 'batches', 'attendance', 'syllabus', 'points', 'tests', 'fees', 'marksheets', 'faculty', 'admissions', 'settings'];
    
    if (validViews.indexOf(hash) === -1) {
      hash = 'dashboard';
    }

    // Toggle Section Views
    document.querySelectorAll('.view-section').forEach(function (sec) {
      sec.classList.remove('active');
    });
    var activeSec = document.getElementById('view-' + hash);
    if (activeSec) activeSec.classList.add('active');

    // Toggle Nav Links
    document.querySelectorAll('.nav-item').forEach(function (nav) {
      nav.classList.remove('active');
      if (nav.getAttribute('data-nav') === hash) {
        nav.classList.add('active');
      }
    });

    // Update Header Title
    var titles = {
      dashboard: 'Command Center',
      batches: 'Batches & Classroom Sections',
      attendance: 'Attendance & QR Terminal',
      syllabus: 'Curriculum & Syllabus Manager',
      points: 'Academic Points & Honors Dispenser',
      tests: 'Assessments & Scorecards',
      fees: 'Tuition Fees & Invoices',
      marksheets: 'Academic Marksheets Studio',
      faculty: 'Faculty & Staff Directory',
      admissions: 'Student Admissions & Join Codes',
      settings: 'Institute Profile & Settings'
    };
    var pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) pageTitleEl.textContent = titles[hash] || 'Command Center';

    // Render active view content
    renderActiveView(hash);
  }

  function renderActiveView(viewName) {
    switch (viewName) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'batches':
        renderBatches();
        break;
      case 'attendance':
        renderAttendance();
        break;
      case 'syllabus':
        renderSyllabus();
        break;
      case 'points':
        renderPoints();
        break;
      case 'tests':
        renderTests();
        break;
      case 'fees':
        renderFees();
        break;
      case 'marksheets':
        renderMarksheets();
        break;
      case 'faculty':
        renderFaculty();
        break;
      case 'admissions':
        renderAdmissions();
        break;
      case 'settings':
        renderSettings();
        break;
    }
  }

  // ─── OPERATOR CONTEXT SWITCHER ───────────────────────────────────────────────
  function setupOperatorSwitcher() {
    var select = document.getElementById('operatorSelectDropdown');
    if (!select) return;

    select.innerHTML = STATE.operators.map(function (op) {
      var icon = op.type === 'coaching_institute' ? '🏛️' : '🔬';
      var isSelected = op.id === currentOperatorId ? ' selected' : '';
      return '<option value="' + op.id + '"' + isSelected + '>' + icon + ' ' + op.name + '</option>';
    }).join('');

    select.onchange = function () {
      switchOperator(this.value);
    };

    var switchCard = document.getElementById('btnSwitchOperatorCard');
    if (switchCard) {
      switchCard.onclick = function () {
        // Cycle to next operator
        var idx = STATE.operators.findIndex(function (o) { return o.id === currentOperatorId; });
        var nextIdx = (idx + 1) % STATE.operators.length;
        switchOperator(STATE.operators[nextIdx].id);
      };
    }

    updateSidebarOperatorContext();
  }

  function switchOperator(newOpId) {
    currentOperatorId = newOpId;
    var op = getActiveOperator();

    // Default current batch to first batch of this operator
    var opBatches = STATE.batches.filter(function (b) { return b.operator_id === op.id; });
    if (opBatches.length > 0) {
      currentBatchId = opBatches[0].id;
    }

    // Sync select dropdown
    var select = document.getElementById('operatorSelectDropdown');
    if (select) select.value = currentOperatorId;

    updateSidebarOperatorContext();
    handleRoute();
    showToast('Switched operator to: ' + op.name, 'info');
  }

  function updateSidebarOperatorContext() {
    var op = getActiveOperator();
    var isCoaching = op.type === 'coaching_institute';

    var opTypeTag = document.getElementById('sidebarOpTypeTag');
    if (opTypeTag) {
      opTypeTag.className = 'operator-type-tag ' + (isCoaching ? 'coaching' : 'solo');
      opTypeTag.textContent = isCoaching ? 'Coaching Institute' : 'Solo Specialist Teacher';
    }

    var opCodeEl = document.getElementById('sidebarOpCode');
    if (opCodeEl) opCodeEl.textContent = op.code;

    var opLogoEl = document.getElementById('sidebarOpLogo');
    if (opLogoEl) {
      opLogoEl.textContent = op.logo_text;
      opLogoEl.style.backgroundColor = op.theme_color || '#800020';
    }

    var opNameEl = document.getElementById('sidebarOpName');
    if (opNameEl) opNameEl.textContent = op.name;

    var opDirectorEl = document.getElementById('sidebarOpDirector');
    if (opDirectorEl) opDirectorEl.textContent = op.director_name;

    // Sidebar footer user
    var footerName = document.getElementById('sidebarUserName');
    if (footerName) footerName.textContent = op.director_name.split('(')[0].trim();

    var footerRole = document.getElementById('sidebarUserRole');
    if (footerRole) footerRole.textContent = isCoaching ? 'Institute Director' : 'Principal Faculty';

    // Show or hide Faculty tab (coaching has multi-teachers; solo tuition does not need it)
    var navFaculty = document.getElementById('navItemFaculty');
    if (navFaculty) {
      navFaculty.style.display = isCoaching ? 'flex' : 'none';
    }

    // Update batch counter badge in sidebar
    var opBatches = STATE.batches.filter(function (b) { return b.operator_id === op.id; });
    var badgeBatches = document.getElementById('navBadgeBatches');
    if (badgeBatches) badgeBatches.textContent = opBatches.length;
  }

  // ─── 1. RENDER: DASHBOARD (COMMAND CENTER) ──────────────────────────────────
  function renderDashboard() {
    var op = getActiveOperator();
    var isCoaching = op.type === 'coaching_institute';

    // Hero Card
    var heroType = document.getElementById('heroOpType');
    if (heroType) heroType.textContent = isCoaching ? '🏛️ COACHING INSTITUTE DASHBOARD' : '🔬 INDEPENDENT TEACHER PORTAL';

    var heroName = document.getElementById('heroOpName');
    if (heroName) heroName.textContent = op.name;

    var heroTagline = document.getElementById('heroOpTagline');
    if (heroTagline) heroTagline.textContent = op.tagline;

    var heroDirector = document.getElementById('heroOpDirector');
    if (heroDirector) heroDirector.textContent = 'Mentor: ' + op.director_name;

    var heroCode = document.getElementById('heroOpCode');
    if (heroCode) heroCode.textContent = 'Student Join Code: ' + op.code;

    var heroEst = document.getElementById('heroOpEst');
    if (heroEst) heroEst.textContent = 'Est. ' + op.established;

    // Batches of this operator
    var opBatches = STATE.batches.filter(function (b) { return b.operator_id === op.id; });
    var batchIds = opBatches.map(function (b) { return b.id; });

    // Students enrolled in this operator's batches
    var enrolledStudents = STATE.students.filter(function (s) {
      return (s.enrolled_batches || []).some(function (bId) { return batchIds.indexOf(bId) !== -1; });
    });

    // Invoices for this operator
    var opInvoices = STATE.invoices.filter(function (inv) { return inv.operator_id === op.id; });
    var totalPaid = opInvoices.filter(function (i) { return i.status === 'paid'; })
      .reduce(function (sum, i) { return sum + i.amount; }, 0);

    // Points dispatched
    var opPoints = STATE.points_dispatches.filter(function (p) { return p.operator_id === op.id; })
      .reduce(function (sum, p) { return sum + p.points; }, 0);

    // KPI values
    var kpiStudents = document.getElementById('kpiTotalStudents');
    if (kpiStudents) kpiStudents.textContent = enrolledStudents.length || op.total_students;

    var kpiBatches = document.getElementById('kpiActiveBatches');
    if (kpiBatches) kpiBatches.textContent = opBatches.length;

    var kpiPoints = document.getElementById('kpiPointsAwarded');
    if (kpiPoints) kpiPoints.textContent = opPoints.toLocaleString();

    var kpiFee = document.getElementById('kpiFeeCollection');
    if (kpiFee) kpiFee.textContent = '₹' + (totalPaid / 1000).toFixed(1) + 'K';

    // Dashboard Batches Table
    var batchesTbody = document.getElementById('dashboardBatchesBody');
    if (batchesTbody) {
      batchesTbody.innerHTML = opBatches.map(function (batch) {
        var facultyList = (batch.assigned_faculty || []).map(function (af) {
          var teacher = STATE.teachers.find(function (t) { return t.id === af.teacher_id; });
          var teacherName = teacher ? teacher.name : 'Faculty';
          return '<span class="badge badge-muted" style="margin:2px 0;">' + af.subject + ': <strong>' + teacherName + '</strong></span>';
        }).join('<br>');

        return (
          '<tr>' +
            '<td><strong>' + batch.name + '</strong><br><span class="text-xs text-muted">🏛️ ' + batch.room + '</span></td>' +
            '<td><span class="badge badge-primary">' + batch.grade + '</span></td>' +
            '<td>' + (facultyList || '<span class="text-xs text-muted">Direct Faculty</span>') + '</td>' +
            '<td class="text-xs">' + batch.schedule + '</td>' +
            '<td><strong>' + batch.enrolled_count + '</strong> / ' + batch.capacity + '</td>' +
          '</tr>'
        );
      }).join('');
    }

    // Dashboard Recent Points Dispatches
    var pointsContainer = document.getElementById('dashboardRecentPointsList');
    if (pointsContainer) {
      var opDispatches = STATE.points_dispatches.filter(function (p) { return p.operator_id === op.id; });
      if (opDispatches.length === 0) {
        pointsContainer.innerHTML = '<div class="p-20 text-center text-muted text-sm">No points awarded recently.</div>';
      } else {
        pointsContainer.innerHTML = opDispatches.slice(0, 5).map(function (p) {
          return (
            '<div style="display:flex; justify-content:space-between; align-items:center; padding:12px 18px; border-bottom:1px solid var(--border);">' +
              '<div>' +
                '<div style="font-size:13.5px; font-weight:700;">' + p.student_name + '</div>' +
                '<div style="font-size:11.5px; color:var(--text-muted);">' + p.category + ' &bull; Awarded by: <strong>' + p.awarded_by + '</strong></div>' +
              '</div>' +
              '<span class="badge badge-primary" style="font-size:12px;">+' + p.points + ' pts</span>' +
            '</div>'
          );
        }).join('');
      }
    }
  }

  // ─── 2. RENDER: BATCHES & CLASSES ──────────────────────────────────────────
  function renderBatches() {
    var op = getActiveOperator();
    var opBatches = STATE.batches.filter(function (b) { return b.operator_id === op.id; });
    var container = document.getElementById('batchesGridContainer');
    if (!container) return;

    container.innerHTML = opBatches.map(function (batch) {
      var facultyChips = (batch.assigned_faculty || []).map(function (af) {
        var t = STATE.teachers.find(function (tc) { return tc.id === af.teacher_id; });
        return (
          '<div class="faculty-chip">' +
            '<span class="fc-subject">' + af.subject + '</span>' +
            '<span class="fc-teacher">' + (t ? t.name : 'Faculty') + '</span>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="batch-card" data-batch-id="' + batch.id + '">' +
          '<div class="batch-card-top">' +
            '<div>' +
              '<h3 class="batch-title">' + batch.name + '</h3>' +
              '<div class="text-xs text-muted" style="margin-top:2px;">🏛️ ' + batch.room + '</div>' +
            '</div>' +
            '<span class="batch-grade-pill">' + batch.grade + ' &bull; ' + batch.board + '</span>' +
          '</div>' +
          '<div class="batch-schedule-meta">⏱️ ' + batch.schedule + '</div>' +
          '<div class="batch-faculty-section">' +
            '<div class="faculty-section-title">Subject-wise Assigned Faculty</div>' +
            '<div class="faculty-chips-list">' + (facultyChips || '<div class="text-xs text-muted">Primary Teacher Direct</div>') + '</div>' +
          '</div>' +
          '<div class="batch-stats-row">' +
            '<span class="batch-stats-item">Students: <strong>' + batch.enrolled_count + ' / ' + batch.capacity + '</strong></span>' +
            '<span class="batch-stats-item">Attendance: <strong>' + batch.attendance_rate + '%</strong></span>' +
            '<span class="batch-stats-item">Fee: <strong>₹' + batch.monthly_fee + '/mo</strong></span>' +
          '</div>' +
          '<div class="batch-actions-row">' +
            '<button type="button" class="btn btn-primary btn-sm btn-view-roster" data-batch-id="' + batch.id + '" style="flex:1;">View Students Roster</button>' +
            '<button type="button" class="btn btn-outline btn-sm btn-quick-pts-batch" data-batch-id="' + batch.id + '">🏅 Award Points</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    // Attach listeners
    document.querySelectorAll('.btn-view-roster').forEach(function (btn) {
      btn.onclick = function () {
        var bId = this.getAttribute('data-batch-id');
        currentBatchId = bId;
        renderBatchStudentRoster(bId);
        var rosterEl = document.getElementById('batchStudentsRosterCard');
        if (rosterEl) rosterEl.scrollIntoView({ behavior: 'smooth' });
      };
    });

    document.querySelectorAll('.btn-quick-pts-batch').forEach(function (btn) {
      btn.onclick = function () {
        var bId = this.getAttribute('data-batch-id');
        openAwardPointsModal(bId);
      };
    });

    renderBatchStudentRoster(currentBatchId);
  }

  function renderBatchStudentRoster(batchId) {
    var batch = STATE.batches.find(function (b) { return b.id === batchId; }) || STATE.batches[0];
    if (!batch) return;

    var titleEl = document.getElementById('rosterBatchTitle');
    if (titleEl) titleEl.textContent = 'Enrolled Students — ' + batch.name;

    // Filter students enrolled in this batch
    var batchStudents = STATE.students.filter(function (s) {
      return (s.enrolled_batches || []).indexOf(batch.id) !== -1;
    });

    var tbody = document.getElementById('rosterStudentsTableBody');
    if (!tbody) return;

    if (batchStudents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center p-20 text-muted">No students currently enrolled in this batch.</td></tr>';
      return;
    }

    tbody.innerHTML = batchStudents.map(function (student) {
      var feeBadgeClass = student.fee_status === 'paid' ? 'badge-success' : (student.fee_status === 'pending' ? 'badge-warning' : 'badge-danger');
      var feeText = student.fee_status.toUpperCase();

      return (
        '<tr>' +
          '<td><span class="font-mono text-xs font-bold">' + student.roll + '</span></td>' +
          '<td>' +
            '<div style="display:flex; align-items:center; gap:8px;">' +
              '<div style="width:28px; height:28px; border-radius:50%; background:' + (student.avatar_bg || 'var(--primary)') + '; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">' + student.avatar_initials + '</div>' +
              '<strong>' + student.name + '</strong>' +
            '</div>' +
          '</td>' +
          '<td>' +
            '<div style="font-size:12px;">' +
              'Father: ' + student.father_name + ' &bull; <a href="https://wa.me/' + student.father_phone.replace(/[^0-9]/g, '') + '" target="_blank" style="color:var(--primary); font-weight:600;">' + student.father_phone + '</a>' +
              (student.father_phone_verified ? ' <span class="badge badge-success" style="font-size:9.5px; padding:1px 5px;">✓ Verified</span>' : '') +
            '</div>' +
            '<div style="font-size:11px; color:var(--text-muted);">' +
              'Mother: ' + student.mother_name + ' (' + student.mother_phone + ')' +
            '</div>' +
          '</td>' +
          '<td><strong>' + student.points.toLocaleString() + '</strong> pts</td>' +
          '<td>🔥 ' + student.streak + 'd</td>' +
          '<td><strong>' + student.attendance_percentage + '%</strong></td>' +
          '<td><span class="badge ' + feeBadgeClass + '">' + feeText + '</span></td>' +
          '<td>' +
            '<button type="button" class="btn btn-outline btn-sm btn-award-single" data-student-id="' + student.id + '" data-batch-id="' + batch.id + '">🏅 Points</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    // Attach single student award listener
    document.querySelectorAll('.btn-award-single').forEach(function (btn) {
      btn.onclick = function () {
        var sId = this.getAttribute('data-student-id');
        var bId = this.getAttribute('data-batch-id');
        openAwardPointsModal(bId, sId);
      };
    });
  }

  // ─── 3. RENDER: ATTENDANCE & QR TERMINAL ─────────────────────────────────────
  function renderAttendance() {
    var op = getActiveOperator();
    var batch = getActiveBatch();

    var titleEl = document.getElementById('qrBatchTitle');
    if (titleEl) titleEl.textContent = batch.name + ' — Daily Check-in Terminal';

    var tokenEl = document.getElementById('qrTokenDisplay');
    var sessionToken = op.code + '-QR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + batch.id.toUpperCase();
    if (tokenEl) tokenEl.textContent = 'ACTIVE QR TOKEN: ' + sessionToken;

    // Attendance Sheet for current batch
    var batchStudents = STATE.students.filter(function (s) {
      return (s.enrolled_batches || []).indexOf(batch.id) !== -1;
    });

    var tbody = document.getElementById('attendanceSheetTableBody');
    if (!tbody) return;

    tbody.innerHTML = batchStudents.map(function (student, idx) {
      var isCheckedIn = (idx % 6 !== 5); // Simulated check-in
      var checkInTime = isCheckedIn ? '07:' + (35 + (idx * 2) % 20) + ' AM' : '—';
      var currentStatus = isCheckedIn ? 'present' : 'absent';

      return (
        '<tr data-student-id="' + student.id + '">' +
          '<td><span class="font-mono text-xs font-bold">' + student.roll + '</span></td>' +
          '<td>' +
            '<div style="display:flex; align-items:center; gap:8px;">' +
              '<div style="width:26px; height:26px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:800;">' + student.avatar_initials + '</div>' +
              '<strong>' + student.name + '</strong>' +
            '</div>' +
          '</td>' +
          '<td>' + (isCheckedIn ? '📱 QR Verified &bull; ' + checkInTime : '<span class="text-xs text-muted">Not scanned</span>') + '</td>' +
          '<td>' +
            '<div class="att-toggle-group" data-student-id="' + student.id + '">' +
              '<button type="button" class="att-btn ' + (currentStatus === 'present' ? 'active present' : '') + '" data-status="present">P</button>' +
              '<button type="button" class="att-btn ' + (currentStatus === 'late' ? 'active late' : '') + '" data-status="late">L</button>' +
              '<button type="button" class="att-btn ' + (currentStatus === 'absent' ? 'active absent' : '') + '" data-status="absent">A</button>' +
            '</div>' +
          '</td>' +
          '<td>' + (isCheckedIn ? '<span class="badge badge-success">+10 pts</span>' : '0 pts') + '</td>' +
          '<td>' +
            '<a href="https://wa.me/' + student.father_phone.replace(/[^0-9]/g, '') + '?text=Dear%20Parent,%20' + encodeURIComponent(student.name) + '%20was%20marked%20' + currentStatus.toUpperCase() + '%20in%20today\'s%20' + encodeURIComponent(batch.name) + '." target="_blank" class="btn btn-outline btn-sm">💬 SMS/WA</a>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    // Toggle button clicks
    document.querySelectorAll('.att-btn').forEach(function (btn) {
      btn.onclick = function () {
        var group = this.closest('.att-toggle-group');
        group.querySelectorAll('.att-btn').forEach(function (b) { b.className = 'att-btn'; });
        var status = this.getAttribute('data-status');
        this.className = 'att-btn active ' + status;
        showToast('Updated student attendance to: ' + status.toUpperCase(), 'info');
      };
    });

    var markAllBtn = document.getElementById('btnMarkAllPresent');
    if (markAllBtn) {
      markAllBtn.onclick = function () {
        document.querySelectorAll('.att-toggle-group').forEach(function (group) {
          group.querySelectorAll('.att-btn').forEach(function (b) { b.className = 'att-btn'; });
          var pBtn = group.querySelector('[data-status="present"]');
          if (pBtn) pBtn.className = 'att-btn active present';
        });
        showToast('Marked all students as Present (+10 pts)', 'success');
      };
    }

    var saveBtn = document.getElementById('btnSaveAttendance');
    if (saveBtn) {
      saveBtn.onclick = function () {
        showToast('Attendance session saved and synced to student portals!', 'success');
      };
    }
  }

  // ─── 4. RENDER: SYLLABUS TRACKER ────────────────────────────────────────────
  function renderSyllabus() {
    var op = getActiveOperator();
    var opBatches = STATE.batches.filter(function (b) { return b.operator_id === op.id; });
    var batchSelect = document.getElementById('syllabusBatchFilter');
    if (batchSelect) {
      batchSelect.innerHTML = opBatches.map(function (b) {
        var isSelected = b.id === currentBatchId ? ' selected' : '';
        return '<option value="' + b.id + '"' + isSelected + '>' + b.name + '</option>';
      }).join('');

      batchSelect.onchange = function () {
        currentBatchId = this.value;
        renderSyllabus();
      };
    }

    var topics = STATE.syllabus_topics.filter(function (t) { return t.batch_id === currentBatchId; });
    var tbody = document.getElementById('syllabusTableBody');
    if (!tbody) return;

    if (topics.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center p-20 text-muted">No curriculum topics registered for this batch.</td></tr>';
      return;
    }

    tbody.innerHTML = topics.map(function (topic) {
      var statusBadge = topic.status === 'covered' 
        ? '<span class="badge badge-success">✓ Covered</span>' 
        : (topic.status === 'in_progress' ? '<span class="badge badge-warning">⚡ In Progress</span>' : '<span class="badge badge-muted">Upcoming</span>');

      return (
        '<tr>' +
          '<td><strong>' + topic.subject + '</strong></td>' +
          '<td>Chapter ' + topic.chapter_number + ': <strong>' + topic.chapter_name + '</strong></td>' +
          '<td>' + topic.topic_name + '</td>' +
          '<td>' + topic.assigned_teacher + '</td>' +
          '<td>' + statusBadge + '</td>' +
          '<td><strong>' + topic.revised_students_count + '</strong> students marked revision (+15 pts)</td>' +
          '<td>' +
            '<button type="button" class="btn btn-outline btn-sm btn-toggle-topic-status" data-topic-id="' + topic.id + '">Change Status</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    document.querySelectorAll('.btn-toggle-topic-status').forEach(function (btn) {
      btn.onclick = function () {
        var tId = this.getAttribute('data-topic-id');
        var t = STATE.syllabus_topics.find(function (item) { return item.id === tId; });
        if (t) {
          t.status = t.status === 'covered' ? 'in_progress' : (t.status === 'in_progress' ? 'upcoming' : 'covered');
          saveState();
          renderSyllabus();
          showToast('Updated status for: ' + t.topic_name, 'info');
        }
      };
    });
  }

  // ─── 5. RENDER: POINTS & ACADEMIC HONORS DISPENSER ──────────────────────────
  function renderPoints() {
    var op = getActiveOperator();
    var opBatches = STATE.batches.filter(function (b) { return b.operator_id === op.id; });

    // Populate Batch Dropdown
    var batchSelect = document.getElementById('awardSelectBatch');
    if (batchSelect) {
      batchSelect.innerHTML = opBatches.map(function (b) {
        var isSelected = b.id === currentBatchId ? ' selected' : '';
        return '<option value="' + b.id + '"' + isSelected + '>' + b.name + '</option>';
      }).join('');

      batchSelect.onchange = function () {
        currentBatchId = this.value;
        populateStudentsDropdownForPoints(this.value);
        renderLiveBatchLeaderboardPreview(this.value);
      };
    }

    populateStudentsDropdownForPoints(currentBatchId);
    renderLiveBatchLeaderboardPreview(currentBatchId);
    renderPointsLedgerTable();

    // Quick pts buttons
    document.querySelectorAll('.quick-pts-btn').forEach(function (btn) {
      btn.onclick = function () {
        var pts = this.getAttribute('data-pts');
        var input = document.getElementById('awardPointsAmount');
        if (input) input.value = pts;
      };
    });

    // Form submission
    var form = document.getElementById('formAwardPoints');
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var bId = document.getElementById('awardSelectBatch').value;
        var sId = document.getElementById('awardSelectStudent').value;
        var pts = parseInt(document.getElementById('awardPointsAmount').value, 10);
        var category = document.getElementById('awardCategory').value;
        var reason = document.getElementById('awardReasonText').value;

        dispatchPointsToStudent(bId, sId, pts, category, reason);
        form.reset();
        document.getElementById('awardPointsAmount').value = '100';
      };
    }
  }

  function populateStudentsDropdownForPoints(batchId) {
    var studentSelect = document.getElementById('awardSelectStudent');
    if (!studentSelect) return;

    var batchStudents = STATE.students.filter(function (s) {
      return (s.enrolled_batches || []).indexOf(batchId) !== -1;
    });

    studentSelect.innerHTML = batchStudents.map(function (s) {
      return '<option value="' + s.id + '">' + s.name + ' (' + s.roll + ') — ' + s.points.toLocaleString() + ' pts</option>';
    }).join('');
  }

  function renderLiveBatchLeaderboardPreview(batchId) {
    var previewContainer = document.getElementById('liveBatchLeaderboardPreview');
    if (!previewContainer) return;

    var batch = STATE.batches.find(function (b) { return b.id === batchId; }) || STATE.batches[0];
    var students = STATE.students.filter(function (s) {
      return (s.enrolled_batches || []).indexOf(batch.id) !== -1;
    });

    // Sort by points descending
    students.sort(function (a, b) { return b.points - a.points; });

    previewContainer.innerHTML = (
      '<div style="padding:14px 18px; background:var(--surface-muted); border-bottom:1px solid var(--border); font-size:12.5px; font-weight:700;">' +
        '🏆 Live Standings in ' + batch.name +
      '</div>' +
      students.map(function (s, idx) {
        var rankStr = String(idx + 1).padStart(2, '0');
        var medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : '⭐'));
        return (
          '<div style="display:flex; justify-content:space-between; align-items:center; padding:11px 18px; border-bottom:1px solid var(--border);">' +
            '<div style="display:flex; align-items:center; gap:10px;">' +
              '<span style="font-family:var(--font-mono); font-size:12px; font-weight:800; min-width:44px;">' + medal + ' ' + rankStr + '</span>' +
              '<div style="width:28px; height:28px; border-radius:50%; background:' + (s.avatar_bg || 'var(--primary)') + '; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">' + s.avatar_initials + '</div>' +
              '<div>' +
                '<strong style="font-size:13px;">' + s.name + '</strong>' +
                '<div style="font-size:10.5px; color:var(--text-muted);">🔥 ' + s.streak + 'd streak</div>' +
              '</div>' +
            '</div>' +
            '<span style="font-family:var(--font-serif); font-size:14px; font-weight:700;">' + s.points.toLocaleString() + ' pts</span>' +
          '</div>'
        );
      }).join('')
    );
  }

  function renderPointsLedgerTable() {
    var op = getActiveOperator();
    var dispatches = STATE.points_dispatches.filter(function (p) { return p.operator_id === op.id; });
    var tbody = document.getElementById('pointsLedgerTableBody');
    if (!tbody) return;

    if (dispatches.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center p-20 text-muted">No points awarded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = dispatches.map(function (p) {
      return (
        '<tr>' +
          '<td>' + p.date + '</td>' +
          '<td><strong>' + p.student_name + '</strong></td>' +
          '<td>' + p.awarded_by + '</td>' +
          '<td><span class="badge badge-primary">' + p.category + '</span></td>' +
          '<td>' + p.reason + '</td>' +
          '<td><span class="badge badge-success" style="font-size:12px;">+' + p.points + ' pts</span></td>' +
        '</tr>'
      );
    }).join('');
  }

  function dispatchPointsToStudent(batchId, studentId, points, category, reason) {
    var op = getActiveOperator();
    var student = STATE.students.find(function (s) { return s.id === studentId; });
    if (!student) return;

    // Credit points to student profile
    student.points += points;

    // Record into dispatches
    var newDispatch = {
      id: 'disp-' + Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      operator_id: op.id,
      batch_id: batchId,
      awarded_by: op.director_name.split('(')[0].trim(),
      student_id: student.id,
      student_name: student.name,
      points: points,
      category: category,
      reason: reason
    };

    STATE.points_dispatches.unshift(newDispatch);
    saveState();

    // Re-render points view
    renderLiveBatchLeaderboardPreview(batchId);
    renderPointsLedgerTable();
    populateStudentsDropdownForPoints(batchId);

    showToast('Successfully awarded +' + points + ' pts to ' + student.name + '! Standings updated live.', 'success');
  }

  // ─── 6. RENDER: TESTS & MARKS ───────────────────────────────────────────────
  function renderTests() {
    var op = getActiveOperator();
    var opBatches = STATE.batches.filter(function (b) { return b.operator_id === op.id; }).map(function (b) { return b.id; });
    var tests = STATE.tests.filter(function (t) { return opBatches.indexOf(t.batch_id) !== -1; });
    var container = document.getElementById('testsGridContainer');
    if (!container) return;

    if (tests.length === 0) {
      container.innerHTML = '<div class="p-24 text-center text-muted" style="grid-column:1/-1;">No tests conducted yet for this operator.</div>';
      return;
    }

    container.innerHTML = tests.map(function (t) {
      var batch = STATE.batches.find(function (b) { return b.id === t.batch_id; });
      return (
        '<div class="batch-card">' +
          '<div class="batch-card-top">' +
            '<div>' +
              '<h3 class="batch-title">' + t.title + '</h3>' +
              '<div class="text-xs text-muted">Subject: <strong>' + t.subject + '</strong> &bull; By: ' + t.conducted_by + '</div>' +
            '</div>' +
            '<span class="badge badge-primary">' + t.conducted_date + '</span>' +
          '</div>' +
          '<div style="margin:12px 0; display:flex; justify-content:space-between; font-size:12px; background:var(--surface-muted); padding:10px; border-radius:var(--radius-md);">' +
            '<div>Max Marks: <strong>' + t.max_marks + '</strong></div>' +
            '<div>Class Avg: <strong>' + t.class_average + '</strong></div>' +
            '<div>Highest: <strong>' + t.highest_score + '</strong></div>' +
          '</div>' +
          '<div style="font-size:12px; font-weight:700; margin-bottom:6px;">Top Student Scorers:</div>' +
          '<div style="display:flex; flex-direction:column; gap:4px;">' +
            (t.scores || []).map(function (s) {
              return '<div style="display:flex; justify-content:space-between; font-size:12px;"><span>#' + s.rank + ' ' + s.name + '</span><strong>' + s.marks + ' / ' + t.max_marks + '</strong></div>';
            }).join('') +
          '</div>' +
          '<div style="margin-top:14px; display:flex; gap:8px;">' +
            '<button type="button" class="btn btn-primary btn-sm btn-publish-pts" data-test-id="' + t.id + '" style="flex:1;">+ Credit Test Points</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    document.querySelectorAll('.btn-publish-pts').forEach(function (btn) {
      btn.onclick = function () {
        showToast('Credited +30 practice test points to all students with score >80%!', 'success');
      };
    });
  }

  // ─── 7. RENDER: FEES & INVOICES ─────────────────────────────────────────────
  function renderFees() {
    var op = getActiveOperator();
    var filterSelect = document.getElementById('feeStatusFilter');
    var filterStatus = filterSelect ? filterSelect.value : 'all';

    var invoices = STATE.invoices.filter(function (inv) {
      var matchOp = inv.operator_id === op.id;
      var matchStatus = filterStatus === 'all' || inv.status === filterStatus;
      return matchOp && matchStatus;
    });

    var tbody = document.getElementById('feesTableBody');
    if (!tbody) return;

    if (invoices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center p-20 text-muted">No fee records found for this filter.</td></tr>';
      return;
    }

    tbody.innerHTML = invoices.map(function (inv) {
      var badgeClass = inv.status === 'paid' ? 'badge-success' : (inv.status === 'pending' ? 'badge-warning' : 'badge-danger');
      return (
        '<tr>' +
          '<td><span class="font-mono text-xs font-bold">' + inv.invoice_no + '</span></td>' +
          '<td><strong>' + inv.student_name + '</strong></td>' +
          '<td>' + inv.parent_phone + '</td>' +
          '<td>' + inv.month + '</td>' +
          '<td><strong>₹' + inv.amount.toLocaleString() + '</strong></td>' +
          '<td><span class="badge ' + badgeClass + '">' + inv.status.toUpperCase() + '</span></td>' +
          '<td>' + (inv.payment_mode || '—') + '</td>' +
          '<td>' +
            (inv.status === 'paid' 
              ? '<button type="button" class="btn btn-outline btn-sm btn-print-receipt" data-inv-id="' + inv.id + '">🧾 Receipt</button>' 
              : '<button type="button" class="btn btn-primary btn-sm btn-settle-fee" data-inv-id="' + inv.id + '">Record Paid</button>') +
          '</td>' +
        '</tr>'
      );
    }).join('');

    if (filterSelect) {
      filterSelect.onchange = function () { renderFees(); };
    }

    document.querySelectorAll('.btn-settle-fee').forEach(function (btn) {
      btn.onclick = function () {
        var invId = this.getAttribute('data-inv-id');
        var inv = STATE.invoices.find(function (i) { return i.id === invId; });
        if (inv) {
          inv.status = 'paid';
          inv.payment_mode = 'Cash / Offline Desk';
          inv.paid_date = new Date().toISOString().slice(0, 10);
          inv.receipt_ref = 'REC-' + Date.now().toString().slice(-6);
          saveState();
          renderFees();
          showToast('Payment recorded for ' + inv.student_name + ' (Receipt #' + inv.receipt_ref + ')', 'success');
        }
      };
    });

    document.querySelectorAll('.btn-print-receipt').forEach(function (btn) {
      btn.onclick = function () {
        var invId = this.getAttribute('data-inv-id');
        openReceiptModal(invId);
      };
    });
  }

  function openReceiptModal(invId) {
    var inv = STATE.invoices.find(function (i) { return i.id === invId; });
    var op = getActiveOperator();
    if (!inv || !op) return;

    var area = document.getElementById('receiptPrintArea');
    if (area) {
      area.innerHTML = (
        '<div style="text-align:center; border-bottom:2px solid var(--primary); padding-bottom:14px; margin-bottom:16px;">' +
          '<h2 style="font-family:var(--font-serif); font-size:22px; color:var(--primary);">' + op.name + '</h2>' +
          '<div style="font-size:11px; color:var(--text-muted);">' + op.address + ' &bull; Phone: ' + op.phone + '</div>' +
          '<div style="font-size:12px; font-weight:700; margin-top:4px; text-transform:uppercase;">Official Fee Payment Receipt</div>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:12px;">' +
          '<div><strong>Invoice No:</strong> ' + inv.invoice_no + '<br><strong>Receipt Ref:</strong> ' + (inv.receipt_ref || 'REC-STAMPED') + '</div>' +
          '<div style="text-align:right;"><strong>Date:</strong> ' + (inv.paid_date || 'Today') + '<br><strong>Mode:</strong> ' + (inv.payment_mode || 'Cash/UPI') + '</div>' +
        '</div>' +
        '<div style="background:var(--surface-muted); padding:12px; border-radius:var(--radius-md); font-size:12.5px; margin-bottom:16px;">' +
          '<div>Received from: <strong>' + inv.student_name + '</strong></div>' +
          '<div>Parent Phone: <strong>' + inv.parent_phone + '</strong></div>' +
          '<div>Billing Period: <strong>' + inv.month + '</strong></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; font-size:16px; font-weight:800; border-top:1px dashed var(--border); padding-top:10px;">' +
          '<span>Amount Received:</span>' +
          '<span style="color:var(--success);">₹' + inv.amount.toLocaleString() + '</span>' +
        '</div>' +
        '<div style="margin-top:24px; display:flex; justify-content:space-between; align-items:flex-end;">' +
          '<div style="font-size:10px; color:var(--text-muted); max-width:240px;">* This is a digitally verified receipt issued by ' + op.name + ' via Vilarci Study Partner.</div>' +
          '<div style="text-align:center;">' +
            '<div style="font-size:18px;">✍️</div>' +
            '<div style="font-size:11px; font-weight:700; border-top:1px solid #333; padding-top:2px;">Authorized Signature</div>' +
          '</div>' +
        '</div>'
      );
    }

    var modal = document.getElementById('modalPrintReceipt');
    if (modal) modal.classList.add('active');
  }

  // ─── 8. RENDER: MARKSHEETS STUDIO ───────────────────────────────────────────
  function renderMarksheets() {
    var op = getActiveOperator();
    var docs = STATE.issued_marksheets.filter(function (d) { return d.operator_id === op.id; });
    var tbody = document.getElementById('marksheetsTableBody');
    if (!tbody) return;

    if (docs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center p-20 text-muted">No academic marksheets issued yet for this center.</td></tr>';
      return;
    }

    tbody.innerHTML = docs.map(function (doc) {
      return (
        '<tr>' +
          '<td><span class="font-mono text-xs font-bold">' + doc.ref + '</span></td>' +
          '<td><strong>' + doc.student_name + '</strong></td>' +
          '<td>' + doc.roll + '</td>' +
          '<td>' + doc.exam_term + '</td>' +
          '<td><strong>' + doc.overall_percentage + '%</strong></td>' +
          '<td><span class="badge badge-success">' + doc.grade + '</span></td>' +
          '<td>' + doc.director_signature.split(',')[0] + '</td>' +
          '<td>' +
            '<button type="button" class="btn btn-outline btn-sm btn-view-marksheet" data-doc-id="' + doc.id + '">View &amp; Print</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    document.querySelectorAll('.btn-view-marksheet').forEach(function (btn) {
      btn.onclick = function () {
        var dId = this.getAttribute('data-doc-id');
        var doc = STATE.issued_marksheets.find(function (d) { return d.id === dId; });
        if (doc) {
          alert('Academic Marksheet Ref ' + doc.ref + ' verified for ' + doc.student_name + ' (' + doc.overall_percentage + '% - Grade ' + doc.grade + '). Ready for high-resolution printing.');
        }
      };
    });
  }

  // ─── 9. RENDER: FACULTY ROSTER (COACHING MODE) ──────────────────────────────
  function renderFaculty() {
    var op = getActiveOperator();
    var teachers = STATE.teachers.filter(function (t) { return t.operator_id === op.id; });
    var container = document.getElementById('facultyGridContainer');
    if (!container) return;

    container.innerHTML = teachers.map(function (t) {
      var assignedBatchNames = (t.assigned_batches || []).map(function (bId) {
        var b = STATE.batches.find(function (item) { return item.id === bId; });
        return b ? b.name : bId;
      });

      return (
        '<div class="batch-card">' +
          '<div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">' +
            '<div style="width:42px; height:42px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800;">' + t.photo_initials + '</div>' +
            '<div>' +
              '<h3 style="font-size:16px; font-weight:700;">' + t.name + '</h3>' +
              '<div class="text-xs text-muted">' + t.role + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:12px; margin-bottom:10px;"><strong>Qualification:</strong> ' + t.qualification + '</div>' +
          '<div style="font-size:12px; margin-bottom:10px;"><strong>Subjects:</strong> ' + (t.subjects || []).join(', ') + '</div>' +
          '<div style="font-size:12px; border-top:1px solid var(--border); padding-top:8px;">' +
            '<div style="font-weight:700; margin-bottom:4px; font-size:11px; text-transform:uppercase; color:var(--text-muted);">Assigned Batches:</div>' +
            assignedBatchNames.map(function (bn) { return '<span class="badge badge-muted" style="margin:2px 2px 2px 0;">' + bn + '</span>'; }).join('') +
          '</div>' +
          '<div style="margin-top:12px; font-size:12px; color:var(--text-muted);">' +
            '📞 ' + t.phone + ' &bull; ✉️ ' + t.email +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  // ─── 10. RENDER: ADMISSIONS & CODES ─────────────────────────────────────────
  function renderAdmissions() {
    var op = getActiveOperator();
    var codeBox = document.getElementById('admCodeBox');
    if (codeBox) codeBox.textContent = op.code;

    var nameEl = document.getElementById('admCenterName');
    if (nameEl) nameEl.textContent = op.name + ' Student Enrollment Code';

    var copyBtn = document.getElementById('btnCopyInviteCode');
    if (copyBtn) {
      copyBtn.onclick = function () {
        navigator.clipboard.writeText(op.code);
        showToast('Copied join code ' + op.code + ' to clipboard!', 'success');
      };
    }

    var shareBtn = document.getElementById('btnShareWhatsApp');
    if (shareBtn) {
      shareBtn.onclick = function () {
        var msg = 'Join ' + op.name + ' on Vilarci Study! Use enrollment code: ' + op.code + ' to access timetable, tests, and academic honors.';
        window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
      };
    }
  }

  // ─── 11. RENDER: SETTINGS ───────────────────────────────────────────────────
  function renderSettings() {
    var op = getActiveOperator();
    var nameInput = document.getElementById('setOpName');
    if (nameInput) nameInput.value = op.name;

    var dirInput = document.getElementById('setDirectorName');
    if (dirInput) dirInput.value = op.director_name;

    var phoneInput = document.getElementById('setPhone');
    if (phoneInput) phoneInput.value = op.phone;

    var emailInput = document.getElementById('setEmail');
    if (emailInput) emailInput.value = op.email;

    var upiInput = document.getElementById('setBankUpi');
    if (upiInput) upiInput.value = op.bank_upi || '';

    var addrInput = document.getElementById('setAddress');
    if (addrInput) addrInput.value = op.address;
  }

  // ─── MODALS & FORMS ─────────────────────────────────────────────────────────
  function setupModals() {
    document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.onclick = function () {
        var mId = this.getAttribute('data-close-modal');
        var modal = document.getElementById(mId);
        if (modal) modal.classList.remove('active');
      };
    });

    var createBatchBtn = document.getElementById('btnCreateBatchModal');
    if (createBatchBtn) {
      createBatchBtn.onclick = function () {
        var modal = document.getElementById('modalCreateBatch');
        if (modal) modal.classList.add('active');
      };
    }

    var heroBatchBtn = document.getElementById('btnHeroCreateBatch');
    if (heroBatchBtn) {
      heroBatchBtn.onclick = function () {
        var modal = document.getElementById('modalCreateBatch');
        if (modal) modal.classList.add('active');
      };
    }

    var awardPtsBtn = document.getElementById('btnQuickDispensePoints');
    if (awardPtsBtn) {
      awardPtsBtn.onclick = function () { openAwardPointsModal(currentBatchId); };
    }

    var dashAwardBtn = document.getElementById('btnDashAwardPoints');
    if (dashAwardBtn) {
      dashAwardBtn.onclick = function () { openAwardPointsModal(currentBatchId); };
    }

    var printReceiptTrigger = document.getElementById('btnTriggerReceiptPrint');
    if (printReceiptTrigger) {
      printReceiptTrigger.onclick = function () { window.print(); };
    }

    var projectorBtn = document.getElementById('btnProjectorMode');
    if (projectorBtn) {
      projectorBtn.onclick = function () {
        showToast('Classroom QR code ready for projector display.', 'info');
      };
    }
  }

  function openAwardPointsModal(batchId, studentId) {
    var op = getActiveOperator();
    var opBatches = STATE.batches.filter(function (b) { return b.operator_id === op.id; });
    var modalBatchSelect = document.getElementById('modalAwardBatch');
    var modalStudentSelect = document.getElementById('modalAwardStudent');

    if (modalBatchSelect) {
      modalBatchSelect.innerHTML = opBatches.map(function (b) {
        var isSelected = (b.id === (batchId || currentBatchId)) ? ' selected' : '';
        return '<option value="' + b.id + '"' + isSelected + '>' + b.name + '</option>';
      }).join('');

      var targetBatch = batchId || currentBatchId;
      var batchStudents = STATE.students.filter(function (s) {
        return (s.enrolled_batches || []).indexOf(targetBatch) !== -1;
      });

      if (modalStudentSelect) {
        modalStudentSelect.innerHTML = batchStudents.map(function (s) {
          var isSelected = (s.id === studentId) ? ' selected' : '';
          return '<option value="' + s.id + '"' + isSelected + '>' + s.name + ' (' + s.roll + ')</option>';
        }).join('');
      }

      modalBatchSelect.onchange = function () {
        var newBId = this.value;
        var bStudents = STATE.students.filter(function (s) {
          return (s.enrolled_batches || []).indexOf(newBId) !== -1;
        });
        if (modalStudentSelect) {
          modalStudentSelect.innerHTML = bStudents.map(function (s) {
            return '<option value="' + s.id + '">' + s.name + ' (' + s.roll + ')</option>';
          }).join('');
        }
      };
    }

    var modal = document.getElementById('modalAwardPoints');
    if (modal) modal.classList.add('active');
  }

  function setupForms() {
    var formModalAward = document.getElementById('formModalAwardPoints');
    if (formModalAward) {
      formModalAward.onsubmit = function (e) {
        e.preventDefault();
        var bId = document.getElementById('modalAwardBatch').value;
        var sId = document.getElementById('modalAwardStudent').value;
        var pts = parseInt(document.getElementById('modalAwardPointsInput').value, 10);
        var category = document.getElementById('modalAwardCategorySelect').value;
        var citation = document.getElementById('modalAwardCitation').value;

        dispatchPointsToStudent(bId, sId, pts, category, citation);
        document.getElementById('modalAwardPoints').classList.remove('active');
      };
    }

    var formCreateBatch = document.getElementById('formModalCreateBatch');
    if (formCreateBatch) {
      formCreateBatch.onsubmit = function (e) {
        e.preventDefault();
        var op = getActiveOperator();
        var newBatch = {
          id: 'batch-' + Date.now(),
          operator_id: op.id,
          name: document.getElementById('newBatchName').value,
          grade: document.getElementById('newBatchGrade').value,
          board: document.getElementById('newBatchBoard').value,
          room: 'Lecture Suite',
          schedule: document.getElementById('newBatchSchedule').value,
          monthly_fee: parseInt(document.getElementById('newBatchFee').value, 10),
          capacity: parseInt(document.getElementById('newBatchCapacity').value, 10),
          enrolled_count: 0,
          primary_subject: document.getElementById('newBatchSubject').value,
          assigned_faculty: [
            { teacher_id: op.teachers[0] || 'teach-1', subject: document.getElementById('newBatchSubject').value, lectures_per_week: 3 }
          ],
          attendance_rate: 100,
          average_points: 0
        };

        STATE.batches.push(newBatch);
        saveState();
        document.getElementById('modalCreateBatch').classList.remove('active');
        formCreateBatch.reset();
        renderBatches();
        showToast('Created new batch: ' + newBatch.name, 'success');
      };
    }
  }

  function setupThemeToggle() {
    var btn = document.getElementById('btnThemeToggle');
    if (btn) {
      btn.onclick = function () {
        var currentTheme = document.documentElement.getAttribute('data-theme');
        var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('vilarci_partner_theme', newTheme);
      };
    }

    var savedTheme = localStorage.getItem('vilarci_partner_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // ─── TOAST NOTIFICATIONS ──────────────────────────────────────────────────
  function showToast(message, type) {
    var toast = document.createElement('div');
    toast.className = 'partner-toast';
    toast.style.cssText = 'position:fixed; bottom:24px; right:24px; background:#0f172a; color:#fff; padding:12px 20px; border-radius:10px; font-size:13px; font-weight:600; box-shadow:0 10px 30px rgba(0,0,0,0.25); z-index:9999; display:flex; align-items:center; gap:8px; border-left:4px solid ' + (type === 'success' ? '#059669' : '#800020') + ';';
    toast.innerHTML = (type === 'success' ? '✓ ' : 'ℹ️ ') + message;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 300ms';
      setTimeout(function () { toast.remove(); }, 300);
    }, 3200);
  }

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', init);

})();
