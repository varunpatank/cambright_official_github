"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

const TRACK_INTERVAL_MS = 15_000;
const FLUSH_THRESHOLD_SECONDS = 60;

export const SessionTimeTracker = () => {
  const { user, isLoaded } = useUser();
  const pendingSecondsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const sendingRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user?.id) {
      pendingSecondsRef.current = 0;
      lastTickRef.current = null;
      initializedRef.current = false;
      return;
    }

    const isActive = () =>
      typeof document !== "undefined" &&
      document.visibilityState === "visible" &&
      document.hasFocus();

    const captureElapsed = () => {
      const now = Date.now();
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
        return;
      }

      if (isActive()) {
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        if (elapsed > 0) {
          pendingSecondsRef.current += elapsed;
        }
      }

      lastTickRef.current = now;
    };

    const sendPayload = (seconds: number) => {
      const payload = JSON.stringify({ seconds });
      const body = new Blob([payload], { type: "application/json" });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/session-time/heartbeat", body);
        return;
      }

      void fetch("/api/session-time/heartbeat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
        keepalive: true,
      });
    };

    const flush = () => {
      if (sendingRef.current) return;
      captureElapsed();

      if (pendingSecondsRef.current <= 0) return;

      sendingRef.current = true;
      const seconds = pendingSecondsRef.current;
      pendingSecondsRef.current = 0;
      sendPayload(seconds);
      sendingRef.current = false;
    };

    if (!initializedRef.current) {
      initializedRef.current = true;
      sendPayload(0);
    }

    const interval = window.setInterval(() => {
      captureElapsed();
      if (pendingSecondsRef.current >= FLUSH_THRESHOLD_SECONDS) {
        flush();
      }
    }, TRACK_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flush();
      } else {
        lastTickRef.current = Date.now();
      }
    };

    const handleWindowBlur = () => {
      flush();
    };

    const handleWindowFocus = () => {
      lastTickRef.current = Date.now();
    };

    const handleBeforeUnload = () => {
      captureElapsed();
      if (pendingSecondsRef.current > 0) {
        sendPayload(pendingSecondsRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("beforeunload", handleBeforeUnload);

    lastTickRef.current = Date.now();

    return () => {
      captureElapsed();
      flush();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoaded, user?.id]);

  return null;
};
