"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Timer, Users, Play, Pause, RotateCcw, Plus } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface StudyTogetherModeProps {
  studyGroupId: Id<"studyGroups">;
  userId: Id<"users">;
}

export default function StudyTogetherMode({
  studyGroupId,
  userId,
}: StudyTogetherModeProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [duration, setDuration] = useState("25");

  const activeSessions = useQuery(api.studyGroups.getActiveStudySessions, {
    studyGroupId,
  });
  const createSession = useMutation(api.studyGroups.createStudySession);
  const joinSession = useMutation(api.studyGroups.joinStudySession);
  const endSession = useMutation(api.studyGroups.endStudySession);

  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) {
      toast.error("Please enter a session title");
      return;
    }

    try {
      await createSession({
        studyGroupId,
        createdBy: userId,
        title: sessionTitle,
        duration: Number(duration),
      });
      toast.success("Study session created!");
      setIsDialogOpen(false);
      setSessionTitle("");
      setDuration("25");
    } catch (error) {
      toast.error("Failed to create study session");
    }
  };

  const handleJoinSession = async (sessionId: Id<"studyTogetherSessions">) => {
    try {
      await joinSession({ sessionId, userId });
      toast.success("Joined study session!");
    } catch (error) {
      toast.error("Failed to join study session");
    }
  };

  const handleEndSession = async (sessionId: Id<"studyTogetherSessions">) => {
    try {
      await endSession({ sessionId });
      toast.success("Study session ended");
    } catch (error) {
      toast.error("Failed to end study session");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Study Together Mode</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Study Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="session-title">Session Title</Label>
                <Input
                  id="session-title"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g., Chapter 5 Review"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="25"
                  min="1"
                  max="180"
                />
              </div>
              <Button onClick={handleCreateSession} className="w-full">
                Create Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeSessions && activeSessions.length > 0 ? (
        <div className="grid gap-4">
          {activeSessions.map((session) => (
            <StudySessionCard
              key={session._id}
              session={session}
              userId={userId}
              onJoin={() => handleJoinSession(session._id)}
              onEnd={() => handleEndSession(session._id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active study sessions</p>
              <p className="text-sm">Start a synchronized study session with your group!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface StudySessionCardProps {
  session: any;
  userId: Id<"users">;
  onJoin: () => void;
  onEnd: () => void;
}

function StudySessionCard({ session, userId, onJoin, onEnd }: StudySessionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((session.endTime - now) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        setIsRunning(false);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [session.endTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const isParticipant = session.participants.some((p: any) => p?._id === userId);
  const isCreator = session.createdBy === userId;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Started by {session.creator?.name || "Unknown"}
            </p>
          </div>
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "Active" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl font-bold font-mono tabular-nums">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {isRunning ? "Time Remaining" : "Session Ended"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            {session.participants?.slice(0, 5).map((participant: any, idx: number) => (
              <Avatar key={idx} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={participant?.image} />
                <AvatarFallback>
                  {participant?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {session.participants?.length || 0} studying together
          </span>
        </div>

        <div className="flex gap-2">
          {!isParticipant && isRunning && (
            <Button onClick={onJoin} variant="default" className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Join Session
            </Button>
          )}
          {isParticipant && isRunning && (
            <Button variant="outline" className="flex-1" disabled>
              <Pause className="h-4 w-4 mr-2" />
              You're In
            </Button>
          )}
          {isCreator && (
            <Button onClick={onEnd} variant="destructive" size="sm">
              End Session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



