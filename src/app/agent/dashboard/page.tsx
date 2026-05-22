import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, QrCode, Users, TrendingUp, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";

const STAT_CARDS = [
  { label: "Appointments", value: "—", icon: Calendar, href: "/appointments" },
  { label: "QR Scans Today", value: "—", icon: QrCode, href: "/agent/scan" },
  { label: "Referrals", value: "—", icon: Users, href: "#" },
  { label: "Conversion Rate", value: "—", icon: TrendingUp, href: "#" },
];

const QUICK_ACTIONS = [
  { label: "Scan QR Code", href: "/agent/scan", icon: QrCode, primary: true },
  { label: "View Appointments", href: "/appointments", icon: Calendar, primary: false },
  { label: "Browse Projects", href: "/projects", icon: TrendingUp, primary: false },
];

export default async function AgentDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/signin");

  const firstName = session.user.name?.split(" ")[0] ?? "Agent";

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here&apos;s your activity overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group p-5 rounded-xl border border-border bg-card hover:border-accent/50 hover:shadow-md transition-all duration-200"
          >
            <stat.icon className="h-5 w-5 text-muted-foreground mb-3 group-hover:text-accent transition-colors" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={
                action.primary
                  ? "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  : "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:border-accent/50 hover:bg-accent/5 transition-colors"
              }
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-muted-foreground text-sm">
          More agent tools are coming soon.{" "}
          <Link href="/projects" className="text-primary font-medium inline-flex items-center gap-1 hover:underline">
            Browse projects <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
