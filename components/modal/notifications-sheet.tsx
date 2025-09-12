"use client";
import React, { useState } from "react";
import { TbChecks } from "react-icons/tb";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useNotificationModal from "@/hooks/use-notification";
import { PiBellSimpleFill } from "react-icons/pi";
import { Button } from "../ui/button";
import { SlSettings } from "react-icons/sl";
import { X } from "lucide-react";
import Image from "next/image";

const NotificationsSheet = () => {
  const [filter, setFilter] = useState("All");
  const { isOpen, onClose } = useNotificationModal();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'unread', 'read'

  const notifications = [
    {
      id: 1,
      type: "message",
      sender: "Cameron Williamson",
      avatar: "/avatars/cameron.jpg", // Replace with actual path
      message: "You should try to listen more actively.",
      time: "November 5, 2024 • 3:15PM",
      read: false,
    },
    {
      id: 2,
      type: "tip",
      category: "Personal Development",
      message: 'AI has shared a new tip in the "Personal Development" category',
      time: "November 5, 2024 • 2:00PM",
      read: false,
    },
    {
      id: 3,
      type: "message",
      sender: "Leslie Alexander",
      avatar: "/avatars/leslie.jpg", // Replace with actual path
      message:
        "That's great insight! Nature and connection often spark inspiration...",
      time: "November 5, 2024 • 1:23PM",
      read: true,
    },
    {
      id: 4,
      type: "progress",
      message:
        'You\'re already halfway through completing the "Leadership" coaching program. Keep up the great work—your goals are within reach!',
      time: "November 5, 2024 • 11:46AM",
      read: true,
    },
    {
      id: 5,
      type: "reflection",
      message: 'Continue your reflections on "New horizons of confidence"',
      time: "November 5, 2024 • 12:05PM",
      read: true,
    },
  ];

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "read") return notification.read;
    return true;
  });

  const allCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  return (
    <Sheet defaultOpen={isOpen} open={isOpen} onOpenChange={onClose}>
      <SheetContent className="md:max-w-4xl overflow-y-auto">
        <SheetHeader className="pt-8 ">
          <div className="flex flex-row gap-2 items-center justify-between">
            <div className="flex flex-row gap-2 items-center">
              <PiBellSimpleFill className="h-5 w-5 mr-1" />
              <SheetTitle className="text-lg">
                {filter} Notifications
              </SheetTitle>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                size={"icon"}
                className="bg-transparent hover:bg-transparent"
              >
                <SlSettings className="h-5 w-5" />
              </Button>
              <Button
                size={"icon"}
                onClick={onClose}
                className="bg-transparent hover:bg-transparent"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="h-full flex flex-col">
          {/* Notification Tabs */}
          <div className="flex justify-around p-2 border-b gap-1 border-accent-foreground bg-background">
            <button
              className={`flex-1 text-center py-2 px-4 rounded-3xl text-sm font-medium ${activeTab === "all" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("all")}
            >
              All{" "}
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold">
                {allCount}
              </span>
            </button>
            <button
              className={`flex-1 text-center py-2 px-4 rounded-3xl text-sm font-medium ${activeTab === "unread" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("unread")}
            >
              Unread{" "}
              <span className="ml-1 px-2 py-0.5 rounded-full  text-xs font-semibold">
                {unreadCount}
              </span>
            </button>
            <button
              className={`flex-1 text-center py-2 px-4 rounded-3xl text-sm font-medium ${activeTab === "read" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("read")}
            >
              Read{" "}
              <span className="ml-1 px-2 py-0.5 rounded-full  text-xs font-semibold">
                {readCount}
              </span>
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 divide-y divide-accent dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start p-3 rounded-lg transition ${
                  !notification.read
                    ? "bg-indigo-50 dark:bg-indigo-900/40"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {/* Message type */}
                {notification.type === "message" && (
                  <div className="relative w-8 h-8 mr-3">
                    <Image
                      src={notification.avatar || "placeholder.jpg"}
                      alt={notification.sender || "notification sender"}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                    {!notification.read && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full"></span>
                    )}
                  </div>
                )}

                {/* Tip type */}
                {notification.type === "tip" && (
                  <div className="relative w-8 h-8 mr-3 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16.413 8.326l-1.312-1.312a2 2 0 00-2.828 0L9.414 10.12l-2.09-2.09a2 2 0 00-2.828 0L3.75 9.493a2 2 0 000 2.828l4.414 4.414a2 2 0 002.828 0l2.09-2.09 3.097 3.097a2 2 0 002.828 0l1.312-1.312a2 2 0 000-2.828L16.413 8.326z"
                      />
                    </svg>
                    {!notification.read && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full"></span>
                    )}
                  </div>
                )}

                {/* Progress type */}
                {notification.type === "progress" && (
                  <div className="relative w-8 h-8 mr-3 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 21h18"
                      />
                    </svg>
                    {!notification.read && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full"></span>
                    )}
                  </div>
                )}

                {/* Reflection type */}
                {notification.type === "reflection" && (
                  <div className="relative w-8 h-8 mr-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-yellow-600 dark:text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
                      />
                    </svg>
                    {!notification.read && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full"></span>
                    )}
                  </div>
                )}

                {/* Text content */}
                <div className="flex-1">
                  {notification.type === "message" && (
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      <span className="font-semibold">
                        {notification.sender}
                      </span>{" "}
                      sent a new message in the chat{" "}
                      <span className="font-semibold">Conflict resolution</span>
                    </p>
                  )}
                  {(notification.type === "tip" ||
                    notification.type === "progress" ||
                    notification.type === "reflection") && (
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {notification.message}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400 my-1">
                    {notification.time}
                  </p>

                  {notification.type === "message" && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      "{notification.message}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <SheetFooter>
          <Button className="w-full rounded-3xl" type="submit">
            Mark all as read <TbChecks className="h-4 w-4 ml-1" />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
export default NotificationsSheet;
