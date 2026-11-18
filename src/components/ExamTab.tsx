import React, { useState } from "react";
import { Course, Session, Topic } from "../types";
import { Plus, Trash2, Calendar, FileText, CheckSquare, Square, Check, BookOpen, Loader2, FileUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExamTabProps {
  courses: Course[];
  sessions: Session[];
  onUpdateCourses: (newCourses: Course[]) => void;
  onUpdateSessions: (newSessions: Session[]) => void;
}

export function ExamTab({ courses, sessions, onUpdateCourses, onUpdateSessions }: ExamTabProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [activeTerm, setActiveTerm] = useState<"midterm" | "endterm">("midterm");

  // State for creating a new Course
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseColor, setNewCourseColor] = useState("rose");

  // State for creating a new Session / PPT Upload
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [newSessionDeadline, setNewSessionDeadline] = useState("");
  const [newSessionNotes, setNewSessionNotes] = useState("");
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);

  // States for safe, non-blocking inline deletions
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  // Available colors for courses
  const colorsList = ["indigo", "emerald", "amber", "rose", "sky"];

  const getCourseById = (id: string) => courses.find((c) => c.id === id);

  const activeCourse = getCourseById(selectedCourseId);

  // Filter sessions based on course and term
  const activeSessions = sessions.filter(
    (s) => s.courseId === selectedCourseId && s.term === activeTerm
  );

  // Styling helpers
  const getBorderColorClass = (colorName: string | undefined) => {
    switch (colorName) {
      case "indigo": return "border-indigo-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30";
      case "emerald": return "border-emerald-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30";
      case "amber": return "border-amber-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30";
      case "rose": return "border-pink-200 focus:border-pink-400 focus:ring-1 focus:ring-pink-400/30";
      case "sky": return "border-sky-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30";
      default: return "border-[#FFE3E6] focus:border-pink-400 focus:ring-1 focus:ring-pink-400/30";
    }
  };

  const getThemeClasses = (colorName: string | undefined) => {
    switch (colorName) {
      case "indigo": return {
        bgLight: "bg-indigo-50/30",
        text: "text-indigo-600",
        border: "border-indigo-100",
        badge: "bg-indigo-50 text-indigo-600 border border-indigo-100/65",
        button: "bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-100/40"
      };
      case "emerald": return {
        bgLight: "bg-emerald-50/30",
        text: "text-emerald-600",
        border: "border-emerald-100",
        badge: "bg-emerald-50 text-emerald-600 border border-emerald-100/65",
        button: "bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-100/40"
      };
      case "amber": return {
        bgLight: "bg-amber-50/30",
        text: "text-amber-600",
        border: "border-amber-100",
        badge: "bg-amber-50 text-amber-600 border border-amber-100/65",
        button: "bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-100/40"
      };
      case "rose": return {
        bgLight: "bg-pink-50/35",
        text: "text-[#FF5A76]",
        border: "border-pink-100",
        badge: "bg-pink-50 text-[#FF5A76] border border-pink-100/65",
        button: "bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-100/40"
      };
      case "sky": return {
        bgLight: "bg-sky-50/30",
        text: "text-sky-600",
        border: "border-sky-100",
        badge: "bg-sky-50 text-sky-600 border border-sky-100/65",
        button: "bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-100/40"
      };
      default: return {
        bgLight: "bg-[#FFF9FA]",
        text: "text-[#FF5A76]",
        border: "border-[#FFE3E6]",
        badge: "bg-[#FFF2F4] text-[#FF5A76] border border-[#FFE3E6]",
        button: "bg-[#FF8DA1] hover:bg-[#FF708A] text-white shadow-md"
      };
    }
  };

  const currentTheme = getThemeClasses(activeCourse?.color);

  // Create Course Submit
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const newId = "c_" + Date.now();
    const newCourse: Course = {
      id: newId,
      name: newCourseName,
      color: newCourseColor,
    };

    onUpdateCourses([...courses, newCourse]);
    setSelectedCourseId(newId);
    setNewCourseName("");
    setIsAddingCourse(false);
  };

  const handleDeleteCourse = (courseId: string) => {
    const updatedCourses = courses.filter((c) => c.id !== courseId);
    const updatedSessions = sessions.filter((s) => s.courseId !== courseId);
    onUpdateCourses(updatedCourses);
    onUpdateSessions(updatedSessions);
    if (selectedCourseId === courseId && updatedCourses.length > 0) {
      setSelectedCourseId(updatedCourses[0].id);
    }
    setDeletingCourseId(null);
  };

  // PPT Upload Simulation Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      });
      // Suggest a session title based on file name if session title is empty
      if (!newSessionTitle) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "") // remove extension
          .replace(/[-_]/g, " "); // replace dashes/underscores with spaces
        setNewSessionTitle(cleanName);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      });
      if (!newSessionTitle) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ");
        setNewSessionTitle(cleanName);
      }
    }
  };

  // Add Session Submission with Gemini integration
  const handleAddSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim() || !activeCourse) return;

    setIsGeneratingTopics(true);

    let parsedTopics: Topic[] = [];

    try {
      // Call our server-side API for dynamic topics extraction
      const response = await fetch("/api/gemini/bifurcate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: activeCourse.name,
          sessionTitle: newSessionTitle,
          fileName: uploadedFile?.name || null,
        }),
      });

      const data = await response.json();
      if (data.topics && Array.isArray(data.topics)) {
        parsedTopics = data.topics.map((t: any, idx: number) => ({
          id: `t_gen_${Date.now()}_${idx}`,
          text: t.text || t,
          completed: false,
        }));
      }
    } catch (err) {
      console.error("Failed to generate topics via Gemini:", err);
    }

    // Fallback if API fails or yields no topics
    if (parsedTopics.length === 0) {
      parsedTopics = [
        { id: `t_fb_${Date.now()}_1`, text: "Lecture Slide Key Theorems", completed: false },
        { id: `t_fb_${Date.now()}_2`, text: "Required Textbook Chapters", completed: false },
        { id: `t_fb_${Date.now()}_3`, text: "Quantitative Formula Derivations", completed: false },
        { id: `t_fb_${Date.now()}_4`, text: "Assigned Case Study Reading", completed: false },
      ];
    }

    const newSession: Session = {
      id: "s_" + Date.now(),
      courseId: selectedCourseId,
      term: activeTerm,
      title: newSessionTitle,
      fileName: uploadedFile?.name || null,
      fileSize: uploadedFile?.size || undefined,
      color: activeCourse.color,
      deadline: newSessionDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      completed: false,
      notes: newSessionNotes || `Draft study guide for ${newSessionTitle}.`,
      topics: parsedTopics,
    };

    onUpdateSessions([newSession, ...sessions]);

    // Reset inputs
    setNewSessionTitle("");
    setUploadedFile(null);
    setNewSessionDeadline("");
    setNewSessionNotes("");
    setIsGeneratingTopics(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    onUpdateSessions(updated);
    setDeletingSessionId(null);
  };

  // Toggle Session overall completion
  const handleToggleSessionCompleted = (sessionId: string) => {
    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        const nextCompleted = !s.completed;
        // If completing the main session, optionally check all topics too
        const nextTopics = s.topics.map((t) => ({ ...t, completed: nextCompleted }));
        return {
          ...s,
          completed: nextCompleted,
          topics: nextTopics,
        };
      }
      return s;
    });
    onUpdateSessions(updated);
  };

  // Toggle Single topic checklist item
  const handleToggleTopicCompleted = (sessionId: string, topicId: string) => {
    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        const nextTopics = s.topics.map((t) => (t.id === topicId ? { ...t, completed: !t.completed } : t));
        const allCompleted = nextTopics.every((t) => t.completed);
        return {
          ...s,
          topics: nextTopics,
          // Auto-check the broader session box if all topics are cleared!
          completed: allCompleted,
        };
      }
      return s;
    });
    onUpdateSessions(updated);
  };

  // Add customized topic manually to a session
  const [addingTopicSessionId, setAddingTopicSessionId] = useState<string | null>(null);
  const [newTopicText, setNewTopicText] = useState("");

  const handleAddCustomTopic = (sessionId: string) => {
    if (!newTopicText.trim()) return;

    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        const nextTopic: Topic = {
          id: "t_custom_" + Date.now(),
          text: newTopicText,
          completed: false,
        };
        return {
          ...s,
          topics: [...s.topics, nextTopic],
          completed: false, // reset main checkbox since a new unchecked item is added
        };
      }
      return s;
    });

    onUpdateSessions(updated);
    setNewTopicText("");
    setAddingTopicSessionId(null);
  };

  // Update session notes field reactively
  const handleUpdateNotes = (sessionId: string, notesText: string) => {
    const updated = sessions.map((s) => (s.id === sessionId ? { ...s, notes: notesText } : s));
    onUpdateSessions(updated);
  };

  // Update session deadline reactively
  const handleUpdateDeadline = (sessionId: string, deadlineDate: string) => {
    const updated = sessions.map((s) => (s.id === sessionId ? { ...s, deadline: deadlineDate } : s));
    onUpdateSessions(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Course Selection List (Left Column) */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="bg-white border border-[#FFE3E6] rounded-2xl p-4 shadow-xs flex flex-col gap-2">
          <div className="flex justify-between items-center px-1 mb-2">
            <h3 className="font-extrabold text-[#FF5A76] text-xs uppercase tracking-wider">My Courses</h3>
            <button
              id="btn-toggle-add-course"
              onClick={() => setIsAddingCourse(!isAddingCourse)}
              className="p-1 text-[#FF5A76] hover:bg-[#FFF2F4] rounded-lg transition"
              title="Add Course"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Course Inline Form */}
          <AnimatePresence>
            {isAddingCourse && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddCourse}
                className="p-3 bg-[#FFF9FA] border border-[#FFE3E6] rounded-xl mb-2 flex flex-col gap-3 overflow-hidden"
              >
                <div>
                  <label className="text-[10px] font-bold text-[#A6888D] uppercase block mb-1">Course Name</label>
                  <input
                    id="input-new-course-name"
                    type="text"
                    required
                    placeholder="e.g. Macroeconomics"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="w-full text-xs border border-[#FFE3E6] bg-white text-[#4F3E42] rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-pink-400/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#A6888D] uppercase block mb-1">Color Code</label>
                  <div className="flex gap-2.5">
                    {colorsList.map((c) => {
                      let bgDot = "bg-slate-400";
                      if (c === "indigo") bgDot = "bg-indigo-400";
                      if (c === "emerald") bgDot = "bg-emerald-400";
                      if (c === "amber") bgDot = "bg-amber-400";
                      if (c === "rose") bgDot = "bg-pink-400";
                      if (c === "sky") bgDot = "bg-sky-400";
                      return (
                        <button
                          key={c}
                          id={`color-btn-${c}`}
                          type="button"
                          onClick={() => setNewCourseColor(c)}
                          className={`w-5 h-5 rounded-full ${bgDot} transition-transform ${
                            newCourseColor === c ? "ring-2 ring-offset-2 ring-pink-400 scale-110" : ""
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    id="btn-cancel-add-course"
                    type="button"
                    onClick={() => setIsAddingCourse(false)}
                    className="px-2.5 py-1 text-[10px] font-bold text-[#A6888D] hover:bg-[#FFF2F4] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-add-course"
                    type="submit"
                    className="px-3 py-1 text-[10px] font-bold text-white bg-pink-500 rounded-lg hover:bg-pink-600"
                  >
                    Save
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Courses List */}
          <div className="space-y-1">
            {courses.length === 0 ? (
              <p className="text-xs text-[#A6888D] text-center py-4">No subjects added yet</p>
            ) : (
              courses.map((course) => {
                const isSelected = selectedCourseId === course.id;
                let textClass = "text-[#A6888D] hover:bg-[#FFF9FA] hover:text-[#FF5A76]";
                let dotColor = "bg-slate-400";

                if (course.color === "indigo") {
                  dotColor = "bg-indigo-400";
                  if (isSelected) textClass = "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-500";
                } else if (course.color === "emerald") {
                  dotColor = "bg-emerald-400";
                  if (isSelected) textClass = "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500";
                } else if (course.color === "amber") {
                  dotColor = "bg-amber-400";
                  if (isSelected) textClass = "bg-amber-50 text-amber-600 border-l-4 border-amber-500";
                } else if (course.color === "rose") {
                  dotColor = "bg-pink-400";
                  if (isSelected) textClass = "bg-pink-50 text-[#FF5A76] border-l-4 border-pink-500";
                } else if (course.color === "sky") {
                  dotColor = "bg-sky-400";
                  if (isSelected) textClass = "bg-sky-50 text-sky-600 border-l-4 border-sky-500";
                }

                return (
                  <div
                    key={course.id}
                    id={`course-tab-${course.id}`}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-semibold border-l border-y border-transparent transition-all ${textClass}`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                      <span className="truncate">{course.name}</span>
                    </div>
                    <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
                      {deletingCourseId === course.id ? (
                        <div className="flex items-center gap-1.5 bg-[#FFF2F4] border border-[#FFE3E6] p-1 rounded-lg">
                          <button
                            id={`btn-confirm-delete-course-${course.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCourse(course.id);
                            }}
                            className="px-2 py-0.5 text-[9px] font-bold bg-[#FF5A76] text-white rounded-md hover:bg-[#FF3B5D] transition-colors"
                            title="Confirm delete"
                          >
                            Yes
                          </button>
                          <button
                            id={`btn-cancel-delete-course-${course.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingCourseId(null);
                            }}
                            className="px-1.5 py-0.5 text-[9px] font-bold bg-white text-[#A6888D] rounded-md hover:text-[#FF5A76] border border-[#FFE3E6] transition-colors"
                            title="Cancel delete"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-delete-course-${course.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingCourseId(course.id);
                          }}
                          className="p-1 hover:bg-rose-50 rounded-md text-[#A6888D] hover:text-rose-600 transition"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Study Workload Panel */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {activeCourse ? (
          <>
            {/* Header Area with Course details and Midterms/Endterms switcher */}
            <div className="bg-white border border-[#FFE3E6] rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#FFE3E6] pb-5 mb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3.5 h-3.5 rounded-full bg-${activeCourse.color === "rose" ? "pink" : activeCourse.color}-400`} />
                    <h2 className="text-xl font-extrabold text-[#4A2B30] tracking-tight">
                      {activeCourse.name}
                    </h2>
                  </div>
                  <p className="text-xs text-[#A6888D] mt-1">
                    Manage session slides, timelines, and bifurcated topics for exam preparation.
                  </p>
                </div>

                {/* Midterm vs Endterm Toggle */}
                <div className="flex border border-[#FFE3E6] p-0.5 rounded-xl bg-[#FFF2F4]">
                  <button
                    id="term-btn-midterm"
                    onClick={() => setActiveTerm("midterm")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTerm === "midterm"
                        ? "bg-white text-[#FF5A76] shadow-sm border border-[#FFE3E6]"
                        : "text-[#A6888D] hover:text-[#FF5A76] hover:bg-white/40"
                    }`}
                  >
                    Mid terms
                  </button>
                  <button
                    id="term-btn-endterm"
                    onClick={() => setActiveTerm("endterm")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTerm === "endterm"
                        ? "bg-white text-[#FF5A76] shadow-sm border border-[#FFE3E6]"
                        : "text-[#A6888D] hover:text-[#FF5A76] hover:bg-white/40"
                    }`}
                  >
                    End terms
                  </button>
                </div>
              </div>

              {/* PPT Upload & Session Quick Add Form */}
              <div className="bg-[#FFF9FA] rounded-2xl border border-[#FFE3E6] p-5">
                <h3 className="font-extrabold text-[#4F3E42] text-sm mb-4 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#FF5A76]" />
                  Add Lecture PPT & Extract Topics
                </h3>

                <form onSubmit={handleAddSessionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left input fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#A6888D] uppercase block mb-1">Session / Lecture Name</label>
                      <input
                        id="input-session-title"
                        type="text"
                        required
                        placeholder="e.g. Session 7 - Fiscal Policy & Multipliers"
                        value={newSessionTitle}
                        onChange={(e) => setNewSessionTitle(e.target.value)}
                        className={`w-full text-xs border rounded-xl px-3 py-2.5 bg-white text-[#4F3E42] outline-none focus:ring-1 ${getBorderColorClass(
                          activeCourse.color
                        )}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[#A6888D] uppercase block mb-1">Finish Deadline</label>
                        <input
                          id="input-session-deadline"
                          type="date"
                          value={newSessionDeadline}
                          onChange={(e) => setNewSessionDeadline(e.target.value)}
                          className={`w-full text-xs border rounded-xl px-3 py-2 bg-white outline-none focus:ring-1 ${getBorderColorClass(
                            activeCourse.color
                          )} text-[#4F3E42] font-medium`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right upload dropzone */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold text-[#A6888D] uppercase block">Upload Lecture Slides (PPTX / PDF)</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 transition-all relative ${
                        isDraggingFile
                          ? "bg-pink-50 border-pink-300"
                          : uploadedFile
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : "bg-white border-[#FFE3E6] hover:border-pink-300"
                      }`}
                    >
                      <input
                        id="file-ppt-upload"
                        type="file"
                        accept=".pptx,.ppt,.pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {uploadedFile ? (
                        <div className="text-center">
                          <Check className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                          <p className="text-xs font-bold text-emerald-700 truncate max-w-[200px]">{uploadedFile.name}</p>
                          <p className="text-[10px] text-[#A6888D] mt-0.5">{uploadedFile.size}</p>
                        </div>
                      ) : (
                        <div className="text-center pointer-events-none">
                          <FileUp className="w-7 h-7 text-[#A6888D] mx-auto mb-1.5" />
                          <p className="text-xs font-semibold text-[#4F3E42]">Drag PPT file here or browse</p>
                          <p className="text-[10px] text-[#A6888D] mt-1">Supports PPTX, PPT, PDF</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button spanning across */}
                  <div className="md:col-span-2 pt-2 flex justify-end">
                    <button
                      id="btn-session-submit"
                      type="submit"
                      disabled={isGeneratingTopics || !newSessionTitle.trim()}
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                        isGeneratingTopics ? "bg-pink-100 text-[#FF5A76] cursor-not-allowed" : currentTheme.button
                      }`}
                    >
                      {isGeneratingTopics ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Gemini extracting key study topics...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Upload & Extract Topics with Gemini
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Session Cards Grid */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-[#A6888D] text-sm px-1">
                Uploaded Slides & Study Tracker ({activeSessions.length})
              </h3>

              {activeSessions.length === 0 ? (
                <div className="bg-white border border-[#FFE3E6] rounded-2xl p-10 shadow-xs text-center">
                  <FileText className="w-10 h-10 text-[#A6888D] mx-auto mb-3 stroke-1" />
                  <p className="text-sm font-bold text-[#4F3E42]">No session slides found under {activeTerm === "midterm" ? "Mid terms" : "End terms"}</p>
                  <p className="text-xs text-[#A6888D] mt-1">Use the upload box above to add your lecture PPTs and auto-bifurcate exam checkpoints!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {activeSessions.map((session) => {
                    const completedTopics = session.topics.filter((t) => t.completed).length;
                    const totalTopics = session.topics.length;
                    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

                    return (
                      <div
                        key={session.id}
                        id={`session-card-${session.id}`}
                        className={`bg-white border border-[#FFE3E6] rounded-2xl overflow-hidden shadow-xs transition-all hover:border-[#FFB7C5] border-t-4 border-t-${activeCourse.color === "rose" ? "pink" : activeCourse.color}-400`}
                      >
                        {/* Card Header Info */}
                        <div className="p-5 border-b border-[#FFE3E6]">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-base font-extrabold text-[#4A2B30] leading-snug">
                                  {session.title}
                                </h4>
                                {session.fileName && (
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#FFF2F4] text-[#FF5A76] px-2 py-0.5 rounded-full font-mono max-w-[150px] truncate border border-[#FFE3E6]" title={session.fileName}>
                                    <FileText className="w-3 h-3 shrink-0" />
                                    {session.fileName}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-[#A6888D]">
                                <div className="flex items-center gap-1.5 font-semibold">
                                  <Calendar className="w-3.5 h-3.5 text-[#A6888D]" />
                                  <span>Deadline:</span>
                                  <input
                                    id={`session-deadline-${session.id}`}
                                    type="date"
                                    value={session.deadline}
                                    onChange={(e) => handleUpdateDeadline(session.id, e.target.value)}
                                    className="border-b border-transparent hover:border-pink-200 focus:border-[#FF5A76] bg-transparent text-[#4F3E42] outline-none px-1"
                                  />
                                </div>

                                <div className="flex items-center gap-1.5 font-bold">
                                  <div className="w-16 h-2 bg-[#FFF2F4] rounded-full overflow-hidden">
                                    <div
                                      className={`h-full bg-${activeCourse.color === "rose" ? "pink" : activeCourse.color}-400`}
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                  <span className="text-[#FF5A76]">{progressPercent}% Done ({completedTopics}/{totalTopics})</span>
                                </div>
                              </div>
                            </div>

                            {/* Main broader tick box against the session */}
                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                id={`btn-toggle-session-${session.id}`}
                                onClick={() => handleToggleSessionCompleted(session.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs transition ${
                                  session.completed
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    : "bg-white text-[#A6888D] border border-[#FFE3E6] hover:bg-[#FFF2F4] hover:text-[#FF5A76]"
                                }`}
                              >
                                {session.completed ? (
                                  <>
                                    <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                                    Session Completed
                                  </>
                                ) : (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-[#FFE3E6] rounded-sm" />
                                    Mark Session Complete
                                  </>
                                )}
                              </button>

                              {deletingSessionId === session.id ? (
                                <div className="flex items-center gap-1.5 bg-[#FFF2F4] border border-[#FFE3E6] p-1 px-2 rounded-xl">
                                  <span className="text-[10px] font-extrabold text-[#FF5A76]">Delete?</span>
                                  <button
                                    id={`btn-confirm-delete-session-${session.id}`}
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="px-2 py-0.5 text-[9px] font-bold bg-[#FF5A76] text-white rounded-md hover:bg-[#FF3B5D] transition-colors"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    id={`btn-cancel-delete-session-${session.id}`}
                                    onClick={() => setDeletingSessionId(null)}
                                    className="px-1.5 py-0.5 text-[9px] font-bold bg-white text-[#A6888D] rounded-md hover:text-[#FF5A76] border border-[#FFE3E6] transition-colors"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  id={`btn-delete-session-${session.id}`}
                                  onClick={() => setDeletingSessionId(session.id)}
                                  className="p-2 text-[#A6888D] hover:text-[#FF5A76] hover:bg-[#FFF2F4] rounded-xl transition"
                                  title="Remove Session"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Sub-body details: Bifurcated Topics Checklist & Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2">
                          {/* Left Checkbox List of Topics */}
                          <div className="p-5 border-r border-[#FFE3E6] bg-[#FFF2F4]/10">
                            <h5 className="text-[11px] font-extrabold text-[#A6888D] uppercase tracking-wider mb-3">
                              Bifurcated Important Topics
                            </h5>

                            <div className="space-y-2.5">
                              {session.topics.map((topic) => (
                                <div
                                  key={topic.id}
                                  id={`topic-item-${topic.id}`}
                                  onClick={() => handleToggleTopicCompleted(session.id, topic.id)}
                                  className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition ${
                                    topic.completed
                                      ? "bg-emerald-50/40 text-[#A6888D]"
                                      : "hover:bg-[#FFF2F4]/40 text-[#4F3E42]"
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {topic.completed ? (
                                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                      <Square className="w-4 h-4 text-[#A6888D] hover:text-[#FF5A76]" />
                                    )}
                                  </div>
                                  <span className={`text-xs font-semibold leading-normal ${topic.completed ? "line-through text-[#A6888D]" : ""}`}>
                                    {topic.text}
                                  </span>
                                </div>
                              ))}

                              {/* Inline Topic Add Form */}
                              {addingTopicSessionId === session.id ? (
                                <div className="flex gap-2 pt-2">
                                  <input
                                    id="input-new-custom-topic"
                                    type="text"
                                    placeholder="Add specialized custom topic..."
                                    value={newTopicText}
                                    onChange={(e) => setNewTopicText(e.target.value)}
                                    className="flex-1 text-xs border border-[#FFE3E6] bg-white text-[#4F3E42] rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-pink-400/50"
                                  />
                                  <button
                                    id="btn-save-custom-topic"
                                    onClick={() => handleAddCustomTopic(session.id)}
                                    className="px-3 py-1 bg-pink-500 text-white font-bold text-[11px] rounded-lg hover:bg-pink-600 transition"
                                  >
                                    Add
                                  </button>
                                  <button
                                    id="btn-cancel-custom-topic"
                                    onClick={() => {
                                      setNewTopicText("");
                                      setAddingTopicSessionId(null);
                                    }}
                                    className="px-2 py-1 text-[#A6888D] hover:text-[#FF5A76] font-bold text-[11px]"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  id={`btn-add-topic-${session.id}`}
                                  onClick={() => setAddingTopicSessionId(session.id)}
                                  className="text-xs text-[#FF5A76] hover:text-[#FF3B5D] font-bold flex items-center gap-1 px-1.5 py-1 hover:bg-[#FFF2F4] rounded-lg transition"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add Topic Checkpoint
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Right Notes Editor within same block */}
                          <div className="p-5 flex flex-col h-full min-h-[160px] bg-[#FFF2F4]/5">
                            <h5 className="text-[11px] font-extrabold text-[#A6888D] uppercase tracking-wider mb-2">
                              Study Notes
                            </h5>
                            <textarea
                              id={`session-notes-${session.id}`}
                              placeholder="Type session definitions, textbook references, formulas or case highlights..."
                              value={session.notes}
                              onChange={(e) => handleUpdateNotes(session.id, e.target.value)}
                              className="flex-1 text-xs border border-[#FFE3E6] bg-white text-[#4F3E42] focus:border-pink-300 focus:ring-1 focus:ring-pink-300/30 rounded-xl p-3 outline-none resize-none leading-relaxed custom-scrollbar font-medium shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white border border-[#FFE3E6] rounded-2xl p-12 shadow-xs text-center">
            <BookOpen className="w-12 h-12 text-[#FF5A76] mx-auto mb-4 stroke-1" />
            <h3 className="text-base font-extrabold text-[#4F3E42]">No Course Selected</h3>
            <p className="text-xs text-[#A6888D] mt-2 max-w-sm mx-auto">
              Please enter a course name in the "My Courses" panel on the left to start setting up exam tracks and session lists.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
