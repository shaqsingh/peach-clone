"use client";

import { useLayoutEffect, useEffect } from "react";

export default function ScrollToBottom() {
  useLayoutEffect(() => {
    // Scroll immediately on layout
    window.scrollTo(0, document.documentElement.scrollHeight);
  }, []);

  useEffect(() => {
    // Also scroll after a short delay to catch any lazy-loaded content
    const timer = setTimeout(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
