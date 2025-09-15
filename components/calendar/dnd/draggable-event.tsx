import { motion } from "framer-motion";
import type React from "react";
import type { ReactNode } from "react";
import { useDragDrop } from "@/components/calendar/contexts/dnd-context";
import type { IEvent } from "@/components/calendar/interfaces";
import { EventDoc } from "../contexts/calendar-context";

interface DraggableEventProps {
  event: EventDoc;
  children: ReactNode;
  className?: string;
}

export function DraggableEvent({
  event,
  children,
  className,
}: DraggableEventProps) {
  const { startDrag, endDrag, isDragging, draggedEvent } = useDragDrop();

  const isCurrentlyDragged = isDragging && draggedEvent?._id === event._id;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      className={`${className || ""} ${isCurrentlyDragged ? "opacity-50 cursor-grabbing" : "cursor-grab"}`}
      draggable
      onClick={(e: React.MouseEvent<HTMLDivElement>) => handleClick(e)}
      onDragStart={(e) => {
        (e as DragEvent).dataTransfer!.setData(
          "text/plain",
          event._id.toString()
        );
        startDrag(event);
      }}
      onDragEnd={() => {
        endDrag();
      }}
    >
      {children}
    </motion.div>
  );
}
