import { Course, Session, Todo } from "../types";

export const DEFAULT_COURSES: Course[] = [
  {
    id: "c1",
    name: "Macroeconomics",
    color: "indigo",
    hasOutline: true,
    scoring: [
      { id: "sc1_1", component: "Class Participation", weightage: "15%" },
      { id: "sc1_2", component: "Case Write-ups", weightage: "15%" },
      { id: "sc1_3", component: "Mid-Term Examination", weightage: "30%" },
      { id: "sc1_4", component: "End-Term Examination", weightage: "40%" }
    ],
    readings: "Primary Textbook: 'Macroeconomics' (11th Edition) by N. Gregory Mankiw.\nSecondary Reference: 'Macroeconomics: Institutions, Instability, and the Financial System' by Wendy Carlin and David Soskice.",
    workloadSessions: [
      { id: "ws1_1", sessionNum: 1, title: "Introduction to Macroeconomics & GDP Accounting", preReads: "Mankiw Chapter 1 & 2; ISB Case: 'Accounting for Growth' (A)" },
      { id: "ws1_2", sessionNum: 2, title: "Aggregate Demand & Goods Market Equilibrium", preReads: "Mankiw Chapter 3; Briefing note on Fiscal Multipliers" },
      { id: "ws1_3", sessionNum: 3, title: "Financial Markets & Money Supply Mechanics", preReads: "Mankiw Chapter 4; Fed Reserve balance sheet primer" },
      { id: "ws1_4", sessionNum: 4, title: "IS-LM Model: Joint Goods & Financial Equilibrium", preReads: "Mankiw Chapter 5; 'The Great Recession Policy Mix' case study" },
      { id: "ws1_5", sessionNum: 5, title: "Fiscal Policy, Crowding-Out & Multipliers", preReads: "Mankiw Chapter 6; IMF Economic Outlook 2024 (Pages 12-25)" },
      { id: "ws1_6", sessionNum: 6, title: "Monetary Policy Transmission & Interest Rates", preReads: "Mankiw Chapter 7; RBI Bulletin on Inflation Targeting" },
      { id: "ws1_7", sessionNum: 7, title: "Aggregate Supply & Phillips Curve Trade-offs", preReads: "Mankiw Chapter 8 & 9; Case Study: 'Paul Volcker Disinflation'" },
      { id: "ws1_8", sessionNum: 8, title: "Open Economy Macro: Exchange Rates & BOP", preReads: "Mankiw Chapter 12; Mundell-Fleming briefing note" },
      { id: "ws1_9", sessionNum: 9, title: "Economic Growth, Solow Model & Tech Progress", preReads: "Mankiw Chapter 10; Solow's 1957 seminal paper" },
      { id: "ws1_10", sessionNum: 10, title: "Macroprudential Policy & Financial Stability", preReads: "Mankiw Chapter 20; FSB guidelines for systemic risks" }
    ]
  },
  {
    id: "c2",
    name: "Corporate Finance",
    color: "emerald",
    hasOutline: true,
    scoring: [
      { id: "sc2_1", component: "Group Project & Pitch", weightage: "20%" },
      { id: "sc2_2", component: "Online Quizzes", weightage: "10%" },
      { id: "sc2_3", component: "Mid-Term Exam", weightage: "30%" },
      { id: "sc2_4", component: "End-Term Exam", weightage: "40%" }
    ],
    readings: "Primary Textbook: 'Corporate Finance' (5th Edition) by Jonathan Berk and Peter DeMarzo.\nCasebook: ISB Selected Case Studies in Capital Decisions.",
    workloadSessions: [
      { id: "ws2_1", sessionNum: 1, title: "Time Value of Money & Interest Rates", preReads: "Berk & DeMarzo Chapter 4" },
      { id: "ws2_2", sessionNum: 2, title: "Valuing Bonds & The Term Structure", preReads: "Berk & DeMarzo Chapter 5; Yield Curve Memo" },
      { id: "ws2_3", sessionNum: 3, title: "Valuing Stocks & Market Efficiency", preReads: "Berk & DeMarzo Chapter 6; Dividend Discount Model case" },
      { id: "ws2_4", sessionNum: 4, title: "Investment Decision Rules: NPV vs IRR", preReads: "Berk & DeMarzo Chapter 7" },
      { id: "ws2_5", sessionNum: 5, title: "Capital Budgeting Fundamentals", preReads: "Berk & DeMarzo Chapter 8; FCF Case Study" },
      { id: "ws2_6", sessionNum: 6, title: "Capital Markets & Pricing of Risk", preReads: "Berk & DeMarzo Chapter 10 (CAPM)" },
      { id: "ws2_7", sessionNum: 7, title: "Estimating Cost of Capital (WACC)", preReads: "Berk & DeMarzo Chapter 12; WACC Estimation Guide" },
      { id: "ws2_8", sessionNum: 8, title: "Capital Structure in a Perfect Market", preReads: "Berk & DeMarzo Chapter 14 & 15" },
      { id: "ws2_9", sessionNum: 9, title: "Debt and Taxes: Tax Shields", preReads: "Berk & DeMarzo Chapter 16; Interest Tax Shield Note" },
      { id: "ws2_10", sessionNum: 10, title: "Valuation with Leverage (APV, WACC, FTE)", preReads: "Berk & DeMarzo Chapter 18" }
    ]
  },
  {
    id: "c3",
    name: "Competitive Strategy",
    color: "amber",
    hasOutline: true,
    scoring: [
      { id: "sc3_1", component: "Case Preparation & Debates", weightage: "25%" },
      { id: "sc3_2", component: "Mid-Term Quiz", weightage: "20%" },
      { id: "sc3_3", component: "Group Strategy Simulation", weightage: "20%" },
      { id: "sc3_4", component: "Final Exam", weightage: "35%" }
    ],
    readings: "Primary Textbook: 'Contemporary Strategy Analysis' (10th Edition) by Robert M. Grant.\nRequired Reading: 'Competitive Advantage' by Michael E. Porter.",
    workloadSessions: [
      { id: "ws3_1", sessionNum: 1, title: "Strategy & Competitive Advantage", preReads: "Grant Chapter 1; Porter 'What is Strategy?'" },
      { id: "ws3_2", sessionNum: 2, title: "Industry Analysis: Five Forces", preReads: "Grant Chapter 2; 'Industry Analysis at ISB' Note" },
      { id: "ws3_3", sessionNum: 3, title: "Strategic Groups & Intraboundary Analysis", preReads: "Grant Chapter 3; Case Study: Southwest Airlines" },
      { id: "ws3_4", sessionNum: 4, title: "Resources, Capabilities & VRIO framework", preReads: "Grant Chapter 5; Barney's Resource-Based View Paper" },
      { id: "ws3_5", sessionNum: 5, title: "Cost & Differentiation Advantages", preReads: "Grant Chapter 7 & 8" },
      { id: "ws3_6", sessionNum: 6, title: "Technology Strategy & Network Effects", preReads: "Grant Chapter 9; 'Platform Economics' notes" },
      { id: "ws3_7", sessionNum: 7, title: "Vertical Integration & Firm Scope", preReads: "Grant Chapter 11; Coase 'Nature of the Firm'" },
      { id: "ws3_8", sessionNum: 8, title: "Corporate Diversification", preReads: "Grant Chapter 12; Porter 'Corporate Strategy' paper" },
      { id: "ws3_9", sessionNum: 9, title: "Global Strategy & Multi-national Arbitrage", preReads: "Grant Chapter 13; Ghemawat 'Distance Still Matters'" },
      { id: "ws3_10", sessionNum: 10, title: "Digital Platform Ecosystems", preReads: "Grant Chapter 15; Case: Apple Ecosystem" }
    ]
  },
  {
    id: "c4",
    name: "Marketing Management",
    color: "rose",
    hasOutline: false
  },
  {
    id: "c5",
    name: "Decision Sciences",
    color: "sky",
    hasOutline: false
  }
];

export const DEFAULT_SESSIONS: Session[] = [
  {
    id: "s1",
    courseId: "c1",
    term: "midterm",
    title: "Session 7 - Fiscal Policy & IS-LM Model",
    fileName: "Lec7_Fiscal_Policy_IS_LM_v2.pptx",
    fileSize: "4.2 MB",
    color: "indigo",
    deadline: "2026-07-15",
    completed: false,
    notes: "Review the shifts in IS curve due to government expenditure changes. Pay special attention to crowding-out effects under varying monetary sensitivities.",
    topics: [
      { id: "t1_1", text: "Derivation of the IS curve equation", completed: true },
      { id: "t1_2", text: "Crowding-out effect mechanics", completed: false },
      { id: "t1_3", text: "Multiplier effect calculation", completed: false },
      { id: "t1_4", text: "Monetary vs Fiscal policy interaction", completed: false },
    ],
  },
  {
    id: "s2",
    courseId: "c2",
    term: "midterm",
    title: "Session 5 - Capital Budgeting & NPV Decisions",
    fileName: "CorpFin_Session_5_Budgeting.pptx",
    fileSize: "2.8 MB",
    color: "emerald",
    deadline: "2026-07-28",
    completed: false,
    notes: "Important formulas to remember: Free Cash Flows (FCF), Weighted Average Cost of Capital (WACC), and Equivalent Annual Annuity (EAA) for unequal lives.",
    topics: [
      { id: "t2_1", text: "NPV vs IRR conflict resolution", completed: true },
      { id: "t2_2", text: "WACC computation & levered beta adjustments", completed: false },
      { id: "t2_3", text: "Sensitivity & Scenario analysis frameworks", completed: false },
    ],
  },
  {
    id: "s3",
    courseId: "c3",
    term: "midterm",
    title: "Session 3 - Competitive Advantage & Porter's Forces",
    fileName: "Strategy_Session_3_Industry_Analysis.pptx",
    fileSize: "3.5 MB",
    color: "amber",
    deadline: "2026-07-10",
    completed: true,
    notes: "Case Study: Southwest Airlines activity system map. Core takeaways about trade-offs and strategic fit.",
    topics: [
      { id: "t3_1", text: "Porter's Five Forces framework application", completed: true },
      { id: "t3_2", text: "First-mover advantage vs fast-follower strategies", completed: true },
      { id: "t3_3", text: "Resource-Based View (RBV) and VRIO criteria", completed: true },
    ],
  },
  {
    id: "s4",
    courseId: "c4",
    term: "endterm",
    title: "Session 12 - STP Strategy & Brand Positioning",
    fileName: "Mktg_Session_12_STP_v1.pptx",
    fileSize: "5.1 MB",
    color: "rose",
    deadline: "2026-09-18",
    completed: false,
    notes: "Focus on perceptual mapping and how to translate customer attributes into core brand positioning coordinates.",
    topics: [
      { id: "t4_1", text: "Segmentation methodologies (cluster analysis)", completed: false },
      { id: "t4_2", text: "Positioning statement formula", completed: false },
      { id: "t4_3", text: "Perceptual mapping techniques", completed: false },
    ],
  },
  {
    id: "s5",
    courseId: "c5",
    term: "endterm",
    title: "Session 15 - Linear Programming & Optimization Models",
    fileName: "DecisionSciences_LP_Lecture15.pptx",
    fileSize: "3.9 MB",
    color: "sky",
    deadline: "2026-10-05",
    completed: false,
    notes: "Make sure Excel Solver settings are correctly configured for Simplex LP. Review how to interpret shadow prices and reduced costs.",
    topics: [
      { id: "t5_1", text: "Formulating LP objective functions and constraints", completed: false },
      { id: "t5_2", text: "Sensitivity report interpretation (Shadow prices)", completed: false },
      { id: "t5_3", text: "Integer programming extensions", completed: false },
    ],
  },
];

export const DEFAULT_TODOS: Todo[] = [
  {
    id: "td1",
    title: "Review Macro IS-LM shifts",
    courseId: "c1",
    date: "2026-07-15",
    time: "14:00",
    isAllDay: false,
    completed: false,
    notes: "Review Crowding-out notes.",
  },
  {
    id: "td2",
    title: "CorpFin Homework 1 Submission",
    courseId: "c2",
    date: "2026-07-28",
    time: "23:59",
    isAllDay: false,
    completed: false,
    notes: "Submit Excel model sheet.",
  },
  {
    id: "td3",
    title: "Strategy Case Study Reading",
    courseId: "c3",
    date: "2026-07-09",
    time: null,
    isAllDay: true,
    completed: true,
    notes: "Read Southwest Airlines Case.",
  },
  {
    id: "td4",
    title: "Group Meeting: Marketing STP Presentation",
    courseId: "c4",
    date: "2026-07-22",
    time: "19:00",
    isAllDay: false,
    completed: false,
    notes: "Draft slide 4 to 6.",
  },
  {
    id: "td5",
    title: "Backlog: Revise Stats Probability rules",
    courseId: "c5",
    date: null,
    time: null,
    isAllDay: true,
    completed: false,
    notes: "Look at Bayes Theorem before the midterm quiz.",
  },
  {
    id: "td6",
    title: "Backlog: Prepare Resume for Placement Portal",
    courseId: null,
    customColor: "gray",
    date: null,
    time: null,
    isAllDay: true,
    completed: false,
    notes: "Update project descriptions.",
  }
];

// Local Storage Keys
const COURSES_KEY = "isb_mba_courses";
const SESSIONS_KEY = "isb_mba_sessions";
const TODOS_KEY = "isb_mba_todos";

export function loadCourses(): Course[] {
  try {
    const data = localStorage.getItem(COURSES_KEY);
    return data ? JSON.parse(data) : DEFAULT_COURSES;
  } catch {
    return DEFAULT_COURSES;
  }
}

export function saveCourses(courses: Course[]) {
  try {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch (e) {
    console.error("Failed to save courses:", e);
  }
}

export function loadSessions(): Session[] {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SESSIONS;
  } catch {
    return DEFAULT_SESSIONS;
  }
}

export function saveSessions(sessions: Session[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to save sessions:", e);
  }
}

export function loadTodos(): Todo[] {
  try {
    const data = localStorage.getItem(TODOS_KEY);
    return data ? JSON.parse(data) : DEFAULT_TODOS;
  } catch {
    return DEFAULT_TODOS;
  }
}

export function saveTodos(todos: Todo[]) {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error("Failed to save todos:", e);
  }
}
