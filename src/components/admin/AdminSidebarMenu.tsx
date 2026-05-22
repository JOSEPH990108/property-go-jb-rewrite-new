"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarMenuItem = {
  key: string;
  label: string;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
};

export type SidebarMenuSection = {
  key: string;
  title: string;
  items: SidebarMenuItem[];
};

export type SidebarProfile = {
  name: string;
  email: string;
  avatarText: string;
};

type AdminSidebarMenuProps = {
  sections: SidebarMenuSection[];
  utilities: SidebarMenuItem[];
  activePath: string;
  profile: SidebarProfile;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
};

export function AdminSidebarMenu({
  sections,
  utilities,
  activePath,
  profile,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
}: AdminSidebarMenuProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,#0b1020_0%,#090d1a_100%)] text-slate-100 shadow-[0_22px_60px_rgba(2,6,23,0.55)] transition-all",
        collapsed ? "p-3 lg:p-2.5" : "p-5"
      )}
    >
      <header className="flex items-center justify-between">
        <div className={cn("flex items-center gap-3", collapsed && "lg:w-full lg:justify-center")}> 
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#3444ff,#54d5ff)] text-white shadow-[0_0_22px_rgba(84,213,255,0.3)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className={cn(collapsed && "lg:hidden")}>
            <p className="text-sm font-semibold tracking-wide text-white/95">HR Manager</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </header>

      <div className="mt-8 space-y-7">
        {sections.map((section) => (
          <section key={section.key}>
            <p className={cn("mb-3 text-[11px] uppercase tracking-[0.22em] text-white/45", collapsed && "lg:hidden")}>{section.title}</p>
            <nav className="space-y-1.5">
              {section.items.map((item) => (
                <MenuItem
                  key={item.key}
                  item={item}
                  activePath={activePath}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </nav>
          </section>
        ))}
      </div>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-5">
        {utilities.map((item) => (
          <MenuItem
            key={item.key}
            item={item}
            activePath={activePath}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <footer className={cn("mt-5 border-t border-white/10 pt-4", collapsed && "lg:pt-3")}> 
        <div className={cn("flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5", collapsed && "lg:justify-center lg:px-0")}> 
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">
            {profile.avatarText}
          </div>
          <div className={cn("min-w-0", collapsed && "lg:hidden")}>
            <p className="truncate text-sm font-medium text-white/90">{profile.name}</p>
            <p className="truncate text-xs text-white/50">{profile.email}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MenuItem({
  item,
  activePath,
  collapsed = false,
  onNavigate,
}: {
  item: SidebarMenuItem;
  activePath: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const isActive = Boolean(item.href && activePath.startsWith(item.href));

  const className = cn(
    "group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition",
    collapsed && "lg:justify-center lg:px-2",
    isActive
      ? "border-white/15 bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
      : "border-transparent bg-transparent text-white/75 hover:border-white/10 hover:bg-white/6 hover:text-white"
  );

  const content = (
    <>
      <span
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-lg border",
          isActive ? "border-white/20 bg-white/8 text-white" : "border-white/10 text-white/65"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn(collapsed && "lg:hidden")}>
        <span className="block font-medium leading-5">{item.label}</span>
        {item.subtitle ? (
          <span className="block text-xs leading-4 text-white/50">{item.subtitle}</span>
        ) : null}
      </span>
      {collapsed ? (
        <span className="pointer-events-none absolute left-[110%] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-white/15 bg-[#0f162a] px-2.5 py-1 text-xs text-white/90 shadow-lg group-hover:lg:block">
          {item.label}
        </span>
      ) : null}
    </>
  );

  if (item.href) {
    return (
      <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
        <Link href={item.href} onClick={onNavigate} className={className}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      whileHover={{ x: 3 }}
      transition={{ duration: 0.15 }}
      onClick={onNavigate}
      className={className}
    >
      {content}
    </motion.button>
  );
}