"use client";

import { Bell, Check, Trash2 } from "lucide-react";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Badge,
  cn,
} from "@workspace/ui";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export function NotificationBell({ dictionary }: { dictionary: any }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
    isLoading,
  } = useNotifications();
  const router = useRouter();

  const handleMarkAllRead = () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead([notification.id]);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full h-8 w-8 hover:bg-accent"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px]"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {dictionary?.notifications?.title || "Notifications"}
          </h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:bg-transparent"
              onClick={handleMarkAllRead}
            >
              {dictionary?.notifications?.mark_all_read || "Mark all as read"}
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full p-4">
              <p className="text-xs text-muted-foreground">
                {dictionary?.common?.loading || "Loading..."}
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm font-medium">
                {dictionary?.notifications?.empty?.title || "No notifications yet"}
              </p>
              <p className="text-xs opacity-60">
                {dictionary?.notifications?.empty?.description || "We'll notify you when something happens."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex flex-col gap-1 p-4 border-b cursor-pointer transition-colors hover:bg-accent/50",
                    !n.is_read && "bg-accent/30 border-l-2 border-l-primary",
                  )}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-semibold">{n.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t text-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-primary"
            onClick={() => router.push("/settings/notifications")}
          >
            {dictionary?.notifications?.view_settings || "View notification settings"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
