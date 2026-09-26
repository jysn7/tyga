import type { Programme } from "@/components/portals/client/programmes/programme-card"

export interface ProgrammeDetail extends Programme {
  description: string
  venueAddress: string
  venueType: string
  termStart: string
  termEnd: string
  focusSplit: {
    skills: number
    play: number
    fitness: number
  }
  stageGoal: string
  coaches: {
    id: string
    name: string
    role: string
    bio: string
  }[]
  sessions: {
    date: string
    startTime: string
    endTime: string
    status: string
  }[]
  upcomingSessions: number
  totalSessions: number
  curriculumModules: {
    id: string
    name: string
    category: string
    isMilestone: boolean
  }[]
  milestones: {
    id: string
    name: string
    completed: boolean
  }[]
  badges: {
    id: string
    name: string
    icon: string
    description: string
    earned: boolean
  }[]
  progressionCriteria: string
  assessments?: {
    id: string
    name: string
    date: string
    score: number
    notes: string
  }[]
  memberProgress: {
    attendance: number
    sessionsAttended: number
    totalSessions: number
    lastAttendance: string | null
    missedSessions: number
  }
  venueMap: string
  contactEmail: string
  contactPhone: string
}

// Full sample data with all fields
export const sampleProgrammes: ProgrammeDetail[] = [
  {
    id: "prog-001",
    name: "Junior Development Squad",
    type: "development",
    levelName: "Intermediate",
    venueName: "Killarney Country Club",
    venueAddress: "60 5th St, Killarney, Johannesburg, 2193",
    venueType: "course",
    minAge: 10,
    maxAge: 14,
    genderRestriction: "any",
    recurrenceRule: "Tue & Thu, 15:30–17:00",
    termStart: "2026-09-01",
    termEnd: "2026-12-10",
    price: 1450,
    capacity: 16,
    enrolledCount: 12,
    maxRatio: 4,
    description:
      "A structured development programme for juniors looking to improve their all-round game. Covers technique, course management, and competition preparation.",
    focusSplit: {
      skills: 50,
      play: 30,
      fitness: 20,
    },
    stageGoal: "Build solid fundamentals and introduce competition",
    coaches: [
      {
        id: "coach-001",
        name: "Thabo Mokoena",
        role: "lead",
        bio: "PGA Level 2, 8 years junior coaching experience",
      },
      {
        id: "coach-002",
        name: "Sarah Ndlovu",
        role: "assistant",
        bio: "PGA Level 1, Sports Psychology background",
      },
    ],
    sessions: [
      {
        date: "2026-09-02",
        startTime: "15:30",
        endTime: "17:00",
        status: "scheduled",
      },
      {
        date: "2026-09-04",
        startTime: "15:30",
        endTime: "17:00",
        status: "scheduled",
      },
      {
        date: "2026-09-09",
        startTime: "15:30",
        endTime: "17:00",
        status: "scheduled",
      },
      {
        date: "2026-09-11",
        startTime: "15:30",
        endTime: "17:00",
        status: "scheduled",
      },
      {
        date: "2026-09-16",
        startTime: "15:30",
        endTime: "17:00",
        status: "scheduled",
      },
    ],
    upcomingSessions: 16,
    totalSessions: 32,
    curriculumModules: [
      {
        id: "mod-001",
        name: "Grip, Stance, Posture",
        category: "technical",
        isMilestone: true,
      },
      {
        id: "mod-002",
        name: "Full Swing with Irons",
        category: "technical",
        isMilestone: true,
      },
      {
        id: "mod-003",
        name: "Distance Control with Wedges",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-004",
        name: "Pre-shot Routine",
        category: "mental_character",
        isMilestone: true,
      },
      {
        id: "mod-005",
        name: "Course Management",
        category: "mental_character",
        isMilestone: false,
      },
      {
        id: "mod-006",
        name: "Golf-specific Warm-up",
        category: "physical",
        isMilestone: false,
      },
      {
        id: "mod-007",
        name: "Fairways, GIR, Putts Stats",
        category: "format",
        isMilestone: true,
      },
    ],
    milestones: [
      { id: "mil-001", name: "Grip, Stance, Posture", completed: false },
      { id: "mil-002", name: "Full Swing with Irons", completed: false },
      { id: "mil-003", name: "Pre-shot Routine", completed: false },
      { id: "mil-004", name: "Fairways, GIR, Putts Stats", completed: false },
    ],
    badges: [
      {
        id: "badge-001",
        name: "Skills Badge",
        icon: "🏌️",
        description: "Technical proficiency in all core areas",
        earned: false,
      },
      {
        id: "badge-002",
        name: "Character Badge",
        icon: "🏅",
        description: "Demonstrates respect, teamwork, and integrity",
        earned: false,
      },
    ],
    progressionCriteria:
      "Complete Skills + Character badges to advance to Performance level",
    assessments: [
      {
        id: "assess-001",
        name: "Initial Assessment",
        date: "2026-08-25",
        score: 72,
        notes: "Good foundation, needs work on wedge distances",
      },
      {
        id: "assess-002",
        name: "Mid-term Assessment",
        date: "2026-10-15",
        score: 78,
        notes: "Improved consistency, ready for competition play",
      },
    ],
    memberProgress: {
      attendance: 85,
      sessionsAttended: 14,
      totalSessions: 16,
      lastAttendance: "2026-09-11",
      missedSessions: 2,
    },
    venueMap:
      "https://maps.google.com/maps?q=Killarney+Country+Club+Johannesburg",
    contactEmail: "info@killarneygolf.co.za",
    contactPhone: "011 646 1234",
  },
  {
    id: "prog-002",
    name: "Weekend Family Golf",
    type: "weekly_community",
    levelName: "Beginner",
    venueName: "Randpark Golf Club",
    venueAddress: "1 Fairway Ave, Randpark, Johannesburg, 2188",
    venueType: "course",
    minAge: 6,
    maxAge: 17,
    genderRestriction: "any",
    recurrenceRule: "Saturdays, 08:00–09:30",
    termStart: "2026-09-01",
    termEnd: "2026-11-30",
    price: 550,
    capacity: 24,
    enrolledCount: 24,
    maxRatio: 6,
    description:
      "A fun, family-friendly introduction to golf. Sessions focus on basic skills, games, and course play in a relaxed environment.",
    focusSplit: {
      skills: 30,
      play: 50,
      fitness: 20,
    },
    stageGoal: "Fall in love with golf through fun, engaging activities",
    coaches: [
      {
        id: "coach-003",
        name: "Peter Mthembu",
        role: "lead",
        bio: "PGA Level 1, 5 years junior coaching experience",
      },
      {
        id: "coach-004",
        name: "Zanele Dlamini",
        role: "volunteer",
        bio: "Volunteer coach, former junior player",
      },
    ],
    sessions: [
      {
        date: "2026-09-05",
        startTime: "08:00",
        endTime: "09:30",
        status: "scheduled",
      },
      {
        date: "2026-09-12",
        startTime: "08:00",
        endTime: "09:30",
        status: "scheduled",
      },
      {
        date: "2026-09-19",
        startTime: "08:00",
        endTime: "09:30",
        status: "scheduled",
      },
      {
        date: "2026-09-26",
        startTime: "08:00",
        endTime: "09:30",
        status: "scheduled",
      },
    ],
    upcomingSessions: 12,
    totalSessions: 12,
    curriculumModules: [
      {
        id: "mod-008",
        name: "Basic Grip and Stance",
        category: "technical",
        isMilestone: true,
      },
      {
        id: "mod-009",
        name: "Putting Fundamentals",
        category: "technical",
        isMilestone: true,
      },
      {
        id: "mod-010",
        name: "Chipping Basics",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-011",
        name: "Golf Rules and Etiquette",
        category: "mental_character",
        isMilestone: true,
      },
      {
        id: "mod-012",
        name: "Teamwork and Turn-taking",
        category: "mental_character",
        isMilestone: false,
      },
    ],
    milestones: [
      { id: "mil-005", name: "Basic Grip and Stance", completed: false },
      { id: "mil-006", name: "Putting Fundamentals", completed: false },
      { id: "mil-007", name: "Golf Rules and Etiquette", completed: false },
    ],
    badges: [
      {
        id: "badge-003",
        name: "Foundation Badge",
        icon: "🌟",
        description: "Mastered basic skills and rules",
        earned: false,
      },
    ],
    progressionCriteria:
      "Complete Foundation Badge to progress to Junior Development Squad",
    memberProgress: {
      attendance: 92,
      sessionsAttended: 11,
      totalSessions: 12,
      lastAttendance: "2026-09-12",
      missedSessions: 1,
    },
    venueMap: "https://maps.google.com/maps?q=Randpark+Golf+Club+Johannesburg",
    contactEmail: "info@randparkgolf.co.za",
    contactPhone: "011 789 3456",
  },
  {
    id: "prog-003",
    name: "Summer Holiday Camp",
    type: "holiday_camp",
    levelName: "All levels",
    venueName: "Houghton Golf Club",
    venueAddress: "1 East St, Houghton Estate, Johannesburg, 2198",
    venueType: "course",
    minAge: 8,
    maxAge: 13,
    genderRestriction: "any",
    recurrenceRule: "Mon–Fri, 09:00–13:00 (1 week)",
    termStart: "2026-12-14",
    termEnd: "2026-12-18",
    price: 2100,
    capacity: 20,
    enrolledCount: 19,
    maxRatio: 5,
    description:
      "A week-long golf camp during the summer holidays. Each day focuses on a different aspect of the game: driving, irons, short game, course play, and a tournament.",
    focusSplit: {
      skills: 60,
      play: 30,
      fitness: 10,
    },
    stageGoal: "Build skills in a fun, intensive holiday environment",
    coaches: [
      {
        id: "coach-001",
        name: "Thabo Mokoena",
        role: "lead",
        bio: "PGA Level 2, 8 years junior coaching experience",
      },
      {
        id: "coach-002",
        name: "Sarah Ndlovu",
        role: "assistant",
        bio: "PGA Level 1, Sports Psychology background",
      },
      {
        id: "coach-003",
        name: "Peter Mthembu",
        role: "assistant",
        bio: "PGA Level 1, 5 years junior coaching experience",
      },
    ],
    sessions: [
      {
        date: "2026-12-14",
        startTime: "09:00",
        endTime: "13:00",
        status: "scheduled",
      },
      {
        date: "2026-12-15",
        startTime: "09:00",
        endTime: "13:00",
        status: "scheduled",
      },
      {
        date: "2026-12-16",
        startTime: "09:00",
        endTime: "13:00",
        status: "scheduled",
      },
      {
        date: "2026-12-17",
        startTime: "09:00",
        endTime: "13:00",
        status: "scheduled",
      },
      {
        date: "2026-12-18",
        startTime: "09:00",
        endTime: "13:00",
        status: "scheduled",
      },
    ],
    upcomingSessions: 5,
    totalSessions: 5,
    curriculumModules: [
      {
        id: "mod-013",
        name: "Driver and Long Game",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-014",
        name: "Iron Play",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-015",
        name: "Short Game Mastery",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-016",
        name: "Course Navigation",
        category: "format",
        isMilestone: false,
      },
      {
        id: "mod-017",
        name: "Competition Preparation",
        category: "mental_character",
        isMilestone: false,
      },
    ],
    milestones: [],
    badges: [
      {
        id: "badge-004",
        name: "Camp Completion",
        icon: "🏕️",
        description: "Completed the full summer camp programme",
        earned: false,
      },
    ],
    progressionCriteria: "Completion certificate awarded after camp",
    memberProgress: {
      attendance: 0,
      sessionsAttended: 0,
      totalSessions: 5,
      lastAttendance: null,
      missedSessions: 0,
    },
    venueMap: "https://maps.google.com/maps?q=Houghton+Golf+Club+Johannesburg",
    contactEmail: "info@houghtongolf.co.za",
    contactPhone: "011 456 7890",
  },
  {
    id: "prog-004",
    name: "Short Game Clinic",
    type: "clinic",
    levelName: "Intermediate",
    venueName: "Killarney Country Club",
    venueAddress: "60 5th St, Killarney, Johannesburg, 2193",
    venueType: "practice_ground",
    minAge: 12,
    maxAge: 18,
    genderRestriction: "any",
    recurrenceRule: "Wed, 16:00–17:30",
    termStart: "2026-09-01",
    termEnd: "2026-10-20",
    price: 380,
    capacity: 10,
    enrolledCount: 6,
    maxRatio: 5,
    description:
      "A focused clinic on the short game: chipping, pitching, bunker play, and putting. Perfect for players looking to lower their scores.",
    focusSplit: {
      skills: 80,
      play: 10,
      fitness: 10,
    },
    stageGoal: "Master the skills that save the most strokes",
    coaches: [
      {
        id: "coach-002",
        name: "Sarah Ndlovu",
        role: "lead",
        bio: "PGA Level 1, Sports Psychology background",
      },
    ],
    sessions: [
      {
        date: "2026-09-02",
        startTime: "16:00",
        endTime: "17:30",
        status: "scheduled",
      },
      {
        date: "2026-09-09",
        startTime: "16:00",
        endTime: "17:30",
        status: "scheduled",
      },
      {
        date: "2026-09-16",
        startTime: "16:00",
        endTime: "17:30",
        status: "scheduled",
      },
      {
        date: "2026-09-23",
        startTime: "16:00",
        endTime: "17:30",
        status: "scheduled",
      },
      {
        date: "2026-09-30",
        startTime: "16:00",
        endTime: "17:30",
        status: "scheduled",
      },
      {
        date: "2026-10-07",
        startTime: "16:00",
        endTime: "17:30",
        status: "scheduled",
      },
      {
        date: "2026-10-14",
        startTime: "16:00",
        endTime: "17:30",
        status: "scheduled",
      },
      {
        date: "2026-10-21",
        startTime: "16:00",
        endTime: "17:30",
        status: "scheduled",
      },
    ],
    upcomingSessions: 6,
    totalSessions: 8,
    curriculumModules: [
      {
        id: "mod-018",
        name: "Chipping Technique",
        category: "technical",
        isMilestone: true,
      },
      {
        id: "mod-019",
        name: "Pitching Fundamentals",
        category: "technical",
        isMilestone: true,
      },
      {
        id: "mod-020",
        name: "Bunker Play",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-021",
        name: "Putting Mechanics",
        category: "technical",
        isMilestone: true,
      },
      {
        id: "mod-022",
        name: "Course Management around the Green",
        category: "mental_character",
        isMilestone: false,
      },
    ],
    milestones: [
      { id: "mil-008", name: "Chipping Technique", completed: false },
      { id: "mil-009", name: "Pitching Fundamentals", completed: false },
      { id: "mil-010", name: "Putting Mechanics", completed: false },
    ],
    badges: [
      {
        id: "badge-005",
        name: "Short Game Pro",
        icon: "⛳",
        description: "Demonstrated proficiency in all short game areas",
        earned: false,
      },
    ],
    progressionCriteria:
      "Complete Short Game Pro badge to unlock advanced clinics",
    memberProgress: {
      attendance: 0,
      sessionsAttended: 0,
      totalSessions: 8,
      lastAttendance: null,
      missedSessions: 0,
    },
    venueMap:
      "https://maps.google.com/maps?q=Killarney+Country+Club+Johannesburg",
    contactEmail: "info@killarneygolf.co.za",
    contactPhone: "011 646 1234",
  },
  {
    id: "prog-005",
    name: "Girls Elite Pathway",
    type: "development",
    levelName: "Advanced",
    venueName: "Glendower Golf Club",
    venueAddress: "101 Glendower Rd, Kempton Park, 1619",
    venueType: "course",
    minAge: 13,
    maxAge: 18,
    genderRestriction: "female",
    recurrenceRule: "Mon, Wed & Fri, 14:30–16:30",
    termStart: "2026-09-01",
    termEnd: "2026-12-10",
    price: 1850,
    capacity: 12,
    enrolledCount: 9,
    maxRatio: 3,
    description:
      "A high-performance programme for elite junior female golfers. Includes technical refinement, fitness training, tournament preparation, and college pathway guidance.",
    focusSplit: {
      skills: 40,
      play: 40,
      fitness: 20,
    },
    stageGoal: "Train to compete at provincial and national level",
    coaches: [
      {
        id: "coach-002",
        name: "Sarah Ndlovu",
        role: "lead",
        bio: "PGA Level 1, Sports Psychology background",
      },
      {
        id: "coach-004",
        name: "Zanele Dlamini",
        role: "assistant",
        bio: "Volunteer coach, former junior player",
      },
      {
        id: "coach-005",
        name: "Michael Johnson",
        role: "fitness",
        bio: "Certified Golf Fitness Specialist",
      },
    ],
    sessions: [
      {
        date: "2026-09-01",
        startTime: "14:30",
        endTime: "16:30",
        status: "scheduled",
      },
      {
        date: "2026-09-03",
        startTime: "14:30",
        endTime: "16:30",
        status: "scheduled",
      },
      {
        date: "2026-09-05",
        startTime: "14:30",
        endTime: "16:30",
        status: "scheduled",
      },
      {
        date: "2026-09-08",
        startTime: "14:30",
        endTime: "16:30",
        status: "scheduled",
      },
      {
        date: "2026-09-10",
        startTime: "14:30",
        endTime: "16:30",
        status: "scheduled",
      },
    ],
    upcomingSessions: 30,
    totalSessions: 45,
    curriculumModules: [
      {
        id: "mod-023",
        name: "Advanced Ball Striking",
        category: "technical",
        isMilestone: true,
      },
      {
        id: "mod-024",
        name: "Shot Shaping",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-025",
        name: "Tournament Routines",
        category: "mental_character",
        isMilestone: true,
      },
      {
        id: "mod-026",
        name: "Resilience Training",
        category: "mental_character",
        isMilestone: false,
      },
      {
        id: "mod-027",
        name: "Golf Fitness Program",
        category: "physical",
        isMilestone: true,
      },
      {
        id: "mod-028",
        name: "College Pathway Planning",
        category: "mental_character",
        isMilestone: false,
      },
      {
        id: "mod-029",
        name: "Tournament Strategy",
        category: "format",
        isMilestone: true,
      },
    ],
    milestones: [
      { id: "mil-011", name: "Advanced Ball Striking", completed: false },
      { id: "mil-012", name: "Tournament Routines", completed: false },
      { id: "mil-013", name: "Golf Fitness Program", completed: false },
      { id: "mil-014", name: "Tournament Strategy", completed: false },
    ],
    badges: [
      {
        id: "badge-006",
        name: "Performance Badge",
        icon: "🔥",
        description: "Ready to compete at provincial level",
        earned: false,
      },
      {
        id: "badge-007",
        name: "Leadership Badge",
        icon: "👑",
        description:
          "Demonstrates leadership and mentorship of younger players",
        earned: false,
      },
    ],
    progressionCriteria:
      "Complete Performance Badge to progress to Pathway/Elite level",
    assessments: [
      {
        id: "assess-003",
        name: "Fitness Assessment",
        date: "2026-09-10",
        score: 85,
        notes: "Good strength, needs flexibility work",
      },
      {
        id: "assess-004",
        name: "Technical Assessment",
        date: "2026-09-05",
        score: 82,
        notes: "Solid ball striking, work on wedge distances",
      },
    ],
    memberProgress: {
      attendance: 88,
      sessionsAttended: 8,
      totalSessions: 9,
      lastAttendance: "2026-09-10",
      missedSessions: 1,
    },
    venueMap: "https://maps.google.com/maps?q=Glendower+Golf+Club+Kempton+Park",
    contactEmail: "info@glendowergolf.co.za",
    contactPhone: "011 895 5678",
  },
  {
    id: "prog-006",
    name: "Corporate Introduction Day",
    type: "corporate",
    levelName: "Beginner",
    venueName: "Randpark Golf Club",
    venueAddress: "1 Fairway Ave, Randpark, Johannesburg, 2188",
    venueType: "course",
    minAge: 18,
    maxAge: 65,
    genderRestriction: "any",
    recurrenceRule: "Single session, half-day",
    termStart: "2026-09-15",
    termEnd: "2026-09-15",
    price: 950,
    capacity: 30,
    enrolledCount: 14,
    maxRatio: 8,
    description:
      "A half-day corporate golf introduction day including coaching, a 9-hole experience, and networking lunch. Perfect for team building.",
    focusSplit: {
      skills: 50,
      play: 30,
      fitness: 20,
    },
    stageGoal: "Introduce professionals to golf in a fun, social environment",
    coaches: [
      {
        id: "coach-001",
        name: "Thabo Mokoena",
        role: "lead",
        bio: "PGA Level 2, 8 years junior coaching experience",
      },
      {
        id: "coach-003",
        name: "Peter Mthembu",
        role: "assistant",
        bio: "PGA Level 1, 5 years junior coaching experience",
      },
    ],
    sessions: [
      {
        date: "2026-09-15",
        startTime: "07:30",
        endTime: "13:00",
        status: "scheduled",
      },
    ],
    upcomingSessions: 1,
    totalSessions: 1,
    curriculumModules: [
      {
        id: "mod-030",
        name: "Golf Basics for Beginners",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-031",
        name: "Networking on the Course",
        category: "format",
        isMilestone: false,
      },
    ],
    milestones: [],
    badges: [],
    progressionCriteria: "Not applicable for corporate events",
    memberProgress: {
      attendance: 0,
      sessionsAttended: 0,
      totalSessions: 1,
      lastAttendance: null,
      missedSessions: 0,
    },
    venueMap: "https://maps.google.com/maps?q=Randpark+Golf+Club+Johannesburg",
    contactEmail: "corporate@tyga.co.za",
    contactPhone: "010 123 4567",
  },
  {
    id: "prog-007",
    name: "U16 Junior League",
    type: "league",
    levelName: "Advanced",
    venueName: "Houghton Golf Club",
    venueAddress: "1 East St, Houghton Estate, Johannesburg, 2198",
    venueType: "course",
    minAge: 14,
    maxAge: 16,
    genderRestriction: "male",
    recurrenceRule: "Fortnightly Saturdays, 07:30–12:00",
    termStart: "2026-09-05",
    termEnd: "2026-11-28",
    price: 1200,
    capacity: 18,
    enrolledCount: 17,
    maxRatio: 6,
    description:
      "A competitive league for U16 boys. Includes 9-hole matches, individual and team formats, and season-long leaderboards.",
    focusSplit: {
      skills: 20,
      play: 70,
      fitness: 10,
    },
    stageGoal: "Develop competitive skills in a structured league environment",
    coaches: [
      {
        id: "coach-001",
        name: "Thabo Mokoena",
        role: "lead",
        bio: "PGA Level 2, 8 years junior coaching experience",
      },
      {
        id: "coach-003",
        name: "Peter Mthembu",
        role: "assistant",
        bio: "PGA Level 1, 5 years junior coaching experience",
      },
    ],
    sessions: [
      {
        date: "2026-09-05",
        startTime: "07:30",
        endTime: "12:00",
        status: "scheduled",
      },
      {
        date: "2026-09-19",
        startTime: "07:30",
        endTime: "12:00",
        status: "scheduled",
      },
      {
        date: "2026-10-03",
        startTime: "07:30",
        endTime: "12:00",
        status: "scheduled",
      },
      {
        date: "2026-10-17",
        startTime: "07:30",
        endTime: "12:00",
        status: "scheduled",
      },
      {
        date: "2026-10-31",
        startTime: "07:30",
        endTime: "12:00",
        status: "scheduled",
      },
      {
        date: "2026-11-14",
        startTime: "07:30",
        endTime: "12:00",
        status: "scheduled",
      },
      {
        date: "2026-11-28",
        startTime: "07:30",
        endTime: "12:00",
        status: "scheduled",
      },
    ],
    upcomingSessions: 6,
    totalSessions: 7,
    curriculumModules: [
      {
        id: "mod-032",
        name: "Competition Strategy",
        category: "mental_character",
        isMilestone: true,
      },
      {
        id: "mod-033",
        name: "Match Play Format",
        category: "format",
        isMilestone: false,
      },
      {
        id: "mod-034",
        name: "Stroke Play Format",
        category: "format",
        isMilestone: false,
      },
      {
        id: "mod-035",
        name: "Honesty in Scoring",
        category: "mental_character",
        isMilestone: true,
      },
    ],
    milestones: [
      { id: "mil-015", name: "Competition Strategy", completed: false },
      { id: "mil-016", name: "Honesty in Scoring", completed: false },
    ],
    badges: [
      {
        id: "badge-008",
        name: "League Player",
        icon: "🏆",
        description: "Completed a full league season",
        earned: false,
      },
    ],
    progressionCriteria: "Complete league season and demonstrate sportsmanship",
    memberProgress: {
      attendance: 0,
      sessionsAttended: 0,
      totalSessions: 7,
      lastAttendance: null,
      missedSessions: 0,
    },
    venueMap: "https://maps.google.com/maps?q=Houghton+Golf+Club+Johannesburg",
    contactEmail: "league@tyga.co.za",
    contactPhone: "010 123 4567",
  },
  {
    id: "prog-008",
    name: "Little Swingers",
    type: "weekly_community",
    levelName: "Beginner",
    venueName: "Glendower Golf Club",
    venueAddress: "101 Glendower Rd, Kempton Park, 1619",
    venueType: "practice_ground",
    minAge: 5,
    maxAge: 8,
    genderRestriction: "any",
    recurrenceRule: "Saturdays, 09:00–10:00",
    termStart: "2026-09-01",
    termEnd: "2026-11-30",
    price: 480,
    capacity: 14,
    enrolledCount: 5,
    maxRatio: 4,
    description:
      "A fun introduction to golf for our youngest players. Lots of games, movement, and excitement. Learn through play!",
    focusSplit: {
      skills: 20,
      play: 80,
      fitness: 0,
    },
    stageGoal: "Fall in love with golf through fun, active play",
    coaches: [
      {
        id: "coach-003",
        name: "Peter Mthembu",
        role: "lead",
        bio: "PGA Level 1, 5 years junior coaching experience",
      },
      {
        id: "coach-004",
        name: "Zanele Dlamini",
        role: "assistant",
        bio: "Volunteer coach, former junior player",
      },
    ],
    sessions: [
      {
        date: "2026-09-05",
        startTime: "09:00",
        endTime: "10:00",
        status: "scheduled",
      },
      {
        date: "2026-09-12",
        startTime: "09:00",
        endTime: "10:00",
        status: "scheduled",
      },
      {
        date: "2026-09-19",
        startTime: "09:00",
        endTime: "10:00",
        status: "scheduled",
      },
      {
        date: "2026-09-26",
        startTime: "09:00",
        endTime: "10:00",
        status: "scheduled",
      },
    ],
    upcomingSessions: 12,
    totalSessions: 12,
    curriculumModules: [
      {
        id: "mod-036",
        name: "Movement and Balance",
        category: "physical",
        isMilestone: false,
      },
      {
        id: "mod-037",
        name: "Putting Games",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-038",
        name: "Chipping Targets",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-039",
        name: "Teamwork Games",
        category: "mental_character",
        isMilestone: false,
      },
    ],
    milestones: [],
    badges: [
      {
        id: "badge-009",
        name: "Little Swinger",
        icon: "⭐",
        description: "Completed the Little Swingers programme",
        earned: false,
      },
    ],
    progressionCriteria:
      "Complete the programme to advance to Weekend Family Golf",
    memberProgress: {
      attendance: 0,
      sessionsAttended: 0,
      totalSessions: 12,
      lastAttendance: null,
      missedSessions: 0,
    },
    venueMap: "https://maps.google.com/maps?q=Glendower+Golf+Club+Kempton+Park",
    contactEmail: "info@glendowergolf.co.za",
    contactPhone: "011 895 5678",
  },
  {
    id: "prog-009",
    name: "Winter Holiday Camp",
    type: "holiday_camp",
    levelName: "All levels",
    venueName: "Killarney Country Club",
    venueAddress: "60 5th St, Killarney, Johannesburg, 2193",
    venueType: "course",
    minAge: 8,
    maxAge: 14,
    genderRestriction: "any",
    recurrenceRule: "Mon–Fri, 09:00–13:00 (1 week)",
    termStart: "2026-07-06",
    termEnd: "2026-07-10",
    price: 2100,
    capacity: 20,
    enrolledCount: 3,
    maxRatio: 5,
    description:
      "A week-long golf camp during the winter holidays. Focus on indoor and outdoor drills, video analysis, and friendly competitions.",
    focusSplit: {
      skills: 70,
      play: 20,
      fitness: 10,
    },
    stageGoal: "Maintain and improve skills during the winter break",
    coaches: [
      {
        id: "coach-001",
        name: "Thabo Mokoena",
        role: "lead",
        bio: "PGA Level 2, 8 years junior coaching experience",
      },
      {
        id: "coach-002",
        name: "Sarah Ndlovu",
        role: "assistant",
        bio: "PGA Level 1, Sports Psychology background",
      },
    ],
    sessions: [
      {
        date: "2026-07-06",
        startTime: "09:00",
        endTime: "13:00",
        status: "completed",
      },
      {
        date: "2026-07-07",
        startTime: "09:00",
        endTime: "13:00",
        status: "completed",
      },
      {
        date: "2026-07-08",
        startTime: "09:00",
        endTime: "13:00",
        status: "completed",
      },
      {
        date: "2026-07-09",
        startTime: "09:00",
        endTime: "13:00",
        status: "completed",
      },
      {
        date: "2026-07-10",
        startTime: "09:00",
        endTime: "13:00",
        status: "completed",
      },
    ],
    upcomingSessions: 0,
    totalSessions: 5,
    curriculumModules: [
      {
        id: "mod-040",
        name: "Video Analysis",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-041",
        name: "Indoor Drills",
        category: "technical",
        isMilestone: false,
      },
      {
        id: "mod-042",
        name: "Course Play",
        category: "format",
        isMilestone: false,
      },
    ],
    milestones: [],
    badges: [
      {
        id: "badge-010",
        name: "Winter Warrior",
        icon: "❄️",
        description: "Completed the winter holiday camp",
        earned: false,
      },
    ],
    progressionCriteria: "Completion certificate awarded after camp",
    memberProgress: {
      attendance: 0,
      sessionsAttended: 0,
      totalSessions: 5,
      lastAttendance: null,
      missedSessions: 0,
    },
    venueMap:
      "https://maps.google.com/maps?q=Killarney+Country+Club+Johannesburg",
    contactEmail: "info@killarneygolf.co.za",
    contactPhone: "011 646 1234",
  },
]

// For listing pages - only returns what's needed for cards
export async function getAllProgrammes(): Promise<Programme[]> {
  return sampleProgrammes.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    levelName: p.levelName,
    venueName: p.venueName,
    minAge: p.minAge,
    maxAge: p.maxAge,
    genderRestriction: p.genderRestriction,
    recurrenceRule: p.recurrenceRule,
    price: p.price,
    capacity: p.capacity,
    enrolledCount: p.enrolledCount,
    maxRatio: p.maxRatio,
    description: p.description ?? null,
    imageUrl: p.imageUrl ?? null,
  }))
}

// For detail pages - returns everything
export async function getProgrammeById(
  id: string
): Promise<ProgrammeDetail | null> {
  return sampleProgrammes.find((p) => p.id === id) ?? null
}
