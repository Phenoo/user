import { Calendar } from "@/components/calendar/calendar";
import { CalendarSkeleton } from "@/components/calendar/skeletons/calendar-skeleton";

import React, { Suspense } from "react";

export default function CalendarPage() {
  return (
    <main className="flex min-h-screen  flex-col">
      <div className="container p-4 md:mx-auto">
        <Suspense fallback={<CalendarSkeleton />}>
          <Calendar />
        </Suspense>
      </div>
    </main>
  );
}
