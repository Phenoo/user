"use client";
import React from "react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RequireIndicator } from "@/components/require-indicator";

const EditCoursesSheet = ({
  isEditing,
  setIsEditing,
  course,
}: {
  isEditing: boolean;
  setIsEditing: any;
  course: any;
}) => {
  const [newCourse, setNewCourse] = useState({
    _id: "",
    name: "",
    code: "",
    academicYear: "",
    session: "",
    credits: 3,
    instructor: "",
    description: "",
    lmsLink: "",
  });
  const editCourse = useMutation(api.courses.editCourse);

  const user = useQuery(api.users.currentUser);
  const [isSaving, setIsSaving] = useState(false);

  const yearOptions = useMemo(() => {
    const options = [
      "2030",
      "2029",
      "2028",
      "2027",
      "2026",
      "2025",
      "2024",
      "2023",
      "2022",
      "2021",
    ];
    if (newCourse.academicYear && !options.includes(newCourse.academicYear)) {
      options.push(newCourse.academicYear);
    }
    return options;
  }, [newCourse.academicYear]);

  const handleSubmit = async () => {
    if (
      !newCourse._id ||
      !newCourse.name.trim() ||
      !newCourse.code.trim() ||
      !newCourse.academicYear ||
      !newCourse.session
    ) {
      toast.error("Please fill in all required course fields.");
      return;
    }
    if (!user?._id) {
      toast.error("Your account is still loading. Please try again.");
      return;
    }

    setIsSaving(true);
    try {
      await editCourse({
        courseId: newCourse._id as Id<"courses">,
        userId: user._id,
        name: newCourse.name.trim(),
        code: newCourse.code.trim(),
        academicYear: newCourse.academicYear,
        session: newCourse.session,
        instructor: newCourse.instructor,
        credits: newCourse.credits, // Ensure credits is a number
        description: newCourse.description.trim() || undefined,
        lmsLink: newCourse.lmsLink.trim() || undefined,
      });
      toast.success(`${newCourse.name} has been updated successfully.`);
      setNewCourse({
        _id: "",
        name: "",
        code: "",
        academicYear: "",
        session: "",
        credits: 3,
        instructor: "",
        description: "",
        lmsLink: "",
      });
      setIsEditing(false);
      // Close the sheet, show a success message, clear form
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to update course: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!course) return;
    setNewCourse({
      _id: course._id || "",
      name: course.name || "",
      code: course.code || "",
      academicYear: course.academicYear || "",
      session: course.session || "",
      credits: course.credits || 3,
      instructor: course.instructor || "",
      description: course.description || "",
      lmsLink: course.lmsLink || "",
    });
  }, [course]);

  return (
    <Sheet
      open={isEditing}
      onOpenChange={(open) => {
        setIsEditing(open);
        if (!open) {
          setNewCourse({
            _id: "",
            name: "",
            code: "",
            academicYear: "",
            session: "",
            credits: 3,
            instructor: "",
            description: "",
            lmsLink: "",
          });
        }
      }}
    >
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{"Edit Course"}</SheetTitle>
          <SheetDescription>Update course information below</SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 pb-6 px-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Course Name <RequireIndicator />
            </Label>
            <Input
              id="name"
              value={newCourse.name}
              onChange={(e) =>
                setNewCourse({ ...newCourse, name: e.target.value })
              }
              placeholder="e.g., Data Structures & Algorithms"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">
              Course Code <RequireIndicator />
            </Label>
            <Input
              id="code"
              value={newCourse.code}
              onChange={(e) =>
                setNewCourse({ ...newCourse, code: e.target.value })
              }
              placeholder="e.g., CS301"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">
                Academic Year <RequireIndicator />
              </Label>
              <Select
                value={newCourse.academicYear}
                onValueChange={(value) =>
                  setNewCourse({ ...newCourse, academicYear: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session">
                Session <RequireIndicator />
              </Label>
              <Select
                value={newCourse.session}
                onValueChange={(value) =>
                  setNewCourse({ ...newCourse, session: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fall"> 1st Semester (Fall)</SelectItem>
                  <SelectItem value="Spring">2nd Semester (Spring)</SelectItem>
                  <SelectItem value="Summer">3rd Semester (Summer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Credit Hours</Label>
              <Input
                id="credits"
                type="number"
                value={newCourse.credits}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    credits: Number.parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                max="6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={newCourse.instructor}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    instructor: e.target.value,
                  })
                }
                placeholder="e.g., Dr. Smith"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse({
                  ...newCourse,
                  description: e.target.value,
                })
              }
              placeholder="Brief description of the course content and objectives..."
              rows={4}
            />
          </div>
        </div>
        <SheetFooter className="gap-2 grid-cols-2 w-full grid">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setNewCourse({
                _id: "",
                name: "",
                code: "",
                academicYear: "",
                session: "",
                credits: 3,
                instructor: "",
                description: "",
                lmsLink: "",
              });
            }}
            className="w-full"
          >
            Cancel
          </Button>
          <Button className="w-full" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Updating..." : "Update Course"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditCoursesSheet;
