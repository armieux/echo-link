
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";
import { Badge } from "@/components/ui/badge";
import { NotificationsPanel } from "./NotificationsPanel";

export const NotificationBell = () => {
  const { unreadCount, isOpen, setIsOpen } = useNotifications();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? "animate-bounce" : ""}`} />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && <NotificationsPanel />}
    </div>
  );
};
