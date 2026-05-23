// src\components\custom\feature\tools\PropertyMatcher.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Building2,
  TrendingUp,
  Heart,
  Armchair,
  Trees,
  Coffee,
  ShoppingBag,
  Check,
  ChevronRight,
  RefreshCcw,
  Briefcase,
  MapPin,
  Globe,
  Clock,
} from "lucide-react";
import { usePropertyMatcher } from "@/hooks/usePropertyMatcher";
import { SelectionCard } from "./SelectionCard";
import { MatchResultCard } from "./MatchResultCard";
import { cn } from "@/lib/utils";

// Define step configs with IDs
const ALL_STEPS_CONFIG: Record<string, { title: string; subtitle: string }> = {
  type: { title: "Property Type", subtitle: "What are you eyeing?" },
  budget: { title: "Max Budget", subtitle: "Finding value for you." },
  goal: { title: "Primary Goal", subtitle: "Yield or Comfort?" },
  rooms: { title: "Bedrooms", subtitle: "Space requirements." },
  tenant: { title: "Tenant Strategy", subtitle: "Who are you targeting?" },
  location: { title: "Location Preference", subtitle: "Connectivity needs." },
  balcony: { title: "Balcony?", subtitle: "Outdoor space needs." },
  vibe: { title: "Lifestyle", subtitle: "Your weekend vibe." },
};

export default function PropertyMatcher() {
  const {
    step,
    currentStepId,
    totalSteps,
    answers,
    status,
    results,
    setAnswer,
    goToNext,
    goToPrev,
    restart,
  } = usePropertyMatcher();

  // --- RENDER HELPERS (Keep the main return clean) ---

  const renderContent = () => {
    switch (currentStepId) {
      case "type":
        return (
          <div className="grid grid-cols-2 gap-4">
            <SelectionCard
              active={answers.type === "High Rise"}
              onClick={() => setAnswer("type", "High Rise")}
              icon={<Building2 />}
              title="High Rise"
              desc="Condos & Serviced"
            />
            <SelectionCard
              active={answers.type === "Landed"}
              onClick={() => setAnswer("type", "Landed")}
              icon={<Home />}
              title="Landed"
              desc="Terrace & Semi-D"
            />
          </div>
        );
      case "budget":
        return (
          <div className="space-y-8">
            <div className="text-foreground text-center font-serif text-4xl font-bold">
              RM {answers.budget.toLocaleString()}
            </div>
            <input
              type="range"
              min="300000"
              max="3000000"
              step="50000"
              value={answers.budget}
              onChange={(e) => setAnswer("budget", parseInt(e.target.value))}
              className="bg-muted accent-primary h-3 w-full cursor-pointer appearance-none rounded-lg"
            />
          </div>
        );
      case "goal":
        return (
          <div className="grid grid-cols-2 gap-4">
            <SelectionCard
              active={answers.goal === "Own Stay"}
              onClick={() => setAnswer("goal", "Own Stay")}
              icon={<Heart />}
              title="Own Stay"
              desc="Focus on comfort"
            />
            <SelectionCard
              active={answers.goal === "Investment"}
              onClick={() => setAnswer("goal", "Investment")}
              icon={<TrendingUp />}
              title="Investment"
              desc="Focus on ROI"
            />
          </div>
        );
      case "rooms":
        return (
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setAnswer("rooms", num)}
                className={cn(
                  "h-16 w-16 rounded-2xl text-xl font-bold shadow-sm transition-all",
                  answers.rooms === num
                    ? "bg-primary text-primary-foreground scale-110 shadow-lg"
                    : "bg-card border-border hover:border-primary/50 text-muted-foreground border",
                )}
              >
                {num}+
              </button>
            ))}
          </div>
        );
      case "tenant": // New Step
        return (
          <div className="grid grid-cols-2 gap-4">
            <SelectionCard
              active={answers.tenant === "Long Term"}
              onClick={() => setAnswer("tenant", "Long Term")}
              icon={<Briefcase />}
              title="Long Term"
              desc="Stable, 1+ year leases"
            />
            <SelectionCard
              active={answers.tenant === "Short Term"}
              onClick={() => setAnswer("tenant", "Short Term")}
              icon={<Clock />}
              title="Short Term"
              desc="Airbnb / Homestay"
            />
          </div>
        );
      case "location": // New Step
        return (
          <div className="grid grid-cols-2 gap-4">
            <SelectionCard
              active={answers.location === "RTS/CIQ"}
              onClick={() => setAnswer("location", "RTS/CIQ")}
              icon={<MapPin />}
              title="Near RTS/CIQ"
              desc="Walk to checkpoint"
            />
            <SelectionCard
              active={answers.location === "Anywhere"}
              onClick={() => setAnswer("location", "Anywhere")}
              icon={<Globe />}
              title="Anywhere"
              desc="Wider options"
            />
          </div>
        );
      case "balcony":
        return (
          <div className="grid grid-cols-2 gap-4">
            <SelectionCard
              active={answers.balcony === true}
              onClick={() => setAnswer("balcony", true)}
              icon={<Check />}
              title="Must Have"
              desc="Need outdoor space"
            />
            <SelectionCard
              active={answers.balcony === false}
              onClick={() => setAnswer("balcony", false)}
              icon={<div className="font-bold">✕</div>}
              title="Not Critical"
              desc="More indoor space"
            />
          </div>
        );
      case "vibe":
        return (
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: "Nature", icon: <Trees />, desc: "Greenery" },
              { val: "Shopping", icon: <ShoppingBag />, desc: "Malls" },
              { val: "Quiet", icon: <Armchair />, desc: "Peaceful" },
              { val: "City", icon: <Coffee />, desc: "Urban" },
            ].map((v) => (
              <SelectionCard
                key={v.val}
                active={answers.vibe === v.val}
                // @ts-ignore
                onClick={() => setAnswer("vibe", v.val)}
                icon={v.icon}
                title={v.val}
                desc={v.desc}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  // --- LOGIC ---
  const currentConfig = ALL_STEPS_CONFIG[currentStepId] || { title: "", subtitle: "" };

  // Validation for "Continue" button
  const isAnswerSelected = () => {
    switch (currentStepId) {
      case "type":
        return answers.type !== null;
      case "budget":
        return true; // Slider always has value
      case "goal":
        return answers.goal !== null;
      case "rooms":
        return answers.rooms !== null;
      case "tenant":
        return answers.tenant !== null;
      case "location":
        return answers.location !== null;
      case "balcony":
        return answers.balcony !== null;
      case "vibe":
        return answers.vibe !== null;
      default:
        return false;
    }
  };

  // --- MAIN RENDER ---

  if (status === "searching") {
    return (
      <div className="bg-background flex h-[600px] w-full flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="border-muted border-t-primary mb-6 h-12 w-12 rounded-full border-4"
        />
        <h3 className="text-foreground font-bold">Analysing market data...</h3>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="bg-background flex min-h-[600px] flex-col p-6">
        <div className="mb-8 flex shrink-0 items-center justify-between">
          <h2 className="text-foreground font-serif text-2xl font-bold">Your Matches</h2>
          <button
            onClick={restart}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <RefreshCcw className="h-4 w-4" /> Reset
          </button>
        </div>
        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto pb-4">
          {results.length > 0 ? (
            results.map((p, i) => <MatchResultCard key={p.id} index={i} {...p} />)
          ) : (
            <div className="text-muted-foreground py-10 text-center">
              No strict matches found. Try relaxing your filters.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background mx-auto flex h-[600px] w-full max-w-2xl flex-col p-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="bg-muted h-1 overflow-hidden rounded-full">
          <motion.div
            className="bg-primary h-full"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="text-muted-foreground mt-4 flex justify-between text-sm">
          <span>Step {step + 1}</span>
          {step > 0 && (
            <button onClick={goToPrev} className="hover:text-foreground transition-colors">
              Back
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-foreground mb-2 font-serif text-3xl font-bold">
              {currentConfig.title}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">{currentConfig.subtitle}</p>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <button
        onClick={goToNext}
        disabled={!isAnswerSelected()}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold shadow-sm transition-all",
          isAnswerSelected()
            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
            : "bg-muted text-muted-foreground cursor-not-allowed",
        )}
      >
        {step === totalSteps - 1 ? "Show Matches" : "Continue"} <ChevronRight size={20} />
      </button>
    </div>
  );
}
