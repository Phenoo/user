import React from "react";
import { StudyGroupDataTable } from "./components/study-group-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const StudyGrouppage = () => {
  return (
    <div className="min-h-screen max-w-7xl p-4 mx-auto w-full flex flex-col gap-8">
      <div className="mb-6 flex md:items-center justify-between gap-4 flex-col md:flex-row">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Groups</h1>
          <p className="text-sm">
            Join study groups tailored to your courses. Share notes, ask
            questions, and stay motivated with classmates who learn like you.
          </p>
        </div>
        <Button className="rounded-3xl">
          Create
          <Plus className="h-4 w-4" />
        </Button>{" "}
      </div>
      <StudyGroupDataTable />
    </div>
  );
};

export default StudyGrouppage;
