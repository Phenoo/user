"use client";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

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
import CoursesSelect from "@/components/courses-select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const NewStudyGroup = ({ title = true }: { title?: boolean }) => {
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

  return (
    <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className={cn("h-4 w-4", title && "mr-2")} />
          {title && "Create Group"}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Study Group</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={newGroup.name}
              onChange={(e) =>
                setNewGroup((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., CS 101 Study Circle"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>

              <CoursesSelect
                course={course}
                onChange={(e) => {
                  setCourse(e);
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newGroup.description}
              onChange={(e) =>
                setNewGroup((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe your study group..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-members">Max Members</Label>
              <Input
                id="max-members"
                type="number"
                value={newGroup.maxMembers}
                onChange={(e) =>
                  setNewGroup((prev) => ({
                    ...prev,
                    maxMembers: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-type">Meeting Type</Label>
              <Select
                value={newGroup.meetingType}
                onValueChange={(value: "In-Person" | "Online" | "Hybrid") =>
                  setNewGroup((prev) => ({ ...prev, meetingType: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-Person">In-Person</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={newGroup.location}
              onChange={(e) =>
                setNewGroup((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              placeholder="Library Room 204 or meeting description"
            />
          </div>
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-sm">Meeting Integrations</h4>
            <div className="space-y-2">
              <Label htmlFor="google-calendar">
                Google Calendar Event Link
              </Label>
              <Input
                id="google-calendar"
                value={newGroup.googleCalendarLink}
                onChange={(e) =>
                  setNewGroup((prev) => ({
                    ...prev,
                    googleCalendarLink: e.target.value,
                  }))
                }
                placeholder="https://calendar.google.com/calendar/event?eid=..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoom-link">Zoom Meeting Link</Label>
              <Input
                id="zoom-link"
                value={newGroup.zoomLink}
                onChange={(e) =>
                  setNewGroup((prev) => ({
                    ...prev,
                    zoomLink: e.target.value,
                  }))
                }
                placeholder="https://zoom.us/j/123456789"
              />
            </div>
          </div>
          <Button onClick={createGroup} className="w-full">
            Create Study Group
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewStudyGroup;
