"use client";

import { useEffect } from "react";
import { updateUserActivity } from "./actions";

export default function ActivityTracker() {
  useEffect(() => {
    const update = async () => {
      try {
        await updateUserActivity();
      } catch (err) {
        console.error("Failed to update activity", err);
      }
    };

    // Update on mount
    update();

    // Update every 5 minutes
    const interval = setInterval(update, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
