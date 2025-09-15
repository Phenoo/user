"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  BarChart3,
  Brain,
  BookOpen,
  Play,
  FileText,
  Download,
  ExternalLink,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import LoadingComponent from "@/components/loader";
import { cn } from "@/lib/utils";
import EditCoursesSheet from "../../_components/edit-courses";
import { toast } from "sonner";

import { FlashcardItem } from "@/components/flashcard-item";

import {
  FlashcardContainer,
  FlashcardItemProps,
} from "../../../flashcards/components/flashcard-container";
import { Course } from "../../_components/courses-container";
import NewFlashcard from "../../../flashcards/components/new-flashcard";

interface Schedule {
  id: string;
  day: string;
  time: string;
  location: string;
  type: string;
  topic?: string;
}

interface StudyGroup {
  id: string;
  name: string;
  members: number;
  nextMeeting: string;
  description: string;
  isJoined: boolean;
}

interface Statistics {
  attendance: number;
  assignments: { completed: number; total: number };
  grade: string;
  upcomingDeadlines: Array<{
    title: string;
    date: string;
    type: string;
  }>;
}

interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  relevance: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: string;
}

// Mock data

const mockSchedules: Record<string, Schedule[]> = {
  "1": [
    {
      id: "1",
      day: "Monday",
      time: "10:00 AM - 11:30 AM",
      location: "Room 301",
      type: "Lecture",
      topic: "Binary Trees",
    },
    {
      id: "2",
      day: "Wednesday",
      time: "2:00 PM - 3:30 PM",
      location: "Lab 205",
      type: "Lab",
      topic: "Tree Traversal Implementation",
    },
    {
      id: "3",
      day: "Friday",
      time: "10:00 AM - 11:30 AM",
      location: "Room 301",
      type: "Lecture",
      topic: "Graph Algorithms",
    },
  ],
};

const mockStudyGroups: Record<string, StudyGroup[]> = {
  "1": [
    {
      id: "1",
      name: "Algorithm Masters",
      members: 5,
      nextMeeting: "Tomorrow 3:00 PM",
      description:
        "Focus on competitive programming and algorithm optimization",
      isJoined: true,
    },
    {
      id: "2",
      name: "Code Warriors",
      members: 4,
      nextMeeting: "Friday 7:00 PM",
      description: "Weekly coding challenges and peer review sessions",
      isJoined: false,
    },
    {
      id: "3",
      name: "Data Structure Enthusiasts",
      members: 8,
      nextMeeting: "Sunday 2:00 PM",
      description: "Deep dive into advanced data structures",
      isJoined: false,
    },
  ],
};

const mockStatistics: Record<string, Statistics> = {
  "1": {
    attendance: 92,
    assignments: { completed: 8, total: 10 },
    grade: "A-",
    upcomingDeadlines: [
      {
        title: "Assignment 3: Graph Implementation",
        date: "Dec 15, 2024",
        type: "Assignment",
      },
      { title: "Midterm Exam", date: "Dec 20, 2024", type: "Exam" },
      { title: "Project Proposal", date: "Jan 5, 2025", type: "Project" },
    ],
  },
};

const mockFlashcards: Record<string, FlashcardItemProps[]> = {
  "1": [
    {
      id: "1",
      title: "Chapter 3",
      subject: "Party History",
      date: "Academic Year 1 2024 - 2025",
      participants: 3,
      color: "border-t-rose-400",
    },
    {
      id: "2",
      title: "Chapter 4",
      subject: "Aesthetics",
      date: "Academic Year 1 (2024 - 2025)",
      participants: 2,
      color: "border-t-green-400",
    },
    {
      id: "3",
      title: "Chapter 3",
      subject: "Aesthetics",
      date: "Academic Year 1 (2024 - 2025)",
      participants: 2,
      color: "border-t-green-400",
    },
    {
      id: "4",
      title: "Chapter 2",
      subject: "Party History",
      date: "Academic Year 1 (2024 - 2025)",
      participants: 1,
      color: "border-t-rose-400",
    },
    {
      id: "5",
      title: "Chapter 1",
      subject: "Aesthetics",
      date: "Academic Year 1 (2024 - 2025)",
      participants: 2,
      color: "border-t-green-400",
    },
    {
      id: "6",
      title: "How something is done vocabulary",
      subject: "Beginner English",
      date: "8 hours ago",
      participants: 1,
      color: "border-t-yellow-400",
    },
    {
      id: "7",
      title: "Home vocabulary",
      subject: "Beginner English",
      date: "7 hours ago",
      participants: 1,
      color: "border-yellow-400",
    },
  ],
};

const mockYouTubeVideos: Record<string, YouTubeVideo[]> = {
  "1": [
    {
      id: "1",
      title: "Binary Tree Traversal Explained",
      channel: "CS Dojo",
      duration: "15:32",
      thumbnail: "/binary-tree-tutorial.jpg",
      relevance: "Highly Relevant",
    },
    {
      id: "2",
      title: "Graph Algorithms Visualization",
      channel: "3Blue1Brown",
      duration: "22:45",
      thumbnail: "/graph-algorithms-visualization.jpg",
      relevance: "Highly Relevant",
    },
    {
      id: "3",
      title: "Dynamic Programming Patterns",
      channel: "Back To Back SWE",
      duration: "18:20",
      thumbnail: "/dynamic-programming-patterns.jpg",
      relevance: "Relevant",
    },
    {
      id: "4",
      title: "Big O Notation Simplified",
      channel: "freeCodeCamp",
      duration: "12:15",
      thumbnail: "/big-o-notation-tutorial.jpg",
      relevance: "Relevant",
    },
  ],
};

const mockDocuments: Record<string, Document[]> = {
  "1": [
    {
      id: "1",
      name: "Course Syllabus",
      type: "PDF",
      size: "2.3 MB",
      uploadDate: "Aug 15, 2024",
      category: "Course Info",
    },
    {
      id: "2",
      name: "Lecture 1 - Introduction to Data Structures",
      type: "PDF",
      size: "5.1 MB",
      uploadDate: "Aug 20, 2024",
      category: "Lectures",
    },
    {
      id: "3",
      name: "Assignment 1 - Array Operations",
      type: "PDF",
      size: "1.8 MB",
      uploadDate: "Aug 25, 2024",
      category: "Assignments",
    },
    {
      id: "4",
      name: "Binary Tree Implementation",
      type: "Code",
      size: "15 KB",
      uploadDate: "Sep 10, 2024",
      category: "Code Examples",
    },
    {
      id: "5",
      name: "Midterm Study Guide",
      type: "PDF",
      size: "3.2 MB",
      uploadDate: "Oct 1, 2024",
      category: "Study Materials",
    },
    {
      id: "6",
      name: "Graph Algorithms Cheat Sheet",
      type: "PDF",
      size: "1.5 MB",
      uploadDate: "Oct 15, 2024",
      category: "Study Materials",
    },
  ],
};

export default function CoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const user = useQuery(api.users.currentUser);

  const course = useQuery(api.courses.getCourseById, {
    courseId: courseId as Id<"courses">,
    currentuserId: user?._id as Id<"users">,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const deleteCourse = useMutation(api.courses.deleteCourse);

  const [activeSection, setActiveSection] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [videoFilter, setVideoFilter] = useState("all");

  const schedules = mockSchedules[courseId] || [];
  const studyGroups = mockStudyGroups[courseId] || [];
  const statistics = mockStatistics[courseId];
  const flashcards =
    useQuery(api.flashcards.getUserDecksByCourseId, {
      courseId: params.id as Id<"courses">,
      userId: user?._id as Id<"users">,
    }) || [];
  const youtubeVideos = mockYouTubeVideos[courseId] || [];
  const documents = mockDocuments[courseId] || [];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      documentFilter === "all" || doc.category === documentFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredVideos = youtubeVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.channel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      videoFilter === "all" || video.relevance === videoFilter;
    return matchesSearch && matchesFilter;
  });

  const sections = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "schedules", label: "Schedules", icon: Calendar },
    { id: "groups", label: "Study Groups", icon: Users },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    { id: "flashcards", label: "Flashcards", icon: Brain },
    { id: "videos", label: "YouTube Videos", icon: Play },
    { id: "documents", label: "Documents", icon: FileText },
  ];
  if (!user || course === undefined) {
    return <LoadingComponent />;
  }

  const handleDelete = async () => {
    try {
      await deleteCourse({
        userId: user._id as Id<"users">,
        courseId: courseId as Id<"courses">,
      });
      toast.success("Course deleted successfully!");
      router.replace("/dashboard/courses");
      // Close sheet, show success
    } catch (err) {
      toast.error("Failed to delete course");
      console.error("Failed to delete course:", err);
      // Display the error message from Convex
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Course Not Found
          </h1>
          <Link href="/dashboard/courses">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleEditCourse = (course: Course) => {
    setIsEditing(true);
    setEditingCourse(course);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/courses">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Courses
                </Button>
              </Link>
            </div>

            <div className="flex items-start gap-4 flex-col md:flex-row">
              <div className="flex-1">
                <div className="flex gap-4 items-center">
                  <h1 className="text-3xl font-bold text-foreground text-balance">
                    {course.name}
                  </h1>
                  <div
                    className={cn(
                      `w-5 h-5 rounded-sm  flex-shrink-0 mt-1`,

                      course.colorTag && course.colorTag.split(" ")[0]
                    )}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                  <span className="font-mono font-medium">{course.code}</span>
                  <span>•</span>
                  <span>
                    {course.session} {course.academicYear}
                  </span>
                  <span>•</span>
                  <span>{course.credits} Credits</span>
                  <span>•</span>
                  <span>{course.instructor}</span>
                </div>
                <div className="space-y-0.5 mt-4">
                  <h6 className="text-sm">Description</h6>
                  <p className="text-muted-foreground text-xs text-pretty leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-5 items-center">
                <Button
                  variant={"outline"}
                  //@ts-ignore
                  onClick={() => handleEditCourse(course)}
                >
                  Edit
                </Button>
                <Button
                  variant={"destructive"}
                  onClick={() => setIsDeleting(true)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex overflow-x-auto">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeSection === section.id
                        ? "border-primary text-foreground font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6">
          {activeSection === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveSection("schedules")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-foreground" />
                    Class Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    View your weekly class schedule and upcoming sessions
                  </p>
                  <Badge variant="secondary">
                    {schedules.length} sessions per week
                  </Badge>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveSection("groups")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-foreground" />
                    Study Groups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    Join study groups and collaborate with peers
                  </p>
                  <Badge variant="secondary">
                    {studyGroups.length} groups available
                  </Badge>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveSection("statistics")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-foreground" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    Track your progress and academic performance
                  </p>
                  {statistics && (
                    <Badge variant="secondary">Grade: {statistics.grade}</Badge>
                  )}
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveSection("flashcards")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-foreground" />
                    Flashcards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    Study with interactive flashcard sets
                  </p>
                  <Badge variant="secondary">
                    {flashcards.length} sets available
                  </Badge>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveSection("videos")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-foreground" />
                    Video Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    Curated YouTube videos for additional learning
                  </p>
                  <Badge variant="secondary">
                    {youtubeVideos.length} videos suggested
                  </Badge>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveSection("documents")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-foreground" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    Access course materials and resources
                  </p>
                  <Badge variant="secondary">
                    {documents.length} documents
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "schedules" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">
                  Class Schedule
                </h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>

              <div className="grid gap-4">
                {schedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">
                              {schedule.day}
                            </h3>
                            <Badge variant="outline">{schedule.type}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{schedule.time}</span>
                          </div>
                          <p className="text-muted-foreground">
                            {schedule.location}
                          </p>
                          {schedule.topic && (
                            <p className="text-sm font-medium text-primary">
                              {schedule.topic}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === "groups" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">
                  Study Groups
                </h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>

              <div className="grid gap-4">
                {studyGroups.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">
                              {group.name}
                            </h3>
                            {group.isJoined && <Badge>Joined</Badge>}
                          </div>
                          <p className="text-muted-foreground">
                            {group.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {group.members} members
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Next: {group.nextMeeting}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant={group.isJoined ? "outline" : "default"}
                        >
                          {group.isJoined ? "Leave" : "Join"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === "statistics" && statistics && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                Course Statistics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-foreground" />
                      Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">
                          {statistics.attendance}%
                        </span>
                        <Badge variant="secondary">Excellent</Badge>
                      </div>
                      <Progress value={statistics.attendance} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-foreground" />
                      Assignments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">
                          {statistics.assignments.completed}/
                          {statistics.assignments.total}
                        </span>
                        <Badge variant="secondary">
                          {Math.round(
                            (statistics.assignments.completed /
                              statistics.assignments.total) *
                              100
                          )}
                          %
                        </Badge>
                      </div>
                      <Progress
                        value={
                          (statistics.assignments.completed /
                            statistics.assignments.total) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-foreground" />
                      Current Grade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <span className="text-4xl font-bold text-primary">
                        {statistics.grade}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistics.upcomingDeadlines.map((deadline, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{deadline.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {deadline.date}
                          </p>
                        </div>
                        <Badge variant="outline">{deadline.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "flashcards" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">
                  Flashcard Sets
                </h2>
                <NewFlashcard />
              </div>

              <div className="grid w-full gap-6">
                <FlashcardContainer decks={flashcards} />
              </div>
            </div>
          )}

          {activeSection === "videos" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-foreground">
                  YouTube Video Suggestions
                </h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search videos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={videoFilter} onValueChange={setVideoFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Videos</SelectItem>
                      <SelectItem value="Highly Relevant">
                        Highly Relevant
                      </SelectItem>
                      <SelectItem value="Relevant">Relevant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredVideos.map((video) => (
                  <Card
                    key={video.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-0">
                      <div className="aspect-video relative">
                        <img
                          src={video.thumbnail || "/placeholder.jpg"}
                          alt={video.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button size="lg" className="rounded-full">
                            <Play className="h-6 w-6" />
                          </Button>
                        </div>
                        <Badge className="absolute top-2 right-2 bg-black/80 text-white">
                          {video.duration}
                        </Badge>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold text-balance leading-tight">
                            {video.title}
                          </h3>
                          <Badge
                            variant={
                              video.relevance === "Highly Relevant"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {video.relevance}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {video.channel}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Watch on YouTube
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === "documents" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-foreground">
                  Course Documents
                </h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select
                    value={documentFilter}
                    onValueChange={setDocumentFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Course Info">Course Info</SelectItem>
                      <SelectItem value="Lectures">Lectures</SelectItem>
                      <SelectItem value="Assignments">Assignments</SelectItem>
                      <SelectItem value="Code Examples">
                        Code Examples
                      </SelectItem>
                      <SelectItem value="Study Materials">
                        Study Materials
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{doc.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{doc.type}</span>
                              <span>•</span>
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>{doc.uploadDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{doc.category}</Badge>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <EditCoursesSheet
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        course={course}
      />
      <AlertDialog
        open={isDeleting}
        defaultOpen={isDeleting}
        onOpenChange={() => setIsDeleting(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              course <strong>{course.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/50"
              onClick={handleDelete}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
