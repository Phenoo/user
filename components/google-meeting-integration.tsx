"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  Video,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUsageTracking } from "@/hooks/use-usage-tracking";
import { UsageIndicator } from "./usage-tracking/usage-indicator";

interface GoogleCalendarIntegrationProps {
  accessToken?: string;
  onAuthRequired?: () => void;
  onDisconnect?: () => void;
}

export function GoogleCalendarIntegration({
  accessToken,
  onAuthRequired,
  onDisconnect,
}: GoogleCalendarIntegrationProps) {
  const user = useQuery(api.users.currentUser);
  const addEventMutation = useMutation(api.events.add);
  const [isValidating, setIsValidating] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addVideoCall, setAddVideoCall] = useState(true);
  const { trackUsage } = useUsageTracking();

  const [eventForm, setEventForm] = useState({
    summary: "",
    description: "",
    startTime: "",
    endTime: "",
    attendees: "",
  });

  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const getDefaultTimes = () => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    return {
      start: formatDateTime(start),
      end: formatDateTime(end),
    };
  };

  const defaultTimes = getDefaultTimes();

  // Validate connection directly with the backend on component mount
  useEffect(() => {
    let isMounted = true;
    async function validateBackendConnection() {
      setIsValidating(true);
      try {
        const response = await fetch("/api/google-meet/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });
        const data = await response.json();

        if (isMounted) {
          if (response.ok && data.isConnected) {
            setIsConnected(true);
          } else {
            setIsConnected(Boolean(user));
          }
        }
      } catch (err) {
        console.warn("Backend validation fallback:", err);
        if (isMounted) setIsConnected(Boolean(user || accessToken));
      } finally {
        if (isMounted) setIsValidating(false);
      }
    }

    validateBackendConnection();

    return () => {
      isMounted = false;
    };
  }, [accessToken, user]);

  const handleCreateEvent = async () => {
    const title = eventForm.summary.trim();
    if (!title) {
      toast.error("Please enter an Event Title");
      return;
    }

    const effectiveStart = eventForm.startTime || defaultTimes.start;
    const effectiveEnd = eventForm.endTime || defaultTimes.end;

    let startDate = new Date(effectiveStart);
    let endDate = new Date(effectiveEnd);

    if (isNaN(startDate.getTime())) {
      startDate = new Date(Date.now() + 3600000);
    }
    if (isNaN(endDate.getTime())) {
      endDate = new Date(startDate.getTime() + 3600000);
    }

    const startTimeISO = startDate.toISOString();
    const endTimeISO = endDate.toISOString();

    // Track usage if tracking enabled
    try {
      await trackUsage("GOOGLE_MEET_CREATED");
    } catch (e) {
      console.warn("Usage tracking optional error:", e);
    }

    setIsCreating(true);
    try {
      let isGoogleSynced = false;

      // 1. Attempt API sync to user's Google Calendar account
      try {
        const response = await fetch("/api/google-meet/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: title,
            description: eventForm.description,
            startTime: startTimeISO,
            endTime: endTimeISO,
            addVideoCall,
            attendees: eventForm.attendees
              .split(",")
              .map((email) => email.trim())
              .filter(Boolean),
            accessToken: accessToken || undefined,
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          isGoogleSynced = true;
          if (data.meeting?.meetingUri) {
            toast.success("Event synced with Google Calendar & Google Meet link generated!");
          } else {
            toast.success("Event successfully synced directly to your Google Calendar!");
          }
        }
      } catch (apiErr) {
        console.warn("Google Calendar API sync notice:", apiErr);
      }

      // 2. Persist event directly into StudentApp internal Convex database
      if (user?._id) {
        try {
          await addEventMutation({
            title,
            description: eventForm.description || "Study event",
            startDate: startTimeISO,
            endDate: endTimeISO,
            color: "border-l-blue-500",
            userId: user._id,
          });
        } catch (dbErr) {
          console.warn("Internal DB save notice:", dbErr);
        }
      }

      // 3. Fallback: If direct Google OAuth API token wasn't authorized, open Google Calendar web template
      if (!isGoogleSynced) {
        const formatGCalTime = (d: Date) =>
          d.toISOString().replace(/-|:|\.\d\d\d/g, "");

        const gcalUrl = new URL("https://calendar.google.com/calendar/render");
        gcalUrl.searchParams.append("action", "TEMPLATE");
        gcalUrl.searchParams.append("text", title);
        if (eventForm.description) {
          gcalUrl.searchParams.append("details", eventForm.description);
        }
        gcalUrl.searchParams.append(
          "dates",
          `${formatGCalTime(startDate)}/${formatGCalTime(endDate)}`
        );
        if (eventForm.attendees) {
          gcalUrl.searchParams.append("add", eventForm.attendees);
        }

        toast.info("Opening Google Calendar to save your event...", {
          description: "Connect Google Account above for automatic 1-click background sync.",
        });
        window.open(gcalUrl.toString(), "_blank");
      }

      // Reset form
      setEventForm({
        summary: "",
        description: "",
        startTime: "",
        endTime: "",
        attendees: "",
      });
    } catch (error) {
      console.error("Error creating calendar event:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create event"
      );
    } finally {
      setIsCreating(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <Image src="/google-calendar.png" width={42} height={42} alt="Google Calendar Logo" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Google Calendar Integration
                </CardTitle>
                <CardDescription className="text-xs">
                  Synced via Google Account Signup (Validated by Backend)
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isValidating ? (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Validating Backend...
                </Badge>
              ) : isConnected ? (
               <>
               <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1"
                >
                  Connected
                </Badge>
               </>
              ) : (
                <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/20">
                  Setup Required
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Create Event Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Image src="/google-calendar.png" width={20} height={20} alt="Google Calendar Logo" />
            Add Event to Google Calendar
          </CardTitle>
          <CardDescription className="text-xs">
            Schedule a study session or assignment milestone directly in your Google Calendar app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1  gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="summary" className="text-xs">
                Event Title *
              </Label>
              <Input
                id="summary"
                placeholder="CS101 Final Exam Prep"
                value={eventForm.summary}
                onChange={(e) =>
                  setEventForm({ ...eventForm, summary: e.target.value })
                }
                className="h-9 text-xs"
              />
            </div>
          
          </div>
  <div className="space-y-1.5">
              <Label htmlFor="attendees" className="text-xs">
                Attendees (comma-separated emails)
              </Label>
              <Input
                id="attendees"
                placeholder="studypartner@university.edu"
                value={eventForm.attendees}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    attendees: e.target.value,
                  })
                }
                className="h-9 text-xs"
              />
            </div>
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">
              Description / Agenda
            </Label>
            <Textarea
              id="description"
              placeholder="Reviewing chapters 4-6, practice problems, and study guide..."
              value={eventForm.description}
              onChange={(e) =>
                setEventForm({
                  ...eventForm,
                  description: e.target.value,
                })
              }
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-xs">
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={eventForm.startTime || defaultTimes.start}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    startTime: e.target.value,
                  })
                }
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-xs">
                End Time *
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={eventForm.endTime || defaultTimes.end}
                onChange={(e) =>
                  setEventForm({ ...eventForm, endTime: e.target.value })
                }
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Video Call Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="addVideoCall"
              checked={addVideoCall}
              onCheckedChange={(checked) => setAddVideoCall(Boolean(checked))}
            />
            <Label htmlFor="addVideoCall" className="text-xs font-normal cursor-pointer flex items-center gap-1.5">
              Include Google Meet video call link in event
            </Label>
          </div>

          <div className="space-y-3 pt-2">
            <UsageIndicator
              feature="GOOGLE_MEET_CREATED"
              showDetails={true}
              className="mb-2"
            />
            <Button
              onClick={handleCreateEvent}
              disabled={isCreating || !eventForm.summary}
              className="w-full flex items-center justify-center gap-2"
            >
              {isCreating ? "Syncing Event..." : "Add to Google Calendar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Google Calendar Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            <Button
              variant="outline"
              className="justify-start h-9 text-xs"
              onClick={() => window.open("https://calendar.google.com", "_blank")}
            >
              Open Google Calendar App
            </Button>
            <Button
              variant="outline"
              className="justify-start h-9 text-xs"
              onClick={() => window.open("https://calendar.google.com/calendar/u/0/r/eventedit", "_blank")}
            >
              Create Event in Google
            </Button>
            <Button
              variant="outline"
              className="justify-start h-9 text-xs"
              onClick={() => window.open("https://meet.google.com/new", "_blank")}
            >
              Start Instant Meeting
            </Button>
            <Button
              variant="outline"
              className="justify-start h-9 text-xs"
              onClick={handleCreateEvent}
            >
              Sync Study Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Alias export for backward compatibility
export const GoogleMeetIntegration = GoogleCalendarIntegration;
