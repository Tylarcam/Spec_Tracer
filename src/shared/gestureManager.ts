
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type GestureEvent =
  | { type: "toggleCapture" }
  | { type: "lockElement"; element: HTMLElement }
  | { type: "openDebugModal" };

interface GestureContextValue {
  /** externally triggerable — e.g. tests */
  emit: (e: GestureEvent) => void;
  /** true while Capture Mode is ON */
  captureActive: boolean;
}

const GestureContext = createContext<GestureContextValue | undefined>(undefined);

export const useGesture = () => {
  const ctx = useContext(GestureContext);
  if (!ctx) throw new Error("useGesture must be used within <GestureProvider>");
  return ctx;
};

export const GestureProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [captureActive, setCaptureActive] = useState(false);
  const touchStartRef = useRef<number>(0);
  const activeTouchesRef = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const externalListeners = useRef<((e: GestureEvent) => void)[]>([]);

  /* -------------------------------- Gestures -------------------------------- */
  const handleTouchStart = useCallback((e: TouchEvent) => {
    activeTouchesRef.current = e.touches.length;

    // Two-finger single-tap → toggleCapture
    if (e.touches.length === 2) {
      touchStartRef.current = Date.now();
    }

    // Long-press (≥450 ms) when Capture ON
    if (e.touches.length === 1 && captureActive) {
      longPressTimer.current = setTimeout(() => {
        const target = e.target as HTMLElement;
        emitInternal({ type: "lockElement", element: target });
        vibrate(20); // light haptic
      }, 450);
    }
  }, [captureActive]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Two-finger single-tap detection
    if (
      activeTouchesRef.current === 2 &&
      Date.now() - touchStartRef.current < 250
    ) {
      emitInternal({ type: "toggleCapture" });
      vibrate(50); // medium haptic
    }

    // cancel long-press timer
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    activeTouchesRef.current = e.touches.length;
  }, []);

  const handleTouchMove = useCallback(() => {
    // Nothing yet — MouseOverlay will follow touchmove
  }, []);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleTouchEnd, handleTouchMove, handleTouchStart]);

  /* ------------------------------ Public API ------------------------------ */
  const emitInternal = (e: GestureEvent) => {
    switch (e.type) {
      case "toggleCapture":
        setCaptureActive((prev) => !prev);
        break;
      case "lockElement":
        // let consumer (LogTrace) deal with the element
        break;
      case "openDebugModal":
        break;
    }
    // bubble to consumers
    externalEmit(e);
  };

  // consumer-supplied listener
  const externalEmit = (e: GestureEvent) =>
    externalListeners.current.forEach((cb) => cb(e));

  /* ------------------------------ Context val ------------------------------ */
  const value: GestureContextValue = {
    captureActive,
    emit: (e) => externalEmit(e),
  };

  return (
    <GestureContext.Provider value={value}>
      {children}
    </GestureContext.Provider>
  );
};

/* -------------------------------- Helpers -------------------------------- */
const vibrate = (ms: number) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};
