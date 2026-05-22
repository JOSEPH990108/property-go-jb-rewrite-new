"use client";

import { Textarea } from "@/components/ui/textarea";
import type { ProjectFormData, DropdownOptions } from "@/app/actions/project-setup-actions";
import {
  FieldInput,
  FieldSelect,
  FieldSwitch,
  SectionHeading,
  SubSection,
  Field,
} from "./WizardComponents";

type Props = {
  data: ProjectFormData;
  onChange: (data: ProjectFormData) => void;
  options: DropdownOptions;
};

export function Step1Project({ data, onChange, options }: Props) {
  const set = (field: keyof ProjectFormData) => (v: string | boolean) =>
    onChange({ ...data, [field]: v });

  return (
    <div className="space-y-8">
      <SectionHeading title="Project Information" subtitle="Core identity and classification for this project." />

      <SubSection title="Basic Info">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput label="Slug" required value={data.slug} onChange={set("slug")} placeholder="e.g. m-grand-minori" />
          <FieldInput label="Name" required value={data.name} onChange={set("name")} placeholder="e.g. M Grand Minori" />
          <FieldInput label="Display Name" value={data.displayName} onChange={set("displayName")} placeholder="Short display name" />
          <FieldInput label="Legal Name" value={data.legalName} onChange={set("legalName")} placeholder="Full legal entity name" />
        </div>
        <div className="mt-4">
          <Field label="Description">
            <Textarea
              value={data.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="Project marketing description…"
              rows={3}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary/40"
            />
          </Field>
        </div>
        <div className="mt-4">
          <FieldSelect label="Developer" required value={data.developerId} onChange={set("developerId")} options={options.developers} />
        </div>
      </SubSection>

      <SubSection title="Classification">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FieldSelect label="Property Category" value={data.propertyCategoryId} onChange={set("propertyCategoryId")} options={options.propertyCategories} />
          <FieldSelect label="Property Type" value={data.propertyTypeId} onChange={set("propertyTypeId")} options={options.propertyTypes} />
          <FieldSelect label="Project Status" value={data.projectStatusId} onChange={set("projectStatusId")} options={options.projectStatuses} />
          <FieldSelect label="Tenure Type" required value={data.tenureTypeId} onChange={set("tenureTypeId")} options={options.tenureTypes} />
          <FieldSelect label="Title Type" value={data.titleTypeId} onChange={set("titleTypeId")} options={options.titleTypes} />
          <FieldInput label="Green Certification" value={data.greenCertification} onChange={set("greenCertification")} placeholder="e.g. GREENRE" />
        </div>
      </SubSection>

      <SubSection title="Location">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FieldSelect label="Region" value={data.regionId} onChange={set("regionId")} options={options.regions} />
          <FieldSelect label="Area" value={data.areaId} onChange={set("areaId")} options={options.areas} />
          <FieldInput label="Address" value={data.address} onChange={set("address")} placeholder="Full address" />
          <FieldInput label="Latitude" value={data.latitude} onChange={set("latitude")} placeholder="e.g. 1.4842" type="number" />
          <FieldInput label="Longitude" value={data.longitude} onChange={set("longitude")} placeholder="e.g. 103.7721" type="number" />
        </div>
      </SubSection>

      <SubSection title="Fees & Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FieldInput label="Land Area (Acres)" value={data.landAreaAcres} onChange={set("landAreaAcres")} placeholder="e.g. 5.99" type="number" />
          <FieldInput label="Total Units" value={data.totalUnits} onChange={set("totalUnits")} placeholder="e.g. 1733" type="number" />
          <FieldInput label="Launch Year" value={data.launchYear} onChange={set("launchYear")} placeholder="e.g. 2026" type="number" />
          <FieldInput label="Booking Fee (RM)" value={data.bookingFee} onChange={set("bookingFee")} placeholder="e.g. 1000" type="number" />
          <FieldInput label="Booking Fee Bumi (RM)" value={data.bookingFeeBumi} onChange={set("bookingFeeBumi")} placeholder="e.g. 1000" type="number" />
          <FieldInput label="Maintenance Fee (per sqft)" value={data.maintenanceFeePerSqft} onChange={set("maintenanceFeePerSqft")} placeholder="e.g. 0.40" type="number" />
          <FieldInput label="Sinking Fund (per sqft)" value={data.sinkingFundPerSqft} onChange={set("sinkingFundPerSqft")} placeholder="e.g. 0.10" type="number" />
        </div>
      </SubSection>

      <SubSection title="Flags">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FieldSwitch label="Foreigner Eligible" checked={data.isForeignerEligible} onChange={(v) => set("isForeignerEligible")(v)} />
          <FieldSwitch label="Gated Community" checked={data.isGatedCommunity} onChange={(v) => set("isGatedCommunity")(v)} />
          <FieldSwitch label="Hot Deal" checked={data.isHotDeal} onChange={(v) => set("isHotDeal")(v)} />
          <FieldSwitch label="Published" checked={data.isPublished} onChange={(v) => set("isPublished")(v)} />
        </div>
      </SubSection>
    </div>
  );
}
