// src\app\(main)\agent\scan\page.tsx
import { AgentScanner } from "@/components/custom/appointment/AgentScanner";

export default function AgentScanPage() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-10">
      <AgentScanner />
    </div>
  );
}
