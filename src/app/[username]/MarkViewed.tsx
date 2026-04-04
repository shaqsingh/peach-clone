'use client';

import { useEffect } from "react";
import { markFeedViewed } from "../actions";

export default function MarkViewed({ username }: { username: string }) {
  useEffect(() => {
    markFeedViewed(username);
  }, [username]);

  return null;
}
