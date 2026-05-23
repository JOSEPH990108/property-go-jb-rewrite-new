import Link from "next/link";
import Image from "next/image";
import type { ComponentProps } from "react";
import { PublicProject } from "@/app/actions/property-actions";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BaseCard } from "@/components/shared/base-card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MapPin, ArrowRight } from "lucide-react";
import { formatPriceRange } from "@/lib/format";
import { FavoriteButton } from "@/components/properties/FavoriteButton";
import { PropertySpecTiles } from "@/components/properties/PropertySpecTiles";

type PropertyStatusTone = NonNullable<ComponentProps<typeof StatusBadge>["tone"]>;

const PROPERTY_STATUS_TONES: Record<string, PropertyStatusTone> = {
  completed: "success",
  fully_sold: "danger",
  new_launch: "accent",
  subsale: "neutral",
  under_construction: "warning",
  upcoming: "info",
};

function normalizePropertyStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

interface PropertyCardProps {
  project: PublicProject;
  isFavorite?: boolean;
}

export function PropertyCard({ project, isFavorite = false }: PropertyCardProps) {
  const statusKey = normalizePropertyStatus(project.status);

  return (
    <BaseCard className="group overflow-hidden" withPadding={false} data={project}>
      <Link
        href={`/properties/${project.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        {project.images.featured ? (
          <Image
            src={project.images.featured}
            alt={project.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center">
            No Image
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {project.isHotDeal && <Badge variant="destructive">Hot Deal</Badge>}
          <StatusBadge
            status={statusKey}
            label={project.status}
            tone={PROPERTY_STATUS_TONES[statusKey]}
          />
        </div>

        <div className="absolute top-3 right-3" onClick={(e) => e.preventDefault()}>
          <FavoriteButton projectId={project.id} initialIsFavorite={isFavorite} />
        </div>
      </Link>

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
              {project.type} • {project.location.area}
            </p>
            <Link href={`/properties/${project.slug}`} className="hover:underline">
              <h3 className="group-hover:gradient-text line-clamp-1 font-sans text-xl font-semibold tracking-tight transition-all duration-300">
                {project.displayName || project.name}
              </h3>
            </Link>
          </div>
        </div>
        <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
          <MapPin className="text-accent h-3.5 w-3.5" />
          <span className="truncate">
            {project.location.region}, {project.location.state}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <PropertySpecTiles specs={project.specs} variant="compact" />
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Starting from</span>
          <span className="gradient-text text-lg font-semibold">
            {formatPriceRange(project.price.min, project.price.max)}
          </span>
        </div>
        <Link
          href={`/properties/${project.slug}`}
          className="from-primary to-accent shadow-tech-sm hover:shadow-tech-md flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-all duration-200 hover:scale-105"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardFooter>
    </BaseCard>
  );
}
