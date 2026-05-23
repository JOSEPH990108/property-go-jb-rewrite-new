export type UnitStatus = "available" | "reserved" | "sold";

export type UnitRecord = {
  projectName: string;
  unitId: string;
  floor: number;
  status: UnitStatus;
  lotSize: string;
  facing: string;
  spaPrice: number;
};

export type AvailabilityProject = {
  name: string;
  description: string;
  units: UnitRecord[];
};

export type AgentTableRow = {
  name: string;
  email: string;
  phone: string;
  status: string;
  assignedProjects: number;
};

export type DeveloperTableRow = {
  name: string;
  headquarters: string;
  tier: string;
  featured: string;
  activeProjects: number;
};

export type ProjectTableRow = {
  name: string;
  location: string;
  status: string;
  availableUnits: number;
  completion: string;
};

export const dashboardStats = [
  { label: "Total Appointments", value: "284", delta: "+12% from last week" },
  { label: "Active Agents", value: "47", delta: "+5 new activations today" },
  { label: "Units Sold", value: "126", delta: "RM 18.4M booked this month" },
  { label: "Live Conversion", value: "38%", delta: "+4.2% performance lift" },
];

export const availabilityProjects: AvailabilityProject[] = [
  {
    name: "Riverhaus",
    description: "High-rise residential release with city-view inventory.",
    units: [
      {
        projectName: "Riverhaus",
        unitId: "RH-32-01",
        floor: 32,
        status: "available",
        lotSize: "1,205 sq. ft",
        facing: "North-east",
        spaPrice: 888000,
      },
      {
        projectName: "Riverhaus",
        unitId: "RH-32-02",
        floor: 32,
        status: "reserved",
        lotSize: "1,188 sq. ft",
        facing: "South",
        spaPrice: 874000,
      },
      {
        projectName: "Riverhaus",
        unitId: "RH-32-03",
        floor: 32,
        status: "sold",
        lotSize: "1,266 sq. ft",
        facing: "River",
        spaPrice: 932000,
      },
      {
        projectName: "Riverhaus",
        unitId: "RH-31-01",
        floor: 31,
        status: "available",
        lotSize: "1,128 sq. ft",
        facing: "North-east",
        spaPrice: 841000,
      },
      {
        projectName: "Riverhaus",
        unitId: "RH-31-02",
        floor: 31,
        status: "available",
        lotSize: "1,176 sq. ft",
        facing: "South-west",
        spaPrice: 856000,
      },
      {
        projectName: "Riverhaus",
        unitId: "RH-31-03",
        floor: 31,
        status: "reserved",
        lotSize: "1,210 sq. ft",
        facing: "River",
        spaPrice: 902000,
      },
      {
        projectName: "Riverhaus",
        unitId: "RH-30-01",
        floor: 30,
        status: "sold",
        lotSize: "1,084 sq. ft",
        facing: "North",
        spaPrice: 798000,
      },
      {
        projectName: "Riverhaus",
        unitId: "RH-30-02",
        floor: 30,
        status: "available",
        lotSize: "1,142 sq. ft",
        facing: "East",
        spaPrice: 832000,
      },
      {
        projectName: "Riverhaus",
        unitId: "RH-30-03",
        floor: 30,
        status: "reserved",
        lotSize: "1,198 sq. ft",
        facing: "South",
        spaPrice: 865000,
      },
      {
        projectName: "Riverhaus",
        unitId: "RH-29-01",
        floor: 29,
        status: "available",
        lotSize: "1,052 sq. ft",
        facing: "North-west",
        spaPrice: 776000,
      },
      {
        projectName: "Riverhaus",
        unitId: "RH-29-02",
        floor: 29,
        status: "sold",
        lotSize: "1,116 sq. ft",
        facing: "River",
        spaPrice: 824000,
      },
      {
        projectName: "Riverhaus",
        unitId: "RH-29-03",
        floor: 29,
        status: "available",
        lotSize: "1,164 sq. ft",
        facing: "South-east",
        spaPrice: 848000,
      },
    ],
  },
  {
    name: "Redhills Double Storey",
    description: "Landed homes inventory with fast booking feedback for sales teams.",
    units: [
      {
        projectName: "Redhills Double Storey",
        unitId: "RD-02-01",
        floor: 2,
        status: "available",
        lotSize: "2,420 sq. ft",
        facing: "South-west",
        spaPrice: 672000,
      },
      {
        projectName: "Redhills Double Storey",
        unitId: "RD-02-02",
        floor: 2,
        status: "reserved",
        lotSize: "2,420 sq. ft",
        facing: "South",
        spaPrice: 672000,
      },
      {
        projectName: "Redhills Double Storey",
        unitId: "RD-02-03",
        floor: 2,
        status: "sold",
        lotSize: "2,465 sq. ft",
        facing: "Park",
        spaPrice: 688000,
      },
      {
        projectName: "Redhills Double Storey",
        unitId: "RD-02-04",
        floor: 2,
        status: "available",
        lotSize: "2,465 sq. ft",
        facing: "East",
        spaPrice: 688000,
      },
      {
        projectName: "Redhills Double Storey",
        unitId: "RD-01-01",
        floor: 1,
        status: "available",
        lotSize: "2,380 sq. ft",
        facing: "Corner",
        spaPrice: 658000,
      },
      {
        projectName: "Redhills Double Storey",
        unitId: "RD-01-02",
        floor: 1,
        status: "sold",
        lotSize: "2,380 sq. ft",
        facing: "South-west",
        spaPrice: 658000,
      },
      {
        projectName: "Redhills Double Storey",
        unitId: "RD-01-03",
        floor: 1,
        status: "reserved",
        lotSize: "2,430 sq. ft",
        facing: "North",
        spaPrice: 676000,
      },
      {
        projectName: "Redhills Double Storey",
        unitId: "RD-01-04",
        floor: 1,
        status: "available",
        lotSize: "2,430 sq. ft",
        facing: "Park",
        spaPrice: 676000,
      },
    ],
  },
];

export const agentRows: AgentTableRow[] = [
  {
    name: "Alicia Tan",
    email: "alicia@propertygojb.com",
    phone: "+60 12-881 4550",
    status: "Active",
    assignedProjects: 4,
  },
  {
    name: "Jason Lim",
    email: "jason@propertygojb.com",
    phone: "+60 16-551 2204",
    status: "Onboarding",
    assignedProjects: 2,
  },
  {
    name: "Nur Aisyah",
    email: "aisyah@propertygojb.com",
    phone: "+60 19-640 8821",
    status: "Active",
    assignedProjects: 5,
  },
  {
    name: "Marcus Lee",
    email: "marcus@propertygojb.com",
    phone: "+60 14-336 9910",
    status: "Offline",
    assignedProjects: 1,
  },
];

export const developerRows: DeveloperTableRow[] = [
  {
    name: "Sunway Lakehills",
    headquarters: "Johor Bahru",
    tier: "Enterprise",
    featured: "Yes",
    activeProjects: 3,
  },
  {
    name: "Riverside Habitat",
    headquarters: "Iskandar Puteri",
    tier: "Growth",
    featured: "No",
    activeProjects: 2,
  },
  {
    name: "Crestline Developments",
    headquarters: "Skudai",
    tier: "Enterprise",
    featured: "Yes",
    activeProjects: 4,
  },
];

export const projectRows: ProjectTableRow[] = [
  {
    name: "Riverhaus",
    location: "Johor Bahru",
    status: "Launching",
    availableUnits: 6,
    completion: "Q4 2027",
  },
  {
    name: "Redhills Double Storey",
    location: "Tebrau",
    status: "Active Sales",
    availableUnits: 4,
    completion: "Q2 2026",
  },
  {
    name: "Lakefront Residences",
    location: "Bukit Indah",
    status: "Preview",
    availableUnits: 18,
    completion: "Q1 2028",
  },
];
