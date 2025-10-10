"use client";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { IoSparklesSharp } from "react-icons/io5";

import { FileIcon } from "lucide-react";
import GenerateButton from "@/components/generate-button";
const ButtonUpload = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <GenerateButton title="Upload" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center">
              <FileIcon className="w-12 h-12" />
              <span className="text-sm font-medium text-gray-500">
                Drag and drop a file or click to browse
              </span>
              <span className="text-xs text-gray-500">
                PDF, image, video, or audio
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <Label htmlFor="file" className="text-sm font-medium">
                File
              </Label>
              <Input
                id="file"
                type="file"
                placeholder="File"
                accept="image/*"
              />
            </div>
          </CardContent>
        </Card>
        <DialogFooter>
          <button className="button">
            <IoSparklesSharp className="button__icon h-4 w-4" />
            <span className="button__text">Upload</span>
          </button>{" "}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ButtonUpload;
