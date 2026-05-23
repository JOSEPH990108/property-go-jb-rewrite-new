// src\components\custom\ui\StaggeredDropdown.tsx
"use client";

import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { motion, Variants } from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface DropdownOption {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

interface StaggeredDropDownProps {
  label: string; // Initials for profile or Button Text for action
  userImage?: string;
  options: DropdownOption[];
  className?: string;
  variant?: "profile" | "action"; // Added variant prop
  icon?: LucideIcon; // Main icon for 'action' variant
}

const StaggeredDropDown = ({
  label,
  userImage,
  options,
  className,
  variant = "profile",
  icon: MainIcon,
}: StaggeredDropDownProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div ref={containerRef} animate={open ? "open" : "closed"} className="relative">
        {/* --- DYNAMIC TRIGGER --- */}
        <button
          onClick={() => setOpen((pv) => !pv)}
          className={cn(
            "focus:ring-accent focus:ring-offset-background relative flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none",
            // Profile Variant: Circle with gradient
            variant === "profile" &&
              "from-primary to-accent hover:shadow-tech-md shadow-tech-sm h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br hover:scale-105",
            // Action Variant: Tech button style
            variant === "action" &&
              "text-primary-foreground bg-primary hover:bg-primary/90 shadow-tech-sm hover:shadow-tech-md gap-2 rounded-lg px-4 py-2.5",
          )}
          type="button"
        >
          {variant === "profile" ? (
            <>
              {userImage ? (
                <Image src={userImage} alt="Profile" fill className="object-cover" />
              ) : (
                <span className="text-xs font-bold text-white uppercase">{label}</span>
              )}
            </>
          ) : (
            <>
              {MainIcon && <MainIcon className="text-accent h-4 w-4" />}
              <span className="text-primary-foreground text-sm font-semibold tracking-wide">
                {label}
              </span>
              <motion.span variants={iconVariants}>
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              </motion.span>
            </>
          )}
        </button>

        {/* --- DROPDOWN MENU --- */}
        <motion.ul
          initial="closed"
          animate={open ? "open" : "closed"}
          variants={wrapperVariants}
          style={{ originY: "top", originX: 1 }}
          className="tech-popup absolute top-[130%] right-0 z-50 flex w-max min-w-[220px] flex-col gap-0.5 overflow-hidden p-1.5"
        >
          {options.map((option) => (
            <Option key={option.id} setOpen={setOpen} {...option} />
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
};

const Option = ({
  label,
  icon: Icon,
  setOpen,
  onClick,
}: DropdownOption & { setOpen: Dispatch<SetStateAction<boolean>> }) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={() => {
        setOpen(false);
        onClick?.();
      }}
      className="text-foreground/80 hover:text-foreground hover:bg-secondary flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span>{label}</span>
    </motion.li>
  );
};

export default StaggeredDropDown;

const wrapperVariants: Variants = {
  open: {
    scale: 1,
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.05, duration: 0.2, ease: "easeOut" },
  },
  closed: {
    scale: 0.9,
    opacity: 0,
    transition: { when: "afterChildren", staggerChildren: 0.05, duration: 0.15, ease: "easeIn" },
  },
};

const iconVariants: Variants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants: Variants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -5 },
};
