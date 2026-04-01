"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.hostname !== "localhost" || true) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA Service Worker registered:", registration.scope);
          })
          .catch((err) => {
            console.error("PWA Service Worker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}
