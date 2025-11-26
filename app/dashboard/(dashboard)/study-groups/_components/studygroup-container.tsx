"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Users, ArrowLeft, Search, Filter, Globe, Lock } from "lucide-react";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import LoadingComponent from "@/components/loader";
import NewStudyGroup from "./new-study-group";
import { Course } from "../../courses/_components/courses-container";
import StudyGroupCard from "./study-group-card";
import { StudyGroupWithCourse } from "@/types/study-groups";
import { PendingInvites } from "./group-invites";

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

export default function StudyGroupsPageContainer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("my-groups");

  const user = useQuery(api.users.currentUser);
  const userId = user?._id;

  const getStudyGroups = useQuery(api.studyGroups.getUserStudyGroups, {
    userId: userId as Id<"users">,
  });

  const publicGroups = useQuery(api.studyGroups.getPublicStudyGroups, {});

  const filteredGroups =
    (getStudyGroups &&
      getStudyGroups.length > 0 &&
      getStudyGroups.filter((group) => {
        const matchesSearch =
          (group.name?.toLowerCase() ?? "").includes(
            searchTerm?.toLowerCase() ?? ""
          ) ||
          (group.course?.name?.toLowerCase() ?? "").includes(
            searchTerm?.toLowerCase() ?? ""
          );

        const matchesFilter =
          filterType === "all" ||
          filterType === group.meetingType?.toLowerCase();

        return matchesSearch && matchesFilter;
      })) ||
    [];

  const filteredPublicGroups =
    (publicGroups &&
      publicGroups.length > 0 &&
      publicGroups.filter((group) => {
        const matchesSearch =
          (group.name?.toLowerCase() ?? "").includes(
            searchTerm?.toLowerCase() ?? ""
          ) ||
          (group.course?.name?.toLowerCase() ?? "").includes(
            searchTerm?.toLowerCase() ?? ""
          );

        const matchesFilter =
          filterType === "all" ||
          filterType === group.meetingType?.toLowerCase();

        // Don't show groups user is already in
        const isAlreadyMember = getStudyGroups?.some(
          (myGroup) => myGroup._id === group._id
        );

        return matchesSearch && matchesFilter && !isAlreadyMember;
      })) ||
    [];

  if (!user || getStudyGroups === undefined) {
    return <LoadingComponent />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 w-full py-4">
          <div className="flex items-start gap-4 flex-col">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                Study Groups
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Pending Invites */}
        {userId && <PendingInvites userId={userId} />}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
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
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>

          <NewStudyGroup />
        </div>

        {/* Tabs for My Groups vs Discover Groups */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-groups" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              My Groups
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Discover
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups
                .filter((group) => group._id) // Filter out groups without _id
                .map((group) => (
                  <StudyGroupCard group={group as StudyGroupWithCourse} key={group._id} />
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
                <NewStudyGroup />
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Public Study Groups</h3>
              <p className="text-sm text-muted-foreground">
                Discover and join public study groups from across your courses
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublicGroups.map((group) => (
                <StudyGroupCard group={group} key={group._id} isDiscovery />
              ))}
            </div>

            {filteredPublicGroups.length === 0 && (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No public groups available
                </h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to create a public study group!
                </p>
                <NewStudyGroup />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
