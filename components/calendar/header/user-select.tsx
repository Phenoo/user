import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendar } from "@/components/calendar/contexts/calendar-context";

export function UserSelect() {
  const { users, selectedUserId } = useCalendar();

  return <></>;
}
