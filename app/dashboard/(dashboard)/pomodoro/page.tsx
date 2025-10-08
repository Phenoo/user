import React from "react";
import type { Metadata } from "next";

import PomodoroPageContainer from "./_components/pomodoro-container";

export const metadata: Metadata = {
  title: "Pomodoro",
};

const PomodoroPage = () => {
  return <PomodoroPageContainer />;
};

export default PomodoroPage;
