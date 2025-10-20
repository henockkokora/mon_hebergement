"use client";
import { useEffect } from "react";

export default function DisableSWDev() {
  useEffect(() => {
    // En développement, désenregistre tous les SW et vide les caches
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV === "production") return;

    // Désenregistrement des Service Workers
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations?.().then((regs) => {
        regs.forEach((reg) => {
          reg.unregister();
        });
      });
    }

    // Suppression des caches
    if ("caches" in window) {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    }
  }, []);

  return null;
}
