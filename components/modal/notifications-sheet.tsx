"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpenCheck,
  CalendarClock,
  CheckCheck,
  CreditCard,
  Settings,
  X,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import useNotificationModal from "@/hooks/use-notification";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type NotificationFilter = "all" | "unread" | "read";

const filterLabels: Record<NotificationFilter, string> = {
  all: "All",
  unread: "Unread",
  read: "Read",
};

function formatNotificationTime(timestamp: number) {
  const elapsed = Date.now() - timestamp;
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

function NotificationIcon({ type }: { type: string }) {
  const className = "h-4 w-4";
  if (type === "subscription") return <CreditCard className={className} />;
  if (type === "assignment") return <BookOpenCheck className={className} />;
  if (type === "exam" || type === "study_session") {
    return <CalendarClock className={className} />;
  }
  return <Bell className={className} />;
}

const NotificationsSheet = () => {
  const router = useRouter();
  const { isOpen, onClose } = useNotificationModal();
  const [activeTab, setActiveTab] = useState<NotificationFilter>("all");
  const notifications = useQuery(
    api.notifications.list,
    isOpen ? { filter: activeTab, limit: 50 } : "skip"
  );
  const counts = useQuery(api.notifications.getCounts, isOpen ? {} : "skip");
  const refreshReminders = useMutation(api.notifications.refreshReminders);
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  useEffect(() => {
    if (isOpen) {
      void refreshReminders({}).catch((error) => {
        console.error("Failed to refresh notifications:", error);
      });
    }
  }, [isOpen, refreshReminders]);

  const openNotification = async (
    notificationId: Parameters<typeof markRead>[0]["notificationId"],
    isRead: boolean,
    actionUrl?: string
  ) => {
    if (!isRead) await markRead({ notificationId });
    if (actionUrl) {
      onClose();
      router.push(actionUrl);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-xl">
        <SheetHeader className="pt-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <SheetTitle>Notifications</SheetTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notification settings"
                onClick={() => {
                  onClose();
                  router.push("/dashboard/settings?section=notifications");
                }}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <SheetDescription>
            Assignment, exam, study, and account updates in one place.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {(Object.keys(filterLabels) as NotificationFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === filter
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(filter)}
            >
              {filterLabels[filter]} {counts?.[filter] ?? 0}
            </button>
          ))}
        </div>

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
          {notifications === undefined && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Loading notifications…
            </p>
          )}
          {notifications?.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="rounded-full bg-muted p-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">
                  No {activeTab === "all" ? "" : `${activeTab} `}notifications
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upcoming study reminders and account updates will appear here.
                </p>
              </div>
            </div>
          )}
          {notifications?.map((notification) => (
            <button
              type="button"
              key={notification._id}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted/60 ${
                notification.isRead ? "bg-background" : "border-primary/20 bg-primary/5"
              }`}
              onClick={() =>
                void openNotification(
                  notification._id,
                  notification.isRead,
                  notification.actionUrl
                )
              }
            >
              <span className="mt-0.5 rounded-full bg-muted p-2 text-foreground">
                <NotificationIcon type={notification.type} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                  <span className="font-medium text-foreground">{notification.title}</span>
                  {!notification.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {notification.message}
                </span>
                <span className="mt-2 block text-xs text-muted-foreground">
                  {formatNotificationTime(notification.createdAt)}
                </span>
              </span>
            </button>
          ))}
        </div>

        <SheetFooter className="mt-4">
          <Button
            className="w-full rounded-full"
            variant="outline"
            disabled={!counts?.unread}
            onClick={() => void markAllRead({})}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsSheet;
