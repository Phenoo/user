"use client";
import useLoadingModal from "@/hooks/use-loading";
import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog-loading";
import LoadingComponent from "../loader";

const LoadingModal = () => {
  const { isOpen, onClose } = useLoadingModal();

  return (
    <AlertDialog open={isOpen} defaultOpen={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="hidden">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="hidden">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className=" w-full  flex items-center justify-center">
          <div className="loader-container">
            <div className="loader">
              <div className="face front"></div>
              <div className="face back"></div>
              <div className="face left"></div>
              <div className="face right"></div>
              <div className="face top"></div>
              <div className="face bottom"></div>
            </div>
          </div>{" "}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoadingModal;
