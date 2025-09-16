"use client";

import { useState } from "react";
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
  TrendingUp,
  TrendingDown,
  Calendar,
  BookOpen,
  Target,
  Award,
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
} from "recharts";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  grade: string;
  semester: string;
  year: string;
  category: string;
}

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

// Mock data - in a real app, this would come from your state management or API
const mockCourses: Course[] = [
  {
    id: "1",
    name: "Calculus I",
    code: "MATH 101",
    credits: 4,
    grade: "A",
    semester: "Fall",
    year: "2023",
    category: "Core Requirements",
  },
  {
    id: "2",
    name: "English Composition",
    code: "ENG 101",
    credits: 3,
    grade: "B+",
    semester: "Fall",
    year: "2023",
    category: "General Education",
  },
  {
    id: "3",
    name: "Computer Science I",
    code: "CS 101",
    credits: 3,
    grade: "A-",
    semester: "Fall",
    year: "2023",
    category: "Major Requirements",
  },
  {
    id: "4",
    name: "Physics I",
    code: "PHYS 101",
    credits: 4,
    grade: "B",
    semester: "Spring",
    year: "2024",
    category: "Core Requirements",
  },
  {
    id: "5",
    name: "Data Structures",
    code: "CS 201",
    credits: 3,
    grade: "A",
    semester: "Spring",
    year: "2024",
    category: "Major Requirements",
  },
  {
    id: "6",
    name: "Statistics",
    code: "STAT 101",
    credits: 3,
    grade: "B+",
    semester: "Spring",
    year: "2024",
    category: "General Education",
  },
  {
    id: "7",
    name: "Algorithms",
    code: "CS 301",
    credits: 3,
    grade: "A-",
    semester: "Fall",
    year: "2024",
    category: "Major Requirements",
  },
  {
    id: "8",
    name: "Database Systems",
    code: "CS 302",
    credits: 3,
    grade: "A",
    semester: "Fall",
    year: "2024",
    category: "Major Requirements",
  },
];

export default function SemesterAnalysisPage() {
  const [courses] = useState<Course[]>(mockCourses);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");

  const router = useRouter();
  const calculateGPA = (coursesToCalculate: Course[]) => {
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

  // Filter courses based on selected filters
  const filteredCourses = courses.filter((course) => {
    if (selectedYear !== "all" && course.year !== selectedYear) return false;
    if (selectedSemester !== "all" && course.semester !== selectedSemester)
      return false;
    return true;
  });

  // Group courses by semester
  const semesterGroups = courses.reduce(
    (acc, course) => {
      const key = `${course.semester} ${course.year}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(course);
      return acc;
    },
    {} as { [key: string]: Course[] }
  );

  // Calculate semester GPAs for chart
  const semesterData = Object.entries(semesterGroups)
    .map(([semester, semesterCourses]) => ({
      semester,
      gpa: calculateGPA(semesterCourses),
      credits: semesterCourses.reduce((sum, course) => sum + course.credits, 0),
      courses: semesterCourses.length,
    }))
    .sort((a, b) => {
      const [aSem, aYear] = a.semester.split(" ");
      const [bSem, bYear] = b.semester.split(" ");
      if (aYear !== bYear)
        return Number.parseInt(aYear) - Number.parseInt(bYear);
      const semesterOrder = { Spring: 1, Summer: 2, Fall: 3, Winter: 4 };
      return (
        semesterOrder[aSem as keyof typeof semesterOrder] -
        semesterOrder[bSem as keyof typeof semesterOrder]
      );
    });

  // Calculate overall statistics
  const overallGPA = calculateGPA(courses);
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const totalCourses = courses.length;

  // Calculate grade distribution
  const gradeDistribution = courses.reduce(
    (acc, course) => {
      acc[course.grade] = (acc[course.grade] || 0) + 1;
      return acc;
    },
    {} as { [key: string]: number }
  );

  const gradeDistributionData = Object.entries(gradeDistribution).map(
    ([grade, count]) => ({
      grade,
      count,
      percentage: ((count / totalCourses) * 100).toFixed(1),
    })
  );

  // Get unique years and semesters for filters
  const years = [...new Set(courses.map((course) => course.year))].sort();
  const semesters = [...new Set(courses.map((course) => course.semester))];

  // Calculate trends
  const currentSemesterGPA =
    semesterData.length > 0 ? semesterData[semesterData.length - 1].gpa : 0;
  const previousSemesterGPA =
    semesterData.length > 1 ? semesterData[semesterData.length - 2].gpa : 0;
  const gpaChange = currentSemesterGPA - previousSemesterGPA;

  return (
    <div className="min-h-screen ">
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
                  {semesters.map((semester) => (
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
              <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {overallGPA.toFixed(2)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {gpaChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : gpaChange < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                ) : null}
                {gpaChange !== 0 && (
                  <span
                    className={
                      gpaChange > 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {gpaChange > 0 ? "+" : ""}
                    {gpaChange.toFixed(2)} from last semester
                  </span>
                )}
              </div>
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
              <div className="text-2xl font-bold">{totalCredits}</div>
              <p className="text-xs text-muted-foreground">
                Across {totalCourses} courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Semester
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentSemesterGPA.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {semesterData.length > 0
                  ? semesterData[semesterData.length - 1].semester
                  : "No data"}
              </p>
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
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={semesterData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis domain={[0, 4]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="gpa"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={semesterData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="credits" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semesters" className="space-y-6">
            {semesterData.map((semesterInfo) => {
              const semesterCourses = semesterGroups[semesterInfo.semester];
              return (
                <Card key={semesterInfo.semester}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{semesterInfo.semester}</CardTitle>
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary">
                          GPA: {semesterInfo.gpa.toFixed(2)}
                        </Badge>
                        <Badge variant="outline">
                          {semesterInfo.credits} Credits
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {semesterCourses.map((course) => (
                        <Card
                          key={course.id}
                          className="border-l-4 border-l-blue-500"
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-sm">
                                  {course.name}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {course.code}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {course.grade}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Credits:</span>
                                <span className="font-medium">
                                  {course.credits}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Points:</span>
                                <span className="font-medium">
                                  {(
                                    gradePoints[course.grade] * course.credits
                                  ).toFixed(1)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Category:</span>
                                <span className="font-medium text-xs">
                                  {course.category}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gradeDistributionData.map((item) => (
                <Card key={item.grade}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {item.count}
                    </div>
                    <div className="text-sm font-medium">
                      {item.grade} Grade{item.count !== 1 ? "s" : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.percentage}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
