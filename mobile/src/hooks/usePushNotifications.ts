import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

export const usePushNotifications = () => {
  const notificationListener = useRef<Notifications.Subscription>(null as any);
  const responseListener = useRef<Notifications.Subscription>(null as any);

  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("Notification response received:", data);

        // Routing logic based on custom notification data
        if (data && data.groupId) {
          if (data.expenseId) {
            // If navigating to a specific expense inside a group
            router.push(`/expense/${data.expenseId}` as any);
          } else {
            // If navigating to the general group page (e.g. for payments received)
            router.push(`/group/${data.groupId}` as any);
          }
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);
};
