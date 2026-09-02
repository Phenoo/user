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
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUsageTracking } from "@/hooks/use-usage-tracking";
import { UsageIndicator } from "./usage-tracking/usage-indicator";

export function GoogleCalendarIntegration() {
  const user = useQuery(api.users.currentUser);
  const addEventMutation = useMutation(api.events.add);
  const sanitizeStoredTokensMutation = useMutation(api.integrations.sanitizeStoredTokens);
  const [isValidating, setIsValidating] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [cookieState, setCookieState] = useState<{
    hasClassroom?: boolean;
    hasDrive?: boolean;
    hasCalendar?: boolean;
  }>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncingClassroom, setIsSyncingClassroom] = useState(false);
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
        // 1. Check token status from cookies
        const cookieRes = await fetch("/api/google-meet/validate");
        const cookieData = await cookieRes.json();

        if (isMounted && cookieRes.ok && cookieData.connected) {
          const hasCl = Boolean(cookieData.hasClassroom);
          const hasDr = Boolean(cookieData.hasDrive);
          const hasCal = Boolean(cookieData.hasCalendar);

          setIsConnected(hasCal);
          setCookieState({
            hasClassroom: hasCl,
            hasDrive: hasDr,
            hasCalendar: hasCal,
          });

        } else if (isMounted) {
          setIsConnected(false);
          setCookieState({
            hasClassroom: false,
            hasDrive: false,
            hasCalendar: false,
          });

        }
      } catch (err) {
        console.warn("Backend validation fallback:", err);
      } finally {
        if (isMounted) setIsValidating(false);
      }
    }

    validateBackendConnection();

    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;
    sanitizeStoredTokensMutation({}).catch((error) => {
      console.warn("Could not remove legacy stored Google tokens:", error);
    });
  }, [user?._id, sanitizeStoredTokensMutation]);

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

  const integrationsList = useQuery(
    api.integrations.listAvailable,
    user?._id ? { userId: user._id } : "skip"
  );

  const classroomIntegration = integrationsList?.find(
    (integration) => integration.provider === "google-classroom"
  );
  const isClassroomConnected = Boolean(cookieState.hasClassroom);
  const isDriveConnected = Boolean(cookieState.hasDrive);
  const isCalendarConnected = isConnected && Boolean(cookieState.hasCalendar);

  const handleConnectIntegration = (integration: "classroom" | "drive" | "calendar") => {
    window.location.href = `/api/integrations/google/connect?integration=${integration}`;
  };

  const handleSyncClassroom = async () => {
    setIsSyncingClassroom(true);
    try {
      const response = await fetch("/api/integrations/google/classroom/sync", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 403 ||
          data.code === "INSUFFICIENT_SCOPE" ||
          data.code === "REVOKED"
        ) {
          toast.error("Google Classroom needs to be reconnected.");
          handleConnectIntegration("classroom");
          return;
        }
        throw new Error(data.error || "Failed to sync Google Classroom");
      }

      toast.success(data.message || "Google Classroom sync complete");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sync Google Classroom"
      );
    } finally {
      setIsSyncingClassroom(false);
    }
  };

  const integrations = [
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Auto-sync study sessions, exam blocks & deadlines",
      connected: Boolean(isCalendarConnected),
      statusLabel: isCalendarConnected ? "Connected" : "Setup Required",
      onConnect: () => handleConnectIntegration("calendar"),
      logo: (
        <Image
          src="/google-calendar.png"
          width={30}
          height={30}
          alt="Google Calendar Logo"
          className="rounded-md shrink-0 shadow-2xs"
        />
      ),
    },
    {
      id: "google-meet",
      name: "Google Meet",
      description: "1-Click study group video calls & meeting links",
      connected: Boolean(isCalendarConnected),
      statusLabel: isCalendarConnected ? "Connected" : "Not Connected",
      onConnect: () => handleConnectIntegration("calendar"),
      logo: (
        <Image
          src="/Google_Meet_icon_(2026).svg"
          width={30}
          height={30}
          alt="Google Meet Logo"
          className="rounded-md shrink-0 shadow-2xs object-contain"
        />
      ),
    },
    {
      id: "google-classroom",
      name: "Google Classroom",
      description: classroomIntegration?.lastSyncAt
        ? `Courses, coursework & materials · Last synced ${new Date(classroomIntegration.lastSyncAt).toLocaleString()}`
        : "Import coursework, class resources & deadlines",
      connected: Boolean(isClassroomConnected),
      statusLabel: isClassroomConnected ? "Connected" : "Not Connected",
      onConnect: () => handleConnectIntegration("classroom"),
      logo: (
        <Image
          src="/google-classroom.png"
          width={30}
          height={30}
          alt="Google Classroom Logo"
          className="rounded-md shrink-0 shadow-2xs"
        />
      ),
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Import syllabus documents, lecture notes & study decks",
      connected: Boolean(isDriveConnected),
      statusLabel: isDriveConnected ? "Connected" : "Not Connected",
      onConnect: () => handleConnectIntegration("drive"),
      logo: (
        <Image
          src="/google-drive.png"
          width={30}
          height={30}
          alt="Google Drive Logo"
          className="rounded-md shrink-0 shadow-2xs"
        />
      ),
    },
    {
      id: "zoom",
      name: "Zoom Meetings",
      description: "Launch & join live video study rooms with study groups",
      connected: true,
      statusLabel: "Active",
      logo: (
        <svg viewBox="0 0 48 48" className="w-5 h-5 shrink-0" fill="none">
          <rect width="48" height="48" rx="10" fill="#0B5CFF" />
          <path d="M12 18a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V18zm18 3.5l6-4.5v14l-6-4.5v-5z" fill="#FFFFFF" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Connection Status & Integrations Card */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <Image
                  src="/google-calendar.png"
                  width={38}
                  height={38}
                  alt="Google Calendar Logo"
                  className="rounded-lg shadow-2xs"
                />
              </div>
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  Google Calendar & Integrations
                </CardTitle>
                <CardDescription className="text-xs">
                  Academic services, scheduling & study tools
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isValidating ? (
                <Badge variant="outline" className="text-xs flex items-center gap-1.5 py-1 px-2.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Validating...
                </Badge>
              ) : isCalendarConnected ? (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 flex items-center gap-1.5 font-medium py-1 px-2.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-amber-600 dark:text-amber-400 border-amber-500/30 py-1 px-2.5">
                  Setup Required
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between border-t border-border/60 pt-3">
            <span className="flex items-center gap-1.5">
              Connected Tools & Services
            </span>
            <span className="text-[11px] font-normal text-muted-foreground">
              {integrations.filter((i) => i.connected).length} of {integrations.length} Active
            </span>
          </div>

          <div className="divide-y divide-border/50 rounded-xl border border-border/70 overflow-hidden bg-card/40">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="px-3.5 py-2.5 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className=" bg-muted/60 shrink-0 flex items-center justify-center">
                    {item.logo}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {item.connected && item.id === "google-classroom" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSyncClassroom}
                      disabled={isSyncingClassroom}
                      className="h-7 px-3 text-[11px] gap-1.5"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${isSyncingClassroom ? "animate-spin" : ""}`}
                      />
                      {isSyncingClassroom ? "Syncing" : "Sync now"}
                    </Button>
                  ) : item.connected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item.statusLabel}
                    </span>
                  ) : item.onConnect ? (
                    <Button
                      size="sm"
                      onClick={item.onConnect}
                      className="h-7 px-3.5 text-[11px] font-semibold rounded-lg bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90 border-transparent transition-all cursor-pointer shadow-xs"
                    >
                      Connect
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                      {item.statusLabel}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
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


    </div>
  );
}

// Alias export for backward compatibility
export const GoogleMeetIntegration = GoogleCalendarIntegration;
