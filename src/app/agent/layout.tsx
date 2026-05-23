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

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/signin");

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    with: { role: true },
  });

  const roleCode = dbUser?.role?.code;
  if (!roleCode || !ALLOWED_ROLES.includes(roleCode)) redirect("/");

  const initials =
    dbUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "AG";

  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar */}
      <aside className="border-border bg-card/50 flex w-60 shrink-0 flex-col border-r">
        {/* Logo */}
        <div className="border-border border-b px-5 py-5">
          <Link href="/" className="group flex items-center gap-2">
            <span className="from-primary to-accent flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm">
              <Home className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-wide">
              PROPERTY<span className="text-primary">GO</span>JB
            </span>
          </Link>
          <p className="text-muted-foreground mt-1 pl-10 text-xs">Agent Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/10 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-border border-t p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{dbUser?.name}</p>
              <p className="text-muted-foreground text-xs capitalize">
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
