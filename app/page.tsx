"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckSquare,
  Target,
  User,
  Bell,
  BookOpen,
  CheckCircle2,
  Circle,
  PlayCircle,
  TrendingUp,
  FileText,
  Pin,
  BarChart3,
  Award,
  CalendarIcon,
  Settings,
  Camera,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type TabType = "home" | "calendar" | "tasks" | "goals" | "profile";
type ViewType = "month" | "week";
type AssignmentStatus = "not-started" | "in-progress" | "completed";
type AssignmentPriority = "low" | "medium" | "high";
type GoalType = "academic" | "personal" | "habit";
type GoalStatus = "active" | "completed" | "paused";
// Added note types and interfaces
type NoteCategory = "general" | "class" | "assignment" | "personal" | "study";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  major: string;
  year: string;
  gpa?: number;
  university: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  joinDate: string;
}

interface UserPreferences {
  notifications: {
    assignments: boolean;
    goals: boolean;
    schedule: boolean;
    achievements: boolean;
  };
  studySettings: {
    preferredStudyTime: string;
    breakInterval: number;
    focusSessionLength: number;
    weeklyStudyGoal: number;
  };
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlockedDate?: string;
  progress?: number;
  target?: number;
}

interface StudySession {
  id: number;
  subject: string;
  duration: number; // in minutes
  date: string;
  type: "focused" | "review" | "assignment";
}

interface ProductivityMetrics {
  weeklyStudyHours: number[];
  completionRate: number;
  averageTaskTime: number;
  streakDays: number;
  subjectDistribution: { subject: string; hours: number; color: string }[];
  weeklyGoals: { week: string; completed: number; total: number }[];
}

interface Note {
  id: number;
  title: string;
  content: string;
  category: NoteCategory;
  subject?: string;
  linkedTo?: {
    type: "assignment" | "class" | "goal";
    id: number;
    title: string;
  };
  tags: string[];
  isPinned: boolean;
  createdDate: string;
  updatedDate: string;
  attachments?: string[];
}

interface Goal {
  id: number;
  title: string;
  description?: string;
  type: GoalType;
  status: GoalStatus;
  current: number;
  target: number;
  unit: string;
  deadline?: string;
  createdDate: string;
  completedDate?: string;
  streak?: number;
  milestones?: { value: number; label: string; completed: boolean }[];
}

interface Assignment {
  id: number;
  title: string;
  subject: string;
  description?: string;
  dueDate: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  estimatedHours?: number;
  completedHours?: number;
  attachments?: string[];
}

interface ScheduleEvent {
  id: number;
  title: string;
  time: string;
  endTime?: string;
  room?: string;
  type: "class" | "assignment" | "exam" | "personal";
  date: string;
  recurring?: boolean;
}

export default function StudentProductivityApp() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [calendarView, setCalendarView] = useState<ViewType>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  // Added notes system state variables
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [notesSearchQuery, setNotesSearchQuery] = useState("");
  const [notesCategoryFilter, setNotesCategoryFilter] = useState<
    NoteCategory | "all"
  >("all");
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<
    "week" | "month" | "semester"
  >("week");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [goalFilter, setGoalFilter] = useState<GoalType | "all">("all");
  const [goalStatusFilter, setGoalStatusFilter] = useState<GoalStatus | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | "all">(
    "all"
  );
  const [filterPriority, setFilterPriority] = useState<
    AssignmentPriority | "all"
  >("all");
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: "",
    endTime: "",
    room: "",
    type: "class" as const,
    date: "",
    recurring: false,
  });
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: "",
    priority: "medium" as AssignmentPriority,
    estimatedHours: "",
  });
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    type: "academic" as GoalType,
    target: "",
    unit: "",
    deadline: "",
  });
  // Added new note state
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "general" as NoteCategory,
    subject: "",
    tags: "",
    linkedTo: null as {
      type: "assignment" | "class" | "goal";
      id: number;
      title: string;
    } | null,
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@university.edu",
    phone: "+1 (555) 123-4567",
    major: "Computer Science",
    year: "Junior",
    gpa: 3.7,
    university: "Tech University",
    bio: "Passionate computer science student with interests in AI and web development. Always looking to learn new technologies and improve my skills.",
    location: "San Francisco, CA",
    joinDate: "2023-09-01",
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    notifications: {
      assignments: true,
      goals: true,
      schedule: true,
      achievements: true,
    },
    studySettings: {
      preferredStudyTime: "morning",
      breakInterval: 25, // Pomodoro technique
      focusSessionLength: 50,
      weeklyStudyGoal: 25,
    },
    theme: "system",
    language: "English",
    timezone: "America/Los_Angeles",
  });

  const achievements: Achievement[] = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first assignment",
      icon: "🎯",
      unlockedDate: "2024-01-10",
    },
    {
      id: 2,
      title: "Study Streak",
      description: "Study for 7 consecutive days",
      icon: "🔥",
      unlockedDate: "2024-01-12",
    },
    {
      id: 3,
      title: "Goal Crusher",
      description: "Complete 5 goals",
      icon: "💪",
      progress: 3,
      target: 5,
    },
    {
      id: 4,
      title: "Time Master",
      description: "Study for 100 hours total",
      icon: "⏰",
      progress: 67,
      target: 100,
    },
    {
      id: 5,
      title: "Perfect Week",
      description: "Complete all assignments in a week",
      icon: "⭐",
      unlockedDate: "2024-01-08",
    },
    {
      id: 6,
      title: "Note Taker",
      description: "Create 50 notes",
      icon: "📝",
      progress: 23,
      target: 50,
    },
  ];

  const studySessions: StudySession[] = [
    {
      id: 1,
      subject: "Mathematics",
      duration: 120,
      date: "2024-01-14",
      type: "focused",
    },
    {
      id: 2,
      subject: "Physics",
      duration: 90,
      date: "2024-01-14",
      type: "assignment",
    },
    {
      id: 3,
      subject: "History",
      duration: 60,
      date: "2024-01-13",
      type: "review",
    },
    {
      id: 4,
      subject: "Mathematics",
      duration: 150,
      date: "2024-01-13",
      type: "focused",
    },
    {
      id: 5,
      subject: "Chemistry",
      duration: 75,
      date: "2024-01-12",
      type: "assignment",
    },
    {
      id: 6,
      subject: "English",
      duration: 45,
      date: "2024-01-12",
      type: "review",
    },
    {
      id: 7,
      subject: "Physics",
      duration: 105,
      date: "2024-01-11",
      type: "focused",
    },
  ];

  const productivityMetrics: ProductivityMetrics = {
    weeklyStudyHours: [8, 12, 15, 18, 22, 19, 25], // Last 7 days
    completionRate: 78,
    averageTaskTime: 2.5,
    streakDays: 12,
    subjectDistribution: [
      { subject: "Mathematics", hours: 15.5, color: "bg-blue-500" },
      { subject: "Physics", hours: 12.2, color: "bg-green-500" },
      { subject: "History", hours: 8.7, color: "bg-orange-500" },
      { subject: "Chemistry", hours: 6.3, color: "bg-purple-500" },
      { subject: "English", hours: 4.1, color: "bg-pink-500" },
    ],
    weeklyGoals: [
      { week: "Week 1", completed: 4, total: 5 },
      { week: "Week 2", completed: 6, total: 7 },
      { week: "Week 3", completed: 5, total: 6 },
      { week: "Current", completed: 3, total: 5 },
    ],
  };

  // Added notes data
  const notes: Note[] = [
    {
      id: 1,
      title: "Calculus Study Notes",
      content:
        "Key concepts for upcoming exam:\n- Derivatives and integrals\n- Chain rule applications\n- Optimization problems",
      category: "study",
      subject: "Mathematics",
      linkedTo: { type: "assignment", id: 1, title: "Calculus Problem Set 5" },
      tags: ["exam", "derivatives", "integrals"],
      isPinned: true,
      createdDate: "2024-01-10",
      updatedDate: "2024-01-14",
    },
    {
      id: 2,
      title: "History Essay Outline",
      content:
        "WWII Essay Structure:\n1. Introduction - thesis statement\n2. Causes of war\n3. Major events\n4. Consequences\n5. Conclusion",
      category: "assignment",
      subject: "History",
      linkedTo: { type: "assignment", id: 2, title: "World War II Essay" },
      tags: ["essay", "outline", "wwii"],
      isPinned: false,
      createdDate: "2024-01-12",
      updatedDate: "2024-01-12",
    },
    {
      id: 3,
      title: "Physics Lab Observations",
      content:
        "Pendulum experiment results:\n- Period increases with length\n- Mass doesn't affect period\n- Small angle approximation valid",
      category: "class",
      subject: "Physics",
      linkedTo: {
        type: "assignment",
        id: 3,
        title: "Lab Report - Pendulum Experiment",
      },
      tags: ["lab", "pendulum", "observations"],
      isPinned: false,
      createdDate: "2024-01-11",
      updatedDate: "2024-01-13",
    },
    {
      id: 4,
      title: "Study Schedule Ideas",
      content:
        "Weekly study plan:\n- Monday: Math (2h)\n- Tuesday: Physics (1.5h)\n- Wednesday: History (2h)\n- Thursday: Review (1h)\n- Friday: Catch up",
      category: "personal",
      tags: ["schedule", "planning", "study"],
      isPinned: true,
      createdDate: "2024-01-08",
      updatedDate: "2024-01-10",
    },
    {
      id: 5,
      title: "Chemistry Formulas",
      content:
        "Important formulas:\n- PV = nRT (ideal gas law)\n- pH = -log[H+]\n- ΔG = ΔH - TΔS",
      category: "study",
      subject: "Chemistry",
      tags: ["formulas", "chemistry", "reference"],
      isPinned: false,
      createdDate: "2024-01-09",
      updatedDate: "2024-01-09",
    },
  ];

  const assignments: Assignment[] = [
    {
      id: 1,
      title: "Calculus Problem Set 5",
      subject: "Mathematics",
      description: "Complete problems 1-20 from chapter 8",
      dueDate: "2024-01-15",
      priority: "high",
      status: "in-progress",
      estimatedHours: 3,
      completedHours: 1,
    },
    {
      id: 2,
      title: "World War II Essay",
      subject: "History",
      description: "5-page essay on the causes of WWII",
      dueDate: "2024-01-16",
      priority: "medium",
      status: "not-started",
      estimatedHours: 4,
      completedHours: 0,
    },
    {
      id: 3,
      title: "Lab Report - Pendulum Experiment",
      subject: "Physics",
      description: "Analyze pendulum motion data and write conclusions",
      dueDate: "2024-01-18",
      priority: "low",
      status: "not-started",
      estimatedHours: 2,
      completedHours: 0,
    },
    {
      id: 4,
      title: "Chemistry Homework Ch. 12",
      subject: "Chemistry",
      dueDate: "2024-01-12",
      priority: "high",
      status: "completed",
      estimatedHours: 2,
      completedHours: 2,
    },
    {
      id: 5,
      title: "English Literature Analysis",
      subject: "English",
      description: "Character analysis of Hamlet",
      dueDate: "2024-01-20",
      priority: "medium",
      status: "not-started",
      estimatedHours: 3,
      completedHours: 0,
    },
  ];

  const scheduleEvents: ScheduleEvent[] = [
    {
      id: 1,
      title: "Mathematics",
      time: "9:00 AM",
      endTime: "10:30 AM",
      room: "Room 101",
      type: "class",
      date: "2024-01-15",
      recurring: true,
    },
    {
      id: 2,
      title: "Physics Lab",
      time: "11:00 AM",
      endTime: "1:00 PM",
      room: "Lab 2",
      type: "class",
      date: "2024-01-15",
      recurring: true,
    },
    {
      id: 3,
      title: "History",
      time: "2:00 PM",
      endTime: "3:30 PM",
      room: "Room 205",
      type: "class",
      date: "2024-01-15",
      recurring: true,
    },
    {
      id: 4,
      title: "Math Assignment Due",
      time: "11:59 PM",
      type: "assignment",
      date: "2024-01-15",
    },
    {
      id: 5,
      title: "Chemistry",
      time: "10:00 AM",
      endTime: "11:30 AM",
      room: "Lab 1",
      type: "class",
      date: "2024-01-16",
      recurring: true,
    },
    {
      id: 6,
      title: "English Literature",
      time: "1:00 PM",
      endTime: "2:30 PM",
      room: "Room 301",
      type: "class",
      date: "2024-01-16",
      recurring: true,
    },
    {
      id: 7,
      title: "Physics Exam",
      time: "9:00 AM",
      endTime: "11:00 AM",
      room: "Hall A",
      type: "exam",
      date: "2024-01-18",
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: "Math Assignment",
      due: "Today",
      priority: "high",
      subject: "Mathematics",
    },
    {
      id: 2,
      title: "History Essay",
      due: "Tomorrow",
      priority: "medium",
      subject: "History",
    },
    {
      id: 3,
      title: "Science Lab Report",
      due: "Friday",
      priority: "low",
      subject: "Physics",
    },
  ];

  const todaySchedule = [
    { time: "9:00 AM", subject: "Mathematics", room: "Room 101" },
    { time: "11:00 AM", subject: "Physics", room: "Lab 2" },
    { time: "2:00 PM", subject: "History", room: "Room 205" },
  ];

  const goals: Goal[] = [
    {
      id: 1,
      title: "Complete 5 assignments this week",
      description:
        "Stay on top of coursework by completing all weekly assignments",
      type: "academic",
      status: "active",
      current: 3,
      target: 5,
      unit: "assignments",
      deadline: "2024-01-19",
      createdDate: "2024-01-13",
      milestones: [
        { value: 1, label: "First assignment", completed: true },
        { value: 3, label: "Halfway point", completed: true },
        { value: 5, label: "All assignments", completed: false },
      ],
    },
    {
      id: 2,
      title: "Study 20 hours this month",
      description: "Maintain consistent study habits throughout the month",
      type: "academic",
      status: "active",
      current: 15,
      target: 20,
      unit: "hours",
      deadline: "2024-01-31",
      createdDate: "2024-01-01",
      streak: 12,
      milestones: [
        { value: 5, label: "First week", completed: true },
        { value: 10, label: "Two weeks", completed: true },
        { value: 15, label: "Three weeks", completed: true },
        { value: 20, label: "Full month", completed: false },
      ],
    },
    {
      id: 3,
      title: "Maintain 85% attendance",
      description: "Attend at least 85% of all scheduled classes",
      type: "academic",
      status: "active",
      current: 18,
      target: 20,
      unit: "classes",
      deadline: "2024-02-15",
      createdDate: "2024-01-01",
      streak: 5,
    },
    {
      id: 4,
      title: "Read 2 books this month",
      description: "Expand knowledge through regular reading",
      type: "personal",
      status: "active",
      current: 1,
      target: 2,
      unit: "books",
      deadline: "2024-01-31",
      createdDate: "2024-01-01",
    },
    {
      id: 5,
      title: "Exercise 3 times per week",
      description: "Maintain physical fitness with regular exercise",
      type: "habit",
      status: "active",
      current: 8,
      target: 12,
      unit: "sessions",
      deadline: "2024-01-31",
      createdDate: "2024-01-01",
      streak: 3,
    },
    {
      id: 6,
      title: "Learn Spanish basics",
      description: "Complete beginner Spanish course",
      type: "personal",
      status: "completed",
      current: 30,
      target: 30,
      unit: "lessons",
      deadline: "2024-01-10",
      createdDate: "2023-12-01",
      completedDate: "2024-01-08",
    },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return scheduleEvents.filter((event) => event.date === dateString);
  };

  const handleAddEvent = () => {
    // In a real app, this would save to a database
    console.log("Adding event:", newEvent);
    setIsAddEventOpen(false);
    setNewEvent({
      title: "",
      time: "",
      endTime: "",
      room: "",
      type: "class",
      date: "",
      recurring: false,
    });
  };

  const handleAddAssignment = () => {
    // In a real app, this would save to a database
    console.log("Adding assignment:", newAssignment);
    setIsAddAssignmentOpen(false);
    setNewAssignment({
      title: "",
      subject: "",
      description: "",
      dueDate: "",
      priority: "medium",
      estimatedHours: "",
    });
  };

  const handleAddGoal = () => {
    // In a real app, this would save to a database
    console.log("Adding goal:", newGoal);
    setIsAddGoalOpen(false);
    setNewGoal({
      title: "",
      description: "",
      type: "academic",
      target: "",
      unit: "",
      deadline: "",
    });
  };

  // Added note handling functions
  const handleAddNote = () => {
    // In a real app, this would save to a database
    console.log("Adding note:", newNote);
    setIsAddNoteOpen(false);
    setNewNote({
      title: "",
      content: "",
      category: "general",
      subject: "",
      tags: "",
      linkedTo: null,
    });
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditNoteOpen(true);
  };

  const handleUpdateNote = () => {
    // In a real app, this would update the database
    console.log("Updating note:", editingNote);
    setIsEditNoteOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: number) => {
    // In a real app, this would delete from database
    console.log("Deleting note:", noteId);
  };

  const toggleNotePinned = (noteId: number) => {
    // In a real app, this would update the database
    console.log("Toggling pin for note:", noteId);
  };

  const updateGoalProgress = (goalId: number, increment: number) => {
    // In a real app, this would update the database
    console.log("Updating goal progress:", goalId, increment);
  };

  const toggleAssignmentStatus = (assignmentId: number) => {
    // In a real app, this would update the database
    console.log("Toggling assignment status:", assignmentId);
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (calendarView === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(
        currentDate.getMonth() + (direction === "next" ? 1 : -1)
      );
    }
    setCurrentDate(newDate);
  };

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGoalTypeIcon = (type: GoalType) => {
    switch (type) {
      case "academic":
        return <BookOpen className="h-4 w-4" />;
      case "personal":
        return <User className="h-4 w-4" />;
      case "habit":
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  // Added note filtering and category functions
  const getCategoryIcon = (category: NoteCategory) => {
    switch (category) {
      case "class":
        return <BookOpen className="h-4 w-4" />;
      case "assignment":
        return <CheckSquare className="h-4 w-4" />;
      case "study":
        return <Target className="h-4 w-4" />;
      case "personal":
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(notesSearchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(notesSearchQuery.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(notesSearchQuery.toLowerCase())
        );
      const matchesCategory =
        notesCategoryFilter === "all" || note.category === notesCategoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by pinned first, then by updated date
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (
        new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
      );
    });

  const filteredGoals = goals.filter((goal) => {
    const matchesType = goalFilter === "all" || goal.type === goalFilter;
    const matchesStatus =
      goalStatusFilter === "all" || goal.status === goalStatusFilter;
    return matchesType && matchesStatus;
  });

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || assignment.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || assignment.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getTotalStudyHours = () => {
    return studySessions.reduce(
      (total, session) => total + session.duration / 60,
      0
    );
  };

  const getAverageStudyTime = () => {
    const totalHours = getTotalStudyHours();
    const days = 7; // Last 7 days
    return totalHours / days;
  };

  const getSubjectPerformance = () => {
    const subjectHours = studySessions.reduce((acc, session) => {
      acc[session.subject] =
        (acc[session.subject] || 0) + session.duration / 60;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(subjectHours)
      .map(([subject, hours]) => ({ subject, hours }))
      .sort((a, b) => b.hours - a.hours);
  };

  const getProductivityTrend = () => {
    // Calculate if productivity is increasing, decreasing, or stable
    const recentHours = productivityMetrics.weeklyStudyHours.slice(-3);
    const earlierHours = productivityMetrics.weeklyStudyHours.slice(-6, -3);
    const recentAvg =
      recentHours.reduce((a, b) => a + b, 0) / recentHours.length;
    const earlierAvg =
      earlierHours.reduce((a, b) => a + b, 0) / earlierHours.length;

    if (recentAvg > earlierAvg * 1.1) return "increasing";
    if (recentAvg < earlierAvg * 0.9) return "decreasing";
    return "stable";
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 bg-transparent"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {userProfile.name}
              </h1>
              <p className="text-muted-foreground mb-1">
                {userProfile.major} • {userProfile.year}
              </p>
              <p className="text-sm text-muted-foreground">
                {userProfile.university}
              </p>
              {userProfile.gpa && (
                <Badge variant="secondary" className="mt-2">
                  GPA: {userProfile.gpa}
                </Badge>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {assignments.filter((a) => a.status === "completed").length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completed Tasks
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {goals.filter((g) => g.status === "completed").length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Goals Achieved
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-primary" />
                    Achievements
                  </CardTitle>
                  <Button size="sm" onClick={() => setIsAchievementsOpen(true)}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {achievements
                    .filter((a) => a.unlockedDate)
                    .slice(0, 4)
                    .map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex-shrink-0 text-center"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                          <span className="text-lg">{achievement.icon}</span>
                        </div>
                        <p className="text-xs text-muted-foreground max-w-16 truncate">
                          {achievement.title}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Analytics & Insights
                  </CardTitle>
                  <Button size="sm" onClick={() => setIsAnalyticsOpen(true)}>
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(getTotalStudyHours())}h
                    </div>
                    <div className="text-xs text-muted-foreground">
                      This Week
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {productivityMetrics.streakDays}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Day Streak
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Task Completion Rate</span>
                    <span className="font-medium">
                      {productivityMetrics.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${productivityMetrics.completionRate}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Quick Notes
                  </CardTitle>
                  <Button size="sm" onClick={() => setIsNotesOpen(true)}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {notes
                  .filter((n) => n.isPinned)
                  .slice(0, 2)
                  .map((note) => (
                    <div key={note.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">
                          {note.title}
                        </h4>
                        <Pin className="h-3 w-3 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {note.category}
                        </Badge>
                        {note.subject && (
                          <Badge variant="secondary" className="text-xs">
                            {note.subject}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                {notes.filter((n) => n.isPinned).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pinned notes
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Settings & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setIsPreferencesOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            <Dialog
              open={isEditProfileOpen}
              onOpenChange={setIsEditProfileOpen}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your personal and academic information.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="profile-name">Full Name</Label>
                      <Input
                        id="profile-name"
                        value={userProfile.name}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            name: e.target.value,
                          })
                        }
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile-year">Academic Year</Label>
                      <Select
                        value={userProfile.year}
                        onValueChange={(value) =>
                          setUserProfile({ ...userProfile, year: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Freshman">Freshman</SelectItem>
                          <SelectItem value="Sophomore">Sophomore</SelectItem>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Graduate">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          email: e.target.value,
                        })
                      }
                      placeholder="your.email@university.edu"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="profile-major">Major</Label>
                      <Input
                        id="profile-major"
                        value={userProfile.major}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            major: e.target.value,
                          })
                        }
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile-gpa">GPA (Optional)</Label>
                      <Input
                        id="profile-gpa"
                        type="number"
                        step="0.1"
                        min="0"
                        max="4"
                        value={userProfile.gpa || ""}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            gpa: Number.parseFloat(e.target.value) || undefined,
                          })
                        }
                        placeholder="3.7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="profile-university">University</Label>
                    <Input
                      id="profile-university"
                      value={userProfile.university}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          university: e.target.value,
                        })
                      }
                      placeholder="Tech University"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-bio">Bio (Optional)</Label>
                    <Textarea
                      id="profile-bio"
                      value={userProfile.bio || ""}
                      onChange={(e) =>
                        setUserProfile({ ...userProfile, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => setIsEditProfileOpen(false)}
                    className="w-full"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isPreferencesOpen}
              onOpenChange={setIsPreferencesOpen}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Preferences</DialogTitle>
                  <DialogDescription>
                    Customize your study settings and notifications.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notif-assignments">
                          Assignment Reminders
                        </Label>
                        <Switch
                          id="notif-assignments"
                          checked={userPreferences.notifications.assignments}
                          onCheckedChange={(checked) =>
                            setUserPreferences({
                              ...userPreferences,
                              notifications: {
                                ...userPreferences.notifications,
                                assignments: checked,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notif-goals">Goal Updates</Label>
                        <Switch
                          id="notif-goals"
                          checked={userPreferences.notifications.goals}
                          onCheckedChange={(checked) =>
                            setUserPreferences({
                              ...userPreferences,
                              notifications: {
                                ...userPreferences.notifications,
                                goals: checked,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notif-schedule">Schedule Changes</Label>
                        <Switch
                          id="notif-schedule"
                          checked={userPreferences.notifications.schedule}
                          onCheckedChange={(checked) =>
                            setUserPreferences({
                              ...userPreferences,
                              notifications: {
                                ...userPreferences.notifications,
                                schedule: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Study Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="study-time">Preferred Study Time</Label>
                        <Select
                          value={
                            userPreferences.studySettings.preferredStudyTime
                          }
                          onValueChange={(value) =>
                            setUserPreferences({
                              ...userPreferences,
                              studySettings: {
                                ...userPreferences.studySettings,
                                preferredStudyTime: value,
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">
                              Morning (6AM - 12PM)
                            </SelectItem>
                            <SelectItem value="afternoon">
                              Afternoon (12PM - 6PM)
                            </SelectItem>
                            <SelectItem value="evening">
                              Evening (6PM - 10PM)
                            </SelectItem>
                            <SelectItem value="night">
                              Night (10PM - 2AM)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="focus-session">
                            Focus Session (min)
                          </Label>
                          <Input
                            id="focus-session"
                            type="number"
                            value={
                              userPreferences.studySettings.focusSessionLength
                            }
                            onChange={(e) =>
                              setUserPreferences({
                                ...userPreferences,
                                studySettings: {
                                  ...userPreferences.studySettings,
                                  focusSessionLength:
                                    Number.parseInt(e.target.value) || 50,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="break-interval">
                            Break Length (min)
                          </Label>
                          <Input
                            id="break-interval"
                            type="number"
                            value={userPreferences.studySettings.breakInterval}
                            onChange={(e) =>
                              setUserPreferences({
                                ...userPreferences,
                                studySettings: {
                                  ...userPreferences.studySettings,
                                  breakInterval:
                                    Number.parseInt(e.target.value) || 25,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="weekly-goal">
                          Weekly Study Goal (hours)
                        </Label>
                        <Input
                          id="weekly-goal"
                          type="number"
                          value={userPreferences.studySettings.weeklyStudyGoal}
                          onChange={(e) =>
                            setUserPreferences({
                              ...userPreferences,
                              studySettings: {
                                ...userPreferences.studySettings,
                                weeklyStudyGoal:
                                  Number.parseInt(e.target.value) || 25,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => setIsPreferencesOpen(false)}
                    className="w-full"
                  >
                    Save Preferences
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isAchievementsOpen}
              onOpenChange={setIsAchievementsOpen}
            >
              <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Achievements
                  </DialogTitle>
                  <DialogDescription>
                    Track your progress and unlock new achievements
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {achievements.map((achievement) => (
                      <Card
                        key={achievement.id}
                        className={`${
                          achievement.unlockedDate
                            ? "border-green-200 bg-green-50/50"
                            : "border-muted"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                achievement.unlockedDate
                                  ? "bg-green-100"
                                  : "bg-muted"
                              }`}
                            >
                              <span className="text-xl">
                                {achievement.icon}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground">
                                {achievement.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {achievement.description}
                              </p>
                              {achievement.progress !== undefined &&
                                achievement.target && (
                                  <div className="mt-2">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                      <span>Progress</span>
                                      <span>
                                        {achievement.progress}/
                                        {achievement.target}
                                      </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${
                                            (achievement.progress /
                                              achievement.target) *
                                            100
                                          }%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                              {achievement.unlockedDate && (
                                <Badge
                                  variant="secondary"
                                  className="mt-2 text-xs"
                                >
                                  Unlocked{" "}
                                  {new Date(
                                    achievement.unlockedDate
                                  ).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="text-center py-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Welcome to Student Productivity App
              </h1>
              <p className="text-muted-foreground">
                Manage your tasks, goals, and schedule efficiently.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("tasks")}
                    className="w-full"
                  >
                    View Tasks
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-green-600" />
                    Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("goals")}
                    className="w-full"
                  >
                    View Goals
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("calendar")}
                    className="w-full"
                  >
                    View Calendar
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsAnalyticsOpen(true)}
                    className="w-full"
                  >
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">This Week's Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">
                      {Math.round(getTotalStudyHours())}h
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Study Time
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {
                        assignments.filter((a) => a.status === "completed")
                          .length
                      }
                      /{assignments.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tasks Done
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">
                      {goals.filter((g) => g.status === "active").length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Active Goals
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return renderTabContent();
}
