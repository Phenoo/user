"use client";

import { useState } from "react";
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
import { Calendar, Clock, Users, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useUsageTracking } from "@/hooks/use-usage-tracking";
import { UsageIndicator } from "./usage-tracking/usage-indicator";

interface GoogleMeetIntegrationProps {
  accessToken?: string;
  onAuthRequired: () => void;
  onDisconnect?: () => void;
}

export function GoogleMeetIntegration({
  accessToken,
  onAuthRequired,
  onDisconnect,
}: GoogleMeetIntegrationProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { trackUsage } = useUsageTracking();

  const token = useAuthToken();
  const [meetingForm, setMeetingForm] = useState({
    summary: "",
    description: "",
    startTime: "",
    endTime: "",
    attendees: "",
  });

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
      toast.success("Google account disconnected");
    }
  };

  const handleCreateMeeting = async () => {
    if (!accessToken) {
      onAuthRequired();
      return;
    }

    if (!meetingForm.summary || !meetingForm.startTime || !meetingForm.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Track usage before creating meeting
    const usageTracked = await trackUsage("GOOGLE_MEET_CREATED");
    if (!usageTracked) {
      return; // Usage limit reached or error occurred
    }

    setIsCreating(true);
    try {
      // Convert datetime-local format to ISO string
      const startTimeISO = new Date(meetingForm.startTime).toISOString();
      const endTimeISO = new Date(meetingForm.endTime).toISOString();

      const response = await fetch("/api/google-meet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: meetingForm.summary,
          description: meetingForm.description,
          startTime: startTimeISO,
          endTime: endTimeISO,
          attendees: meetingForm.attendees
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean),
          accessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create meeting");
      }

      toast.success(
        `Google Meet created successfully! Meeting code: ${data.meeting.meetingCode || 'N/A'}`
      );
      
      // Reset form
      setMeetingForm({
        summary: "",
        description: "",
        startTime: "",
        endTime: "",
        attendees: "",
      });

      // Open meeting in new tab
      if (data.meeting.meetingUri) {
        window.open(data.meeting.meetingUri, "_blank");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create meeting"
      );
    } finally {
      setIsCreating(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <span className="text-lg">🎥</span>
              </div>
              <div>
                <CardTitle className="text-base">
                  Google Meet Integration
                </CardTitle>
                <CardDescription>
                  Create and manage Google Meet meetings
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={
                  accessToken
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                }
              >
                {accessToken ? "Connected" : "Setup Required"}
              </Badge>
              {accessToken && onDisconnect && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="h-7 text-xs"
                >
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {!accessToken && (
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Google account to create and manage Google Meet
              meetings directly from this dashboard.
            </p>
            <Button onClick={onAuthRequired} className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect Google Account
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Create Meeting Form */}
      {accessToken && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Google Meet
            </CardTitle>
            <CardDescription>
              Schedule a new Google Meet meeting with calendar integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="summary">Meeting Title</Label>
                <Input
                  id="summary"
                  placeholder="Team Standup"
                  value={meetingForm.summary}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, summary: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendees">
                  Attendees (comma-separated emails)
                </Label>
                <Input
                  id="attendees"
                  placeholder="john@example.com, jane@example.com"
                  value={meetingForm.attendees}
                  onChange={(e) =>
                    setMeetingForm({
                      ...meetingForm,
                      attendees: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Meeting agenda and details..."
                value={meetingForm.description}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={meetingForm.startTime || defaultTimes.start}
                  onChange={(e) =>
                    setMeetingForm({
                      ...meetingForm,
                      startTime: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={meetingForm.endTime || defaultTimes.end}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <UsageIndicator
                feature="GOOGLE_MEET_CREATED"
                showDetails={true}
                className="mb-2"
              />
              <Button
                onClick={handleCreateMeeting}
                disabled={isCreating || !meetingForm.summary}
                className="w-full"
              >
                {isCreating ? "Creating Meeting..." : "Create Google Meet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              disabled={!accessToken}
            >
              <Calendar className="w-4 h-4 mr-2" />
              View Calendar
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              disabled={!accessToken}
            >
              <Clock className="w-4 h-4 mr-2" />
              Instant Meeting
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              disabled={!accessToken}
            >
              <Users className="w-4 h-4 mr-2" />
              Meeting History
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              disabled={!accessToken}
              onClick={handleCreateMeeting}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Google Meet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
