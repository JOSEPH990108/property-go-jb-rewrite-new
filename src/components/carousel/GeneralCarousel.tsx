// src\components\carousel\GeneralCarousel.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Approximate scroll distance for arrow clicks.
   * @default 320
   */
  scrollStep?: number;
}

export default function Carousel({ children, className, scrollStep = 320 }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Scroll State to control arrow visibility
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Function to check scroll position and update state
  const checkScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      // Show Left Arrow if we are not at the very start
      setCanScrollLeft(scrollLeft > 0);
      // Show Right Arrow if we haven't reached the very end (with small tolerance)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  // Set up listeners for scroll and resize
  useEffect(() => {
    const container = containerRef.current;
    checkScroll(); // Initial check

    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }

    return () => {
      if (container) container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, children]);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollStep : scrollStep,
        behavior: "smooth",
      });
    }
  };

  // --- Drag to Scroll Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftState(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <div className={cn("relative w-full px-4 py-10", className)}>
      {/* Container Wrapper - Constrained to approx 4 items width (1240px) */}
      <div className="group/carousel relative mx-auto max-w-[1240px]">
        {/* Left Arrow - Only render if we can scroll left & hidden on mobile */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="bg-card border-border text-muted-foreground hover:text-accent hover:border-accent absolute top-1/2 left-0 z-30 hidden h-12 w-12 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border opacity-0 shadow-md transition-all duration-300 group-hover/carousel:opacity-100 hover:scale-110 focus:outline-none disabled:opacity-0 md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Right Arrow - Only render if we can scroll right & hidden on mobile */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="bg-card border-border text-muted-foreground hover:text-accent hover:border-accent absolute top-1/2 right-0 z-30 hidden h-12 w-12 translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border opacity-0 shadow-md transition-all duration-300 group-hover/carousel:opacity-100 hover:scale-110 focus:outline-none disabled:opacity-0 md:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Scrollable Area */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={cn(
            "scrollbar-hide overflow-x-auto scroll-smooth px-4 py-12",
            isDragging ? "cursor-grabbing select-none" : "cursor-grab",
          )}
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
          }}
        >
          {/* Inner Layout Container for Centering */}
          <div className="flex w-max min-w-full items-center justify-center gap-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
