"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Printer,
  Eye,
  Settings2,
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  calculateCourseGrade,
  getGradePointsForScale,
  getMaxGpaForScale,
  getDegreeClassification,
  GpaScaleType,
} from "@/lib/gpa-utils";
import { toast } from "sonner";

interface StudentInfo {
  name: string;
  studentId: string;
  dateOfBirth: string;
  major: string;
  minor: string;
  graduationDate: string;
  degreeType: string;
  university: string;
  address: string;
}

interface CourseItem {
  id: string;
  name: string;
  code: string;
  credits: number;
  grade: string;
  semester: string;
  year: string;
  category: string;
  finalScore?: number;
  hasAssessments: boolean;
}

export default function TranscriptPage() {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const settings = useQuery(
    api.settings.getUserSettings,
    user?._id ? { userId: user._id } : "skip"
  );

  // Safe query loading using "skip" when user is not ready
  const coursesData = useQuery(
    api.courses.getAllCourses,
    user?._id ? { userId: user._id } : "skip"
  );
  const assessmentsData = useQuery(
    api.assessments.getUserAssessments,
    user?._id ? { userId: user._id } : "skip"
  );

  const isLoading =
    user === undefined ||
    coursesData === undefined ||
    assessmentsData === undefined;

  const [activeTab, setActiveTab] = useState<"preview" | "customize">("preview");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedScale, setSelectedScale] = useState<GpaScaleType>("5.0");

  // Manual grade overrides per course ID
  const [gradeOverrides, setGradeOverrides] = useState<Record<string, string>>({});

  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: "Student Name",
    studentId: "STU-" + Math.floor(100000 + Math.random() * 900000),
    dateOfBirth: "01/15/2002",
    major: "Computer Science",
    minor: "Mathematics",
    graduationDate: "May 2026",
    degreeType: "Bachelor of Science",
    university: "State University",
    address: "100 University Boulevard, Academic City",
  });

  const transcriptPrintRef = useRef<HTMLDivElement>(null);

  // Populate student info and scale once user profile loads
  useEffect(() => {
    if (user) {
      setStudentInfo((prev) => ({
        ...prev,
        name: user.name || (user as any).fullName || user.email?.split("@")[0] || prev.name,
        major: user.major || prev.major,
        university: user.school || prev.university,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (settings?.gpaScale) {
      setSelectedScale(settings.gpaScale as GpaScaleType);
    }
  }, [settings]);

  const scaleGradePoints = getGradePointsForScale(selectedScale);
  const maxScaleGpa = getMaxGpaForScale(selectedScale);

  // Construct courses with calculated or overridden grades
  const coursesWithGrades: CourseItem[] = useMemo(() => {
    if (!coursesData || !assessmentsData) return [];

    return coursesData.map((course) => {
      const courseAssessments = assessmentsData.filter(
        (a) => a.courseId === course._id
      );
      const { percentage, letterGrade } = calculateCourseGrade(
        courseAssessments,
        selectedScale
      );
      const hasAssessments = courseAssessments.some(
        (a) => a.status === "graded" && a.score !== undefined
      );

      // Default to calculated grade if assessments exist, otherwise default to "A" (or override)
      const assignedGrade =
        gradeOverrides[course._id] ||
        (hasAssessments ? letterGrade : "A");

      const rawYear = course.academicYear || "2024-2025";
      const displayYear = rawYear.includes("-")
        ? rawYear.split("-")[0]
        : rawYear;

      return {
        id: course._id,
        name: course.name,
        code: course.code || "COURSE",
        credits: course.credits > 0 ? course.credits : 3.0,
        grade: assignedGrade,
        semester: course.session || "Fall",
        year: displayYear,
        category: "Academic Core",
        finalScore: hasAssessments ? percentage : undefined,
        hasAssessments,
      };
    });
  }, [coursesData, assessmentsData, gradeOverrides, selectedScale]);

  const handleGradeChange = (courseId: string, grade: string) => {
    setGradeOverrides((prev) => ({
      ...prev,
      [courseId]: grade,
    }));
  };

  const calculateGPA = (coursesToCalculate: CourseItem[]) => {
    if (coursesToCalculate.length === 0) return 0;
    const gradedCourses = coursesToCalculate.filter(
      (c) => scaleGradePoints[c.grade] !== undefined
    );
    if (gradedCourses.length === 0) return 0;

    const totalPoints = gradedCourses.reduce((sum, course) => {
      return sum + (scaleGradePoints[course.grade] ?? 0) * course.credits;
    }, 0);

    const totalCredits = gradedCourses.reduce(
      (sum, course) => sum + course.credits,
      0
    );

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  // Group courses by semester
  const semesterGroups = useMemo(() => {
    return coursesWithGrades.reduce(
      (acc, course) => {
        const key = `${course.semester} ${course.year}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(course);
        return acc;
      },
      {} as { [key: string]: CourseItem[] }
    );
  }, [coursesWithGrades]);

  const sortedSemesters = useMemo(() => {
    return Object.keys(semesterGroups).sort((a, b) => {
      const [aSem, aYear] = a.split(" ");
      const [bSem, bYear] = b.split(" ");
      const yearDiff = Number.parseInt(aYear || "0") - Number.parseInt(bYear || "0");
      if (yearDiff !== 0) return yearDiff;

      const semesterOrder: Record<string, number> = {
        Winter: 1,
        Spring: 2,
        Summer: 3,
        Fall: 4,
      };
      return (semesterOrder[aSem] || 0) - (semesterOrder[bSem] || 0);
    });
  }, [semesterGroups]);

  const overallGPA = useMemo(() => calculateGPA(coursesWithGrades), [coursesWithGrades, selectedScale]);
  const totalCredits = useMemo(() => {
    return coursesWithGrades.reduce((sum, course) => sum + course.credits, 0);
  }, [coursesWithGrades]);
  const degreeClass = useMemo(() => getDegreeClassification(overallGPA, selectedScale), [overallGPA, selectedScale]);

  const handlePrint = () => {
    const studentName = studentInfo.name?.trim() || user?.name || "Student";
    const originalTitle = document.title;
    document.title = `${studentName} - Academic Transcript`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const studentName = studentInfo.name?.trim() || user?.name || user?.email?.split("@")[0] || "Student";
      const cleanName = studentName.replace(/[^a-zA-Z0-9_-]/g, "_");
      const cleanFileName = `${cleanName}_Academic_Transcript.pdf`;

      toast.loading(`Generating PDF transcript for ${studentName}...`, { id: "pdf-gen" });

      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;

      if (!transcriptPrintRef.current) {
        toast.error("Could not locate transcript element.", { id: "pdf-gen" });
        return;
      }

      const canvas = await html2canvas(transcriptPrintRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // Force black text & white background for PDF accuracy
          const element = clonedDoc.getElementById("printable-transcript-document");
          if (element) {
            element.style.display = "block";
            element.style.backgroundColor = "#ffffff";
            element.style.color = "#000000";
          }
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let yPosition = margin;

      pdf.addImage(imgData, "JPEG", margin, yPosition, imgWidth, imgHeight);
      heightLeft -= pdfHeight - margin * 2;

      while (heightLeft > 0) {
        pdf.addPage();
        yPosition = -(imgHeight - heightLeft) + margin;
        pdf.addImage(imgData, "JPEG", margin, yPosition, imgWidth, imgHeight);
        heightLeft -= pdfHeight - margin * 2;
      }

      pdf.save(cleanFileName);
      toast.success(`Transcript for ${studentName} downloaded successfully!`, { id: "pdf-gen" });
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Could not export PDF. You can also use the 'Print' button to Save as PDF.", {
        id: "pdf-gen",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Render the official clean transcript sheet
  const TranscriptDocument = () => (
    <div
      id="printable-transcript-document"
      ref={transcriptPrintRef}
      className="bg-white text-black p-8 md:p-12 max-w-4xl mx-auto shadow-sm border border-gray-200 print:border-none print:shadow-none print:p-0 print:max-w-none text-left"
      style={{
        backgroundColor: "#ffffff",
        color: "#111827",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header */}
      <div className="text-center pb-6 border-b-2 border-black mb-6">
        <h1 className="text-2xl md:text-3xl font-black tracking-wide text-gray-900 uppercase">
          {studentInfo.university || "UNIVERSITY ACADEMIC RECORD"}
        </h1>
        <p className="text-xs text-gray-600 mt-1">{studentInfo.address}</p>
        <div className="mt-4 inline-block bg-gray-100 px-4 py-1 rounded text-xs font-bold uppercase tracking-wider text-gray-800 border border-gray-300">
          Official Academic Record
        </div>
      </div>

      {/* Student & Degree Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs border-b border-gray-300 pb-6">
        <div className="space-y-1.5">
          <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2 border-b border-gray-200 pb-1">
            Student Information
          </h3>
          <div className="flex justify-between py-0.5">
            <span className="font-semibold text-gray-600">Full Name:</span>
            <span className="font-bold text-gray-900">{studentInfo.name}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-semibold text-gray-600">Student ID:</span>
            <span className="font-mono font-medium text-gray-900">{studentInfo.studentId}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-semibold text-gray-600">Date of Birth:</span>
            <span className="text-gray-900">{studentInfo.dateOfBirth}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2 border-b border-gray-200 pb-1">
            Degree Information
          </h3>
          <div className="flex justify-between py-0.5">
            <span className="font-semibold text-gray-600">Degree:</span>
            <span className="font-bold text-gray-900">{studentInfo.degreeType}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-semibold text-gray-600">Major:</span>
            <span className="font-bold text-gray-900">{studentInfo.major}</span>
          </div>
          {studentInfo.minor && (
            <div className="flex justify-between py-0.5">
              <span className="font-semibold text-gray-600">Minor:</span>
              <span className="text-gray-900">{studentInfo.minor}</span>
            </div>
          )}
          <div className="flex justify-between py-0.5">
            <span className="font-semibold text-gray-600">Graduation Date:</span>
            <span className="text-gray-900">{studentInfo.graduationDate}</span>
          </div>
        </div>
      </div>

      {/* Academic Record by Semester */}
      <div className="space-y-6 mb-8">
        <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs border-b-2 border-black pb-1">
          Academic Coursework
        </h3>

        {sortedSemesters.map((semester) => {
          const semesterCourses = semesterGroups[semester];
          const semesterGPA = calculateGPA(semesterCourses);
          const semesterCredits = semesterCourses.reduce(
            (sum, course) => sum + course.credits,
            0
          );

          return (
            <div key={semester} className="rounded-sm overflow-hidden border border-gray-300">
              <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300 flex justify-between items-center text-xs font-bold text-gray-800">
                <span>{semester}</span>
                <span className="text-[11px] font-normal text-gray-600">
                  {semesterCredits.toFixed(1)} Credits • Term GPA: {semesterGPA.toFixed(2)}
                </span>
              </div>

              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[10px] uppercase">
                    <th className="py-1.5 px-3 w-20">Code</th>
                    <th className="py-1.5 px-3">Course Title</th>
                    <th className="py-1.5 px-3 text-center w-16">Credits</th>
                    <th className="py-1.5 px-3 text-center w-16">Grade</th>
                    <th className="py-1.5 px-3 text-right w-16">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800 text-[11px]">
                  {semesterCourses.map((course) => {
                    const gradePoint = scaleGradePoints[course.grade] ?? 0;
                    const pointsEarned = (gradePoint * course.credits).toFixed(1);

                    return (
                      <tr key={course.id} className="hover:bg-gray-50/50">
                        <td className="py-1.5 px-3 font-mono font-medium">{course.code}</td>
                        <td className="py-1.5 px-3">{course.name}</td>
                        <td className="py-1.5 px-3 text-center">{course.credits.toFixed(1)}</td>
                        <td className="py-1.5 px-3 text-center font-bold">{course.grade}</td>
                        <td className="py-1.5 px-3 text-right font-mono">{pointsEarned}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50/80 font-semibold text-gray-900 text-[11px] border-t border-gray-300">
                    <td colSpan={2} className="py-1.5 px-3 text-left">
                      Term Summary:
                    </td>
                    <td className="py-1.5 px-3 text-center font-bold">
                      {semesterCredits.toFixed(1)}
                    </td>
                    <td className="py-1.5 px-3 text-center font-bold">
                      GPA: {semesterGPA.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold">
                      {(semesterGPA * semesterCredits).toFixed(1)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}
      </div>

      {/* Summary & Scale */}
      <div className="border-t-2 border-black pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div className="space-y-2 bg-gray-50 p-4 rounded border border-gray-200">
          <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b border-gray-300 pb-1">
            Cumulative Record Summary
          </h4>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-600">Total Credits Attempted:</span>
            <span className="font-bold text-gray-900">{totalCredits.toFixed(1)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-600">Total Credits Earned:</span>
            <span className="font-bold text-gray-900">{totalCredits.toFixed(1)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-600">Degree Classification:</span>
            <span className="font-bold text-emerald-800">{degreeClass.title}</span>
          </div>
          <div className="flex justify-between py-1 border-t border-gray-300 text-sm">
            <span className="font-bold text-gray-900">Cumulative GPA:</span>
            <span className="font-black text-blue-700 text-base">
              {overallGPA.toFixed(2)} / {maxScaleGpa.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="space-y-1 bg-gray-50 p-4 rounded border border-gray-200">
          <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b border-gray-300 pb-1 mb-2">
            {selectedScale === "5.0"
              ? "Grading Scale (5.0 Basis — Nigerian NUC System)"
              : "Grading Scale (4.0 Basis — US Standard)"}
          </h4>
          {selectedScale === "5.0" ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-gray-700">
              <div>A = 5.0 (70% – 100%)</div>
              <div>D = 2.0 (45% – 49%)</div>
              <div>B = 4.0 (60% – 69%)</div>
              <div>E = 1.0 (40% – 44%)</div>
              <div>C = 3.0 (50% – 59%)</div>
              <div>F = 0.0 (0% – 39%)</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-gray-700">
              <div>A+ = 4.0</div>
              <div>B+ = 3.3</div>
              <div>C+ = 2.3</div>
              <div>A = 4.0</div>
              <div>B = 3.0</div>
              <div>C = 2.0</div>
              <div>A- = 3.7</div>
              <div>B- = 2.7</div>
              <div>D = 1.0</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500">
        <p>This is an unofficial academic transcript generated by Usoro Academic OS.</p>
        <p>Generated on {new Date().toLocaleDateString(undefined, { dateStyle: "long" })}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12 print:bg-white print:p-0">
      <div className="container mx-auto px-4 py-8 print:px-0 print:py-0 max-w-6xl">
        {/* Navigation & Header */}
        <div className="mb-6 print:hidden">
          <Button
            variant="ghost"
            className="mb-4 gap-2 hover:bg-muted"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Academic Transcript
                </h1>
                <Badge variant="outline" className="gap-1 font-medium text-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Unofficial Copy
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Cumulative GPA:{" "}
                <span className="font-bold text-foreground mr-3">
                  {overallGPA.toFixed(2)}
                </span>
                Total Courses:{" "}
                <span className="font-bold text-foreground mr-3">
                  {coursesWithGrades.length}
                </span>
                Total Credits:{" "}
                <span className="font-bold text-foreground">
                  {totalCredits.toFixed(1)}
                </span>
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setActiveTab(activeTab === "preview" ? "customize" : "preview")
                }
              >
                <Settings2 className="w-4 h-4 mr-2" />
                {activeTab === "preview" ? "Edit Details & Grades" : "View Preview"}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={isExporting || coursesWithGrades.length === 0}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading your academic records...
            </p>
          </div>
        ) : coursesWithGrades.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold">No Courses Found</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Add your semester courses in the Course Hub first to automatically generate your official transcript.
              </p>
              <Link href="/dashboard/courses">
                <Button>Go to Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "preview" | "customize")}
              className="w-full print:hidden"
            >
              <TabsList className="mb-6 grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Transcript Preview
                </TabsTrigger>
                <TabsTrigger value="customize" className="gap-2">
                  <Settings2 className="w-4 h-4" />
                  Customize & Override Grades
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: PREVIEW */}
              <TabsContent value="preview" className="space-y-6">
                <div className="bg-neutral-900/5 dark:bg-neutral-900/40 p-4 md:p-8 rounded-2xl border border-border/60 overflow-x-auto">
                  <TranscriptDocument />
                </div>
              </TabsContent>

              {/* TAB 2: CUSTOMIZE DETAILS & GRADES */}
              <TabsContent value="customize">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Student Details */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-lg">Student Details</CardTitle>
                      <CardDescription>
                        Update header and degree information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="space-y-1.5">
                        <Label htmlFor="gpaScaleSelect">Grading Scale</Label>
                        <Select
                          value={selectedScale}
                          onValueChange={(val: GpaScaleType) =>
                            setSelectedScale(val)
                          }
                        >
                          <SelectTrigger id="gpaScaleSelect">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5.0">
                              Nigerian 5.0 (NUC) — 70%+ = A (5.0)
                            </SelectItem>
                            <SelectItem value="4.0">
                              Standard 4.0 (US) — 93%+ = A (4.0)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={studentInfo.name}
                          onChange={(e) =>
                            setStudentInfo({ ...studentInfo, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="studentId">Student ID Number</Label>
                        <Input
                          id="studentId"
                          value={studentInfo.studentId}
                          onChange={(e) =>
                            setStudentInfo({
                              ...studentInfo,
                              studentId: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="university">University / Institution</Label>
                        <Input
                          id="university"
                          value={studentInfo.university}
                          onChange={(e) =>
                            setStudentInfo({
                              ...studentInfo,
                              university: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="major">Major / Program</Label>
                        <Input
                          id="major"
                          value={studentInfo.major}
                          onChange={(e) =>
                            setStudentInfo({
                              ...studentInfo,
                              major: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="minor">Minor (Optional)</Label>
                        <Input
                          id="minor"
                          value={studentInfo.minor}
                          onChange={(e) =>
                            setStudentInfo({
                              ...studentInfo,
                              minor: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="degreeType">Degree Type</Label>
                        <Select
                          value={studentInfo.degreeType}
                          onValueChange={(val) =>
                            setStudentInfo({ ...studentInfo, degreeType: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bachelor of Science">
                              Bachelor of Science (B.S.)
                            </SelectItem>
                            <SelectItem value="Bachelor of Arts">
                              Bachelor of Arts (B.A.)
                            </SelectItem>
                            <SelectItem value="Bachelor of Engineering">
                              Bachelor of Engineering (B.Eng.)
                            </SelectItem>
                            <SelectItem value="Master of Science">
                              Master of Science (M.S.)
                            </SelectItem>
                            <SelectItem value="Master of Arts">
                              Master of Arts (M.A.)
                            </SelectItem>
                            <SelectItem value="Doctor of Philosophy">
                              Doctor of Philosophy (Ph.D.)
                            </SelectItem>
                            <SelectItem value="Associate Degree">
                              Associate Degree
                            </SelectItem>
                            <SelectItem value="High School Diploma">
                              High School Diploma
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="graduationDate">Graduation Date</Label>
                        <Input
                          id="graduationDate"
                          value={studentInfo.graduationDate}
                          onChange={(e) =>
                            setStudentInfo({
                              ...studentInfo,
                              graduationDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="address">Institution Address</Label>
                        <Textarea
                          id="address"
                          rows={2}
                          value={studentInfo.address}
                          onChange={(e) =>
                            setStudentInfo({
                              ...studentInfo,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right Column: Course Grade Adjuster */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Course Grade Adjustments
                          </CardTitle>
                          <CardDescription>
                            Override or set expected grades for each course on your transcript
                          </CardDescription>
                        </div>
                        {Object.keys(gradeOverrides).length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setGradeOverrides({})}
                            className="text-xs text-muted-foreground"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                            Reset All
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sortedSemesters.map((semester) => (
                        <div key={semester} className="space-y-2 border-b border-border pb-4 last:border-b-0">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {semester}
                          </h4>
                          <div className="space-y-2">
                            {semesterGroups[semester].map((course) => (
                              <div
                                key={course.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50 text-sm"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-semibold flex items-center gap-2">
                                    <span className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                      {course.code}
                                    </span>
                                    <span>{course.name}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {course.credits} Credits •{" "}
                                    {course.hasAssessments && course.finalScore !== undefined
                                      ? `Assessment Score: ${course.finalScore.toFixed(0)}%`
                                      : "Default / In Progress"}
                                  </div>
                                </div>

                                  <div className="flex items-center gap-2">
                                    <Select
                                      value={course.grade}
                                      onValueChange={(grade) =>
                                        handleGradeChange(course.id, grade)
                                      }
                                    >
                                      <SelectTrigger className="w-24 h-8 text-xs font-bold">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.keys(scaleGradePoints).map((grade) => (
                                          <SelectItem key={grade} value={grade}>
                                            {grade} ({scaleGradePoints[grade].toFixed(1)})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <Button
                        onClick={() => setActiveTab("preview")}
                        className="w-full mt-4"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Apply & Preview Transcript
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Print-only layout container */}
            <div className="hidden print:block">
              <TranscriptDocument />
            </div>
          </div>
        )}
      </div>

      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-transcript-document,
          #printable-transcript-document * {
            visibility: visible;
          }
          #printable-transcript-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          header, nav, aside, footer, button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
