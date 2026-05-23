// src/components/custom/feature/RealEstateCard.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Phone } from "lucide-react";
import Image from "next/image";
import { CustomCarousel } from "@/components/custom/ui/CustomCarousel";

// Lightbox
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";

// Types (Adjust import path as needed)
import { PropertyItem } from "@/types";

interface RealEstateCardProps extends Omit<PropertyItem, "id" | "title" | "image"> {
  label: string;
  images: string[];
}

export default function RealEstateCard({
  images,
  label,
  description,
  specs,
  actions,
}: RealEstateCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleSlideClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      {/* LAYOUT CHANGE: 
         1. 'items-stretch' forces both children to equal height.
         2. 'h-full' on the card ensures it fills its own container if needed.
      */}
      <div className="grid w-full grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:gap-12">
        {/* 1. LEFT COLUMN (CAROUSEL) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          // CHANGED:
          // - Removed 'aspect-square' / 'aspect-[4/5]'.
          // - Added 'h-full' to fill the grid cell.
          // - Added 'min-h-[350px]' to ensure it has height on mobile or if text is short.
          className="bg-muted border-border relative order-1 h-full min-h-[350px] w-full overflow-hidden rounded-xl border shadow-xl md:min-h-[450px]"
        >
          <CustomCarousel
            autoplay={true}
            autoplayDelay={5000}
            showArrows={true}
            showDots={true}
            onSlideClick={handleSlideClick}
            className="absolute inset-0 h-full w-full" // Absolute inset ensures carousel fills the container
          >
            {images.map((src, index) => (
              <div key={index} className="relative h-full w-full">
                <Image
                  src={src}
                  alt={`${label} - Image ${index + 1}`}
                  fill
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
              </div>
            ))}
          </CustomCarousel>
        </motion.div>

        {/* 2. RIGHT COLUMN (DETAILS) */}
        <div className="order-2 flex h-full flex-col pt-2">
          {/* Main Content Group */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
              <h2 className="text-foreground font-serif text-3xl">{label}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                {description}
              </p>
            </motion.div>

            <ul className="mt-6 space-y-4">
              {Object.entries(specs).map(([key, value], index) => (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                  className="border-border flex items-center justify-between border-b pb-2 text-sm md:text-[15px]"
                >
                  <span className="text-muted-foreground font-medium capitalize">{key}</span>
                  <span className="text-foreground font-serif font-semibold tracking-wide">
                    {value}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Spacer to push buttons down if you want them aligned to bottom */}
          <div className="flex-grow" />

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-8 flex flex-col gap-4 pt-4 sm:flex-row"
          >
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-8 py-3 text-sm font-medium whitespace-nowrap shadow-md transition-all hover:shadow-lg sm:w-auto">
              <Calendar className="h-4 w-4" />
              {actions?.primary || "Book a Visit"}
            </button>

            <button className="group text-foreground border-border hover:border-accent hover:text-accent flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border bg-transparent px-8 py-3 text-sm font-medium whitespace-nowrap shadow-sm transition-all sm:w-auto">
              <Phone className="text-muted-foreground group-hover:text-accent h-4 w-4 transition-colors" />
              {actions?.secondary || "Call Us Now"}
            </button>
          </motion.div>
        </div>
      </div>

      {/* LIGHTBOX (Unchanged) */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={images.map((src) => ({ src }))}
        plugins={[Slideshow]}
        slideshow={{ autoplay: true, delay: 3000 }}
      />
    </>
  );
}
