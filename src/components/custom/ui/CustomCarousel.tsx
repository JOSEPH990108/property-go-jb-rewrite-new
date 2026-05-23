// src\components\custom\ui\CustomCarousel.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a class merger utility

interface CustomCarouselProps {
  children: React.ReactNode;
  options?: {
    loop?: boolean;
    align?: "start" | "center" | "end";
  };
  autoplay?: boolean;
  autoplayDelay?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  onSlideClick?: (index: number) => void;
}

export function CustomCarousel({
  children,
  options = { loop: true, align: "start" },
  autoplay = false,
  autoplayDelay = 4000,
  showDots = true,
  showArrows = true,
  className,
  onSlideClick,
}: CustomCarouselProps) {
  // 1. Setup Embla with Autoplay plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ playOnInit: autoplay, delay: autoplayDelay, stopOnInteraction: false }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // 2. Sync State with Embla Events
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={cn("group relative", className)}>
      {/* Viewport */}
      <div ref={emblaRef} className="h-full w-full overflow-hidden rounded-xl">
        <div className="flex h-full touch-pan-y">
          {React.Children.map(children, (child, index) => (
            <div
              className="relative h-full min-w-0 flex-[0_0_100%] cursor-pointer"
              onClick={() => onSlideClick?.(index)}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              scrollPrev();
            }}
            className="absolute top-1/2 left-4 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              scrollNext();
            }}
            className="absolute top-1/2 right-4 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots / Pagination */}
      {showDots && (
        <div className="absolute right-0 bottom-4 left-0 z-10 flex justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 w-2 rounded-full shadow-sm transition-all duration-300",
                index === selectedIndex ? "w-6 bg-white" : "bg-white/50 hover:bg-white/80",
              )}
              onClick={(e) => {
                e.stopPropagation();
                scrollTo(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
