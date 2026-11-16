"use client";
import { useEffect } from "react";

export function reportError(message: string, stack?: string) {
  try {
    navigator.sendBeacon?.(
      "/api/errors",
      JSON.stringify({ message, stack, path: location.pathname })
    );
  } catch {
    /* ignore */
  }
}

export default function ErrorReporter() {
  useEffect(() => {
    const onErr = (e: ErrorEvent) => reportError(e.message, e.error?.stack);
    const onRej = (e: PromiseRejectionEvent) =>
      reportError(String(e.reason?.message || e.reason), e.reason?.stack);
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);
  return null;
}
