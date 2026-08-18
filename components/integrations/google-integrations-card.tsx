"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, RefreshCw, FolderOpen, Calendar, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";
import { GooglePicker } from "./google-picker";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface GoogleIntegrationsCardProps {
  classroomStatus?: "connected" | "disconnected" | "needs_reauth";
  driveStatus?: "connected" | "disconnected" | "needs_reauth";
  calendarStatus?: "connected" | "disconnected" | "needs_reauth";
}

export function GoogleIntegrationsCard({
  classroomStatus = "disconnected",
  driveStatus = "disconnected",
  calendarStatus = "disconnected",
}: GoogleIntegrationsCardProps) {
  const [isSyncingClassroom, setIsSyncingClassroom] = useState(false);
  const user = useQuery(api.users.currentUser);

  const handleConnect = (integration: "classroom" | "drive" | "calendar") => {
    const userId = user?._id ? `&userId=${encodeURIComponent(user._id)}` : "";
    window.location.href = `/api/integrations/google/connect?integration=${integration}${userId}`;
  };

  const handleSyncClassroom = async () => {
    setIsSyncingClassroom(true);
    try {
      const res = await fetch("/api/integrations/google/classroom/sync", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Synced Google Classroom courses!");
      } else if (res.status === 403 || data.code === "INSUFFICIENT_SCOPE") {
        toast.error("Permission required for Google Classroom.");
        handleConnect("classroom");
      } else {
        toast.error(data.error || "Failed to sync Google Classroom.");
      }
    } catch (err) {
      console.error("[IntegrationsCard] Sync error:", err);
      toast.error("Network error syncing Google Classroom.");
    } finally {
      setIsSyncingClassroom(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">Academic Integrations</CardTitle>
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            Least Privilege OAuth
          </Badge>
        </div>
        <CardDescription>
          Connect your Google academic tools incrementally. StudentApp requests narrow read-only access only when you activate each feature.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 1. Google Classroom Integration */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-base">Google Classroom</h3>
              <Badge variant={classroomStatus === "connected" ? "default" : "outline"}>
                {classroomStatus === "connected" ? "Connected" : "Not connected"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Import read-only course lists, coursework deadlines, and classwork materials.
            </p>
            <div className="text-[11px] text-muted-foreground flex gap-3 pt-1">
              <span className="text-green-600 font-medium">✓ View classes & coursework</span>
              <span className="text-muted-foreground">✗ Cannot create or grade assignments</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {classroomStatus === "connected" ? (
              <Button size="sm" variant="outline" onClick={handleSyncClassroom} disabled={isSyncingClassroom} className="gap-2">
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingClassroom ? "animate-spin" : ""}`} />
                Sync Now
              </Button>
            ) : (
              <Button size="sm" onClick={() => handleConnect("classroom")} className="gap-2">
                Connect Classroom
              </Button>
            )}
          </div>
        </div>

        {/* 2. Google Drive Integration */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-base">Google Drive</h3>
              <Badge variant={driveStatus === "connected" ? "default" : "outline"}>
                {driveStatus === "connected" ? "Connected" : "Picker Access Ready"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Selective file picker (drive.file scope). You pick exact lecture notes without granting broad Drive access.
            </p>
            <div className="text-[11px] text-muted-foreground flex gap-3 pt-1">
              <span className="text-green-600 font-medium">✓ You choose specific files</span>
              <span className="text-muted-foreground">✗ No full Drive directory crawling</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GooglePicker />
          </div>
        </div>

        {/* 3. Google Calendar Integration */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-base">Google Calendar</h3>
              <Badge variant={calendarStatus === "connected" ? "default" : "outline"}>
                {calendarStatus === "connected" ? "Connected" : "Not connected"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Add assignments, study plans, and focus timer sessions to your personal calendars (calendar.events.owned scope).
            </p>
            <div className="text-[11px] text-muted-foreground flex gap-3 pt-1">
              <span className="text-green-600 font-medium">✓ Add & update owned events</span>
              <span className="text-muted-foreground">✗ No unowned calendar access</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {calendarStatus === "connected" ? (
              <Button size="sm" variant="outline" onClick={() => handleConnect("calendar")} className="gap-2">
                Re-authorize Calendar
              </Button>
            ) : (
              <Button size="sm" onClick={() => handleConnect("calendar")} className="gap-2">
                Connect Calendar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
