import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, MoreHorizontal, Users } from "lucide-react";
import { FlashcardItemProps } from "@/app/dashboard/(dashboard)/flashcards/components/flashcard-container";

export function FlashcardItem({ item }: { item: FlashcardItemProps }) {
  return (
    <Card
      className={`relative ${item.color} border-t-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded bg-black/5 p-2">
              <BookOpen className="h-4 w-4" />
            </div>
            <Badge variant="default" className="text-xs">
              {item.subject}
            </Badge>
          </div>
          <button className="cursor-pointer rounded-full bg-transparent p-0">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <CardTitle className="text-base font-semibold">
            {item.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{item.date}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>
            {item.participants} reviews{item.participants !== 1 ? "s" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
