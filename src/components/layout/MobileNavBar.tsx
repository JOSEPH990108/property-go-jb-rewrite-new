// src\components\layout\MobileNavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, BarChart2, MessageSquare, FileText, User } from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { id: "home", icon: Home, href: "/" },
  { id: "stats", icon: BarChart2, href: "/tools" },
  { id: "chat", icon: MessageSquare, href: "/contact" },
  { id: "docs", icon: FileText, href: "/projects" },
  { id: "profile", icon: User, href: "/profile" },
];

export function MobileNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 w-[92%] max-w-[360px] -translate-x-1/2 md:hidden">
      <div className="surface-overlay shadow-tech-lg relative flex items-center justify-between rounded-2xl px-6 py-4">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.id}
              className="relative flex h-11 w-11 items-center justify-center"
            >
              {/* Active background */}
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="from-primary/20 to-accent/20 border-accent/30 absolute inset-0 rounded-xl border bg-gradient-to-br"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                />
              )}

              <item.icon
                className={cn(
                  "relative z-10 h-6 w-6 transition-all duration-200",
                  isActive ? "text-accent" : "text-muted-foreground hover:text-foreground",
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {/* Active indicator */}
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-indicator"
                  className="from-primary to-accent absolute -bottom-1 h-1 w-4 rounded-full bg-gradient-to-r"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
