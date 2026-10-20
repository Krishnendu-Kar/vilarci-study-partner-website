// js/data.js — Vilarci Study Partner (Teacher-First Portal Architecture)
// Normalized dataset reflecting the real educator mental model:
// 1. Logged-in Teacher Profile (e.g. Er. Alok Sharma)
// 2. Teacher's Own Private Batches (Multiple classes, multiple batches per class, with rename & student management)
// 3. Coaching Institutes linked with the teacher:
//    - Owned Coaching (Stellar Academy) with Members (Teachers) management (Add, Delete, Invite, Roles)
//    - Joined Coaching (Apex Science Hub) as Visiting Faculty
// 4. Coaching Classes with Sections (e.g. Class 10-A, Class 10-B, Class 9-A, Class 12-PCM) with subject-wise teachers
// 5. Section/Batch Deck: Students Roster, QR Attendance, Points Dispenser, Tests, Syllabus, Fees

window.TEACHER_PORTAL_DATA = {

  // ─── 1. TEACHERS DIRECTORY ──────────────────────────────────────────────────
  teachers: [
    {
      id: 'teacher-alok',
      name: 'Er. Alok Sharma',
      qualification: 'B.Tech (IIT Delhi), 14 yrs exp',
      primary_subject: 'Mathematics',
      phone: '+91 98765 43211',
      email: 'alok.sharma@stellaracademy.edu.in',
      photo_initials: 'AS',
      avatar_bg: '#800020'
    },
    {
      id: 'teacher-meenakshi',
      name: 'Dr. Meenakshi Soni',
      qualification: 'Ph.D Physics (IISc Bangalore), 10 yrs exp',
      primary_subject: 'Physics',
      phone: '+91 98765 43212',
      email: 'meenakshi.soni@stellaracademy.edu.in',
      photo_initials: 'MS',
      avatar_bg: '#0284C7'
    },
    {
      id: 'teacher-rashmi',
      name: 'Dr. Rashmi Verma',
      qualification: 'Ph.D Chemistry (CSIR-NET JRF), 12 yrs exp',
      primary_subject: 'Chemistry',
      phone: '+91 98220 12345',
      email: 'verma.chem@apexchem.in',
      photo_initials: 'RV',
      avatar_bg: '#059669'
    },
    {
      id: 'teacher-arindam',
      name: 'Prof. Arindam Sen',
      qualification: 'M.Sc Biology (Gold Medalist), 11 yrs exp',
      primary_subject: 'Biology',
      phone: '+91 97330 54321',
      email: 'arindam.bio@zenithtuitions.com',
      photo_initials: 'AS',
      avatar_bg: '#7C3AED'
    },
    {
      id: 'teacher-vikram',
      name: 'Prof. Vikramaditya Sen',
      qualification: 'M.Sc Applied Sciences, 6 yrs exp',
      primary_subject: 'STEM Lab & Foundation Science',
      phone: '+91 98765 43213',
      email: 'vikram.sen@stellaracademy.edu.in',
      photo_initials: 'VS',
      avatar_bg: '#D97706'
    },
    {
      id: 'teacher-kavita',
      name: 'Mrs. Kavita Roy',
      qualification: 'M.A. English Lit (Delhi Univ), 15 yrs exp',
      primary_subject: 'English Core',
      phone: '+91 98110 99887',
      email: 'kavita.roy@horizonstudio.org',
      photo_initials: 'KR',
      avatar_bg: '#DC2626'
    }
  ],

  // Currently logged-in teacher
  logged_in_teacher_id: 'teacher-alok',

  // ─── 2. TEACHER'S PRIVATE / OWN BATCHES (Independent Tuitions) ──────────────
  // Teacher owns multiple batches across different classes (Class 9, 10, 11, 12).
  // Inside a single class, they have multiple batches!
  private_batches: [
    {
      id: 'pbatch-10-m',
      teacher_id: 'teacher-alok',
      name: 'Class 10 Maths Morning Super 20',
      grade: 'Class 10',
      board: 'CBSE',
      subject: 'Mathematics',
      room: 'Orbit Home Studio A',
      schedule: 'Mon, Wed, Fri • 07:30 AM – 09:00 AM',
      weekly_schedule: {
        "fri": "07:30 AM - 09:00 AM",
        "mon": "07:30 AM - 09:00 AM",
        "sat": "Closed",
        "sun": "Closed",
        "thu": "Closed",
        "tue": "Closed",
        "wed": "07:30 AM - 09:00 AM"
      },
      monthly_fee: 2500,
      capacity: 20,
      enrolled_count: 18,
      created_date: '2026-06-01',
      student_ids: ['student-1', 'student-ext-1', 'student-ext-2', 'student-ext-3', 'student-ext-4', 'student-ext-5', 'student-ext-6']
    },
    {
      id: 'pbatch-10-e',
      teacher_id: 'teacher-alok',
      name: 'Class 10 Maths Evening Board Prep',
      grade: 'Class 10',
      board: 'CBSE / ICSE',
      subject: 'Mathematics',
      room: 'Orbit Home Studio B',
      schedule: 'Tue, Thu, Sat • 05:00 PM – 06:30 PM',
      weekly_schedule: {
        "fri": "Closed",
        "mon": "Closed",
        "sat": "05:00 PM - 06:30 PM",
        "sun": "Closed",
        "thu": "05:00 PM - 06:30 PM",
        "tue": "05:00 PM - 06:30 PM",
        "wed": "Closed"
      },
      monthly_fee: 2500,
      capacity: 25,
      enrolled_count: 15,
      created_date: '2026-06-05',
      student_ids: ['student-ext-2', 'student-ext-4', 'student-ext-7']
    },
    {
      id: 'pbatch-10-o',
      teacher_id: 'teacher-alok',
      name: 'Class 10 Advanced Olympiad Maths',
      grade: 'Class 10',
      board: 'CBSE / Foundation',
      subject: 'Olympiad Mathematics',
      room: 'Orbit Home Studio A',
      schedule: 'Sun • 09:00 AM – 11:30 AM',
      weekly_schedule: {
        "fri": "Closed",
        "mon": "Closed",
        "sat": "Closed",
        "sun": "09:00 AM - 11:30 AM",
        "thu": "Closed",
        "tue": "Closed",
        "wed": "Closed"
      },
      monthly_fee: 1800,
      capacity: 15,
      enrolled_count: 12,
      created_date: '2026-07-01',
      student_ids: ['student-1', 'student-ext-1', 'student-ext-3']
    },
    {
      id: 'pbatch-12-s',
      teacher_id: 'teacher-alok',
      name: 'Class 12 Calculus Super 30',
      grade: 'Class 12',
      board: 'CBSE Science',
      subject: 'Mathematics & Calculus',
      room: 'Senior Seminar Room',
      schedule: 'Daily • 06:00 PM – 07:30 PM',
      weekly_schedule: {
        "fri": "06:00 PM - 07:30 PM",
        "mon": "06:00 PM - 07:30 PM",
        "sat": "06:00 PM - 07:30 PM",
        "sun": "Closed",
        "thu": "06:00 PM - 07:30 PM",
        "tue": "06:00 PM - 07:30 PM",
        "wed": "06:00 PM - 07:30 PM"
      },
      monthly_fee: 3500,
      capacity: 30,
      enrolled_count: 22,
      created_date: '2026-05-15',
      student_ids: ['student-3']
    },
    {
      id: 'pbatch-12-b',
      teacher_id: 'teacher-alok',
      name: 'Class 12 CBSE Board Score Booster',
      grade: 'Class 12',
      board: 'CBSE Science',
      subject: 'Mathematics',
      room: 'Senior Seminar Room',
      schedule: 'Mon, Wed, Fri • 04:00 PM – 05:30 PM',
      weekly_schedule: {
        "fri": "04:00 PM - 05:30 PM",
        "mon": "04:00 PM - 05:30 PM",
        "sat": "Closed",
        "sun": "Closed",
        "thu": "Closed",
        "tue": "Closed",
        "wed": "04:00 PM - 05:30 PM"
      },
      monthly_fee: 3000,
      capacity: 20,
      enrolled_count: 16,
      created_date: '2026-06-10',
      student_ids: ['student-3']
    },
    {
      id: 'pbatch-9-f',
      teacher_id: 'teacher-alok',
      name: 'Class 9 Foundation Mathematics',
      grade: 'Class 9',
      board: 'CBSE',
      subject: 'Foundation Maths',
      room: 'Junior Discovery Room',
      schedule: 'Sat & Sun • 11:00 AM – 12:30 PM',
      weekly_schedule: {
        "fri": "Closed",
        "mon": "Closed",
        "sat": "11:00 AM - 12:30 PM",
        "sun": "11:00 AM - 12:30 PM",
        "thu": "Closed",
        "tue": "Closed",
        "wed": "Closed"
      },
      monthly_fee: 2000,
      capacity: 20,
      enrolled_count: 14,
      created_date: '2026-07-10',
      student_ids: ['student-2']
    }
  ],

  // ─── 3. COACHING INSTITUTES (Linked Institutes) ─────────────────────────────
  // A teacher can own an institute OR be joined as a faculty member in multiple coaching institutes!
  coaching_institutes: [
    {
      id: 'inst-stellar',
      name: 'Stellar Academy',
      tagline: 'Master Concepts. Excel in Board & Competitive Science & Maths.',
      code: 'STLR10',
      logo_text: 'SA',
      theme_color: '#800020',
      address: '42, Orbit Lane, Science Nagar, Pune – 411021',
      phone: '+91 98765 43210',
      email: 'admin@stellaracademy.edu.in',
      established: 2018,
      owner_teacher_id: 'teacher-alok', // Alok Sharma is Owner & Director
      user_role_in_institute: 'Director & Owner', // 'Director & Owner', 'Faculty Member'
      user_permissions: {
        can_manage_members: true,
        can_create_sections: true,
        can_manage_fees: true,
        can_issue_marksheets: true
      },

      // Members (Teachers) Table with permissions
      members: [
        {
          teacher_id: 'teacher-alok',
          role: 'Director & Head of Mathematics',
          permission_level: 'Owner / Full Admin',
          assigned_subjects: ['Mathematics', 'Advanced Problem Solving'],
          joined_date: 'Jan 2018',
          assigned_sections: ['Class 10-A', 'Class 10-B', 'Class 12-PCM-A']
        },
        {
          teacher_id: 'teacher-meenakshi',
          role: 'Senior Faculty - Physics',
          permission_level: 'Faculty / Subject Teacher',
          assigned_subjects: ['Physics', 'Electrodynamics & Optics'],
          joined_date: 'Mar 2019',
          assigned_sections: ['Class 10-A', 'Class 10-B', 'Class 11-PCM-A', 'Class 12-PCM-A']
        },
        {
          teacher_id: 'teacher-rashmi',
          role: 'Visiting Faculty - Chemistry',
          permission_level: 'Faculty / Subject Teacher',
          assigned_subjects: ['Chemistry', 'Organic Chemistry'],
          joined_date: 'Jul 2021',
          assigned_sections: ['Class 10-A', 'Class 10-B', 'Class 11-PCM-A']
        },
        {
          teacher_id: 'teacher-arindam',
          role: 'Visiting Faculty - Pre-Medical Biology',
          permission_level: 'Faculty / Subject Teacher',
          assigned_subjects: ['Biology', 'Medical Foundation'],
          joined_date: 'Sep 2022',
          assigned_sections: ['Class 10-A', 'Pre-Medical Bio-1']
        },
        {
          teacher_id: 'teacher-vikram',
          role: 'Junior Faculty - STEM Lab & Practicals',
          permission_level: 'Lab Instructor',
          assigned_subjects: ['STEM Lab Experiments', 'Foundation Science'],
          joined_date: 'Aug 2023',
          assigned_sections: ['Class 10-A', 'Class 9-A']
        }
      ],

      // Classes with Sections (e.g. Class-10-A, Class-10-B, Class-9-A)
      // Inside coaching, multiple teachers teach different subjects in the same section!
      classes_sections: [
        {
          id: 'sec-10-a',
          class_name: 'Class 10',
          section_name: 'Section A',
          full_code: 'Class 10-A',
          board: 'CBSE',
          room: 'Lecture Hall A-1',
          capacity: 35,
          enrolled_count: 28,
          // Subject-wise teachers assigned to Class 10-A
          subject_faculty_map: [
            { subject: 'Mathematics', teacher_id: 'teacher-alok', lectures_per_week: 4, schedule: 'Mon, Wed, Fri • 07:30 AM' },
            { subject: 'Physics', teacher_id: 'teacher-meenakshi', lectures_per_week: 3, schedule: 'Tue, Thu, Sat • 07:30 AM' },
            { subject: 'Chemistry', teacher_id: 'teacher-rashmi', lectures_per_week: 3, schedule: 'Mon, Wed, Fri • 09:00 AM' },
            { subject: 'STEM Laboratory', teacher_id: 'teacher-vikram', lectures_per_week: 1, schedule: 'Sat • 10:00 AM' }
          ],
          student_ids: ['student-1', 'student-ext-1', 'student-ext-2', 'student-ext-3', 'student-ext-5']
        },
        {
          id: 'sec-10-b',
          class_name: 'Class 10',
          section_name: 'Section B',
          full_code: 'Class 10-B',
          board: 'CBSE / ICSE',
          room: 'Lecture Hall A-2',
          capacity: 30,
          enrolled_count: 24,
          subject_faculty_map: [
            { subject: 'Mathematics', teacher_id: 'teacher-alok', lectures_per_week: 4, schedule: 'Mon, Wed, Fri • 05:00 PM' },
            { subject: 'Physics', teacher_id: 'teacher-meenakshi', lectures_per_week: 3, schedule: 'Tue, Thu, Sat • 05:00 PM' },
            { subject: 'Chemistry', teacher_id: 'teacher-rashmi', lectures_per_week: 3, schedule: 'Mon, Wed, Fri • 06:30 PM' }
          ],
          student_ids: ['student-ext-4', 'student-ext-6', 'student-ext-7']
        },
        {
          id: 'sec-9-a',
          class_name: 'Class 9',
          section_name: 'Section A',
          full_code: 'Class 9-A',
          board: 'CBSE',
          room: 'Room B-2',
          capacity: 25,
          enrolled_count: 20,
          subject_faculty_map: [
            { subject: 'Foundation Mathematics', teacher_id: 'teacher-alok', lectures_per_week: 3, schedule: 'Sat & Sun • 10:00 AM' },
            { subject: 'Integrated Science', teacher_id: 'teacher-vikram', lectures_per_week: 3, schedule: 'Sat & Sun • 11:30 AM' }
          ],
          student_ids: ['student-2']
        },
        {
          id: 'sec-12-pcm-a',
          class_name: 'Class 12',
          section_name: 'Section PCM-A',
          full_code: 'Class 12-PCM-A',
          board: 'CBSE Science',
          room: 'Senior Seminar Hall',
          capacity: 30,
          enrolled_count: 26,
          subject_faculty_map: [
            { subject: 'Calculus & Vectors', teacher_id: 'teacher-alok', lectures_per_week: 4, schedule: 'Daily • 06:00 PM' },
            { subject: 'Electromagnetism & Modern Physics', teacher_id: 'teacher-meenakshi', lectures_per_week: 4, schedule: 'Daily • 07:30 PM' }
          ],
          student_ids: ['student-3']
        }
      ]
    },

    {
      id: 'inst-apex',
      name: 'Apex Science Hub',
      tagline: 'Premier Board & NEET/JEE Coaching Center.',
      code: 'APEX99',
      logo_text: 'AH',
      theme_color: '#0284C7',
      address: 'Shop 12, Crystal Heights, FC Road, Pune – 411005',
      phone: '+91 98220 12345',
      email: 'info@apexsciencehub.in',
      established: 2019,
      owner_teacher_id: 'teacher-rashmi', // Dr. Rashmi Verma is Owner
      user_role_in_institute: 'Visiting Senior Faculty (Maths)', // Er. Alok Sharma is Visiting Faculty here!
      user_permissions: {
        can_manage_members: false, // Cannot delete or invite members
        can_create_sections: false,
        can_manage_fees: false,
        can_issue_marksheets: false
      },

      members: [
        {
          teacher_id: 'teacher-rashmi',
          role: 'Director & Head of Chemistry',
          permission_level: 'Owner / Full Admin',
          assigned_subjects: ['Chemistry', 'Organic Chemistry'],
          joined_date: 'Jan 2019',
          assigned_sections: ['Class 10-A', 'Class 12-A']
        },
        {
          teacher_id: 'teacher-alok',
          role: 'Visiting Senior Faculty - Mathematics',
          permission_level: 'Faculty / Subject Teacher',
          assigned_subjects: ['Mathematics Core', 'Advanced Problem Solving'],
          joined_date: 'Aug 2022',
          assigned_sections: ['Class 10-A', 'Class 12-A']
        }
      ],

      classes_sections: [
        {
          id: 'sec-apex-10-a',
          class_name: 'Class 10',
          section_name: 'Section A (Board Excellence)',
          full_code: 'Class 10-A',
          board: 'CBSE',
          room: 'Hall Chem-1',
          capacity: 30,
          enrolled_count: 22,
          subject_faculty_map: [
            { subject: 'Mathematics', teacher_id: 'teacher-alok', lectures_per_week: 3, schedule: 'Tue, Thu, Sat • 04:00 PM' },
            { subject: 'Chemistry', teacher_id: 'teacher-rashmi', lectures_per_week: 3, schedule: 'Tue, Thu, Sat • 05:30 PM' }
          ],
          student_ids: ['student-1', 'student-ext-7']
        },
        {
          id: 'sec-apex-12-a',
          class_name: 'Class 12',
          section_name: 'Section A (JEE / Board)',
          full_code: 'Class 12-A',
          board: 'CBSE Science',
          room: 'Hall Chem-2',
          capacity: 25,
          enrolled_count: 20,
          subject_faculty_map: [
            { subject: 'Advanced Mathematics', teacher_id: 'teacher-alok', lectures_per_week: 3, schedule: 'Mon, Wed, Fri • 06:00 PM' },
            { subject: 'Organic Chemistry', teacher_id: 'teacher-rashmi', lectures_per_week: 3, schedule: 'Mon, Wed, Fri • 07:30 PM' }
          ],
          student_ids: ['student-3']
        }
      ]
    }
  ],

  // ─── 4. ENROLLED STUDENTS (Master Directory Matching Student Portal) ────────
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
      points: 1420,
      streak: 14,
      attendance_rate: 95.5,
      fee_status: 'paid',
      custom_monthly_fee: 2500,
      admission_start_month: '2026-06',
      course_end_month: '2027-03',
      fee_ledger: {
        '2026-06': { status: 'paid', amount: 2500, paid_date: '04 Jun 2026', payment_mode: 'UPI (Google Pay)', receipt_ref: 'REC-2606-01' },
        '2026-07': { status: 'paid', amount: 2500, paid_date: '03 Jul 2026', payment_mode: 'UPI (Google Pay)', receipt_ref: 'REC-2607-01' },
        '2026-08': { status: 'paid', amount: 2500, paid_date: '05 Aug 2026', payment_mode: 'Cash', receipt_ref: 'REC-2608-01' },
        '2026-09': { status: 'paid', amount: 2500, paid_date: '02 Sep 2026', payment_mode: 'UPI (Google Pay)', receipt_ref: 'REC-2609-01' },
        '2026-10': { status: 'paid', amount: 2500, paid_date: '02 Oct 2026', payment_mode: 'UPI (Google Pay)', receipt_ref: 'REC-2610-01' },
        '2026-11': { status: 'pending', amount: 2500, paid_date: null, payment_mode: null, receipt_ref: null }
      },
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
      guardian_name: '—',
      guardian_phone: '',
      guardian_phone_verified: false,
      points: 1840,
      streak: 22,
      attendance_rate: 98.0,
      fee_status: 'paid',
      custom_monthly_fee: 2500,
      admission_start_month: '2026-06',
      course_end_month: '2027-03',
      fee_ledger: {
        '2026-06': { status: 'paid', amount: 2500, paid_date: '02 Jun 2026', payment_mode: 'UPI (PhonePe)', receipt_ref: 'REC-2606-04' },
        '2026-07': { status: 'paid', amount: 2500, paid_date: '01 Jul 2026', payment_mode: 'UPI (PhonePe)', receipt_ref: 'REC-2607-04' },
        '2026-08': { status: 'paid', amount: 2500, paid_date: '02 Aug 2026', payment_mode: 'UPI (PhonePe)', receipt_ref: 'REC-2608-04' },
        '2026-09': { status: 'paid', amount: 2500, paid_date: '01 Sep 2026', payment_mode: 'Cash', receipt_ref: 'REC-2609-04' },
        '2026-10': { status: 'paid', amount: 2500, paid_date: '04 Oct 2026', payment_mode: 'Cash', receipt_ref: 'REC-2610-04' },
        '2026-11': { status: 'pending', amount: 2500, paid_date: null, payment_mode: null, receipt_ref: null }
      },
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
      guardian_name: '—',
      guardian_phone: '',
      guardian_phone_verified: false,
      points: 1490,
      streak: 18,
      attendance_rate: 94.0,
      fee_status: 'paid',
      custom_monthly_fee: 2200,
      admission_start_month: '2026-06',
      course_end_month: '2027-03',
      fee_ledger: {
        '2026-06': { status: 'paid', amount: 2200, paid_date: '05 Jun 2026', payment_mode: 'UPI (Paytm)', receipt_ref: 'REC-2606-05' },
        '2026-07': { status: 'paid', amount: 2200, paid_date: '05 Jul 2026', payment_mode: 'UPI (Paytm)', receipt_ref: 'REC-2607-05' },
        '2026-08': { status: 'paid', amount: 2200, paid_date: '06 Aug 2026', payment_mode: 'UPI (Paytm)', receipt_ref: 'REC-2608-05' },
        '2026-09': { status: 'paid', amount: 2200, paid_date: '04 Sep 2026', payment_mode: 'UPI (Paytm)', receipt_ref: 'REC-2609-05' },
        '2026-10': { status: 'paid', amount: 2200, paid_date: '06 Oct 2026', payment_mode: 'UPI (Paytm)', receipt_ref: 'REC-2610-05' },
        '2026-11': { status: 'pending', amount: 2200, paid_date: null, payment_mode: null, receipt_ref: null }
      },
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
      guardian_name: '—',
      guardian_phone: '',
      guardian_phone_verified: false,
      points: 1380,
      streak: 11,
      attendance_rate: 92.5,
      fee_status: 'paid',
      custom_monthly_fee: 2000,
      admission_start_month: '2026-07',
      course_end_month: '2027-03',
      fee_ledger: {
        '2026-07': { status: 'paid', amount: 2000, paid_date: '08 Jul 2026', payment_mode: 'Net Banking', receipt_ref: 'REC-2607-06' },
        '2026-08': { status: 'paid', amount: 2000, paid_date: '05 Aug 2026', payment_mode: 'Net Banking', receipt_ref: 'REC-2608-06' },
        '2026-09': { status: 'paid', amount: 2000, paid_date: '05 Sep 2026', payment_mode: 'Net Banking', receipt_ref: 'REC-2609-06' },
        '2026-10': { status: 'paid', amount: 2000, paid_date: '05 Oct 2026', payment_mode: 'Net Banking', receipt_ref: 'REC-2610-06' },
        '2026-11': { status: 'pending', amount: 2000, paid_date: null, payment_mode: null, receipt_ref: null }
      },
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
      guardian_name: '—',
      guardian_phone: '',
      guardian_phone_verified: false,
      points: 1260,
      streak: 9,
      attendance_rate: 89.0,
      fee_status: 'pending',
      custom_monthly_fee: 2500,
      admission_start_month: '2026-08',
      course_end_month: '2027-03',
      fee_ledger: {
        '2026-08': { status: 'paid', amount: 2500, paid_date: '12 Aug 2026', payment_mode: 'UPI (GPay)', receipt_ref: 'REC-2608-07' },
        '2026-09': { status: 'paid', amount: 2500, paid_date: '10 Sep 2026', payment_mode: 'UPI (GPay)', receipt_ref: 'REC-2609-07' },
        '2026-10': { status: 'pending', amount: 2500, paid_date: null, payment_mode: null, receipt_ref: null },
        '2026-11': { status: 'pending', amount: 2500, paid_date: null, payment_mode: null, receipt_ref: null }
      },
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
      guardian_name: '—',
      guardian_phone: '',
      guardian_phone_verified: false,
      points: 1180,
      streak: 7,
      attendance_rate: 91.0,
      fee_status: 'paid',
      custom_monthly_fee: 2400,
      admission_start_month: '2026-08',
      course_end_month: '2027-03',
      fee_ledger: {
        '2026-08': { status: 'paid', amount: 2400, paid_date: '09 Aug 2026', payment_mode: 'UPI (PhonePe)', receipt_ref: 'REC-2608-08' },
        '2026-09': { status: 'paid', amount: 2400, paid_date: '08 Sep 2026', payment_mode: 'UPI (PhonePe)', receipt_ref: 'REC-2609-08' },
        '2026-10': { status: 'paid', amount: 2400, paid_date: '08 Oct 2026', payment_mode: 'UPI (PhonePe)', receipt_ref: 'REC-2610-08' },
        '2026-11': { status: 'pending', amount: 2400, paid_date: null, payment_mode: null, receipt_ref: null }
      },
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
      guardian_name: '—',
      guardian_phone: '',
      guardian_phone_verified: false,
      points: 1050,
      streak: 5,
      attendance_rate: 86.5,
      fee_status: 'pending',
      custom_monthly_fee: 2500,
      admission_start_month: '2026-09',
      course_end_month: '2027-03',
      fee_ledger: {
        '2026-09': { status: 'paid', amount: 2500, paid_date: '14 Sep 2026', payment_mode: 'Cash', receipt_ref: 'REC-2609-09' },
        '2026-10': { status: 'pending', amount: 2500, paid_date: null, payment_mode: null, receipt_ref: null },
        '2026-11': { status: 'pending', amount: 2500, paid_date: null, payment_mode: null, receipt_ref: null }
      },
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
      guardian_name: 'Dr. Rameshwar Mehta (Uncle)',
      guardian_phone: '+91 97123 44556',
      guardian_phone_verified: true,
      points: 1350,
      streak: 12,
      attendance_rate: 96.0,
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
      guardian_name: 'Dr. Rameshwar Mehta (Uncle)',
      guardian_phone: '+91 97123 44556',
      guardian_phone_verified: true,
      points: 1650,
      streak: 20,
      attendance_rate: 97.5,
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
      guardian_name: '—',
      guardian_phone: '',
      guardian_phone_verified: false,
      points: 1780,
      streak: 20,
      attendance_rate: 99.0,
      fee_status: 'paid',
      avatar_initials: 'AP',
      avatar_bg: 'linear-gradient(135deg, #0284C7, #0369A1)'
    }
  ],

  // ─── 5. POINTS DISPATCHES (Audit Log) ───────────────────────────────────────
  points_dispatches: [
    {
      id: 'disp-101',
      date: '18 Oct 2026',
      context_type: 'private_batch', // 'private_batch' or 'coaching_section'
      context_id: 'pbatch-10-m',
      context_title: 'Class 10 Maths Morning Super 20',
      teacher_id: 'teacher-alok',
      teacher_name: 'Er. Alok Sharma',
      student_id: 'student-1',
      student_name: 'Aryan Mehta',
      points: 150,
      category: 'Excellence in Mathematics',
      citation: 'Flawless proof in Quadratic Equations discriminant test.'
    },
    {
      id: 'disp-102',
      date: '17 Oct 2026',
      context_type: 'coaching_section',
      context_id: 'sec-10-a',
      context_title: 'Stellar Academy • Class 10-A',
      teacher_id: 'teacher-alok',
      teacher_name: 'Er. Alok Sharma',
      student_id: 'student-ext-1',
      student_name: 'Rahul Sharma',
      points: 120,
      category: 'Problem Solving Speed',
      citation: 'Solved all 5 bonus polynomial challenge questions in under 12 minutes.'
    },
    {
      id: 'disp-103',
      date: '16 Oct 2026',
      context_type: 'private_batch',
      context_id: 'pbatch-10-m',
      teacher_id: 'teacher-alok',
      teacher_name: 'Er. Alok Sharma',
      student_id: 'student-ext-2',
      student_name: 'Vivek Gupta',
      points: 80,
      category: 'Homework Diligence',
      citation: 'Consistent 18-day study streak with neat homework formatting.'
    }
  ],

  // ─── 6. SYLLABUS TOPICS MANAGER (Planned Target vs Reality) ───────────────
  syllabus_topics: [
    {
      id: 'syl-1',
      context_id: 'pbatch-10-m',
      subject: 'Mathematics',
      chapter_number: 1,
      chapter_name: 'Real Numbers',
      topic_name: 'Fundamental Theorem of Arithmetic & Proof of Irrationality',
      planned_target_date: '2026-07-15',
      actual_completion_date: '2026-07-15',
      variance_status: 'on_schedule',
      variance_text: '🟢 On Schedule (Completed on Target)',
      status: 'covered',
      revised_count: 17
    },
    {
      id: 'syl-2',
      context_id: 'pbatch-10-m',
      subject: 'Mathematics',
      chapter_number: 2,
      chapter_name: 'Polynomials',
      topic_name: 'Relationship between Zeroes and Coefficients of Quadratic Polynomials',
      planned_target_date: '2026-08-10',
      actual_completion_date: '2026-08-17',
      variance_status: 'delayed',
      variance_text: '🔴 Completed 7 Days Delayed',
      status: 'covered',
      revised_count: 16
    },
    {
      id: 'syl-3',
      context_id: 'pbatch-10-m',
      subject: 'Mathematics',
      chapter_number: 4,
      chapter_name: 'Quadratic Equations',
      topic_name: 'Quadratic Formula, Nature of Roots & Word Problems',
      planned_target_date: '2026-09-25',
      actual_completion_date: '2026-10-04',
      variance_status: 'delayed',
      variance_text: '🔴 Completed 9 Days Delayed',
      status: 'covered',
      revised_count: 14
    },
    {
      id: 'syl-4',
      context_id: 'pbatch-10-m',
      subject: 'Mathematics',
      chapter_number: 5,
      chapter_name: 'Arithmetic Progressions',
      topic_name: 'nth Term of an AP and Sum of First n Terms',
      planned_target_date: '2026-10-25',
      actual_completion_date: null,
      variance_status: 'in_progress',
      variance_text: '🟡 In Progress (Target: 25 Oct)',
      status: 'in_progress',
      revised_count: 8
    },
    {
      id: 'syl-5',
      context_id: 'pbatch-10-m',
      subject: 'Mathematics',
      chapter_number: 6,
      chapter_name: 'Triangles & Similarity',
      topic_name: 'Basic Proportionality Theorem (Thales) & Criterion for Similarity',
      planned_target_date: '2026-11-20',
      actual_completion_date: null,
      variance_status: 'upcoming',
      variance_text: '⚪ Upcoming (Target: 20 Nov)',
      status: 'upcoming',
      revised_count: 0
    },
    {
      id: 'syl-6',
      context_id: 'sec-10-a',
      subject: 'Mathematics',
      chapter_number: 1,
      chapter_name: 'Real Numbers',
      topic_name: 'Fundamental Theorem of Arithmetic',
      planned_target_date: '2026-07-20',
      actual_completion_date: '2026-07-20',
      variance_status: 'on_schedule',
      variance_text: '🟢 On Schedule',
      status: 'covered',
      revised_count: 26
    },
    {
      id: 'syl-7',
      context_id: 'sec-10-a',
      subject: 'Physics',
      chapter_number: 1,
      chapter_name: 'Light: Reflection & Refraction',
      topic_name: 'Spherical Mirrors Ray Diagrams & Lens Formula',
      planned_target_date: '2026-08-15',
      actual_completion_date: '2026-08-20',
      variance_status: 'delayed',
      variance_text: '🔴 5 Days Delayed',
      status: 'covered',
      revised_count: 24
    }
  ],

  // ─── 7. TESTS & ASSESSMENTS (Multiple Tests with Complete Student Scorecards) ─
  tests: [
    {
      id: 'test-1',
      context_id: 'pbatch-10-m',
      title: 'Polynomials & Real Numbers Comprehensive Exam',
      subject: 'Mathematics',
      max_marks: 50,
      conducted_date: '2026-08-22',
      class_average: 41.8,
      highest_score: 50,
      lowest_score: 34,
      pass_rate: 100,
      submissions: [
        { student_id: 'student-ext-1', name: 'Rahul Sharma', roll: 'SA-104', marks: 50, rank: 1, status: 'present', weak_topics: 'None (Flawless)' },
        { student_id: 'student-ext-2', name: 'Vivek Gupta', roll: 'SA-105', marks: 46, rank: 2, status: 'present', weak_topics: 'Irrational proofs algebraic phrasing' },
        { student_id: 'student-1', name: 'Aryan Mehta', roll: 'SA-101', marks: 44, rank: 3, status: 'present', weak_topics: 'Discriminant coefficient roots' },
        { student_id: 'student-ext-3', name: 'Tanvi Desai', roll: 'SA-106', marks: 42, rank: 4, status: 'present', weak_topics: 'Zeroes relation signs' },
        { student_id: 'student-ext-5', name: 'Aditi Rao', roll: 'SA-108', marks: 40, rank: 5, status: 'present', weak_topics: 'Euclid division lemma remainder' },
        { student_id: 'student-ext-4', name: 'Rohan Sen', roll: 'SA-107', marks: 38, rank: 6, status: 'present', weak_topics: 'Factorization speed' },
        { student_id: 'student-ext-6', name: 'Parth Joshi', roll: 'SA-109', marks: 34, rank: 7, status: 'present', weak_topics: 'Fundamental theorem of arithmetic' }
      ]
    },
    {
      id: 'test-2',
      context_id: 'pbatch-10-m',
      title: 'Quadratic Equations & Discriminant Mastery Test',
      subject: 'Mathematics',
      max_marks: 40,
      conducted_date: '2026-09-28',
      class_average: 35.1,
      highest_score: 40,
      lowest_score: 28,
      pass_rate: 100,
      submissions: [
        { student_id: 'student-ext-1', name: 'Rahul Sharma', roll: 'SA-104', marks: 40, rank: 1, status: 'present', weak_topics: 'Mastered' },
        { student_id: 'student-1', name: 'Aryan Mehta', roll: 'SA-101', marks: 38, rank: 2, status: 'present', weak_topics: 'Time taken in speed speed' },
        { student_id: 'student-ext-2', name: 'Vivek Gupta', roll: 'SA-105', marks: 36, rank: 3, status: 'present', weak_topics: 'Completing square sign error' },
        { student_id: 'student-ext-3', name: 'Tanvi Desai', roll: 'SA-106', marks: 35, rank: 4, status: 'present', weak_topics: 'Roots conditions when b^2-4ac = 0' },
        { student_id: 'student-ext-5', name: 'Aditi Rao', roll: 'SA-108', marks: 34, rank: 5, status: 'present', weak_topics: 'Word problem translation' },
        { student_id: 'student-ext-4', name: 'Rohan Sen', roll: 'SA-107', marks: 30, rank: 6, status: 'present', weak_topics: 'Quadratic formula fractions' },
        { student_id: 'student-ext-6', name: 'Parth Joshi', roll: 'SA-109', marks: 28, rank: 7, status: 'present', weak_topics: 'Nature of roots case 2' }
      ]
    },
    {
      id: 'test-3',
      context_id: 'pbatch-10-m',
      title: 'Arithmetic Progressions Diagnostic Quiz',
      subject: 'Mathematics',
      max_marks: 25,
      conducted_date: '2026-10-16',
      class_average: 21.6,
      highest_score: 25,
      lowest_score: 17,
      pass_rate: 100,
      submissions: [
        { student_id: 'student-ext-1', name: 'Rahul Sharma', roll: 'SA-104', marks: 25, rank: 1, status: 'present', weak_topics: 'Perfect' },
        { student_id: 'student-1', name: 'Aryan Mehta', roll: 'SA-101', marks: 24, rank: 2, status: 'present', weak_topics: 'Sum of n terms calculation' },
        { student_id: 'student-ext-2', name: 'Vivek Gupta', roll: 'SA-105', marks: 23, rank: 3, status: 'present', weak_topics: 'AP negative common difference' },
        { student_id: 'student-ext-3', name: 'Tanvi Desai', roll: 'SA-106', marks: 22, rank: 4, status: 'present', weak_topics: 'First term finding from T5 & T9' },
        { student_id: 'student-ext-5', name: 'Aditi Rao', roll: 'SA-108', marks: 21, rank: 5, status: 'present', weak_topics: 'AP application word problem' },
        { student_id: 'student-ext-4', name: 'Rohan Sen', roll: 'SA-107', marks: 19, rank: 6, status: 'present', weak_topics: 'Formula memory nth term' },
        { student_id: 'student-ext-6', name: 'Parth Joshi', roll: 'SA-109', marks: 17, rank: 7, status: 'present', weak_topics: 'Common difference identification' }
      ]
    },
    {
      id: 'test-4',
      context_id: 'sec-10-a',
      title: 'Class 10-A Term 1 Mathematics Prelims',
      subject: 'Mathematics',
      max_marks: 80,
      conducted_date: '2026-10-10',
      class_average: 68.4,
      highest_score: 80,
      lowest_score: 52,
      pass_rate: 96,
      submissions: [
        { student_id: 'student-ext-1', name: 'Rahul Sharma', roll: 'SA-104', marks: 80, rank: 1, status: 'present', weak_topics: 'None' },
        { student_id: 'student-1', name: 'Aryan Mehta', roll: 'SA-101', marks: 74, rank: 2, status: 'present', weak_topics: 'Calculus concept intro' },
        { student_id: 'student-ext-2', name: 'Vivek Gupta', roll: 'SA-105', marks: 72, rank: 3, status: 'present', weak_topics: 'Geometry proofs' }
      ]
    }
  ],

  // ─── 8. FEE INVOICES & LEDGER ──────────────────────────────────────────────
  invoices: [
    {
      id: 'inv-101',
      invoice_no: 'INV-ALOK-101',
      context_id: 'pbatch-10-m',
      student_id: 'student-1',
      student_name: 'Aryan Mehta',
      parent_phone: '+91 98111 22334',
      month: 'October 2026',
      amount: 2500,
      status: 'paid',
      paid_date: '2026-10-02',
      payment_mode: 'UPI (GPay)',
      receipt_ref: 'ALOK-REC-7712'
    },
    {
      id: 'inv-102',
      invoice_no: 'INV-ALOK-102',
      context_id: 'pbatch-10-m',
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
      invoice_no: 'INV-ALOK-103',
      context_id: 'pbatch-10-m',
      student_id: 'student-ext-6',
      student_name: 'Parth Joshi',
      parent_phone: '+91 98999 88770',
      month: 'October 2026',
      amount: 2500,
      status: 'overdue',
      paid_date: null,
      payment_mode: null,
      receipt_ref: null
    }
  ]
};
