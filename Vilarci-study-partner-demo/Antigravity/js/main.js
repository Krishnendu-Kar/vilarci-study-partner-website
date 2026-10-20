// js/main.js — Vilarci Study Partner (Teacher-First Architecture)
// Complete controller implementing:
// 1. Logged-in Teacher Profile Management & Switching
// 2. Private Batches (Multiple classes, multiple batches per class, rename, student management)
// 3. Coaching Institutes (Owned with Members/Faculty Management, or Joined as Faculty)
// 4. Coaching Classes with Sections (e.g. Class 10-A, Class 10-B, Class 9-A) with subject-wise teachers
// 5. Unified Batch Command Deck: Students Roster, QR Attendance, Points Dispenser Desk, Tests, Syllabus, Fees

(function () {
  'use strict';

  // ─── STATE STORAGE ─────────────────────────────────────────────────────────
  var STATE = {};
  var activeTeacherId = 'teacher-alok';
  var currentWorkspace = 'private_batches'; // 'private_batches', 'coaching_institutes'
  var activeCoachingId = 'inst-stellar';
  
  // Context when inside a specific batch/section
  var activeDeckContext = null; // { type: 'private_batch'|'coaching_section', id: '...', parentCoachingId: '...' }

  // ─── INITIALIZATION ────────────────────────────────────────────────────────
  function init() {
    loadState();
    setupTopNavbar();
    setupWorkspaceTabs();
    setupClassFilterChips();
    setupModals();
    setupThemeToggle();
    setupFormHandlers();

    // Render initial view
    renderCurrentWorkspace();
  }

  function loadState() {
    var stored = localStorage.getItem('vilarci_teacher_state_v2');
    if (stored) {
      try {
        STATE = JSON.parse(stored);
      } catch (e) {
        STATE = JSON.parse(JSON.stringify(window.TEACHER_PORTAL_DATA));
      }
    } else {
      STATE = JSON.parse(JSON.stringify(window.TEACHER_PORTAL_DATA));
    }
    activeTeacherId = STATE.logged_in_teacher_id || 'teacher-alok';
  }

  function saveState() {
    STATE.logged_in_teacher_id = activeTeacherId;
    localStorage.setItem('vilarci_teacher_state_v2', JSON.stringify(STATE));
  }

  function getActiveTeacher() {
    return (STATE.teachers || []).find(function (t) { return t.id === activeTeacherId; }) || STATE.teachers[0];
  }

  // ─── TOP NAVBAR & TEACHER CONTEXT ──────────────────────────────────────────
  function setupTopNavbar() {
    updateTeacherNavProfile();

    var profileChip = document.getElementById('btnSwitchTeacherProfile');
    if (profileChip) {
      profileChip.onclick = function () {
        openSwitchTeacherModal();
      };
    }
  }

  function updateTeacherNavProfile() {
    var t = getActiveTeacher();
    var avatarEl = document.getElementById('navTeacherAvatar');
    if (avatarEl) {
      avatarEl.textContent = t.photo_initials;
      avatarEl.style.backgroundColor = t.avatar_bg || '#800020';
    }

    var nameEl = document.getElementById('navTeacherName');
    if (nameEl) nameEl.textContent = t.name;

    var subjEl = document.getElementById('navTeacherSubject');
    if (subjEl) subjEl.textContent = t.primary_subject + ' Specialist ▾';

    // Update workspace counters
    var myBatches = (STATE.private_batches || []).filter(function (b) { return b.teacher_id === activeTeacherId; });
    var counterPB = document.getElementById('counterPrivateBatches');
    if (counterPB) counterPB.textContent = myBatches.length;

    var myInstitutes = (STATE.coaching_institutes || []).filter(function (inst) {
      var isOwner = inst.owner_teacher_id === activeTeacherId;
      var isMember = (inst.members || []).some(function (m) { return m.teacher_id === activeTeacherId; });
      return isOwner || isMember;
    });
    var counterCI = document.getElementById('counterCoachingInstitutes');
    if (counterCI) counterCI.textContent = myInstitutes.length;
  }

  function openSwitchTeacherModal() {
    var container = document.getElementById('switchTeacherProfilesList');
    if (!container) return;

    container.innerHTML = (STATE.teachers || []).map(function (t) {
      var isActive = t.id === activeTeacherId;
      return (
        '<div class="inst-role-banner" style="cursor:pointer; ' + (isActive ? 'border-color:var(--primary); background:var(--primary-light);' : '') + '" data-switch-teacher-id="' + t.id + '">' +
          '<div style="display:flex; align-items:center; gap:10px;">' +
            '<div style="width:32px; height:32px; border-radius:50%; background:' + (t.avatar_bg || 'var(--primary)') + '; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px;">' + t.photo_initials + '</div>' +
            '<div>' +
              '<div style="font-size:13.5px; font-weight:700;">' + t.name + '</div>' +
              '<div class="text-xs text-muted">' + t.primary_subject + ' &bull; ' + t.qualification + '</div>' +
            '</div>' +
          '</div>' +
          (isActive ? '<span class="badge badge-primary">Active</span>' : '<button type="button" class="btn btn-outline btn-sm">Switch ➜</button>') +
        '</div>'
      );
    }).join('');

    container.querySelectorAll('[data-switch-teacher-id]').forEach(function (el) {
      el.onclick = function () {
        var tId = this.getAttribute('data-switch-teacher-id');
        activeTeacherId = tId;
        saveState();
        updateTeacherNavProfile();
        closeModal('modalSwitchTeacher');
        // Reset view to private batches of this teacher
        currentWorkspace = 'private_batches';
        activeDeckContext = null;
        renderCurrentWorkspace();
        showToast('Switched account to: ' + getActiveTeacher().name, 'info');
      };
    });

    openModal('modalSwitchTeacher');
  }

  // ─── PRIMARY WORKSPACE SWITCHER ────────────────────────────────────────────
  function setupWorkspaceTabs() {
    var pbBtn = document.getElementById('wsBtnPrivateBatches');
    var ciBtn = document.getElementById('wsBtnCoachingInstitutes');

    if (pbBtn) {
      pbBtn.onclick = function () {
        currentWorkspace = 'private_batches';
        activeDeckContext = null;
        renderCurrentWorkspace();
      };
    }

    if (ciBtn) {
      ciBtn.onclick = function () {
        currentWorkspace = 'coaching_institutes';
        activeDeckContext = null;
        renderCurrentWorkspace();
      };
    }
  }

  function renderCurrentWorkspace() {
    // Sync tab button states
    var pbBtn = document.getElementById('wsBtnPrivateBatches');
    var ciBtn = document.getElementById('wsBtnCoachingInstitutes');
    if (pbBtn) pbBtn.classList.toggle('active', currentWorkspace === 'private_batches' && !activeDeckContext);
    if (ciBtn) ciBtn.classList.toggle('active', currentWorkspace === 'coaching_institutes' && !activeDeckContext);

    // Hide all main views first
    document.querySelectorAll('.main-view').forEach(function (v) { v.style.display = 'none'; });

    if (activeDeckContext) {
      // We are inside a specific batch/section deck!
      var deckView = document.getElementById('view-batch-deck');
      if (deckView) deckView.style.display = 'block';
      renderBatchDeck();
      return;
    }

    if (currentWorkspace === 'private_batches') {
      var pbView = document.getElementById('view-private-batches');
      if (pbView) pbView.style.display = 'block';
      updateBreadcrumb(['Workspace', 'My Private Batches']);
      renderPrivateBatches('all');
    } else if (currentWorkspace === 'coaching_institutes') {
      var ciView = document.getElementById('view-coaching-list');
      if (ciView) ciView.style.display = 'block';
      updateBreadcrumb(['Workspace', 'Coaching Institutes']);
      renderCoachingInstitutesList();
    }
  }

  function updateBreadcrumb(crumbs, actionBtnHtml) {
    var displayEl = document.getElementById('breadcrumbPathDisplay');
    if (!displayEl) return;

    displayEl.innerHTML = crumbs.map(function (c, idx) {
      var isLast = idx === crumbs.length - 1;
      if (isLast) {
        return '<span class="breadcrumb-current">' + c + '</span>';
      }
      return '<span>' + c + '</span><span class="breadcrumb-sep">&gt;</span>';
    }).join('');

    var actionArea = document.getElementById('breadcrumbActionArea');
    if (actionArea) {
      actionArea.innerHTML = actionBtnHtml || '';
    }
  }

  // ─── WORKSPACE 1: MY PRIVATE BATCHES ───────────────────────────────────────
  function setupClassFilterChips() {
    var chips = document.querySelectorAll('#classFilterChipsRow .chip-btn');
    chips.forEach(function (chip) {
      chip.onclick = function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        this.classList.add('active');
        var filter = this.getAttribute('data-class-filter');
        renderPrivateBatches(filter);
      };
    });
  }

  function renderPrivateBatches(classFilter) {
    var container = document.getElementById('privateBatchesGrid');
    if (!container) return;

    var teacherBatches = (STATE.private_batches || []).filter(function (b) {
      var matchTeacher = b.teacher_id === activeTeacherId;
      var matchClass = classFilter === 'all' || b.grade === classFilter;
      return matchTeacher && matchClass;
    });

    if (teacherBatches.length === 0) {
      container.innerHTML = (
        '<div class="card" style="grid-column:1/-1; text-align:center; padding:40px 20px;">' +
          '<h3 style="font-size:18px; font-weight:700; margin-bottom:6px;">No private batches found for ' + (classFilter === 'all' ? 'your account' : classFilter) + '</h3>' +
          '<p class="text-xs text-muted" style="margin-bottom:16px;">You can create multiple batches for any class you teach (e.g. morning, evening, or weekend batches).</p>' +
          '<button type="button" class="btn btn-primary" onclick="document.getElementById(\'btnOpenCreatePrivateBatch\').click()">+ Create First Batch</button>' +
        '</div>'
      );
      return;
    }

    container.innerHTML = teacherBatches.map(function (b) {
      var studentCount = (b.student_ids || []).length;
      var capacityPct = Math.round((studentCount / b.capacity) * 100);

      return (
        '<div class="batch-card" data-pbatch-id="' + b.id + '">' +
          '<div class="batch-card-header">' +
            '<div>' +
              '<h3 class="batch-card-title">' + b.name + '</h3>' +
              '<div class="batch-pills-row" style="margin-top:6px;">' +
                '<span class="pill pill-primary">' + b.grade + ' &bull; ' + b.board + '</span>' +
                '<span class="pill pill-muted">' + b.subject + '</span>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="btn btn-outline btn-sm btn-rename-batch" data-rename-pbatch-id="' + b.id + '" title="Rename or edit batch">✏️</button>' +
          '</div>' +
          '<div class="batch-meta-line">⏱️ ' + b.schedule + '</div>' +
          '<div class="batch-meta-line">🏛️ ' + b.room + '</div>' +
          '<div style="margin:12px 0;">' +
            '<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">' +
              '<span>Enrolled Students:</span>' +
              '<strong>' + studentCount + ' of ' + b.capacity + ' seats</strong>' +
            '</div>' +
            '<div style="width:100%; height:6px; background:var(--surface-muted); border-radius:var(--radius-pill); overflow:hidden;">' +
              '<div style="width:' + capacityPct + '%; height:100%; background:var(--primary);"></div>' +
            '</div>' +
          '</div>' +
          '<div class="batch-card-footer">' +
            '<div class="fee-txt">Fee: <strong>₹' + b.monthly_fee.toLocaleString() + '</strong>/mo</div>' +
            '<button type="button" class="btn btn-primary btn-sm btn-enter-pbatch" data-pbatch-id="' + b.id + '">Enter Batch ➜</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    // Attach listeners
    container.querySelectorAll('.btn-enter-pbatch').forEach(function (btn) {
      btn.onclick = function () {
        var bId = this.getAttribute('data-pbatch-id');
        enterBatchDeck('private_batch', bId);
      };
    });

    container.querySelectorAll('.btn-rename-batch').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var bId = this.getAttribute('data-rename-pbatch-id');
        openRenameBatchModal(bId);
      };
    });
  }

  // ─── WORKSPACE 2: COACHING INSTITUTES ──────────────────────────────────────
  function renderCoachingInstitutesList() {
    var container = document.getElementById('coachingInstitutesGrid');
    if (!container) return;

    var institutes = (STATE.coaching_institutes || []).filter(function (inst) {
      var isOwner = inst.owner_teacher_id === activeTeacherId;
      var isMember = (inst.members || []).some(function (m) { return m.teacher_id === activeTeacherId; });
      return isOwner || isMember;
    });

    if (institutes.length === 0) {
      container.innerHTML = (
        '<div class="card" style="grid-column:1/-1; text-align:center; padding:40px 20px;">' +
          '<h3 style="font-size:18px; font-weight:700; margin-bottom:6px;">You are not connected to any coaching institute yet.</h3>' +
          '<p class="text-xs text-muted" style="margin-bottom:16px;">You can create your own coaching institute and invite faculty members, or join an existing coaching with an invite code.</p>' +
          '<div style="display:flex; justify-content:center; gap:10px;">' +
            '<button type="button" class="btn btn-outline" onclick="document.getElementById(\'btnOpenJoinCoaching\').click()">Join via Code</button>' +
            '<button type="button" class="btn btn-primary" onclick="document.getElementById(\'btnOpenCreateCoaching\').click()">+ Create Coaching</button>' +
          '</div>' +
        '</div>'
      );
      return;
    }

    container.innerHTML = institutes.map(function (inst) {
      var isOwner = inst.owner_teacher_id === activeTeacherId;
      var roleBadge = isOwner 
        ? '<span class="badge badge-success">👑 Director &amp; Owner</span>' 
        : '<span class="badge badge-primary">📌 ' + (inst.user_role_in_institute || 'Faculty Member') + '</span>';

      var totalSections = (inst.classes_sections || []).length;
      var totalMembers = (inst.members || []).length;

      return (
        '<div class="institute-card" data-inst-id="' + inst.id + '">' +
          '<div class="inst-card-top">' +
            '<div class="inst-logo-badge" style="background:' + (inst.theme_color || 'var(--primary)') + ';">' + inst.logo_text + '</div>' +
            '<div class="inst-meta">' +
              '<h3 class="inst-name">' + inst.name + '</h3>' +
              '<div class="inst-tagline">' + inst.tagline + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="inst-role-banner">' +
            '<div>Your Role: ' + roleBadge + '</div>' +
            '<div class="text-xs font-mono font-bold">Code: ' + inst.code + '</div>' +
          '</div>' +
          '<div class="inst-stats-grid">' +
            '<div class="inst-stat-box">' +
              '<span class="inst-stat-val">' + totalSections + '</span>' +
              '<span class="inst-stat-lbl">Class Sections</span>' +
            '</div>' +
            '<div class="inst-stat-box">' +
              '<span class="inst-stat-val">' + totalMembers + '</span>' +
              '<span class="inst-stat-lbl">Teachers / Members</span>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">📍 ' + inst.address + '</div>' +
          '<div style="display:flex; gap:8px; margin-top:auto;">' +
            '<button type="button" class="btn btn-primary btn-sm btn-enter-coaching" data-inst-id="' + inst.id + '" style="flex:1;">Enter Coaching ➜</button>' +
            (isOwner ? '<button type="button" class="btn btn-outline btn-sm btn-manage-members" data-inst-id="' + inst.id + '">👥 Members</button>' : '') +
          '</div>' +
        '</div>'
      );
    }).join('');

    container.querySelectorAll('.btn-enter-coaching').forEach(function (btn) {
      btn.onclick = function () {
        var instId = this.getAttribute('data-inst-id');
        openCoachingDetail(instId, 'my_sections');
      };
    });

    container.querySelectorAll('.btn-manage-members').forEach(function (btn) {
      btn.onclick = function () {
        var instId = this.getAttribute('data-inst-id');
        openCoachingDetail(instId, 'members');
      };
    });
  }

  // ─── WORKSPACE 3: INSIDE A SPECIFIC COACHING INSTITUTE ──────────────────────
  function openCoachingDetail(instId, initialSubTab) {
    activeCoachingId = instId;
    var inst = (STATE.coaching_institutes || []).find(function (i) { return i.id === instId; });
    if (!inst) return;

    // Hide coaching list, show coaching detail
    document.getElementById('view-coaching-list').style.display = 'none';
    var detailView = document.getElementById('view-coaching-detail');
    if (detailView) detailView.style.display = 'block';

    // Update banner
    var isOwner = inst.owner_teacher_id === activeTeacherId;
    var rolePill = document.getElementById('coachingRolePill');
    if (rolePill) rolePill.textContent = isOwner ? 'Director & Owner (Full Admin)' : inst.user_role_in_institute;

    var codePill = document.getElementById('coachingCodePill');
    if (codePill) codePill.innerHTML = 'Student Join Code: <strong>' + inst.code + '</strong>';

    var titleEl = document.getElementById('coachingDetailTitle');
    if (titleEl) titleEl.textContent = inst.name;

    var metaEl = document.getElementById('coachingDetailMeta');
    if (metaEl) metaEl.textContent = inst.tagline + ' &bull; ' + inst.address;

    // Hide/show tabs based on permissions
    var tabMembers = document.getElementById('tabMembersManagement');
    var tabAllSec = document.getElementById('tabAllSections');
    if (tabMembers) tabMembers.style.display = isOwner ? 'inline-flex' : 'none';
    if (tabAllSec) tabAllSec.style.display = isOwner ? 'inline-flex' : 'none';

    updateBreadcrumb(['Workspace', 'Coaching Institutes', inst.name]);

    // Setup sub-navigation tabs
    setupCoachingSubNavTabs(initialSubTab || 'my_sections');

    var backBtn = document.getElementById('btnBackToCoachingList');
    if (backBtn) {
      backBtn.onclick = function () {
        detailView.style.display = 'none';
        renderCurrentWorkspace();
      };
    }
  }

  function setupCoachingSubNavTabs(activeTab) {
    var tabs = document.querySelectorAll('#coachingSubNavTabs .deck-tab-btn');
    tabs.forEach(function (tab) {
      tab.onclick = function () {
        var tabId = this.getAttribute('data-coaching-tab');
        switchCoachingSubTab(tabId);
      };
    });
    switchCoachingSubTab(activeTab || 'my_sections');
  }

  function switchCoachingSubTab(tabId) {
    var tabs = document.querySelectorAll('#coachingSubNavTabs .deck-tab-btn');
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-coaching-tab') === tabId);
    });

    document.querySelectorAll('.csub-view').forEach(function (view) {
      view.style.display = 'none';
    });

    var targetView = document.getElementById('csub-' + tabId);
    if (targetView) targetView.style.display = 'block';

    var inst = (STATE.coaching_institutes || []).find(function (i) { return i.id === activeCoachingId; });
    if (!inst) return;

    if (tabId === 'my_sections') {
      renderMyAssignedSections(inst);
    } else if (tabId === 'all_sections') {
      renderAllInstituteSections(inst);
    } else if (tabId === 'members') {
      renderCoachingMembers(inst);
    }
  }

  function renderMyAssignedSections(inst) {
    var container = document.getElementById('mySectionsGrid');
    if (!container) return;

    // Find sections where active teacher teaches
    var mySections = (inst.classes_sections || []).filter(function (sec) {
      return (sec.subject_faculty_map || []).some(function (map) { return map.teacher_id === activeTeacherId; });
    });

    if (mySections.length === 0) {
      container.innerHTML = '<div class="card p-24 text-center text-muted" style="grid-column:1/-1;">You are not assigned to any teaching sections in this coaching institute yet.</div>';
      return;
    }

    container.innerHTML = mySections.map(function (sec) {
      var mySubjects = (sec.subject_faculty_map || []).filter(function (m) { return m.teacher_id === activeTeacherId; })
        .map(function (m) { return '<strong>' + m.subject + '</strong> (' + m.lectures_per_week + ' lecs/wk &bull; ' + m.schedule + ')'; }).join('<br>');

      return (
        '<div class="section-box-card">' +
          '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">' +
            '<div>' +
              '<h3 style="font-size:18px; font-weight:800; color:var(--text-main);">' + sec.full_code + '</h3>' +
              '<span class="pill pill-primary" style="margin-top:2px;">' + sec.board + '</span>' +
            '</div>' +
            '<span class="pill pill-muted">🏛️ ' + sec.room + '</span>' +
          '</div>' +
          '<div style="font-size:12px; margin:10px 0; background:var(--surface-muted); padding:10px; border-radius:var(--radius-md);">' +
            '<div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--text-muted); margin-bottom:4px;">Your Assigned Subject(s):</div>' +
            mySubjects +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:14px;">' +
            '<span>Enrolled: <strong>' + (sec.student_ids || []).length + ' of ' + sec.capacity + ' students</strong></span>' +
          '</div>' +
          '<button type="button" class="btn btn-primary btn-sm btn-enter-section" data-sec-id="' + sec.id + '" style="width:100%;">Enter Section &amp; Manage Students ➜</button>' +
        '</div>'
      );
    }).join('');

    container.querySelectorAll('.btn-enter-section').forEach(function (btn) {
      btn.onclick = function () {
        var secId = this.getAttribute('data-sec-id');
        enterBatchDeck('coaching_section', secId, activeCoachingId);
      };
    });
  }

  function renderAllInstituteSections(inst) {
    var container = document.getElementById('allSectionsGrid');
    if (!container) return;

    container.innerHTML = (inst.classes_sections || []).map(function (sec) {
      var facultyList = (sec.subject_faculty_map || []).map(function (m) {
        var t = (STATE.teachers || []).find(function (tc) { return tc.id === m.teacher_id; });
        return (
          '<div class="sec-faculty-row">' +
            '<span class="sec-faculty-subj">' + m.subject + '</span>' +
            '<span class="sec-faculty-name">' + (t ? t.name : 'Faculty') + '</span>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="section-box-card">' +
          '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">' +
            '<div>' +
              '<h3 style="font-size:18px; font-weight:800;">' + sec.full_code + '</h3>' +
              '<span class="pill pill-primary">' + sec.board + '</span>' +
            '</div>' +
            '<span class="pill pill-muted">🏛️ ' + sec.room + '</span>' +
          '</div>' +
          '<div class="sec-faculty-list">' +
            '<div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--text-muted); margin-bottom:4px;">Subject-wise Teachers:</div>' +
            facultyList +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:14px;">' +
            '<span>Enrolled: <strong>' + (sec.student_ids || []).length + ' of ' + sec.capacity + ' students</strong></span>' +
          '</div>' +
          '<button type="button" class="btn btn-outline btn-sm btn-enter-section" data-sec-id="' + sec.id + '" style="width:100%;">View Section Details ➜</button>' +
        '</div>'
      );
    }).join('');

    container.querySelectorAll('.btn-enter-section').forEach(function (btn) {
      btn.onclick = function () {
        var secId = this.getAttribute('data-sec-id');
        enterBatchDeck('coaching_section', secId, activeCoachingId);
      };
    });
  }

  function renderCoachingMembers(inst) {
    var tbody = document.getElementById('coachingMembersTableBody');
    if (!tbody) return;

    var members = inst.members || [];
    tbody.innerHTML = members.map(function (m) {
      var teacher = (STATE.teachers || []).find(function (t) { return t.id === m.teacher_id; }) || {
        name: 'Faculty Member',
        photo_initials: 'FM',
        phone: '—',
        email: '—'
      };

      var isOwner = m.teacher_id === inst.owner_teacher_id;

      return (
        '<tr>' +
          '<td>' +
            '<div style="display:flex; align-items:center; gap:10px;">' +
              '<div style="width:32px; height:32px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11.5px;">' + teacher.photo_initials + '</div>' +
              '<div>' +
                '<strong>' + teacher.name + '</strong>' +
                '<div style="font-size:11px; color:var(--text-muted);">' + teacher.email + ' &bull; ' + teacher.phone + '</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td>' +
            '<div style="font-weight:700;">' + m.role + '</div>' +
            '<div style="font-size:11px; color:var(--text-muted);">' + m.permission_level + '</div>' +
          '</td>' +
          '<td>' + (m.assigned_subjects || []).map(function (s) { return '<span class="pill pill-primary" style="margin:2px 2px 2px 0;">' + s + '</span>'; }).join('') + '</td>' +
          '<td>' + (m.assigned_sections || []).map(function (sec) { return '<span class="pill pill-muted" style="margin:2px 2px 2px 0;">' + sec + '</span>'; }).join('') + '</td>' +
          '<td>' + m.joined_date + '</td>' +
          '<td>' +
            (isOwner 
              ? '<span class="badge badge-success">Founder / Owner</span>' 
              : '<button type="button" class="btn btn-outline btn-sm btn-delete-member" data-teacher-id="' + m.teacher_id + '" style="color:var(--danger); border-color:var(--danger);">Delete 🗑️</button>') +
          '</td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('.btn-delete-member').forEach(function (btn) {
      btn.onclick = function () {
        var tId = this.getAttribute('data-teacher-id');
        deleteCoachingMember(inst.id, tId);
      };
    });
  }

  function deleteCoachingMember(instId, teacherId) {
    var inst = (STATE.coaching_institutes || []).find(function (i) { return i.id === instId; });
    if (!inst) return;

    if (confirm('Are you sure you want to remove this teacher from ' + inst.name + '?')) {
      inst.members = (inst.members || []).filter(function (m) { return m.teacher_id !== teacherId; });
      saveState();
      renderCoachingMembers(inst);
      showToast('Teacher successfully removed from institute.', 'info');
    }
  }

  // ─── WORKSPACE 4: UNIFIED BATCH & SECTION COMMAND DECK ─────────────────────
  // When a teacher clicks ANY batch (private batch OR coaching section), they enter this deck!
  // The layout transforms the top navigation bar into a focused Left Sidebar!
  var activeTestId = null;
  var selectedFeeMonth = '2026-10';

  function enterBatchDeck(type, id, parentCoachingId) {
    activeDeckContext = {
      type: type, // 'private_batch' or 'coaching_section'
      id: id,
      parentCoachingId: parentCoachingId
    };

    document.body.classList.add('in-batch-deck');
    renderCurrentWorkspace();
  }

  function exitBatchDeck() {
    document.body.classList.remove('in-batch-deck');
    var sidebar = document.getElementById('deckSidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
    var backdrop = document.getElementById('deckSidebarBackdrop');
    if (backdrop) backdrop.classList.remove('active');

    activeDeckContext = null;
    renderCurrentWorkspace();
  }

  function getActiveDeckData() {
    if (!activeDeckContext) return null;

    if (activeDeckContext.type === 'private_batch') {
      var pbatch = (STATE.private_batches || []).find(function (b) { return b.id === activeDeckContext.id; });
      if (!pbatch) return null;

      // Ensure default weekly schedule exists in requested schema
      if (!pbatch.weekly_schedule) {
        pbatch.weekly_schedule = {
          "fri": "07:30 AM - 09:00 AM",
          "mon": "07:30 AM - 09:00 AM",
          "sat": "Closed",
          "sun": "Closed",
          "thu": "Closed",
          "tue": "Closed",
          "wed": "07:30 AM - 09:00 AM"
        };
      }

      return {
        isPrivate: true,
        title: pbatch.name,
        badgeText: 'Private Tuition Batch',
        gradeText: pbatch.grade + ' • ' + pbatch.board,
        metaText: pbatch.schedule + ' • Room: ' + pbatch.room,
        studentIds: pbatch.student_ids || [],
        fee: pbatch.monthly_fee,
        rawObj: pbatch
      };
    } else {
      var inst = (STATE.coaching_institutes || []).find(function (i) { return i.id === activeDeckContext.parentCoachingId; });
      if (!inst) return null;
      var sec = (inst.classes_sections || []).find(function (s) { return s.id === activeDeckContext.id; });
      if (!sec) return null;

      if (!sec.weekly_schedule) {
        sec.weekly_schedule = {
          "fri": "09:00 AM - 05:00 PM",
          "mon": "09:00 AM - 05:00 PM",
          "sat": "09:00 AM - 02:00 PM",
          "sun": "Closed",
          "thu": "09:00 AM - 05:00 PM",
          "tue": "09:00 AM - 05:00 PM",
          "wed": "09:00 AM - 05:00 PM"
        };
      }

      return {
        isPrivate: false,
        title: inst.name + ' • ' + sec.full_code,
        badgeText: 'Coaching Section',
        gradeText: sec.class_name + ' • ' + sec.board,
        metaText: 'Room: ' + sec.room + ' • Institute: ' + inst.name,
        studentIds: sec.student_ids || [],
        fee: 2500,
        rawObj: sec
      };
    }
  }

  function renderBatchDeck() {
    var deckData = getActiveDeckData();
    if (!deckData) return;

    // Ensure body has in-batch-deck class
    document.body.classList.add('in-batch-deck');

    // Populate Sidebar Batch Metadata
    var titleEl = document.getElementById('deckTitleDisplay');
    if (titleEl) titleEl.textContent = deckData.title;

    var badgeEl = document.getElementById('deckContextBadge');
    if (badgeEl) badgeEl.textContent = deckData.badgeText;

    var gradeEl = document.getElementById('deckGradeBadge');
    if (gradeEl) gradeEl.textContent = deckData.gradeText;

    var metaEl = document.getElementById('deckMetaDisplay');
    if (metaEl) metaEl.textContent = deckData.metaText;

    var roomEl = document.getElementById('deckRoomDisplay');
    if (roomEl) roomEl.textContent = '📍 Room: ' + (deckData.rawObj.room || 'Studio A');

    var countEl = document.getElementById('deckStudentCountPill');
    if (countEl) countEl.textContent = deckData.studentIds.length;

    var testCountEl = document.getElementById('sidebarTestCountPill');
    if (testCountEl) {
      var bTests = (STATE.tests || []).filter(function (t) { return t.context_id === activeDeckContext.id; });
      testCountEl.textContent = bTests.length;
    }

    // Populate Sidebar Educator Profile
    var teacher = getActiveTeacher();
    var sbAvatar = document.getElementById('sidebarTeacherAvatar');
    if (sbAvatar) {
      sbAvatar.textContent = teacher.photo_initials;
      sbAvatar.style.backgroundColor = teacher.avatar_bg || 'var(--primary)';
    }
    var sbName = document.getElementById('sidebarTeacherName');
    if (sbName) sbName.textContent = teacher.name;
    var sbSubj = document.getElementById('sidebarTeacherSubject');
    if (sbSubj) sbSubj.textContent = teacher.primary_subject + ' Specialist';

    // Populate Mobile Top Header
    var mobTitle = document.getElementById('deckMobileTitleText');
    if (mobTitle) mobTitle.textContent = deckData.title;

    // Wire Exit Buttons
    var exitBtn = document.getElementById('btnExitBatchDeck');
    if (exitBtn) exitBtn.onclick = exitBatchDeck;

    var mobExitBtn = document.getElementById('btnDeckMobileExitBtn');
    if (mobExitBtn) mobExitBtn.onclick = exitBatchDeck;

    // Wire Mobile Drawer
    var mobToggle = document.getElementById('btnDeckMobileToggleSidebar');
    var sidebar = document.getElementById('deckSidebar');
    var backdrop = document.getElementById('deckSidebarBackdrop');
    var closeMob = document.getElementById('btnDeckCloseSidebarMobile');

    if (mobToggle && sidebar && backdrop) {
      mobToggle.onclick = function () {
        sidebar.classList.add('mobile-open');
        backdrop.classList.add('active');
      };
    }
    if (closeMob && sidebar && backdrop) {
      closeMob.onclick = function () {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      };
    }
    if (backdrop && sidebar) {
      backdrop.onclick = function () {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      };
    }

    // Setup sub tabs
    setupDeckSubTabs('students');
  }

  function setupDeckSubTabs(initialTab) {
    var navItems = document.querySelectorAll('#batchDeckNavTabs .deck-nav-item');
    navItems.forEach(function (btn) {
      btn.onclick = function () {
        var tabId = this.getAttribute('data-deck-tab');
        
        // Close mobile drawer on item tap
        var sidebar = document.getElementById('deckSidebar');
        var backdrop = document.getElementById('deckSidebarBackdrop');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (backdrop) backdrop.classList.remove('active');

        switchDeckSubTab(tabId);
      };
    });
    switchDeckSubTab(initialTab || 'students');
  }

  function switchDeckSubTab(tabId) {
    var navItems = document.querySelectorAll('#batchDeckNavTabs .deck-nav-item');
    navItems.forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-deck-tab') === tabId);
    });

    document.querySelectorAll('.dsub-view').forEach(function (view) {
      view.style.display = 'none';
    });

    var targetView = document.getElementById('dsub-' + tabId);
    if (targetView) targetView.style.display = 'block';

    var deckData = getActiveDeckData();
    if (!deckData) return;

    if (tabId === 'students') {
      renderDeckStudentsRoster(deckData);
    } else if (tabId === 'attendance') {
      renderDeckAttendance(deckData);
    } else if (tabId === 'points') {
      renderDeckPoints(deckData);
    } else if (tabId === 'tests') {
      renderDeckTests(deckData);
    } else if (tabId === 'syllabus') {
      renderDeckSyllabus(deckData);
    } else if (tabId === 'fees') {
      renderDeckFees(deckData);
    } else if (tabId === 'settings') {
      renderDeckSettings(deckData);
    }
  }

  // ─── DECK SUB-TAB 1: STUDENTS ROSTER (With Delete / Left Tuition) ───────────
  function renderDeckStudentsRoster(deckData) {
    var tbody = document.getElementById('deckStudentsTableBody');
    if (!tbody) return;

    var enrolledStudents = (STATE.students || []).filter(function (s) {
      return deckData.studentIds.indexOf(s.id) !== -1;
    });

    if (enrolledStudents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center p-20 text-muted">No students currently enrolled in this batch. Click "+ Add Student to Batch" above.</td></tr>';
      return;
    }

    tbody.innerHTML = enrolledStudents.map(function (s) {
      var feeBadge = s.fee_status === 'paid' 
        ? '<span class="badge badge-success">PAID</span>' 
        : (s.fee_status === 'pending' ? '<span class="badge badge-warning">PENDING</span>' : '<span class="badge badge-danger">OVERDUE</span>');

      return (
        '<tr>' +
          '<td><span class="font-mono text-xs font-bold">' + s.roll + '</span></td>' +
          '<td>' +
            '<div style="display:flex; align-items:center; gap:8px;">' +
              '<div style="width:30px; height:30px; border-radius:50%; background:' + (s.avatar_bg || 'var(--primary)') + '; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11px;">' + s.avatar_initials + '</div>' +
              '<div>' +
                '<strong>' + s.name + '</strong>' +
                '<div style="font-size:11px; color:var(--text-muted);">' + s.grade + ' &bull; ' + s.board + '</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td>' +
            '<div style="font-size:12px;">' +
              'Father: ' + s.father_name + ' &bull; <a href="https://wa.me/' + s.father_phone.replace(/[^0-9]/g, '') + '" target="_blank" style="color:var(--primary); font-weight:700;">' + s.father_phone + '</a>' +
              (s.father_phone_verified ? ' <span class="badge badge-success" style="font-size:9.5px; padding:1px 5px;">✓ Verified</span>' : '') +
            '</div>' +
            '<div style="font-size:11px; color:var(--text-muted);">' +
              'Mother: ' + s.mother_name + ' (' + s.mother_phone + ')' +
            '</div>' +
          '</td>' +
          '<td><strong>' + s.points.toLocaleString() + '</strong> pts</td>' +
          '<td>🔥 ' + s.streak + 'd</td>' +
          '<td><strong>' + s.attendance_rate + '%</strong></td>' +
          '<td>' + feeBadge + '</td>' +
          '<td>' +
            '<div style="display:flex; gap:6px; align-items:center;">' +
              '<button type="button" class="btn btn-outline btn-sm btn-deck-award-single" data-student-id="' + s.id + '">🏅 Points</button>' +
              '<button type="button" class="btn btn-outline btn-sm btn-deck-delete-student" data-student-id="' + s.id + '" style="color:var(--danger); border-color:rgba(220,38,38,0.3);" title="Remove student if left tuition">🗑️ Remove</button>' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    // Award Points Button
    tbody.querySelectorAll('.btn-deck-award-single').forEach(function (btn) {
      btn.onclick = function () {
        var sId = this.getAttribute('data-student-id');
        switchDeckSubTab('points');
        var select = document.getElementById('deckAwardStudentSelect');
        if (select) select.value = sId;
      };
    });

    // Delete Student (Left Tuition) Button
    tbody.querySelectorAll('.btn-deck-delete-student').forEach(function (btn) {
      btn.onclick = function () {
        var sId = this.getAttribute('data-student-id');
        var student = (STATE.students || []).find(function (st) { return st.id === sId; });
        var studentName = student ? student.name : 'Student';

        if (confirm('Are you sure you want to remove ' + studentName + ' from ' + deckData.title + '?\n\nThis will unenroll the student if they left tuition.')) {
          if (activeDeckContext.type === 'private_batch') {
            var pbatch = (STATE.private_batches || []).find(function (b) { return b.id === activeDeckContext.id; });
            if (pbatch && pbatch.student_ids) {
              pbatch.student_ids = pbatch.student_ids.filter(function (id) { return id !== sId; });
              pbatch.enrolled_count = pbatch.student_ids.length;
            }
          } else {
            var inst = (STATE.coaching_institutes || []).find(function (i) { return i.id === activeDeckContext.parentCoachingId; });
            if (inst) {
              var sec = (inst.classes_sections || []).find(function (s) { return s.id === activeDeckContext.id; });
              if (sec && sec.student_ids) {
                sec.student_ids = sec.student_ids.filter(function (id) { return id !== sId; });
                sec.enrolled_count = sec.student_ids.length;
              }
            }
          }

          saveState();
          var updatedDeck = getActiveDeckData();
          var countEl = document.getElementById('deckStudentCountPill');
          if (countEl) countEl.textContent = updatedDeck.studentIds.length;
          renderDeckStudentsRoster(updatedDeck);
          showToast('Removed ' + studentName + ' from batch (Left Tuition).', 'info');
        }
      };
    });
  }

  // ─── DECK SUB-TAB 2: DAILY ATTENDANCE & QR TERMINAL ────────────────────────
  function renderDeckAttendance(deckData) {
    var titleEl = document.getElementById('deckQrBatchTitle');
    if (titleEl) titleEl.textContent = deckData.title + ' — Daily Check-in QR';

    var tbody = document.getElementById('deckAttendanceTableBody');
    if (!tbody) return;

    var enrolledStudents = (STATE.students || []).filter(function (s) {
      return deckData.studentIds.indexOf(s.id) !== -1;
    });

    tbody.innerHTML = enrolledStudents.map(function (s, idx) {
      var isPresent = idx % 5 !== 4; // Simulated check-in
      var status = isPresent ? 'present' : 'absent';

      return (
        '<tr>' +
          '<td><span class="font-mono text-xs font-bold">' + s.roll + '</span></td>' +
          '<td><strong>' + s.name + '</strong></td>' +
          '<td>' +
            '<div class="att-toggle-group" data-student-id="' + s.id + '">' +
              '<button type="button" class="att-btn ' + (status === 'present' ? 'active present' : '') + '" data-status="present">P</button>' +
              '<button type="button" class="att-btn ' + (status === 'late' ? 'active late' : '') + '" data-status="late">L</button>' +
              '<button type="button" class="att-btn ' + (status === 'absent' ? 'active absent' : '') + '" data-status="absent">A</button>' +
            '</div>' +
          '</td>' +
          '<td>' + (status === 'present' ? '<span class="badge badge-success">+10 pts</span>' : '0 pts') + '</td>' +
          '<td>' +
            '<a href="https://wa.me/' + s.father_phone.replace(/[^0-9]/g, '') + '?text=Dear%20Parent,%20' + encodeURIComponent(s.name) + '%20was%20marked%20' + status.toUpperCase() + '%20today%20in%20' + encodeURIComponent(deckData.title) + '." target="_blank" class="btn btn-outline btn-sm">💬 Alert Parent</a>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    // Toggle button handler
    tbody.querySelectorAll('.att-btn').forEach(function (btn) {
      btn.onclick = function () {
        var group = this.closest('.att-toggle-group');
        group.querySelectorAll('.att-btn').forEach(function (b) { b.className = 'att-btn'; });
        var status = this.getAttribute('data-status');
        this.className = 'att-btn active ' + status;
        showToast('Updated student attendance to: ' + status.toUpperCase(), 'info');
      };
    });

    var markAllBtn = document.getElementById('btnDeckMarkAllPresent');
    if (markAllBtn) {
      markAllBtn.onclick = function () {
        tbody.querySelectorAll('.att-toggle-group').forEach(function (group) {
          group.querySelectorAll('.att-btn').forEach(function (b) { b.className = 'att-btn'; });
          var pBtn = group.querySelector('[data-status="present"]');
          if (pBtn) pBtn.className = 'att-btn active present';
        });
        showToast('Marked all students as Present (+10 pts)', 'success');
      };
    }

    var saveBtn = document.getElementById('btnDeckSaveAttendance');
    if (saveBtn) {
      saveBtn.onclick = function () {
        showToast('Attendance session saved and synced with student portals!', 'success');
      };
    }
  }

  // ─── DECK SUB-TAB 3: POINTS & HONORS DISPENSER DESK ────────────────────────
  function renderDeckPoints(deckData) {
    var studentSelect = document.getElementById('deckAwardStudentSelect');
    var enrolledStudents = (STATE.students || []).filter(function (s) {
      return deckData.studentIds.indexOf(s.id) !== -1;
    });

    if (studentSelect) {
      studentSelect.innerHTML = enrolledStudents.map(function (s) {
        return '<option value="' + s.id + '">' + s.name + ' (' + s.roll + ') — ' + s.points.toLocaleString() + ' pts</option>';
      }).join('');
    }

    // Render Live Batch Point Leaderboard
    renderDeckLiveLeaderboard(deckData);

    // Quick pts buttons
    document.querySelectorAll('.qpts').forEach(function (btn) {
      btn.onclick = function () {
        var pts = this.getAttribute('data-pts');
        var input = document.getElementById('deckAwardPointsInput');
        if (input) input.value = pts;
      };
    });

    var form = document.getElementById('formDeckAwardPoints');
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var sId = document.getElementById('deckAwardStudentSelect').value;
        var pts = parseInt(document.getElementById('deckAwardPointsInput').value, 10);
        var category = document.getElementById('deckAwardCategorySelect').value;
        var citation = document.getElementById('deckAwardCitationInput').value;

        awardPointsToStudentInDeck(deckData, sId, pts, category, citation);
        form.reset();
        document.getElementById('deckAwardPointsInput').value = '100';
      };
    }
  }

  function renderDeckLiveLeaderboard(deckData) {
    var container = document.getElementById('deckLiveLeaderboardList');
    if (!container) return;

    var enrolledStudents = (STATE.students || []).filter(function (s) {
      return deckData.studentIds.indexOf(s.id) !== -1;
    });

    // Sort by points descending
    enrolledStudents.sort(function (a, b) { return b.points - a.points; });

    container.innerHTML = enrolledStudents.map(function (s, idx) {
      var rankStr = String(idx + 1).padStart(2, '0');
      var medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : '⭐'));

      return (
        '<div style="display:flex; justify-content:space-between; align-items:center; padding:11px 16px; border-bottom:1px solid var(--border);">' +
          '<div style="display:flex; align-items:center; gap:10px;">' +
            '<span style="font-family:var(--font-mono); font-size:12px; font-weight:800; min-width:44px;">' + medal + ' ' + rankStr + '</span>' +
            '<div style="width:28px; height:28px; border-radius:50%; background:' + (s.avatar_bg || 'var(--primary)') + '; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">' + s.avatar_initials + '</div>' +
            '<div>' +
              '<strong style="font-size:13px;">' + s.name + '</strong>' +
              '<div style="font-size:11px; color:var(--text-muted);">🔥 ' + s.streak + 'd streak</div>' +
            '</div>' +
          '</div>' +
          '<span style="font-family:var(--font-serif); font-size:14px; font-weight:700;">' + s.points.toLocaleString() + ' pts</span>' +
        '</div>'
      );
    }).join('');
  }

  function awardPointsToStudentInDeck(deckData, studentId, points, category, citation) {
    var student = (STATE.students || []).find(function (s) { return s.id === studentId; });
    if (!student) return;

    student.points += points;

    var newDispatch = {
      id: 'disp-' + Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      context_type: deckData.isPrivate ? 'private_batch' : 'coaching_section',
      context_id: activeDeckContext.id,
      context_title: deckData.title,
      teacher_id: activeTeacherId,
      teacher_name: getActiveTeacher().name,
      student_id: student.id,
      student_name: student.name,
      points: points,
      category: category,
      citation: citation
    };

    STATE.points_dispatches.unshift(newDispatch);
    saveState();

    renderDeckLiveLeaderboard(deckData);
    showToast('Awarded +' + points + ' pts to ' + student.name + '! Standings updated live.', 'success');
  }

  // ─── DECK SUB-TAB 4: TESTS & MARKS (Multiple Tests & Every Student) ──────
  function renderDeckTests(deckData) {
    var chipsRow = document.getElementById('deckTestChipsRow');
    var detailArea = document.getElementById('deckTestDetailArea');
    if (!chipsRow || !detailArea) return;

    var tests = (STATE.tests || []).filter(function (t) { return t.context_id === activeDeckContext.id; });

    // Update test counter pill in sidebar
    var testCountEl = document.getElementById('sidebarTestCountPill');
    if (testCountEl) testCountEl.textContent = tests.length;

    if (tests.length === 0) {
      chipsRow.innerHTML = '';
      detailArea.innerHTML = (
        '<div class="card p-24 text-center text-muted" style="padding:40px 20px;">' +
          '<h3 style="font-size:17px; font-weight:700; margin-bottom:6px;">No tests scheduled yet for this batch</h3>' +
          '<p class="text-xs text-muted" style="margin-bottom:16px;">Schedule tests, record marks, and maintain diagnostic student scorecards.</p>' +
          '<button type="button" class="btn btn-primary" onclick="openModal(\'modalScheduleNewTest\')">+ Schedule First Test</button>' +
        '</div>'
      );
      return;
    }

    if (!activeTestId || !tests.some(function (t) { return t.id === activeTestId; })) {
      activeTestId = tests[0].id;
    }

    // Render Test Selector Chips
    chipsRow.innerHTML = tests.map(function (t) {
      var isActive = t.id === activeTestId;
      return (
        '<button type="button" class="chip-btn ' + (isActive ? 'active' : '') + ' btn-select-test" data-test-id="' + t.id + '">' +
          '📝 ' + t.title + ' <span class="badge" style="margin-left:4px; font-size:10px;">' + t.max_marks + 'M</span>' +
        '</button>'
      );
    }).join('');

    chipsRow.querySelectorAll('.btn-select-test').forEach(function (btn) {
      btn.onclick = function () {
        activeTestId = this.getAttribute('data-test-id');
        renderDeckTests(deckData);
      };
    });

    var currTest = tests.find(function (t) { return t.id === activeTestId; }) || tests[0];

    // Ensure all currently enrolled students have an entry in currTest.submissions
    if (!currTest.submissions) currTest.submissions = [];
    var enrolledStudents = (STATE.students || []).filter(function (s) {
      return deckData.studentIds.indexOf(s.id) !== -1;
    });

    enrolledStudents.forEach(function (s) {
      var existingSub = currTest.submissions.find(function (sub) { return sub.student_id === s.id; });
      if (!existingSub) {
        currTest.submissions.push({
          student_id: s.id,
          name: s.name,
          roll: s.roll,
          marks: 0,
          rank: currTest.submissions.length + 1,
          status: 'present',
          weak_topics: ''
        });
      }
    });

    // Sort submissions by marks descending
    currTest.submissions.sort(function (a, b) { return b.marks - a.marks; });
    currTest.submissions.forEach(function (sub, idx) { sub.rank = idx + 1; });

    // Compute test analytics
    var totalSubmissions = currTest.submissions.length;
    var presentSubs = currTest.submissions.filter(function (sub) { return sub.status !== 'absent'; });
    var sumMarks = presentSubs.reduce(function (acc, sub) { return acc + (Number(sub.marks) || 0); }, 0);
    var classAvg = presentSubs.length > 0 ? (sumMarks / presentSubs.length).toFixed(1) : 0;
    var highestMarks = currTest.submissions.length > 0 ? Math.max.apply(null, currTest.submissions.map(function (s) { return Number(s.marks) || 0; })) : 0;
    var lowestMarks = presentSubs.length > 0 ? Math.min.apply(null, presentSubs.map(function (s) { return Number(s.marks) || 0; })) : 0;
    var passingScore = currTest.max_marks * 0.33;
    var passedCount = presentSubs.filter(function (s) { return s.marks >= passingScore; }).length;
    var passRate = presentSubs.length > 0 ? Math.round((passedCount / presentSubs.length) * 100) : 100;

    currTest.class_average = Number(classAvg);
    currTest.highest_score = highestMarks;
    currTest.lowest_score = lowestMarks;
    currTest.pass_rate = passRate;

    // Render Test Overview Card & Full Student Scorecards Table
    detailArea.innerHTML = (
      '<div class="card" style="margin-bottom:20px;">' +
        '<div class="card-header" style="flex-wrap:wrap; gap:12px;">' +
          '<div>' +
            '<div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">' +
              '<span class="badge badge-primary">' + currTest.subject + '</span>' +
              '<span class="text-xs text-muted">Conducted: <strong>' + currTest.conducted_date + '</strong></span>' +
              '<span class="text-xs text-muted">&bull; Maximum Marks: <strong>' + currTest.max_marks + '</strong></span>' +
            '</div>' +
            '<h3 class="card-title" style="font-size:17px;">' + currTest.title + '</h3>' +
          '</div>' +
          '<div style="display:flex; gap:8px;">' +
            '<button type="button" class="btn btn-primary btn-sm" id="btnSaveScorecardTop">💾 Save Scorecard</button>' +
            '<button type="button" class="btn btn-outline btn-sm" id="btnDeleteCurrTest" style="color:var(--danger); border-color:rgba(220,38,38,0.3);">🗑️ Delete Test</button>' +
          '</div>' +
        '</div>' +
        '<div class="card-body">' +
          '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin-bottom:18px;">' +
            '<div style="background:var(--surface-muted); padding:12px; border-radius:var(--radius-md); text-align:center;">' +
              '<div class="text-xs text-muted font-bold">Class Average</div>' +
              '<div style="font-size:20px; font-weight:800; color:var(--primary); font-family:var(--font-mono);">' + classAvg + ' / ' + currTest.max_marks + '</div>' +
              '<div class="text-xs text-muted">' + Math.round((classAvg / currTest.max_marks) * 100) + '% Avg</div>' +
            '</div>' +
            '<div style="background:var(--surface-muted); padding:12px; border-radius:var(--radius-md); text-align:center;">' +
              '<div class="text-xs text-muted font-bold">Highest Score</div>' +
              '<div style="font-size:20px; font-weight:800; color:#059669; font-family:var(--font-mono);">' + highestMarks + ' / ' + currTest.max_marks + '</div>' +
              '<div class="text-xs text-muted">' + (currTest.submissions[0] ? currTest.submissions[0].name : '—') + '</div>' +
            '</div>' +
            '<div style="background:var(--surface-muted); padding:12px; border-radius:var(--radius-md); text-align:center;">' +
              '<div class="text-xs text-muted font-bold">Lowest Score</div>' +
              '<div style="font-size:20px; font-weight:800; color:#D97706; font-family:var(--font-mono);">' + lowestMarks + ' / ' + currTest.max_marks + '</div>' +
              '<div class="text-xs text-muted">Benchmark Range</div>' +
            '</div>' +
            '<div style="background:var(--surface-muted); padding:12px; border-radius:var(--radius-md); text-align:center;">' +
              '<div class="text-xs text-muted font-bold">Pass Rate</div>' +
              '<div style="font-size:20px; font-weight:800; color:var(--primary); font-family:var(--font-mono);">' + passRate + '%</div>' +
              '<div class="text-xs text-muted">' + passedCount + ' of ' + presentSubs.length + ' Passed</div>' +
            '</div>' +
          '</div>' +

          '<div class="table-responsive">' +
            '<table class="data-table">' +
              '<thead>' +
                '<tr>' +
                  '<th>Rank</th>' +
                  '<th>Roll No</th>' +
                  '<th>Student Name</th>' +
                  '<th>Marks (Max ' + currTest.max_marks + ')</th>' +
                  '<th>Percentage</th>' +
                  '<th>Grade</th>' +
                  '<th>Status</th>' +
                  '<th>Weak Topic / Diagnostic Feedback</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody id="deckScorecardTableBody">' +
                currTest.submissions.map(function (sub) {
                  var sNum = Number(sub.marks) || 0;
                  var pct = Math.round((sNum / currTest.max_marks) * 100);
                  var grade = pct >= 90 ? 'A1' : (pct >= 80 ? 'A2' : (pct >= 70 ? 'B1' : (pct >= 60 ? 'B2' : (pct >= 50 ? 'C1' : (pct >= 33 ? 'D' : 'E')))));
                  var medal = sub.rank === 1 ? '🥇 ' : (sub.rank === 2 ? '🥈 ' : (sub.rank === 3 ? '🥉 ' : ''));

                  return (
                    '<tr>' +
                      '<td><strong class="font-mono">' + medal + '#' + sub.rank + '</strong></td>' +
                      '<td><span class="font-mono text-xs font-bold">' + (sub.roll || 'SA') + '</span></td>' +
                      '<td><strong>' + sub.name + '</strong></td>' +
                      '<td>' +
                        '<div style="display:flex; align-items:center; gap:6px;">' +
                          '<input type="number" class="form-input text-xs font-bold score-marks-inp" data-sub-student-id="' + sub.student_id + '" value="' + sNum + '" min="0" max="' + currTest.max_marks + '" style="width:75px; text-align:center;">' +
                          '<span class="text-xs text-muted">/ ' + currTest.max_marks + '</span>' +
                        '</div>' +
                      '</td>' +
                      '<td><strong>' + pct + '%</strong></td>' +
                      '<td><span class="badge ' + (pct >= 80 ? 'badge-success' : (pct >= 50 ? 'badge-primary' : 'badge-warning')) + '">' + grade + '</span></td>' +
                      '<td>' +
                        '<select class="form-select text-xs score-status-sel" data-sub-student-id="' + sub.student_id + '" style="padding:4px 8px; width:95px;">' +
                          '<option value="present" ' + (sub.status !== 'absent' ? 'selected' : '') + '>Present</option>' +
                          '<option value="absent" ' + (sub.status === 'absent' ? 'selected' : '') + '>Absent</option>' +
                        '</select>' +
                      '</td>' +
                      '<td>' +
                        '<input type="text" class="form-input text-xs score-weak-inp" data-sub-student-id="' + sub.student_id + '" value="' + (sub.weak_topics || '') + '" placeholder="e.g. Discriminant roots calculation error" style="min-width:200px;">' +
                      '</td>' +
                    '</tr>'
                  );
                }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>' +

          '<div style="margin-top:16px; display:flex; justify-content:flex-end;">' +
            '<button type="button" class="btn btn-primary" id="btnSaveScorecardBottom">💾 Save Scorecard &amp; Recompute Ranks</button>' +
          '</div>' +

        '</div>' +
      '</div>'
    );

    // Save Scorecard Handler Function
    function saveCurrTestScorecard() {
      var rows = detailArea.querySelectorAll('#deckScorecardTableBody tr');
      currTest.submissions.forEach(function (sub) {
        var marksInp = detailArea.querySelector('.score-marks-inp[data-sub-student-id="' + sub.student_id + '"]');
        var statusSel = detailArea.querySelector('.score-status-sel[data-sub-student-id="' + sub.student_id + '"]');
        var weakInp = detailArea.querySelector('.score-weak-inp[data-sub-student-id="' + sub.student_id + '"]');

        if (marksInp) sub.marks = Math.min(currTest.max_marks, Math.max(0, Number(marksInp.value) || 0));
        if (statusSel) sub.status = statusSel.value;
        if (weakInp) sub.weak_topics = weakInp.value.trim();
      });

      // Re-sort and re-rank
      currTest.submissions.sort(function (a, b) { return b.marks - a.marks; });
      currTest.submissions.forEach(function (sub, idx) { sub.rank = idx + 1; });

      saveState();
      renderDeckTests(deckData);
      showToast('Scorecard saved for ' + currTest.title + '! Ranks recomputed.', 'success');
    }

    var saveTop = document.getElementById('btnSaveScorecardTop');
    if (saveTop) saveTop.onclick = saveCurrTestScorecard;

    var saveBottom = document.getElementById('btnSaveScorecardBottom');
    if (saveBottom) saveBottom.onclick = saveCurrTestScorecard;

    // Delete Test Handler
    var delBtn = document.getElementById('btnDeleteCurrTest');
    if (delBtn) {
      delBtn.onclick = function () {
        if (confirm('Are you sure you want to delete "' + currTest.title + '" and its scorecards?')) {
          STATE.tests = (STATE.tests || []).filter(function (t) { return t.id !== currTest.id; });
          saveState();
          activeTestId = null;
          renderDeckTests(deckData);
          showToast('Test removed from batch.', 'info');
        }
      };
    }
  }

  // ─── DECK SUB-TAB 5: CURRICULUM TRACKER (Planned Target vs Reality) ─────────
  function renderDeckSyllabus(deckData) {
    var tbody = document.getElementById('deckSyllabusTableBody');
    var statsGrid = document.getElementById('sylStatsGrid');
    if (!tbody) return;

    var topics = (STATE.syllabus_topics || []).filter(function (tp) { return tp.context_id === activeDeckContext.id; });

    if (topics.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center p-20 text-muted">No syllabus topics registered for this batch. Click "+ Add Chapter / Topic" above.</td></tr>';
      if (statsGrid) statsGrid.innerHTML = '';
      return;
    }

    // Analytics: Target vs Reality
    var totalTopics = topics.length;
    var coveredTopics = topics.filter(function (t) { return t.status === 'covered'; }).length;
    var inProgressTopics = topics.filter(function (t) { return t.status === 'in_progress'; }).length;
    var delayedTopics = topics.filter(function (t) { return t.variance_status === 'delayed'; }).length;

    var plannedCoveredCount = topics.filter(function (t) {
      return new Date(t.planned_target_date || '2026-10-01') <= new Date('2026-10-20');
    }).length;

    var plannedPct = Math.round((plannedCoveredCount / totalTopics) * 100);
    var actualPct = Math.round((coveredTopics / totalTopics) * 100);

    // Render Stats Grid
    if (statsGrid) {
      statsGrid.innerHTML = (
        '<div style="background:var(--surface-muted); padding:12px 16px; border-radius:var(--radius-md); border:1px solid var(--border);">' +
          '<div class="text-xs text-muted font-bold text-uppercase">Target Planned Timeline</div>' +
          '<div style="font-size:20px; font-weight:800; color:#2563EB; font-family:var(--font-mono);">' + plannedCoveredCount + ' of ' + totalTopics + ' Topics</div>' +
          '<div class="text-xs text-muted">' + plannedPct + '% of Course Target Milestone</div>' +
        '</div>' +
        '<div style="background:var(--surface-muted); padding:12px 16px; border-radius:var(--radius-md); border:1px solid var(--border);">' +
          '<div class="text-xs text-muted font-bold text-uppercase">Actual Reality Covered</div>' +
          '<div style="font-size:20px; font-weight:800; color:var(--primary); font-family:var(--font-mono);">' + coveredTopics + ' of ' + totalTopics + ' Covered</div>' +
          '<div class="text-xs text-muted">' + actualPct + '% Realized Completion</div>' +
        '</div>' +
        '<div style="background:var(--surface-muted); padding:12px 16px; border-radius:var(--radius-md); border:1px solid var(--border);">' +
          '<div class="text-xs text-muted font-bold text-uppercase">In Progress / Active</div>' +
          '<div style="font-size:20px; font-weight:800; color:#D97706; font-family:var(--font-mono);">' + inProgressTopics + ' Topics Active</div>' +
          '<div class="text-xs text-muted">' + delayedTopics + ' Topics Behind Target</div>' +
        '</div>' +
        '<div style="background:var(--surface-muted); padding:12px 16px; border-radius:var(--radius-md); border:1px solid var(--border);">' +
          '<div class="text-xs text-muted font-bold text-uppercase">Timeline Variance Reality</div>' +
          '<div style="font-size:15px; font-weight:800; color:' + (delayedTopics > 0 ? '#DC2626' : '#059669') + '; margin-top:4px;">' +
            (delayedTopics > 0 ? '⚠️ ' + delayedTopics + ' Chapters Delayed' : '🟢 Fully On Schedule') +
          '</div>' +
          '<div class="text-xs text-muted">Syllabus Deviation Tracking</div>' +
        '</div>'
      );
    }

    // Update Progress Bars
    var barPlanned = document.getElementById('sylPlannedProgressBar');
    var lblPlanned = document.getElementById('sylPlannedPctLabel');
    if (barPlanned) barPlanned.style.width = plannedPct + '%';
    if (lblPlanned) lblPlanned.textContent = plannedPct + '% Planned Target';

    var barActual = document.getElementById('sylActualProgressBar');
    var lblActual = document.getElementById('sylActualPctLabel');
    if (barActual) barActual.style.width = actualPct + '%';
    if (lblActual) lblActual.textContent = actualPct + '% Completed (Reality)';

    // Render Table Body
    tbody.innerHTML = topics.map(function (tp) {
      var statusBadge = tp.status === 'covered' 
        ? '<span class="badge badge-success">✓ Covered</span>' 
        : (tp.status === 'in_progress' ? '<span class="badge badge-warning">In Progress</span>' : '<span class="badge badge-muted">Upcoming</span>');

      var varBadge = '<span class="pill pill-primary" style="font-size:11px;">' + (tp.variance_text || '🟢 On Schedule') + '</span>';

      return (
        '<tr>' +
          '<td><strong style="color:var(--primary);">Chapter ' + tp.chapter_number + '</strong><br><span style="font-size:12px; font-weight:700;">' + tp.chapter_name + '</span></td>' +
          '<td>' + tp.topic_name + '</td>' +
          '<td><span class="font-mono text-xs font-bold">' + (tp.planned_target_date || '—') + '</span></td>' +
          '<td><span class="font-mono text-xs font-bold" style="color:' + (tp.actual_completion_date ? '#059669' : '#D97706') + ';">' + (tp.actual_completion_date || 'In Progress') + '</span></td>' +
          '<td>' + statusBadge + '</td>' +
          '<td>' + varBadge + '</td>' +
          '<td><strong>' + tp.revised_count + '</strong> students revised</td>' +
          '<td>' +
            '<div style="display:flex; gap:6px;">' +
              '<button type="button" class="btn btn-outline btn-sm btn-cycle-syl" data-syl-id="' + tp.id + '">Toggle Status</button>' +
              '<button type="button" class="btn btn-outline btn-sm btn-remove-syl-topic" data-syl-id="' + tp.id + '" style="color:var(--danger); border-color:rgba(220,38,38,0.3);">🗑️</button>' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    // Toggle Status
    tbody.querySelectorAll('.btn-cycle-syl').forEach(function (btn) {
      btn.onclick = function () {
        var sId = this.getAttribute('data-syl-id');
        var item = (STATE.syllabus_topics || []).find(function (t) { return t.id === sId; });
        if (item) {
          if (item.status === 'covered') {
            item.status = 'in_progress';
            item.actual_completion_date = null;
            item.variance_text = '🟡 In Progress';
          } else if (item.status === 'in_progress') {
            item.status = 'upcoming';
            item.actual_completion_date = null;
            item.variance_text = '⚪ Upcoming';
          } else {
            item.status = 'covered';
            item.actual_completion_date = new Date().toISOString().slice(0, 10);
            item.variance_text = '🟢 Completed (Reality)';
          }
          saveState();
          renderDeckSyllabus(deckData);
          showToast('Updated status for: ' + item.topic_name, 'info');
        }
      };
    });

    // Remove Topic
    tbody.querySelectorAll('.btn-remove-syl-topic').forEach(function (btn) {
      btn.onclick = function () {
        var sId = this.getAttribute('data-syl-id');
        var item = (STATE.syllabus_topics || []).find(function (t) { return t.id === sId; });
        if (item && confirm('Remove Chapter ' + item.chapter_number + ': ' + item.chapter_name + ' (' + item.topic_name + ')?')) {
          STATE.syllabus_topics = (STATE.syllabus_topics || []).filter(function (t) { return t.id !== sId; });
          saveState();
          renderDeckSyllabus(deckData);
          showToast('Removed chapter topic from curriculum.', 'info');
        }
      };
    });
  }

  // Helper to format Month keys like "2026-10" to "October 2026"
  function formatMonthName(monthKey) {
    if (!monthKey) return '—';
    var parts = monthKey.split('-');
    if (parts.length < 2) return monthKey;
    var year = parts[0];
    var monthNum = parseInt(parts[1], 10) - 1;
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return (monthNames[monthNum] || 'Month') + ' ' + year;
  }

  // ─── DECK SUB-TAB 6: TUITION FEES (Personalized Monthly Ledger) ────────────
  function renderDeckFees(deckData) {
    var tbody = document.getElementById('deckFeesTableBody');
    var statsGrid = document.getElementById('feeStatsGrid');
    var monthSelector = document.getElementById('deckFeeMonthSelector');
    if (!tbody || !statsGrid || !monthSelector) return;

    var curMonthKey = monthSelector.value || selectedFeeMonth || '2026-10';
    selectedFeeMonth = curMonthKey;

    var monthTitleEl = document.getElementById('dispSelectedFeeMonthName');
    if (monthTitleEl) monthTitleEl.textContent = formatMonthName(curMonthKey);

    var enrolledStudents = (STATE.students || []).filter(function (s) {
      return deckData.studentIds.indexOf(s.id) !== -1;
    });

    if (enrolledStudents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center p-20 text-muted">No students enrolled in this batch.</td></tr>';
      statsGrid.innerHTML = '';
      return;
    }

    // Ensure every student has fee configuration
    enrolledStudents.forEach(function (s) {
      if (!s.custom_monthly_fee) s.custom_monthly_fee = deckData.fee || 2500;
      if (!s.admission_start_month) s.admission_start_month = '2026-06';
      if (!s.course_end_month) s.course_end_month = '2027-03';
      if (!s.fee_ledger) s.fee_ledger = {};
      if (!s.fee_ledger[curMonthKey]) {
        // Inherit default or generate pending
        s.fee_ledger[curMonthKey] = {
          status: s.fee_status === 'paid' ? 'paid' : 'pending',
          amount: s.custom_monthly_fee,
          paid_date: s.fee_status === 'paid' ? '2026-10-02' : null,
          payment_mode: s.fee_status === 'paid' ? 'UPI (Google Pay)' : null,
          receipt_ref: s.fee_status === 'paid' ? 'REC-' + s.roll + '-10' : null
        };
      }
    });

    // Compute Collection Metrics for this month
    var totalExpected = enrolledStudents.reduce(function (acc, s) { return acc + (s.custom_monthly_fee || 2500); }, 0);
    var paidStudents = enrolledStudents.filter(function (s) {
      var rec = s.fee_ledger && s.fee_ledger[curMonthKey];
      return rec && rec.status === 'paid';
    });
    var totalCollected = paidStudents.reduce(function (acc, s) {
      var rec = s.fee_ledger[curMonthKey];
      return acc + (rec.amount || s.custom_monthly_fee || 2500);
    }, 0);
    var pendingDues = totalExpected - totalCollected;
    var collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 100;

    // Render Stats Grid
    statsGrid.innerHTML = (
      '<div style="background:var(--surface-muted); padding:14px 18px; border-radius:var(--radius-md); border:1px solid var(--border);">' +
        '<div class="text-xs text-muted font-bold text-uppercase">Expected Monthly Collections</div>' +
        '<div style="font-size:22px; font-weight:800; color:var(--text-main); font-family:var(--font-mono);">₹' + totalExpected.toLocaleString() + '</div>' +
        '<div class="text-xs text-muted">' + enrolledStudents.length + ' Enrolled Students in Batch</div>' +
      '</div>' +
      '<div style="background:var(--surface-muted); padding:14px 18px; border-radius:var(--radius-md); border:1px solid var(--border);">' +
        '<div class="text-xs text-muted font-bold text-uppercase">Total Collected (' + formatMonthName(curMonthKey) + ')</div>' +
        '<div style="font-size:22px; font-weight:800; color:#059669; font-family:var(--font-mono);">₹' + totalCollected.toLocaleString() + '</div>' +
        '<div class="text-xs text-muted">' + paidStudents.length + ' Students Settled (' + collectionRate + '%)</div>' +
      '</div>' +
      '<div style="background:var(--surface-muted); padding:14px 18px; border-radius:var(--radius-md); border:1px solid var(--border);">' +
        '<div class="text-xs text-muted font-bold text-uppercase">Pending Tuition Dues</div>' +
        '<div style="font-size:22px; font-weight:800; color:' + (pendingDues > 0 ? '#DC2626' : '#059669') + '; font-family:var(--font-mono);">₹' + pendingDues.toLocaleString() + '</div>' +
        '<div class="text-xs text-muted">' + (enrolledStudents.length - paidStudents.length) + ' Students Pending</div>' +
      '</div>' +
      '<div style="background:var(--surface-muted); padding:14px 18px; border-radius:var(--radius-md); border:1px solid var(--border);">' +
        '<div class="text-xs text-muted font-bold text-uppercase">Collection Clearance Rate</div>' +
        '<div style="font-size:22px; font-weight:800; color:var(--primary); font-family:var(--font-mono);">' + collectionRate + '%</div>' +
        '<div class="text-xs text-muted">Cleared via UPI &amp; Cash</div>' +
      '</div>'
    );

    // Render Table Rows
    tbody.innerHTML = enrolledStudents.map(function (s) {
      var rec = (s.fee_ledger && s.fee_ledger[curMonthKey]) || { status: 'pending', amount: s.custom_monthly_fee };
      var isPaid = rec.status === 'paid';
      var statusBadge = isPaid
        ? '<span class="badge badge-success">PAID</span>'
        : '<span class="badge badge-warning">PENDING</span>';

      var periodStr = 'Start: ' + formatMonthName(s.admission_start_month) + '<br><span class="text-muted" style="font-size:11px;">End: ' + formatMonthName(s.course_end_month) + '</span>';

      var payInfo = isPaid
        ? '<div><strong>' + rec.paid_date + '</strong><div style="font-size:11px; color:var(--text-muted);">' + (rec.payment_mode || 'UPI') + '</div></div>'
        : '<span style="color:#D97706; font-size:12px; font-weight:700;">— Pending Dues</span>';

      return (
        '<tr>' +
          '<td><span class="font-mono text-xs font-bold">' + s.roll + '</span></td>' +
          '<td>' +
            '<div style="display:flex; align-items:center; gap:8px;">' +
              '<div style="width:28px; height:28px; border-radius:50%; background:' + (s.avatar_bg || 'var(--primary)') + '; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:10.5px;">' + s.avatar_initials + '</div>' +
              '<div>' +
                '<strong>' + s.name + '</strong>' +
                '<div style="font-size:11px; color:var(--text-muted);">' + s.father_name + ' (' + s.father_phone + ')</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td>' + periodStr + '</td>' +
          '<td>' +
            '<div style="display:flex; align-items:center; gap:6px;">' +
              '<strong style="font-family:var(--font-mono); font-size:14px;">₹' + (s.custom_monthly_fee || 2500).toLocaleString() + '</strong>' +
              '<button type="button" class="btn btn-outline btn-sm btn-cfg-student-fee" data-student-id="' + s.id + '" title="Configure personalized fee, start and end month" style="padding:2px 6px; font-size:11px;">⚙️</button>' +
            '</div>' +
          '</td>' +
          '<td>' + statusBadge + '</td>' +
          '<td>' + payInfo + '</td>' +
          '<td>' +
            '<div style="display:flex; gap:6px; align-items:center;">' +
              (isPaid
                ? '<button type="button" class="btn btn-outline btn-sm btn-view-receipt" data-student-id="' + s.id + '" data-month-key="' + curMonthKey + '">🧾 Receipt</button>'
                : '<button type="button" class="btn btn-primary btn-sm btn-record-payment" data-student-id="' + s.id + '" data-month-key="' + curMonthKey + '">💳 Record Paid</button>') +
              '<button type="button" class="btn btn-outline btn-sm btn-view-student-ledger" data-student-id="' + s.id + '" title="View complete month-by-month history">📋 Ledger</button>' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    // Wire Month Selector Change
    monthSelector.onchange = function () {
      selectedFeeMonth = this.value;
      renderDeckFees(deckData);
    };

    // Wire Record Payment Button
    tbody.querySelectorAll('.btn-record-payment').forEach(function (btn) {
      btn.onclick = function () {
        var sId = this.getAttribute('data-student-id');
        var mKey = this.getAttribute('data-month-key');
        var student = (STATE.students || []).find(function (st) { return st.id === sId; });
        if (!student) return;

        document.getElementById('payStudentId').value = sId;
        document.getElementById('payMonthKey').value = mKey;
        document.getElementById('payStudentNameDisplay').textContent = student.name + ' (' + student.roll + ')';
        document.getElementById('payMonthDisplay').textContent = formatMonthName(mKey);
        document.getElementById('payAmountInput').value = student.custom_monthly_fee || 2500;
        document.getElementById('payDateInput').value = new Date().toISOString().slice(0, 10);
        document.getElementById('payRefInput').value = 'REC-' + sId.slice(-4) + '-' + mKey.replace('-', '');

        openModal('modalRecordPayment');
      };
    });

    // Wire View Receipt Button
    tbody.querySelectorAll('.btn-view-receipt').forEach(function (btn) {
      btn.onclick = function () {
        var sId = this.getAttribute('data-student-id');
        var mKey = this.getAttribute('data-month-key');
        var student = (STATE.students || []).find(function (st) { return st.id === sId; });
        if (!student) return;

        var rec = (student.fee_ledger && student.fee_ledger[mKey]) || {};

        document.getElementById('recInstituteName').textContent = deckData.title;
        document.getElementById('recRefNumber').textContent = rec.receipt_ref || ('REC-' + mKey.replace('-', '') + '-' + student.roll);
        document.getElementById('recStudentName').textContent = student.name;
        document.getElementById('recStudentRoll').textContent = student.roll;
        document.getElementById('recBatchName').textContent = deckData.title;
        document.getElementById('recMonthName').textContent = formatMonthName(mKey);
        document.getElementById('recPaidDate').textContent = rec.paid_date || new Date().toISOString().slice(0, 10);
        document.getElementById('recPaymentMode').textContent = rec.payment_mode || 'UPI (Google Pay)';
        document.getElementById('recAmountDisplay').textContent = '₹' + (rec.amount || student.custom_monthly_fee || 2500).toLocaleString() + '.00';
        document.getElementById('recTeacherSign').textContent = getActiveTeacher().name;

        openModal('modalViewFeeReceipt');
      };
    });

    // Wire Configure Fee Structure Button
    tbody.querySelectorAll('.btn-cfg-student-fee').forEach(function (btn) {
      btn.onclick = function () {
        var sId = this.getAttribute('data-student-id');
        var student = (STATE.students || []).find(function (st) { return st.id === sId; });
        if (!student) return;

        document.getElementById('cfgFeeStudentId').value = sId;
        document.getElementById('cfgFeeStudentName').textContent = student.name;
        document.getElementById('cfgFeeStudentMeta').textContent = 'Roll: ' + student.roll + ' • ' + student.grade + ' ' + student.board;
        document.getElementById('cfgFeeAmountInput').value = student.custom_monthly_fee || 2500;
        document.getElementById('cfgFeeStartMonth').value = student.admission_start_month || '2026-06';
        document.getElementById('cfgFeeEndMonth').value = student.course_end_month || '2027-03';

        openModal('modalConfigureStudentFee');
      };
    });

    // Wire Full Ledger Modal Button
    tbody.querySelectorAll('.btn-view-student-ledger').forEach(function (btn) {
      btn.onclick = function () {
        var sId = this.getAttribute('data-student-id');
        var student = (STATE.students || []).find(function (st) { return st.id === sId; });
        if (!student) return;

        document.getElementById('histStudentNameTitle').textContent = student.name + ' (' + student.roll + ') — Fee History Ledger';
        document.getElementById('histStudentPeriodTitle').textContent = 'Admission Period: ' + formatMonthName(student.admission_start_month) + ' to ' + formatMonthName(student.course_end_month) + ' • Monthly Fee: ₹' + (student.custom_monthly_fee || 2500);

        var monthsList = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03'];
        var activeMonths = monthsList.filter(function (m) {
          return m >= (student.admission_start_month || '2026-06') && m <= (student.course_end_month || '2027-03');
        });

        var histBody = document.getElementById('histFeeTableBody');
        if (histBody) {
          histBody.innerHTML = activeMonths.map(function (mKey) {
            var rec = (student.fee_ledger && student.fee_ledger[mKey]) || { status: 'pending', amount: student.custom_monthly_fee || 2500 };
            var isP = rec.status === 'paid';

            return (
              '<tr>' +
                '<td><strong>' + formatMonthName(mKey) + '</strong></td>' +
                '<td><strong>₹' + (rec.amount || student.custom_monthly_fee || 2500).toLocaleString() + '</strong></td>' +
                '<td><span class="badge ' + (isP ? 'badge-success' : 'badge-warning') + '">' + (isP ? 'PAID' : 'PENDING') + '</span></td>' +
                '<td>' + (rec.paid_date || '—') + '</td>' +
                '<td>' + (rec.payment_mode || '—') + '</td>' +
                '<td>' +
                  (isP
                    ? '<span class="font-mono text-xs" style="color:var(--text-muted);">' + (rec.receipt_ref || 'REC-SETTLED') + '</span>'
                    : '<button type="button" class="btn btn-outline btn-sm btn-hist-pay" data-student-id="' + sId + '" data-month-key="' + mKey + '">Record Paid</button>') +
                '</td>' +
              '</tr>'
            );
          }).join('');

          histBody.querySelectorAll('.btn-hist-pay').forEach(function (hBtn) {
            hBtn.onclick = function () {
              closeModal('modalStudentFeeHistory');
              var s_Id = this.getAttribute('data-student-id');
              var m_Key = this.getAttribute('data-month-key');
              document.querySelector('.btn-record-payment[data-student-id="' + s_Id + '"]') && document.querySelector('.btn-record-payment[data-student-id="' + s_Id + '"]').click();
            };
          });
        }

        openModal('modalStudentFeeHistory');
      };
    });
  }

  // Helper to format Weekly Schedule object into a clean readable string
  function formatWeeklyScheduleDisplay(schedObj) {
    if (!schedObj || typeof schedObj !== 'object') return 'Mon, Wed, Fri • 07:30 AM – 09:00 AM';
    var activeDays = [];
    var commonTime = '';
    ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].forEach(function (d) {
      var val = schedObj[d];
      if (val && val.toLowerCase() !== 'closed') {
        var dayName = d.charAt(0).toUpperCase() + d.slice(1);
        activeDays.push(dayName);
        if (!commonTime) commonTime = val;
      }
    });

    if (activeDays.length === 0) return 'Closed';
    return activeDays.join(', ') + ' • ' + (commonTime || 'Regular Hours');
  }

  // ─── DECK SUB-TAB 7: BATCH SETTINGS & DAY-BY-DAY SCHEDULE ──────────────────
  function renderDeckSettings(deckData) {
    var nameInput = document.getElementById('deckRenameBatchNameInput');
    if (nameInput) nameInput.value = deckData.title;

    var roomInput = document.getElementById('deckRenameRoomInput');
    if (roomInput) roomInput.value = deckData.rawObj.room || 'Orbit Home Studio A';

    var feeInput = document.getElementById('deckRenameFeeInput');
    if (feeInput) feeInput.value = deckData.fee || 2500;

    // Weekly Schedule (Saved in exact day-wise JSON schema requested)
    var sched = deckData.rawObj.weekly_schedule;
    if (!sched || typeof sched !== 'object') {
      sched = {
        "fri": "09:00 AM - 05:00 PM",
        "mon": "09:00 AM - 05:00 PM",
        "sat": "09:00 AM - 02:00 PM",
        "sun": "Closed",
        "thu": "09:00 AM - 05:00 PM",
        "tue": "09:00 AM - 05:00 PM",
        "wed": "09:00 AM - 05:00 PM"
      };
      deckData.rawObj.weekly_schedule = sched;
    }

    var schedMon = document.getElementById('sched_mon');
    var schedTue = document.getElementById('sched_tue');
    var schedWed = document.getElementById('sched_wed');
    var schedThu = document.getElementById('sched_thu');
    var schedFri = document.getElementById('sched_fri');
    var schedSat = document.getElementById('sched_sat');
    var schedSun = document.getElementById('sched_sun');

    if (schedMon) schedMon.value = sched.mon || '09:00 AM - 05:00 PM';
    if (schedTue) schedTue.value = sched.tue || '09:00 AM - 05:00 PM';
    if (schedWed) schedWed.value = sched.wed || '09:00 AM - 05:00 PM';
    if (schedThu) schedThu.value = sched.thu || '09:00 AM - 05:00 PM';
    if (schedFri) schedFri.value = sched.fri || '09:00 AM - 05:00 PM';
    if (schedSat) schedSat.value = sched.sat || '09:00 AM - 02:00 PM';
    if (schedSun) schedSun.value = sched.sun || 'Closed';

    // Live update JSON schema preview box
    function updateSchedulePreview() {
      var currentScheduleObj = {
        "fri": (schedFri ? schedFri.value : sched.fri).trim(),
        "mon": (schedMon ? schedMon.value : sched.mon).trim(),
        "sat": (schedSat ? schedSat.value : sched.sat).trim(),
        "sun": (schedSun ? schedSun.value : sched.sun).trim(),
        "thu": (schedThu ? schedThu.value : sched.thu).trim(),
        "tue": (schedTue ? schedTue.value : sched.tue).trim(),
        "wed": (schedWed ? schedWed.value : sched.wed).trim()
      };
      var jsonPre = document.getElementById('dispScheduleJsonPreview');
      if (jsonPre) jsonPre.textContent = JSON.stringify(currentScheduleObj, null, 2);
      return currentScheduleObj;
    }

    [schedMon, schedTue, schedWed, schedThu, schedFri, schedSat, schedSun].forEach(function (inp) {
      if (inp) inp.oninput = updateSchedulePreview;
    });

    updateSchedulePreview();

    var form = document.getElementById('formDeckRenameBatch');
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var newName = nameInput.value.trim();
        var newRoom = roomInput.value.trim();
        var newFee = parseInt(feeInput.value, 10) || 2500;
        var scheduleObj = updateSchedulePreview();
        var summaryScheduleText = formatWeeklyScheduleDisplay(scheduleObj);

        if (deckData.isPrivate) {
          var pbatch = (STATE.private_batches || []).find(function (b) { return b.id === activeDeckContext.id; });
          if (pbatch) {
            pbatch.name = newName;
            pbatch.room = newRoom;
            pbatch.monthly_fee = newFee;
            pbatch.weekly_schedule = scheduleObj;
            pbatch.schedule = summaryScheduleText;
            saveState();
            renderBatchDeck();
            showToast('Batch renamed and weekly schedule JSON saved!', 'success');
          }
        } else {
          var inst = (STATE.coaching_institutes || []).find(function (i) { return i.id === activeDeckContext.parentCoachingId; });
          if (inst) {
            var sec = (inst.classes_sections || []).find(function (s) { return s.id === activeDeckContext.id; });
            if (sec) {
              sec.full_code = newName;
              sec.room = newRoom;
              sec.weekly_schedule = scheduleObj;
              saveState();
              renderBatchDeck();
              showToast('Section settings & weekly schedule JSON saved!', 'success');
            }
          }
        }
      };
    }
  }

  // ─── MODALS & FORMS ────────────────────────────────────────────────────────
  function setupModals() {
    document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.onclick = function () {
        var mId = this.getAttribute('data-close-modal');
        closeModal(mId);
      };
    });

    var openPbBtn = document.getElementById('btnOpenCreatePrivateBatch');
    if (openPbBtn) {
      openPbBtn.onclick = function () { openModal('modalCreatePrivateBatch'); };
    }

    var openCiBtn = document.getElementById('btnOpenCreateCoaching');
    if (openCiBtn) {
      openCiBtn.onclick = function () { openModal('modalCreateCoaching'); };
    }

    var openJoinBtn = document.getElementById('btnOpenJoinCoaching');
    if (openJoinBtn) {
      openJoinBtn.onclick = function () {
        var code = prompt('Enter 6-character coaching institute invite code (e.g. STLR10, APEX99, ZEN77):');
        if (code) {
          showToast('Linked to coaching with code: ' + code.toUpperCase(), 'success');
        }
      };
    }

    var openInviteBtn = document.getElementById('btnOpenInviteTeacher');
    if (openInviteBtn) {
      openInviteBtn.onclick = function () { openModal('modalInviteTeacher'); };
    }

    // Add Chapter / Topic to Curriculum Modal Opener
    var openAddChBtn = document.getElementById('btnOpenAddChapterModal');
    if (openAddChBtn) {
      openAddChBtn.onclick = function () {
        var inpDate = document.getElementById('inpSylPlannedDate');
        if (inpDate) inpDate.value = new Date().toISOString().slice(0, 10);
        openModal('modalAddCurriculumTopic');
      };
    }

    // Schedule New Test Modal Opener
    var openSchedTestBtn = document.getElementById('btnOpenScheduleTestModal');
    if (openSchedTestBtn) {
      openSchedTestBtn.onclick = function () {
        var inpTDate = document.getElementById('inpTestDate');
        if (inpTDate) inpTDate.value = new Date().toISOString().slice(0, 10);
        openModal('modalScheduleNewTest');
      };
    }

    // Add Student to Batch Modal
    var openAddStudentBtn = document.getElementById('btnOpenAddStudentToBatch');
    if (openAddStudentBtn) {
      openAddStudentBtn.onclick = function () {
        openAddStudentModal();
      };
    }

    // Modal Tab Switching inside Add Student Modal
    document.querySelectorAll('[data-student-modal-tab]').forEach(function (tabBtn) {
      tabBtn.onclick = function () {
        var target = this.getAttribute('data-student-modal-tab');
        document.querySelectorAll('[data-student-modal-tab]').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        var secInvite = document.getElementById('modalSecInviteLink');
        var secManual = document.getElementById('modalSecManualAdd');
        if (target === 'invite_link') {
          if (secInvite) secInvite.style.display = 'block';
          if (secManual) secManual.style.display = 'none';
        } else {
          if (secInvite) secInvite.style.display = 'none';
          if (secManual) secManual.style.display = 'block';
        }
      };
    });

    // Copy Invite Link
    var btnCopyLink = document.getElementById('btnCopyBatchInviteLink');
    if (btnCopyLink) {
      btnCopyLink.onclick = function () {
        var inp = document.getElementById('inpBatchInviteLink');
        if (!inp) return;
        copyTextToClipboard(inp.value);
        btnCopyLink.textContent = '✓ Copied!';
        showToast('Batch invite link copied to clipboard!', 'success');
        setTimeout(function () { btnCopyLink.textContent = '📋 Copy Link'; }, 2000);
      };
    }

    // Copy Join Code
    var btnCopyCode = document.getElementById('btnCopyBatchJoinCode');
    if (btnCopyCode) {
      btnCopyCode.onclick = function () {
        var disp = document.getElementById('dispBatchJoinCode');
        if (!disp) return;
        copyTextToClipboard(disp.textContent.trim());
        btnCopyCode.textContent = '✓ Copied!';
        showToast('Batch join code copied to clipboard!', 'success');
        setTimeout(function () { btnCopyCode.textContent = '📋 Copy Join Code'; }, 2000);
      };
    }

    // Simulate Student Joining via Invite Link
    var btnSimJoin = document.getElementById('btnSimulateStudentJoinLink');
    if (btnSimJoin) {
      btnSimJoin.onclick = function () {
        var deckData = getActiveDeckData();
        if (!deckData) return;

        var mockJoiners = [
          { name: 'Ishita Sengupta', father: 'Anirban Sengupta', fPhone: '+91 98301 22334', mother: 'Nandita Sengupta', mPhone: '+91 98301 55667' },
          { name: 'Devansh Roy', father: 'Subhash Roy', fPhone: '+91 98311 44556', mother: 'Aparna Roy', mPhone: '+91 98311 99887' },
          { name: 'Pooja Banerjee', father: 'Souvik Banerjee', fPhone: '+91 98322 11223', mother: 'Mousumi Banerjee', mPhone: '+91 98322 33445' },
          { name: 'Aniket Mukherjee', father: 'Debashis Mukherjee', fPhone: '+91 98303 66778', mother: 'Sharmila Mukherjee', mPhone: '+91 98303 77889' },
          { name: 'Siddharth Varma', father: 'Harish Varma', fPhone: '+91 98304 88990', mother: 'Geeta Varma', mPhone: '+91 98304 99001' },
          { name: 'Kavya Nair', father: 'Rajan Nair', fPhone: '+91 98450 11223', mother: 'Lakshmi Nair', mPhone: '+91 98450 33445' }
        ];

        // Find one not currently in STATE.students
        var candidate = mockJoiners.find(function (m) {
          return !(STATE.students || []).some(function (s) { return s.name.toLowerCase() === m.name.toLowerCase(); });
        });

        if (!candidate) {
          var randIdx = Math.floor(Math.random() * 900) + 100;
          candidate = {
            name: 'New Scholar #' + randIdx,
            father: 'Guardian ' + randIdx,
            fPhone: '+91 98399 ' + randIdx + '11',
            mother: 'Parent ' + randIdx,
            mPhone: '+91 98399 ' + randIdx + '22'
          };
        }

        var maxRollNum = 100;
        (STATE.students || []).forEach(function (s) {
          if (s.roll) {
            var match = s.roll.match(/\d+/);
            if (match) {
              var num = parseInt(match[0], 10);
              if (num > maxRollNum) maxRollNum = num;
            }
          }
        });
        var newRoll = 'SA-' + (maxRollNum + 1);

        var newStudentId = 'student-link-' + Date.now();
        var initials = candidate.name.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
        var avatarColors = ['#800020', '#D97706', '#059669', '#0284C7', '#7C3AED', '#DC2626'];
        var randomBg = avatarColors[Math.floor(Math.random() * avatarColors.length)];

        var newStudentObj = {
          id: newStudentId,
          name: candidate.name,
          roll: newRoll,
          grade: deckData.rawObj.grade || deckData.rawObj.class_name || 'Class 10',
          board: deckData.rawObj.board || 'CBSE',
          phone: candidate.fPhone,
          father_name: candidate.father,
          father_phone: candidate.fPhone,
          father_phone_verified: true,
          mother_name: candidate.mother,
          mother_phone: candidate.mPhone,
          mother_phone_verified: true,
          guardian_name: '—',
          guardian_phone: '',
          guardian_phone_verified: false,
          points: 500,
          streak: 1,
          attendance_rate: 100.0,
          fee_status: 'paid',
          avatar_initials: initials,
          avatar_bg: randomBg
        };

        STATE.students.push(newStudentObj);

        // Enroll into current batch/section
        if (activeDeckContext.type === 'private_batch') {
          var pbatch = (STATE.private_batches || []).find(function (b) { return b.id === activeDeckContext.id; });
          if (pbatch) {
            if (!pbatch.student_ids) pbatch.student_ids = [];
            pbatch.student_ids.unshift(newStudentId);
            pbatch.enrolled_count = pbatch.student_ids.length;
          }
        } else {
          var inst = (STATE.coaching_institutes || []).find(function (i) { return i.id === activeDeckContext.parentCoachingId; });
          if (inst) {
            var sec = (inst.classes_sections || []).find(function (s) { return s.id === activeDeckContext.id; });
            if (sec) {
              if (!sec.student_ids) sec.student_ids = [];
              sec.student_ids.unshift(newStudentId);
              sec.enrolled_count = sec.student_ids.length;
            }
          }
        }

        saveState();
        closeModal('modalAddStudentToBatch');

        // Refresh deck view immediately
        var updatedDeck = getActiveDeckData();
        var countEl = document.getElementById('deckStudentCountPill');
        if (countEl) countEl.textContent = updatedDeck.studentIds.length;
        renderDeckStudentsRoster(updatedDeck);
        renderDeckAttendance(updatedDeck);
        renderDeckPoints(updatedDeck);
        renderDeckFees(updatedDeck);

        showToast('🎉 ' + candidate.name + ' (' + newRoll + ') joined ' + deckData.title + ' via Invite Link!', 'success');
      };
    }
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  function openAddStudentModal() {
    var deckData = getActiveDeckData();
    if (!deckData) return;

    // Header Title & Subtitle
    var titleEl = document.getElementById('modalAddStudentTitle');
    if (titleEl) titleEl.textContent = '+ Add Student to ' + deckData.title;

    var subEl = document.getElementById('modalAddStudentSubtitle');
    if (subEl) subEl.textContent = 'Enrolling into ' + deckData.gradeText;

    // Derive or retrieve stable Join Code
    var joinCode = '';
    if (deckData.isPrivate) {
      var pbatch = deckData.rawObj;
      if (!pbatch.join_code) {
        var gradeInitial = (pbatch.grade || 'C10').replace(/[^0-9]/g, '') || '10';
        pbatch.join_code = 'VLR-M' + gradeInitial + '-' + (Math.floor(1000 + Math.random() * 9000));
        saveState();
      }
      joinCode = pbatch.join_code;
    } else {
      var sec = deckData.rawObj;
      var inst = (STATE.coaching_institutes || []).find(function (i) { return i.id === activeDeckContext.parentCoachingId; });
      var instCode = inst ? (inst.code || 'COACH') : 'COACH';
      joinCode = instCode + '-' + (sec.section_name || sec.class_name || 'SEC').replace(/[^a-zA-Z0-9]/g, '').slice(-3).toUpperCase();
    }

    var dispCodeEl = document.getElementById('dispBatchJoinCode');
    if (dispCodeEl) dispCodeEl.textContent = joinCode;

    // Shareable Link
    var inviteLink = 'https://study.vilarci.in/join?batch=' + encodeURIComponent(activeDeckContext.id) + '&code=' + encodeURIComponent(joinCode);
    var inpLink = document.getElementById('inpBatchInviteLink');
    if (inpLink) inpLink.value = inviteLink;

    // WhatsApp Share Link
    var waBtn = document.getElementById('btnWhatsappShareBatchLink');
    if (waBtn) {
      var waText = '🎓 *Invitation to join ' + deckData.title + '* on Vilarci Study!\n\n' +
                   '👉 Tap this link to enroll directly:\n' + inviteLink + '\n\n' +
                   '🔑 Batch Join Code: *' + joinCode + '*';
      waBtn.href = 'https://wa.me/?text=' + encodeURIComponent(waText);
    }

    // Auto-suggest next roll number (SA-XXX)
    var maxRollNum = 100;
    (STATE.students || []).forEach(function (s) {
      if (s.roll) {
        var match = s.roll.match(/\d+/);
        if (match) {
          var num = parseInt(match[0], 10);
          if (num > maxRollNum) maxRollNum = num;
        }
      }
    });
    var nextRoll = 'SA-' + (maxRollNum + 1);
    var rollInput = document.getElementById('inpNewStudentRoll');
    if (rollInput) rollInput.value = nextRoll;

    var gradeInput = document.getElementById('inpNewStudentGrade');
    if (gradeInput) gradeInput.value = deckData.rawObj.grade || deckData.rawObj.class_name || 'Class 10';

    var boardSelect = document.getElementById('inpNewStudentBoard');
    if (boardSelect) {
      var bVal = (deckData.rawObj.board || 'CBSE').includes('ICSE') ? 'ICSE' : 'CBSE';
      boardSelect.value = bVal;
    }

    // Reset manual registration inputs
    var nameInput = document.getElementById('inpNewStudentName');
    if (nameInput) nameInput.value = '';
    var fName = document.getElementById('inpNewStudentFatherName');
    if (fName) fName.value = '';
    var fPhone = document.getElementById('inpNewStudentFatherPhone');
    if (fPhone) fPhone.value = '';
    var mName = document.getElementById('inpNewStudentMotherName');
    if (mName) mName.value = '';
    var mPhone = document.getElementById('inpNewStudentMotherPhone');
    if (mPhone) mPhone.value = '';
    var gName = document.getElementById('inpNewStudentGuardianName');
    if (gName) gName.value = '';
    var gPhone = document.getElementById('inpNewStudentGuardianPhone');
    if (gPhone) gPhone.value = '';

    // Switch to Invite Link tab by default
    var tabInvite = document.getElementById('tabBtnStudentInviteLink');
    if (tabInvite) tabInvite.click();

    openModal('modalAddStudentToBatch');
  }

  function openModal(id) {
    var modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeModal(id) {
    var modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  function openRenameBatchModal(batchId) {
    var pbatch = (STATE.private_batches || []).find(function (b) { return b.id === batchId; });
    if (!pbatch) return;

    var newName = prompt('Rename Batch:', pbatch.name);
    if (newName && newName.trim() !== '') {
      pbatch.name = newName.trim();
      saveState();
      renderPrivateBatches('all');
      showToast('Batch renamed to: ' + pbatch.name, 'success');
    }
  }

  function setupFormHandlers() {
    // 1. Create Private Batch
    var formCreatePb = document.getElementById('formCreatePrivateBatch');
    if (formCreatePb) {
      formCreatePb.onsubmit = function (e) {
        e.preventDefault();
        var newBatch = {
          id: 'pbatch-' + Date.now(),
          teacher_id: activeTeacherId,
          name: document.getElementById('inpNewBatchName').value,
          grade: document.getElementById('inpNewBatchGrade').value,
          board: document.getElementById('inpNewBatchBoard').value,
          subject: document.getElementById('inpNewBatchSubject').value,
          room: 'Home Studio Suite',
          schedule: document.getElementById('inpNewBatchSchedule').value,
          monthly_fee: parseInt(document.getElementById('inpNewBatchFee').value, 10),
          capacity: parseInt(document.getElementById('inpNewBatchCapacity').value, 10),
          enrolled_count: 0,
          created_date: new Date().toISOString().slice(0, 10),
          student_ids: ['student-1', 'student-ext-1']
        };

        STATE.private_batches.push(newBatch);
        saveState();
        closeModal('modalCreatePrivateBatch');
        formCreatePb.reset();
        updateTeacherNavProfile();
        renderPrivateBatches('all');
        showToast('Created new private batch: ' + newBatch.name, 'success');
      };
    }

    // 2. Create Coaching Institute
    var formCreateCoaching = document.getElementById('formCreateCoaching');
    if (formCreateCoaching) {
      formCreateCoaching.onsubmit = function (e) {
        e.preventDefault();
        var newInst = {
          id: 'inst-' + Date.now(),
          name: document.getElementById('inpNewInstName').value,
          tagline: document.getElementById('inpNewInstTagline').value,
          code: document.getElementById('inpNewInstCode').value.toUpperCase(),
          logo_text: document.getElementById('inpNewInstName').value.substring(0, 2).toUpperCase(),
          theme_color: '#800020',
          address: document.getElementById('inpNewInstAddress').value,
          phone: '+91 98765 43210',
          email: 'admin@coaching.edu.in',
          established: 2026,
          owner_teacher_id: activeTeacherId,
          user_role_in_institute: 'Director & Owner',
          user_permissions: {
            can_manage_members: true,
            can_create_sections: true,
            can_manage_fees: true,
            can_issue_marksheets: true
          },
          members: [
            {
              teacher_id: activeTeacherId,
              role: 'Director & Head of Mathematics',
              permission_level: 'Owner / Full Admin',
              assigned_subjects: ['Mathematics'],
              joined_date: 'Oct 2026',
              assigned_sections: ['Class 10-A']
            }
          ],
          classes_sections: [
            {
              id: 'sec-' + Date.now(),
              class_name: 'Class 10',
              section_name: 'Section A',
              full_code: 'Class 10-A',
              board: 'CBSE',
              room: 'Hall 1',
              capacity: 30,
              enrolled_count: 12,
              subject_faculty_map: [
                { subject: 'Mathematics', teacher_id: activeTeacherId, lectures_per_week: 4, schedule: 'Mon, Wed, Fri' }
              ],
              student_ids: ['student-1', 'student-ext-1']
            }
          ]
        };

        STATE.coaching_institutes.push(newInst);
        saveState();
        closeModal('modalCreateCoaching');
        formCreateCoaching.reset();
        updateTeacherNavProfile();
        renderCoachingInstitutesList();
        showToast('Created coaching institute: ' + newInst.name, 'success');
      };
    }

    // 3. Invite Teacher to Coaching
    var formInviteTeacher = document.getElementById('formInviteTeacher');
    if (formInviteTeacher) {
      formInviteTeacher.onsubmit = function (e) {
        e.preventDefault();
        var inst = (STATE.coaching_institutes || []).find(function (i) { return i.id === activeCoachingId; });
        if (!inst) return;

        var teacherName = document.getElementById('inpInviteTeacherName').value;
        var role = document.getElementById('inpInviteTeacherRole').value;
        var subjects = document.getElementById('inpInviteTeacherSubjects').value.split(',').map(function (s) { return s.trim(); });

        var newMember = {
          teacher_id: 't-inv-' + Date.now(),
          role: role,
          permission_level: role.indexOf('Admin') !== -1 ? 'Co-Admin' : 'Subject Faculty',
          assigned_subjects: subjects,
          joined_date: 'Just now',
          assigned_sections: ['Class 10-A']
        };

        // Also add to global teachers list if not present
        STATE.teachers.push({
          id: newMember.teacher_id,
          name: teacherName,
          qualification: 'Invited Specialist',
          primary_subject: subjects[0] || 'Subject',
          phone: document.getElementById('inpInviteTeacherEmail').value,
          email: document.getElementById('inpInviteTeacherEmail').value,
          photo_initials: teacherName.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase(),
          avatar_bg: '#0284C7'
        });

        inst.members.push(newMember);
        saveState();
        closeModal('modalInviteTeacher');
        formInviteTeacher.reset();
        renderCoachingMembers(inst);
        showToast('Invited ' + teacherName + ' to ' + inst.name + ' as ' + role, 'success');
      };
    }

    // 4. Manual Direct Add Student to Current Batch Form
    var formManualAdd = document.getElementById('formManualAddStudent');
    if (formManualAdd) {
      formManualAdd.onsubmit = function (e) {
        e.preventDefault();
        var deckData = getActiveDeckData();
        if (!deckData) return;

        var name = document.getElementById('inpNewStudentName').value.trim();
        var roll = document.getElementById('inpNewStudentRoll').value.trim();
        var grade = document.getElementById('inpNewStudentGrade').value.trim();
        var board = document.getElementById('inpNewStudentBoard').value;
        var fName = document.getElementById('inpNewStudentFatherName').value.trim();
        var fPhone = document.getElementById('inpNewStudentFatherPhone').value.trim();
        var mName = document.getElementById('inpNewStudentMotherName').value.trim();
        var mPhone = document.getElementById('inpNewStudentMotherPhone').value.trim();
        var gName = document.getElementById('inpNewStudentGuardianName').value.trim() || '—';
        var gPhone = document.getElementById('inpNewStudentGuardianPhone').value.trim() || '';
        var feeStatus = document.getElementById('inpNewStudentFeeStatus').value;
        var points = parseInt(document.getElementById('inpNewStudentPoints').value, 10) || 500;

        var studentId = 'student-manual-' + Date.now();
        var initials = name.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
        var avatarColors = ['#800020', '#D97706', '#059669', '#0284C7', '#7C3AED', '#DC2626'];
        var randomBg = avatarColors[Math.floor(Math.random() * avatarColors.length)];

        var newStudent = {
          id: studentId,
          name: name,
          roll: roll,
          grade: grade,
          board: board,
          phone: fPhone,
          father_name: fName,
          father_phone: fPhone,
          father_phone_verified: true,
          mother_name: mName,
          mother_phone: mPhone,
          mother_phone_verified: true,
          guardian_name: gName,
          guardian_phone: gPhone,
          guardian_phone_verified: !!gPhone,
          points: points,
          streak: 1,
          attendance_rate: 100.0,
          fee_status: feeStatus,
          avatar_initials: initials,
          avatar_bg: randomBg
        };

        STATE.students.push(newStudent);

        // Add to active batch / coaching section
        if (activeDeckContext.type === 'private_batch') {
          var pbatch = (STATE.private_batches || []).find(function (b) { return b.id === activeDeckContext.id; });
          if (pbatch) {
            if (!pbatch.student_ids) pbatch.student_ids = [];
            pbatch.student_ids.unshift(studentId);
            pbatch.enrolled_count = pbatch.student_ids.length;
          }
        } else {
          var inst = (STATE.coaching_institutes || []).find(function (i) { return i.id === activeDeckContext.parentCoachingId; });
          if (inst) {
            var sec = (inst.classes_sections || []).find(function (s) { return s.id === activeDeckContext.id; });
            if (sec) {
              if (!sec.student_ids) sec.student_ids = [];
              sec.student_ids.unshift(studentId);
              sec.enrolled_count = sec.student_ids.length;
            }
          }
        }

        saveState();
        closeModal('modalAddStudentToBatch');
        formManualAdd.reset();

        // Refresh batch deck views
        var updatedDeck = getActiveDeckData();
        var countEl = document.getElementById('deckStudentCountPill');
        if (countEl) countEl.textContent = updatedDeck.studentIds.length;
        renderDeckStudentsRoster(updatedDeck);
        renderDeckAttendance(updatedDeck);
        renderDeckPoints(updatedDeck);
        renderDeckFees(updatedDeck);

        showToast('🎉 Enrolled ' + name + ' (' + roll + ') in ' + deckData.title + '!', 'success');
      };
    }

    // 5. Add Curriculum Chapter / Topic Form
    var formAddCurriculum = document.getElementById('formAddCurriculumTopic');
    if (formAddCurriculum) {
      formAddCurriculum.onsubmit = function (e) {
        e.preventDefault();
        var deckData = getActiveDeckData();
        if (!deckData) return;

        var chNum = parseInt(document.getElementById('inpSylChapterNum').value, 10) || 1;
        var chName = document.getElementById('inpSylChapterName').value.trim();
        var topicName = document.getElementById('inpSylTopicName').value.trim();
        var plannedDate = document.getElementById('inpSylPlannedDate').value;
        var status = document.getElementById('inpSylStatus').value;

        var actualDate = status === 'covered' ? new Date().toISOString().slice(0, 10) : null;
        var varianceStatus = 'on_schedule';
        var varianceText = '🎯 Target: ' + plannedDate;
        if (status === 'covered') {
          varianceStatus = 'completed';
          varianceText = '✅ Completed (Reality)';
        } else if (status === 'in_progress') {
          varianceStatus = 'in_progress';
          varianceText = '⏳ In Progress';
        } else {
          varianceStatus = 'upcoming';
          varianceText = '📅 Upcoming (Planned: ' + plannedDate + ')';
        }

        var newTopic = {
          id: 'syl-' + Date.now(),
          context_id: activeDeckContext.id,
          subject: deckData.subject || 'Mathematics',
          chapter_number: chNum,
          chapter_name: chName,
          topic_name: topicName,
          planned_target_date: plannedDate,
          actual_completion_date: actualDate,
          variance_status: varianceStatus,
          variance_text: varianceText,
          status: status,
          revised_count: 0
        };

        if (!STATE.syllabus_topics) STATE.syllabus_topics = [];
        STATE.syllabus_topics.push(newTopic);
        saveState();
        closeModal('modalAddCurriculumTopic');
        formAddCurriculum.reset();
        renderDeckSyllabus(deckData);
        showToast('Added Chapter ' + chNum + ': ' + chName + ' to curriculum!', 'success');
      };
    }

    // 6. Schedule New Test Exam Form
    var formScheduleTest = document.getElementById('formScheduleNewTest');
    if (formScheduleTest) {
      formScheduleTest.onsubmit = function (e) {
        e.preventDefault();
        var deckData = getActiveDeckData();
        if (!deckData) return;

        var title = document.getElementById('inpTestTitle').value.trim();
        var subject = document.getElementById('inpTestSubject').value.trim();
        var date = document.getElementById('inpTestDate').value || new Date().toISOString().slice(0, 10);
        var maxMarks = parseInt(document.getElementById('inpTestMaxMarks').value, 10) || 50;

        var newTestId = 'test-' + Date.now();
        var enrolledSubmissions = (deckData.studentIds || []).map(function (sId, idx) {
          var st = (STATE.students || []).find(function (s) { return s.id === sId; });
          return {
            student_id: sId,
            name: st ? st.name : 'Student',
            roll: st ? st.roll : ('SA-' + (100 + idx)),
            marks: null,
            rank: null,
            status: 'pending',
            weak_topics: 'To be evaluated'
          };
        });

        var newTest = {
          id: newTestId,
          context_id: activeDeckContext.id,
          title: title,
          subject: subject,
          max_marks: maxMarks,
          conducted_date: date,
          class_average: 0,
          highest_score: null,
          lowest_score: null,
          pass_rate: 0,
          submissions: enrolledSubmissions
        };

        if (!STATE.tests) STATE.tests = [];
        STATE.tests.unshift(newTest);
        activeTestId = newTestId;

        saveState();
        closeModal('modalScheduleNewTest');
        formScheduleTest.reset();
        renderDeckTests(deckData);
        showToast('Scheduled Test: ' + title + ' (' + maxMarks + ' Marks)!', 'success');
      };
    }

    // 7. Record Tuition Fee Payment Form
    var formRecordPay = document.getElementById('formRecordPayment');
    if (formRecordPay) {
      formRecordPay.onsubmit = function (e) {
        e.preventDefault();
        var sId = document.getElementById('payStudentId').value;
        var mKey = document.getElementById('payMonthKey').value;
        var amt = parseInt(document.getElementById('payAmountInput').value, 10) || 2500;
        var pDate = document.getElementById('payDateInput').value || new Date().toISOString().slice(0, 10);
        var pMode = document.getElementById('payModeSelect').value;
        var pRef = document.getElementById('payRefInput').value.trim() || ('REC-' + sId.slice(-4) + '-' + mKey.replace('-', ''));

        var student = (STATE.students || []).find(function (s) { return s.id === sId; });
        if (!student) return;

        if (!student.fee_ledger) student.fee_ledger = {};
        student.fee_ledger[mKey] = {
          status: 'paid',
          amount: amt,
          paid_date: pDate,
          payment_mode: pMode,
          receipt_ref: pRef
        };

        // If current month is paid, update student fee_status
        if (mKey === '2026-10') {
          student.fee_status = 'paid';
        }

        saveState();
        closeModal('modalRecordPayment');
        var deckData = getActiveDeckData();
        if (deckData) {
          renderDeckFees(deckData);
        }
        showToast('Recorded payment of ₹' + amt.toLocaleString() + ' for ' + student.name + ' (' + formatMonthName(mKey) + ')!', 'success');
      };
    }

    // 8. Configure Student Fee Structure Form
    var formCfgStudentFee = document.getElementById('formConfigureStudentFee');
    if (formCfgStudentFee) {
      formCfgStudentFee.onsubmit = function (e) {
        e.preventDefault();
        var sId = document.getElementById('cfgFeeStudentId').value;
        var newAmt = parseInt(document.getElementById('cfgFeeAmountInput').value, 10) || 2500;
        var startM = document.getElementById('cfgFeeStartMonth').value;
        var endM = document.getElementById('cfgFeeEndMonth').value;

        var student = (STATE.students || []).find(function (s) { return s.id === sId; });
        if (!student) return;

        student.custom_monthly_fee = newAmt;
        student.admission_start_month = startM;
        student.course_end_month = endM;

        if (student.fee_ledger) {
          Object.keys(student.fee_ledger).forEach(function (m) {
            if (student.fee_ledger[m].status !== 'paid') {
              student.fee_ledger[m].amount = newAmt;
            }
          });
        }

        saveState();
        closeModal('modalConfigureStudentFee');
        var deckData = getActiveDeckData();
        if (deckData) {
          renderDeckFees(deckData);
        }
        showToast('Updated fee structure for ' + student.name + ': ₹' + newAmt.toLocaleString() + '/mo', 'success');
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

  function showToast(msg, type) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed; bottom:24px; right:24px; background:#0f172a; color:#fff; padding:12px 20px; border-radius:10px; font-size:13px; font-weight:700; z-index:99999; box-shadow:0 12px 30px rgba(0,0,0,0.25); display:flex; align-items:center; gap:8px; border-left:4px solid ' + (type === 'success' ? '#059669' : '#800020') + ';';
    toast.innerHTML = (type === 'success' ? '✓ ' : 'ℹ️ ') + msg;
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
