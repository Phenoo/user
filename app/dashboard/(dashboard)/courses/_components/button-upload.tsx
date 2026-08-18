"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  FileUp,
  UploadCloud,
  Sparkles,
  Loader2,
  Trash2,
  Plus,
  CheckCircle2,
  BookOpen,
  Calendar,
  User,
  GraduationCap,
} from "lucide-react";
import GenerateButton from "@/components/generate-button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useUsageTracking } from "@/hooks/use-usage-tracking";

interface ExtractedCourse {
  id: string;
  selected: boolean;
  name: string;
  code: string;
  credits: number;
  academicYear: string;
  session: string;
  instructor: string;
  description?: string;
}

const COURSE_COLORS = [
  "bg-[#FED35B] border-[#FED35B] text-black dark:bg-[#8A6B2E] dark:border-[#8A6B2E] dark:text-white",
  "bg-[#B6C682] border-[#B6C682] text-black dark:bg-[#6E7A4C] dark:border-[#6E7A4C] dark:text-white",
  "bg-[#C3ABFF] border-[#C3ABFF] text-black dark:bg-[#6F5A99] dark:border-[#6F5A99] dark:text-white",
  "bg-[#D2D2FB] border-[#D2D2FB] text-black dark:bg-[#555577] dark:border-[#555577] dark:text-white",
  "bg-[#b6caeb] border-[#b6caeb] text-black dark:bg-[#4A6075] dark:border-[#4A6075] dark:text-white",
  "bg-primary border-primary text-black dark:bg-primary dark:border-primary dark:text-white",
  "bg-[#ef6438] border-[#ef6438] text-white dark:bg-[#a63d1c] dark:border-[#a63d1c] dark:text-white",
];

const ButtonUpload = () => {
  const user = useQuery(api.users.currentUser);
  const batchAddCourses = useMutation(api.courses.batchAddCourses);
  const { trackUsage } = useUsageTracking();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [defaultYear, setDefaultYear] = useState("2025");
  const [defaultSession, setDefaultSession] = useState("Fall");

  const [extractedCourses, setExtractedCourses] = useState<ExtractedCourse[]>([]);
  const [sourceFileName, setSourceFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const validExtensions = [".pdf", ".docx", ".doc", ".txt", ".png", ".jpg", ".jpeg", ".webp"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validExtensions.includes(fileExt) && !file.type.includes("pdf") && !file.type.includes("image")) {
      toast.error("Please upload a valid PDF, Word document, text file, or image.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 20MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleExtractAI = async () => {
    if (!selectedFile) {
      toast.error("Please select a syllabus, transcript, or course document.");
      return;
    }

    try {
      setIsExtracting(true);
      toast.loading("Analyzing document with AI...", { id: "course-ai" });

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", user?._id || "anonymous");
      formData.append("defaultAcademicYear", defaultYear);
      formData.append("defaultSession", defaultSession);

      const response = await fetch("/api/courses/parse-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to extract courses.");
      }

      const coursesList = data.courses || [];

      if (coursesList.length === 0) {
        toast.error("No courses could be identified in this document.", {
          id: "course-ai",
        });
        return;
      }

      const formattedCourses: ExtractedCourse[] = coursesList.map(
        (c: any, index: number) => ({
          id: `extracted-${Date.now()}-${index}`,
          selected: true,
          name: c.name || "Untitled Course",
          code: c.code || `COURSE-${index + 1}`,
          credits: typeof c.credits === "number" && c.credits > 0 ? c.credits : 3,
          academicYear: c.academicYear || defaultYear,
          session: c.session || defaultSession,
          instructor: c.instructor || "TBD",
          description: c.description || "",
        })
      );

      setExtractedCourses(formattedCourses);
      setSourceFileName(data.fileName || selectedFile.name);

      // Close upload dialog and open validation sheet
      setIsDialogOpen(false);
      setIsSheetOpen(true);
      toast.success(`Found ${formattedCourses.length} courses! Please review below.`, {
        id: "course-ai",
      });
    } catch (error: any) {
      console.error("Extraction error:", error);
      toast.error(error?.message || "Failed to extract courses. Please try again.", {
        id: "course-ai",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpdateCourse = (id: string, field: keyof ExtractedCourse, value: any) => {
    setExtractedCourses((prev) =>
      prev.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  const handleDeleteCourse = (id: string) => {
    setExtractedCourses((prev) => prev.filter((course) => course.id !== id));
  };

  const handleAddNewCourse = () => {
    const newCourse: ExtractedCourse = {
      id: `manual-${Date.now()}`,
      selected: true,
      name: "",
      code: "",
      credits: 3,
      academicYear: defaultYear,
      session: defaultSession,
      instructor: "TBD",
      description: "",
    };
    setExtractedCourses((prev) => [newCourse, ...prev]);
  };

  const handleSelectAll = (select: boolean) => {
    setExtractedCourses((prev) =>
      prev.map((c) => ({ ...c, selected: select }))
    );
  };

  const handleSaveCourses = async () => {
    if (!user?._id) {
      toast.error("Please sign in to save courses.");
      return;
    }

    const selectedCourses = extractedCourses.filter((c) => c.selected);

    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to save.");
      return;
    }

    // Validate that required fields are filled
    for (const c of selectedCourses) {
      if (!c.name.trim() || !c.code.trim()) {
        toast.error("Please ensure all selected courses have a name and code.");
        return;
      }
    }

    try {
      setIsSaving(true);
      const usageTracked = await trackUsage("COURSES_CREATED");
      if (!usageTracked) {
        setIsSaving(false);
        return;
      }

      const formattedForConvex = selectedCourses.map((c) => ({
        name: c.name.trim(),
        code: c.code.trim(),
        academicYear: c.academicYear || defaultYear,
        session: c.session || defaultSession,
        instructor: c.instructor?.trim() || "TBD",
        credits: Number(c.credits) || 3,
        description: c.description?.trim() || undefined,
        lmsLink: "",
        colorTag: COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)],
        status: "active" as const,
      }));

      await batchAddCourses({
        userId: user._id,
        courses: formattedForConvex,
      });

      toast.success(`Successfully imported ${selectedCourses.length} course${selectedCourses.length > 1 ? "s" : ""}!`);
      setIsSheetOpen(false);
      setSelectedFile(null);
      setExtractedCourses([]);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err?.message || "Failed to save courses.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = extractedCourses.filter((c) => c.selected).length;
  const totalUnits = extractedCourses
    .filter((c) => c.selected)
    .reduce((sum, c) => sum + (Number(c.credits) || 0), 0);

  return (
    <>
      {/* Upload Dialog Trigger */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedFile(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl border-border/80 hover:border-primary/40 hover:bg-muted/50 transition-all text-sm font-medium gap-2 shadow-xs group cursor-pointer"
          >
            <FileUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span>Import from Syllabus</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold border border-border/50">
              PDF
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl border border-border/60 shadow-xl bg-card">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Import from Syllabus
              </DialogTitle>
              <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider font-semibold px-2 py-0.5 bg-muted text-foreground border-border/60">
                Auto-Detect
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Upload your syllabus, course registration document, or transcript to automatically populate your courses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : selectedFile
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/80 hover:border-primary/40 hover:bg-muted/40 bg-muted/10"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <div className="space-y-2 flex flex-col items-center w-full">
                  <div className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-background border border-border/60 shadow-xs">
                    <div className="text-left min-w-0 pr-2">
                      <p className="font-semibold text-xs text-foreground truncate max-w-[280px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col items-center py-2">
                  <p className="text-xs font-medium text-foreground">
                    Drop your document here, or <span className="text-primary underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Supports PDF, DOCX, TXT, or syllabus image (up to 20MB)
                  </p>
                </div>
              )}
            </div>

            {/* Academic Term Configuration */}
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-2.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Default Target Term
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="defaultYear" className="text-[11px] text-foreground font-medium">
                    Academic Year
                  </Label>
                  <Select value={defaultYear} onValueChange={setDefaultYear}>
                    <SelectTrigger id="defaultYear" className="h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="defaultSession" className="text-[11px] text-foreground font-medium">
                    Semester
                  </Label>
                  <Select value={defaultSession} onValueChange={setDefaultSession}>
                    <SelectTrigger id="defaultSession" className="h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fall">1st Semester (Fall)</SelectItem>
                      <SelectItem value="Spring">2nd Semester (Spring)</SelectItem>
                      <SelectItem value="Summer">3rd Semester (Summer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              disabled={isExtracting}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExtractAI}
              disabled={!selectedFile || isExtracting}
              className="text-xs h-9 px-4 font-semibold shadow-xs"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Extracting Courses...
                </>
              ) : (
                "Analyze & Extract"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Validation & Review Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-3xl w-full flex flex-col p-0 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border bg-card">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Review & Validate Courses
                </SheetTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  {extractedCourses.length} Courses Found
                </Badge>
              </div>
              <SheetDescription className="text-xs">
                Extracted from <span className="font-semibold text-foreground">{sourceFileName}</span>. Review and edit the course codes, unit credits, and instructors before saving.
              </SheetDescription>
            </SheetHeader>

            {/* Quick Action Toolbar */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/50 text-xs">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(true)}
                  className="h-7 px-2 text-xs"
                >
                  Select All
                </Button>
                <span className="text-muted-foreground">|</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                  className="h-7 px-2 text-xs"
                >
                  Deselect All
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddNewCourse}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Course
              </Button>
            </div>
          </div>

          {/* Body: Course List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
            {extractedCourses.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium">No courses in the list</p>
                <Button size="sm" onClick={handleAddNewCourse}>
                  <Plus className="w-4 h-4 mr-1" /> Add Course Manually
                </Button>
              </div>
            ) : (
              extractedCourses.map((course, idx) => (
                <Card
                  key={course.id}
                  className={`transition-all border ${
                    course.selected
                      ? "border-primary/40 shadow-sm bg-card"
                      : "border-border/50 opacity-60 bg-muted/20"
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`select-${course.id}`}
                          checked={course.selected}
                          onCheckedChange={(checked) =>
                            handleUpdateCourse(course.id, "selected", !!checked)
                          }
                          className="h-4 w-4"
                        />
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-mono font-bold">
                            #{idx + 1}
                          </Badge>
                          <span className="text-xs font-semibold text-muted-foreground uppercase">
                            Course Details
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Code */}
                      <div className="sm:col-span-3 space-y-1">
                        <Label htmlFor={`code-${course.id}`} className="text-[11px] text-muted-foreground">
                          Course Code
                        </Label>
                        <Input
                          id={`code-${course.id}`}
                          value={course.code}
                          onChange={(e) =>
                            handleUpdateCourse(course.id, "code", e.target.value)
                          }
                          placeholder="e.g. CS101"
                          className="h-8 text-xs font-mono font-bold uppercase"
                        />
                      </div>

                      {/* Name */}
                      <div className="sm:col-span-6 space-y-1">
                        <Label htmlFor={`name-${course.id}`} className="text-[11px] text-muted-foreground">
                          Course Name / Title
                        </Label>
                        <Input
                          id={`name-${course.id}`}
                          value={course.name}
                          onChange={(e) =>
                            handleUpdateCourse(course.id, "name", e.target.value)
                          }
                          placeholder="e.g. Intro to Computer Science"
                          className="h-8 text-xs font-medium"
                        />
                      </div>

                      {/* Credits */}
                      <div className="sm:col-span-3 space-y-1">
                        <Label htmlFor={`credits-${course.id}`} className="text-[11px] text-muted-foreground">
                          Units / Credits
                        </Label>
                        <Input
                          id={`credits-${course.id}`}
                          type="number"
                          min={1}
                          max={12}
                          value={course.credits}
                          onChange={(e) =>
                            handleUpdateCourse(
                              course.id,
                              "credits",
                              Number.parseInt(e.target.value) || 3
                            )
                          }
                          className="h-8 text-xs font-bold"
                        />
                      </div>

                      {/* Semester */}
                      <div className="sm:col-span-4 space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Semester
                        </Label>
                        <Select
                          value={course.session}
                          onValueChange={(val) =>
                            handleUpdateCourse(course.id, "session", val)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fall">Fall (1st Semester)</SelectItem>
                            <SelectItem value="Spring">Spring (2nd Semester)</SelectItem>
                            <SelectItem value="Summer">Summer (3rd Semester)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Academic Year */}
                      <div className="sm:col-span-4 space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Academic Year
                        </Label>
                        <Select
                          value={course.academicYear}
                          onValueChange={(val) =>
                            handleUpdateCourse(course.id, "academicYear", val)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Instructor */}
                      <div className="sm:col-span-4 space-y-1">
                        <Label htmlFor={`instructor-${course.id}`} className="text-[11px] text-muted-foreground">
                          Instructor
                        </Label>
                        <Input
                          id={`instructor-${course.id}`}
                          value={course.instructor}
                          onChange={(e) =>
                            handleUpdateCourse(course.id, "instructor", e.target.value)
                          }
                          placeholder="e.g. Dr. Smith"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <Label htmlFor={`desc-${course.id}`} className="text-[11px] text-muted-foreground">
                        Description (Optional)
                      </Label>
                      <Input
                        id={`desc-${course.id}`}
                        value={course.description || ""}
                        onChange={(e) =>
                          handleUpdateCourse(course.id, "description", e.target.value)
                        }
                        placeholder="Brief overview of course topics..."
                        className="h-8 text-xs text-muted-foreground"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Sticky Footer */}
          <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              Selected: <span className="font-bold text-foreground">{selectedCount}</span> courses •{" "}
              Total Credits: <span className="font-bold text-primary">{totalUnits.toFixed(1)}</span> Units
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSheetOpen(false)}
                disabled={isSaving}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveCourses}
                disabled={isSaving || selectedCount === 0}
                className="flex-1 sm:flex-none gap-1.5 font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Courses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save & Import {selectedCount} Course{selectedCount > 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ButtonUpload;
