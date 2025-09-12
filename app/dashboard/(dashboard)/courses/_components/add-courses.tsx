"use client";
import React from "react";
import { useEffect, useState } from "react";
import {
  Plus,
  BookOpen,
  Calendar,
  GraduationCap,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { RequireIndicator } from "@/components/require-indicator";

interface Course {
  id: string;
  name: string;
  code: string;
  year: string;
  session: string;
  credits: number;
  instructor: string;
  description?: string;
  colorTag: string;
}

const COURSE_COLORS = [
  "bg-[#FED35B] border-[#FED35B] text-black",
  "bg-[#B6C682] border-[#B6C682] text-black",
  "bg-[#C3ABFF] border-[#C3ABFF] text-black",
  "bg-[#D2D2FB] border-[#D2D2FB] text-black",
  "bg-[#b6caeb] border-[#b6caeb] text-black",
  "bg-primary border-primary text-black",
  "bg-[#ef6438] border-[#ef6438] text-white",
];

const AddCoursesSheet = () => {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const addCourse = useMutation(api.courses.addCourse);

  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    academicYear: "",
    session: "",
    credits: 3,
    instructor: "",
    description: "",
  });
  const user = useQuery(api.users.currentUser);

  const sessions = ["Fall", "Spring", "Summer"];

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewCourse({
      name: course.name,
      code: course.code,
      academicYear: course.year,
      session: course.session,
      credits: course.credits,
      instructor: course.instructor,
      description: course.description || "",
    });
  };

  const handleUpdateCourse = () => {
    if (!editingCourse) return;

    // const updatedCourses = courses.map((course) =>
    //   course.id === editingCourse.id ? { ...course, ...newCourse } : course
    // );

    setEditingCourse(null);
    setNewCourse({
      name: "",
      code: "",
      academicYear: "",
      session: "",
      credits: 3,
      instructor: "",
      description: "",
    });
    toast.success("Course information has been updated successfully");
  };

  const handleDeleteCourse = (courseId: string) => {
    toast.success("Course has been removed from your list.");
  };
  newCourse;

  const handleSubmit = async () => {
    if (
      !newCourse.name ||
      !newCourse.code ||
      !newCourse.academicYear ||
      !newCourse.session
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      await addCourse({
        userId: user?._id!,
        name: newCourse.name,
        code: newCourse.code,
        academicYear: newCourse.academicYear,
        session: newCourse.session,
        instructor: newCourse.instructor,
        credits: newCourse.credits, // Ensure credits is a number
        description: newCourse.description || undefined,
        lmsLink: "",
        colorTag:
          COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)],
        status: "active", // Default status for a new course
      });
      toast.success(`${newCourse.name} has been added successfully.`);
      setNewCourse({
        name: "",
        code: "",
        academicYear: "",
        session: "",
        credits: 3,
        instructor: "",
        description: "",
      });
      setIsAddSheetOpen(false);
      // Close the sheet, show a success message, clear form
    } catch (error) {
      console.error("Failed to add course:", error);
      toast.error("Failed to add course:");

      // Show error message
    }
  };

  return (
    <Sheet
      open={isAddSheetOpen || !!editingCourse}
      onOpenChange={(open) => {
        setIsAddSheetOpen(open);
        if (!open) {
          setEditingCourse(null);
          setNewCourse({
            name: "",
            code: "",
            academicYear: "",
            session: "",
            credits: 3,
            instructor: "",
            description: "",
          });
        }
      }}
    >
      <SheetTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {editingCourse ? "Edit Course" : "Add New Course"}
          </SheetTitle>
          <SheetDescription>
            {editingCourse
              ? "Update course information below"
              : "Fill in the details for your new course"}
          </SheetDescription>
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
                  <SelectItem value="2030">2030</SelectItem>
                  <SelectItem value="2029">2029</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
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
                    credits: Number.parseInt(e.target.value) || 2,
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
              setIsAddSheetOpen(false);
              setEditingCourse(null);
            }}
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            className="w-full"
            onClick={editingCourse ? handleUpdateCourse : handleSubmit}
          >
            {editingCourse ? "Update Course" : "Add Course"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddCoursesSheet;
