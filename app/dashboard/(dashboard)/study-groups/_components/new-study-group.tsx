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
import { Switch } from "@/components/ui/switch";
import CoursesSelect from "@/components/courses-select";
import { Plus, Lock, Globe, Video, Calendar, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useParams, usePathname } from "next/navigation";

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
    isPublic: true, // Default to public
    aiModeration: false,
  });

  const generateMeetLink = () => {
    const realMeetUrl = "https://meet.google.com/new";
    setNewGroup((prev) => ({ ...prev, googleCalendarLink: realMeetUrl }));
    window.open(realMeetUrl, "_blank");
    toast.success("Opening Google Meet to create a real meeting room!");
  };

  const generateZoomLink = () => {
    const zoomUrl = "https://zoom.us/start/videomeeting";
    setNewGroup((prev) => ({ ...prev, zoomLink: zoomUrl }));
    window.open(zoomUrl, "_blank");
    toast.success("Opening Zoom to create a meeting room!");
  };

  const createGroup = () => {
    if (!newGroup.name) {
      toast.error("Group name cannot be empty.");
      return;
    }
    if (!course) {
      toast.error("Course need to be added.");
      return;
    }
    if (!newGroup.description) {
      toast.error("Group description is needed.");
      return;
    }

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
        isPublic: newGroup.isPublic,
        aiModeration: newGroup.aiModeration,
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
        isPublic: true,
        aiModeration: false,
      });
    } catch {
      toast.error("Study Group creation failed.");
    }
  };

  return (
    <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
      <SheetTrigger asChild>
        <Button className="h-12">
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

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-sm">Privacy & Moderation</h4>
            
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                {newGroup.isPublic ? (
                  <Globe className="h-4 w-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 text-orange-500" />
                )}
                <div>
                  <Label htmlFor="is-public" className="text-sm font-medium">
                    {newGroup.isPublic ? "Public Group" : "Private Group"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {newGroup.isPublic
                      ? "Anyone can discover and join this group"
                      : "Only invited members can join this group"}
                  </p>
                </div>
              </div>
              <Switch
                id="is-public"
                checked={newGroup.isPublic}
                onCheckedChange={(checked) =>
                  setNewGroup((prev) => ({ ...prev, isPublic: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div>
                <Label htmlFor="ai-moderation" className="text-sm font-medium">
                  AI Moderation
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable AI to moderate group chat and maintain quality
                </p>
              </div>
              <Switch
                id="ai-moderation"
                checked={newGroup.aiModeration}
                onCheckedChange={(checked) =>
                  setNewGroup((prev) => ({ ...prev, aiModeration: checked }))
                }
              />
            </div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="google-calendar" className="text-sm font-medium">
                  Google Meet Link
                </Label>
               
              </div>
              <div className="flex gap-2">
                <Input
                  id="google-calendar"
                  value={newGroup.googleCalendarLink}
                  onChange={(e) =>
                    setNewGroup((prev) => ({
                      ...prev,
                      googleCalendarLink: e.target.value,
                    }))
                  }
                  placeholder="https://meet.google.com/abc-defg-hij"
                />
                <Button
                  type="button"
                  variant="default"
                  // size="sm"
                  onClick={generateMeetLink}
                  className="shrink-0 h-12 gap-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Generate Link
                </Button>
             
              </div>
              <p className="text-[11px] text-muted-foreground">
                Click <strong>Generate Link</strong> to create a real Google Meet room (via <code>meet.google.com/new</code>) or paste your meeting URL.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="zoom-link" className="text-sm font-medium">
                  Zoom Meeting Link
                </Label>
              </div>
              <div className="flex gap-2">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateZoomLink}
                  className="shrink-0 h-12 gap-1.5 text-sm font-medium"
                >
                  Generate Link
                </Button>
              </div>
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
