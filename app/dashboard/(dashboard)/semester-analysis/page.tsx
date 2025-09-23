import type { Metadata } from "next";

import SemesterAnalysisPageContainer from "./_components/semester-analysis-container";

export const metadata: Metadata = {
  title: "Semester Analysis",
};

const SemesterAnalysisPage = () => {
  return (
    <>
      <SemesterAnalysisPageContainer />
    </>
  );
};

export default SemesterAnalysisPage;
