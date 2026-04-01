"use client";

import { useLayoutEffect } from "react";

export default function ScrollToBottom() {
  useLayoutEffect(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  }, []);

  return null;
}
