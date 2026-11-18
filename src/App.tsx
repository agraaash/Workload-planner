import { useState, useEffect } from "react";
import { 
  loadCourses, 
  loadSessions, 
  loadTodos, 
  saveCourses, 
  saveSessions, 
  saveTodos 
} from "./data/defaultData";
import { Course, Session, Todo } from "./types";
import { ExamTab } from "./components/ExamTab";
import { CalendarTab } from "./components/CalendarTab";
import { WorkloadTab } from "./components/WorkloadTab";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { GraduationCap, Calendar, BookOpen, Clock, Settings, HelpCircle, Sparkles } from "lucide-react";

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  
  // Navigation: 'exams', 'calendar', or 'workload'
  const [activeTab, setActiveTab] = useState<"exams" | "calendar" | "workload">("workload");

  // Load data on component mount
  useEffect(() => {
    setCourses(loadCourses());
    setSessions(loadSessions());
    setTodos(loadTodos());
  }, []);

  const handleUpdateCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    saveCourses(newCourses);
  };

  const handleUpdateSessions = (newSessions: Session[]) => {
    setSessions(newSessions);
    saveSessions(newSessions);
  };

  const handleUpdateTodos = (newTodos: Todo[]) => {
    setTodos(newTodos);
    saveTodos(newTodos);
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-[#4F3E42] flex flex-col font-sans">
      {/* Top Banner & Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#FFE3E6] sticky top-0 z-30 shadow-xs shadow-pink-100/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF9EAF] to-[#FF708A] text-white rounded-xl flex items-center justify-center font-extrabold text-lg shadow-lg shadow-[#FFA4B5]/35">
                ISB
              </div>
              <div>
                <h1 className="text-base font-black text-[#4A2B30] tracking-tight leading-none flex items-center gap-1.5">
                  MBA Workload Planner
                </h1>
                <p className="text-[10px] text-[#A6888D] font-bold tracking-wider uppercase mt-1">
                  Indian School of Business • Curricular Suite
                </p>
              </div>
            </div>

            {/* Main Tabs Selection */}
            <div className="flex border border-[#FFE3E6] p-1 rounded-2xl bg-[#FFF2F4] w-full sm:w-auto gap-1">
              <button
                id="tab-btn-workload"
                onClick={() => setActiveTab("workload")}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                  activeTab === "workload"
                    ? "bg-white text-[#FF5A76] shadow-xs border border-[#FFE3E6]"
                    : "text-[#A8888E] hover:text-[#FF5A76] hover:bg-white/40"
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                Workload Hub
              </button>
              <button
                id="tab-btn-exams"
                onClick={() => setActiveTab("exams")}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                  activeTab === "exams"
                    ? "bg-white text-[#FF5A76] shadow-xs border border-[#FFE3E6]"
                    : "text-[#A8888E] hover:text-[#FF5A76] hover:bg-white/40"
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                Exam Workloads
              </button>
              <button
                id="tab-btn-calendar"
                onClick={() => setActiveTab("calendar")}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                  activeTab === "calendar"
                    ? "bg-white text-[#FF5A76] shadow-xs border border-[#FFE3E6]"
                    : "text-[#A8888E] hover:text-[#FF5A76] hover:bg-white/40"
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                Calendar & To-dos
              </button>
            </div>

            {/* Quick Information indicator */}
            <div className="hidden md:flex items-center gap-3 text-xs text-[#A8888E] font-semibold">
              <span className="flex items-center gap-1 text-[#FF5A76] bg-[#FFF2F4] border border-[#FFE3E6] px-2.5 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                Term Calendar: Jul - Dec 2026
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Progress Bento Widgets (Shown on Exam Tracker) */}
        {activeTab === "exams" && (
          <AnalyticsPanel courses={courses} sessions={sessions} todos={todos} />
        )}

        {/* Tab Content Display */}
        <div className="mt-4">
          {activeTab === "workload" ? (
            <WorkloadTab
              courses={courses}
              onUpdateCourses={handleUpdateCourses}
            />
          ) : activeTab === "exams" ? (
            <ExamTab
              courses={courses}
              sessions={sessions}
              onUpdateCourses={handleUpdateCourses}
              onUpdateSessions={handleUpdateSessions}
            />
          ) : (
            <CalendarTab
              courses={courses}
              todos={todos}
              onUpdateTodos={handleUpdateTodos}
            />
          )}
        </div>

      </main>

      {/* Academic Footer */}
      <footer className="bg-white border-t border-[#FFE3E6] py-6 mt-12 text-center text-[11px] text-[#A6888D] font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 ISB MBA Workload Planner. Built with Gemini AI Study Assistant.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#FF5A76] cursor-pointer">Honor Code</span>
            <span className="hover:text-[#FF5A76] cursor-pointer">Syllabus Integrations</span>
            <span className="hover:text-[#FF5A76] cursor-pointer">Helpdesk</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
