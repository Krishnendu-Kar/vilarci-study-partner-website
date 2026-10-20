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
            '<button type="button" class="btn btn-outline btn-sm btn-rename-batch" data-rename-pbatch-id="' + b.id + '" title="Rename or edit batch">✏️ Rename</button>' +
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
  function enterBatchDeck(type, id, parentCoachingId) {
    activeDeckContext = {
      type: type, // 'private_batch' or 'coaching_section'
      id: id,
      parentCoachingId: parentCoachingId
    };

    renderCurrentWorkspace();
  }

  function getActiveDeckData() {
    if (!activeDeckContext) return null;

    if (activeDeckContext.type === 'private_batch') {
      var pbatch = (STATE.private_batches || []).find(function (b) { return b.id === activeDeckContext.id; });
      if (!pbatch) return null;
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

    // Header values
    var titleEl = document.getElementById('deckTitleDisplay');
    if (titleEl) titleEl.textContent = deckData.title;

    var badgeEl = document.getElementById('deckContextBadge');
    if (badgeEl) badgeEl.textContent = deckData.badgeText;

    var gradeEl = document.getElementById('deckGradeBadge');
    if (gradeEl) gradeEl.textContent = deckData.gradeText;

    var metaEl = document.getElementById('deckMetaDisplay');
    if (metaEl) metaEl.textContent = deckData.metaText;

    var countEl = document.getElementById('deckStudentCountPill');
    if (countEl) countEl.textContent = deckData.studentIds.length;

    // Breadcrumb
    if (deckData.isPrivate) {
      updateBreadcrumb(['Workspace', 'My Private Batches', deckData.title]);
    } else {
      updateBreadcrumb(['Workspace', 'Coaching Institutes', deckData.title]);
    }

    // Exit Button
    var exitBtn = document.getElementById('btnExitBatchDeck');
    if (exitBtn) {
      exitBtn.onclick = function () {
        activeDeckContext = null;
        renderCurrentWorkspace();
      };
    }

    // Setup sub tabs
    setupDeckSubTabs('students');
  }

  function setupDeckSubTabs(initialTab) {
    var tabs = document.querySelectorAll('#batchDeckNavTabs .deck-tab-btn');
    tabs.forEach(function (tab) {
      tab.onclick = function () {
        var tabId = this.getAttribute('data-deck-tab');
        switchDeckSubTab(tabId);
      };
    });
    switchDeckSubTab(initialTab || 'students');
  }

  function switchDeckSubTab(tabId) {
    var tabs = document.querySelectorAll('#batchDeckNavTabs .deck-tab-btn');
    tabs.forEach(function (t) {
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

  // ─── DECK SUB-TAB 1: STUDENTS ROSTER ───────────────────────────────────────
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
            '<button type="button" class="btn btn-outline btn-sm btn-deck-award-single" data-student-id="' + s.id + '">🏅 Award Points</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('.btn-deck-award-single').forEach(function (btn) {
      btn.onclick = function () {
        var sId = this.getAttribute('data-student-id');
        switchDeckSubTab('points');
        var select = document.getElementById('deckAwardStudentSelect');
        if (select) select.value = sId;
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

  // ─── DECK SUB-TAB 4: TESTS & MARKS ─────────────────────────────────────────
  function renderDeckTests(deckData) {
    var container = document.getElementById('deckTestsContainer');
    if (!container) return;

    var tests = (STATE.tests || []).filter(function (t) { return t.context_id === activeDeckContext.id; });
    if (tests.length === 0) {
      container.innerHTML = '<div class="card p-24 text-center text-muted">No tests scheduled yet for this batch. Click "+ Schedule New Test" above.</div>';
      return;
    }

    container.innerHTML = tests.map(function (t) {
      return (
        '<div class="card">' +
          '<div class="card-header">' +
            '<div>' +
              '<h3 class="card-title">' + t.title + '</h3>' +
              '<span class="card-subtitle">Conducted: ' + t.conducted_date + ' &bull; Max Marks: ' + t.max_marks + ' &bull; Class Avg: ' + t.class_average + '</span>' +
            '</div>' +
            '<span class="badge badge-success">High Score: ' + t.highest_score + ' / ' + t.max_marks + '</span>' +
          '</div>' +
          '<div class="card-body" style="padding:0;">' +
            '<div class="table-responsive">' +
              '<table class="data-table">' +
                '<thead><tr><th>Rank</th><th>Student Name</th><th>Marks Obtained</th><th>Percentage</th></tr></thead>' +
                '<tbody>' +
                  (t.submissions || []).map(function (s) {
                    var pct = Math.round((s.marks / t.max_marks) * 100);
                    return '<tr><td>#' + s.rank + '</td><td><strong>' + s.name + '</strong></td><td><strong>' + s.marks + ' / ' + t.max_marks + '</strong></td><td>' + pct + '%</td></tr>';
                  }).join('') +
                '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  // ─── DECK SUB-TAB 5: CURRICULUM TRACKER ─────────────────────────────────────
  function renderDeckSyllabus(deckData) {
    var tbody = document.getElementById('deckSyllabusTableBody');
    if (!tbody) return;

    var topics = (STATE.syllabus_topics || []).filter(function (tp) { return tp.context_id === activeDeckContext.id; });
    if (topics.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center p-20 text-muted">No syllabus topics registered for this batch.</td></tr>';
      return;
    }

    tbody.innerHTML = topics.map(function (tp) {
      var statusBadge = tp.status === 'covered' 
        ? '<span class="badge badge-success">✓ Covered</span>' 
        : (tp.status === 'in_progress' ? '<span class="badge badge-warning">In Progress</span>' : '<span class="badge badge-muted">Upcoming</span>');

      return (
        '<tr>' +
          '<td>Chapter ' + tp.chapter_number + ': <strong>' + tp.chapter_name + '</strong></td>' +
          '<td>' + tp.topic_name + '</td>' +
          '<td>' + statusBadge + '</td>' +
          '<td><strong>' + tp.revised_count + '</strong> students revised</td>' +
          '<td><button type="button" class="btn btn-outline btn-sm btn-cycle-syl" data-syl-id="' + tp.id + '">Toggle Status</button></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('.btn-cycle-syl').forEach(function (btn) {
      btn.onclick = function () {
        var sId = this.getAttribute('data-syl-id');
        var item = (STATE.syllabus_topics || []).find(function (t) { return t.id === sId; });
        if (item) {
          item.status = item.status === 'covered' ? 'in_progress' : (item.status === 'in_progress' ? 'upcoming' : 'covered');
          saveState();
          renderDeckSyllabus(deckData);
          showToast('Updated status for: ' + item.topic_name, 'info');
        }
      };
    });
  }

  // ─── DECK SUB-TAB 6: TUITION FEES ──────────────────────────────────────────
  function renderDeckFees(deckData) {
    var tbody = document.getElementById('deckFeesTableBody');
    if (!tbody) return;

    var invoices = (STATE.invoices || []).filter(function (i) { return i.context_id === activeDeckContext.id; });
    if (invoices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center p-20 text-muted">No fee records found for this batch.</td></tr>';
      return;
    }

    tbody.innerHTML = invoices.map(function (inv) {
      var badge = inv.status === 'paid' 
        ? '<span class="badge badge-success">PAID</span>' 
        : (inv.status === 'pending' ? '<span class="badge badge-warning">PENDING</span>' : '<span class="badge badge-danger">OVERDUE</span>');

      return (
        '<tr>' +
          '<td><span class="font-mono text-xs font-bold">' + inv.invoice_no + '</span></td>' +
          '<td><strong>' + inv.student_name + '</strong></td>' +
          '<td>' + inv.parent_phone + '</td>' +
          '<td><strong>₹' + inv.amount.toLocaleString() + '</strong></td>' +
          '<td>' + badge + '</td>' +
          '<td>' +
            (inv.status === 'paid' 
              ? '<span class="text-xs text-muted">Receipt Ref: ' + (inv.receipt_ref || 'REC-PAID') + '</span>' 
              : '<button type="button" class="btn btn-primary btn-sm btn-record-fee-paid" data-inv-id="' + inv.id + '">Record Paid</button>') +
          '</td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('.btn-record-fee-paid').forEach(function (btn) {
      btn.onclick = function () {
        var invId = this.getAttribute('data-inv-id');
        var inv = (STATE.invoices || []).find(function (i) { return i.id === invId; });
        if (inv) {
          inv.status = 'paid';
          inv.payment_mode = 'Cash / Offline Desk';
          inv.paid_date = new Date().toISOString().slice(0, 10);
          inv.receipt_ref = 'REC-' + Date.now().toString().slice(-6);
          saveState();
          renderDeckFees(deckData);
          showToast('Payment recorded for ' + inv.student_name, 'success');
        }
      };
    });
  }

  // ─── DECK SUB-TAB 7: BATCH SETTINGS (RENAME) ───────────────────────────────
  function renderDeckSettings(deckData) {
    var nameInput = document.getElementById('deckRenameBatchNameInput');
    if (nameInput) nameInput.value = deckData.title;

    var form = document.getElementById('formDeckRenameBatch');
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var newName = nameInput.value.trim();
        if (deckData.isPrivate) {
          var pbatch = (STATE.private_batches || []).find(function (b) { return b.id === activeDeckContext.id; });
          if (pbatch) {
            pbatch.name = newName;
            saveState();
            renderBatchDeck();
            showToast('Batch successfully renamed to: ' + newName, 'success');
          }
        } else {
          showToast('Section name saved.', 'success');
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
