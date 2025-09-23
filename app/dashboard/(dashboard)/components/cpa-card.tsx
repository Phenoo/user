"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { GoArrowUpRight } from "react-icons/go";
import { MdCalculate } from "react-icons/md";

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

const calculateLetterGrade = (percentage: number): string => {
  if (percentage >= 97) return "A+";
  if (percentage >= 93) return "A";
  if (percentage >= 90) return "A-";
  if (percentage >= 87) return "B+";
  if (percentage >= 83) return "B";
  if (percentage >= 80) return "B-";
  if (percentage >= 77) return "C+";
  if (percentage >= 73) return "C";
  if (percentage >= 70) return "C-";
  if (percentage >= 67) return "D+";
  if (percentage >= 60) return "D";
  return "F";
};

const calculateCourseGrade = (
  assessments: any[]
): { percentage: number; letterGrade: string } => {
  if (!assessments || assessments.length === 0) {
    return { percentage: 0, letterGrade: "F" };
  }

  const gradedAssessments = assessments.filter(
    (a) =>
      a.status === "graded" && a.score !== undefined && a.maxScore !== undefined
  );

  if (gradedAssessments.length === 0) {
    return { percentage: 0, letterGrade: "F" };
  }

  const totalWeight = gradedAssessments.reduce(
    (sum, assessment) => sum + assessment.weight,
    0
  );

  if (totalWeight === 0) {
    return { percentage: 0, letterGrade: "F" };
  }

  const weightedScore = gradedAssessments.reduce((sum, assessment) => {
    const percentage = (assessment.score / assessment.maxScore) * 100;
    return sum + percentage * (assessment.weight / 100);
  }, 0);

  const finalPercentage = (weightedScore / totalWeight) * 100;
  const letterGrade = calculateLetterGrade(finalPercentage);

  return { percentage: finalPercentage, letterGrade };
};

const CpaCard = () => {
  const user = useQuery(api.users.currentUser);

  const courses =
    useQuery(api.courses.getAllCourses, {
      userId: user?._id as Id<"users">,
    }) || [];
  const assessments =
    useQuery(api.assessments.getUserAssessments, {
      userId: user?._id as Id<"users">,
    }) || [];

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

  const overallGPA = calculateGPA(coursesWithGrades);
  const totalCredits = coursesWithGrades.reduce(
    (sum, course) => sum + course.credits,
    0
  );

  return (
    <Card className="">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Current GPA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold ">{overallGPA.toFixed(2)}</span>
          <span className="text-sm text-foreground/80 font-medium">+0.12</span>
        </div>
        <Progress
          value={(Number(overallGPA.toFixed(2)) / 4) * 100}
          className="mt-3 h-2"
        />
        <p className="text-xs text-muted-foreground mt-2">Target: 3.9</p>
      </CardContent>
      <CardFooter className="space-x-4">
        <Link href={"/dashboard/transcript"}>
          <Button>
            Transcript
            <GoArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>

        <Link href={"/dashboard/quick-calculate"}>
          <Button className="bg-foreground text-background hover:bg-foreground/80">
            Quick
            <MdCalculate className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CpaCard;
