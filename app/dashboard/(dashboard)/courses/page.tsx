"use client";

import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { toast } from "sonner";
import { BsArrowUpRight } from "react-icons/bs";

interface Course {
  id: string;
  name: string;
  code: string;
  year: string;
  session: string;
  credits: number;
  instructor: string;
  description?: string;
  color: string;
}

const COURSE_COLORS = [
  "bg-emerald-100 border-emerald-300 text-emerald-800",
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-orange-100 border-orange-300 text-orange-800",
  "bg-pink-100 border-pink-300 text-pink-800",
  "bg-indigo-100 border-indigo-300 text-indigo-800",
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      name: "Data Structures & Algorithms",
      code: "CS301",
      year: "2024",
      session: "Fall",
      credits: 3,
      instructor: "Dr. Smith",
      description: "Advanced data structures and algorithmic problem solving",
      color: COURSE_COLORS[0],
    },
    {
      id: "2",
      name: "Database Systems",
      code: "CS401",
      year: "2024",
      session: "Fall",
      credits: 4,
      instructor: "Prof. Johnson",
      description: "Relational databases, SQL, and database design principles",
      color: COURSE_COLORS[1],
    },
    {
      id: "3",
      name: "Linear Algebra",
      code: "MATH201",
      year: "2023",
      session: "Spring",
      credits: 3,
      instructor: "Dr. Williams",
      color: COURSE_COLORS[2],
    },
  ]);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedSession, setSelectedSession] = useState("all");

  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    year: "",
    session: "",
    credits: 3,
    instructor: "",
    description: "",
  });

  const years = Array.from(new Set(courses.map((course) => course.year)))
    .sort()
    .reverse();
  const sessions = ["Fall", "Spring", "Summer"];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === "all" || course.year === selectedYear;
    const matchesSession =
      selectedSession === "all" || course.session === selectedSession;
    return matchesSearch && matchesYear && matchesSession;
  });

  const coursesByYear = filteredCourses.reduce(
    (acc, course) => {
      if (!acc[course.year]) {
        acc[course.year] = {};
      }
      if (!acc[course.year][course.session]) {
        acc[course.year][course.session] = [];
      }
      acc[course.year][course.session].push(course);
      return acc;
    },
    {} as Record<string, Record<string, Course[]>>
  );

  const handleAddCourse = () => {
    if (
      !newCourse.name ||
      !newCourse.code ||
      !newCourse.year ||
      !newCourse.session
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const course: Course = {
      id: Date.now().toString(),
      ...newCourse,
      color: COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)],
    };

    setCourses([...courses, course]);
    setNewCourse({
      name: "",
      code: "",
      year: "",
      session: "",
      credits: 3,
      instructor: "",
      description: "",
    });
    setIsAddSheetOpen(false);
    toast.success(`${course.name} has been added successfully.`);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewCourse({
      name: course.name,
      code: course.code,
      year: course.year,
      session: course.session,
      credits: course.credits,
      instructor: course.instructor,
      description: course.description || "",
    });
  };

  const handleUpdateCourse = () => {
    if (!editingCourse) return;

    const updatedCourses = courses.map((course) =>
      course.id === editingCourse.id ? { ...course, ...newCourse } : course
    );

    setCourses(updatedCourses);
    setEditingCourse(null);
    setNewCourse({
      name: "",
      code: "",
      year: "",
      session: "",
      credits: 3,
      instructor: "",
      description: "",
    });
    toast.success("Course information has been updated successfully");
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter((course) => course.id !== courseId));
    toast.success("Course has been removed from your list.");
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
                  year: "",
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
            <SheetContent className="sm:max-w-2xl overflow-y-auto">
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
              <div className="grid gap-6 py-6 px-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
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
                  <Label htmlFor="code">Course Code *</Label>
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
                    <Label htmlFor="year">Academic Year *</Label>
                    <Select
                      value={newCourse.year}
                      onValueChange={(value) =>
                        setNewCourse({ ...newCourse, year: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session">Session *</Label>
                    <Select
                      value={newCourse.session}
                      onValueChange={(value) =>
                        setNewCourse({ ...newCourse, session: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
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
                          credits: Number.parseInt(e.target.value) || 3,
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
                  onClick={editingCourse ? handleUpdateCourse : handleAddCourse}
                >
                  {editingCourse ? "Update Course" : "Add Course"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
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
              <div className="flex gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((year) => (
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
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    {sessions.map((session) => (
                      <SelectItem key={session} value={session}>
                        {session}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {session} Semester
                        <Badge variant="secondary" className="ml-2">
                          {coursesByYear[year][session].length} course
                          {coursesByYear[year][session].length !== 1 ? "s" : ""}
                        </Badge>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coursesByYear[year][session].map((course) => (
                          <Card
                            key={course.id}
                            className={`transition-all duration-200 hover:shadow-lg border-2 ${course.color}`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className="text-lg font-bold text-balance">
                                    {course.name}
                                  </CardTitle>
                                  <CardDescription className="font-mono text-sm font-medium mt-1">
                                    {course.code}
                                  </CardDescription>
                                </div>
                                <Link
                                  href={`/dashboard/courses/course/${course.id}`}
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
                                  <span className="text-muted-foreground">
                                    Credits:
                                  </span>
                                  <Badge variant="outline">
                                    {course.credits}
                                  </Badge>
                                </div>
                                {course.instructor && (
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                      Instructor:
                                    </span>
                                    <span className="font-medium text-right">
                                      {course.instructor}
                                    </span>
                                  </div>
                                )}
                                {course.description && (
                                  <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
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
