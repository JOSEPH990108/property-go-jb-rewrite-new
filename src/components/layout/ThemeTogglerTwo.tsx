"use client";

import { useTheme } from "@/hooks/useTheme";
import { useIsClient } from "@/hooks/useIsClient";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export default function ThemeTogglerTwo() {
  const { theme, toggleTheme } = useTheme();
  const mounted = useIsClient();

  if (!mounted) {
    return <div aria-hidden className="bg-muted size-14 animate-pulse rounded-xl" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      className="group tech-button text-foreground hover:border-accent hover:glow-accent focus-visible:ring-accent focus-visible:ring-offset-background relative inline-flex size-14 items-center justify-center rounded-xl transition-all duration-300 hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95"
    >
      {/* ICON */}
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex items-center justify-center"
          >
            <Moon className="text-accent size-6" aria-hidden strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex items-center justify-center"
          >
            <Sun className="text-primary size-6" aria-hidden strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>

      {/* GLOW EFFECT */}
      <span
        aria-hidden
        className="from-primary/10 to-accent/10 pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </button>
  );
}
