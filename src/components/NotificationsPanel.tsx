
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const NotificationsPanel = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Card className="absolute right-0 mt-2 w-96 z-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">Notifications</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={markAllAsRead}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Tout marquer comme lu
        </Button>
      </CardHeader>
      <CardDescription className="px-6 text-sm text-muted-foreground">
        Vos notifications récentes
      </CardDescription>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune notification
            </p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg transition-colors ${
                    notification.is_read
                      ? "bg-background"
                      : "bg-muted font-medium"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm flex-1">{notification.message}</p>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs"
                      >
                        Marquer comme lu
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                    {notification.distance_meters && (
                      <span>
                        à {Math.round(notification.distance_meters / 100) / 10} km
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
