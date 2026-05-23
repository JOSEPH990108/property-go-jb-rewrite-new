"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  createFullProject,
  type DropdownOptions,
  type ProjectFormData,
  type PhaseRow,
  type TowerRow,
  type LayoutRow,
  type FacingGroupRow,
  type StackRow,
  type SpecialFloorRow,
  type SalesPackageRow,
  type NearbyPlaceRow,
  type PricingSnapshotRow,
  type CreateFullProjectInput,
} from "@/app/actions/project-setup-actions";
import { Step1Project } from "./Step1Project";
import { Step2Phases } from "./Step2Phases";
import { Step3Towers } from "./Step3Towers";
import { Step4Layouts } from "./Step4Layouts";
import { Step5TowerConfig } from "./Step5TowerConfig";
import { Step6SalesPackages } from "./Step6SalesPackages";
import { Step7NearbyPlaces } from "./Step7NearbyPlaces";
import { Step8Pricing } from "./Step8Pricing";
import { Step9Review } from "./Step9Review";

// ── Step meta ────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Project" },
  { label: "Phases" },
  { label: "Towers" },
  { label: "Layouts" },
  { label: "Tower Config" },
  { label: "Packages" },
  { label: "Nearby" },
  { label: "Pricing" },
  { label: "Review" },
];

// ── Default state ────────────────────────────────────────────────────────────

const defaultProject = (): ProjectFormData => ({
  slug: "",
  name: "",
  displayName: "",
  legalName: "",
  description: "",
  developerId: "",
  propertyCategoryId: "",
  propertyTypeId: "",
  projectStatusId: "",
  tenureTypeId: "",
  titleTypeId: "",
  regionId: "",
  areaId: "",
  address: "",
  latitude: "",
  longitude: "",
  landAreaAcres: "",
  bookingFee: "1000",
  bookingFeeBumi: "",
  maintenanceFeePerSqft: "",
  sinkingFundPerSqft: "",
  isForeignerEligible: true,
  isGatedCommunity: false,
  isHotDeal: false,
  isPublished: false,
  greenCertification: "",
  totalUnits: "",
  launchYear: "",
});

// ── Props ────────────────────────────────────────────────────────────────────

type Props = {
  options: DropdownOptions;
};

// ── Wizard ───────────────────────────────────────────────────────────────────

export function ProjectWizard({ options }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Wizard state
  const [project, setProject] = useState<ProjectFormData>(defaultProject);
  const [phases, setPhases] = useState<PhaseRow[]>([]);
  const [towers, setTowers] = useState<TowerRow[]>([]);
  const [layouts, setLayouts] = useState<LayoutRow[]>([]);
  const [facingGroups, setFacingGroups] = useState<FacingGroupRow[]>([]);
  const [stacks, setStacks] = useState<StackRow[]>([]);
  const [specialFloors, setSpecialFloors] = useState<SpecialFloorRow[]>([]);
  const [salesPackages, setSalesPackages] = useState<SalesPackageRow[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlaceRow[]>([]);
  const [pricingSnapshots, setPricingSnapshots] = useState<PricingSnapshotRow[]>([]);

  const wizardData: CreateFullProjectInput = {
    project,
    phases,
    towers,
    layouts,
    facingGroups,
    stacks,
    specialFloors,
    salesPackages,
    nearbyPlaces,
    pricingSnapshots,
  };

  function handleSubmit() {
    startTransition(async () => {
      const result = await createFullProject(wizardData);
      if (result.success) {
        toast.success("Project created successfully!");
        router.push(`/admin/tables/projects`);
      } else {
        toast.error(result.error);
      }
    });
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div>
      {/* ── Progress header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#090d1a] px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/40 uppercase">
              New Project Wizard
            </p>
            <p className="text-lg font-semibold text-white">
              Step {step + 1} — {STEPS[step].label}
            </p>
          </div>
          <p className="text-sm text-white/40">
            {step + 1} / {STEPS.length}
          </p>
        </div>

        <Progress value={progress} className="[&>div]:bg-primary h-1.5 bg-white/10" />

        {/* Step pills */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={
                "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors " +
                (i === step
                  ? "bg-primary text-white"
                  : i < step
                    ? "bg-primary/20 text-primary"
                    : "bg-white/5 text-white/40")
              }
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Step content ────────────────────────────────────────────────── */}
      <div>
        <div className="mx-auto max-w-5xl px-6 py-8">
          {step === 0 && <Step1Project data={project} onChange={setProject} options={options} />}
          {step === 1 && <Step2Phases rows={phases} onChange={setPhases} options={options} />}
          {step === 2 && <Step3Towers rows={towers} onChange={setTowers} phases={phases} />}
          {step === 3 && <Step4Layouts rows={layouts} onChange={setLayouts} />}
          {step === 4 && (
            <Step5TowerConfig
              towers={towers}
              layouts={layouts}
              facingGroups={facingGroups}
              stacks={stacks}
              specialFloors={specialFloors}
              onFacingGroupsChange={setFacingGroups}
              onStacksChange={setStacks}
              onSpecialFloorsChange={setSpecialFloors}
            />
          )}
          {step === 5 && (
            <Step6SalesPackages
              rows={salesPackages}
              onChange={setSalesPackages}
              options={options}
            />
          )}
          {step === 6 && <Step7NearbyPlaces rows={nearbyPlaces} onChange={setNearbyPlaces} />}
          {step === 7 && (
            <Step8Pricing
              rows={pricingSnapshots}
              onChange={setPricingSnapshots}
              phases={phases}
              towers={towers}
              layouts={layouts}
              options={options}
            />
          )}
          {step === 8 && (
            <Step9Review data={wizardData} onSubmit={handleSubmit} isSubmitting={isPending} />
          )}
        </div>
      </div>

      {/* ── Navigation footer ───────────────────────────────────────────── */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-white/10 bg-[#090d1a] px-6 py-4">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="border-white/10 bg-transparent text-white/70 hover:text-white"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        {step < STEPS.length - 1 && (
          <Button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
