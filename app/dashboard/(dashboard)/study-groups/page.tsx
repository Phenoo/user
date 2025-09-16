"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Users,
  ArrowLeft,
  Plus,
  Search,
  Clock,
  MapPin,
  MessageCircle,
  Star,
  Filter,
  Calendar,
  Video,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CoursesSelect from "@/components/courses-select";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { BsArrowUpRight } from "react-icons/bs";
import { Course } from "../courses/_components/courses-container";
import NewStudyGroup from "./_components/new-study-group";

export interface StudyGroup {
  _id: string;
  name: string;
  course: Course;
  courseCode: string;
  description: string;
  members: number;
  maxMembers: number;
  nextMeeting: string;
  location: string;
  meetingType: "In-Person" | "Online" | "Hybrid";
  isJoined: boolean;
  rating: number;
  tags: string[];
  organizer: string;
  googleCalendarLink?: string;
  zoomLink?: string;
}

export default function StudyGroupsPage() {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [course, setCourse] = useState("");

  const createGroupService = useMutation(api.studyGroups.createStudyGroup);
  const user = useQuery(api.users.currentUser);
  const userId = user?._id;
  const [newGroup, setNewGroup] = useState({
    name: "",
    course: "",
    courseCode: "",
    description: "",
    maxMembers: "10",
    meetingType: "In-Person",
    location: "",
    googleCalendarLink: "",
    zoomLink: "",
  });

  const getStudyGroups = useQuery(api.studyGroups.getUserStudyGroups, {
    userId: userId as Id<"users">,
  });

  const filteredGroups = studyGroups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "joined" && group.isJoined) ||
      (filterType === "available" && !group.isJoined) ||
      filterType === group.meetingType.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const createGroup = () => {
    try {
      createGroupService({
        name: newGroup.name,
        description: newGroup.description,
        location: newGroup.location,
        maxMembers: Number.parseInt(newGroup.maxMembers),
        meetingSchedule: "",
        //@ts-ignore
        meetingType: newGroup.meetingType,
        googleCalendarLink: newGroup.googleCalendarLink,
        zoomLink: newGroup.zoomLink,
        courseId: course as Id<"courses">,
        organizerId: userId as Id<"users">,
        tags: [],
      });

      toast.success("Study Group successfully created.");
      setIsCreateSheetOpen(false);
      setNewGroup({
        name: "",
        course: "",
        courseCode: "",
        description: "",
        maxMembers: "10",
        meetingType: "In-Person",
        location: "",
        googleCalendarLink: "",
        zoomLink: "",
      });
    } catch {
      toast.error("Study Group creation failed.");
    }
  };

  useEffect(() => {
    if (getStudyGroups) {
      //@ts-ignore
      setStudyGroups(getStudyGroups);
    } else {
      setStudyGroups([]);
    }
  }, [getStudyGroups]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-start gap-4 flex-col">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Study Groups
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search study groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              <SelectItem value="joined">My Groups</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>

          <NewStudyGroup />
        </div>

        {/* Study Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-balance">
                      {group.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">
                      {group.course.code} • {group.course.name}
                    </p>
                  </div>
                  <Link href={`/dashboard/study-groups/${group._id}`}>
                    <div className="bg-foreground text-background bg-opacity-30 rounded-full p-2">
                      <BsArrowUpRight
                        stroke="1"
                        className="h-4 stroke-[1px]  w-4"
                      />
                    </div>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-pretty">
                  {group.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {group.members}/{group.maxMembers} members
                    </span>
                  </div>
                  {group.nextMeeting && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{group.nextMeeting}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{group.location}</span>
                  </div>
                  {group.rating > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{group.rating}/5.0</span>
                    </div>
                  )}
                </div>
                {(group.googleCalendarLink || group.zoomLink) &&
                  group.meetingType !== "In-Person" && (
                    <div className="flex gap-2">
                      {group.googleCalendarLink && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={group.googleCalendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Calendar
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {group.zoomLink && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={group.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Zoom
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{group.meetingType}</Badge>
                  {group.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground">
                  Organized by {group.organizer}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No study groups found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or create a new study group
            </p>
            <Button onClick={() => setIsCreateSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Study Group
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
