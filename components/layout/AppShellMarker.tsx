"use client";

import { useEffect } from "react";

/** Marks the document as an app-shell route so marketing chrome (footer) is hidden. */
export function AppShellMarker() {
  useEffect(() => {
    document.body.dataset.appShell = "passport";
    return () => {
      delete document.body.dataset.appShell;
    };
  }, []);

  return null;
}
