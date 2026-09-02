"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GooglePickerProps {
  courseId?: string;
  onFileSelected?: (file: { id: string; name: string; mimeType: string }) => void;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export function GooglePicker({ courseId, onFileSelected }: GooglePickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const openPicker = async () => {
    setIsLoading(true);
    try {
      // 1. Check/acquire valid accessToken for drive.file
      const tokenRes = await fetch("/api/google-meet/token?integration=drive");
      const tokenData = await tokenRes.json();

      if (!tokenData.accessToken) {
        toast.error("Please connect Google Drive to select files.");
        window.location.href = "/api/integrations/google/connect?integration=drive";
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY;
      const appId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_NUMBER;

      if (!apiKey) {
        toast.error("Google Picker API key is not configured.");
        setIsLoading(false);
        return;
      }

      // Load GAPI Picker library dynamically
      if (!window.gapi) {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => loadPicker(tokenData.accessToken, apiKey, appId);
        document.body.appendChild(script);
      } else {
        loadPicker(tokenData.accessToken, apiKey, appId);
      }
    } catch (err) {
      console.error("[GooglePicker] Failed to initialize Picker:", err);
      toast.error("Could not open Google Drive Picker.");
      setIsLoading(false);
    }
  };

  const loadPicker = (oauthToken: string, apiKey: string, appId?: string) => {
    window.gapi.load("picker", {
      callback: () => {
        const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
          .setMimeTypes("application/pdf,application/vnd.google-apps.document,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain")
          .setMode(window.google.picker.DocsViewMode.LIST);

        const pickerBuilder = new window.google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(oauthToken)
          .setDeveloperKey(apiKey)
          .setCallback(pickerCallback);

        if (appId) {
          pickerBuilder.setAppId(appId);
        }

        const picker = pickerBuilder.build();
        picker.setVisible(true);
        setIsLoading(false);
      },
    });
  };

  const pickerCallback = async (data: any) => {
    if (data.action === "picked") {
      const doc = data.docs[0];
      toast.info(`Selected file: ${doc.name}`);

      if (onFileSelected) {
        onFileSelected({
          id: doc.id,
          name: doc.name,
          mimeType: doc.mimeType,
        });
      }

      if (courseId) {
        try {
          const importRes = await fetch("/api/integrations/google/drive/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileId: doc.id,
              fileName: doc.name,
              mimeType: doc.mimeType,
              courseId,
            }),
          });

          const importData = await importRes.json();
          if (importRes.ok) {
            toast.success(`Imported "${doc.name}" into course materials!`);
          } else {
            toast.error(importData.error || "Failed to import file.");
          }
        } catch (err) {
          console.error("[GooglePicker] Import error:", err);
          toast.error("Error importing Drive file into course knowledge base.");
        }
      }
    } else if (data.action === "cancel") {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={openPicker} disabled={isLoading} className="gap-2">
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4 text-blue-500" />}
      Import from Google Drive
    </Button>
  );
}
