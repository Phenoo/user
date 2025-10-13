"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";

interface SubscriptionEvent {
  _id: string;
  polarSubscriptionId: string;
  productName: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  canceledAt?: number;
  createdAt: number;
}

interface SubscriptionHistoryProps {
  events: SubscriptionEvent[];
}

export function SubscriptionHistory({ events }: SubscriptionHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "canceled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "trialing":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Calendar className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "canceled":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "trialing":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "past_due":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No subscription history available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription History</CardTitle>
        <CardDescription>
          Track all changes to your subscriptions over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div
              key={event._id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="mt-1">{getStatusIcon(event.status)}</div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{event.productName}</h4>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(event.status)}
                  >
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Period:{" "}
                      {format(
                        new Date(event.currentPeriodStart),
                        "MMM d, yyyy"
                      )}{" "}
                      -{" "}
                      {format(new Date(event.currentPeriodEnd), "MMM d, yyyy")}
                    </span>
                  </div>

                  {event.cancelAtPeriodEnd && (
                    <div className="text-amber-600 dark:text-amber-500">
                      Scheduled to cancel on{" "}
                      {format(new Date(event.currentPeriodEnd), "MMM d, yyyy")}
                    </div>
                  )}

                  {event.canceledAt && (
                    <div className="text-red-600 dark:text-red-500">
                      Canceled on{" "}
                      {format(new Date(event.canceledAt), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {format(
                  new Date(event.createdAt || event.currentPeriodStart),
                  "MMM d, yyyy"
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
