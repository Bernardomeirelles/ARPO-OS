"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Activity, NotificationItem } from "@/types/crm";

export function useRealtimeFeed(initialActivities: Activity[], initialNotifications: NotificationItem[]) {
  const [activities, setActivities] = useState(initialActivities);
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const activityChannel = supabase.channel("activities-feed").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "activities" },
      (payload) => {
        const nextActivity = payload.new as Activity;
        setActivities((current) => [nextActivity, ...current].slice(0, 20));
      }
    ).subscribe();

    const notificationChannel = supabase.channel("notifications-feed").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications" },
      (payload) => {
        const nextNotification = payload.new as NotificationItem;
        setNotifications((current) => [nextNotification, ...current].slice(0, 20));
      }
    ).subscribe();

    return () => {
      void supabase.removeChannel(activityChannel);
      void supabase.removeChannel(notificationChannel);
    };
  }, []);

  return { activities, notifications };
}
