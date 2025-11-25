"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  MessageCircle,
  Send,
  FileText,
  Upload,
  Settings,
  UserPlus,
  Crown,
  Share2,
  Copy,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StudyTogetherMode from "../_components/study-together-mode";
import SharedContent from "../_components/shared-content";
import GroupInvites from "../_components/group-invites";

export default function StudyGroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;

  const currentUser = useQuery(api.users.currentUser);
  const group = useQuery(api.studyGroups.getStudyGroup, {
    groupId: groupId as Id<"studyGroups">,
  });

  const messages = useQuery(api.studyGroups.getGroupMessages, {
    groupId: groupId as Id<"studyGroups">,
  });

  const inviteLink = useQuery(api.studyGroups.getInviteLink, {
    groupId: groupId as Id<"studyGroups">,
  });
  const generateInviteLink = useMutation(api.studyGroups.generateInviteLink);

  const sendMessage = useMutation(api.studyGroups.sendMessage);

  const [newMessage, setNewMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const isOrganizer =
    currentUser && group && group.organizerId === currentUser._id;

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        studyGroupId: groupId as Id<"studyGroups">,
        userId: currentUser?._id as Id<"users">,
        message: newMessage,
        messageType: "text",
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleGenerateInviteLink = async () => {
    await generateInviteLink({ groupId: groupId as Id<"studyGroups"> });
  };

  const copyInviteLink = async () => {
    if (inviteLink) {
      const fullLink = `${window.location.origin}/dashboard/study-groups/join/${inviteLink.inviteCode}`;
      await navigator.clipboard.writeText(fullLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  if (
    group === undefined ||
    group?.members === undefined ||
    messages === undefined
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Loading Study Group...</h2>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Study Group Not Found</h2>
          <Link href="/study-groups">
            <Button>Back to Study Groups</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-start flex-col gap-4">
            <Link href="/dashboard/study-groups">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Study Groups
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {group.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {group.course?.code} • {group.course?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="chat" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="study-together">Study Together</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Group Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                      {messages.length > 0 &&
                        messages.map((message) => (
                          <div key={message._id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`/abstract-geometric-shapes.png?height=32&width=32&query=${message?.fileName ?? ""}`}
                              />
                              <AvatarFallback>
                                {message?.fileName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {message?.fileName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    message._creationTime
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-pretty">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resources */}
              <TabsContent value="resources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Shared Resources
                      </CardTitle>
                      <Dialog
                        open={showUploadDialog}
                        onOpenChange={setShowUploadDialog}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload Resource</DialogTitle>
                            <DialogDescription>
                              Share files, documents, or links with your study
                              group
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="text-center py-8 text-muted-foreground">
                              <Upload className="h-12 w-12 mx-auto mb-4" />
                              <p>File upload functionality coming soon!</p>
                              <p className="text-sm">
                                You can share content using the "Shared" tab for
                                now.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>No resources shared yet</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule */}
              <TabsContent value="schedule" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Meeting Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{"TBD"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{group.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{group.meetingType}</Badge>
                      </div>
                    </div>

                    {group.googleCalendarLink && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          asChild
                          className="w-full bg-transparent"
                        >
                          <a
                            href={group.googleCalendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Add to Google Calendar
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Study Together Mode */}
              <TabsContent value="study-together" className="space-y-4">
                {currentUser && (
                  <StudyTogetherMode
                    studyGroupId={groupId as Id<"studyGroups">}
                    userId={currentUser._id}
                  />
                )}
              </TabsContent>

              {/* Shared Content */}
              <TabsContent value="shared" className="space-y-4">
                {currentUser && (
                  <SharedContent
                    studyGroupId={groupId as Id<"studyGroups">}
                    userId={currentUser._id}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Group Info */}
            <Card>
              <CardHeader>
                <CardTitle>Group Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-pretty">
                  {group.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Members</span>
                    <span>
                      {group.members.length}/{group.maxMembers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Next Meeting</span>
                    <span>{"TBD"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog
                    open={showSettingsDialog}
                    onOpenChange={setShowSettingsDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Group Settings</DialogTitle>
                        <DialogDescription>
                          Manage your study group preferences and settings
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="text-center py-8 text-muted-foreground">
                          <Settings className="h-12 w-12 mx-auto mb-4" />
                          <p>Group settings panel coming soon!</p>
                          <p className="text-sm">
                            {isOrganizer
                              ? "As an organizer, you'll be able to modify group settings here."
                              : "Contact the group organizer to modify settings."}
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Scroll to the invite section if user is organizer
                      if (isOrganizer) {
                        const inviteSection = document.querySelector(
                          "[data-invite-section]"
                        );
                        if (inviteSection) {
                          inviteSection.scrollIntoView({ behavior: "smooth" });
                        }
                      }
                    }}
                    disabled={!isOrganizer}
                    title={
                      isOrganizer
                        ? "Scroll to invite section"
                        : "Only organizers can invite members"
                    }
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Invite Members */}
            {isOrganizer && currentUser && (
              <div data-invite-section>
                <GroupInvites
                  studyGroupId={groupId as Id<"studyGroups">}
                  userId={currentUser._id}
                  isOrganizer={isOrganizer}
                />
              </div>
            )}

            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle>Members ({group.members.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.members.map((member) => (
                    <div key={member._id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/abstract-geometric-shapes.png?height=32&width=32&`}
                        />
                        <AvatarFallback>AS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">Member Name</p>
                          {member.role === "organizer" && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Joined{" "}
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
