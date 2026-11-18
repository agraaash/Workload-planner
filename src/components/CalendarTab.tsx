import React, { useState } from "react";
import { Course, Todo } from "../types";
import { Plus, Trash2, Calendar as CalendarIcon, Clock, Check, FileText, Move, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CalendarTabProps {
  courses: Course[];
  todos: Todo[];
  onUpdateTodos: (newTodos: Todo[]) => void;
}

export function CalendarTab({ courses, todos, onUpdateTodos }: CalendarTabProps) {
  const months = [
    { name: "July 2026", monthIdx: 6 }, // 0-indexed: January is 0, July is 6
    { name: "August 2026", monthIdx: 7 },
    { name: "September 2026", monthIdx: 8 },
    { name: "October 2026", monthIdx: 9 },
    { name: "November 2026", monthIdx: 10 },
    { name: "December 2026", monthIdx: 11 },
  ];

  const [activeMonthIdx, setActiveMonthIdx] = useState(0); // Index in the `months` array
  const currentYear = 2026;
  const currentMonthInfo = months[activeMonthIdx];

  // For Adding/Editing a Todo
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [selectedDayForNewTodo, setSelectedDayForNewTodo] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoCourse, setNewTodoCourse] = useState("");
  const [newTodoTime, setNewTodoTime] = useState("");
  const [newTodoIsAllDay, setNewTodoIsAllDay] = useState(true);
  const [newTodoNotes, setNewTodoNotes] = useState("");
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);

  // Search/Filter for Todos
  const [filterCourseId, setFilterCourseId] = useState<string>("all");

  // Get color configurations for subjects
  const getCourseColorClasses = (colorName: string | undefined, isDark: boolean = false) => {
    switch (colorName) {
      case "indigo":
        return isDark
          ? "bg-indigo-500 text-white"
          : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100/50";
      case "emerald":
        return isDark
          ? "bg-emerald-500 text-white"
          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50";
      case "amber":
        return isDark
          ? "bg-amber-500 text-white"
          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50";
      case "rose":
        return isDark
          ? "bg-pink-500 text-white"
          : "bg-pink-50 text-[#FF5A76] border-pink-200 hover:bg-pink-100/50";
      case "sky":
        return isDark
          ? "bg-sky-500 text-white"
          : "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/50";
      default:
        return isDark
          ? "bg-pink-500 text-white"
          : "bg-[#FFF9FA] text-[#4F3E42] border-[#FFE3E6] hover:bg-[#FFF2F4]";
    }
  };

  // Generate days array for calendar grid
  const getDaysInMonth = (year: number, month: number) => {
    // month is 0-indexed
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay(); // 0 is Sunday, 6 is Saturday
    const totalDays = lastDay.getDate();

    // Days from previous month to pad the grid start
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevPadding: { dateString: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      const mStr = String(prevDate.getMonth() + 1).padStart(2, "0");
      const dStr = String(prevDate.getDate()).padStart(2, "0");
      prevPadding.push({
        dateString: `${year}-${mStr}-${dStr}`,
        dayNum: prevMonthLastDay - i,
        isCurrentMonth: false,
      });
    }

    // Days of current month
    const currentDays: { dateString: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    const currentMonthNum = month + 1;
    const mStr = String(currentMonthNum).padStart(2, "0");
    for (let i = 1; i <= totalDays; i++) {
      const dStr = String(i).padStart(2, "0");
      currentDays.push({
        dateString: `${year}-${mStr}-${dStr}`,
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Days from next month to pad the grid end (up to 42 cells total)
    const totalCells = 42;
    const nextPaddingCount = totalCells - (prevPadding.length + currentDays.length);
    const nextPadding: { dateString: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    const nextMonthNum = month + 2;
    for (let i = 1; i <= nextPaddingCount; i++) {
      const nextDate = new Date(year, month + 1, i);
      const nextMStr = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dStr = String(i).padStart(2, "0");
      nextPadding.push({
        dateString: `${year}-${nextMStr}-${dStr}`,
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return [...prevPadding, ...currentDays, ...nextPadding];
  };

  const calendarDays = getDaysInMonth(currentYear, currentMonthInfo.monthIdx);

  // Filtered todos for the calendar month and backlog
  const filteredTodos = todos.filter((todo) => {
    if (filterCourseId !== "all" && todo.courseId !== filterCourseId) {
      return false;
    }
    return true;
  });

  const backlogTodos = filteredTodos.filter((t) => t.date === null);

  const getTodosForDate = (dateStr: string) => {
    return filteredTodos.filter((t) => t.date === dateStr);
  };

  // Add Todo function
  const handleAddTodoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const newTodo: Todo = {
      id: "td_" + Date.now(),
      title: newTodoTitle,
      courseId: newTodoCourse || null,
      date: selectedDayForNewTodo, // could be null if added to backlog
      time: newTodoIsAllDay ? null : newTodoTime || "12:00",
      isAllDay: newTodoIsAllDay,
      completed: false,
      notes: newTodoNotes,
    };

    onUpdateTodos([newTodo, ...todos]);
    resetForm();
  };

  const resetForm = () => {
    setNewTodoTitle("");
    setNewTodoCourse("");
    setNewTodoTime("");
    setNewTodoIsAllDay(true);
    setNewTodoNotes("");
    setIsAddingTodo(false);
    setSelectedDayForNewTodo(null);
  };

  const toggleTodoCompleted = (id: string) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    onUpdateTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    onUpdateTodos(updated);
    setDeletingTodoId(null);
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, todoId: string) => {
    e.dataTransfer.setData("text/plain", todoId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnDay = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData("text/plain");
    if (!todoId) return;

    const updated = todos.map((t) => {
      if (t.id === todoId) {
        return {
          ...t,
          date: targetDate, // Set the new date
        };
      }
      return t;
    });
    onUpdateTodos(updated);
  };

  const handleDropOnBacklog = (e: React.DragEvent) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData("text/plain");
    if (!todoId) return;

    const updated = todos.map((t) => {
      if (t.id === todoId) {
        return {
          ...t,
          date: null, // Reset date to backlog
          time: null,
          isAllDay: true,
        };
      }
      return t;
    });
    onUpdateTodos(updated);
  };

  const openQuickAddForDay = (dateStr: string) => {
    setSelectedDayForNewTodo(dateStr);
    setIsAddingTodo(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Calendar Grid Section */}
      <div className="lg:col-span-3 bg-white border border-[#FFE3E6] rounded-2xl p-6 shadow-xs">
        {/* Month Selector & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-1 bg-[#FFF2F4] border border-[#FFE3E6] p-1 rounded-xl">
            {months.map((m, idx) => (
              <button
                key={m.name}
                id={`btn-month-${idx}`}
                onClick={() => setActiveMonthIdx(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeMonthIdx === idx
                    ? "bg-white text-[#FF5A76] shadow-xs border border-[#FFE3E6]"
                    : "text-[#A6888D] hover:text-[#FF5A76] hover:bg-white/45"
                }`}
              >
                {m.name.split(" ")[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#A6888D] whitespace-nowrap">Filter Course:</span>
            <select
              id="filter-course-select"
              value={filterCourseId}
              onChange={(e) => setFilterCourseId(e.target.value)}
              className="text-xs border border-[#FFE3E6] rounded-lg px-2.5 py-1.5 bg-white font-medium text-[#4F3E42] outline-none focus:ring-1 focus:ring-pink-400/50"
            >
              <option value="all">All Subjects</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs font-medium text-[#A6888D] border-b border-[#FFE3E6] pb-3">
          <span className="text-[#4F3E42] font-semibold">Subjects:</span>
          {courses.map((c) => {
            let colorDot = "bg-slate-400";
            if (c.color === "indigo") colorDot = "bg-indigo-400";
            if (c.color === "emerald") colorDot = "bg-emerald-400";
            if (c.color === "amber") colorDot = "bg-amber-400";
            if (c.color === "rose") colorDot = "bg-pink-400";
            if (c.color === "sky") colorDot = "bg-sky-400";
            return (
              <span key={c.id} className="flex items-center gap-1.5 text-[#4F3E42]">
                <span className={`w-2 h-2 rounded-full ${colorDot}`} />
                {c.name}
              </span>
            );
          })}
        </div>

        {/* 7 Days of Week Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-xs font-bold text-[#A6888D] py-1 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Blocks */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            const dayTodos = getTodosForDate(day.dateString);
            const isToday = day.dateString === "2026-07-01"; // Current mock date is July 1st, 2026

            return (
              <div
                key={`${day.dateString}-${idx}`}
                id={`cal-day-${day.dateString}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnDay(e, day.dateString)}
                className={`min-h-[110px] p-2 border rounded-xl flex flex-col justify-between transition-all relative group ${
                  day.isCurrentMonth
                    ? "bg-[#FFF9FA]/30 border-[#FFE3E6]"
                    : "bg-pink-50/5 border-pink-100/50 opacity-45"
                } ${
                  isToday
                    ? "ring-2 ring-pink-400/40 border-[#FF5A76] bg-[#FFF9FA]/80 shadow-xs"
                    : "hover:border-pink-300"
                }`}
              >
                {/* Day Header */}
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? "bg-pink-500 text-white w-5 h-5 flex items-center justify-center rounded-full"
                        : "text-[#4F3E42]"
                    }`}
                  >
                    {day.dayNum}
                  </span>
                  <button
                    id={`btn-add-todo-${day.dateString}`}
                    onClick={() => openQuickAddForDay(day.dateString)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-[#FFF2F4] rounded text-[#A6888D] hover:text-[#FF5A76]"
                    title="Add to-do to this day"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day To-do list */}
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[85px] custom-scrollbar scrollbar-none">
                  {dayTodos.map((todo) => {
                    const assocCourse = courses.find((c) => c.id === todo.courseId);
                    const colorClass = getCourseColorClasses(assocCourse?.color);

                    return (
                      <div
                        key={todo.id}
                        id={`todo-item-${todo.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, todo.id)}
                        onClick={() => {
                          // Toggle completed on click
                          toggleTodoCompleted(todo.id);
                        }}
                        className={`text-[10px] leading-tight p-1 px-1.5 rounded-md border flex items-center justify-between cursor-grab active:cursor-grabbing transition-all ${colorClass} ${
                          todo.completed ? "opacity-40 line-through text-[#A6888D] border-[#FFE3E6]" : ""
                        }`}
                        title={`${todo.title} ${todo.time ? `(${todo.time})` : ""} - Click to toggle status`}
                      >
                        <div className="flex items-center gap-1 overflow-hidden">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            todo.completed ? "bg-[#A6888D]" : `bg-${assocCourse?.color === "rose" ? "pink" : (assocCourse?.color || "slate")}-400`
                          }`} />
                          <span className="truncate font-semibold">{todo.title}</span>
                        </div>
                        {todo.time && (
                          <span className="text-[8px] font-mono shrink-0 ml-1 opacity-70 text-[#A6888D]">
                             {todo.time}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backlog / Sidebar Section */}
      <div className="flex flex-col gap-6">
        {/* Quick Add To-do Button */}
        <button
          id="btn-trigger-add-todo"
          onClick={() => {
            setSelectedDayForNewTodo(null);
            setIsAddingTodo(true);
          }}
          className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-sm rounded-2xl shadow-xs transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          Create New Task
        </button>

        {/* Backlog / Drag-and-Drop Area */}
        <div
          id="backlog-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnBacklog}
          className="bg-white border border-[#FFE3E6] rounded-2xl p-5 shadow-xs flex-1 flex flex-col min-h-[350px] transition-all hover:border-pink-300"
        >
          <div className="flex items-center justify-between border-b border-[#FFE3E6] pb-3 mb-4">
            <div>
              <h3 className="font-extrabold text-[#4A2B30] text-sm">Todo Backlog</h3>
              <p className="text-[11px] text-[#A6888D] mt-0.5">Drag onto calendar days to assign date</p>
            </div>
            <span className="bg-[#FFF2F4] text-[#FF5A76] border border-[#FFE3E6] font-bold text-xs px-2.5 py-0.5 rounded-full">
              {backlogTodos.length}
            </span>
          </div>

          {/* Draggable Backlog list */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[420px] pr-1 custom-scrollbar">
            {backlogTodos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-[#FFE3E6] rounded-xl bg-[#FFF9FA]/30">
                <Move className="w-7 h-7 text-[#A6888D] mb-2 stroke-1" />
                <p className="text-xs text-[#A6888D] font-medium">Backlog is empty</p>
                <p className="text-[10px] text-[#A6888D] mt-1">Drag calendar events here to un-schedule them</p>
              </div>
            ) : (
              backlogTodos.map((todo) => {
                const assocCourse = courses.find((c) => c.id === todo.courseId);
                const colorClass = getCourseColorClasses(assocCourse?.color);

                return (
                  <div
                    key={todo.id}
                    id={`backlog-todo-${todo.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, todo.id)}
                    className={`p-3 rounded-xl border flex flex-col gap-1 cursor-grab active:cursor-grabbing transition-all hover:shadow-xs group relative ${colorClass} ${
                      todo.completed ? "opacity-60" : ""
                    }`}
                  >
                    {/* Action buttons */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                      {deletingTodoId === todo.id ? (
                        <div className="flex items-center gap-1 bg-[#FFF2F4] border border-[#FFE3E6] p-0.5 rounded-lg text-[9px]">
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="px-1.5 py-0.5 font-bold bg-[#FF5A76] text-white rounded-md hover:bg-[#FF3B5D]"
                            title="Confirm delete"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeletingTodoId(null)}
                            className="px-1.5 py-0.5 font-bold bg-white text-[#A6888D] rounded-md border border-[#FFE3E6]"
                            title="Cancel delete"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleTodoCompleted(todo.id)}
                            className="p-1 hover:bg-[#FFF2F4] rounded text-[#FF5A76]"
                            title={todo.completed ? "Mark incomplete" : "Mark completed"}
                          >
                            <Check className={`w-3.5 h-3.5 ${todo.completed ? "text-emerald-500 font-extrabold" : ""}`} />
                          </button>
                          <button
                            onClick={() => setDeletingTodoId(todo.id)}
                            className="p-1 hover:bg-[#FFF2F4] rounded text-[#A6888D] hover:text-[#FF5A76]"
                            title="Delete Todo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                      {assocCourse ? assocCourse.name : "General"}
                    </span>
                    <h4 className={`text-xs font-bold leading-tight pr-10 ${todo.completed ? "line-through text-[#A6888D]" : "text-[#4F3E42]"}`}>
                      {todo.title}
                    </h4>
                    {todo.notes && (
                      <p className="text-[10px] text-[#A6888D] leading-normal mt-0.5 line-clamp-2">
                        {todo.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Create Todo Dialog / Modal (Centered) */}
      <AnimatePresence>
        {isAddingTodo && (
          <div className="fixed inset-0 bg-[#4A2B30]/35 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#FFE3E6] rounded-3xl p-6 shadow-2xl max-w-md w-full"
            >
              <div className="flex justify-between items-center border-b border-[#FFE3E6] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#FF5A76]" />
                  <h3 className="font-extrabold text-[#4A2B30] text-base">
                    {selectedDayForNewTodo ? `Add Task for ${selectedDayForNewTodo}` : "Add Task to Backlog"}
                  </h3>
                </div>
                <button
                  id="btn-close-todo-modal"
                  onClick={resetForm}
                  className="text-[#A6888D] hover:text-[#FF5A76] text-sm font-semibold p-1 hover:bg-[#FFF2F4] rounded"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddTodoSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[#A6888D] mb-1.5 uppercase">Task Title</label>
                  <input
                    id="input-new-todo-title"
                    type="text"
                    required
                    placeholder="e.g. Finance NPV Homework submission"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    className="w-full border border-[#FFE3E6] bg-white text-[#4F3E42] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300/30 placeholder:text-[#A6888D]/40"
                  />
                </div>

                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#A6888D] mb-1.5 uppercase">Course / Subject</label>
                  <select
                    id="select-new-todo-course"
                    value={newTodoCourse}
                    onChange={(e) => setNewTodoCourse(e.target.value)}
                    className="w-full border border-[#FFE3E6] rounded-xl px-3 py-2.5 text-sm bg-white text-[#4F3E42] outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300/30 font-medium"
                  >
                    <option value="">General Workload (No Subject)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time & All Day */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 pt-8">
                    <input
                      id="checkbox-new-todo-allday"
                      type="checkbox"
                      checked={newTodoIsAllDay}
                      onChange={(e) => setNewTodoIsAllDay(e.target.checked)}
                      className="rounded border-[#FFE3E6] text-pink-500 focus:ring-pink-400/50 bg-white h-4.5 w-4.5"
                    />
                    <label htmlFor="checkbox-new-todo-allday" className="text-xs font-bold text-[#4F3E42]">
                      All Day Task
                    </label>
                  </div>

                  {!newTodoIsAllDay && (
                    <div>
                      <label className="block text-xs font-bold text-[#A6888D] mb-1.5 uppercase">Time</label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-[#A6888D] absolute left-3 top-3" />
                        <input
                          id="input-new-todo-time"
                          type="time"
                          value={newTodoTime}
                          onChange={(e) => setNewTodoTime(e.target.value)}
                          className="w-full border border-[#FFE3E6] rounded-xl pl-9 pr-3.5 py-2.5 text-sm bg-white text-[#4F3E42] outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300/30"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#A6888D] mb-1.5 uppercase">Notes / Instructions</label>
                  <textarea
                    id="textarea-new-todo-notes"
                    placeholder="Add task links, group details or slide ranges..."
                    rows={3}
                    value={newTodoNotes}
                    onChange={(e) => setNewTodoNotes(e.target.value)}
                    className="w-full border border-[#FFE3E6] bg-white text-[#4F3E42] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300/30 placeholder:text-[#A6888D]/40 custom-scrollbar resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-[#FFE3E6]">
                  <button
                    id="btn-cancel-new-todo"
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 text-xs font-bold text-[#A6888D] hover:text-[#FF5A76] hover:bg-[#FFF2F4] rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-new-todo"
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
