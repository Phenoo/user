"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserPlus,
  Copy,
  Check,
  Mail,
  Users,
  Clock,
  Link as LinkIcon,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface GroupInvitesProps {
  studyGroupId: Id<"studyGroups">;
  userId: Id<"users">;
  isOrganizer: boolean;
}

export default function GroupInvites({
  studyGroupId,
  userId,
  isOrganizer,
}: GroupInvitesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");

  const inviteLink = useQuery(api.studyGroups.getInviteLink, { groupId: studyGroupId });
  const generateInvite = useMutation(api.studyGroups.generateInviteLink);

  const handleGenerateInvite = async () => {
    try {
      await generateInvite({ groupId: studyGroupId });
      toast.success("Invite link generated!");
    } catch (error) {
      toast.error("Failed to generate invite link");
    }
  };

  const handleCopyLink = () => {
    if (inviteLink?.inviteCode) {
      const link = `${window.location.origin}/dashboard/study-groups/invite/${inviteLink.inviteCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const expiresAt = inviteLink?.expiresAt
    ? new Date(inviteLink.expiresAt)
    : null;
  const isExpired = expiresAt && expiresAt < new Date();

  if (!isOrganizer) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            <CardTitle className="text-lg">Invite Members</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Members to Group</DialogTitle>
                <DialogDescription>
                  Share the invite link or send direct invitations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-3">
                  <Label>Invite Link</Label>
                  {inviteLink && !isExpired ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={`${window.location.origin}/dashboard/study-groups/invite/${inviteLink.inviteCode}`}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyLink}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires {expiresAt?.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {inviteLink.usedCount}/{inviteLink.maxUses} uses
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={handleGenerateInvite}
                      variant="outline"
                      className="w-full"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Generate Invite Link
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {inviteLink && !isExpired ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">
                Active invite link (
                {inviteLink.usedCount}/{inviteLink.maxUses} uses)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Invite Link
            </Button>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <p>No active invite link</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="link"
              size="sm"
              className="mt-2"
            >
              Generate one now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component for users to view their pending invites
interface PendingInvitesProps {
  userId: Id<"users">;
}

export function PendingInvites({ userId }: PendingInvitesProps) {
  const pendingInvites = useQuery(api.studyGroups.getPendingInvites, {
    userId,
  });
  const acceptInvite = useMutation(api.studyGroups.acceptFriendInvite);
  const declineInvite = useMutation(api.studyGroups.declineFriendInvite);

  const handleAccept = async (inviteId: Id<"friendInvites">) => {
    try {
      await acceptInvite({ inviteId, userId });
      toast.success("Invite accepted! Welcome to the group!");
    } catch (error: any) {
      toast.error(error.message || "Failed to accept invite");
    }
  };

  const handleDecline = async (inviteId: Id<"friendInvites">) => {
    try {
      await declineInvite({ inviteId });
      toast.success("Invite declined");
    } catch (error) {
      toast.error("Failed to decline invite");
    }
  };

  if (!pendingInvites || pendingInvites.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <CardTitle className="text-lg">Pending Invitations</CardTitle>
          <Badge variant="default">{pendingInvites.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingInvites.map((invite) => (
          <div
            key={invite._id}
            className="flex items-start justify-between gap-4 p-3 rounded-lg border"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={invite.fromUser?.image} />
                <AvatarFallback>
                  {invite.fromUser?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {invite.fromUser?.name} invited you to join
                </p>
                <p className="text-sm text-muted-foreground font-semibold truncate">
                  {invite.group?.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {invite.course?.code} • {invite.course?.name}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAccept(invite._id)}
                className="shrink-0"
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(invite._id)}
                className="shrink-0"
              >
                Decline
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}



