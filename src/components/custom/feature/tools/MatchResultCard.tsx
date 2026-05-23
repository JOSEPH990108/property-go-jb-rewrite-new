// src\components\custom\feature\tools\MatchResultCard.tsx

import { motion } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";

interface MatchResultCardProps {
  id: string | number;
  image: string;
  score: number;
  name: string;
  matchReasons: string[];
  index: number;
}

export const MatchResultCard = ({
  image,
  score,
  name,
  matchReasons,
  index,
}: MatchResultCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border-border bg-card hover:shadow-luxury flex overflow-hidden rounded-xl border transition-all duration-300"
    >
      <div className="relative w-32 shrink-0">
        <Image src={image} fill className="object-cover" alt={name} />
        <div className="bg-primary text-primary-foreground absolute top-2 left-2 z-10 rounded px-2 py-1 text-[10px] font-bold shadow-sm">
          {score}%
        </div>
      </div>
      <div className="flex-1 p-4">
        <h3 className="text-foreground text-lg font-bold">{name}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {matchReasons.map((r) => (
            <span
              key={r}
              className="bg-accent/15 text-foreground flex items-center gap-1 rounded border border-transparent px-2 py-1 text-xs font-medium"
            >
              <Check className="text-primary h-3 w-3" /> {r}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
