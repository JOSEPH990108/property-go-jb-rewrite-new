"use client";

import { useState } from "react";
import { ChevronRight, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NavItem = {
  /** Unique key used for active-state tracking */
  key: string;
  /** Display label (hidden on desktop, shown on mobile) */
  label: string;
  /** Any Lucide icon component */
  icon: React.ElementType;
  /** Called when the item is clicked */
  onClick?: () => void;
  /** Optional badge text rendered beside the label */
  badge?: string;
  /** Nested sub-menu items */
  children?: NavItem[];
};

export type SidebarUtilityItem = {
  key: string;
  icon: React.ElementType;
  onClick?: () => void;
  label?: string;
};

export type AdminSidebarProps = {
  /** Primary navigation items (supports unlimited nesting) */
  navItems: NavItem[];
  /** Currently active item key (leaf or parent) */
  activeKey: string;
  /** Called whenever the active key changes */
  onActiveKeyChange: (key: string) => void;
  /** Optional utility icon buttons shown below the divider */
  utilityItems?: SidebarUtilityItem[];
  /** Optional user avatar / initials shown at the very bottom */
  userLabel?: string;
  /** Optional logo slot — defaults to a Compass icon */
  logo?: React.ReactNode;
};

// ─── Sub-menu node (recursive) ───────────────────────────────────────────────

function NavNode({
  item,
  activeKey,
  onActiveKeyChange,
  depth = 0,
}: {
  item: NavItem;
  activeKey: string;
  onActiveKeyChange: (key: string) => void;
  depth?: number;
}) {
  const hasChildren = (item.children?.length ?? 0) > 0;

  // A parent is "active" when it or any descendant is active
  function isDescendantActive(node: NavItem): boolean {
    if (node.key === activeKey) return true;
    return node.children?.some(isDescendantActive) ?? false;
  }

  const [open, setOpen] = useState(() => isDescendantActive(item));
  const isActive = item.key === activeKey;
  const isParentOfActive = hasChildren && isDescendantActive(item);

  function handleClick() {
    if (hasChildren) {
      setOpen((prev) => !prev);
    } else {
      item.onClick?.();
      onActiveKeyChange(item.key);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        title={item.label}
        className={cn(
          // shared
          "group flex w-full items-center gap-3 rounded-[16px] px-4 py-2.5 text-left transition duration-200",
          // depth indent (desktop only)
          depth > 0 && "lg:pl-3",
          // mobile: horizontal strip
          "min-w-[120px] text-primary-foreground/60",
          // desktop: compact icon-only (unless sub-menu is open)
          "lg:min-w-0 lg:justify-center lg:px-0",
          // active / parent-of-active
          (isActive || (!hasChildren && isParentOfActive)) &&
            "bg-primary-foreground/20 text-primary-foreground",
          isParentOfActive && hasChildren && "text-primary-foreground",
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {/* Label: always visible on mobile, hidden on desktop */}
        <span className="flex-1 text-sm lg:hidden">{item.label}</span>
        {item.badge && (
          <span className="rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground lg:hidden">
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-primary-foreground/40 transition-transform duration-200 lg:hidden",
              open && "rotate-90"
            )}
          />
        )}
      </button>

      {/* Sub-menu — only shown on mobile (desktop uses tooltip popover pattern) */}
      {hasChildren && open && (
        <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-primary-foreground/20 pl-2 lg:hidden">
          {item.children!.map((child) => (
            <NavNode
              key={child.key}
              item={child}
              activeKey={activeKey}
              onActiveKeyChange={onActiveKeyChange}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function AdminSidebar({
  navItems,
  activeKey,
  onActiveKeyChange,
  utilityItems,
  userLabel,
  logo,
}: AdminSidebarProps) {
  return (
    <div className="flex flex-row gap-3 lg:sticky lg:top-5 lg:self-start lg:flex-col">
      <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto rounded-[24px] bg-primary p-2 shadow-lg lg:h-[calc(100dvh-2.5rem)] lg:min-h-0 lg:w-[72px] lg:flex-col lg:items-center lg:overflow-y-auto lg:overflow-x-hidden">
        {/* Logo */}
        <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[18px] border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground lg:h-10 lg:w-10 lg:rounded-[14px]">
          {logo ?? <Compass className="h-4 w-4" />}
        </div>

        {/* Primary nav */}
        {navItems.map((item) => (
          <NavNode
            key={item.key}
            item={item}
            activeKey={activeKey}
            onActiveKeyChange={onActiveKeyChange}
          />
        ))}

        {/* Divider (desktop only) */}
        {utilityItems && utilityItems.length > 0 && (
          <div className="hidden h-px w-8 bg-primary-foreground/20 lg:block" />
        )}

        {/* Utility icons */}
        {utilityItems?.map((util) => (
          <button
            key={util.key}
            type="button"
            title={util.label}
            onClick={util.onClick}
            className="hidden h-8 w-8 items-center justify-center rounded-[10px] text-primary-foreground/65 transition hover:bg-primary-foreground/15 hover:text-primary-foreground lg:flex"
          >
            <util.icon className="h-3.5 w-3.5" />
          </button>
        ))}

        {/* User / avatar slot */}
        {userLabel && (
          <div className="hidden lg:mt-auto lg:flex lg:flex-col lg:items-center lg:gap-2 lg:pb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/30 bg-secondary text-[10px] font-semibold text-foreground">
              {userLabel}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
