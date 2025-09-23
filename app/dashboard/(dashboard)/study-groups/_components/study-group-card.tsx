"use client";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Calendar1,
  Clock,
  ExternalLink,
  MapPin,
  Star,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BsArrowUpRight } from "react-icons/bs";
import Link from "next/link";

const StudyGroupCard = ({ group }: { group: any }) => {
  const getuser = useQuery(api.users.getById, {
    id: group.organizerId,
  });

  return (
    <Card key={group._id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg text-balance">{group.name}</CardTitle>
            <p className="text-sm text-muted-foreground font-mono">
              {group.course?.code} • {group.course?.name}
            </p>
          </div>
          <Link href={`/dashboard/study-groups/${group._id}`}>
            <div className="bg-foreground text-background bg-opacity-30 rounded-full p-2">
              <BsArrowUpRight stroke="1" className="h-4 stroke-[1px]  w-4" />
            </div>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-pretty">
          {group.description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {group.currentMembers}/{group.maxMembers} members
            </span>
          </div>
          {group.nextMeeting && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{group.nextMeeting}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{group.location}</span>
          </div>
          {group.rating > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span>{group.rating}/5.0</span>
            </div>
          )}
        </div>
        {(group.googleCalendarLink || group.zoomLink) &&
          group.meetingType !== "In-Person" && (
            <div className="flex gap-2">
              {group.googleCalendarLink && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={group.googleCalendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Calendar1 className="h-4 w-4 mr-1" />
                    Calendar
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              {group.zoomLink && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={group.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Zoom
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          )}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">{group.meetingType}</Badge>
          {group.tags &&
            group.tags.slice(0, 2).map((tag: any) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Organized by {getuser?.name}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyGroupCard;
