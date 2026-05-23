import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { cache } from "react";
import { getPropertyBySlug } from "@/app/actions/property-actions";
import { getProjectUnitAvailability } from "@/app/actions/unit-availability-actions";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BedDouble, Bath, Ruler, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { UnitAvailabilityChart } from "@/components/properties/UnitAvailabilityChart";
import { ImageGallery } from "@/components/properties/ImageGallery";
import { ShareButton } from "@/components/properties/ShareButton";
import { ContactAgentCard } from "@/components/properties/ContactAgentCard";
import { FavoriteButton } from "@/components/properties/FavoriteButton";
import { DEMO_PROJECT } from "@/lib/unit-chart-data";
import { formatPriceRange } from "@/lib/format";
import { getFavoriteIds } from "@/app/actions/favorite-actions";

// Deduplicate the DB call using React cache
const getProject = cache(async (slug: string) => {
  return await getPropertyBySlug(slug);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) return { title: "Property Not Found" };

  return {
    title: `${project.displayName || project.name} | PropertyGoJB`,
    description: project.description?.slice(0, 160),
    openGraph: {
      title: `${project.displayName || project.name} | PropertyGoJB`,
      description: project.description?.slice(0, 200),
      images: project.images.featured ? [project.images.featured] : [],
      url: `https://propertygojb.com/properties/${project.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.displayName || project.name} | PropertyGoJB`,
      description: project.description?.slice(0, 200),
      images: project.images.featured ? [project.images.featured] : [],
    },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, liveUnitData, favoriteIds] = await Promise.all([
    getProject(slug),
    getProjectUnitAvailability(slug),
    getFavoriteIds(),
  ]);

  if (!project) {
    notFound();
  }

  // Fall back to demo data when the project has no units in the DB yet
  const unitChartData = liveUnitData ?? {
    ...DEMO_PROJECT,
    projectName: project.displayName || project.name,
  };

  const formatRange = (min: number | null, max: number | null) => {
    if (!min && !max) return "-";
    if (min === max) return min;
    return `${min} - ${max}`;
  };

  return (
    <>
      <JsonLd project={project} />
      <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-zinc-950">
        {/* Hero Image */}
        <div className="relative h-[50vh] w-full overflow-hidden md:h-[60vh]">
          {project.images.featured ? (
            <Image
              src={project.images.featured}
              alt={project.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">No Image</div>
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-0 left-0 container w-full p-6 text-white md:p-12">
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 mb-4">
              {project.status || "Project"}
            </Badge>
            <h1 className="mb-2 font-serif text-4xl font-bold drop-shadow-md md:text-6xl">
              {project.displayName || project.name}
            </h1>
            <div className="flex items-center gap-2 text-lg text-white/90 drop-shadow-md md:text-xl">
              <MapPin className="h-5 w-5" />
              <span>
                {project.address ? `${project.address}, ` : ""}
                {project.location.area}, {project.location.state}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 container -mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Image Gallery */}
            {project.images.gallery.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold">Gallery</h2>
                <ImageGallery
                  images={project.images.gallery}
                  alt={project.displayName || project.name}
                />
              </div>
            )}

            {/* Specs Card */}
            <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg p-4">
                  <BedDouble className="text-primary mb-2 h-6 w-6" />
                  <span className="text-muted-foreground text-sm">Bedrooms</span>
                  <span className="text-lg font-semibold">
                    {formatRange(project.specs.minBedrooms, project.specs.maxBedrooms)}
                  </span>
                </div>
                <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg p-4">
                  <Bath className="text-primary mb-2 h-6 w-6" />
                  <span className="text-muted-foreground text-sm">Bathrooms</span>
                  <span className="text-lg font-semibold">
                    {formatRange(project.specs.minBathrooms, project.specs.maxBathrooms)}
                  </span>
                </div>
                <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg p-4">
                  <Ruler className="text-primary mb-2 h-6 w-6" />
                  <span className="text-muted-foreground text-sm">Size (sqft)</span>
                  <span className="text-lg font-semibold">
                    {formatRange(project.specs.minSqft, project.specs.maxSqft)}
                  </span>
                </div>
                <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg p-4">
                  <Calendar className="text-primary mb-2 h-6 w-6" />
                  <span className="text-muted-foreground text-sm">Tenure</span>
                  <span className="text-lg font-semibold">
                    {project.specs.tenure || "Freehold"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold">About this Project</h2>
              <div className="prose dark:prose-invert text-muted-foreground max-w-none whitespace-pre-wrap">
                {project.description}
              </div>
            </div>

            {/* Amenities */}
            {project.amenities.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold">Amenities</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {project.amenities.map((amenity) => (
                    <div key={amenity} className="text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="text-primary h-4 w-4" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / CTA */}
          <div className="space-y-6">
            <div className="bg-card border-border sticky top-24 rounded-xl border p-6 shadow-sm">
              <h3 className="mb-1 text-lg font-semibold">Starting Price</h3>
              <div className="text-primary mb-6 text-3xl font-bold">
                {formatPriceRange(project.price.min, project.price.max)}
              </div>

              <div className="space-y-4">
                <Button
                  size="lg"
                  className="shadow-primary/20 w-full text-lg font-semibold shadow-lg"
                >
                  Book a Viewing
                </Button>
                <div className="flex gap-2">
                  <FavoriteButton
                    projectId={project.id}
                    initialIsFavorite={favoriteIds.includes(project.id)}
                    variant="button"
                    className="flex-1"
                  />
                  <ShareButton title={project.displayName || project.name} slug={project.slug} />
                </div>
              </div>

              <div className="border-border mt-6 border-t pt-6">
                <div className="flex items-center gap-4">
                  {project.developer.logo && (
                    <div className="border-border relative h-12 w-12 shrink-0 overflow-hidden rounded-full border">
                      <Image
                        src={project.developer.logo}
                        alt={project.developer.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">Developer</p>
                    <p className="leading-tight font-semibold">{project.developer.name}</p>
                  </div>
                </div>
              </div>

              <div className="border-border mt-6 border-t pt-6">
                <ContactAgentCard projectName={project.displayName || project.name} />
              </div>
            </div>
          </div>
        </div>
        {/* Unit Availability Chart — full width below the 3-col layout */}
        <div className="container mt-10 pb-10">
          <UnitAvailabilityChart data={unitChartData} />
        </div>
      </div>
    </>
  );
}
