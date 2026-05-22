import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Home, Calendar, QrCode, BarChart3, Building2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"];

const NAV_ITEMS = [
  { label: "Dashboard", href: "/agent/dashboard", icon: BarChart3 },
  { label: "Appointments", href: "/appointments", icon: Calendar },
  { label: "Scan QR", href: "/agent/scan", icon: QrCode },
  { label: "Projects", href: "/projects", icon: Building2 },
];

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/signin");

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    with: { role: true },
  });

  const roleCode = dbUser?.role?.code;
  if (!roleCode || !ALLOWED_ROLES.includes(roleCode)) redirect("/");

  const initials = dbUser?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "AG";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-card/50 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-sm">
              <Home className="h-4 w-4" />
            </span>
            <span className="font-semibold text-sm tracking-wide">
              PROPERTY<span className="text-primary">GO</span>JB
            </span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1 pl-10">Agent Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{dbUser?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {roleCode.toLowerCase().replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
