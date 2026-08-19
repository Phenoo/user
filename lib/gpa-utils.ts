export type GpaScaleType = "5.0" | "4.0";

// Nigerian University System (NUC 5-Point Scale) - Official Standard
export const NIGERIA_5_POINT_GRADE_POINTS: Record<string, number> = {
  A: 5.0,
  B: 4.0,
  C: 3.0,
  D: 2.0,
  E: 1.0,
  F: 0.0,
  // Optional +/- support for flexible manual entry
  "A+": 5.0,
  "A-": 4.5,
  "B+": 4.0,
  "B-": 3.5,
  "C+": 3.0,
  "C-": 2.5,
  "D+": 2.0,
};

// Standard US 4.0 Scale
export const US_4_POINT_GRADE_POINTS: Record<string, number> = {
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
  E: 0.0,
  F: 0.0,
};

// Default grade points map (Nigerian 5-point scale)
export const gradePoints: Record<string, number> = NIGERIA_5_POINT_GRADE_POINTS;

export const getGradePointsForScale = (
  scale: GpaScaleType = "5.0"
): Record<string, number> => {
  return scale === "4.0" ? US_4_POINT_GRADE_POINTS : NIGERIA_5_POINT_GRADE_POINTS;
};

export const getMaxGpaForScale = (scale: GpaScaleType = "5.0"): number => {
  return scale === "4.0" ? 4.0 : 5.0;
};

export const calculateLetterGrade = (
  percentage: number,
  scale: GpaScaleType = "5.0"
): string => {
  if (scale === "4.0") {
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
  }

  // Nigerian NUC 5-Point Scale (Default)
  if (percentage >= 70) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 45) return "D";
  if (percentage >= 40) return "E";
  return "F";
};

export const getDegreeClassification = (
  gpa: number,
  scale: GpaScaleType = "5.0"
): { title: string; color: string } => {
  if (scale === "4.0") {
    if (gpa >= 3.8) return { title: "Summa Cum Laude", color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" };
    if (gpa >= 3.6) return { title: "Magna Cum Laude", color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800" };
    if (gpa >= 3.4) return { title: "Cum Laude", color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800" };
    if (gpa >= 3.0) return { title: "Dean's List", color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800" };
    if (gpa >= 2.0) return { title: "Good Standing", color: "text-neutral-600 bg-neutral-50 border-neutral-200 dark:bg-neutral-900/40 dark:text-neutral-400 dark:border-neutral-800" };
    return { title: "Academic Probation", color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800" };
  }

  // Nigerian University System (NUC 5.0)
  if (gpa >= 4.5) return { title: "First Class Honours", color: "text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" };
  if (gpa >= 3.5) return { title: "Second Class Upper (2:1)", color: "text-blue-700 bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" };
  if (gpa >= 2.4) return { title: "Second Class Lower (2:2)", color: "text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" };
  if (gpa >= 1.5) return { title: "Third Class Honours", color: "text-orange-700 bg-orange-50 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800" };
  if (gpa >= 1.0) return { title: "Pass", color: "text-neutral-700 bg-neutral-100 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700" };
  return { title: "Fail", color: "text-red-700 bg-red-50 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" };
};

export const calculateCourseGrade = (
  assessments: any[],
  scale: GpaScaleType = "5.0"
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
  const letterGrade = calculateLetterGrade(finalPercentage, scale);

  return { percentage: finalPercentage, letterGrade };
};
