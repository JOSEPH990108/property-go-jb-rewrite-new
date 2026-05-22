import { PublicProject } from "@/app/actions/property-actions";
import { PropertyCard } from "@/components/properties/PropertyCard";

interface PropertyGridProps {
    projects: PublicProject[];
    favoriteIds?: string[];
}

export function PropertyGrid({ projects, favoriteIds = [] }: PropertyGridProps) {
    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <p>No properties found matching your criteria.</p>
            </div>
        );
    }

    const favSet = new Set(favoriteIds);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
                <PropertyCard key={p.id} project={p} isFavorite={favSet.has(p.id)} />
            ))}
        </div>
    );
}
