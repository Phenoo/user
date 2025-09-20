"use client";

import * as React from "react";
import { CalendarPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/second-calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";

export function BirthdayDrawerOnboarding({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: any;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        Date of birth
      </Label>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full h-12 bg-transparent justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <CalendarPlusIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="w-auto overflow-hidden p-0">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Select date</DrawerTitle>
            <DrawerDescription>Set your date of birth</DrawerDescription>
          </DrawerHeader>
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
            className="mx-auto [--cell-size:clamp(0px,calc(100vw/7.5),52px)]"
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
