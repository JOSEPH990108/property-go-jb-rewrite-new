"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Building2,
  Calendar,
  CircleDollarSign,
  Contact,
  FileText,
  Gift,
  Grid2x2,
  Headset,
  Home,
  LayoutDashboard,
  Link2,
  LogOut,
  MapPin,
  MessageCircle,
  Menu,
  ReceiptText,
  Scale,
  Settings,
  ShoppingBag,
  Tag,
  Users,
  UserRoundCog,
  X,
  PlusCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminSidebarMenu, type SidebarMenuSection } from "@/components/admin/AdminSidebarMenu";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: React.ReactNode;
};

const menuSections: SidebarMenuSection[] = [
  {
    key: "main-menu",
    title: "Main Menu",
    items: [
      {
        key: "dashboard",
        label: "Dashboard",
        subtitle: "Live reporting and availability",
        icon: Grid2x2,
        href: "/admin/dashboard",
      },
      { key: "calendar", label: "Calendar", icon: Calendar, href: "/admin/calendar" },
      {
        key: "teams",
        label: "Teams",
        subtitle: "Manage agents",
        icon: Users,
        href: "/admin/agents",
      },
      { key: "activity", label: "Activity", icon: Activity, href: "/admin/activity" },
      { key: "message", label: "Message", icon: MessageCircle, href: "/admin/messages" },
      {
        key: "report",
        label: "Report",
        subtitle: "Unit availability",
        icon: LayoutDashboard,
        href: "/admin/units",
      },
    ],
  },
  {
    key: "data-lookups",
    title: "Lookups",
    items: [
      {
        key: "t-propertyCategories",
        label: "Property Categories",
        icon: Tag,
        href: "/admin/tables/propertyCategories",
      },
      {
        key: "t-propertyTypes",
        label: "Property Types",
        icon: Tag,
        href: "/admin/tables/propertyTypes",
      },
      { key: "t-tenureTypes", label: "Tenure Types", icon: Tag, href: "/admin/tables/tenureTypes" },
      { key: "t-titleTypes", label: "Title Types", icon: Tag, href: "/admin/tables/titleTypes" },
      { key: "t-lotTypes", label: "Lot Types", icon: Tag, href: "/admin/tables/lotTypes" },
      {
        key: "t-unitPositions",
        label: "Unit Positions",
        icon: Tag,
        href: "/admin/tables/unitPositions",
      },
      {
        key: "t-projectStatuses",
        label: "Project Statuses",
        icon: Tag,
        href: "/admin/tables/projectStatuses",
      },
      {
        key: "t-constructionStatuses",
        label: "Construction Statuses",
        icon: Tag,
        href: "/admin/tables/constructionStatuses",
      },
      {
        key: "t-bookingStatuses",
        label: "Booking Statuses",
        icon: Tag,
        href: "/admin/tables/bookingStatuses",
      },
      {
        key: "t-appointmentStatuses",
        label: "Appointment Statuses",
        icon: Tag,
        href: "/admin/tables/appointmentStatuses",
      },
      {
        key: "t-financingTypes",
        label: "Financing Types",
        icon: Tag,
        href: "/admin/tables/financingTypes",
      },
      { key: "t-buyerTypes", label: "Buyer Types", icon: Tag, href: "/admin/tables/buyerTypes" },
      {
        key: "t-promotionTypes",
        label: "Promotion Types",
        icon: Tag,
        href: "/admin/tables/promotionTypes",
      },
      { key: "t-amenities", label: "Amenities", icon: Tag, href: "/admin/tables/amenities" },
      { key: "t-tags", label: "Tags", icon: Tag, href: "/admin/tables/tags" },
      { key: "t-mediaTypes", label: "Media Types", icon: Tag, href: "/admin/tables/mediaTypes" },
      { key: "t-roles", label: "Roles", icon: Tag, href: "/admin/tables/roles" },
    ],
  },
  {
    key: "data-locations",
    title: "Locations",
    items: [
      { key: "t-states", label: "States", icon: MapPin, href: "/admin/tables/states" },
      { key: "t-regions", label: "Regions", icon: MapPin, href: "/admin/tables/regions" },
      { key: "t-areas", label: "Areas", icon: MapPin, href: "/admin/tables/areas" },
    ],
  },
  {
    key: "data-panels",
    title: "Professional Panels",
    items: [
      {
        key: "t-panelLawyers",
        label: "Panel Lawyers",
        icon: Scale,
        href: "/admin/tables/panelLawyers",
      },
      {
        key: "t-panelBankers",
        label: "Panel Bankers",
        icon: CircleDollarSign,
        href: "/admin/tables/panelBankers",
      },
    ],
  },
  {
    key: "data-projects",
    title: "Projects",
    items: [
      {
        key: "t-developers",
        label: "Developers",
        icon: Building2,
        href: "/admin/tables/developers",
      },
      { key: "new-project", label: "New Project", icon: PlusCircle, href: "/admin/projects/new" },
      { key: "t-projects", label: "Projects", icon: Building2, href: "/admin/tables/projects" },
      {
        key: "t-projectPhases",
        label: "Phases",
        icon: Building2,
        href: "/admin/tables/projectPhases",
      },
      {
        key: "t-projectTowers",
        label: "Towers",
        icon: Building2,
        href: "/admin/tables/projectTowers",
      },
      {
        key: "t-towerFacingGroups",
        label: "Facing Groups",
        icon: Building2,
        href: "/admin/tables/towerFacingGroups",
      },
      { key: "t-towerStacks", label: "Stacks", icon: Building2, href: "/admin/tables/towerStacks" },
      {
        key: "t-towerSpecialFloors",
        label: "Special Floors",
        icon: Building2,
        href: "/admin/tables/towerSpecialFloors",
      },
      {
        key: "t-projectLayouts",
        label: "Layouts",
        icon: Building2,
        href: "/admin/tables/projectLayouts",
      },
    ],
  },
  {
    key: "data-units",
    title: "Units",
    items: [{ key: "t-units", label: "Units", icon: Home, href: "/admin/tables/units" }],
  },
  {
    key: "data-sales",
    title: "Sales & Marketing",
    items: [
      {
        key: "t-inventoryItems",
        label: "Inventory Items",
        icon: ShoppingBag,
        href: "/admin/tables/inventoryItems",
      },
      {
        key: "t-salesPackages",
        label: "Sales Packages",
        icon: ShoppingBag,
        href: "/admin/tables/salesPackages",
      },
    ],
  },
  {
    key: "data-referrals",
    title: "Referrals",
    items: [
      {
        key: "t-giftCatalog",
        label: "Gift Catalog",
        icon: Gift,
        href: "/admin/tables/giftCatalog",
      },
      {
        key: "t-voucherCatalog",
        label: "Voucher Catalog",
        icon: Gift,
        href: "/admin/tables/voucherCatalog",
      },
      {
        key: "t-rewardConfig",
        label: "Reward Config",
        icon: Gift,
        href: "/admin/tables/rewardConfig",
      },
      {
        key: "t-referralTiers",
        label: "Referral Tiers",
        icon: Gift,
        href: "/admin/tables/referralTiers",
      },
      {
        key: "t-referralRewards",
        label: "Referral Rewards",
        icon: Gift,
        href: "/admin/tables/referralRewards",
      },
      { key: "t-redemptions", label: "Redemptions", icon: Gift, href: "/admin/tables/redemptions" },
    ],
  },
  {
    key: "data-users",
    title: "User Data",
    items: [
      { key: "t-users", label: "Users", icon: Users, href: "/admin/tables/users" },
      {
        key: "t-appointments",
        label: "Appointments",
        icon: Calendar,
        href: "/admin/tables/appointments",
      },
    ],
  },
  {
    key: "data-system",
    title: "System",
    items: [
      { key: "t-files", label: "Files", icon: FileText, href: "/admin/tables/files" },
      {
        key: "t-projectAmenities",
        label: "Project Amenities",
        icon: Link2,
        href: "/admin/tables/projectAmenities",
      },
      {
        key: "t-projectTags",
        label: "Project Tags",
        icon: Link2,
        href: "/admin/tables/projectTags",
      },
      {
        key: "t-projectBankers",
        label: "Project Bankers",
        icon: Link2,
        href: "/admin/tables/projectBankers",
      },
      {
        key: "t-packageInventory",
        label: "Package Inventory",
        icon: Link2,
        href: "/admin/tables/packageInventory",
      },
    ],
  },
  {
    key: "payments",
    title: "Payments",
    items: [
      { key: "payroll", label: "Payroll", icon: CircleDollarSign, href: "/admin/payroll" },
      { key: "billing", label: "Billing", icon: ReceiptText, href: "/admin/billing" },
      { key: "contact", label: "Contact", icon: Contact, href: "/admin/contact" },
    ],
  },
];

const utilityItems = [
  { key: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
  { key: "users", label: "User Management", icon: UserRoundCog, href: "/admin/user-management" },
  { key: "support", label: "Help & Support", icon: Headset, href: "/admin/help" },
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("admin-sidebar-collapsed") === "true";
  });

  useEffect(() => {
    window.localStorage.setItem("admin-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  return (
    <div className="bg-background text-foreground min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.14),_transparent_26%),radial-gradient(circle_at_top_right,_hsl(var(--accent)/0.12),_transparent_28%),radial-gradient(circle_at_bottom,_hsl(var(--primary)/0.1),_transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-10 dark:opacity-20" />

      <div className="relative flex min-h-screen">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="border-border bg-card/95 text-foreground fixed top-4 left-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-md lg:hidden"
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-[290px] p-2.5 transition-[width,transform] duration-300 lg:translate-x-0",
            sidebarCollapsed ? "lg:w-[96px]" : "lg:w-[290px]",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <AdminSidebarMenu
            sections={menuSections}
            utilities={utilityItems}
            activePath={pathname}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
            profile={{
              name: "Austin Martin",
              email: "austinm@gmail.com",
              avatarText: "AM",
            }}
            onNavigate={() => setMobileOpen(false)}
          />
        </aside>

        <div
          className={cn(
            "flex min-h-screen flex-1 flex-col transition-[padding] duration-300",
            sidebarCollapsed ? "lg:pl-[96px]" : "lg:pl-[290px]",
          )}
        >
          <header className="sticky top-0 z-30 px-4 pt-20 pb-4 lg:px-8 lg:pt-6">
            <div className="border-border bg-card/95 flex items-center justify-between gap-4 rounded-[28px] border px-5 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.1)] backdrop-blur-md">
              <div>
                <p className="text-primary/80 text-xs tracking-[0.3em] uppercase">Control deck</p>
                <h1 className="text-foreground text-lg font-semibold">Admin command center</h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="border-border bg-background hidden rounded-2xl border px-4 py-2 text-right sm:block">
                  <p className="text-foreground/60 text-xs tracking-[0.22em] uppercase">
                    Logged in user
                  </p>
                  <p className="text-foreground text-sm font-semibold">Admin</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/login")}
                  className="border-destructive/20 bg-destructive/10 text-destructive hover:border-destructive/35 hover:bg-destructive/15 inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-8 lg:px-8">
            <div className="border-border bg-card/90 rounded-[32px] border p-4 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
