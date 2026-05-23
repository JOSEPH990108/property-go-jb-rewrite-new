// src\app\(demo)\demo-loader\page.tsx
"use client";

import { useGlobalLoaderStore } from "@/stores/global-loader-store";
import { motion } from "framer-motion";
import { Timer, RefreshCw, CheckCircle2 } from "lucide-react";

export default function LoaderDemoPage() {
  // Using the correct method names from your store
  const { show, hide, update } = useGlobalLoaderStore();

  // Scenario 1: Simple Load
  const handleSimpleLoad = () => {
    show("Loading Properties", "Fetching the latest luxury listings...");
    setTimeout(() => {
      hide();
    }, 2000);
  };

  // Scenario 2: Dynamic Updates (Sequence)
  const handleDynamicLoad = () => {
    show("Initiating Request", "Connecting to secure server...");

    // Update 1
    setTimeout(() => {
      update("Verifying Credentials", "Please wait while we authenticate...");
    }, 1500);

    // Update 2
    setTimeout(() => {
      update("Finalizing", "Preparing your dashboard...");
    }, 3000);

    // Finish
    setTimeout(() => {
      hide();
    }, 4500);
  };

  // Scenario 3: Transaction
  const handleProcessLoad = () => {
    show("Processing Payment", "Do not close this window...");

    setTimeout(() => {
      update("Processing Payment", "Confirming with bank...");
    }, 2000);

    setTimeout(() => {
      update("Success", "Transaction completed successfully.");
    }, 4000);

    setTimeout(() => {
      hide();
    }, 5500);
  };

  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center space-y-12 p-8 transition-colors duration-500">
      <div className="max-w-xl space-y-4 text-center">
        <h1 className="text-foreground font-serif text-5xl font-bold">
          Loader <span className="text-accent">Playground</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Test the behavior of your global loader. Observe the entrance animations, smooth text
          transitions, and exit fades.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        <DemoCard
          icon={<Timer className="size-6" />}
          title="Quick Fetch"
          description="Simulates a standard 2-second API data fetch."
          buttonText="Test Quick Load"
          onClick={handleSimpleLoad}
        />

        <DemoCard
          icon={<RefreshCw className="size-6" />}
          title="Multi-Step Flow"
          description="Demonstrates text transitions: Connect -> Verify -> Finalize."
          buttonText="Test Sequence"
          onClick={handleDynamicLoad}
        />

        <DemoCard
          icon={<CheckCircle2 className="size-6" />}
          title="Transaction"
          description="Simulates a sensitive action like a payment processing."
          buttonText="Test Process"
          onClick={handleProcessLoad}
        />
      </div>
    </main>
  );
}

function DemoCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <div className="border-border bg-card hover:border-accent/50 group flex flex-col items-center rounded-xl border p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="bg-secondary text-secondary-foreground group-hover:bg-accent group-hover:text-accent-foreground mb-4 rounded-full p-3 transition-colors">
        {icon}
      </div>
      <h3 className="text-foreground mb-2 font-serif text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground mb-6 flex-grow text-sm">{description}</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-full px-6 py-2 text-sm font-medium shadow-md transition-colors"
      >
        {buttonText}
      </motion.button>
    </div>
  );
}
