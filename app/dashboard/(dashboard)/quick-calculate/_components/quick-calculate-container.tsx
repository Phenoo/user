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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Calculator, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
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

export default function GPACalculator() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    credits: "",
    grade: "",
    semester: "",
  });

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
      return sum + gradePoints[course.grade] * course.credits;
    }, 0);

    const totalCredits = coursesToCalculate.reduce(
      (sum, course) => sum + course.credits,
      0
    );

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const overallGPA = calculateGPA(courses);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            GPA Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Add your courses and calculate your GPA instantly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Course Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Add Course</CardTitle>
              <CardDescription>
                Enter course details to add to your GPA calculation
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
                  <Label htmlFor="credits">Credit Hours</Label>
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
                      {Object.keys(gradePoints).map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade} ({gradePoints[grade].toFixed(1)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    placeholder="e.g., Fall 2024"
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
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {overallGPA.toFixed(2)}
                </div>
                <p className="text-gray-600 dark:text-gray-300">Overall GPA</p>
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
                          {(gradePoints[course.grade] * course.credits).toFixed(
                            1
                          )}
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
