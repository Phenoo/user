"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function JoinStudyGroupPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.inviteCode as string;

  const [joinStatus, setJoinStatus] = useState<
    "loading" | "success" | "error" | "already-joined"
  >("loading");

  const groupInvite = useQuery(api.studyGroups.getGroupByInviteCode, {
    inviteCode,
  });
  const joinGroup = useMutation(api.studyGroups.joinGroupByInvite);

  useEffect(() => {
    if (groupInvite === null) {
      setJoinStatus("error");
    } else if (groupInvite && groupInvite.isUserMember) {
      setJoinStatus("already-joined");
    }
  }, [groupInvite]);

  const handleJoinGroup = async () => {
    if (!groupInvite) return;

    try {
      await joinGroup({ inviteCode });
      setJoinStatus("success");

      // Redirect to group page after 2 seconds
      setTimeout(() => {
        router.push(`/study-groups/${groupInvite._id}`);
      }, 2000);
    } catch (error) {
      setJoinStatus("error");
    }
  };

  if (groupInvite === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Loading Invite...</h2>
        </div>
      </div>
    );
  }

  if (joinStatus === "error" || !groupInvite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invalid Invite</h2>
            <p className="text-muted-foreground mb-4">
              This invite link is invalid or has expired.
            </p>
            <Link href="/study-groups">
              <Button>Browse Study Groups</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (joinStatus === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Welcome to the Group!</h2>
            <p className="text-muted-foreground mb-4">
              You've successfully joined {groupInvite.name}. Redirecting to the
              group page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (joinStatus === "already-joined") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Already a Member</h2>
            <p className="text-muted-foreground mb-4">
              You're already a member of this study group.
            </p>
            <Link href={`/study-groups/${groupInvite._id}`}>
              <Button>Go to Group</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join Study Group</CardTitle>
          <p className="text-muted-foreground">
            You've been invited to join a study group
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Group Info */}
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-xl font-bold">{groupInvite.name}</h3>
              <p className="text-muted-foreground">
                {groupInvite?.courseId} •{/* {groupInvite.course} */}
              </p>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">
              {groupInvite.description}
            </p>
          </div>

          {/* Group Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {groupInvite.currentMembers}/{groupInvite.maxMembers} members
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{groupInvite.meetingSchedule || "TBD"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{groupInvite.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{groupInvite.meetingType}</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Link href="/study-groups" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Browse Other Groups
              </Button>
            </Link>
            <Button
              onClick={handleJoinGroup}
              className="flex-1"
              disabled={groupInvite.currentMembers >= groupInvite.maxMembers}
            >
              {groupInvite.currentMembers >= groupInvite.maxMembers
                ? "Group Full"
                : "Join Group"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
