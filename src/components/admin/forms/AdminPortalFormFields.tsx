"use client";

import type { Dispatch, SetStateAction } from "react";
import type { AdminDashboardData } from "@/app/actions/admin-actions";
import { FieldShell } from "@/components/shared/FieldShell";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type PropertyFormState = {
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

export type AgentFormState = {
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  agencyName: string;
  renNumber: string;
  image: string;
};

export type DeveloperFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  legalName: string;
  countryCode: string;
  isFeatured: boolean;
};

type FormStateSetter<T> = Dispatch<SetStateAction<T>>;

export function PropertyFormFields({
  form,
  setForm,
  lookups,
  filteredTypes,
  filteredAreas,
}: {
  form: PropertyFormState;
  setForm: FormStateSetter<PropertyFormState>;
  lookups: AdminDashboardData["lookups"];
  filteredTypes: AdminDashboardData["lookups"]["types"];
  filteredAreas: AdminDashboardData["lookups"]["areas"];
}) {
  return (
    <div className="grid gap-5 py-2">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="Property name">
          <Input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </FieldShell>
        <FieldShell label="Slug">
          <Input
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          />
        </FieldShell>
      </div>

      <FieldShell label="Description">
        <Textarea
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
          rows={5}
        />
      </FieldShell>

      <FieldShell label="Address">
        <Textarea
          value={form.address}
          onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
          rows={3}
        />
      </FieldShell>

      <div className="grid gap-4 md:grid-cols-4">
        <FieldShell label="Launch year">
          <Input
            value={form.launchYear}
            onChange={(event) =>
              setForm((current) => ({ ...current, launchYear: event.target.value }))
            }
            inputMode="numeric"
          />
        </FieldShell>
        <FieldShell label="Total units">
          <Input
            value={form.totalUnits}
            onChange={(event) =>
              setForm((current) => ({ ...current, totalUnits: event.target.value }))
            }
            inputMode="numeric"
          />
        </FieldShell>
        <FieldShell label="Developer">
          <Select
            value={form.developerId}
            onValueChange={(value) => setForm((current) => ({ ...current, developerId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select developer" />
            </SelectTrigger>
            <SelectContent>
              {lookups.developers.map((developer) => (
                <SelectItem key={developer.id} value={developer.id}>
                  {developer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>
        <FieldShell label="Tenure">
          <Select
            value={form.tenureTypeId}
            onValueChange={(value) => setForm((current) => ({ ...current, tenureTypeId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tenure" />
            </SelectTrigger>
            <SelectContent>
              {lookups.tenures.map((tenure) => (
                <SelectItem key={tenure.id} value={tenure.id}>
                  {tenure.name}
                </SelectItem>
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
                  (type) =>
                    type.id === current.propertyTypeId &&
                    (!nextValue || type.categoryId === nextValue),
                )
                  ? current.propertyTypeId
                  : "",
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">None</SelectItem>
              {lookups.categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell label="Type">
          <Select
            value={form.propertyTypeId || "all"}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, propertyTypeId: value === "all" ? "" : value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">None</SelectItem>
              {filteredTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell label="Project status">
          <Select
            value={form.projectStatusId || "all"}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, projectStatusId: value === "all" ? "" : value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">None</SelectItem>
              {lookups.statuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
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
                  (area) =>
                    area.id === current.areaId && (!nextValue || area.regionId === nextValue),
                )
                  ? current.areaId
                  : "",
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">None</SelectItem>
              {lookups.regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell label="Area">
          <Select
            value={form.areaId || "all"}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, areaId: value === "all" ? "" : value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">None</SelectItem>
              {filteredAreas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell label="Publish state">
          <div className="border-border bg-card flex h-10 items-center justify-between rounded-xl border px-3">
            <span className="text-muted-foreground text-sm">
              {form.isPublished ? "Published" : "Draft"}
            </span>
            <Switch
              checked={form.isPublished}
              onCheckedChange={(value) =>
                setForm((current) => ({ ...current, isPublished: value }))
              }
            />
          </div>
        </FieldShell>
      </div>
    </div>
  );
}

export function AgentFormFields({
  form,
  setForm,
}: {
  form: AgentFormState;
  setForm: FormStateSetter<AgentFormState>;
}) {
  return (
    <div className="grid gap-5 py-2">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="Agent name">
          <Input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </FieldShell>
        <FieldShell label="Email">
          <Input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            type="email"
          />
        </FieldShell>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="Phone number">
          <Input
            value={form.phoneNumber}
            onChange={(event) =>
              setForm((current) => ({ ...current, phoneNumber: event.target.value }))
            }
          />
        </FieldShell>
        <FieldShell label="Agency name">
          <Input
            value={form.agencyName}
            onChange={(event) =>
              setForm((current) => ({ ...current, agencyName: event.target.value }))
            }
          />
        </FieldShell>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="REN number">
          <Input
            value={form.renNumber}
            onChange={(event) =>
              setForm((current) => ({ ...current, renNumber: event.target.value }))
            }
          />
        </FieldShell>
        <FieldShell label="Profile image URL">
          <Input
            value={form.image}
            onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
          />
        </FieldShell>
      </div>
    </div>
  );
}

export function DeveloperFormFields({
  form,
  setForm,
}: {
  form: DeveloperFormState;
  setForm: FormStateSetter<DeveloperFormState>;
}) {
  return (
    <div className="grid gap-5 py-2">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="Developer name">
          <Input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </FieldShell>
        <FieldShell label="Slug">
          <Input
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          />
        </FieldShell>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldShell label="Legal name">
          <Input
            value={form.legalName}
            onChange={(event) =>
              setForm((current) => ({ ...current, legalName: event.target.value }))
            }
          />
        </FieldShell>
        <FieldShell label="Country code">
          <Input
            value={form.countryCode}
            onChange={(event) =>
              setForm((current) => ({ ...current, countryCode: event.target.value }))
            }
            placeholder="e.g. MY"
            maxLength={10}
          />
        </FieldShell>
      </div>

      <FieldShell label="Description">
        <Textarea
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
          rows={4}
        />
      </FieldShell>

      <FieldShell label="Featured">
        <div className="border-border bg-card flex h-10 items-center justify-between rounded-xl border px-3">
          <span className="text-muted-foreground text-sm">
            {form.isFeatured ? "Featured" : "Not featured"}
          </span>
          <Switch
            checked={form.isFeatured}
            onCheckedChange={(value) => setForm((current) => ({ ...current, isFeatured: value }))}
          />
        </div>
      </FieldShell>
    </div>
  );
}
