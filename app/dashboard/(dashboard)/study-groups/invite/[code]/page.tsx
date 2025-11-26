"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, MapPin, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import LoadingComponent from "@/components/loader";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const user = useQuery(api.users.currentUser);
  const groupInfo = useQuery(api.studyGroups.getGroupByInviteCode, {
    inviteCode: code,
  });
  const joinByInvite = useMutation(api.studyGroups.joinGroupByInvite);

  const handleJoinGroup = async () => {
    if (!user?._id) {
      toast.error("Please log in to join this group");
      return;
    }

    try {
      await joinByInvite({
        inviteCode: code,
        userId: user._id,
      });
      toast.success("Successfully joined the group!");
      router.push(`/dashboard/study-groups/${groupInfo?._id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    }
  };

  if (!user || groupInfo === undefined) {
    return <LoadingComponent />;
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Invalid Invite</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This invite link is invalid or has expired.
            </p>
            <Button onClick={() => router.push("/dashboard/study-groups")}>
              Browse Study Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              You've been invited to join
            </CardTitle>
            <h2 className="text-3xl font-bold">{groupInfo.name}</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Course</p>
              <p className="font-medium">
                {groupInfo.course?.code} - {groupInfo.course?.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{groupInfo.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Members</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {groupInfo.currentMembers}/{groupInfo.maxMembers}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Meeting Type</p>
                <Badge variant="outline">{groupInfo.meetingType}</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{groupInfo.location}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleJoinGroup} className="flex-1" size="lg">
              <Users className="h-4 w-4 mr-2" />
              Join Group
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/study-groups")}
              size="lg"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By joining, you agree to participate respectfully and contribute to the
            group's success
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



