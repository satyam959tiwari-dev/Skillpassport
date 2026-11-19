"use client";

import { useCallback, useState } from "react";
import { pushBridgeActivity } from "@/lib/demo-bridge";

/** Local activity feed + optional bridge mirror for cross-page demos. */
export function useDemoActivity(initialJust: string | null = null) {
  const [justHappened, setJustHappened] = useState<string | null>(initialJust);
  const [activity, setActivity] = useState<string[]>([]);

  const act = useCallback((message: string, mirror = true) => {
    setJustHappened(message);
    setActivity((prev) => [message, ...prev].slice(0, 8));
    if (mirror) pushBridgeActivity(message);
  }, []);

  const clearJust = useCallback(() => setJustHappened(null), []);

  return { justHappened, activity, act, clearJust, setJustHappened };
}
