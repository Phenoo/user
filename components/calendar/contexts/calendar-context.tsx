"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import { useLocalStorage } from "@/components/calendar/hooks";
import type { IEvent, IUser } from "@/components/calendar/interfaces";
import type {
  EventColor,
  TCalendarView,
  TEventColor,
} from "@/components/calendar/types";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ICalendarContext {
  selectedDate: Date;
  view: TCalendarView;
  setView: (view: TCalendarView) => void;
  agendaModeGroupBy: "date" | "color";
  setAgendaModeGroupBy: (groupBy: "date" | "color") => void;
  use24HourFormat: boolean;
  toggleTimeFormat: () => void;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  badgeVariant: "dot" | "colored";
  setBadgeVariant: (variant: "dot" | "colored") => void;
  selectedColors: TEventColor[];
  filterEventsBySelectedColors: (colors: TEventColor) => void;
  users: IUser[];
  events: EventDoc[];
  addEvent: (event: EventDoc) => void;
  updateEvent: (event: EventDoc) => void;
  removeEvent: (eventId: string) => void;
  clearFilter: () => void;
}

export interface EventDoc {
  _id: Id<"events">;
  _creationTime?: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  color: string;
  userId: string;
}

interface CalendarSettings {
  badgeVariant: "dot" | "colored";
  view: TCalendarView;
  use24HourFormat: boolean;
  agendaModeGroupBy: "date" | "color";
}

const DEFAULT_SETTINGS: CalendarSettings = {
  badgeVariant: "colored",
  view: "day",
  use24HourFormat: true,
  agendaModeGroupBy: "date",
};

const CalendarContext = createContext({} as ICalendarContext);

export function CalendarProvider({
  children,
  users,
  events,
  badge = "colored",
  view = "day",
}: {
  children: React.ReactNode;
  users: IUser[];
  events: EventDoc[];
  view?: TCalendarView;
  badge?: "dot" | "colored";
}) {
  const [settings, setSettings] = useLocalStorage<CalendarSettings>(
    "calendar-settings",
    {
      ...DEFAULT_SETTINGS,
      badgeVariant: badge,
      view: view,
    }
  );

  const [badgeVariant, setBadgeVariantState] = useState<"dot" | "colored">(
    settings.badgeVariant
  );
  const [currentView, setCurrentViewState] = useState<TCalendarView>(
    settings.view
  );
  const [use24HourFormat, setUse24HourFormatState] = useState<boolean>(
    settings.use24HourFormat
  );
  const [agendaModeGroupBy, setAgendaModeGroupByState] = useState<
    "date" | "color"
  >(settings.agendaModeGroupBy);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">(
    "all"
  );
  const [selectedColors, setSelectedColors] = useState<TEventColor[]>([]);

  const [allEvents, setAllEvents] = useState<EventDoc[]>(events || []);
  const [filteredEvents, setFilteredEvents] = useState<EventDoc[]>(
    events || []
  );

  console.log("provider", events, "skskks");

  const user = useQuery(api.users.currentUser);
  const addEventMutation = useMutation(api.events.add);
  const updateEventMutation = useMutation(api.events.update);
  const removeEventMutation = useMutation(api.events.remove);

  const updateSettings = (newPartialSettings: Partial<CalendarSettings>) => {
    setSettings({
      ...settings,
      ...newPartialSettings,
    });
  };

  const setBadgeVariant = (variant: "dot" | "colored") => {
    setBadgeVariantState(variant);
    updateSettings({ badgeVariant: variant });
  };

  const setView = (newView: TCalendarView) => {
    setCurrentViewState(newView);
    updateSettings({ view: newView });
  };

  const toggleTimeFormat = () => {
    const newValue = !use24HourFormat;
    setUse24HourFormatState(newValue);
    updateSettings({ use24HourFormat: newValue });
  };

  const setAgendaModeGroupBy = (groupBy: "date" | "color") => {
    setAgendaModeGroupByState(groupBy);
    updateSettings({ agendaModeGroupBy: groupBy });
  };

  const filterEventsBySelectedColors = (color: string) => {
    const isColorSelected = selectedColors.includes(color as TEventColor);
    const newColors = isColorSelected
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];

    if (newColors.length > 0) {
      const filtered = allEvents.filter((event) => {
        const eventColor = event.color || "blue";
        return newColors.includes(eventColor);
      });
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(allEvents);
    }

    //@ts-ignore
    setSelectedColors(newColors);
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const addEvent = async (event: EventDoc) => {
    await addEventMutation({
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      color: event.color,
      userId: user?._id as Id<"users">,
    });
  };

  const updateEvent = async (event: EventDoc) => {
    await updateEventMutation({
      id: event._id as Id<"events">,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      color: event.color,
      userId: user?._id as Id<"users">,
    });
  };

  const removeEvent = async (eventId: string) => {
    await removeEventMutation({ id: eventId as Id<"events"> });
  };

  const clearFilter = () => {
    setFilteredEvents(allEvents);
    setSelectedColors([]);
    setSelectedUserId("all");
  };

  const value = {
    selectedDate,
    setSelectedDate: handleSelectDate,
    selectedUserId,
    setSelectedUserId,
    badgeVariant,
    setBadgeVariant,
    users,
    selectedColors,
    filterEventsBySelectedColors,
    events: events,
    view: currentView,
    use24HourFormat,
    toggleTimeFormat,
    setView,
    agendaModeGroupBy,
    setAgendaModeGroupBy,
    addEvent,
    updateEvent,
    removeEvent,
    clearFilter,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context)
    throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
