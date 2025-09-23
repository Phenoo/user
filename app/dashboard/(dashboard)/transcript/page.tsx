"use client";

import { useState, useRef, useEffect } from "react";
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
import { ArrowLeft, Download, Printer, Eye, Settings } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { calculateCourseGrade, gradePoints } from "@/lib/gpa-utils";

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

interface CourseWithGrade {
  id: string;
  name: string;
  code: string;
  credits: number;
  grade: string;
  semester: string;
  year: string;
  category: string;
  finalScore?: number;
}

export default function TranscriptPage() {
  const user = useQuery(api.users.currentUser);

  const router = useRouter();
  const courses =
    useQuery(api.courses.getAllCourses, {
      userId: user?._id as Id<"users">,
    }) || [];
  const assessments =
    useQuery(api.assessments.getUserAssessments, {
      userId: user?._id as Id<"users">,
    }) || [];

  const [showPreview, setShowPreview] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: user?.name || "John Doe",
    studentId: "123456789",
    dateOfBirth: "01/15/2000",
    major: user?.major || "Computer Science",
    minor: "Mathematics",
    graduationDate: "May 2025",
    degreeType: "Bachelor of Science",
    university: user?.school || "State University",
    address: "123 University Ave, College Town, ST 12345",
  });

  const transcriptRef = useRef<HTMLDivElement>(null);

  // Screenshot protection
  useEffect(() => {
    const preventScreenshot = (e: KeyboardEvent) => {
      // Prevent common screenshot shortcuts
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "PrintScreen" || e.key === "F12" || e.key === "F11")
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Prevent Alt + PrintScreen
      if (e.altKey && e.key === "PrintScreen") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const preventSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Developer tools detection
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        // Developer tools detected - blur the content
        if (transcriptRef.current) {
          transcriptRef.current.style.filter = "blur(10px)";
          transcriptRef.current.style.pointerEvents = "none";
        }
      } else {
        // Developer tools closed - restore content
        if (transcriptRef.current) {
          transcriptRef.current.style.filter = "none";
          transcriptRef.current.style.pointerEvents = "auto";
        }
      }
    };

    // Add event listeners
    document.addEventListener("keydown", preventScreenshot, true);
    document.addEventListener("contextmenu", preventContextMenu, true);
    document.addEventListener("dragstart", preventDragStart, true);
    document.addEventListener("selectstart", preventSelectStart, true);

    // Monitor for developer tools
    const interval = setInterval(detectDevTools, 500);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", preventScreenshot, true);
      document.removeEventListener("contextmenu", preventContextMenu, true);
      document.removeEventListener("dragstart", preventDragStart, true);
      document.removeEventListener("selectstart", preventSelectStart, true);
      clearInterval(interval);
    };
  }, []);

  const coursesWithGrades: CourseWithGrade[] = courses.map((course) => {
    const courseAssessments = assessments.filter(
      (a) => a.courseId === course._id
    );
    const { percentage, letterGrade } = calculateCourseGrade(courseAssessments);

    return {
      id: course._id,
      name: course.name,
      code: course.code,
      credits: course.credits,
      grade: letterGrade,
      semester: course.session,
      year: course.academicYear.split("-")[0], // Extract first year from "2024-2025"
      category: "Major Requirements", // You could add this to your schema
      finalScore: percentage,
    };
  });

  const calculateGPA = (coursesToCalculate: CourseWithGrade[]) => {
    if (coursesToCalculate.length === 0) return 0;
    const totalPoints = coursesToCalculate.reduce((sum, course) => {
      return sum + gradePoints[course.grade] * course.credits;
    }, 0);
    const totalCredits = coursesToCalculate.reduce(
      (sum, course) => sum + course.credits,
      0
    );
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  // Group courses by semester
  const semesterGroups = coursesWithGrades.reduce(
    (acc, course) => {
      const key = `${course.semester} ${course.year}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(course);
      return acc;
    },
    {} as { [key: string]: CourseWithGrade[] }
  );

  const sortedSemesters = Object.keys(semesterGroups).sort((a, b) => {
    const [aSem, aYear] = a.split(" ");
    const [bSem, bYear] = b.split(" ");
    if (aYear !== bYear) return Number.parseInt(aYear) - Number.parseInt(bYear);
    const semesterOrder = { Spring: 1, Summer: 2, Fall: 3, Winter: 4 };
    return (
      semesterOrder[aSem as keyof typeof semesterOrder] -
      semesterOrder[bSem as keyof typeof semesterOrder]
    );
  });

  const overallGPA = calculateGPA(coursesWithGrades);
  const totalCredits = coursesWithGrades.reduce(
    (sum, course) => sum + course.credits,
    0
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const wasPreviewing = showPreview;
    if (!wasPreviewing) {
      setShowPreview(true);
      // Give React a moment to re-render the component without scaling
      // Increased timeout for potentially slower machines/more complex renders
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    try {
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;

      console.log(
        "transcriptRef.current (before html2canvas):",
        transcriptRef.current
      );
      if (!transcriptRef.current) {
        console.error(
          "Transcript ref is null after waiting, cannot generate PDF."
        );
        alert("Could not find transcript to download.");
        return;
      }

      // Crucial step: Verify the element itself is NOT scaled via CSS transform
      const computedStyle = window.getComputedStyle(transcriptRef.current);
      console.log(
        "Computed transform on transcriptRef.current:",
        computedStyle.transform
      ); // Should ideally be "none" or an empty string

      // Attempt to temporarily add the canvas to the DOM for visual inspection
      let tempCanvas = null; // Declare outside the try block for finally
      try {
        console.log("Attempting to capture canvas...");
        const canvas = await html2canvas(transcriptRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: true, // Keep this on!
          foreignObjectRendering: false, // Disable to avoid oklch color issues
          ignoreElements: (element) => {
            // Skip elements that might have problematic CSS
            return element.classList.contains("print:hidden");
          },
          onclone: (clonedDoc) => {
            // Force all colors to be hex/rgb in the cloned document
            const style = clonedDoc.createElement("style");
            style.textContent = `
              * {
                color: #000000 !important;
                background-color: #ffffff !important;
                border-color: #000000 !important;
              }
              .bg-gray-100 {
                background-color: #f3f4f6 !important;
              }
              .border-black {
                border-color: #000000 !important;
              }
              .border-gray-200 {
                border-color: #e5e7eb !important;
              }
              .text-gray-600 {
                color: #4b5563 !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          },
        });
        console.log("Canvas captured:", canvas);
        tempCanvas = canvas; // Assign for removal in finally

        // For visual debugging:
        document.body.appendChild(canvas);
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.zIndex = "99999";
        canvas.style.border = "2px solid red";
        console.warn(
          "DEBUG: Canvas appended to body. Inspect it visually! Remove this for production."
        );

        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        console.log("Image Data generated, length:", imgData.length);

        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let yPosition = 10;

        pdf.addImage(imgData, "JPEG", 10, yPosition, imgWidth, imgHeight);
        heightLeft -= pdfHeight - yPosition - 10;

        while (heightLeft > 0) {
          pdf.addPage();
          yPosition =
            -(
              imgHeight -
              heightLeft -
              (pdfHeight - 20) *
                Math.ceil((imgHeight - heightLeft) / (pdfHeight - 20))
            ) + 10;
          pdf.addImage(imgData, "JPEG", 10, yPosition, imgWidth, imgHeight);
          heightLeft -= pdfHeight - 20;
        }

        const fileName = `${studentInfo.name.replace(/\s+/g, "_")}_Transcript_${new Date().toISOString().split("T")[0]}.pdf`;
        pdf.save(fileName);
        console.log("PDF save initiated.");
      } catch (innerError) {
        // Catch errors specific to html2canvas or image processing
        console.error(
          "Error during canvas capture or image processing:",
          innerError
        );
        alert(
          "Error during canvas capture or image processing. Check console for details."
        );
      }
    } catch (error) {
      // Catch errors for jspdf or initial setup
      console.error("General error during PDF generation:", error);
      alert(
        "Error generating PDF. Please try again. Check console for details."
      );
    } finally {
      if (!wasPreviewing) {
        setShowPreview(false);
      }
      // Remove the debug canvas if it was added
      //@ts-ignore
      if (tempCanvas && document.body.contains(tempCanvas)) {
        //@ts-ignore
        document.body.removeChild(tempCanvas);
      }
    }
  };

  const TranscriptDocument = () => (
    <div
      ref={transcriptRef}
      className="bg-white text-black p-8 max-w-4xl mx-auto print:shadow-none print:max-w-none pdf-compatible screenshot-protected"
      style={{
        // Override oklch colors with hex equivalents for PDF generation compatibility
        backgroundColor: "#ffffff",
        color: "#000000",
        // Screenshot protection
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
      onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
      onDragStart={(e: React.DragEvent) => e.preventDefault()}
    >
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold mb-2">
          {studentInfo.university.toUpperCase()}
        </h1>
        <p className="text-sm">{studentInfo.address}</p>
        <h2 className="text-xl font-semibold mt-4">OFFICIAL TRANSCRIPT</h2>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-semibold mb-3 text-sm">STUDENT INFORMATION</h3>
          <div className="space-y-1 text-sm">
            <div className="flex">
              <span className="w-24 font-medium">Name:</span>
              <span>{studentInfo.name}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-medium">Student ID:</span>
              <span>{studentInfo.studentId}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-medium">Date of Birth:</span>
              <span>{studentInfo.dateOfBirth}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm">DEGREE INFORMATION</h3>
          <div className="space-y-1 text-sm">
            <div className="flex">
              <span className="w-24 font-medium">Degree:</span>
              <span>{studentInfo.degreeType}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-medium">Major:</span>
              <span>{studentInfo.major}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-medium">Minor:</span>
              <span>{studentInfo.minor}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-medium">Graduation:</span>
              <span>{studentInfo.graduationDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Record */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4 text-sm">ACADEMIC RECORD</h3>

        {sortedSemesters.map((semester) => {
          const semesterCourses = semesterGroups[semester];
          const semesterGPA = calculateGPA(semesterCourses);
          const semesterCredits = semesterCourses.reduce(
            (sum, course) => sum + course.credits,
            0
          );

          return (
            <div key={semester} className="mb-6">
              <div className="bg-gray-100 p-2 mb-2">
                <h4 className="font-semibold text-sm">{semester}</h4>
              </div>

              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1 w-16">Course</th>
                    <th className="text-left py-1">Title</th>
                    <th className="text-center py-1 w-16">Credits</th>
                    <th className="text-center py-1 w-16">Grade</th>
                    <th className="text-center py-1 w-16">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {semesterCourses.map((course) => (
                    <tr key={course.id} className="border-b border-gray-200">
                      <td className="py-1">{course.code}</td>
                      <td className="py-1">{course.name}</td>
                      <td className="text-center py-1">
                        {course.credits.toFixed(1)}
                      </td>
                      <td className="text-center py-1">{course.grade}</td>
                      <td className="text-center py-1">
                        {(gradePoints[course.grade] * course.credits).toFixed(
                          1
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black font-semibold">
                    <td colSpan={2} className="py-1">
                      Semester Totals:
                    </td>
                    <td className="text-center py-1">
                      {semesterCredits.toFixed(1)}
                    </td>
                    <td className="text-center py-1">
                      GPA: {semesterGPA.toFixed(2)}
                    </td>
                    <td className="text-center py-1">
                      {(semesterGPA * semesterCredits).toFixed(1)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="border-t-2 border-black pt-4">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-3 text-sm">ACADEMIC SUMMARY</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Credits Attempted:</span>
                <span className="font-medium">{totalCredits.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Credits Earned:</span>
                <span className="font-medium">{totalCredits.toFixed(1)}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="font-semibold">Cumulative GPA:</span>
                <span className="font-bold">{overallGPA.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm">GRADING SCALE</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>A+ = 4.0</div>
              <div>C+ = 2.3</div>
              <div>A = 4.0</div>
              <div>C = 2.0</div>
              <div>A- = 3.7</div>
              <div>C- = 1.7</div>
              <div>B+ = 3.3</div>
              <div>D+ = 1.3</div>
              <div>B = 3.0</div>
              <div>D = 1.0</div>
              <div>B- = 2.7</div>
              <div>F = 0.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-xs text-gray-600">
        <p>This is an unofficial transcript generated for preview purposes.</p>
        <p>Generated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen print:bg-white">
      <div className="container mx-auto px-4 py-8 print:px-0 print:py-0">
        <div className="mb-6 print:hidden">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex justify-between flex-wrap gap-4 items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Academic Transcript
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Overall GPA:{" "}
                <span className="mr-2 font-semibold">
                  {overallGPA.toFixed(2)}
                </span>{" "}
                • Total Courses:{" "}
                <span className="font-semibold mr-2">
                  {coursesWithGrades.length}
                </span>{" "}
                • Total Credits:{" "}
                <span className="font-semibold mr-2">{totalCredits}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Settings className="w-4 h-4 mr-2" />
                {showPreview ? "Edit Info" : "Customize"}
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {!courses || !assessments ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Loading your academic data...
              </p>
            </div>
          </div>
        ) : coursesWithGrades.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              No courses found. Add some courses to generate your transcript.
            </p>
            <Link href="/courses">
              <Button>Add Courses</Button>
            </Link>
          </div>
        ) : (
          <>
            {!showPreview ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
                {/* Student Information Form */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                    <CardDescription>
                      Customize your personal and academic details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={studentInfo.name}
                        onChange={(e) =>
                          setStudentInfo({
                            ...studentInfo,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
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
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        value={studentInfo.dateOfBirth}
                        onChange={(e) =>
                          setStudentInfo({
                            ...studentInfo,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="university">University</Label>
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
                    <div>
                      <Label htmlFor="address">University Address</Label>
                      <Textarea
                        id="address"
                        value={studentInfo.address}
                        onChange={(e) =>
                          setStudentInfo({
                            ...studentInfo,
                            address: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="major">Major</Label>
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
                    <div>
                      <Label htmlFor="minor">Minor</Label>
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
                    <div>
                      <Label htmlFor="degreeType">Degree Type</Label>
                      <Select
                        value={studentInfo.degreeType}
                        onValueChange={(value) =>
                          setStudentInfo({ ...studentInfo, degreeType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bachelor of Science">
                            Bachelor of Science
                          </SelectItem>
                          <SelectItem value="Bachelor of Arts">
                            Bachelor of Arts
                          </SelectItem>
                          <SelectItem value="Master of Science">
                            Master of Science
                          </SelectItem>
                          <SelectItem value="Master of Arts">
                            Master of Arts
                          </SelectItem>
                          <SelectItem value="Doctor of Philosophy">
                            Doctor of Philosophy
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="graduationDate">
                        Expected Graduation
                      </Label>
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
                    <Button
                      onClick={() => setShowPreview(true)}
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Transcript
                    </Button>
                  </CardContent>
                </Card>

                {/* Preview */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transcript Preview</CardTitle>
                      <CardDescription>
                        This is how your transcript will appear
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="transform scale-75 origin-top-left w-[133%]">
                          <TranscriptDocument />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="print:block">
                <TranscriptDocument />
              </div>
            )}
          </>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
        }

        /* Override oklch colors with hex equivalents for PDF generation compatibility */
        .pdf-compatible {
          --background: #ffffff !important;
          --foreground: #000000 !important;
          --card: #f9fafb !important;
          --card-foreground: #4b5563 !important;
          --popover: #ffffff !important;
          --popover-foreground: #4b5563 !important;
          --primary: #fccddd !important;
          --primary-foreground: #000000 !important;
          --secondary: #e879f9 !important;
          --secondary-foreground: #ffffff !important;
          --muted: #f9fafb !important;
          --muted-foreground: #4b5563 !important;
          --accent: #f9fafb !important;
          --accent-foreground: #ffffff !important;
          --destructive: #ea580c !important;
          --destructive-foreground: #ffffff !important;
          --border: #e5e7eb !important;
          --input: #e5e7eb !important;
          --ring: #fccddd !important;
        }

        .pdf-compatible * {
          color: inherit !important;
          background-color: inherit !important;
          border-color: inherit !important;
        }

        /* Screenshot Protection Styles */
        .screenshot-protected {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-user-drag: none !important;
          -khtml-user-select: none !important;
          pointer-events: auto !important;
        }

        .screenshot-protected * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-user-drag: none !important;
          -khtml-user-select: none !important;
        }

        /* Prevent text selection */
        .screenshot-protected::selection {
          background: transparent !important;
        }

        .screenshot-protected::-moz-selection {
          background: transparent !important;
        }

        /* Disable right-click context menu */
        .screenshot-protected {
          -webkit-context-menu: none !important;
          -moz-context-menu: none !important;
          context-menu: none !important;
        }

        /* Additional screenshot protection */
        .screenshot-protected {
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none !important;
          -webkit-user-drag: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }

        /* Prevent image saving */
        .screenshot-protected img {
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
          pointer-events: none !important;
        }

        /* Disable text selection completely */
        .screenshot-protected,
        .screenshot-protected * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-user-drag: none !important;
          -khtml-user-select: none !important;
        }
      `}</style>
    </div>
  );
}
