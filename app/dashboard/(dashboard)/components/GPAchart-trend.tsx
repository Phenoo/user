"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BookOpen } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { calculateCourseGrade } from "@/lib/gpa-utils";

const gradePoints: Record<string, number> = {
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

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const StudentChartsView = () => {
  const user = useQuery(api.users.currentUser);
  const userId = user?._id as Id<"users">;

  const courses = useQuery(
    api.courses.getAllCourses,
    userId ? { userId } : "skip"
  ) || [];

  const assessments = useQuery(
    api.assessments.getUserAssessments,
    userId ? { userId } : "skip"
  ) || [];

  // Group by academic year & session to compute actual GPA trend
  const semesterMap: Record<string, { totalPoints: number; totalCredits: number }> = {};
  
  const coursePerformance = courses.map((course, idx) => {
    const courseAssessments = assessments.filter((a) => a.courseId === course._id);
    const { percentage, letterGrade } = calculateCourseGrade(courseAssessments);
    const points = gradePoints[letterGrade] || 0;

    const semesterKey = `${course.session} ${course.academicYear.split("-")[0]}`;
    if (!semesterMap[semesterKey]) {
      semesterMap[semesterKey] = { totalPoints: 0, totalCredits: 0 };
    }
    semesterMap[semesterKey].totalPoints += points * course.credits;
    semesterMap[semesterKey].totalCredits += course.credits;

    return {
      course: course.code || course.name,
      grade: Math.round(percentage),
      color: chartColors[idx % chartColors.length],
    };
  });

  const gradesTrend = Object.entries(semesterMap).map(([semester, data]) => ({
    semester,
    gpa: data.totalCredits > 0 ? Math.round((data.totalPoints / data.totalCredits) * 100) / 100 : 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* GPA Trend Chart */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            GPA Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {gradesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gradesTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="semester" />
                  <YAxis domain={[0, 4.0]} tickFormatter={(val) => val.toFixed(1)} />
                  <Tooltip formatter={(val: number) => [val.toFixed(2), "GPA"]} />
                  <Line
                    type="monotone"
                    dataKey="gpa"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Add courses and grades to see your GPA trend over time
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Performance Chart */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-card-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {coursePerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursePerformance}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="course" />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(val: number) => [`${val}%`, "Grade"]} />
                  <Bar dataKey="grade" radius={[4, 4, 0, 0]}>
                    {coursePerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Add courses and assessments to see your course performance
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentChartsView;
