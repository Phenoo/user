"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
const CoursesSelect = ({
  course,
  onChange,
}: {
  course: string;
  onChange: (course: string) => void;
}) => {
  const user = useQuery(api.users.currentUser);

  const getCourses =
    useQuery(api.courses.getAllCourses, {
      userId: user?._id as Id<"users">,
    }) || [];

  return (
    <Select
      value={course}
      onValueChange={(e) => onChange(e)}
      defaultValue={course}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a course" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>My Courses</SelectLabel>
          {getCourses.length > 0 &&
            getCourses.map((item) => (
              <SelectItem key={item._id} value={item._id}>
                {item.name} ({item.code})
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CoursesSelect;
