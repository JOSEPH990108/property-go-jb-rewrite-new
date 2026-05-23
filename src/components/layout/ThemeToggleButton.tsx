"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div aria-hidden className="border-border bg-muted h-11 w-11 rounded-full border" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      className="group glass-button text-foreground focus-visible:ring-ring focus-visible:ring-offset-background relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 hover:scale-[1.03] hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <Moon className="text-accent size-5" aria-hidden strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <Sun className="text-primary size-5" aria-hidden strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>

      {/* SUBTLE HOVER HALO */}
      <span
        aria-hidden
        className="bg-accent/15 dark:bg-accent/25 pointer-events-none absolute inset-0 rounded-full opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* INNER RING FOR DEPTH */}
      <span
        aria-hidden
        className="absolute inset-px rounded-full ring-1 ring-black/5 dark:ring-white/10"
      />
    </button>
  );
}
