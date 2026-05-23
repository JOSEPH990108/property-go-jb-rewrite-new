// src\components\custom\feature\PropertyCard.tsx
import { BedDouble, MoveDiagonal } from "lucide-react";
import Image from "next/image";
import { PropertySpecs } from "@/types";

interface PropertyCardProps {
  title: string;
  description: string;
  image: string;
  specs: PropertySpecs;
}

export function PropertyCard({ title, description, image, specs }: PropertyCardProps) {
  return (
    <div className="bg-card border-border text-card-foreground grid min-h-[600px] w-full grid-cols-1 gap-8 border-b py-8 lg:grid-cols-2">
      {/* Left Column: Text Info */}
      <div className="flex h-full flex-col justify-between p-6">
        <div>
          <h2 className="text-foreground mb-6 text-4xl font-bold">{title}</h2>
          <p className="text-muted-foreground text-xl leading-relaxed font-light">{description}</p>
        </div>

        {/* Bottom Specs/Icons */}
        <div className="border-border mt-auto flex items-center gap-6 border-t pt-8">
          <div className="text-muted-foreground flex items-center gap-2">
            <MoveDiagonal className="h-5 w-5" />
            <span className="font-medium">{specs.area}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            <span className="font-medium">{specs.rooms}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <div
              className="border-border h-4 w-4 rounded-full border"
              style={{
                backgroundColor:
                  specs.color === "White" ? "#fff" : specs.color?.toLowerCase() || "#ccc",
              }}
            />
            <span className="font-medium">{specs.color || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Image */}
      <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-sm">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
        />
      </div>
    </div>
  );
}
