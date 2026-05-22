"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { motion, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  HardHat,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  UserPlus2,
  Users,
  Rocket,
  Home,
  Share2,
  Link2,
  Globe,
  Ellipsis,
} from "lucide-react";
import {
  type AdminDashboardData,
  createAgent,
  createDeveloper,
  createProperty,
  deleteAgent,
  deleteDeveloper,
  deleteProperty,
  updateAgent,
  updateDeveloper,
  updateProperty,
} from "@/app/actions/admin-actions";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { AdminSidebar, type NavItem, type SidebarUtilityItem } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { cn } from "@/lib/utils";

type Props = {
  data: AdminDashboardData;
};

type PropertyFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  launchYear: string;
  totalUnits: string;
  isPublished: boolean;
  developerId: string;
  propertyCategoryId: string;
  propertyTypeId: string;
  projectStatusId: string;
  tenureTypeId: string;
  regionId: string;
  areaId: string;
};

type AgentFormState = {
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  agencyName: string;
  renNumber: string;
  image: string;
};

type DeveloperFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  legalName: string;
  countryCode: string;
  isFeatured: boolean;
};

type TabKey = "overview" | "properties" | "agents" | "developer";
type PropertyFilter = "all" | "published" | "draft";

const dashboardTabs: Array<{
  key: TabKey;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
}> = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "High-level portfolio signals and quick actions.",
  },
  {
    key: "properties",
    label: "Projects",
    icon: Building2,
    description: "Edit listings, publishing, metadata, and launch details.",
  },
  {
    key: "agents",
    label: "Agents",
    icon: Users,
    description: "Manage roster, ownership, and sales coverage.",
  },
  {
    key: "developer",
    label: "Developers",
    icon: HardHat,
    description: "Manage property developers, legal entities, and featured flags.",
  },
];

const utilityCards: Array<{ title: string; subtitle: string; icon: typeof MessageCircle }> = [
  { title: "Community", subtitle: "Connect with operators", icon: MessageCircle },
  { title: "Academy", subtitle: "Guides and playbooks", icon: BookOpen },
  { title: "Help Center", subtitle: "Docs and support", icon: HelpCircle },
  { title: "Partner Directory", subtitle: "Find implementation teams", icon: UserPlus2 },
  { title: "Blog", subtitle: "Latest product notes", icon: Newspaper },
  { title: "Use Cases", subtitle: "Explore proven workflow patterns", icon: Rocket },
];

const railUtilityIcons = [Home, Share2, Link2, Globe, Ellipsis];

const workspaceChips = ["Teams", "Users", "Subscription", "Payment", "Installed Apps", "Variables", "Scenario Properties"];

const workspaceAnimation: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function toNullable(input: string) {
  const trimmed = input.trim();
  return trimmed === "" ? null : trimmed;
}

function makeDefaultPropertyForm(data: AdminDashboardData): PropertyFormState {
  return {
    name: "",
    slug: "",
    description: "",
    address: "",
    launchYear: "",
    totalUnits: "",
    isPublished: false,
    developerId: data.lookups.developers[0]?.id ?? "",
    propertyCategoryId: "",
    propertyTypeId: "",
    projectStatusId: data.lookups.statuses[0]?.id ?? "",
    tenureTypeId: data.lookups.tenures[0]?.id ?? "",
    regionId: "",
    areaId: "",
  };
}

function makeDefaultAgentForm(): AgentFormState {
  return {
    name: "",
    email: "",
    phoneNumber: "",
    agencyName: "",
    renNumber: "",
    image: "",
  };
}

function makeDefaultDeveloperForm(): DeveloperFormState {
  return {
    name: "",
    slug: "",
    description: "",
    legalName: "",
    countryCode: "",
    isFeatured: false,
  };
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function metricDelta(current: number, total: number) {
  if (total <= 0) return "0% of portfolio";
  return `${Math.round((current / total) * 100)}% of portfolio`;
}

function buildPropertyInsight(properties: AdminDashboardData["properties"]) {
  const published = properties.filter((item) => item.isPublished).length;
  const draft = properties.length - published;
  const totalUnits = properties.reduce((sum, item) => sum + (item.totalUnits ?? 0), 0);
  const averageUnits = properties.length ? Math.round(totalUnits / properties.length) : 0;
  const latestLaunch = properties.reduce((max, item) => Math.max(max, item.launchYear ?? 0), 0);

  return [
    {
      label: "Portfolio",
      value: formatCompactNumber(properties.length),
      note: `${formatCompactNumber(totalUnits)} scheduled units`,
      tone: "dark" as const,
    },
    {
      label: "Published",
      value: formatCompactNumber(published),
      note: metricDelta(published, properties.length),
      tone: "lime" as const,
    },
    {
      label: "Drafts",
      value: formatCompactNumber(draft),
      note: `${draft === 0 ? "Release ready" : "Needs review before launch"}`,
      tone: "soft" as const,
    },
    {
      label: "Avg Units",
      value: formatCompactNumber(averageUnits),
      note: latestLaunch ? `Latest launch ${latestLaunch}` : "Awaiting launch data",
      tone: "soft" as const,
    },
  ];
}

function buildAgentInsight(agents: AdminDashboardData["agents"]) {
  const withAgency = agents.filter((item) => item.agencyName).length;
  const withRen = agents.filter((item) => item.renNumber).length;

  return [
    {
      label: "Roster",
      value: formatCompactNumber(agents.length),
      note: `${withAgency} assigned to agencies`,
    },
    {
      label: "Verified IDs",
      value: formatCompactNumber(withRen),
      note: agents.length ? `${Math.round((withRen / agents.length) * 100)}% with REN` : "No agents yet",
    },
  ];
}

function buildPortfolioMix(properties: AdminDashboardData["properties"]) {
  const map = new Map<string, number>();

  for (const property of properties) {
    const label = property.statusName ?? property.categoryName ?? "Unclassified";
    map.set(label, (map.get(label) ?? 0) + 1);
  }

  const entries = Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const peak = entries[0]?.value ?? 1;

  return entries.map((entry) => ({
    ...entry,
    width: `${Math.max(20, Math.round((entry.value / peak) * 100))}%`,
  }));
}

function getPropertyFormFromRow(row: AdminDashboardData["properties"][number]): PropertyFormState {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    address: row.address ?? "",
    launchYear: row.launchYear ? String(row.launchYear) : "",
    totalUnits: row.totalUnits ? String(row.totalUnits) : "",
    isPublished: Boolean(row.isPublished),
    developerId: row.developerId,
    propertyCategoryId: row.propertyCategoryId ?? "",
    propertyTypeId: row.propertyTypeId ?? "",
    projectStatusId: row.projectStatusId ?? "",
    tenureTypeId: row.tenureTypeId,
    regionId: row.regionId ?? "",
    areaId: row.areaId ?? "",
  };
}

function getAgentFormFromRow(row: AdminDashboardData["agents"][number]): AgentFormState {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phoneNumber: row.phoneNumber ?? "",
    agencyName: row.agencyName ?? "",
    renNumber: row.renNumber ?? "",
    image: row.image ?? "",
  };
}

function getDeveloperFormFromRow(row: AdminDashboardData["lookups"]["developers"][number]): DeveloperFormState {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    legalName: row.legalName ?? "",
    countryCode: row.countryCode ?? "",
    isFeatured: row.isFeatured,
  };
}

export function AdminPortal({ data }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [propertyQuery, setPropertyQuery] = useState("");
  const [agentQuery, setAgentQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilter>("all");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(data.properties[0]?.id ?? null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(data.agents[0]?.id ?? null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [developerDialogOpen, setDeveloperDialogOpen] = useState(false);
  const [propertyForm, setPropertyForm] = useState<PropertyFormState>(() => makeDefaultPropertyForm(data));
  const [agentForm, setAgentForm] = useState<AgentFormState>(() => makeDefaultAgentForm());
  const [developerForm, setDeveloperForm] = useState<DeveloperFormState>(() => makeDefaultDeveloperForm());
  const [developerQuery, setDeveloperQuery] = useState("");
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string | null>(data.lookups.developers[0]?.id ?? null);
  const [isPending, startTransition] = useTransition();

  const properties = data.properties;
  const agents = data.agents;
  const developers = data.lookups.developers;

  const toAgentSearchText = useCallback((agent: AdminDashboardData["agents"][number]) => {
    return [agent.name, agent.email, agent.phoneNumber, agent.agencyName, agent.renNumber]
      .filter(Boolean)
      .join(" ");
  }, []);

  const toDeveloperSearchText = useCallback(
    (developer: AdminDashboardData["lookups"]["developers"][number]) => {
      return [developer.name, developer.slug, developer.legalName, developer.countryCode]
        .filter(Boolean)
        .join(" ");
    },
    []
  );
  const propertyInsights = useMemo(() => buildPropertyInsight(properties), [properties]);
  const agentInsights = useMemo(() => buildAgentInsight(agents), [agents]);
  const portfolioMix = useMemo(() => buildPortfolioMix(properties), [properties]);
  const totalUnits = useMemo(() => properties.reduce((sum, item) => sum + (item.totalUnits ?? 0), 0), [properties]);
  const publishedCount = useMemo(() => properties.filter((item) => item.isPublished).length, [properties]);

  const filteredProperties = useMemo(() => {
    const query = propertyQuery.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesQuery =
        query.length === 0 ||
        [
          property.name,
          property.slug,
          property.developerName,
          property.categoryName,
          property.typeName,
          property.statusName,
          property.regionName,
          property.areaName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        propertyFilter === "all" ||
        (propertyFilter === "published" && property.isPublished) ||
        (propertyFilter === "draft" && !property.isPublished);

      return matchesQuery && matchesFilter;
    });
  }, [properties, propertyFilter, propertyQuery]);

  const filteredAgents = useSearchFilter({
    items: agents,
    query: agentQuery,
    getSearchableText: toAgentSearchText,
  });

  const filteredDevelopers = useSearchFilter({
    items: developers,
    query: developerQuery,
    getSearchableText: toDeveloperSearchText,
  });

  const selectedProperty = filteredProperties.find((property) => property.id === selectedPropertyId) ?? filteredProperties[0] ?? null;
  const selectedAgent = filteredAgents.find((agent) => agent.id === selectedAgentId) ?? filteredAgents[0] ?? null;
  const selectedDeveloper = filteredDevelopers.find((developer) => developer.id === selectedDeveloperId) ?? filteredDevelopers[0] ?? null;

  const propertiesByDeveloper = useMemo(() => {
    const map = new Map<string, { developerName: string; items: typeof filteredProperties }>();
    for (const property of filteredProperties) {
      if (!map.has(property.developerId)) {
        map.set(property.developerId, { developerName: property.developerName, items: [] });
      }
      map.get(property.developerId)!.items.push(property);
    }
    return Array.from(map.values());
  }, [filteredProperties]);

  const filteredTypeOptions = useMemo(() => {
    return data.lookups.types.filter((type) => {
      if (!propertyForm.propertyCategoryId) return true;
      return type.categoryId === propertyForm.propertyCategoryId;
    });
  }, [data.lookups.types, propertyForm.propertyCategoryId]);

  const filteredAreaOptions = useMemo(() => {
    return data.lookups.areas.filter((area) => {
      if (!propertyForm.regionId) return true;
      return area.regionId === propertyForm.regionId;
    });
  }, [data.lookups.areas, propertyForm.regionId]);

  function resetPropertyForm() {
    setPropertyForm(makeDefaultPropertyForm(data));
  }

  function resetAgentForm() {
    setAgentForm(makeDefaultAgentForm());
  }

  function openNewProperty() {
    resetPropertyForm();
    setPropertyDialogOpen(true);
  }

  function openEditProperty(id: string) {
    const target = properties.find((property) => property.id === id);
    if (!target) return;
    setPropertyForm(getPropertyFormFromRow(target));
    setPropertyDialogOpen(true);
  }

  function openNewAgent() {
    resetAgentForm();
    setAgentDialogOpen(true);
  }

  function openEditAgent(id: string) {
    const target = agents.find((agent) => agent.id === id);
    if (!target) return;
    setAgentForm(getAgentFormFromRow(target));
    setAgentDialogOpen(true);
  }

  function submitProperty() {
    startTransition(async () => {
      const payload = {
        name: propertyForm.name,
        slug: propertyForm.slug,
        description: toNullable(propertyForm.description),
        address: toNullable(propertyForm.address),
        launchYear: propertyForm.launchYear ? Number(propertyForm.launchYear) : null,
        totalUnits: propertyForm.totalUnits ? Number(propertyForm.totalUnits) : null,
        isPublished: propertyForm.isPublished,
        developerId: propertyForm.developerId,
        propertyCategoryId: toNullable(propertyForm.propertyCategoryId),
        propertyTypeId: toNullable(propertyForm.propertyTypeId),
        projectStatusId: toNullable(propertyForm.projectStatusId),
        tenureTypeId: propertyForm.tenureTypeId,
        regionId: toNullable(propertyForm.regionId),
        areaId: toNullable(propertyForm.areaId),
      };

      const result = propertyForm.id
        ? await updateProperty(propertyForm.id, payload)
        : await createProperty(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(propertyForm.id ? "Property updated" : "Property created");
      setPropertyDialogOpen(false);
      resetPropertyForm();
      router.refresh();
    });
  }

  function submitAgent() {
    startTransition(async () => {
      const payload = {
        name: agentForm.name,
        email: agentForm.email,
        phoneNumber: toNullable(agentForm.phoneNumber),
        agencyName: toNullable(agentForm.agencyName),
        renNumber: toNullable(agentForm.renNumber),
        image: toNullable(agentForm.image),
      };

      const result = agentForm.id ? await updateAgent(agentForm.id, payload) : await createAgent(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(agentForm.id ? "Agent updated" : "Agent created");
      setAgentDialogOpen(false);
      resetAgentForm();
      router.refresh();
    });
  }

  function handleDeleteProperty(id: string) {
    if (!window.confirm("Delete this property? This cannot be undone.")) return;

    startTransition(async () => {
      const result = await deleteProperty(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Property deleted");
      router.refresh();
    });
  }

  function handleDeleteAgent(id: string) {
    if (!window.confirm("Delete this agent? This cannot be undone.")) return;

    startTransition(async () => {
      const result = await deleteAgent(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Agent deleted");
      router.refresh();
    });
  }

  function resetDeveloperForm() {
    setDeveloperForm(makeDefaultDeveloperForm());
  }

  function openNewDeveloper() {
    resetDeveloperForm();
    setDeveloperDialogOpen(true);
  }

  function openEditDeveloper(id: string) {
    const target = developers.find((developer) => developer.id === id);
    if (!target) return;
    setDeveloperForm(getDeveloperFormFromRow(target));
    setDeveloperDialogOpen(true);
  }

  function submitDeveloper() {
    startTransition(async () => {
      const payload = {
        name: developerForm.name,
        slug: developerForm.slug,
        description: toNullable(developerForm.description),
        legalName: toNullable(developerForm.legalName),
        countryCode: toNullable(developerForm.countryCode),
        isFeatured: developerForm.isFeatured,
      };

      const result = developerForm.id
        ? await updateDeveloper(developerForm.id, payload)
        : await createDeveloper(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(developerForm.id ? "Developer updated" : "Developer created");
      setDeveloperDialogOpen(false);
      resetDeveloperForm();
      router.refresh();
    });
  }

  function handleDeleteDeveloper(id: string) {
    if (!window.confirm("Delete this developer? This cannot be undone.")) return;

    startTransition(async () => {
      const result = await deleteDeveloper(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Developer deleted");
      router.refresh();
    });
  }

  const quickLinks = [
    {
      title: "Launch New Property",
      description: "Start a new listing draft with prefilled defaults.",
      actionLabel: "Create",
      onClick: () => {
        setActiveTab("properties");
        openNewProperty();
      },
    },
    {
      title: "Import Portfolio",
      description: "Use bulk CSV workflows for projects, layouts, units, and more.",
      actionLabel: "Bulk Import",
      customAction: <BulkImportDialog />,
    },
    {
      title: "Add Agent",
      description: "Expand sales coverage and keep ownership clear.",
      actionLabel: "Invite",
      onClick: () => {
        setActiveTab("agents");
        openNewAgent();
      },
    },
  ];

  const sidebarNavItems: NavItem[] = dashboardTabs.map((tab) => ({
    key: tab.key,
    label: tab.label,
    icon: tab.icon,
    onClick: () => setActiveTab(tab.key),
  }));

  const sidebarUtilityItems: SidebarUtilityItem[] = railUtilityIcons.map((Icon, index) => ({
    key: String(index),
    icon: Icon,
  }));

  return (
    <div className="min-h-screen bg-muted px-3 py-3 text-foreground sm:px-5 lg:px-6">
      <div className="relative mx-auto min-h-[calc(100vh-1.5rem)] max-w-[1500px] rounded-[34px] border border-border bg-card shadow-lg">
        {/* Decorative blobs clipped to the card, isolated from sticky layout */}
        <div className="pointer-events-none absolute inset-0 overflow-clip rounded-[34px]">
          <div className="absolute inset-0 bg-gradient-subtle" />
          <div className="absolute left-[27%] top-0 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute bottom-[-4rem] right-[-2rem] h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative grid min-h-[calc(100vh-1.5rem)] gap-4 p-3 lg:grid-cols-[74px_minmax(0,1fr)] lg:p-5">
          <AdminSidebar
            navItems={sidebarNavItems}
            activeKey={activeTab}
            onActiveKeyChange={(key) => setActiveTab(key as TabKey)}
            utilityItems={sidebarUtilityItems}
            userLabel="CJ"
          />

          <div className="flex min-w-0 flex-col gap-4">
            <PortalHeader
              propertyCount={properties.length}
              agentCount={agents.length}
              developerCount={developers.length}
              activeTab={activeTab}
              onCreateProperty={openNewProperty}
              onCreateAgent={openNewAgent}
              onCreateDeveloper={openNewDeveloper}
            />

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)} className="flex flex-1 flex-col gap-4">
              <TabsList className="h-auto w-full justify-start gap-1.5 rounded-[18px] border border-border bg-card/70 p-1.5 backdrop-blur">
                {dashboardTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="rounded-[12px] px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                  >
                    <tab.icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex flex-wrap gap-2 rounded-[20px] border border-border bg-card/70 p-2">
                {workspaceChips.map((chip, index) => (
                  <span
                    key={chip}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium",
                      index === 0
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-secondary-foreground"
                    )}
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <TabsContent value="overview" className="mt-0 flex-1">
                <motion.div initial="hidden" animate="visible" variants={workspaceAnimation} className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
                  <Card className="overflow-hidden rounded-[28px] border border-border bg-card/95 shadow-md backdrop-blur">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <Badge className="mb-3 rounded-full bg-primary px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary-foreground hover:bg-primary">
                            Workflow Cockpit
                          </Badge>
                          <h1 className="max-w-[12ch] text-[clamp(2.2rem,4vw,4.4rem)] font-lato font-semibold leading-[0.95] tracking-[-0.06em] text-foreground">
                            Managing Your Team and Property Workflows
                          </h1>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full border border-border bg-secondary text-foreground shadow-none hover:bg-accent"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-5">
                        <OperationsStrip
                          operationsValue={properties.length}
                          operationsTarget={Math.max(properties.length * 2, 12)}
                          transferValue={publishedCount}
                          transferTarget={Math.max(properties.length, 8)}
                          transferVolume={totalUnits}
                          onScenario={openNewProperty}
                        />
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                        <SurfaceCard title="Statistics" description="Operations and transfer activity signals in one compact graph.">
                          <PortfolioMixChart rows={portfolioMix} />
                        </SurfaceCard>
                        <HighlightPanel
                          title="Take your automation to the next level"
                          description="Your forms already adapt by category and region. Turn that logic into repeatable high-volume workflows."
                          actionLabel="Open Property Builder"
                          onAction={() => {
                            setActiveTab("properties");
                            openNewProperty();
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4">
                    <SurfaceCard title="Command stack" description="Shortcuts for high-frequency admin actions.">
                      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                        {quickLinks.map((link) => (
                          <ActionCard key={link.title} {...link} />
                        ))}
                      </div>
                    </SurfaceCard>

                    <SurfaceCard title="Field coverage" description="Operational completeness across the sales roster.">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {agentInsights.map((item) => (
                          <MiniMetric key={item.label} {...item} />
                        ))}
                      </div>
                    </SurfaceCard>

                    <SurfaceCard title="Recently visible" description="Quick-access records worth checking before the next launch cycle.">
                      <div className="grid gap-3">
                        {properties.slice(0, 3).map((property) => (
                          <MiniPropertyRow
                            key={property.id}
                            property={property}
                            onClick={() => {
                              setActiveTab("properties");
                              setSelectedPropertyId(property.id);
                            }}
                          />
                        ))}
                      </div>
                    </SurfaceCard>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="properties" className="mt-0 flex-1">
                <motion.div initial="hidden" animate="visible" variants={workspaceAnimation} className="grid gap-4 xl:grid-cols-[1fr_340px]">
                  <SurfaceCard title="Project portfolio" description="Properties grouped by developer. Click a card to inspect or edit.">
                    <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <SearchField
                        value={propertyQuery}
                        placeholder="Search properties, areas, developers, slugs..."
                        onChange={setPropertyQuery}
                      />
                      <div className="flex flex-wrap gap-2">
                        {(["all", "published", "draft"] as PropertyFilter[]).map((filter) => (
                          <FilterChip
                            key={filter}
                            active={propertyFilter === filter}
                            onClick={() => setPropertyFilter(filter)}
                            label={filter}
                          />
                        ))}
                        <Button variant="outline" className="rounded-full border-border bg-card px-4" onClick={openNewProperty}>
                          <Plus className="h-4 w-4" />
                          New Property
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="h-[680px] pr-3">
                      {propertiesByDeveloper.length ? (
                        <div className="space-y-7">
                          {propertiesByDeveloper.map(({ developerName, items }) => (
                            <div key={developerName}>
                              <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                                  <HardHat className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-sm font-lato font-semibold tracking-[-0.02em] text-foreground">{developerName}</span>
                                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{items.length}</span>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                {items.map((property, index) => (
                                  <PropertyCard
                                    key={property.id}
                                    property={property}
                                    selected={property.id === selectedPropertyId}
                                    onSelect={() => setSelectedPropertyId(property.id)}
                                    onEdit={() => openEditProperty(property.id)}
                                    onDelete={() => handleDeleteProperty(property.id)}
                                    index={index}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="No properties match this view"
                          description="Try clearing filters or create a new property record."
                          actionLabel="New Property"
                          onAction={openNewProperty}
                        />
                      )}
                    </ScrollArea>
                  </SurfaceCard>

                  <PropertyInspector
                    property={selectedProperty}
                    onEdit={selectedProperty ? () => openEditProperty(selectedProperty.id) : undefined}
                    onDelete={selectedProperty ? () => handleDeleteProperty(selectedProperty.id) : undefined}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="agents" className="mt-0 flex-1">
                <motion.div initial="hidden" animate="visible" variants={workspaceAnimation} className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
                  <SurfaceCard title="Agent directory" description="A dynamic roster for communications, agencies, and compliance data.">
                    <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <SearchField
                        value={agentQuery}
                        placeholder="Search by agent, agency, REN, or email..."
                        onChange={setAgentQuery}
                      />
                      <Button
                        variant="outline"
                        className="rounded-full border-border bg-card px-4"
                        onClick={openNewAgent}
                      >
                        <Plus className="h-4 w-4" />
                        Add Agent
                      </Button>
                    </div>

                    <ScrollArea className="h-[620px] pr-3">
                      <div className="grid gap-3">
                        {filteredAgents.length ? (
                          filteredAgents.map((agent, index) => (
                            <AgentListCard
                              key={agent.id}
                              agent={agent}
                              selected={agent.id === selectedAgentId}
                              onSelect={() => setSelectedAgentId(agent.id)}
                              onEdit={() => openEditAgent(agent.id)}
                              onDelete={() => handleDeleteAgent(agent.id)}
                              index={index}
                            />
                          ))
                        ) : (
                          <EmptyState
                            title="No agents match this view"
                            description="Adjust the search or add a new roster entry."
                            actionLabel="New Agent"
                            onAction={openNewAgent}
                          />
                        )}
                      </div>
                    </ScrollArea>
                  </SurfaceCard>

                  <AgentInspector
                    agent={selectedAgent}
                    stats={agentInsights}
                    onEdit={selectedAgent ? () => openEditAgent(selectedAgent.id) : undefined}
                    onDelete={selectedAgent ? () => handleDeleteAgent(selectedAgent.id) : undefined}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="developer" className="mt-0 flex-1">
                <motion.div initial="hidden" animate="visible" variants={workspaceAnimation} className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
                  <SurfaceCard title="Developer directory" description="Manage property developers, legal entities, and featured flags.">
                    <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <SearchField
                        value={developerQuery}
                        placeholder="Search by name, slug, legal name, or country..."
                        onChange={setDeveloperQuery}
                      />
                      <Button
                        variant="outline"
                        className="rounded-full border-border bg-card px-4"
                        onClick={openNewDeveloper}
                      >
                        <Plus className="h-4 w-4" />
                        Add Developer
                      </Button>
                    </div>

                    <ScrollArea className="h-[620px] pr-3">
                      <div className="grid gap-3">
                        {filteredDevelopers.length ? (
                          filteredDevelopers.map((developer, index) => (
                            <DeveloperListCard
                              key={developer.id}
                              developer={developer}
                              selected={developer.id === selectedDeveloperId}
                              onSelect={() => setSelectedDeveloperId(developer.id)}
                              onEdit={() => openEditDeveloper(developer.id)}
                              onDelete={() => handleDeleteDeveloper(developer.id)}
                              index={index}
                            />
                          ))
                        ) : (
                          <EmptyState
                            title="No developers match this view"
                            description="Adjust the search or add a new developer entry."
                            actionLabel="New Developer"
                            onAction={openNewDeveloper}
                          />
                        )}
                      </div>
                    </ScrollArea>
                  </SurfaceCard>

                  <DeveloperInspector
                    developer={selectedDeveloper}
                    onEdit={selectedDeveloper ? () => openEditDeveloper(selectedDeveloper.id) : undefined}
                    onDelete={selectedDeveloper ? () => handleDeleteDeveloper(selectedDeveloper.id) : undefined}
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-card sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl tracking-[-0.04em] text-foreground font-lato">
              {propertyForm.id ? "Edit Property" : "Create Property"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Structured, reusable inputs with dynamic taxonomy and location filtering.
            </DialogDescription>
          </DialogHeader>

          <PropertyFormFields
            form={propertyForm}
            setForm={setPropertyForm}
            lookups={data.lookups}
            filteredTypes={filteredTypeOptions}
            filteredAreas={filteredAreaOptions}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setPropertyDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary" disabled={isPending} onClick={submitProperty}>
              {propertyForm.id ? "Save Changes" : "Create Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl tracking-[-0.04em] text-foreground font-lato">
              {agentForm.id ? "Edit Agent" : "Create Agent"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Reusable roster inputs for agents, agencies, and profile assets.
            </DialogDescription>
          </DialogHeader>

          <AgentFormFields form={agentForm} setForm={setAgentForm} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setAgentDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary" disabled={isPending} onClick={submitAgent}>
              {agentForm.id ? "Save Changes" : "Create Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={developerDialogOpen} onOpenChange={setDeveloperDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl tracking-[-0.04em] text-foreground font-lato">
              {developerForm.id ? "Edit Developer" : "Create Developer"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manage developer entities, legal names, and featured status.
            </DialogDescription>
          </DialogHeader>

          <DeveloperFormFields form={developerForm} setForm={setDeveloperForm} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeveloperDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary" disabled={isPending} onClick={submitDeveloper}>
              {developerForm.id ? "Save Changes" : "Create Developer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



function PortalHeader({
  propertyCount,
  agentCount,
  developerCount,
  activeTab,
  onCreateProperty,
  onCreateAgent,
  onCreateDeveloper,
}: {
  propertyCount: number;
  agentCount: number;
  developerCount: number;
  activeTab: TabKey;
  onCreateProperty: () => void;
  onCreateAgent: () => void;
  onCreateDeveloper: () => void;
}) {
  const scenarioAction =
    activeTab === "agents"
      ? { label: "Add Agent", onClick: onCreateAgent }
      : activeTab === "developer"
      ? { label: "Add Developer", onClick: onCreateDeveloper }
      : { label: "Create Property", onClick: onCreateProperty };

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-[28px] border border-border/50 bg-gradient-to-br from-card/60 to-card/40 p-4 shadow-md backdrop-blur-xl sm:p-6 transition-all duration-300 hover:shadow-lg hover:border-border">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Admin Dashboard</span>
            </div>
            <h2 className="text-[clamp(1.75rem,3.2vw,3rem)] font-lato font-bold leading-tight tracking-[-0.04em] text-foreground">               {activeTab === "agents" && "Team Management"}               {activeTab === "developer" && "Developer Network"}               {activeTab === "properties" && "Project Portfolio"}               {activeTab === "overview" && "Workspace Overview"}             </h2>             <p className="mt-2 text-sm text-muted-foreground/80">               {activeTab === "agents" && "Manage your sales team, track assignments, and verify credentials."}               {activeTab === "developer" && "Oversee property developers and manage featured partnerships."}               {activeTab === "properties" && "Create, edit, and publish property listings across your portfolio."}               {activeTab === "overview" && "High-level insights and quick actions for your real estate operations."}             </p>           </div>            <div className="flex items-center gap-2">             <Button               variant="outline"               size="icon"               className="rounded-full border border-border/50 bg-secondary/30 text-foreground shadow-none hover:bg-secondary hover:border-border transition-all"             >               <Settings className="h-4 w-4" />             </Button>             <Button               className="rounded-full bg-gradient-to-r from-primary to-accent px-5 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 font-medium"               onClick={scenarioAction.onClick}             >               <Plus className="h-4 w-4 mr-1.5" />               {scenarioAction.label}             </Button>           </div>         </div>       </div>        {/* Metrics grid */}       <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 font-lato">         <MetricCard label="Properties" value={String(propertyCount)} note="Active listings" accent="blue" />         <MetricCard label="Agents" value={String(agentCount)} note="Team members" accent="purple" />         <MetricCard label="Developers" value={String(developerCount)} note="Partners" accent="green" />         <MetricCard label="Total Records" value={String(propertyCount + agentCount + developerCount)} note="All entries" accent="orange" />       </div>     </div>   ); }  function MetricCard({ label, value, note, accent }: { label: string; value: string; note: string; accent: "blue" | "purple" | "green" | "orange" }) {   const accentClasses = {     blue: "from-blue-500/20 to-blue-500/5 border-blue-200/20",     purple: "from-purple-500/20 to-purple-500/5 border-purple-200/20",     green: "from-green-500/20 to-green-500/5 border-green-200/20",     orange: "from-orange-500/20 to-orange-500/5 border-orange-200/20",   };    return (     <motion.div whileHover={{ y: -2 }} className={cn("rounded-[20px] border bg-gradient-to-br p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md", accentClasses[accent])}>       <div className="mb-3 flex items-center justify-between">         <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>         <div className={cn("h-1.5 w-1.5 rounded-full", accent === "blue" && "bg-blue-500", accent === "purple" && "bg-purple-500", accent === "green" && "bg-green-500", accent === "orange" && "bg-orange-500")} />       </div>       <div className="mb-2 text-[2.5rem] font-bold leading-none tracking-[-0.05em] text-foreground">{value}</div>       <p className="text-xs text-muted-foreground/70">{note}</p>     </motion.div>   ); }

function SurfaceCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden rounded-[28px] border border-border/50 bg-gradient-to-br from-card/60 to-card/40 shadow-md backdrop-blur-xl hover:shadow-lg hover:border-border transition-all duration-300", className)}>
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-lato font-semibold tracking-[-0.04em] text-foreground">{title}</h3>
            <p className="mt-1.5 text-sm leading-5 text-muted-foreground/80">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function OperationsStrip({
  operationsValue,
  operationsTarget,
  transferValue,
  transferTarget,
  transferVolume,
  onScenario,
}: {
  operationsValue: number;
  operationsTarget: number;
  transferValue: number;
  transferTarget: number;
  transferVolume: number;
  onScenario: () => void;
}) {
  const operationsPercent = Math.min(100, Math.round((operationsValue / Math.max(operationsTarget, 1)) * 100));
  const transferPercent = Math.min(100, Math.round((transferValue / Math.max(transferTarget, 1)) * 100));

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-[24px] border border-border bg-secondary p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">Operations</div>
          <div className="rounded-full bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{operationsPercent}%</div>
        </div>
        <div className="text-[3rem] font-lato font-semibold leading-none tracking-[-0.05em] text-foreground">{operationsValue}</div>
        <p className="mt-1 text-xs text-muted-foreground">/{operationsTarget} target</p>
        <div className="mt-4 flex items-center gap-1.5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <span
              key={idx}
              className={cn("h-8 w-3 rounded-full border", idx < Math.round((operationsPercent / 100) * 8) ? "border-transparent bg-primary" : "border-border bg-transparent")}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-border bg-accent/20 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">Data Transfer</div>
          <div className="rounded-full bg-card/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{transferPercent}%</div>
        </div>
        <div className="text-[3rem] font-lato font-semibold leading-none tracking-[-0.05em] text-foreground">{transferValue}</div>
        <p className="mt-1 text-xs text-muted-foreground">/{formatCompactNumber(transferVolume)} units</p>
        <div className="mt-4 flex items-center gap-1.5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <span
              key={idx}
              className={cn("h-8 w-3 rounded-full border", idx < Math.round((transferPercent / 100) * 8) ? "border-accent/50 bg-accent" : "border-border bg-secondary/50")}
            />
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[24px] bg-primary p-4 text-primary-foreground">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent/35 blur-2xl" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/60">Automation</div>
          <h4 className="font-lato mt-2 max-w-[15ch] text-2xl font-semibold leading-[1.05] tracking-[-0.04em]">Take your automation to the next level</h4>
          <Button className="mt-5 rounded-full bg-primary-foreground px-4 text-primary hover:bg-primary-foreground" onClick={onScenario}>
            Upgrade
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function PortfolioMixChart({ rows }: { rows: Array<{ label: string; value: number; width: string }> }) {
  if (!rows.length) {
    return <EmptyChartState message="No portfolio mix data yet." />;
  }

  const displayRows = [...rows];
  while (displayRows.length < 6) {
    displayRows.push({ label: `slot-${displayRows.length + 1}`, value: 0, width: "0%" });
  }

  return (
    <div className="rounded-[24px] border border-border bg-secondary p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm font-lato font-semibold text-foreground">Statistics</div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Operations</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" /> Data transfer</span>
          </div>
        </div>
        <Badge variant="outline" className="rounded-full border-border bg-card px-3 py-1 text-xs text-muted-foreground">2026</Badge>
      </div>

      <div className="grid grid-cols-6 items-end gap-3">
        {displayRows.map((row, index) => {
          if (row.value === 0) {
            return (
              <div key={row.label} className="space-y-2 text-center">
                <div className="mx-auto h-44 w-10 rounded-full border border-dashed border-border bg-transparent" />
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">-</div>
                <div className="text-xs font-medium text-muted-foreground/50">0</div>
              </div>
            );
          }

          const percent = Number.parseInt(row.width, 10);
          const limeHeight = Math.max(8, Math.round(percent * 0.42));
          const darkHeight = Math.max(10, percent - limeHeight);

          return (
            <div key={row.label} className="space-y-2 text-center">
              <div className="mx-auto flex h-44 w-10 items-end rounded-full border border-border bg-muted p-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(14, percent)}%` }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
                  className="relative w-full overflow-hidden rounded-full"
                >
                  <div className="absolute bottom-0 w-full bg-accent" style={{ height: `${limeHeight}%` }} />
                  <div className="absolute top-0 w-full bg-primary" style={{ height: `${darkHeight}%` }} />
                </motion.div>
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{row.label.slice(0, 6)}</div>
              <div className="text-xs font-medium text-foreground/70">{row.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HighlightPanel({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-primary p-5 text-primary-foreground">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_55%)" />
      <div className="relative">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary-foreground/70">
          <Rocket className="h-4 w-4" />
          Scenario acceleration
        </div>
        <h3 className="font-lato max-w-[12ch] text-3xl font-semibold leading-[1.02] tracking-[-0.05em]">{title}</h3>
        <p className="mt-3 max-w-sm text-sm leading-6 text-primary-foreground/80">{description}</p>
        <Button className="mt-6 rounded-full bg-primary-foreground px-4 text-primary hover:bg-primary-foreground" onClick={onAction}>
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  actionLabel,
  onClick,
  customAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
  customAction?: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-secondary p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <h4 className="text-sm font-lato font-semibold text-foreground">{title}</h4>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-4">
        {customAction ?? (
          <Button variant="outline" className="rounded-full border-border bg-card px-4" onClick={onClick}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

function MiniMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-secondary p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-3 text-3xl font-lato font-semibold tracking-[-0.05em] text-foreground">{value}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p>
    </div>
  );
}

function MiniPropertyRow({
  property,
  onClick,
}: {
  property: AdminDashboardData["properties"][number];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-[22px] border border-border bg-secondary p-4 text-left transition duration-200 hover:bg-card"
    >
      <div>
        <div className="font-lato font-semibold text-foreground">{property.name}</div>
        <div className="mt-1 text-sm text-muted-foreground">{property.developerName}</div>
      </div>
      <Badge variant={property.isPublished ? "accent" : "outline"}>{property.isPublished ? "Published" : "Draft"}</Badge>
    </button>
  );
}

function SearchField({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full xl:max-w-md">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-full border-border bg-card pl-11 text-sm shadow-none"
      />
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm capitalize transition duration-200",
        active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent"
      )}
    >
      {label}
    </button>
  );
}

function PropertyCard({
  property,
  selected,
  onSelect,
  onEdit,
  onDelete,
  index,
}: {
  property: AdminDashboardData["properties"][number];
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2), duration: 0.24 }}
      whileHover={{ y: -4 }}
      onClick={onSelect}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-[24px] border text-left transition-all duration-300 shadow-md hover:shadow-xl",
        selected
          ? "border-primary/60 bg-gradient-to-br from-primary/15 to-primary/5 ring-2 ring-primary/30 ring-offset-2 ring-offset-card"
          : "border-border/50 bg-gradient-to-br from-card/70 to-card/40 hover:border-primary/40 backdrop-blur-sm"
      )}
    >
      {/* Image area */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/5">
        {/* SVG texture overlay */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/shape/grid-01.svg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.12] group-hover:opacity-[0.18] transition-opacity duration-300"
        />
        {/* Geometric accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-card/20" />
        {/* Gradient fade */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card/90 to-card/20 backdrop-blur-sm" />
        {/* Status badge */}
        <div className="absolute right-3 top-3 transition-transform duration-300 group-hover:scale-110">
          <Badge
            className={cn(
              "rounded-full font-semibold text-[10px] px-3 py-1 shadow-md",
              property.isPublished
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
            )}
          >
            {property.isPublished ? "Live" : "Draft"}
          </Badge>
        </div>
        {/* Category chip */}
        {property.categoryName && (
          <div className="absolute bottom-3 left-3 transition-transform duration-300 group-hover:scale-105">
            <span className="rounded-full bg-card/80 px-3 py-1.5 text-[11px] font-semibold text-foreground backdrop-blur-md border border-border/30">
              {property.categoryName}
            </span>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-lato text-[15px] font-bold leading-tight tracking-[-0.02em] text-foreground line-clamp-2">
              {property.name}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground/70 font-medium">/{property.slug}</p>
          </div>
        </div>

        {/* Metadata tags */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {property.regionName && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/50 px-2.5 py-1 backdrop-blur-sm">
              <MapPin className="h-3 w-3" />
              {property.regionName}
            </span>
          )}
          {property.totalUnits ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/50 px-2.5 py-1">
              {property.totalUnits} units
            </span>
          ) : null}
          {property.launchYear ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/50 px-2.5 py-1">
              {property.launchYear}
            </span>
          ) : null}
        </div>

        {/* Footer with actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <span className="text-xs font-medium text-muted-foreground/60">{property.statusName ?? "—"}</span>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon-sm"
                className="rounded-lg border-border/50 bg-secondary/50 hover:bg-secondary/80 shadow-none"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="destructive"
                size="icon-sm"
                className="rounded-lg shadow-none hover:shadow-md"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AgentListCard({
  agent,
  selected,
  onSelect,
  onEdit,
  onDelete,
  index,
}: {
  agent: AdminDashboardData["agents"][number];
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.18), duration: 0.24 }}
      onClick={onSelect}
      className={cn(
        "rounded-[26px] border p-4 text-left transition duration-200",
        selected ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-secondary text-foreground hover:bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-lato font-semibold tracking-[-0.03em]">{agent.name}</div>
          <div className={cn("mt-1 text-sm text-muted-foreground", selected && "text-primary-foreground/65")}>{agent.email}</div>
          <div className={cn("mt-3 flex flex-wrap gap-2 text-sm", selected ? "text-primary-foreground/72" : "text-foreground/72")}>
            <span>{agent.agencyName ?? "No agency"}</span>
            <span>•</span>
            <span>{agent.renNumber ?? "REN missing"}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selected ? "secondary" : "outline"}
            size="icon-sm"
            className={cn(selected && "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25")}
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            className="shadow-none"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.button>
  );
}

function PropertyInspector({
  property,
  onEdit,
  onDelete,
}: {
  property: AdminDashboardData["properties"][number] | null;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <SurfaceCard
      title="Property inspector"
      description="A focused detail view for the selected listing, tuned for quick QA before publishing."
      className="h-full"
    >
      {property ? (
        <div className="space-y-4">
          <div className="rounded-[28px] bg-primary p-5 text-primary-foreground">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge className="mb-3 rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary-foreground hover:bg-primary-foreground/20">
                  Selected Property
                </Badge>
                <h3 className="text-3xl font-lato font-semibold tracking-[-0.05em]">{property.name}</h3>
                <p className="mt-2 text-sm text-primary-foreground/65">/{property.slug}</p>
              </div>
              <Badge variant={property.isPublished ? "accent" : "outline"} className={cn(property.isPublished ? "" : "border-primary-foreground/30 bg-primary-foreground/15 text-primary-foreground")}>
                {property.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Developer" value={property.developerName} />
              <InspectorStat label="Launch year" value={property.launchYear ? String(property.launchYear) : "Not set"} />
              <InspectorStat label="Units" value={property.totalUnits ? String(property.totalUnits) : "Not set"} />
              <InspectorStat label="Status" value={property.statusName ?? "No status"} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile title="Taxonomy" value={`${property.categoryName ?? "No category"} / ${property.typeName ?? "No type"}`} />
            <InfoTile title="Location" value={`${property.regionName ?? "No region"} / ${property.areaName ?? "No area"}`} />
            <InfoTile title="Tenure ID" value={property.tenureTypeId} />
            <InfoTile title="Address" value={property.address ?? "Address not provided"} />
          </div>

          <div className="rounded-[24px] border border-border bg-secondary p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Description</div>
            <p className="mt-3 text-sm leading-7 text-foreground/65">{property.description ?? "No description yet."}</p>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Edit Listing
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No property selected"
          description="Choose a record from the roster to inspect its metadata and publishing state."
        />
      )}
    </SurfaceCard>
  );
}

function AgentInspector({
  agent,
  stats,
  onEdit,
  onDelete,
}: {
  agent: AdminDashboardData["agents"][number] | null;
  stats: Array<{ label: string; value: string; note: string }>;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <SurfaceCard title="Agent inspector" description="Review a roster entry and tighten contact quality in one place." className="h-full">
      {agent ? (
        <div className="space-y-4">
          <div className="rounded-[28px] bg-primary p-5 text-primary-foreground">
            <Badge className="mb-3 rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary-foreground hover:bg-primary-foreground/20">
              Selected Agent
            </Badge>
            <h3 className="text-3xl font-lato font-semibold tracking-[-0.05em]">{agent.name}</h3>
            <p className="mt-2 text-sm text-primary-foreground/65">{agent.email}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Phone" value={agent.phoneNumber ?? "Not set"} />
              <InspectorStat label="Agency" value={agent.agencyName ?? "Not set"} />
              <InspectorStat label="REN" value={agent.renNumber ?? "Missing"} />
              <InspectorStat label="Profile image" value={agent.image ? "Configured" : "Not set"} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((item) => (
              <MiniMetric key={item.label} {...item} />
            ))}
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Edit Agent
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No agent selected"
          description="Select a roster entry to review agency, REN, and communication data."
        />
      )}
    </SurfaceCard>
  );
}

function InspectorStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-primary-foreground/20 bg-primary-foreground/10 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-primary-foreground/60">{label}</div>
      <div className="mt-2 text-sm font-medium text-primary-foreground">{value}</div>
    </div>
  );
}

function InfoTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-secondary p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{title}</div>
      <div className="mt-2 text-sm font-lato font-medium leading-6 text-foreground">{value}</div>
    </div>
  );
}

function SideMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-secondary p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-lato font-semibold tracking-[-0.04em] text-foreground">{value}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-border bg-secondary p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-card text-muted-foreground">
        <CheckCircle2 className="h-5 w-5" />
      </div>
      <h4 className="mt-4 text-lg font-lato font-semibold tracking-[-0.03em] text-foreground">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button variant="outline" className="mt-4 rounded-full border-border bg-card px-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function FieldShell({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function PropertyFormFields({
  form,
  setForm,
  lookups,
  filteredTypes,
  filteredAreas,
}: {
  form: PropertyFormState;
  setForm: React.Dispatch<React.SetStateAction<PropertyFormState>>;
  lookups: AdminDashboardData["lookups"];
  filteredTypes: AdminDashboardData["lookups"]["types"];
  filteredAreas: AdminDashboardData["lookups"]["areas"];
}) {
  return (
    <div className="grid gap-5 py-2">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="Property name">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </FieldShell>
        <FieldShell label="Slug">
          <Input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
        </FieldShell>
      </div>

      <FieldShell label="Description">
        <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={5} />
      </FieldShell>

      <FieldShell label="Address">
        <Textarea value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} rows={3} />
      </FieldShell>

      <div className="grid gap-4 md:grid-cols-4">
        <FieldShell label="Launch year">
          <Input value={form.launchYear} onChange={(event) => setForm((current) => ({ ...current, launchYear: event.target.value }))} inputMode="numeric" />
        </FieldShell>
        <FieldShell label="Total units">
          <Input value={form.totalUnits} onChange={(event) => setForm((current) => ({ ...current, totalUnits: event.target.value }))} inputMode="numeric" />
        </FieldShell>
        <FieldShell label="Developer">
          <Select value={form.developerId} onValueChange={(value) => setForm((current) => ({ ...current, developerId: value }))}>
            <SelectTrigger><SelectValue placeholder="Select developer" /></SelectTrigger>
            <SelectContent>
              {lookups.developers.map((developer) => (
                <SelectItem key={developer.id} value={developer.id}>{developer.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>
        <FieldShell label="Tenure">
          <Select value={form.tenureTypeId} onValueChange={(value) => setForm((current) => ({ ...current, tenureTypeId: value }))}>
            <SelectTrigger><SelectValue placeholder="Select tenure" /></SelectTrigger>
            <SelectContent>
              {lookups.tenures.map((tenure) => (
                <SelectItem key={tenure.id} value={tenure.id}>{tenure.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FieldShell label="Category">
          <Select
            value={form.propertyCategoryId || "all"}
            onValueChange={(value) => {
              const nextValue = value === "all" ? "" : value;
              setForm((current) => ({
                ...current,
                propertyCategoryId: nextValue,
                propertyTypeId: lookups.types.some(
                  (type) => type.id === current.propertyTypeId && (!nextValue || type.categoryId === nextValue)
                )
                  ? current.propertyTypeId
                  : "",
              }));
            }}
          >
            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">None</SelectItem>
              {lookups.categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell label="Type">
          <Select value={form.propertyTypeId || "all"} onValueChange={(value) => setForm((current) => ({ ...current, propertyTypeId: value === "all" ? "" : value }))}>
            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">None</SelectItem>
              {filteredTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell label="Project status">
          <Select value={form.projectStatusId || "all"} onValueChange={(value) => setForm((current) => ({ ...current, projectStatusId: value === "all" ? "" : value }))}>
            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">None</SelectItem>
              {lookups.statuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FieldShell label="Region">
          <Select
            value={form.regionId || "all"}
            onValueChange={(value) => {
              const nextValue = value === "all" ? "" : value;
              setForm((current) => ({
                ...current,
                regionId: nextValue,
                areaId: lookups.areas.some(
                  (area) => area.id === current.areaId && (!nextValue || area.regionId === nextValue)
                )
                  ? current.areaId
                  : "",
              }));
            }}
          >
            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">None</SelectItem>
              {lookups.regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell label="Area">
          <Select value={form.areaId || "all"} onValueChange={(value) => setForm((current) => ({ ...current, areaId: value === "all" ? "" : value }))}>
            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">None</SelectItem>
              {filteredAreas.map((area) => (
                <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell label="Publish state">
          <div className="flex h-10 items-center justify-between rounded-xl border border-border bg-card px-3">
            <span className="text-sm text-muted-foreground">{form.isPublished ? "Published" : "Draft"}</span>
            <Switch checked={form.isPublished} onCheckedChange={(value) => setForm((current) => ({ ...current, isPublished: value }))} />
          </div>
        </FieldShell>
      </div>
    </div>
  );
}

function AgentFormFields({
  form,
  setForm,
}: {
  form: AgentFormState;
  setForm: React.Dispatch<React.SetStateAction<AgentFormState>>;
}) {
  return (
    <div className="grid gap-5 py-2">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="Agent name">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </FieldShell>
        <FieldShell label="Email">
          <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" />
        </FieldShell>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="Phone number">
          <Input value={form.phoneNumber} onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))} />
        </FieldShell>
        <FieldShell label="Agency name">
          <Input value={form.agencyName} onChange={(event) => setForm((current) => ({ ...current, agencyName: event.target.value }))} />
        </FieldShell>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="REN number">
          <Input value={form.renNumber} onChange={(event) => setForm((current) => ({ ...current, renNumber: event.target.value }))} />
        </FieldShell>
        <FieldShell label="Profile image URL">
          <Input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} />
        </FieldShell>
      </div>
    </div>
  );
}

function DeveloperListCard({
  developer,
  selected,
  onSelect,
  onEdit,
  onDelete,
  index,
}: {
  developer: AdminDashboardData["lookups"]["developers"][number];
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.18), duration: 0.24 }}
      onClick={onSelect}
      className={cn(
        "rounded-[26px] border p-4 text-left transition duration-200",
        selected ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-secondary text-foreground hover:bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-lato font-semibold tracking-[-0.03em]">{developer.name}</span>
            {developer.isFeatured && (
              <Badge variant="accent" className={cn(selected && "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground")}>
                Featured
              </Badge>
            )}
          </div>
          <p className={cn("mt-1 text-sm text-muted-foreground", selected && "text-primary-foreground/65")}>/{developer.slug}</p>
          <div className={cn("mt-3 flex flex-wrap gap-2 text-sm", selected ? "text-primary-foreground/72" : "text-foreground/72")}>
            <span>{developer.legalName ?? "No legal name"}</span>
            {developer.countryCode && (
              <>
                <span>•</span>
                <span>{developer.countryCode}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selected ? "secondary" : "outline"}
            size="icon-sm"
            className={cn(selected && "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25")}
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            className="shadow-none"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.button>
  );
}

function DeveloperInspector({
  developer,
  onEdit,
  onDelete,
}: {
  developer: AdminDashboardData["lookups"]["developers"][number] | null;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <SurfaceCard
      title="Developer inspector"
      description="Review developer details, legal entity, and featured status."
      className="h-full"
    >
      {developer ? (
        <div className="space-y-4">
          <div className="rounded-[28px] bg-primary p-5 text-primary-foreground">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge className="mb-3 rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary-foreground hover:bg-primary-foreground/20">
                  Selected Developer
                </Badge>
                <h3 className="text-3xl font-lato font-semibold tracking-[-0.05em]">{developer.name}</h3>
                <p className="mt-2 text-sm text-primary-foreground/65">/{developer.slug}</p>
              </div>
              {developer.isFeatured && (
                <Badge variant="accent">Featured</Badge>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Legal name" value={developer.legalName ?? "Not set"} />
              <InspectorStat label="Country" value={developer.countryCode ?? "Not set"} />
              <InspectorStat label="Featured" value={developer.isFeatured ? "Yes" : "No"} />
              <InspectorStat label="Status" value={developer.isActive ? "Active" : "Inactive"} />
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-secondary p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Description</div>
            <p className="mt-3 text-sm leading-7 text-foreground/65">{developer.description ?? "No description yet."}</p>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Edit Developer
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No developer selected"
          description="Select a developer from the directory to inspect their details."
        />
      )}
    </SurfaceCard>
  );
}

function DeveloperFormFields({
  form,
  setForm,
}: {
  form: DeveloperFormState;
  setForm: React.Dispatch<React.SetStateAction<DeveloperFormState>>;
}) {
  return (
    <div className="grid gap-5 py-2">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="Developer name">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </FieldShell>
        <FieldShell label="Slug">
          <Input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
        </FieldShell>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="Legal name">
          <Input value={form.legalName} onChange={(event) => setForm((current) => ({ ...current, legalName: event.target.value }))} />
        </FieldShell>
        <FieldShell label="Country code">
          <Input value={form.countryCode} onChange={(event) => setForm((current) => ({ ...current, countryCode: event.target.value }))} placeholder="e.g. MY" maxLength={10} />
        </FieldShell>
      </div>

      <FieldShell label="Description">
        <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} />
      </FieldShell>

      <FieldShell label="Featured">
        <div className="flex h-10 items-center justify-between rounded-xl border border-border bg-card px-3">
          <span className="text-sm text-muted-foreground">{form.isFeatured ? "Featured" : "Not featured"}</span>
          <Switch checked={form.isFeatured} onCheckedChange={(value) => setForm((current) => ({ ...current, isFeatured: value }))} />
        </div>
      </FieldShell>
    </div>
  );
}
