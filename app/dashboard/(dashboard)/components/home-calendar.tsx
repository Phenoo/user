"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [today, setToday] = useState(new Date());

  const getEvents = useQuery(api.events.list);
  useEffect(() => {
    const updateTime = () => {
      setToday(new Date());
    };

    // Update immediately
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array to run only once

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      days.push({
        day,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const generateTodayEvents = () => {
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    // Sample events that adjust based on current time
    const baseEvents = [
      {
        id: 1,
        title: "Design Review",
        startHour: 15,
        startMinute: 30,
        endHour: 16,
        endMinute: 0,
        color: " border-l-purple-500",
        textColor: "text-purple-700",
      },
      {
        id: 2,
        title: "Zoom Conference with Mark O.",
        startHour: 16,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
        color: " border-l-green-500",
        textColor: "text-green-700",
        hasJoin: true,
        participants: [
          { name: "Mark O.", avatar: "/placeholder.svg?height=24&width=24" },
          { name: "Sarah K.", avatar: "/placeholder.svg?height=24&width=24" },
        ],
        additionalCount: 1,
      },
      {
        id: 3,
        title: "Project Estimation",
        startHour: 17,
        startMinute: 0,
        endHour: 17,
        endMinute: 30,
        color: "border-l-purple-200",
        textColor: "text-purple-700",
      },
      {
        id: 4,
        title: "Feedback for Coinex",
        startHour: 17,
        startMinute: 30,
        endHour: 18,
        endMinute: 0,
        color: "border-l-blue-500",
        textColor: "text-blue-700",
      },
    ];

    return baseEvents.map((event) => ({
      ...event,
      time: `${event.startHour.toString().padStart(2, "0")}:${event.startMinute
        .toString()
        .padStart(2, "0")} - ${event.endHour
        .toString()
        .padStart(2, "0")}:${event.endMinute.toString().padStart(2, "0")}`,
      isPast:
        currentHour > event.endHour ||
        (currentHour === event.endHour && currentMinute > event.endMinute),
      isCurrent:
        currentHour >= event.startHour &&
        currentHour < event.endHour &&
        (currentHour > event.startHour || currentMinute >= event.startMinute),
    }));
  };

  const events = generateTodayEvents();

  const days = getDaysInMonth(currentDate);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatTodayDate = () => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[today.getDay()];
    const day = today.getDate().toString().padStart(2, "0");
    const month = monthNames[today.getMonth()];
    return `${dayName} ${day}, ${month}`;
  };

  function isToday(date: string) {
    const d = new Date(date);
    const today = new Date();
    return (
      d.getUTCFullYear() === today.getUTCFullYear() &&
      d.getUTCMonth() === today.getUTCMonth() &&
      d.getUTCDate() === today.getUTCDate()
    );
  }

  // Filter events for today
  const todayEvents = getEvents?.filter(
    (event) => isToday(event.startDate) || isToday(event.endDate)
  );

  function formatToTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function isEventOngoing(startDate: string, endDate: string) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return now >= start && now <= end;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("prev")}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("next")}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
          {days.map((date, index) => (
            <div
              key={index}
              className={`
                text-center py-2 text-sm cursor-pointer rounded-full transition-colors
                ${
                  date.isCurrentMonth
                    ? date.isToday
                      ? "bg-primary text-primary-foreground  font-medium"
                      : "text-foreground hover:bg-muted"
                    : "text-muted-foreground"
                }
              `}
            >
              {date.day.toString().padStart(2, "0")}
            </div>
          ))}
        </div>

        {/* Day Details */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">{formatTodayDate()}</h3>
            <Link href={"/dashboard/schedule"}>
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            {todayEvents &&
              todayEvents.map((event, i) => (
                <div key={event._id} className="flex gap-3 ">
                  <div>
                    <div className="text-xs  w-12 p-1 bg-[#ddd] text-neutral-900  rounded-xl text-center">
                      {formatToTime(event.startDate)}
                    </div>

                    {i !== 0 && i + 1 < events.length && (
                      <div className="border-[1px] border-dashed border-q w-[1px]  h-full mx-auto"></div>
                    )}
                  </div>
                  <div
                    className={`flex-1 p-3 rounded-lg border relative border-l-4 text-foreground  ${
                      event.color
                    }   ${!isEventOngoing(event.startDate, event.endDate) ? "opacity-60" : ""} ${
                      isEventOngoing(event.startDate, event.endDate) ? "" : ""
                    }`}
                  >
                    <h4 className={`font-medium text-sm `}>
                      {event.title}
                      {isEventOngoing(event.startDate, event.endDate) ? (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                          Live
                        </span>
                      ) : (
                        <span className="ml-2 text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full">
                          Past
                        </span>
                      )}
                    </h4>
                    <div className={`flex items-center gap-1 mt-1 text-xs `}>
                      <Clock className="h-3 w-3" />
                      {formatToTime(event.startDate)} -{" "}
                      {formatToTime(event.endDate)}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <Button size="sm" className="h-7 px-3 text-xs">
                        {isEventOngoing(event.startDate, event.endDate)
                          ? "Join Now"
                          : !isEventOngoing(event.startDate, event.endDate)
                            ? "Ended"
                            : "Join"}
                      </Button>
                      {/* <div className="flex items-center gap-1">
                        {event.participants?.map((participant, idx) => (
                          <Avatar key={idx} className="h-6 w-6">
                            <AvatarImage
                              src={participant.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs">
                              {participant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {event.additionalCount && (
                          <span className="text-xs text-muted-foreground ml-1">
                            +{event.additionalCount}
                          </span>
                        )}
                      </div> */}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
