export interface Course {
  id: string;
  name: string;
  color: string; // e.g. 'indigo', 'rose', 'emerald', 'amber', 'sky', 'violet'
  scoring?: { id: string; component: string; weightage: string }[];
  workloadSessions?: { id: string; sessionNum: number; title: string; preReads: string }[];
  readings?: string;
  notes?: string;
  hasOutline?: boolean;
}

export interface Topic {
  id: string;
  text: string;
  completed: boolean;
}

export interface Session {
  id: string;
  courseId: string;
  term: 'midterm' | 'endterm';
  title: string; // e.g. "Session 7 - Fiscal Policy"
  fileName: string | null;
  fileSize?: string;
  color: string;
  deadline: string; // YYYY-MM-DD
  completed: boolean;
  notes: string;
  topics: Topic[];
}

export interface Todo {
  id: string;
  title: string;
  courseId: string | null; // Associated course (gets color)
  customColor?: string; // If not associated with a course
  date: string | null; // YYYY-MM-DD, null if in backlog
  time: string | null; // HH:MM, null if all day
  isAllDay: boolean;
  completed: boolean;
  notes: string;
}
