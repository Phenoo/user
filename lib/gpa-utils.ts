export const gradePoints: { [key: string]: number } = {
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

export const calculateLetterGrade = (percentage: number): string => {
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

export const calculateCourseGrade = (
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
