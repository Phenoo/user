"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Plus, BookOpen, Clock, Target, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
const StudentChartsView = () => {
  const gradesTrend = [
    { semester: "Fall 2023", gpa: 3.65 },
    { semester: "Spring 2024", gpa: 3.72 },
    { semester: "Fall 2024", gpa: 3.84 },
  ];

  const coursePerformance = [
    { course: "Math", grade: 92, color: "hsl(var(--chart-1))" },
    { course: "Physics", grade: 88, color: "hsl(var(--chart-2))" },
    { course: "CS", grade: 95, color: "hsl(var(--chart-3))" },
    { course: "English", grade: 85, color: "hsl(var(--chart-4))" },
  ];
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gradesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[3.0, 4.0]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Course Performance Chart */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-card-foreground">
            Course Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="grade" radius={[4, 4, 0, 0]}>
                  {coursePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentChartsView;
