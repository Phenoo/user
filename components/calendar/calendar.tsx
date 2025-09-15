"use client";
import React from "react";
import { CalendarBody } from "@/components/calendar/calendar-body";
import { CalendarProvider } from "@/components/calendar/contexts/calendar-context";
import { DndProvider } from "@/components/calendar/contexts/dnd-context";
import { CalendarHeader } from "@/components/calendar/header/calendar-header";
import { getEvents, getUsers } from "@/components/calendar/requests";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

async function getCalendarData() {
  return {
    events: await getEvents(),
    users: await getUsers(),
  };
}

export function Calendar() {
  const events = useQuery(api.events.list) || [];

  return (
    <CalendarProvider events={events} users={[]} view="month">
      <DndProvider showConfirmation={true}>
        <div className="w-full border rounded-xl">
          <CalendarHeader />
          <CalendarBody />
        </div>
      </DndProvider>
    </CalendarProvider>
  );
}
