// js/data.js — Vilarci Study Partner (Teacher & Coaching Institute Portal)
// Relational dataset supporting:
// 1. Dual Operator Modes: Multi-Teacher Coaching Institutes & Independent Solo Tuition Teachers
// 2. Subject-wise Teacher Assignments across Batches
// 3. Student Rosters, Attendance Records, Syllabus Tracking, Test Evaluations, Fee Invoices & Academic Points

window.PARTNER_DATA = {

  // ─── 1. OPERATORS (Coaching Institutes & Independent Tuition Teachers) ───────
  operators: [
    {
      id: 'op-stellar',
      type: 'coaching_institute',
      name: 'Stellar Academy',
      tagline: 'Master Concepts. Excel in Board & Competitive Science & Maths.',
      director_name: 'Er. Alok Sharma (Ex-IIT Delhi)',
      code: 'STLR10',
      logo_text: 'SA',
      theme_color: '#800020',
      phone: '+91 98765 43210',
      email: 'admin@stellaracademy.edu.in',
      address: '42, Orbit Lane, Science Nagar, Pune – 411021',
      established: 2018,
      teachers_count: 5,
      total_students: 84,
      active_batches_count: 4,
      teachers: ['teach-1', 'teach-2', 'teach-3'],
      bank_upi: 'stellaracademy@okhdfcbank'
    },
    {
      id: 'op-apex',
      type: 'independent_teacher',
      name: 'Apex Chemistry (Dr. Rashmi Verma)',
      tagline: 'Organic, Inorganic & Physical Chemistry Mastery for Boards & NEET.',
      director_name: 'Dr. Rashmi Verma (PhD Chemistry)',
      code: 'APEX99',
      logo_text: 'AC',
      theme_color: '#0284C7',
      phone: '+91 98220 12345',
      email: 'verma.chem@apexchem.in',
      address: 'Shop 12, Crystal Heights, FC Road, Pune – 411005',
      established: 2019,
      teachers_count: 1,
      total_students: 42,
      active_batches_count: 2,
      teachers: ['teach-4'],
      bank_upi: 'dr.rashmi.chem@oksbi'
    },
    {
      id: 'op-zenith',
      type: 'independent_teacher',
      name: 'Zenith Biology (Prof. Arindam Sen)',
      tagline: 'Cell Biology, Genetics & Human Physiology Conceptual Immersion.',
      director_name: 'Prof. Arindam Sen (M.Sc, Gold Medalist)',
      code: 'ZEN77',
      logo_text: 'ZB',
      theme_color: '#059669',
      phone: '+91 97330 54321',
      email: 'arindam.bio@zenithtuitions.com',
      address: 'Green Meadows Wing B, Kothrud, Pune – 411038',
      established: 2020,
      teachers_count: 1,
      total_students: 36,
      active_batches_count: 2,
      teachers: ['teach-5'],
      bank_upi: 'arindam.bio@icici'
    },
    {
      id: 'op-horizon',
      type: 'independent_teacher',
      name: 'Horizon English Studio (Mrs. Kavita Roy)',
      tagline: 'Board English Core, Literature Analysis & Critical Writing.',
      director_name: 'Mrs. Kavita Roy (MA English Lit)',
      code: 'HORIZ5',
      logo_text: 'HE',
      theme_color: '#7C3AED',
      phone: '+91 98110 99887',
      email: 'kavita.roy@horizonstudio.org',
      address: '302, Knowledge Park, Camp, Pune – 411001',
      established: 2021,
      teachers_count: 1,
      total_students: 28,
      active_batches_count: 2,
      teachers: ['teach-6'],
      bank_upi: 'kavita.roy@paytm'
    }
  ],

  // ─── 2. FACULTY & TEACHERS ROSTER ──────────────────────────────────────────
  teachers: [
    {
      id: 'teach-1',
      operator_id: 'op-stellar',
      name: 'Er. Alok Sharma',
      role: 'Director & Head of Mathematics',
      qualification: 'B.Tech (IIT Delhi), 14 yrs exp',
      subjects: ['Mathematics', 'Advanced Problem Solving'],
      phone: '+91 98765 43211',
      email: 'alok.sharma@stellaracademy.edu.in',
      assigned_batches: ['batch-10-m', 'batch-10-e', 'batch-12-s30'],
      photo_initials: 'AS',
      is_head: true
    },
    {
      id: 'teach-2',
      operator_id: 'op-stellar',
      name: 'Dr. Meenakshi Soni',
      role: 'Senior Faculty - Physics',
      qualification: 'Ph.D Physics (IISc Bangalore), 10 yrs exp',
      subjects: ['Physics', 'Electrodynamics & Optics'],
      phone: '+91 98765 43212',
      email: 'meenakshi.soni@stellaracademy.edu.in',
      assigned_batches: ['batch-10-m', 'batch-10-e', 'batch-12-s30'],
      photo_initials: 'MS',
      is_head: false
    },
    {
      id: 'teach-3',
      operator_id: 'op-stellar',
      name: 'Prof. Vikramaditya Sen',
      role: 'Junior Faculty - Foundation Science & Lab',
      qualification: 'M.Sc Applied Sciences (Pune Univ), 6 yrs exp',
      subjects: ['Physics Lab', 'Maths Foundation'],
      phone: '+91 98765 43213',
      email: 'vikram.sen@stellaracademy.edu.in',
      assigned_batches: ['batch-10-m', 'batch-9-f'],
      photo_initials: 'VS',
      is_head: false
    },
    {
      id: 'teach-4',
      operator_id: 'op-apex',
      name: 'Dr. Rashmi Verma',
      role: 'Founder & Principal Chemistry Specialist',
      qualification: 'Ph.D Chemistry (CSIR-NET JRF), 12 yrs exp',
      subjects: ['Organic Chemistry', 'Physical Chemistry', 'Inorganic Chemistry'],
      phone: '+91 98220 12345',
      email: 'verma.chem@apexchem.in',
      assigned_batches: ['batch-apex-10', 'batch-apex-12'],
      photo_initials: 'RV',
      is_head: true
    },
    {
      id: 'teach-5',
      operator_id: 'op-zenith',
      name: 'Prof. Arindam Sen',
      role: 'Founder & Medical Biology Mentor',
      qualification: 'M.Sc Biology (Gold Medalist), 11 yrs exp',
      subjects: ['Cell Biology', 'Genetics', 'Human Physiology'],
      phone: '+91 97330 54321',
      email: 'arindam.bio@zenithtuitions.com',
      assigned_batches: ['batch-zen-med', 'batch-zen-10'],
      photo_initials: 'AS',
      is_head: true
    },
    {
      id: 'teach-6',
      operator_id: 'op-horizon',
      name: 'Mrs. Kavita Roy',
      role: 'Founder & Senior Humanities Faculty',
      qualification: 'M.A. English Literature (Delhi Univ), 15 yrs exp',
      subjects: ['English Core', 'Literature & Analytical Writing'],
      phone: '+91 98110 99887',
      email: 'kavita.roy@horizonstudio.org',
      assigned_batches: ['batch-hor-club', 'batch-hor-12'],
      photo_initials: 'KR',
      is_head: true
    }
  ],

  // ─── 3. BATCHES (Subject-wise & Grade-wise Classes) ─────────────────────────
  batches: [
    {
      id: 'batch-10-m',
      operator_id: 'op-stellar',
      name: 'Class 10 Science & Maths Morning',
      grade: 'Class 10',
      board: 'CBSE',
      room: 'Lecture Hall A-1',
      schedule: 'Mon, Wed, Fri • 07:30 AM – 09:30 AM',
      monthly_fee: 2500,
      capacity: 30,
      enrolled_count: 24,
      primary_subject: 'Maths & Physics',
      assigned_faculty: [
        { teacher_id: 'teach-1', subject: 'Mathematics', lectures_per_week: 3 },
        { teacher_id: 'teach-2', subject: 'Physics', lectures_per_week: 3 },
        { teacher_id: 'teach-3', subject: 'STEM Lab & Experiments', lectures_per_week: 1 }
      ],
      attendance_rate: 94.2,
      average_points: 1395
    },
    {
      id: 'batch-10-e',
      operator_id: 'op-stellar',
      name: 'Class 10 Science & Maths Evening',
      grade: 'Class 10',
      board: 'CBSE / ICSE',
      room: 'Lecture Hall A-2',
      schedule: 'Tue, Thu, Sat • 05:00 PM – 07:00 PM',
      monthly_fee: 2500,
      capacity: 25,
      enrolled_count: 20,
      primary_subject: 'Maths & Physics',
      assigned_faculty: [
        { teacher_id: 'teach-1', subject: 'Mathematics', lectures_per_week: 3 },
        { teacher_id: 'teach-2', subject: 'Physics', lectures_per_week: 3 }
      ],
      attendance_rate: 91.5,
      average_points: 1280
    },
    {
      id: 'batch-12-s30',
      operator_id: 'op-stellar',
      name: 'Class 12 Super 30 PCM',
      grade: 'Class 12',
      board: 'CBSE Science',
      room: 'Senior Seminar Room B',
      schedule: 'Daily • 06:00 PM – 08:30 PM',
      monthly_fee: 3500,
      capacity: 30,
      enrolled_count: 26,
      primary_subject: 'Advanced Maths & Physics',
      assigned_faculty: [
        { teacher_id: 'teach-1', subject: 'Calculus & Algebra', lectures_per_week: 4 },
        { teacher_id: 'teach-2', subject: 'Modern Physics & Electromagnetism', lectures_per_week: 4 }
      ],
      attendance_rate: 97.0,
      average_points: 1540
    },
    {
      id: 'batch-9-f',
      operator_id: 'op-stellar',
      name: 'Class 9 Foundation Olympiad',
      grade: 'Class 9',
      board: 'CBSE',
      room: 'Studio 3',
      schedule: 'Sat & Sun • 10:00 AM – 12:30 PM',
      monthly_fee: 2000,
      capacity: 20,
      enrolled_count: 14,
      primary_subject: 'Foundation Science',
      assigned_faculty: [
        { teacher_id: 'teach-3', subject: 'Integrated Science & Maths', lectures_per_week: 2 }
      ],
      attendance_rate: 89.0,
      average_points: 1120
    },
    {
      id: 'batch-apex-10',
      operator_id: 'op-apex',
      name: 'Class 10 Board Excellence Batch',
      grade: 'Class 10',
      board: 'CBSE / ICSE',
      room: 'Chemistry Lab Suite 1',
      schedule: 'Tue, Thu, Sat • 04:00 PM – 05:30 PM',
      monthly_fee: 1800,
      capacity: 25,
      enrolled_count: 22,
      primary_subject: 'Chemistry',
      assigned_faculty: [
        { teacher_id: 'teach-4', subject: 'Board & Conceptual Chemistry', lectures_per_week: 3 }
      ],
      attendance_rate: 93.4,
      average_points: 1340
    },
    {
      id: 'batch-apex-12',
      operator_id: 'op-apex',
      name: 'Class 12 NEET & Board Chemistry',
      grade: 'Class 12',
      board: 'CBSE Science',
      room: 'Organic Research Hall',
      schedule: 'Mon, Wed, Fri • 06:00 PM – 07:30 PM',
      monthly_fee: 2200,
      capacity: 20,
      enrolled_count: 20,
      primary_subject: 'Organic & Physical Chemistry',
      assigned_faculty: [
        { teacher_id: 'teach-4', subject: 'NEET & Board Chemistry', lectures_per_week: 3 }
      ],
      attendance_rate: 96.0,
      average_points: 1480
    },
    {
      id: 'batch-zen-med',
      operator_id: 'op-zenith',
      name: 'Pre-Medical & High School Biology',
      grade: 'Class 10-11',
      board: 'CBSE / NEET Foundation',
      room: 'Bio Discovery Lab',
      schedule: 'Mon, Wed, Sat • 05:30 PM – 07:00 PM',
      monthly_fee: 1600,
      capacity: 20,
      enrolled_count: 18,
      primary_subject: 'Biology',
      assigned_faculty: [
        { teacher_id: 'teach-5', subject: 'Cell Bio & Human Physiology', lectures_per_week: 3 }
      ],
      attendance_rate: 95.1,
      average_points: 1290
    },
    {
      id: 'batch-hor-club',
      operator_id: 'op-horizon',
      name: 'Class 8-10 English Literature Club',
      grade: 'Class 8-10',
      board: 'CBSE / ICSE',
      room: 'Library Discussion Suite',
      schedule: 'Sun • 11:00 AM – 01:00 PM',
      monthly_fee: 1200,
      capacity: 20,
      enrolled_count: 16,
      primary_subject: 'English Literature',
      assigned_faculty: [
        { teacher_id: 'teach-6', subject: 'Literature & Critical Writing', lectures_per_week: 1 }
      ],
      attendance_rate: 92.0,
      average_points: 1210
    }
  ],

  // ─── 4. ENROLLED STUDENTS (Connected to Batches & Parents) ───────────────────
  students: [
    {
      id: 'student-1',
      name: 'Aryan Mehta',
      roll: 'SA-101',
      grade: 'Class 10',
      board: 'CBSE',
      phone: '+91 99887 76655',
      father_name: 'Rajesh Mehta',
      father_phone: '+91 98111 22334',
      father_phone_verified: true,
      mother_name: 'Sunita Mehta',
      mother_phone: '+91 98765 11223',
      mother_phone_verified: true,
      guardian_name: 'Dr. Rameshwar Mehta (Uncle)',
      guardian_phone: '+91 97123 44556',
      guardian_phone_verified: true,
      enrolled_batches: ['batch-10-m', 'batch-apex-10', 'batch-zen-med'],
      points: 1420,
      streak: 14,
      attendance_percentage: 95.5,
      fee_status: 'paid', // for current month
      avatar_initials: 'AM',
      avatar_bg: 'linear-gradient(135deg, #800020, #B45309)'
    },
    {
      id: 'student-ext-1',
      name: 'Rahul Sharma',
      roll: 'SA-104',
      grade: 'Class 10',
      board: 'CBSE',
      phone: '+91 98333 44551',
      father_name: 'Vikas Sharma',
      father_phone: '+91 98333 44550',
      father_phone_verified: true,
      mother_name: 'Rekha Sharma',
      mother_phone: '+91 98333 44552',
      mother_phone_verified: true,
      enrolled_batches: ['batch-10-m'],
      points: 1840,
      streak: 22,
      attendance_percentage: 98.0,
      fee_status: 'paid',
      avatar_initials: 'RS',
      avatar_bg: 'linear-gradient(135deg, #D97706, #B45309)'
    },
    {
      id: 'student-ext-2',
      name: 'Vivek Gupta',
      roll: 'SA-105',
      grade: 'Class 10',
      board: 'CBSE',
      phone: '+91 98777 11223',
      father_name: 'Manoj Gupta',
      father_phone: '+91 98777 11220',
      father_phone_verified: true,
      mother_name: 'Pooja Gupta',
      mother_phone: '+91 98777 11221',
      mother_phone_verified: true,
      enrolled_batches: ['batch-10-m'],
      points: 1490,
      streak: 18,
      attendance_percentage: 94.0,
      fee_status: 'paid',
      avatar_initials: 'VG',
      avatar_bg: 'linear-gradient(135deg, #0284C7, #0369A1)'
    },
    {
      id: 'student-ext-3',
      name: 'Tanvi Desai',
      roll: 'SA-106',
      grade: 'Class 10',
      board: 'CBSE',
      phone: '+91 98222 33441',
      father_name: 'Ashok Desai',
      father_phone: '+91 98222 33440',
      father_phone_verified: true,
      mother_name: 'Kavita Desai',
      mother_phone: '+91 98222 33442',
      mother_phone_verified: true,
      enrolled_batches: ['batch-10-m'],
      points: 1380,
      streak: 11,
      attendance_percentage: 92.5,
      fee_status: 'paid',
      avatar_initials: 'TD',
      avatar_bg: 'linear-gradient(135deg, #059669, #047857)'
    },
    {
      id: 'student-ext-4',
      name: 'Rohan Sen',
      roll: 'SA-107',
      grade: 'Class 10',
      board: 'CBSE',
      phone: '+91 98111 55661',
      father_name: 'Subhash Sen',
      father_phone: '+91 98111 55660',
      father_phone_verified: true,
      mother_name: 'Madhuri Sen',
      mother_phone: '+91 98111 55662',
      mother_phone_verified: true,
      enrolled_batches: ['batch-10-m'],
      points: 1260,
      streak: 9,
      attendance_percentage: 89.0,
      fee_status: 'pending',
      avatar_initials: 'RS',
      avatar_bg: 'linear-gradient(135deg, #7C3AED, #6D28D9)'
    },
    {
      id: 'student-ext-5',
      name: 'Aditi Rao',
      roll: 'SA-108',
      grade: 'Class 10',
      board: 'CBSE',
      phone: '+91 97666 44331',
      father_name: 'Kishore Rao',
      father_phone: '+91 97666 44330',
      father_phone_verified: true,
      mother_name: 'Shalini Rao',
      mother_phone: '+91 97666 44332',
      mother_phone_verified: true,
      enrolled_batches: ['batch-10-m'],
      points: 1180,
      streak: 7,
      attendance_percentage: 91.0,
      fee_status: 'paid',
      avatar_initials: 'AR',
      avatar_bg: 'linear-gradient(135deg, #DC2626, #B91C1C)'
    },
    {
      id: 'student-ext-6',
      name: 'Parth Joshi',
      roll: 'SA-109',
      grade: 'Class 10',
      board: 'CBSE',
      phone: '+91 98999 88771',
      father_name: 'Hemant Joshi',
      father_phone: '+91 98999 88770',
      father_phone_verified: true,
      mother_name: 'Seema Joshi',
      mother_phone: '+91 98999 88772',
      mother_phone_verified: true,
      enrolled_batches: ['batch-10-m'],
      points: 1050,
      streak: 5,
      attendance_percentage: 86.5,
      fee_status: 'overdue',
      avatar_initials: 'PJ',
      avatar_bg: 'linear-gradient(135deg, #475569, #334155)'
    },
    {
      id: 'student-2',
      name: 'Priya Mehta',
      roll: 'SA-102',
      grade: 'Class 8',
      board: 'ICSE',
      phone: '+91 99887 76656',
      father_name: 'Rajesh Mehta',
      father_phone: '+91 98111 22334',
      father_phone_verified: true,
      mother_name: 'Sunita Mehta',
      mother_phone: '+91 98765 11223',
      mother_phone_verified: true,
      enrolled_batches: ['batch-hor-club'],
      points: 1350,
      streak: 12,
      attendance_percentage: 96.0,
      fee_status: 'paid',
      avatar_initials: 'PM',
      avatar_bg: 'linear-gradient(135deg, #991B1B, #D97706)'
    },
    {
      id: 'student-3',
      name: 'Kabir Mehta',
      roll: 'SA-103',
      grade: 'Class 12',
      board: 'CBSE Science',
      phone: '+91 99887 76657',
      father_name: 'Rajesh Mehta',
      father_phone: '+91 98111 22334',
      father_phone_verified: true,
      mother_name: 'Sunita Mehta',
      mother_phone: '+91 98765 11223',
      mother_phone_verified: true,
      enrolled_batches: ['batch-12-s30'],
      points: 1650,
      streak: 20,
      attendance_percentage: 97.5,
      fee_status: 'paid',
      avatar_initials: 'KM',
      avatar_bg: 'linear-gradient(135deg, #1E3A8A, #3B82F6)'
    },
    {
      id: 'student-ext-7',
      name: 'Ananya Patel',
      roll: 'AC-201',
      grade: 'Class 10',
      board: 'CBSE',
      phone: '+91 98444 77881',
      father_name: 'Nitin Patel',
      father_phone: '+91 98444 77880',
      father_phone_verified: true,
      mother_name: 'Bhavna Patel',
      mother_phone: '+91 98444 77882',
      mother_phone_verified: true,
      enrolled_batches: ['batch-apex-10'],
      points: 1780,
      streak: 20,
      attendance_percentage: 99.0,
      fee_status: 'paid',
      avatar_initials: 'AP',
      avatar_bg: 'linear-gradient(135deg, #0284C7, #0369A1)'
    }
  ],

  // ─── 5. TODAY'S ATTENDANCE SESSIONS ─────────────────────────────────────────
  today_sessions: [
    {
      id: 'sess-today-1',
      batch_id: 'batch-10-m',
      date: '2026-10-19',
      subject: 'Maths & Physics',
      teacher_name: 'Er. Alok Sharma',
      qr_code_token: 'STLR-QR-20261019-B10M-SECURE',
      total_students: 24,
      present_count: 22,
      absent_count: 2,
      checked_in_students: ['student-1', 'student-ext-1', 'student-ext-2', 'student-ext-3', 'student-ext-5']
    },
    {
      id: 'sess-today-2',
      batch_id: 'batch-apex-10',
      date: '2026-10-19',
      subject: 'Chemistry',
      teacher_name: 'Dr. Rashmi Verma',
      qr_code_token: 'APEX-QR-20261019-B10-SECURE',
      total_students: 22,
      present_count: 20,
      absent_count: 2,
      checked_in_students: ['student-1', 'student-ext-7']
    }
  ],

  // ─── 6. SYLLABUS TOPICS MANAGER ────────────────────────────────────────────
  syllabus_topics: [
    {
      id: 'syl-1',
      batch_id: 'batch-10-m',
      subject: 'Mathematics',
      chapter_number: 1,
      chapter_name: 'Real Numbers',
      topic_name: 'Fundamental Theorem of Arithmetic & Proof of Irrationality',
      status: 'covered',
      revised_students_count: 22,
      assigned_teacher: 'Er. Alok Sharma'
    },
    {
      id: 'syl-2',
      batch_id: 'batch-10-m',
      subject: 'Mathematics',
      chapter_number: 2,
      chapter_name: 'Polynomials',
      topic_name: 'Geometrical Meaning of Zeroes & Relationship of Coefficients',
      status: 'covered',
      revised_students_count: 20,
      assigned_teacher: 'Er. Alok Sharma'
    },
    {
      id: 'syl-3',
      batch_id: 'batch-10-m',
      subject: 'Physics',
      chapter_number: 1,
      chapter_name: 'Light: Reflection & Refraction',
      topic_name: 'Spherical Mirrors Ray Diagrams & Lens Formula Derivations',
      status: 'covered',
      revised_students_count: 19,
      assigned_teacher: 'Dr. Meenakshi Soni'
    },
    {
      id: 'syl-4',
      batch_id: 'batch-10-m',
      subject: 'Mathematics',
      chapter_number: 4,
      chapter_name: 'Quadratic Equations',
      topic_name: 'Completing Square Method & Quadratic Formula Applications',
      status: 'in_progress',
      revised_students_count: 14,
      assigned_teacher: 'Er. Alok Sharma'
    },
    {
      id: 'syl-5',
      batch_id: 'batch-10-m',
      subject: 'Physics',
      chapter_number: 2,
      chapter_name: 'Electricity & Circuits',
      topic_name: 'Ohm\'s Law, Resistance in Series/Parallel Combinations',
      status: 'upcoming',
      revised_students_count: 4,
      assigned_teacher: 'Dr. Meenakshi Soni'
    },
    {
      id: 'syl-6',
      batch_id: 'batch-apex-10',
      subject: 'Chemistry',
      chapter_number: 1,
      chapter_name: 'Chemical Reactions and Equations',
      topic_name: 'Balancing Redox Equations, Types of Reactions & Rancidity',
      status: 'covered',
      revised_students_count: 21,
      assigned_teacher: 'Dr. Rashmi Verma'
    },
    {
      id: 'syl-7',
      batch_id: 'batch-apex-10',
      subject: 'Chemistry',
      chapter_number: 2,
      chapter_name: 'Acids, Bases and Salts',
      topic_name: 'pH Scale Dynamics, Chlor-Alkali Process & Plaster of Paris',
      status: 'in_progress',
      revised_students_count: 15,
      assigned_teacher: 'Dr. Rashmi Verma'
    }
  ],

  // ─── 7. RECENT TESTS & ASSESSMENTS ─────────────────────────────────────────
  tests: [
    {
      id: 'test-1',
      batch_id: 'batch-10-m',
      title: 'Polynomials & Real Numbers Grand Test',
      subject: 'Mathematics',
      max_marks: 50,
      conducted_date: '2026-10-12',
      conducted_by: 'Er. Alok Sharma',
      class_average: 41.2,
      highest_score: 50,
      submissions_count: 24,
      scores: [
        { student_id: 'student-ext-1', name: 'Rahul Sharma', marks: 50, rank: 1 },
        { student_id: 'student-ext-2', name: 'Vivek Gupta', marks: 46, rank: 2 },
        { student_id: 'student-1', name: 'Aryan Mehta', marks: 44, rank: 3 },
        { student_id: 'student-ext-3', name: 'Tanvi Desai', marks: 42, rank: 4 }
      ]
    },
    {
      id: 'test-2',
      batch_id: 'batch-10-m',
      title: 'Light: Reflection & Mirror Equations Quiz',
      subject: 'Physics',
      max_marks: 40,
      conducted_date: '2026-10-05',
      conducted_by: 'Dr. Meenakshi Soni',
      class_average: 33.5,
      highest_score: 40,
      submissions_count: 23,
      scores: [
        { student_id: 'student-ext-1', name: 'Rahul Sharma', marks: 40, rank: 1 },
        { student_id: 'student-1', name: 'Aryan Mehta', marks: 37, rank: 2 },
        { student_id: 'student-ext-2', name: 'Vivek Gupta', marks: 36, rank: 3 }
      ]
    },
    {
      id: 'test-3',
      batch_id: 'batch-apex-10',
      title: 'Chemical Reactions & Stoichiometry Test',
      subject: 'Chemistry',
      max_marks: 50,
      conducted_date: '2026-10-14',
      conducted_by: 'Dr. Rashmi Verma',
      class_average: 42.0,
      highest_score: 49,
      submissions_count: 22,
      scores: [
        { student_id: 'student-ext-7', name: 'Ananya Patel', marks: 49, rank: 1 },
        { student_id: 'student-1', name: 'Aryan Mehta', marks: 45, rank: 2 }
      ]
    }
  ],

  // ─── 8. FEE INVOICES & REVENUE LEDGER ───────────────────────────────────────
  invoices: [
    {
      id: 'inv-101',
      invoice_no: 'INV-STLR-101',
      operator_id: 'op-stellar',
      batch_id: 'batch-10-m',
      student_id: 'student-1',
      student_name: 'Aryan Mehta',
      parent_phone: '+91 98111 22334',
      month: 'October 2026',
      amount: 2500,
      status: 'paid',
      paid_date: '2026-10-02',
      payment_mode: 'UPI (GPay)',
      receipt_ref: 'STLR-REC-9941'
    },
    {
      id: 'inv-102',
      invoice_no: 'INV-STLR-102',
      operator_id: 'op-stellar',
      batch_id: 'batch-10-m',
      student_id: 'student-ext-4',
      student_name: 'Rohan Sen',
      parent_phone: '+91 98111 55660',
      month: 'October 2026',
      amount: 2500,
      status: 'pending',
      paid_date: null,
      payment_mode: null,
      receipt_ref: null
    },
    {
      id: 'inv-103',
      invoice_no: 'INV-STLR-103',
      operator_id: 'op-stellar',
      batch_id: 'batch-10-m',
      student_id: 'student-ext-6',
      student_name: 'Parth Joshi',
      parent_phone: '+91 98999 88770',
      month: 'October 2026',
      amount: 2500,
      status: 'overdue',
      paid_date: null,
      payment_mode: null,
      receipt_ref: null
    },
    {
      id: 'inv-104',
      invoice_no: 'INV-APEX-201',
      operator_id: 'op-apex',
      batch_id: 'batch-apex-10',
      student_id: 'student-1',
      student_name: 'Aryan Mehta',
      parent_phone: '+91 98111 22334',
      month: 'October 2026',
      amount: 1800,
      status: 'paid',
      paid_date: '2026-10-04',
      payment_mode: 'UPI (PhonePe)',
      receipt_ref: 'APEX-REC-8812'
    }
  ],

  // ─── 9. ACADEMIC HONORS & POINTS DISPATCH AUDIT LOG ─────────────────────────
  points_dispatches: [
    {
      id: 'pnt-disp-1',
      date: '18 Oct 2026',
      operator_id: 'op-stellar',
      batch_id: 'batch-10-m',
      awarded_by: 'Er. Alok Sharma',
      student_id: 'student-1',
      student_name: 'Aryan Mehta',
      points: 150,
      category: 'Excellence in Mathematics',
      reason: 'Perfect proof derivation in Quadratic Roots prelim assessment.'
    },
    {
      id: 'pnt-disp-2',
      date: '17 Oct 2026',
      operator_id: 'op-stellar',
      batch_id: 'batch-10-m',
      awarded_by: 'Dr. Meenakshi Soni',
      student_id: 'student-ext-1',
      student_name: 'Rahul Sharma',
      points: 120,
      category: 'Physics Mastery',
      reason: 'Top scorer in Spherical Mirror ray diagram formulation.'
    },
    {
      id: 'pnt-disp-3',
      date: '16 Oct 2026',
      operator_id: 'op-stellar',
      batch_id: 'batch-10-m',
      awarded_by: 'Prof. Vikramaditya Sen',
      student_id: 'student-ext-2',
      student_name: 'Vivek Gupta',
      points: 80,
      category: 'Consistent Focus',
      reason: 'Assisted 3 peers during STEM Lab Lens refraction experiment.'
    },
    {
      id: 'pnt-disp-4',
      date: '15 Oct 2026',
      operator_id: 'op-apex',
      batch_id: 'batch-apex-10',
      awarded_by: 'Dr. Rashmi Verma',
      student_id: 'student-1',
      student_name: 'Aryan Mehta',
      points: 100,
      category: 'Chemistry Honors',
      reason: 'Rapid chemical reaction balancing in oral viva.'
    }
  ],

  // ─── 10. ISSUED ACADEMIC MARKSHEETS ────────────────────────────────────────
  issued_marksheets: [
    {
      id: 'doc-1',
      ref: 'VLR-2026-SA101',
      operator_id: 'op-stellar',
      batch_id: 'batch-10-m',
      student_id: 'student-1',
      student_name: 'Aryan Mehta',
      roll: 'SA-101',
      exam_term: 'Mid-Term Board Assessment 2026',
      issue_date: '10 Oct 2026',
      overall_percentage: 91.5,
      grade: 'A1',
      status: 'Verified & Signed',
      director_signature: 'Er. Alok Sharma, B.Tech IIT Delhi',
      breakdown: [
        { subject: 'Mathematics Core', marks: 94, max: 100, grade: 'A1' },
        { subject: 'Physics Theory & Numerical', marks: 89, max: 100, grade: 'A1' },
        { subject: 'STEM Laboratory Practicals', marks: 95, max: 100, grade: 'A1' }
      ]
    },
    {
      id: 'doc-2',
      ref: 'VLR-2026-AC902',
      operator_id: 'op-apex',
      batch_id: 'batch-apex-10',
      student_id: 'student-1',
      student_name: 'Aryan Mehta',
      roll: 'AC-101',
      exam_term: 'Chemistry Semester Prelims 2026',
      issue_date: '12 Oct 2026',
      overall_percentage: 90.0,
      grade: 'A1',
      status: 'Verified & Signed',
      director_signature: 'Dr. Rashmi Verma, Ph.D Chemistry',
      breakdown: [
        { subject: 'Chemical Reactions & Equations', marks: 46, max: 50, grade: 'A1' },
        { subject: 'Acids, Bases & Salts', marks: 44, max: 50, grade: 'A1' }
      ]
    }
  ]
};
