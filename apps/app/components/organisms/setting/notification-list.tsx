"use client";

import React from "react";

import { Avatar, AvatarFallback, AvatarImage, Button, cn, getInitials, Separator } from "@workspace/ui";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  Mail,
  MoreVertical,
  Receipt,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { useNotifications } from "@/hooks/use-notifications";
import { useAppStore } from "@/stores/app";

export function NotificationList() {
  const { notifications, isLoading, markAsRead, deleteNotification, unreadCount, refetch } = useNotifications();
  const { dictionary } = useAppStore() as any;
  const dict = dictionary.settings.notifications || {};

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
      toast.success(dict.all_marked_read || "All notifications marked as read");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "transaction.created":
        return <TrendingUp className="size-4 text-blue-500" />;
      case "budget.exceeded":
        return <AlertCircle className="size-4 text-red-500" />;
      case "subscription.expiring":
        return <Receipt className="size-4 text-orange-500" />;
      case "wallet.created":
        return <Wallet className="size-4 text-green-500" />;
      default:
        return <Bell className="size-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 p-4 rounded-lg border animate-pulse">
            <div className="size-10 rounded-full bg-accent" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 bg-accent rounded" />
              <div className="h-3 w-3/4 bg-accent rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="size-12 rounded-full bg-accent/50 flex items-center justify-center mb-4">
          <Bell className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium">{dict.no_notifications || "No notifications"}</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          {dict.no_notifications_description || "When you receive alerts, they will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {dict.recent_activity || "Recent Activity"}
          {unreadCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-foreground text-background rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[10px] uppercase tracking-wider font-semibold"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="mr-2 size-3" />
            {dict.mark_all_read || "Mark all as read"}
          </Button>
        )}
      </div>

      <div className="divide-y rounded-lg border bg-card">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "group relative flex gap-4 p-4 transition-colors hover:bg-accent/50",
              !notification.is_read && "bg-accent/20",
            )}
          >
            <div className="relative flex-none">
              <div className="flex size-10 items-center justify-center rounded-full border bg-background shadow-sm">
                {getIcon(notification.type)}
              </div>
              {!notification.is_read && (
                <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background bg-blue-600" />
              )}
            </div>

            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span className={cn("text-sm font-medium leading-none truncate", !notification.is_read && "font-bold")}>
                  {notification.title}
                </span>
                <span className="flex-none text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>

              <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => markAsRead([notification.id])}
                  >
                    <Check className="mr-1 size-3" />
                    {dict.mark_read || "Mark read"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <Trash2 className="mr-1 size-3" />
                  {dict.delete || "Delete"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length >= 20 && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase tracking-wider font-semibold">
            {dict.load_more || "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
