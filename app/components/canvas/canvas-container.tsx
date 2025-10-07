"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useRef } from "react";
import { CanvasLayout } from "./canvas-layout";

export function CanvasContainer() {
  const { setOpen } = useSidebar();
  const hasInitialized = useRef(false);

  // Set initial collapsed state only once
  useEffect(() => {
    if (!hasInitialized.current) {
      setOpen(false);
      hasInitialized.current = true;
    }
  }, [setOpen]);

  return <CanvasLayout />;
}
