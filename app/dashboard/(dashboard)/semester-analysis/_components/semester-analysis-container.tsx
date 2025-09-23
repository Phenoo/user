"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Target,
  Award,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
} from "recharts";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { BsArrowUpRight } from "react-icons/bs";
import { Loader } from "@/components/ai-elements/loader";
import { calculateCourseGrade } from "@/lib/gpa-utils";
import { Course } from "../../courses/_components/courses-container";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const gradePoints: { [key: string]: number } = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

const gradeColors: Record<string, string> = {
  "A+": "#10B981",
  A: "#10B981",
  "A-": "#34D399",
  "B+": "#3B82F6",
  B: "#60A5FA",
  "B-": "#93C5FD",
  "C+": "#F59E0B",
  C: "#FBBF24",
  "C-": "#FCD34D",
  "D+": "#EF4444",
  D: "#F87171",
  "D-": "#FCA5A5",
  F: "#DC2626",
};

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

const SemesterAnalysisPageContainer = () => {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState("all");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const yearParams = searchParams.get("year") || "2025";
  const sessionParams = searchParams.get("session") || "Fall";

  // API Queries with proper null handling
  const user = useQuery(api.users.currentUser);
  const courses = useQuery(
    api.courses.getAllCourses,
    user?._id ? { userId: user._id as Id<"users"> } : "skip"
  );
  const assessments = useQuery(
    api.assessments.getUserAssessments,
    user?._id ? { userId: user._id as Id<"users"> } : "skip"
  );

  // Safe data handling
  const safeCourses = courses || [];
  const safeAssessments = assessments || [];

  // Calculate GPA helper function
  const calculateGPA = (coursesToCalculate: CourseWithGrade[]) => {
    if (!coursesToCalculate || coursesToCalculate.length === 0) return 0;

    const totalPoints = coursesToCalculate.reduce((sum, course) => {
      const points = gradePoints[course.grade] || 0;
      return sum + points * course.credits;
    }, 0);

    const totalCredits = coursesToCalculate.reduce(
      (sum, course) => sum + course.credits,
      0
    );

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  // Get unique years and sessions for filters
  const years = Array.from(
    new Set(safeCourses.map((course) => course.academicYear))
  )
    .sort()
    .reverse();

  const sessions = ["Fall", "Spring", "Summer"];

  // Filter courses safely
  const filteredCourses = safeCourses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor &&
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesYear =
      selectedYear === "all" || course.academicYear === selectedYear;
    const matchesSession =
      selectedSession === "all" || course.session === selectedSession;

    return matchesSearch && matchesYear && matchesSession;
  });

  // Group courses by year and session safely
  const coursesByYear = filteredCourses.reduce(
    (acc, course) => {
      if (!acc[course.academicYear]) {
        acc[course.academicYear] = {};
      }
      if (!acc[course.academicYear][course.session]) {
        acc[course.academicYear][course.session] = [];
      }

      //@ts-ignore
      acc[course.academicYear][course.session].push(course);
      return acc;
    },
    {} as Record<string, Record<string, Course[]>>
  );

  // Get current semester courses with grades
  const currentSemesterCourses =
    coursesByYear[yearParams]?.[sessionParams] || [];

  const coursesWithGrades: CourseWithGrade[] = currentSemesterCourses.map(
    (course) => {
      const courseAssessments = safeAssessments.filter(
        (a) => a.courseId === course._id
      );

      const { percentage, letterGrade } =
        calculateCourseGrade(courseAssessments);

      return {
        ...course,
        id: course._id,
        grade: letterGrade,
        semester: course.session,
        year: course.academicYear.split("-")[0],
        category: "Major Requirements",
        finalScore: percentage,
      };
    }
  );

  // Calculate semester GPA
  const semesterGPA = calculateGPA(coursesWithGrades);

  // Calculate overall GPA from all courses with grades
  const allCoursesWithGrades: CourseWithGrade[] = safeCourses.map((course) => {
    const courseAssessments = safeAssessments.filter(
      (a) => a.courseId === course._id
    );

    const { percentage, letterGrade } = calculateCourseGrade(courseAssessments);

    return {
      ...course,
      id: course._id,
      grade: letterGrade,
      semester: course.session,
      year: course.academicYear.split("-")[0],
      category: "Major Requirements",
      finalScore: percentage,
    };
  });

  const overallGPA = calculateGPA(allCoursesWithGrades);

  const gpaData = years
    .map((year) => {
      const yearCourses = allCoursesWithGrades.filter(
        (course) =>
          //@ts-ignore
          course.year === year.split("-")[0] || course.academicYear === year
      );
      const yearGPA = calculateGPA(yearCourses);
      return {
        semester: year,
        gpa: yearGPA,
        credits: yearCourses.reduce((sum, course) => sum + course.credits, 0),
      };
    })
    .reverse();

  const creditsData = Object.entries(coursesByYear)
    .map(([year, sessions]) => {
      const totalCredits = Object.values(sessions)
        .flat()
        .reduce((sum, course) => sum + course.credits, 0);
      return {
        semester: year,
        credits: totalCredits,
        courses: Object.values(sessions).flat().length,
      };
    })
    .reverse();

  // URL parameter effects
  useEffect(() => {
    if (selectedYear !== "all") {
      router.push(`${pathname}?year=${selectedYear}&session=${sessionParams}`);
    }
  }, [router, selectedYear, pathname, sessionParams]);

  useEffect(() => {
    if (selectedSemester !== "all") {
      router.push(`${pathname}?year=${yearParams}&session=${selectedSemester}`);
    }
  }, [router, selectedSemester, pathname, yearParams]);

  // Loading state
  if (!user || courses === undefined || assessments === undefined) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Semester Analysis
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track your academic progress across semesters
              </p>
            </div>

            <div className="flex space-x-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {sessions.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Semester GPA
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {semesterGPA.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {yearParams} {sessionParams}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Credits
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentSemesterCourses.reduce(
                  (total, course) => total + course.credits,
                  0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {currentSemesterCourses.length} courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallGPA.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All semesters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Progress to 4.0
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((overallGPA / 4.0) * 100).toFixed(0)}%
              </div>
              <Progress value={(overallGPA / 4.0) * 100} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">GPA Trends</TabsTrigger>
            <TabsTrigger value="semesters">Semester Details</TabsTrigger>
            <TabsTrigger value="distribution">Grade Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>GPA Trend Over Time</CardTitle>
                <CardDescription>
                  Track your academic performance across semesters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    gpa: {
                      label: "GPA",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-80"
                >
                  <LineChart data={gpaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="semester"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      domain={[0, 4.0]}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toFixed(1)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="gpa"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={3}
                      dot={{
                        fill: "hsl(var(--chart-1))",
                        strokeWidth: 2,
                        r: 6,
                      }}
                      activeDot={{
                        r: 8,
                        stroke: "hsl(var(--chart-1))",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credits per Semester</CardTitle>
                <CardDescription>
                  Course load distribution across semesters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    credits: {
                      label: "Credits",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-80"
                >
                  <BarChart data={creditsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="semester"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Credits",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="credits"
                      fill="hsl(var(--chart-2))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semesters" className="space-y-6">
            {currentSemesterCourses.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No courses found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ||
                    selectedYear !== "all" ||
                    selectedSession !== "all"
                      ? "Try adjusting your filters or search terms"
                      : "Start by adding your first course"}
                  </p>
                  {!searchTerm &&
                    selectedYear === "all" &&
                    selectedSession === "all" && (
                      <Button onClick={() => setIsAddSheetOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Course
                      </Button>
                    )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentSemesterCourses.map((course) => (
                    <Card
                      key={course._id}
                      className={cn(
                        "transition-all duration-200 hover:shadow-lg border-2",
                        course.colorTag
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-balance">
                              {course.name}
                            </CardTitle>
                            <CardDescription className="font-mono text-foreground text-sm font-medium mt-1">
                              {course.code}
                            </CardDescription>
                          </div>
                          <Link
                            href={`/dashboard/courses/course/${course._id}`}
                            className="ml-auto"
                          >
                            <Button
                              size="icon"
                              className="bg-foreground hover:bg-foreground/70 text-background ml-auto rounded-full"
                            >
                              <BsArrowUpRight
                                stroke="1"
                                className="h-4 stroke-[1px] w-4"
                              />
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span>Credits:</span>
                            <Badge
                              variant="outline"
                              className="border dark:border-white border-black"
                            >
                              {course.credits}
                            </Badge>
                          </div>
                          {course.instructor && (
                            <div className="flex justify-between items-center text-sm">
                              <span>Instructor:</span>
                              <span className="font-medium text-right">
                                {course.instructor}
                              </span>
                            </div>
                          )}
                          {course.description && (
                            <p className="text-sm text-pretty leading-relaxed">
                              {course.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Breakdown of your grades across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Courses",
                      },
                    }}
                    className="h-full"
                  >
                    <PieChart>
                      <Pie
                        data={allCoursesWithGrades.reduce(
                          (acc, course) => {
                            const grade = course.grade;
                            const existingGrade = acc.find(
                              (g) => g.grade === grade
                            );
                            if (existingGrade) {
                              existingGrade.count += 1;
                            } else {
                              acc.push({
                                grade,
                                count: 1,
                                fill: gradeColors[grade] || "#8884d8",
                              });
                            }
                            return acc;
                          },
                          [] as Array<{
                            grade: string;
                            count: number;
                            fill: string;
                          }>
                        )}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ grade, count, percent }) =>
                          `${grade}: ${count} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        dataKey="count"
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  {allCoursesWithGrades
                    .reduce(
                      (acc, course) => {
                        const grade = course.grade;
                        const existingGrade = acc.find(
                          (g) => g.grade === grade
                        );
                        if (!existingGrade) {
                          acc.push({
                            grade,
                            count: 1,
                            color: gradeColors[grade] || "#8884d8",
                          });
                        } else {
                          existingGrade.count += 1;
                        }
                        return acc;
                      },
                      [] as Array<{
                        grade: string;
                        count: number;
                        color: string;
                      }>
                    )
                    .map((gradeData) => (
                      <Card key={gradeData.grade} className="text-center">
                        <CardContent className="pt-4">
                          <div
                            className="w-4 h-4 rounded-full mx-auto mb-2"
                            style={{ backgroundColor: gradeData.color }}
                          />
                          <div className="text-2xl font-bold">
                            {gradeData.count}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Grade {gradeData.grade}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SemesterAnalysisPageContainer;
