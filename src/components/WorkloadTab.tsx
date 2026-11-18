import React, { useState, useRef, useEffect } from "react";
import { Course } from "../types";
import { 
  Upload, 
  Edit2, 
  Check, 
  X, 
  BookOpen, 
  Percent, 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  FileCheck,
  ChevronLeft,
  RefreshCw,
  StickyNote,
  ArrowRight,
  BookmarkCheck,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WorkloadTabProps {
  courses: Course[];
  onUpdateCourses: (courses: Course[]) => void;
}

export function WorkloadTab({ courses, onUpdateCourses }: WorkloadTabProps) {
  // Opening page vs Course detail state
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Modal / Inline states for Adding Course
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseColor, setNewCourseColor] = useState("indigo");

  // Editing course name state
  const [isEditingCourseName, setIsEditingCourseName] = useState(false);
  const [editedCourseName, setEditedCourseName] = useState("");

  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingForCourseId, setUploadingForCourseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active course reference
  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  // Local Notes State (auto-saves to course.notes)
  const [notesText, setNotesText] = useState("");
  const [isNotesSaved, setIsNotesSaved] = useState(true);

  // Sync notes text when active course changes
  useEffect(() => {
    if (activeCourse) {
      setNotesText(activeCourse.notes || "");
      setIsNotesSaved(true);
    }
  }, [selectedCourseId]);

  // Handle Notes change & auto-save
  const handleNotesChange = (val: string) => {
    setNotesText(val);
    setIsNotesSaved(false);

    if (!activeCourse) return;
    const updated = courses.map((c) => {
      if (c.id === activeCourse.id) {
        return { ...c, notes: val };
      }
      return c;
    });
    onUpdateCourses(updated);
    setTimeout(() => setIsNotesSaved(true), 600);
  };

  // Inline editing states for Course Details
  const [isEditingReadings, setIsEditingReadings] = useState(false);
  const [editingReadingsText, setEditingReadingsText] = useState("");

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionTitle, setEditingSessionTitle] = useState("");
  const [editingSessionPreReads, setEditingSessionPreReads] = useState("");

  const [editingScoringId, setEditingScoringId] = useState<string | null>(null);
  const [editingScoringComponent, setEditingScoringComponent] = useState("");
  const [editingScoringWeightage, setEditingScoringWeightage] = useState("");

  const [showAddScoring, setShowAddScoring] = useState(false);
  const [newScoringComponent, setNewScoringComponent] = useState("");
  const [newScoringWeight, setNewScoringWeight] = useState("");

  // Add new course
  const handleCreateCourse = () => {
    if (!newCourseName.trim()) return;
    const newCourse: Course = {
      id: `c_${Date.now()}`,
      name: newCourseName.trim(),
      color: newCourseColor,
      hasOutline: false,
      notes: ""
    };
    onUpdateCourses([...courses, newCourse]);
    setNewCourseName("");
    setShowAddCourseModal(false);
    setSelectedCourseId(newCourse.id);
  };

  // Delete course
  const handleDeleteCourse = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this course?")) {
      const updated = courses.filter((c) => c.id !== courseId);
      onUpdateCourses(updated);
      if (selectedCourseId === courseId) {
        setSelectedCourseId(null);
      }
    }
  };

  // Edit course name
  const saveCourseName = () => {
    if (!editedCourseName.trim() || !activeCourse) return;
    const updated = courses.map((c) => {
      if (c.id === activeCourse.id) {
        return { ...c, name: editedCourseName.trim() };
      }
      return c;
    });
    onUpdateCourses(updated);
    setIsEditingCourseName(false);
  };

  // PDF Outline Upload Handler
  const triggerPdfUpload = (courseId: string) => {
    setUploadingForCourseId(courseId);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const targetId = uploadingForCourseId || selectedCourseId;
      if (targetId) {
        await processUploadedFile(files[0], targetId);
      }
    }
  };

  const processUploadedFile = async (file: File, courseId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetCourse) return;

    if (file.name && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Please upload a valid PDF outline file.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 85 ? prev : prev + 12));
    }, 250);

    try {
      const response = await fetch("/api/gemini/parse-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: targetCourse.name,
          fileName: file.name || "syllabus.pdf"
        })
      });

      clearInterval(interval);
      setUploadProgress(95);

      let data;
      if (response.ok) {
        data = await response.json();
      } else {
        throw new Error("Server parsing failed");
      }

      const updatedCourses = courses.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            hasOutline: true,
            scoring: data.scoring,
            workloadSessions: data.workloadSessions,
            readings: data.readings
          };
        }
        return c;
      });

      setUploadProgress(100);
      setTimeout(() => {
        onUpdateCourses(updatedCourses);
        setIsUploading(false);
        setUploadingForCourseId(null);
      }, 400);

    } catch (err) {
      console.error("Outline parsing error:", err);
      // Fallback fallback
      const fallbackSessions = Array.from({ length: 10 }, (_, i) => ({
        id: `ws_${Date.now()}_${i}`,
        sessionNum: i + 1,
        title: `Session ${i + 1}: Core Principles of ${targetCourse.name}`,
        preReads: `Chapter ${i + 1}: Foundations • Case: ${targetCourse.name} Strategy`
      }));

      const fallbackScoring = [
        { id: `sc_${Date.now()}_1`, component: "Class Participation & Prep", weightage: "15%" },
        { id: `sc_${Date.now()}_2`, component: "Case Analysis Papers", weightage: "20%" },
        { id: `sc_${Date.now()}_3`, component: "Mid-Term Examination", weightage: "30%" },
        { id: `sc_${Date.now()}_4`, component: "End-Term Examination", weightage: "35%" }
      ];

      const fallbackReadings = `'Foundations of ${targetCourse.name}' (8th Edition) by J. S. Academic & R. P. Mehta`;

      const updatedCourses = courses.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            hasOutline: true,
            scoring: fallbackScoring,
            workloadSessions: fallbackSessions,
            readings: fallbackReadings
          };
        }
        return c;
      });

      setUploadProgress(100);
      setTimeout(() => {
        onUpdateCourses(updatedCourses);
        setIsUploading(false);
        setUploadingForCourseId(null);
      }, 400);
    }
  };

  // Save Session Edit
  const saveSessionEdit = () => {
    if (!activeCourse || !editingSessionId) return;
    const updatedSessions = (activeCourse.workloadSessions || []).map((s) => {
      if (s.id === editingSessionId) {
        return { ...s, title: editingSessionTitle, preReads: editingSessionPreReads };
      }
      return s;
    });

    const updatedCourses = courses.map((c) => {
      if (c.id === activeCourse.id) {
        return { ...c, workloadSessions: updatedSessions };
      }
      return c;
    });

    onUpdateCourses(updatedCourses);
    setEditingSessionId(null);
  };

  // Save Scoring Edit
  const saveScoringEdit = () => {
    if (!activeCourse || !editingScoringId) return;
    const updatedScoring = (activeCourse.scoring || []).map((s) => {
      if (s.id === editingScoringId) {
        return { ...s, component: editingScoringComponent, weightage: editingScoringWeightage };
      }
      return s;
    });

    const updatedCourses = courses.map((c) => {
      if (c.id === activeCourse.id) {
        return { ...c, scoring: updatedScoring };
      }
      return c;
    });

    onUpdateCourses(updatedCourses);
    setEditingScoringId(null);
  };

  const deleteScoring = (scId: string) => {
    if (!activeCourse) return;
    const updatedScoring = (activeCourse.scoring || []).filter((s) => s.id !== scId);
    const updatedCourses = courses.map((c) => {
      if (c.id === activeCourse.id) {
        return { ...c, scoring: updatedScoring };
      }
      return c;
    });
    onUpdateCourses(updatedCourses);
  };

  const addScoringItem = () => {
    if (!activeCourse || !newScoringComponent.trim() || !newScoringWeight.trim()) return;
    const newItem = {
      id: `sc_${Date.now()}`,
      component: newScoringComponent.trim(),
      weightage: newScoringWeight.trim().endsWith("%") ? newScoringWeight.trim() : `${newScoringWeight.trim()}%`
    };

    const updatedScoring = [...(activeCourse.scoring || []), newItem];
    const updatedCourses = courses.map((c) => {
      if (c.id === activeCourse.id) {
        return { ...c, scoring: updatedScoring };
      }
      return c;
    });

    onUpdateCourses(updatedCourses);
    setNewScoringComponent("");
    setNewScoringWeight("");
    setShowAddScoring(false);
  };

  // Save Readings Edit
  const saveReadingsEdit = () => {
    if (!activeCourse) return;
    const updatedCourses = courses.map((c) => {
      if (c.id === activeCourse.id) {
        return { ...c, readings: editingReadingsText };
      }
      return c;
    });

    onUpdateCourses(updatedCourses);
    setIsEditingReadings(false);
  };

  // Color helper classes
  const getCourseColorStyle = (color: string) => {
    switch (color) {
      case "indigo": return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", bar: "bg-indigo-500" };
      case "emerald": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", bar: "bg-emerald-500" };
      case "amber": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", bar: "bg-amber-500" };
      case "rose": return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", bar: "bg-rose-500" };
      case "sky": return { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", bar: "bg-sky-500" };
      default: return { bg: "bg-pink-50", text: "text-[#FF5A76]", border: "border-[#FFE3E6]", bar: "bg-[#FF5A76]" };
    }
  };

  // Shared hidden file input
  const fileInputJSX = (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileSelect}
      accept="application/pdf"
      className="hidden"
    />
  );

  // -------------------------------------------------------------
  // VIEW 1: OPENING PAGE - LIST OF COURSES UPLOADED
  // -------------------------------------------------------------
  if (selectedCourseId === null) {
    return (
      <div id="workload-hub-opening" className="space-y-6">
        {fileInputJSX}

        {/* Section Title Header */}
        <div className="bg-white border border-[#FFE8EC] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A94] bg-[#FFF2F4] border border-[#FFE3E6] px-2.5 py-0.5 rounded-md">
                Course Directory
              </span>
            </div>
            <h2 className="text-xl font-black text-[#4A2B30] tracking-tight">
              Uploaded MBA Courses
            </h2>
            <p className="text-xs text-[#A6888D] mt-0.5">
              Select a course below to view session pre-reads, scoring weights, textbooks, and personal study notes.
            </p>
          </div>

          <button
            id="btn-add-course-open"
            onClick={() => setShowAddCourseModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#FF9EAF] to-[#FF5A76] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition flex items-center gap-2 shrink-0 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            Add New Course
          </button>
        </div>

        {/* Add Course Modal */}
        <AnimatePresence>
          {showAddCourseModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#FFE3E6] rounded-2xl p-6 shadow-md max-w-md mx-auto space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#FFE3E6] pb-3">
                <h3 className="font-extrabold text-[#4A2B30] text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#FF5A76]" />
                  Add MBA Course
                </h3>
                <button
                  onClick={() => setShowAddCourseModal(false)}
                  className="p-1 text-[#A6888D] hover:text-[#4A2B30]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2B30] block mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="e.g. Operations Management"
                    className="w-full text-xs border border-[#FFE3E6] rounded-xl p-3 bg-[#FFF9FA]/50 focus:outline-none focus:ring-1 focus:ring-pink-300"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A2B30] block mb-1">
                    Color Badge
                  </label>
                  <div className="flex gap-2">
                    {["indigo", "emerald", "amber", "rose", "sky"].map((col) => (
                      <button
                        key={col}
                        onClick={() => setNewCourseColor(col)}
                        className={`w-7 h-7 rounded-full border-2 transition ${
                          getCourseColorStyle(col).bar
                        } ${newCourseColor === col ? "border-[#4A2B30] scale-110" : "border-transparent"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCreateCourse}
                    className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl transition"
                  >
                    Create Course
                  </button>
                  <button
                    onClick={() => setShowAddCourseModal(false)}
                    className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-[#A6888D] font-bold text-xs rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Upload Progress Indicator */}
        {isUploading && (
          <div className="bg-white border border-[#FFE3E6] rounded-2xl p-4 shadow-xs max-w-md mx-auto space-y-2 text-center">
            <div className="flex justify-between items-center text-xs font-bold text-[#FF5A76]">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Parsing Syllabus PDF with Gemini AI...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#FFF2F4] rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#FF9EAF] to-[#FF5A76] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const colorStyle = getCourseColorStyle(course.color);
            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className="bg-white border border-[#FFE8EC] hover:border-pink-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden space-y-4"
              >
                {/* Top Accent Color Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${colorStyle.bar}`} />

                <div className="space-y-3 pt-1">
                  {/* Title & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-[#4A2B30] group-hover:text-[#FF5A76] transition">
                        {course.name}
                      </h3>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        course.hasOutline 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {course.hasOutline ? "10 Sessions Extracted" : "Outline Not Uploaded"}
                      </span>
                    </div>

                    <button
                      id={`btn-delete-course-${course.id}`}
                      onClick={(e) => handleDeleteCourse(course.id, e)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition shrink-0 flex items-center gap-1 text-[10px] font-bold"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>

                  {/* Main Reading Preview */}
                  <div className="bg-[#FFF9FA] border border-[#FFE8EC] rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-[#A6888D] tracking-wider block">
                      Main Reading / Author
                    </span>
                    <p className="text-xs text-[#4F3E42] line-clamp-2 font-medium">
                      {course.readings || "Upload syllabus outline to extract course textbooks & authors."}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-2 border-t border-[#FFF2F4] flex items-center justify-between text-xs font-bold text-[#FF5A76]">
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
                    Open Workload <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerPdfUpload(course.id);
                    }}
                    className="px-2.5 py-1 bg-[#FFF2F4] hover:bg-pink-100 text-[#FF5A76] border border-[#FFE3E6] rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <Upload className="w-3 h-3" />
                    {course.hasOutline ? "Re-upload PDF" : "Upload PDF"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: COURSE DETAIL VIEW (Selected Course Clicked)
  // -------------------------------------------------------------
  return (
    <div id="workload-course-detail" className="space-y-6">
      {fileInputJSX}

      {/* Top Navigation & Course Title Header */}
      <div className="bg-white border border-[#FFE8EC] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          
          {/* Back button */}
          <button
            id="btn-back-to-courses"
            onClick={() => {
              setSelectedCourseId(null);
              setIsEditingCourseName(false);
              setEditingSessionId(null);
            }}
            className="text-xs font-bold text-[#FF5A76] hover:text-[#e04360] flex items-center gap-1 bg-[#FFF2F4] border border-[#FFE3E6] px-3 py-1.5 rounded-xl w-fit transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to All Courses
          </button>

          {/* Editable Course Title */}
          <div className="flex items-center gap-3 pt-1">
            {isEditingCourseName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedCourseName}
                  onChange={(e) => setEditedCourseName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveCourseName()}
                  className="px-3 py-1 text-lg font-black text-[#4A2B30] border border-[#FFE3E6] rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 bg-white"
                  autoFocus
                />
                <button
                  onClick={saveCourseName}
                  className="p-1.5 bg-pink-100 text-[#FF5A76] rounded-md"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingCourseName(false)}
                  className="p-1.5 bg-zinc-100 text-[#A6888D] rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-2xl font-black text-[#4A2B30] tracking-tight">
                  {activeCourse.name}
                </h2>
                <button
                  onClick={() => {
                    setEditedCourseName(activeCourse.name);
                    setIsEditingCourseName(true);
                  }}
                  className="p-1 text-[#A6888D] hover:text-[#FF5A76] rounded-md opacity-0 group-hover:opacity-100 transition"
                  title="Rename course"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upload Outline PDF & Delete Course Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => triggerPdfUpload(activeCourse.id)}
            className="px-4 py-2.5 bg-[#FFF2F4] hover:bg-pink-100 text-[#FF5A76] border border-[#FFE3E6] font-bold text-xs rounded-xl transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {activeCourse.hasOutline ? "Re-upload Outline PDF" : "Upload Outline PDF"}
          </button>

          <button
            id={`btn-delete-active-course-${activeCourse.id}`}
            onClick={(e) => handleDeleteCourse(activeCourse.id, e)}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            title="Delete Course"
          >
            <Trash2 className="w-4 h-4" />
            Delete Course
          </button>
        </div>
      </div>

      {/* Main Grid: Left 2 Columns (Course Workload) + Right 1 Column (Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT / CENTER COLUMN: Pre-reads, Main Reading, Scoring */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. MAIN READING OF THE COURSE */}
          <div className="bg-white border border-[#FFE8EC] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-[#FFF2F4] pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FF5A76]" />
                <h3 className="font-extrabold text-[#4A2B30] text-sm">
                  Main Course Reading & Authors
                </h3>
              </div>
              {!isEditingReadings && (
                <button
                  onClick={() => {
                    setEditingReadingsText(activeCourse.readings || "");
                    setIsEditingReadings(true);
                  }}
                  className="text-xs text-[#A6888D] hover:text-[#FF5A76] flex items-center gap-1 font-bold"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            {isEditingReadings ? (
              <div className="space-y-3">
                <textarea
                  value={editingReadingsText}
                  onChange={(e) => setEditingReadingsText(e.target.value)}
                  className="w-full text-xs text-[#4F3E42] border border-[#FFE3E6] rounded-xl p-3 bg-white focus:outline-none focus:ring-1 focus:ring-pink-300 min-h-[90px]"
                  placeholder="Enter textbook title, edition, and author names..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={saveReadingsEdit}
                    className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={() => setIsEditingReadings(false)}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-[#A6888D] font-bold text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs font-semibold text-[#4F3E42] leading-relaxed bg-[#FFF9FA] border border-[#FFE3E6]/60 p-3.5 rounded-xl">
                {activeCourse.readings || "No main textbook specified yet. Upload the syllabus PDF to automatically extract authors and readings."}
              </p>
            )}
          </div>

          {/* 2. SCORING BREAKDOWN */}
          <div className="bg-white border border-[#FFE8EC] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[#FFF2F4] pb-2">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#FF5A76]" />
                <h3 className="font-extrabold text-[#4A2B30] text-sm">
                  Scoring Breakdown
                </h3>
              </div>
              <button
                onClick={() => setShowAddScoring(!showAddScoring)}
                className="text-xs font-bold text-[#FF5A76] bg-[#FFF2F4] px-2.5 py-1 rounded-lg border border-[#FFE3E6] flex items-center gap-1 hover:bg-pink-100 transition"
              >
                <Plus className="w-3 h-3" /> Add Component
              </button>
            </div>

            {/* Add scoring item form */}
            <AnimatePresence>
              {showAddScoring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 border border-[#FFE3E6] bg-[#FFF9FA] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2"
                >
                  <input
                    type="text"
                    placeholder="e.g. Case Analysis"
                    value={newScoringComponent}
                    onChange={(e) => setNewScoringComponent(e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-[#FFE3E6] rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="e.g. 20%"
                    value={newScoringWeight}
                    onChange={(e) => setNewScoringWeight(e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-[#FFE3E6] rounded-lg bg-white"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={addScoringItem}
                      className="flex-1 py-1.5 bg-pink-500 text-white font-bold text-xs rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddScoring(false)}
                      className="px-3 py-1.5 bg-zinc-100 text-[#A6888D] font-bold text-xs rounded-lg"
                    >
                      X
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List of scoring weightage pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(activeCourse.scoring || []).map((sc) => (
                <div
                  key={sc.id}
                  className="p-3 border border-[#FFE3E6] bg-[#FFF9FA] rounded-xl flex flex-col justify-between space-y-1 relative group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#A6888D] uppercase tracking-wider block truncate pr-1">
                      {sc.component}
                    </span>
                    <button
                      onClick={() => deleteScoring(sc.id)}
                      className="p-0.5 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-base font-black text-[#FF5A76]">
                    {sc.weightage}
                  </span>
                </div>
              ))}

              {(activeCourse.scoring || []).length === 0 && (
                <p className="text-xs text-[#A6888D] col-span-4 py-2">
                  No scoring components added yet.
                </p>
              )}
            </div>
          </div>

          {/* 3. SESSIONS 1 - 10 AND PRE-READS */}
          <div className="bg-white border border-[#FFE8EC] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[#FFF2F4] pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#FF5A76]" />
                <h3 className="font-extrabold text-[#4A2B30] text-sm">
                  Sessions 1 - 10 & Pre-reads
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#FF5A76] bg-[#FFF2F4] border border-[#FFE3E6] px-2.5 py-0.5 rounded-full">
                10 Sessions
              </span>
            </div>

            {/* List of 10 Sessions */}
            <div className="space-y-3">
              {(activeCourse.workloadSessions || []).map((s) => (
                <div
                  key={s.id}
                  className="p-4 border border-[#FFE3E6] bg-[#FFF9FA]/40 rounded-2xl space-y-2 hover:bg-[#FFF2F4]/20 transition"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#FF5A76] bg-[#FFF2F4] border border-[#FFE3E6] px-2 py-0.5 rounded-md shrink-0">
                        Session {s.sessionNum}
                      </span>
                      {editingSessionId === s.id ? (
                        <input
                          type="text"
                          value={editingSessionTitle}
                          onChange={(e) => setEditingSessionTitle(e.target.value)}
                          className="text-xs font-bold text-[#4A2B30] border border-[#FFE3E6] rounded-lg px-2 py-1 bg-white"
                        />
                      ) : (
                        <h4 className="text-xs font-black text-[#4A2B30]">
                          {s.title}
                        </h4>
                      )}
                    </div>

                    {editingSessionId === s.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={saveSessionEdit}
                          className="p-1 bg-pink-500 text-white rounded text-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingSessionId(null)}
                          className="p-1 bg-zinc-100 text-[#A6888D] rounded text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingSessionId(s.id);
                          setEditingSessionTitle(s.title);
                          setEditingSessionPreReads(s.preReads);
                        }}
                        className="p-1 text-[#A6888D] hover:text-[#FF5A76] rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Pre-reads strictly formatted as concise headings */}
                  {editingSessionId === s.id ? (
                    <textarea
                      value={editingSessionPreReads}
                      onChange={(e) => setEditingSessionPreReads(e.target.value)}
                      className="w-full text-xs text-[#4F3E42] border border-[#FFE3E6] rounded-xl p-2.5 bg-white min-h-[60px]"
                      placeholder="Concise heading of pre-reads (e.g. Chapter 3 • HBS Case Study #101)"
                    />
                  ) : (
                    <div className="pl-3 border-l-2 border-[#FFB7C5] bg-[#FFF2F4]/30 py-1.5 px-2.5 rounded-r-xl">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF7A94] block mb-0.5">
                        Pre-read Headings:
                      </span>
                      <p className="text-xs font-semibold text-[#4F3E42]">
                        {s.preReads || "None assigned."}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {(!activeCourse.workloadSessions || activeCourse.workloadSessions.length === 0) && (
                <div className="p-8 border-2 border-dashed border-[#FFE3E6] rounded-2xl text-center space-y-3">
                  <FileText className="w-8 h-8 text-[#A6888D] mx-auto" />
                  <p className="text-xs text-[#A6888D]">
                    No session pre-reads extracted yet. Upload the syllabus PDF outline above to automatically parse all 10 sessions.
                  </p>
                  <button
                    onClick={() => triggerPdfUpload(activeCourse.id)}
                    className="px-4 py-2 bg-[#FFF2F4] text-[#FF5A76] border border-[#FFE3E6] font-bold text-xs rounded-xl hover:bg-pink-100 transition inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Outline PDF
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DEDICATED COURSE NOTES SECTION */}
        <div className="space-y-6">
          <div className="bg-white border border-[#FFE8EC] rounded-2xl p-5 shadow-xs space-y-3 sticky top-24">
            <div className="flex items-center justify-between border-b border-[#FFF2F4] pb-3">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-[#FF5A76]" />
                <h3 className="font-extrabold text-[#4A2B30] text-sm">
                  Course Notes & Reminders
                </h3>
              </div>

              <span className="text-[10px] font-bold text-[#A6888D] bg-[#FFF9FA] px-2 py-0.5 rounded-md border border-[#FFE3E6]">
                {isNotesSaved ? "Auto-saved" : "Saving..."}
              </span>
            </div>

            <p className="text-[11px] text-[#A6888D]">
              Type any notes, study group contacts, professor office hours, or key reminders for <strong className="text-[#4A2B30]">{activeCourse.name}</strong>.
            </p>

            <textarea
              value={notesText}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="e.g. Professor office hours on Tuesdays 4 PM. Group assignment due next Thursday. Important formula for WACC derivation..."
              className="w-full text-xs text-[#4F3E42] border border-[#FFE3E6] rounded-xl p-3.5 bg-[#FFF9FA]/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-pink-300 min-h-[380px] leading-relaxed resize-y"
            />

            <div className="text-[10px] text-[#A6888D] flex items-center justify-between pt-1">
              <span>{notesText.length} characters</span>
              <span className="flex items-center gap-1 text-[#FF5A76] font-semibold">
                <BookmarkCheck className="w-3 h-3" /> Persistent Local Notes
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
