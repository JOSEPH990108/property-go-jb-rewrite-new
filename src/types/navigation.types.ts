// src/types/navigation.types.ts
// Types for navigation menus, sidebars, and profile dropdowns.

import type { LucideIcon } from "lucide-react";

/** A top-level navigation menu item shown in the fullscreen overlay. */
export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  /** Absolute URL for the background image shown on hover. */
  image: string;
  description: string;
}

/** An entry in the profile dropdown menu. */
export interface NavProfileOption {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

/** Generic sidebar/menu item supporting optional nested children. */
export interface SidebarMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  children?: SidebarMenuItem[];
  badge?: string | number;
}
