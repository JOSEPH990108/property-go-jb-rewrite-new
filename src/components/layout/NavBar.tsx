// src/components/layout/NavBar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, User, Calendar, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import StaggeredDropDown from "@/components/custom/ui/StaggeredDropdown";
import { MobileNavBar } from "./MobileNavBar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { clearRoleCookie } from "@/app/actions/auth-actions";
import type { NavMenuItem, NavProfileOption } from "@/types/navigation.types";

// --- Default menu configuration ---

const DEFAULT_MENU_ITEMS: NavMenuItem[] = [
  {
    id: "projects",
    label: "Projects",
    href: "/projects",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop",
    description: "Curated collection of premier developments.",
  },
  {
    id: "tools",
    label: "Tools",
    href: "/tools",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop",
    description: "Financial calculators and property matchmaker.",
  },
  {
    id: "contact",
    label: "Contact Us",
    href: "/contact",
    image:
      "https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=2671&auto=format&fit=crop",
    description: "Get in touch with our specialized agents.",
  },
];

// --- Sub-components ---

interface NavMenuOverlayProps {
  isOpen: boolean;
  menuItems: NavMenuItem[];
  hoveredItem: string | null;
  onHover: (id: string | null) => void;
  onClose: () => void;
}

function NavMenuOverlay({ isOpen, menuItems, hoveredItem, onHover, onClose }: NavMenuOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-background fixed inset-0 z-40 hidden md:block"
        >
          {/* Background image layer */}
          <div className="absolute inset-0 z-0">
            <div className="from-background/95 via-background/85 to-background/95 absolute inset-0 z-10 bg-gradient-to-b" />

            {menuItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{
                  opacity: hoveredItem === item.id ? 0.4 : 0,
                  scale: hoveredItem === item.id ? 1 : 1.05,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  className="object-cover brightness-50 saturate-50 dark:brightness-30"
                />
              </motion.div>
            ))}
          </div>

          {/* Menu content */}
          <div className="relative z-20 container flex h-full items-center">
            <nav className="flex flex-col gap-6 pl-20">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  onMouseEnter={() => onHover(item.id)}
                  onMouseLeave={() => onHover(null)}
                  className="group"
                >
                  <Link href={item.href} onClick={onClose} className="relative block">
                    <span
                      className={cn(
                        "block font-sans text-7xl font-bold tracking-tight transition-all duration-300 md:text-8xl",
                        hoveredItem === item.id
                          ? "gradient-text translate-x-4"
                          : "text-foreground/60 group-hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </span>

                    {hoveredItem === item.id && (
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-muted-foreground mt-3 max-w-md text-sm font-medium tracking-wide"
                      >
                        {item.description}
                      </motion.p>
                    )}

                    {hoveredItem === item.id && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 60 }}
                        className="from-primary to-accent mt-2 h-1 rounded-full bg-gradient-to-r"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Helpers ---

function getInitials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// --- Main component ---

interface NavbarProps {
  /** Override the default menu items. Defaults to Projects / Tools / Contact. */
  menuItems?: NavMenuItem[];
}

export function Navbar({ menuItems = DEFAULT_MENU_ITEMS }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const session = authClient.useSession();

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsOpen(false));
    return () => cancelAnimationFrame(frameId);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  const handleSignOut = async () => {
    await clearRoleCookie();
    await authClient.signOut();
    useUIStore.getState().resetDismissed();
    router.push("/");
  };

  const profileOptions: NavProfileOption[] = [
    { id: "profile", label: "Profile", icon: User, onClick: () => router.push("/profile") },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      onClick: () => router.push("/appointments"),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      onClick: () => router.push("/notifications"),
    },
    { id: "signout", label: "Sign Out", icon: LogOut, onClick: handleSignOut },
  ];

  return (
    <>
      {/* Header */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 hidden transition-all duration-300 md:block",
          isOpen ? "border-transparent bg-transparent" : "tech-nav",
        )}
      >
        <div className="container flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <span className="from-primary to-accent shadow-tech-sm group-hover:shadow-tech-md group-hover:glow-primary flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-all duration-300">
              <Home className="h-5 w-5" />
            </span>
            <span className="text-foreground hidden font-sans font-semibold tracking-wide sm:block">
              PROPERTY<span className="gradient-text">GO</span>JB
            </span>
          </Link>

          {/* Menu toggle */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Toggle menu"
            className="tech-button text-foreground hover:border-accent hover:glow-accent focus-visible:ring-accent focus-visible:ring-offset-background hidden items-center gap-3 rounded-full px-6 py-2.5 font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:flex"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }}>
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90 }} animate={{ rotate: 0 }}>
                  <Menu className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-xs font-semibold tracking-widest uppercase">
              {isOpen ? "Close" : "Menu"}
            </span>
          </button>

          {/* Profile / Sign In */}
          <div className={cn(isOpen && "pointer-events-none opacity-0")}>
            {session.data?.user ? (
              <StaggeredDropDown
                variant="profile"
                label={getInitials(session.data.user.name)}
                userImage={session.data.user.image || undefined}
                options={profileOptions}
              />
            ) : (
              <Link
                href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`}
                className="tech-button hover:border-accent hover:glow-accent rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <MobileNavBar />

      <NavMenuOverlay
        isOpen={isOpen}
        menuItems={menuItems}
        hoveredItem={hoveredItem}
        onHover={setHoveredItem}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
