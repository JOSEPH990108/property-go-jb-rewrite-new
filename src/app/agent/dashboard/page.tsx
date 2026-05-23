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
    <div className="max-w-5xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Here&apos;s your activity overview.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group border-border bg-card hover:border-accent/50 rounded-xl border p-5 transition-all duration-200 hover:shadow-md"
          >
            <stat.icon className="text-muted-foreground group-hover:text-accent mb-3 h-5 w-5 transition-colors" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-muted-foreground mt-0.5 text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="border-border bg-card mb-6 rounded-xl border p-6">
        <h2 className="mb-4 font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={
                action.primary
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  : "border-border hover:border-accent/50 hover:bg-accent/5 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              }
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="border-border rounded-xl border border-dashed p-6 text-center">
        <p className="text-muted-foreground text-sm">
          More agent tools are coming soon.{" "}
          <Link
            href="/projects"
            className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
          >
            Browse projects <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
