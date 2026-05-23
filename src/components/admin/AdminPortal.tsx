"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { motion, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  ChevronRight,
  HardHat,
  LayoutDashboard,
  Plus,
  Settings,
  Sparkles,
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
import {
  AgentListCard,
  DeveloperListCard,
  MiniPropertyRow,
  PropertyCard,
} from "@/components/admin/portal/EntityListCards";
import {
  AgentInspector,
  DeveloperInspector,
  MiniMetric,
  PropertyInspector,
} from "@/components/admin/portal/EntityInspectors";
import {
  AgentFormFields,
  DeveloperFormFields,
  PropertyFormFields,
  type AgentFormState,
  type DeveloperFormState,
  type PropertyFormState,
} from "@/components/admin/forms/AdminPortalFormFields";
import {
  AdminSidebar,
  type NavItem,
  type SidebarUtilityItem,
} from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilterChip } from "@/components/shared/FilterChip";
import { FilterToolbar } from "@/components/shared/FilterToolbar";
import { SearchField } from "@/components/shared/SearchField";
import { StateBlock } from "@/components/shared/StateBlock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { cn } from "@/lib/utils";

type Props = {
  data: AdminDashboardData;
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

const railUtilityIcons = [Home, Share2, Link2, Globe, Ellipsis];

const workspaceChips = [
  "Teams",
  "Users",
  "Subscription",
  "Payment",
  "Installed Apps",
  "Variables",
  "Scenario Properties",
];

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
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
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
      note: agents.length
        ? `${Math.round((withRen / agents.length) * 100)}% with REN`
        : "No agents yet",
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

function getDeveloperFormFromRow(
  row: AdminDashboardData["lookups"]["developers"][number],
): DeveloperFormState {
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
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    data.properties[0]?.id ?? null,
  );
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(data.agents[0]?.id ?? null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [developerDialogOpen, setDeveloperDialogOpen] = useState(false);
  const [propertyForm, setPropertyForm] = useState<PropertyFormState>(() =>
    makeDefaultPropertyForm(data),
  );
  const [agentForm, setAgentForm] = useState<AgentFormState>(() => makeDefaultAgentForm());
  const [developerForm, setDeveloperForm] = useState<DeveloperFormState>(() =>
    makeDefaultDeveloperForm(),
  );
  const [developerQuery, setDeveloperQuery] = useState("");
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string | null>(
    data.lookups.developers[0]?.id ?? null,
  );
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
    [],
  );
  const agentInsights = useMemo(() => buildAgentInsight(agents), [agents]);
  const portfolioMix = useMemo(() => buildPortfolioMix(properties), [properties]);
  const totalUnits = useMemo(
    () => properties.reduce((sum, item) => sum + (item.totalUnits ?? 0), 0),
    [properties],
  );
  const publishedCount = useMemo(
    () => properties.filter((item) => item.isPublished).length,
    [properties],
  );

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

  const selectedProperty =
    filteredProperties.find((property) => property.id === selectedPropertyId) ??
    filteredProperties[0] ??
    null;
  const selectedAgent =
    filteredAgents.find((agent) => agent.id === selectedAgentId) ?? filteredAgents[0] ?? null;
  const selectedDeveloper =
    filteredDevelopers.find((developer) => developer.id === selectedDeveloperId) ??
    filteredDevelopers[0] ??
    null;

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

      const result = agentForm.id
        ? await updateAgent(agentForm.id, payload)
        : await createAgent(payload);
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
    <div className="bg-muted text-foreground min-h-screen px-3 py-3 sm:px-5 lg:px-6">
      <div className="border-border bg-card relative mx-auto min-h-[calc(100vh-1.5rem)] max-w-[1500px] rounded-[34px] border shadow-lg">
        {/* Decorative blobs clipped to the card, isolated from sticky layout */}
        <div className="pointer-events-none absolute inset-0 overflow-clip rounded-[34px]">
          <div className="bg-gradient-subtle absolute inset-0" />
          <div className="bg-accent/15 absolute top-0 left-[27%] h-56 w-56 rounded-full blur-3xl" />
          <div className="bg-primary/5 absolute right-[-2rem] bottom-[-4rem] h-64 w-64 rounded-full blur-3xl" />
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

            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TabKey)}
              className="flex flex-1 flex-col gap-4"
            >
              <TabsList className="border-border bg-card/70 h-auto w-full justify-start gap-1.5 rounded-[18px] border p-1.5 backdrop-blur">
                {dashboardTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[12px] px-4 py-2 text-sm data-[state=active]:shadow-md"
                  >
                    <tab.icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="border-border bg-card/70 flex flex-wrap gap-2 rounded-[20px] border p-2">
                {workspaceChips.map((chip, index) => (
                  <span
                    key={chip}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium",
                      index === 0
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-secondary-foreground",
                    )}
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <TabsContent value="overview" className="mt-0 flex-1">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={workspaceAnimation}
                  className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]"
                >
                  <Card className="border-border bg-card/95 overflow-hidden rounded-[28px] border shadow-md backdrop-blur">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <Badge className="bg-primary text-primary-foreground hover:bg-primary mb-3 rounded-full px-3 py-1 text-[11px] tracking-[0.22em] uppercase">
                            Workflow Cockpit
                          </Badge>
                          <h1 className="font-lato text-foreground max-w-[12ch] text-[clamp(2.2rem,4vw,4.4rem)] leading-[0.95] font-semibold tracking-[-0.06em]">
                            Managing Your Team and Property Workflows
                          </h1>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="border-border bg-secondary text-foreground hover:bg-accent rounded-full border shadow-none"
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
                        <SurfaceCard
                          title="Statistics"
                          description="Operations and transfer activity signals in one compact graph."
                        >
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
                    <SurfaceCard
                      title="Command stack"
                      description="Shortcuts for high-frequency admin actions."
                    >
                      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                        {quickLinks.map((link) => (
                          <ActionCard key={link.title} {...link} />
                        ))}
                      </div>
                    </SurfaceCard>

                    <SurfaceCard
                      title="Field coverage"
                      description="Operational completeness across the sales roster."
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        {agentInsights.map((item) => (
                          <MiniMetric key={item.label} {...item} />
                        ))}
                      </div>
                    </SurfaceCard>

                    <SurfaceCard
                      title="Recently visible"
                      description="Quick-access records worth checking before the next launch cycle."
                    >
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
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={workspaceAnimation}
                  className="grid gap-4 xl:grid-cols-[1fr_340px]"
                >
                  <SurfaceCard
                    title="Project portfolio"
                    description="Properties grouped by developer. Click a card to inspect or edit."
                  >
                    <FilterToolbar
                      className="mb-4"
                      search={
                        <SearchField
                          value={propertyQuery}
                          placeholder="Search properties, areas, developers, slugs..."
                          onChange={setPropertyQuery}
                          inputClassName="border-border bg-card h-11 rounded-full pl-11 text-sm shadow-none"
                        />
                      }
                      filters={(["all", "published", "draft"] as PropertyFilter[]).map((filter) => (
                        <FilterChip
                          key={filter}
                          active={propertyFilter === filter}
                          onClick={() => setPropertyFilter(filter)}
                          className="capitalize"
                        >
                          {filter}
                        </FilterChip>
                      ))}
                      actions={
                        <Button
                          variant="outline"
                          className="border-border bg-card rounded-full px-4"
                          onClick={openNewProperty}
                        >
                          <Plus className="h-4 w-4" />
                          New Property
                        </Button>
                      }
                    />

                    <ScrollArea className="h-[680px] pr-3">
                      {propertiesByDeveloper.length ? (
                        <div className="space-y-7">
                          {propertiesByDeveloper.map(({ developerName, items }) => (
                            <div key={developerName}>
                              <div className="mb-3 flex items-center gap-2">
                                <div className="bg-primary/10 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px]">
                                  <HardHat className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-lato text-foreground text-sm font-semibold tracking-[-0.02em]">
                                  {developerName}
                                </span>
                                <span className="bg-secondary text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
                                  {items.length}
                                </span>
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
                        <StateBlock
                          title="No properties match this view"
                          description="Try clearing filters or create a new property record."
                          density="compact"
                          className="border-border bg-secondary rounded-[24px]"
                          action={{ label: "New Property", onClick: openNewProperty }}
                        />
                      )}
                    </ScrollArea>
                  </SurfaceCard>

                  <PropertyInspector
                    property={selectedProperty}
                    onEdit={
                      selectedProperty ? () => openEditProperty(selectedProperty.id) : undefined
                    }
                    onDelete={
                      selectedProperty ? () => handleDeleteProperty(selectedProperty.id) : undefined
                    }
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="agents" className="mt-0 flex-1">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={workspaceAnimation}
                  className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]"
                >
                  <SurfaceCard
                    title="Agent directory"
                    description="A dynamic roster for communications, agencies, and compliance data."
                  >
                    <FilterToolbar
                      className="mb-4"
                      search={
                        <SearchField
                          value={agentQuery}
                          placeholder="Search by agent, agency, REN, or email..."
                          onChange={setAgentQuery}
                          inputClassName="border-border bg-card h-11 rounded-full pl-11 text-sm shadow-none"
                        />
                      }
                      actions={
                        <Button
                          variant="outline"
                          className="border-border bg-card rounded-full px-4"
                          onClick={openNewAgent}
                        >
                          <Plus className="h-4 w-4" />
                          Add Agent
                        </Button>
                      }
                    />

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
                          <StateBlock
                            title="No agents match this view"
                            description="Adjust the search or add a new roster entry."
                            density="compact"
                            className="border-border bg-secondary rounded-[24px]"
                            action={{ label: "New Agent", onClick: openNewAgent }}
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
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={workspaceAnimation}
                  className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]"
                >
                  <SurfaceCard
                    title="Developer directory"
                    description="Manage property developers, legal entities, and featured flags."
                  >
                    <FilterToolbar
                      className="mb-4"
                      search={
                        <SearchField
                          value={developerQuery}
                          placeholder="Search by name, slug, legal name, or country..."
                          onChange={setDeveloperQuery}
                          inputClassName="border-border bg-card h-11 rounded-full pl-11 text-sm shadow-none"
                        />
                      }
                      actions={
                        <Button
                          variant="outline"
                          className="border-border bg-card rounded-full px-4"
                          onClick={openNewDeveloper}
                        >
                          <Plus className="h-4 w-4" />
                          Add Developer
                        </Button>
                      }
                    />

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
                          <StateBlock
                            title="No developers match this view"
                            description="Adjust the search or add a new developer entry."
                            density="compact"
                            className="border-border bg-secondary rounded-[24px]"
                            action={{ label: "New Developer", onClick: openNewDeveloper }}
                          />
                        )}
                      </div>
                    </ScrollArea>
                  </SurfaceCard>

                  <DeveloperInspector
                    developer={selectedDeveloper}
                    onEdit={
                      selectedDeveloper ? () => openEditDeveloper(selectedDeveloper.id) : undefined
                    }
                    onDelete={
                      selectedDeveloper
                        ? () => handleDeleteDeveloper(selectedDeveloper.id)
                        : undefined
                    }
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
        <DialogContent className="border-border bg-card max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-lato text-2xl tracking-[-0.04em]">
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
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary"
              disabled={isPending}
              onClick={submitProperty}
            >
              {propertyForm.id ? "Save Changes" : "Create Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-lato text-2xl tracking-[-0.04em]">
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
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary"
              disabled={isPending}
              onClick={submitAgent}
            >
              {agentForm.id ? "Save Changes" : "Create Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={developerDialogOpen} onOpenChange={setDeveloperDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-lato text-2xl tracking-[-0.04em]">
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
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary"
              disabled={isPending}
              onClick={submitDeveloper}
            >
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
      <div className="border-border/50 from-card/60 to-card/40 hover:border-border rounded-[28px] border bg-gradient-to-br p-4 shadow-md backdrop-blur-xl transition-all duration-300 hover:shadow-lg sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="from-primary to-accent h-2 w-2 rounded-full bg-gradient-to-r" />
              <span className="text-primary/80 text-xs font-semibold tracking-widest uppercase">
                Admin Dashboard
              </span>
            </div>
            <h2 className="font-lato text-foreground text-[clamp(1.75rem,3.2vw,3rem)] leading-tight font-bold tracking-[-0.04em]">
              {" "}
              {activeTab === "agents" && "Team Management"}{" "}
              {activeTab === "developer" && "Developer Network"}{" "}
              {activeTab === "properties" && "Project Portfolio"}{" "}
              {activeTab === "overview" && "Workspace Overview"}{" "}
            </h2>{" "}
            <p className="text-muted-foreground/80 mt-2 text-sm">
              {" "}
              {activeTab === "agents" &&
                "Manage your sales team, track assignments, and verify credentials."}{" "}
              {activeTab === "developer" &&
                "Oversee property developers and manage featured partnerships."}{" "}
              {activeTab === "properties" &&
                "Create, edit, and publish property listings across your portfolio."}{" "}
              {activeTab === "overview" &&
                "High-level insights and quick actions for your real estate operations."}{" "}
            </p>{" "}
          </div>{" "}
          <div className="flex items-center gap-2">
            {" "}
            <Button
              variant="outline"
              size="icon"
              className="border-border/50 bg-secondary/30 text-foreground hover:bg-secondary hover:border-border rounded-full border shadow-none transition-all"
            >
              {" "}
              <Settings className="h-4 w-4" />{" "}
            </Button>{" "}
            <Button
              className="from-primary to-accent text-primary-foreground rounded-full bg-gradient-to-r px-5 font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              onClick={scenarioAction.onClick}
            >
              {" "}
              <Plus className="mr-1.5 h-4 w-4" /> {scenarioAction.label}{" "}
            </Button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Metrics grid */}{" "}
      <div className="font-lato grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {" "}
        <MetricCard
          label="Properties"
          value={String(propertyCount)}
          note="Active listings"
          accent="blue"
        />{" "}
        <MetricCard label="Agents" value={String(agentCount)} note="Team members" accent="purple" />{" "}
        <MetricCard
          label="Developers"
          value={String(developerCount)}
          note="Partners"
          accent="green"
        />{" "}
        <MetricCard
          label="Total Records"
          value={String(propertyCount + agentCount + developerCount)}
          note="All entries"
          accent="orange"
        />{" "}
      </div>{" "}
    </div>
  );
}
function MetricCard({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent: "blue" | "purple" | "green" | "orange";
}) {
  const accentClasses = {
    blue: "from-blue-500/20 to-blue-500/5 border-blue-200/20",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-200/20",
    green: "from-green-500/20 to-green-500/5 border-green-200/20",
    orange: "from-orange-500/20 to-orange-500/5 border-orange-200/20",
  };
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-[20px] border bg-gradient-to-br p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md",
        accentClasses[accent],
      )}
    >
      {" "}
      <div className="mb-3 flex items-center justify-between">
        {" "}
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>{" "}
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            accent === "blue" && "bg-blue-500",
            accent === "purple" && "bg-purple-500",
            accent === "green" && "bg-green-500",
            accent === "orange" && "bg-orange-500",
          )}
        />{" "}
      </div>{" "}
      <div className="text-foreground mb-2 text-[2.5rem] leading-none font-bold tracking-[-0.05em]">
        {value}
      </div>{" "}
      <p className="text-muted-foreground/70 text-xs">{note}</p>{" "}
    </motion.div>
  );
}

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
    <Card
      className={cn(
        "border-border/50 from-card/60 to-card/40 hover:border-border overflow-hidden rounded-[28px] border bg-gradient-to-br shadow-md backdrop-blur-xl transition-all duration-300 hover:shadow-lg",
        className,
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-lato text-foreground text-lg font-semibold tracking-[-0.04em]">
              {title}
            </h3>
            <p className="text-muted-foreground/80 mt-1.5 text-sm leading-5">{description}</p>
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
  const operationsPercent = Math.min(
    100,
    Math.round((operationsValue / Math.max(operationsTarget, 1)) * 100),
  );
  const transferPercent = Math.min(
    100,
    Math.round((transferValue / Math.max(transferTarget, 1)) * 100),
  );

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div className="border-border bg-secondary rounded-[24px] border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-foreground text-sm font-medium">Operations</div>
          <div className="bg-card text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
            {operationsPercent}%
          </div>
        </div>
        <div className="font-lato text-foreground text-[3rem] leading-none font-semibold tracking-[-0.05em]">
          {operationsValue}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">/{operationsTarget} target</p>
        <div className="mt-4 flex items-center gap-1.5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-8 w-3 rounded-full border",
                idx < Math.round((operationsPercent / 100) * 8)
                  ? "bg-primary border-transparent"
                  : "border-border bg-transparent",
              )}
            />
          ))}
        </div>
      </div>

      <div className="border-border bg-accent/20 rounded-[24px] border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-foreground text-sm font-medium">Data Transfer</div>
          <div className="bg-card/80 text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
            {transferPercent}%
          </div>
        </div>
        <div className="font-lato text-foreground text-[3rem] leading-none font-semibold tracking-[-0.05em]">
          {transferValue}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          /{formatCompactNumber(transferVolume)} units
        </p>
        <div className="mt-4 flex items-center gap-1.5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-8 w-3 rounded-full border",
                idx < Math.round((transferPercent / 100) * 8)
                  ? "border-accent/50 bg-accent"
                  : "border-border bg-secondary/50",
              )}
            />
          ))}
        </div>
      </div>

      <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-[24px] p-4">
        <div className="bg-accent/35 absolute -top-10 -right-10 h-36 w-36 rounded-full blur-2xl" />
        <div className="relative">
          <div className="text-primary-foreground/60 text-[11px] tracking-[0.2em] uppercase">
            Automation
          </div>
          <h4 className="font-lato mt-2 max-w-[15ch] text-2xl leading-[1.05] font-semibold tracking-[-0.04em]">
            Take your automation to the next level
          </h4>
          <Button
            className="bg-primary-foreground text-primary hover:bg-primary-foreground mt-5 rounded-full px-4"
            onClick={onScenario}
          >
            Upgrade
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function PortfolioMixChart({
  rows,
}: {
  rows: Array<{ label: string; value: number; width: string }>;
}) {
  if (!rows.length) {
    return <EmptyChartState message="No portfolio mix data yet." />;
  }

  const displayRows = [...rows];
  while (displayRows.length < 6) {
    displayRows.push({ label: `slot-${displayRows.length + 1}`, value: 0, width: "0%" });
  }

  return (
    <div className="border-border bg-secondary rounded-[24px] border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="space-y-1">
          <div className="font-lato text-foreground text-sm font-semibold">Statistics</div>
          <div className="text-muted-foreground flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1">
              <span className="bg-primary h-2 w-2 rounded-full" /> Operations
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="bg-accent h-2 w-2 rounded-full" /> Data transfer
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-border bg-card text-muted-foreground rounded-full px-3 py-1 text-xs"
        >
          2026
        </Badge>
      </div>

      <div className="grid grid-cols-6 items-end gap-3">
        {displayRows.map((row, index) => {
          if (row.value === 0) {
            return (
              <div key={row.label} className="space-y-2 text-center">
                <div className="border-border mx-auto h-44 w-10 rounded-full border border-dashed bg-transparent" />
                <div className="text-muted-foreground/50 text-[10px] tracking-[0.18em] uppercase">
                  -
                </div>
                <div className="text-muted-foreground/50 text-xs font-medium">0</div>
              </div>
            );
          }

          const percent = Number.parseInt(row.width, 10);
          const limeHeight = Math.max(8, Math.round(percent * 0.42));
          const darkHeight = Math.max(10, percent - limeHeight);

          return (
            <div key={row.label} className="space-y-2 text-center">
              <div className="border-border bg-muted mx-auto flex h-44 w-10 items-end rounded-full border p-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(14, percent)}%` }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
                  className="relative w-full overflow-hidden rounded-full"
                >
                  <div
                    className="bg-accent absolute bottom-0 w-full"
                    style={{ height: `${limeHeight}%` }}
                  />
                  <div
                    className="bg-primary absolute top-0 w-full"
                    style={{ height: `${darkHeight}%` }}
                  />
                </motion.div>
              </div>
              <div className="text-muted-foreground text-[10px] tracking-[0.18em] uppercase">
                {row.label.slice(0, 6)}
              </div>
              <div className="text-foreground/70 text-xs font-medium">{row.value}</div>
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
    <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-[28px] p-5">
      <div className="bg-radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_55%) absolute inset-y-0 right-0 w-1/2" />
      <div className="relative">
        <div className="text-primary-foreground/70 mb-3 flex items-center gap-2 text-xs tracking-[0.22em] uppercase">
          <Rocket className="h-4 w-4" />
          Scenario acceleration
        </div>
        <h3 className="font-lato max-w-[12ch] text-3xl leading-[1.02] font-semibold tracking-[-0.05em]">
          {title}
        </h3>
        <p className="text-primary-foreground/80 mt-3 max-w-sm text-sm leading-6">{description}</p>
        <Button
          className="bg-primary-foreground text-primary hover:bg-primary-foreground mt-6 rounded-full px-4"
          onClick={onAction}
        >
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
    <div className="border-border bg-secondary rounded-[24px] border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <h4 className="font-lato text-foreground text-sm font-semibold">{title}</h4>
      <p className="text-muted-foreground mt-1 text-sm leading-6">{description}</p>
      <div className="mt-4">
        {customAction ?? (
          <Button
            variant="outline"
            className="border-border bg-card rounded-full px-4"
            onClick={onClick}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="border-border bg-secondary text-muted-foreground rounded-[24px] border border-dashed p-6 text-sm">
      {message}
    </div>
  );
}
