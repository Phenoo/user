"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Calculator, ArrowLeft, Award } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  getGradePointsForScale,
  getMaxGpaForScale,
  getDegreeClassification,
  GpaScaleType,
} from "@/lib/gpa-utils";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
}

export default function GPACalculator() {
  const user = useQuery(api.users.currentUser);
  const settings = useQuery(
    api.settings.getUserSettings,
    user?._id ? { userId: user._id } : "skip"
  );

  const [selectedScale, setSelectedScale] = useState<GpaScaleType>("5.0");
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    credits: "",
    grade: "",
    semester: "",
  });

  useEffect(() => {
    if (settings?.gpaScale) {
      setSelectedScale(settings.gpaScale as GpaScaleType);
    }
  }, [settings]);

  const scaleGradePoints = getGradePointsForScale(selectedScale);
  const maxScaleGpa = getMaxGpaForScale(selectedScale);

  const addCourse = () => {
    if (
      newCourse.name &&
      newCourse.credits &&
      newCourse.grade &&
      newCourse.semester
    ) {
      const course: Course = {
        id: Date.now().toString(),
        name: newCourse.name,
        credits: Number.parseFloat(newCourse.credits),
        grade: newCourse.grade,
        semester: newCourse.semester,
      };
      setCourses([...courses, course]);
      setNewCourse({ name: "", credits: "", grade: "", semester: "" });
    }
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id));
  };

  const calculateGPA = (coursesToCalculate: Course[]) => {
    if (coursesToCalculate.length === 0) return 0;

    const totalPoints = coursesToCalculate.reduce((sum, course) => {
      const points = scaleGradePoints[course.grade] ?? 0;
      return sum + points * course.credits;
    }, 0);

    const totalCredits = coursesToCalculate.reduce(
      (sum, course) => sum + course.credits,
      0
    );

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const overallGPA = calculateGPA(courses);
  const degreeClass = getDegreeClassification(overallGPA, selectedScale);
  const semesters = [
    ...new Set(courses.map((course) => course.semester)),
  ].sort();

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                GPA Calculator
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Add your courses and calculate your GPA instantly
              </p>
            </div>

            {/* Scale Selector */}
            <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-lg border">
              <span className="text-xs font-medium px-2 text-muted-foreground">
                Scale:
              </span>
              <Button
                variant={selectedScale === "5.0" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedScale("5.0")}
                className="text-xs h-8"
              >
                Nigerian 5.0 (NUC)
              </Button>
              <Button
                variant={selectedScale === "4.0" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedScale("4.0")}
                className="text-xs h-8"
              >
                Standard 4.0 (US)
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Course Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Add Course</CardTitle>
              <CardDescription>
                Enter course details ({selectedScale === "5.0" ? "70%+ = A = 5.0" : "93%+ = A = 4.0"})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g., Calculus I"
                    value={newCourse.name}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credit Units / Hours</Label>
                  <Input
                    id="credits"
                    type="number"
                    placeholder="3"
                    value={newCourse.credits}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, credits: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Select
                    value={newCourse.grade}
                    onValueChange={(value) =>
                      setNewCourse({ ...newCourse, grade: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select grade" />
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
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    placeholder="e.g., 1st Semester 2024/2025"
                    value={newCourse.semester}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, semester: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={addCourse} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </CardContent>
          </Card>

          {/* GPA Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                GPA Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {overallGPA.toFixed(2)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {maxScaleGpa.toFixed(1)}
                  </span>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded border ${degreeClass.color}`}
                  >
                    {degreeClass.title}
                  </span>
                </div>
              </div>

              {semesters.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    By Semester:
                  </h4>
                  {semesters.map((semester) => {
                    const semesterCourses = courses.filter(
                      (course) => course.semester === semester
                    );
                    const semesterGPA = calculateGPA(semesterCourses);
                    return (
                      <div
                        key={semester}
                        className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <span className="text-sm font-medium">{semester}</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {semesterGPA.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>Total Courses: {courses.length}</p>
                  <p>
                    Total Credits:{" "}
                    {courses.reduce((sum, course) => sum + course.credits, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course List */}
        {courses.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Courses</CardTitle>
              <CardDescription>
                Review and manage your added courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Course Name</th>
                      <th className="text-left p-2">Credits</th>
                      <th className="text-left p-2">Grade</th>
                      <th className="text-left p-2">Semester</th>
                      <th className="text-left p-2">Points</th>
                      <th className="text-left p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id} className="border-b">
                        <td className="p-2 font-medium">{course.name}</td>
                        <td className="p-2">{course.credits}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                            {course.grade}
                          </span>
                        </td>
                        <td className="p-2">{course.semester}</td>
                        <td className="p-2">
                          {(
                            (scaleGradePoints[course.grade] ?? 0) *
                            course.credits
                          ).toFixed(1)}
                        </td>
                        <td className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCourse(course.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
