import { motion, AnimatePresence } from "motion/react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { useCalendar } from "../contexts/calendar-context";
import { CalendarRange, List, Columns, Grid3X3, Grid2X2 } from "lucide-react";
import { TCalendarView } from "../types";
import { memo } from "react";

const tabs = [
  {
    name: "Day",
    value: "day",
    icon: () => <List className="h-4 w-4" />,
  },
  {
    name: "Week",
    value: "week",
    icon: () => <Columns className="h-4 w-4" />,
  },
  {
    name: "Month",
    value: "month",
    icon: () => <Grid3X3 className="h-4 w-4" />,
  },
];

function Views() {
  const { view, setView } = useCalendar();

  return (
    <div className="gap-4  w-full">
      <div className="h-auto  flex flex-row gap-1 rounded-3xl bg-muted dark:bg-neutral-900 p-1 w-full">
        {tabs.map(({ icon: Icon, name, value }) => {
          const isActive = view === value;

          return (
            <motion.div
              key={value}
              layout
              className={cn(
                "flex h-10 items-center rounded-3xl cursor-pointer justify-center overflow-hidden  transition-all",
                isActive
                  ? "bg-red-400 text-white font-bold"
                  : "hover:bg-rose-300"
              )}
              onClick={() => setView(value as TCalendarView)}
              initial={false}
              animate={{
                width: 120,
              }}
              transition={{
                type: "tween",
                stiffness: 400,
                damping: 25,
              }}
            >
              <div>
                <motion.div
                  className="flex h-8 w-full items-center justify-center rounded-3xl cursor-pointer"
                  animate={{ filter: "blur(0px)" }}
                  exit={{ filter: "blur(2px)" }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <AnimatePresence initial={false}>
                    <motion.span
                      className="font-medium text-sm"
                      initial={{ opacity: 0, scaleX: 0.8 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      style={{ originX: 0 }}
                    >
                      {name}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(Views);
