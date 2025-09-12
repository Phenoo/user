import { redirect } from "next/navigation";
import React from "react";

const CourseRedirectpage = () => {
  return redirect("/dashboard/courses");
};

export default CourseRedirectpage;
