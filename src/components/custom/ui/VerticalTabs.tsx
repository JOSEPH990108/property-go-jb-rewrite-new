// src/components/custom/ui/VerticalTabs.tsx
"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLenis } from "@/components/shared/SmoothScroll";
import { cn } from "@/lib/utils";
import { TabItem } from "@/types";

interface VerticalTabsProps {
  items: TabItem[];
  defaultTabId?: string;
  className?: string;
  scrollOffset?: number;
}

export default function VerticalTabs({
  items,
  defaultTabId,
  className,
  scrollOffset = -140, // Increased offset for the floating header
}: VerticalTabsProps) {
  const [activeTabId, setActiveTabId] = useState<string>(defaultTabId || items[0]?.id);

  const contentTopRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  // --- DRAG TO SCROLL LOGIC ---
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  // ----------------------------

  const activeContent = items.find((item) => item.id === activeTabId) || items[0];

  const handleMobileTabClick = (id: string) => {
    if (isDragging) return;
    setActiveTabId(id);
    setTimeout(() => {
      if (contentTopRef.current) {
        if (lenis) {
          lenis.scrollTo(contentTopRef.current, { offset: scrollOffset, duration: 0.8 });
        } else {
          const y =
            contentTopRef.current.getBoundingClientRect().top + window.scrollY + scrollOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }
    }, 10);
  };

  if (!items.length) return null;

  return (
    <div className={cn("mx-auto w-full max-w-7xl p-4 md:p-8", className)}>
      {/* =======================================================
          MOBILE VIEW: Floating "Glass" Island Tabs
         ======================================================= */}
      <div className="flex flex-col gap-6 lg:hidden">
        {/* Sticky Container Wrapper */}
        <div className="pointer-events-none sticky top-20 z-30 flex w-full justify-center">
          {/* THE FLOATING ISLAND 
              - pointer-events-auto: Re-enables clicks specifically for this box
              - rounded-2xl: Gives the container the requested border radius
              - shadow-lg: Adds depth so it floats above content
          */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={cn(
              "no-scrollbar pointer-events-auto relative max-w-full overflow-x-auto",
              "mx-4 flex gap-2 p-2", // Inner padding/margins
              "bg-background/80 border border-white/20 backdrop-blur-xl", // Glass effect
              "rounded-2xl shadow-xl shadow-black/5", // THE BORDER RADIUS
              "cursor-grab select-none active:cursor-grabbing",
            )}
          >
            {items.map((item) => {
              const isActive = activeTabId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileTabClick(item.id)}
                  className={cn(
                    "relative rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300", // Buttons also rounded-xl
                    isActive
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll Anchor Marker */}
        <div ref={contentTopRef} className="scroll-mt-36" />

        {/* Content Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              {activeContent.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* =======================================================
          DESKTOP VIEW: Vertical Sidebar
         ======================================================= */}
      <div className="hidden flex-row items-start gap-12 lg:flex">
        {/* LEFT: Navigation Tabs */}
        <div className="sticky top-24 flex w-1/4 flex-col gap-3">
          {items.map((item) => {
            const isActive = activeTabId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTabId(item.id)}
                className={cn(
                  "group relative flex w-full cursor-pointer items-center justify-between rounded-2xl border border-transparent px-6 py-5 text-left transition-all duration-300 ease-out", // rounded-2xl for desktop tabs too
                  isActive
                    ? "bg-card border-border shadow-lg"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="bg-accent absolute top-0 bottom-0 left-0 w-1 rounded-l-2xl" // Matches container
                  />
                )}
                <span
                  className={cn(
                    "text-base font-medium tracking-wide transition-colors",
                    isActive ? "text-foreground font-semibold" : "",
                  )}
                >
                  {item.label}
                </span>
                <ArrowRight
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    isActive
                      ? "text-accent translate-x-0 opacity-100"
                      : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50",
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* RIGHT: Content Display */}
        <div className="min-h-[500px] w-3/4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full"
            >
              {activeContent.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
