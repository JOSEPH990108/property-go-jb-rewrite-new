export type UnitStatus = "available" | "reserved" | "sold";

export type UnitNode = {
  unitCode: string;
  status: UnitStatus;
  lotSize: string;
  facing: string;
  spaPrice: number;
};

export type TowerFloor = {
  floor: number;
  units: UnitNode[];
};

export type ProjectTower = {
  towerId: string;
  towerLabel: string;
  floors: TowerFloor[];
};

export type UnitLayoutProject = {
  slug: string;
  name: string;
  location: string;
  description: string;
  source: {
    verifiedTowerBreakdown: boolean;
    notes: string[];
  };
  towers: ProjectTower[];
};

const STATUS_CYCLE: UnitStatus[] = ["available", "reserved", "sold", "available", "available"];

function makeFloorUnits(
  towerPrefix: string,
  floor: number,
  count: number,
  lotSizeFrom: number,
  lotSizeStep: number,
  spaFrom: number,
  spaStep: number,
): UnitNode[] {
  const facings = ["North", "South", "East", "West", "North-east", "South-west"];

  return Array.from({ length: count }, (_, index) => {
    const unitNo = String(index + 1).padStart(2, "0");
    const size = lotSizeFrom + index * lotSizeStep;
    const status = STATUS_CYCLE[(floor + index) % STATUS_CYCLE.length];

    return {
      unitCode: `${towerPrefix}-${String(floor).padStart(2, "0")}-${unitNo}`,
      status,
      lotSize: `${size.toLocaleString()} sq. ft`,
      facing: facings[(floor + index) % facings.length],
      spaPrice: spaFrom + index * spaStep,
    };
  });
}

function makeTower(
  towerId: string,
  towerLabel: string,
  floorStart: number,
  floorEnd: number,
  unitsPerFloor: (floor: number) => number,
  lotSizeFrom: number,
  lotSizeStep: number,
  spaFrom: number,
  spaStep: number,
): ProjectTower {
  const floors = Array.from({ length: floorEnd - floorStart + 1 }, (_, idx) => floorStart + idx)
    .reverse()
    .map((floor) => ({
      floor,
      units: makeFloorUnits(
        towerId,
        floor,
        unitsPerFloor(floor),
        lotSizeFrom,
        lotSizeStep,
        spaFrom,
        spaStep,
      ),
    }));

  return {
    towerId,
    towerLabel,
    floors,
  };
}

export const unitLayoutProjects: UnitLayoutProject[] = [
  {
    slug: "sunway-lakehills",
    name: "Sunway LakeHills",
    location: "Taman Molek, Johor",
    description: "Project-level unit availability planning with tower-sensitive layouts.",
    source: {
      verifiedTowerBreakdown: false,
      notes: [
        "Verified online: public listing includes Sunway LakeHills location, size range 694-2,076 sq.ft, and price from RM551,000.",
        "Tower-by-floor and exact unit mix were not publicly verifiable from accessible pages.",
        "Current tower/floor/unit breakdown is an internal placeholder model for UI and workflow testing.",
      ],
    },
    towers: [
      makeTower("A", "Tower A", 8, 32, () => 8, 720, 38, 551000, 12500),
      makeTower(
        "B",
        "Tower B",
        6,
        26,
        (floor) => (floor % 2 === 0 ? 7 : 6),
        740,
        42,
        568000,
        13200,
      ),
      makeTower("C", "Tower C", 5, 20, (floor) => (floor > 12 ? 5 : 6), 780, 46, 595000, 14100),
    ],
  },
  {
    slug: "riverhaus",
    name: "Riverhaus",
    location: "Johor Bahru",
    description: "Compact matrix example with two towers and distinct floor densities.",
    source: {
      verifiedTowerBreakdown: false,
      notes: ["Internal mock data used for demonstrating project-specific tower structures."],
    },
    towers: [
      makeTower("R1", "Riverhaus Tower 1", 10, 30, () => 6, 1080, 30, 798000, 9800),
      makeTower(
        "R2",
        "Riverhaus Tower 2",
        12,
        34,
        (floor) => (floor > 24 ? 5 : 7),
        1020,
        28,
        782000,
        9300,
      ),
    ],
  },
];

export function deepCloneProjects(projects: UnitLayoutProject[]) {
  return JSON.parse(JSON.stringify(projects)) as UnitLayoutProject[];
}

export function randomizeProjectStatuses(project: UnitLayoutProject): UnitLayoutProject {
  const rollStatus = (): UnitStatus => {
    const roll = Math.random();
    if (roll < 0.55) return "available";
    if (roll < 0.8) return "reserved";
    return "sold";
  };

  return {
    ...project,
    towers: project.towers.map((tower) => ({
      ...tower,
      floors: tower.floors.map((floor) => ({
        ...floor,
        units: floor.units.map((unit) => ({
          ...unit,
          status: rollStatus(),
        })),
      })),
    })),
  };
}
