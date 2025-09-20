"use client";

import { useEffect, useState } from "react";
import { Plus, BookOpen, Calendar, Search } from "lucide-react";
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

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { toast } from "sonner";
import { BsArrowUpRight } from "react-icons/bs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { RequireIndicator } from "@/components/require-indicator";
import { get } from "http";

export interface Course {
  _id: string;
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
  "bg-[#FED35B] border-[#FED35B] text-black dark:bg-[#8A6B2E] dark:border-[#8A6B2E] dark:text-white",
  "bg-[#B6C682] border-[#B6C682] text-black dark:bg-[#6E7A4C] dark:border-[#6E7A4C] dark:text-white",
  "bg-[#C3ABFF] border-[#C3ABFF] text-black dark:bg-[#6F5A99] dark:border-[#6F5A99] dark:text-white",
  "bg-[#D2D2FB] border-[#D2D2FB] text-black dark:bg-[#555577] dark:border-[#555577] dark:text-white",
  "bg-[#b6caeb] border-[#b6caeb] text-black dark:bg-[#4A6075] dark:border-[#4A6075] dark:text-white",
  "bg-primary border-primary text-black dark:bg-primary dark:border-primary dark:text-white",
  "bg-[#ef6438] border-[#ef6438] text-white dark:bg-[#a63d1c] dark:border-[#a63d1c] dark:text-white",
];

export default function CoursescontainerPage() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedSession, setSelectedSession] = useState("all");
  const addCourse = useMutation(api.courses.addCourse);

  const user = useQuery(api.users.currentUser);

  const courses =
    useQuery(api.courses.getAllCourses, {
      userId: user?._id as Id<"users">,
    }) || [];

  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    academicYear: "",
    session: "",
    credits: 3,
    instructor: "",
    description: "",
  });

  const years = Array.from(
    new Set(courses.map((course) => course.academicYear))
  )
    .sort()
    .reverse();

  const sessions = ["Fall", "Spring", "Summer"];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear =
      selectedYear === "all" || course.academicYear === selectedYear;
    const matchesSession =
      selectedSession === "all" || course.session === selectedSession;
    return matchesSearch && matchesYear && matchesSession;
  });

  const coursesByYear = filteredCourses.reduce(
    (acc, course) => {
      if (!acc[course.academicYear]) {
        acc[course.academicYear] = {};
      }
      if (!acc[course.academicYear][course.session]) {
        acc[course.academicYear][course.session] = [];
      }
      //@ts-ignore
      acc[course.academicYear][course.session].push(course);
      return acc;
    },
    {} as Record<string, Record<string, Course[]>>
  );

  const handleUpdateCourse = () => {
    if (!editingCourse) return;

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              My Courses
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your academic courses by year and session
            </p>
          </div>

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
                        <SelectItem value="Fall">
                          {" "}
                          1st Semester (Fall)
                        </SelectItem>
                        <SelectItem value="Spring">
                          2nd Semester (Spring)
                        </SelectItem>
                        <SelectItem value="Summer">
                          3rd Semester (Summer)
                        </SelectItem>
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
        </div>

        {/* Filters */}
        <Card>
          <CardContent className=" p-2 md:p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search courses, codes, or instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                {courses.length > 0 && (
                  <>
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger className="w-full md:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years &&
                          years.length > 0 &&
                          years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedSession}
                      onValueChange={setSelectedSession}
                    >
                      <SelectTrigger className="w-full md:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sessions</SelectItem>
                        {sessions &&
                          sessions.length > 0 &&
                          sessions.map((session) => (
                            <SelectItem key={session} value={session}>
                              {session}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="space-y-8">
          {Object.keys(coursesByYear).length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No courses found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ||
                  selectedYear !== "all" ||
                  selectedSession !== "all"
                    ? "Try adjusting your filters or search terms"
                    : "Start by adding your first course"}
                </p>
                {!searchTerm &&
                  selectedYear === "all" &&
                  selectedSession === "all" && (
                    <Button onClick={() => setIsAddSheetOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Course
                    </Button>
                  )}
              </CardContent>
            </Card>
          ) : (
            Object.keys(coursesByYear)
              .sort()
              .reverse()
              .map((year) => (
                <div key={year} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-foreground" />
                    <h2 className="text-2xl font-bold text-foreground">
                      {year}
                    </h2>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>

                  {Object.keys(coursesByYear[year]).map((session) => (
                    <div key={session} className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-foreground rounded-full"></div>
                        <Link href={`/dashboard/semester-analysis`}>
                          {session} Semester
                        </Link>
                        <Badge variant="secondary" className="ml-2">
                          {coursesByYear[year][session].length} course
                          {coursesByYear[year][session].length !== 1 ? "s" : ""}
                        </Badge>
                        <div className="flex items-center space-x-4">
                          {/* <Badge variant="secondary">
                          GPA: {semesterInfo.gpa.toFixed(2)}
                        </Badge> */}
                          <Badge variant="outline">
                            {coursesByYear[year][session].reduce(
                              (total, item) => total + item.credits,
                              0
                            )}{" "}
                            Credits
                          </Badge>
                        </div>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coursesByYear[year][session].map((course) => (
                          <Card
                            key={course._id}
                            className={cn(
                              `transition-all duration-200 hover:shadow-lg border-2`,
                              course.colorTag
                            )}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className="text-lg font-bold text-balance">
                                    {course.name}
                                  </CardTitle>
                                  <CardDescription className="font-mono text-foreground text-sm font-medium mt-1">
                                    {course.code}
                                  </CardDescription>
                                </div>
                                <Link
                                  href={`/dashboard/courses/course/${course._id}`}
                                  className="ml-auto"
                                >
                                  <Button
                                    size="icon"
                                    className="bg-foreground hover:bg-foreground/70 text-background ml-auto rounded-full"
                                  >
                                    <BsArrowUpRight
                                      stroke="1"
                                      className="h-4 stroke-[1px]  w-4"
                                    />
                                  </Button>
                                </Link>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="">Credits:</span>
                                  <Badge
                                    variant="outline"
                                    className="border dark:border-white border-black"
                                  >
                                    {course.credits}
                                  </Badge>
                                </div>
                                {course.instructor && (
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="">Instructor:</span>
                                    <span className="font-medium text-right">
                                      {course.instructor}
                                    </span>
                                  </div>
                                )}
                                {course.description && (
                                  <p className="text-sm t text-pretty leading-relaxed">
                                    {course.description}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
