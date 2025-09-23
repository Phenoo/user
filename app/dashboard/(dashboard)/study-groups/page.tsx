import React from "react";

import type { Metadata } from "next";
import StudyGroupsPageContainer from "./_components/studygroup-container";

export const metadata: Metadata = {
  title: "Study Group",
};

const StudyGrouppage = () => {
  return <StudyGroupsPageContainer />;
};

export default StudyGrouppage;
