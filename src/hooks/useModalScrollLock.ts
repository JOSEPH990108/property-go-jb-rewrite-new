"use client";

import { useEffect } from "react";

import { useLenis } from "@/components/shared/SmoothScroll";

let activeLockCount = 0;
let previousBodyOverflow = "";
let previousDocumentOverflow = "";

export function useModalScrollLock(isLocked: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!isLocked) return;

    if (activeLockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      previousDocumentOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    activeLockCount += 1;
    lenis?.stop();

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);

      if (activeLockCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousDocumentOverflow;
        lenis?.start();
      }
    };
  }, [isLocked, lenis]);
}
