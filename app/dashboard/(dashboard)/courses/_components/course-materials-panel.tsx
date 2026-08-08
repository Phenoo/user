"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpenText,
  FileText,
  Loader2,
  MoreHorizontal,
  PenSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CourseMaterialsPanelProps = {
  courseId: Id<"courses">;
  userId?: Id<"users">;
};

const SOURCE_LABELS: Record<string, string> = {
  "manual-note": "Manual Note",
  upload: "Upload",
  "google-drive": "Google Drive",
  onedrive: "OneDrive",
  "google-classroom": "Google Classroom",
  canvas: "Canvas",
  "microsoft-education": "Microsoft 365",
};

export function CourseMaterialsPanel({
  courseId,
  userId,
}: CourseMaterialsPanelProps) {
  const materials =
    useQuery(
      (api as any).courseDocuments.listByCourse,
      userId ? { userId, courseId } : "skip"
    ) || [];
  const summary = useQuery(
    (api as any).courseDocuments.getCourseMaterialSummary,
    userId ? { userId, courseId } : "skip"
  );
  const createMaterial = useMutation(
    (api as any).courseDocuments.createManualMaterial
  );
  const updateMaterial = useMutation(
    (api as any).courseDocuments.updateMaterial
  );
  const deleteMaterial = useMutation(
    (api as any).courseDocuments.deleteMaterial
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("manual-note");

  const filteredMaterials = useMemo(() => {
    return materials.filter((material: any) => {
      const matchesSearch =
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.textContent || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesSource =
        sourceFilter === "all" || material.source === sourceFilter;
      return matchesSearch && matchesSource;
    });
  }, [materials, searchTerm, sourceFilter]);

  const resetForm = () => {
    setEditingMaterialId(null);
    setTitle("");
    setContent("");
    setSource("manual-note");
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (material: any) => {
    setEditingMaterialId(material._id);
    setTitle(material.title);
    setContent(material.textContent || "");
    setSource(material.source);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!userId) {
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Add a title and enough material content to save this note.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingMaterialId) {
        await updateMaterial({
          userId,
          materialId: editingMaterialId,
          title: title.trim(),
          content: content.trim(),
        });
        toast.success("Course material updated.");
      } else {
        await createMaterial({
          userId,
          courseId,
          title: title.trim(),
          content: content.trim(),
          source: source as any,
        });
        toast.success("Course material added to the knowledge base.");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "StudentApp couldn't save this material."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!userId) {
      return;
    }

    try {
      await deleteMaterial({
        userId,
        materialId,
      });
      toast.success("Course material deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "StudentApp couldn't delete this material."
      );
    }
  };

  if (!userId) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
          Loading course materials...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-xl bg-primary/10 p-2">
              <BookOpenText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Knowledge Sources</p>
              <p className="text-2xl font-semibold">{summary?.total ?? "..."}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-xl bg-emerald-500/10 p-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ready for AI</p>
              <p className="text-2xl font-semibold">{summary?.ready ?? "..."}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-xl bg-amber-500/10 p-2">
              <RefreshCw className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processing / Failed</p>
              <p className="text-2xl font-semibold">
                {(summary?.processing ?? 0) + (summary?.failed ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Course Materials</h2>
          <p className="text-sm text-muted-foreground">
            Build a private course knowledge base with notes and study material that
            StudentApp can ground future AI responses on.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="sm:w-64"
          />
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Filter source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="manual-note">Manual notes</SelectItem>
              <SelectItem value="upload">Uploads</SelectItem>
              <SelectItem value="google-drive">Google Drive</SelectItem>
              <SelectItem value="canvas">Canvas</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Material
          </Button>
        </div>
      </div>

      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-2 p-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            Materials added here stay private to this course and this student unless
            you explicitly share them elsewhere.
          </p>
          <Badge variant="secondary">Server-side course isolation enabled</Badge>
        </CardContent>
      </Card>

      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">No course materials yet</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Add lecture notes, study guides, or pasted material so StudentApp can
                answer this course with grounded context instead of only general
                knowledge.
              </p>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMaterials.map((material: any) => (
            <Card key={material._id} className="border-border/70">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{material.title}</h3>
                      <Badge variant="outline">
                        {SOURCE_LABELS[material.source] || material.source}
                      </Badge>
                      <Badge
                        variant={
                          material.processingStatus === "ready"
                            ? "default"
                            : material.processingStatus === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {material.processingStatus}
                      </Badge>
                    </div>

                    <p className="line-clamp-4 max-w-3xl text-sm text-muted-foreground">
                      {material.textContent || "No preview available yet."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Updated {new Date(material.updatedAt).toLocaleDateString()}
                      </span>
                      <span>{material.chunkCount || 0} chunks indexed</span>
                      <span>
                        {material.fileSize
                          ? `${material.fileSize.toLocaleString()} characters`
                          : "No file size"}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(material)}>
                        <PenSquare className="h-4 w-4" />
                        Edit material
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(material._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete material
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMaterialId ? "Edit course material" : "Add course material"}
            </DialogTitle>
            <DialogDescription>
              Paste lecture notes, rubrics, or study material here so the course can
              become a usable AI knowledge space.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Week 4 Recursion Notes"
              />
            </div>

            {!editingMaterialId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Source</label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual-note">Manual note</SelectItem>
                    <SelectItem value="upload">Imported upload</SelectItem>
                    <SelectItem value="google-drive">Google Drive</SelectItem>
                    <SelectItem value="canvas">Canvas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Material content</label>
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Paste lecture notes, assignment brief, study guide, or any course text here..."
                className="min-h-72"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {editingMaterialId ? "Save changes" : "Add material"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
