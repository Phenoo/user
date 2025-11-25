"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  BookOpen,
  Share2,
  Heart,
  Plus,
  Sparkles,
  Calendar,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SharedContentProps {
  studyGroupId: Id<"studyGroups">;
  userId: Id<"users">;
}

export default function SharedContent({
  studyGroupId,
  userId,
}: SharedContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<
    "note" | "summary" | "study_guide"
  >("note");
  const [viewFullDialog, setViewFullDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const sharedContent = useQuery(api.studyGroups.getSharedContent, {
    studyGroupId,
  });
  const shareContentMutation = useMutation(api.studyGroups.shareContent);
  const likeContent = useMutation(api.studyGroups.likeSharedContent);

  // Get user's generated content to share
  const userContent = useQuery(api.generatedContent.list, {
    userId: userId as any,
  });

  const handleShareContent = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both title and content");
      return;
    }

    try {
      await shareContentMutation({
        studyGroupId,
        sharedBy: userId,
        title,
        content,
        type: contentType,
        isAIGenerated: false,
      });
      toast.success("Content shared successfully!");
      setIsDialogOpen(false);
      setTitle("");
      setContent("");
      setContentType("note");
    } catch (error) {
      toast.error("Failed to share content");
    }
  };

  const handleShareGeneratedContent = async (generatedItem: any) => {
    try {
      await shareContentMutation({
        studyGroupId,
        sharedBy: userId,
        title: generatedItem.prompt,
        content: generatedItem.content,
        type: generatedItem.type === "essay" ? "note" : generatedItem.type,
        sourceId: generatedItem._id,
        isAIGenerated: true,
      });
      toast.success("AI-generated content shared!");
    } catch (error) {
      toast.error("Failed to share content");
    }
  };

  const handleLike = async (contentId: Id<"sharedContent">) => {
    try {
      await likeContent({ contentId });
    } catch (error) {
      toast.error("Failed to like content");
    }
  };

  const handleViewFull = (item: any) => {
    setSelectedContent(item);
    setViewFullDialog(true);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "note":
        return <FileText className="h-5 w-5" />;
      case "summary":
        return <BookOpen className="h-5 w-5" />;
      case "study_guide":
        return <Calendar className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Shared Notes & Summaries</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Share Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Share Content with Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select
                  value={contentType}
                  onValueChange={(value: any) => setContentType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="study_guide">Study Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chapter 5 Key Concepts"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your notes, summary, or study guide..."
                  rows={10}
                />
              </div>

              <Button onClick={handleShareContent} className="w-full">
                Share Content
              </Button>

              {userContent && userContent.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Share Your AI-Generated Content
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {userContent.slice(0, 5).map((item: any) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.prompt}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.type} • {formatDistanceToNow(item.createdAt)}{" "}
                            ago
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShareGeneratedContent(item)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sharedContent && sharedContent.length > 0 ? (
        <div className="grid gap-4">
          {sharedContent.map((item) => (
            <Card key={item._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getContentIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        {item.isAIGenerated && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={item.sharer?.image} />
                          <AvatarFallback>
                            {item.sharer?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-muted-foreground">
                          {item.sharer?.name || "Unknown"} •{" "}
                          {formatDistanceToNow(item.createdAt)} ago
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {item.type.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm whitespace-pre-wrap line-clamp-6 text-muted-foreground">
                  {item.content}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(item._id)}
                    className="flex items-center gap-1"
                  >
                    <Heart className="h-4 w-4" />
                    {item.likes > 0 && (
                      <span className="text-xs">{item.likes}</span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewFull(item)}
                  >
                    View Full
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No shared content yet</p>
              <p className="text-sm">
                Be the first to share notes or summaries with your group!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Full Content Dialog */}
      <Dialog open={viewFullDialog} onOpenChange={setViewFullDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedContent && getContentIcon(selectedContent.type)}
              {selectedContent?.title}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedContent?.sharer?.image} />
                <AvatarFallback>
                  {selectedContent?.sharer?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">
                {selectedContent?.sharer?.name || "Unknown"} •{" "}
                {selectedContent &&
                  formatDistanceToNow(selectedContent.createdAt)}{" "}
                ago
              </p>
              {selectedContent?.isAIGenerated && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {selectedContent?.type.replace("_", " ")}
              </Badge>
            </div>
          </DialogHeader>
          <div className="pt-4">
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {selectedContent?.content}
            </div>
            <div className="flex items-center gap-2 pt-4 mt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  selectedContent && handleLike(selectedContent._id)
                }
                className="flex items-center gap-1"
              >
                <Heart className="h-4 w-4" />
                {selectedContent?.likes > 0 && (
                  <span className="text-xs">{selectedContent.likes}</span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
