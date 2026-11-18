import React from "react";
import { Course, Session, Todo } from "../types";
import { GraduationCap, CheckCircle2, ListTodo, AlertCircle, CalendarRange, Flame } from "lucide-react";

interface AnalyticsPanelProps {
  courses: Course[];
  sessions: Session[];
  todos: Todo[];
}

export function AnalyticsPanel({ courses, sessions, todos }: AnalyticsPanelProps) {
  // Session Metrics
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.completed).length;

  // Topic Checkpoints Metrics
  let totalTopics = 0;
  let completedTopics = 0;
  sessions.forEach((s) => {
    totalTopics += s.topics.length;
    completedTopics += s.topics.filter((t) => t.completed).length;
  });

  // To-do Metrics
  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;

  // Compute percentage completion rates
  const sessionPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const topicPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const todoPercent = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // Upcoming deadlines in July - Dec 2026
  const upcomingReminders = [...todos]
    .filter((t) => t.date && !t.completed)
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return a.date.localeCompare(b.date);
    })
    .slice(0, 3);

  // Subject preparedness map
  const subjectProgress = courses.map((course) => {
    const courseSessions = sessions.filter((s) => s.courseId === course.id);
    let totalCSubtopics = 0;
    let completedCSubtopics = 0;
    courseSessions.forEach((s) => {
      totalCSubtopics += s.topics.length;
      completedCSubtopics += s.topics.filter((t) => t.completed).length;
    });

    const percent = totalCSubtopics > 0 ? Math.round((completedCSubtopics / totalCSubtopics) * 100) : 0;
    return {
      name: course.name,
      color: course.color,
      percent,
      sessionCount: courseSessions.length,
    };
  });

  const getBadgeStyle = (color: string | undefined) => {
    switch (color) {
      case "indigo": return "bg-indigo-50 text-indigo-600 border border-indigo-100/60 font-semibold";
      case "emerald": return "bg-emerald-50 text-emerald-600 border border-emerald-100/60 font-semibold";
      case "amber": return "bg-amber-50 text-amber-600 border border-amber-100/60 font-semibold";
      case "rose": return "bg-pink-50 text-[#FF5A76] border border-pink-100/60 font-semibold";
      case "sky": return "bg-sky-50 text-sky-600 border border-sky-100/60 font-semibold";
      default: return "bg-[#FFF2F4] text-[#FF5A76] border border-[#FFE3E6] font-semibold";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Sessions Card */}
      <div className="bg-white border border-[#FFE3E6] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-[#FFB7C5] transition duration-200">
        <div className="p-3 bg-[#FFF2F4] text-[#FF5A76] rounded-xl">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase text-[#A6888D] tracking-wider">Lectures Tracked</span>
          <h4 className="text-xl font-black text-[#4A2B30] mt-0.5">
            {completedSessions}/{totalSessions}
          </h4>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-1.5 bg-[#FFF2F4] rounded-full flex-1 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#FF9EAF] to-[#FF708A]" style={{ width: `${sessionPercent}%` }} />
            </div>
            <span className="text-[10px] font-bold text-[#FF5A76]">{sessionPercent}%</span>
          </div>
        </div>
      </div>

      {/* Topics Card */}
      <div className="bg-white border border-[#FFE3E6] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-emerald-200 transition duration-200">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase text-[#A6888D] tracking-wider">Exam Subtopics</span>
          <h4 className="text-xl font-black text-[#4A2B30] mt-0.5">
            {completedTopics}/{totalTopics}
          </h4>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-1.5 bg-emerald-50 rounded-full flex-1 overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${topicPercent}%` }} />
            </div>
            <span className="text-[10px] font-bold text-emerald-600">{topicPercent}%</span>
          </div>
        </div>
      </div>

      {/* To-dos Card */}
      <div className="bg-white border border-[#FFE3E6] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-amber-200 transition duration-200">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <ListTodo className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase text-[#A6888D] tracking-wider">To-do Completion</span>
          <h4 className="text-xl font-black text-[#4A2B30] mt-0.5">
            {completedTodos}/{totalTodos}
          </h4>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-1.5 bg-amber-50 rounded-full flex-1 overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${todoPercent}%` }} />
            </div>
            <span className="text-[10px] font-bold text-amber-600">{todoPercent}%</span>
          </div>
        </div>
      </div>

      {/* Upcoming Reminders Card */}
      <div className="bg-white border border-[#FFE3E6] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#FFB7C5] transition duration-200">
        <div className="flex items-center justify-between border-b border-[#FFE3E6] pb-1.5 mb-1.5">
          <span className="text-[10px] font-bold uppercase text-[#A6888D] tracking-wider flex items-center gap-1">
            <CalendarRange className="w-3.5 h-3.5 text-[#FF5A76]" />
            Immediate Deadlines
          </span>
        </div>
        <div className="space-y-1.5">
          {upcomingReminders.length === 0 ? (
            <span className="text-[10px] font-semibold text-[#A6888D]">All clear! No urgent deadlines.</span>
          ) : (
            upcomingReminders.map((r) => {
              const assocC = courses.find((c) => c.id === r.courseId);
              return (
                <div key={r.id} className="flex justify-between items-center text-[10px] font-semibold text-[#4F3E42]">
                  <span className="truncate pr-2">{r.title}</span>
                  <span className={`px-1.5 py-0.5 rounded-md font-mono shrink-0 ${getBadgeStyle(assocC?.color)}`}>
                    {r.date?.slice(5)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
