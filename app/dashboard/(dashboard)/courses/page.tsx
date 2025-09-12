import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses",
};

import React from "react";
import CoursescontainerPage from "./_components/courses-container";

const Coursespage = () => {
  return <CoursescontainerPage />;
};

export default Coursespage;
