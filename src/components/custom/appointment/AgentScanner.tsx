"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { scanAppointment } from "@/app/actions/appointment-actions";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function AgentScanner() {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    rewardStatus?: string;
  } | null>(null);

  const handleScan = async () => {
    if (!token) return;
    setIsLoading(true);
    setResult(null);

    try {
      const res = await scanAppointment(token);
      if (res.success) {
        setResult({
          success: true,
          message: res.message,
          rewardStatus: res.rewardStatus,
        });
        toast.success("Check-in Verified");
      } else {
        setResult({ success: false, message: res.error });
        toast.error("Scan Failed", { description: res.error });
      }
    } catch {
      setResult({ success: false, message: "System error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Visitor Check-in</CardTitle>
        <CardDescription>Scan QR code or enter token manually.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="QR Token (UUID)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button onClick={handleScan} disabled={isLoading || !token}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
          </Button>
        </div>

        {result && (
          <div
            className={`flex flex-col items-center justify-center space-y-2 rounded-lg border p-4 ${result.success ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
          >
            {result.success ? (
              <>
                <CheckCircle className="h-8 w-8 text-green-600" />
                <span className="text-lg font-semibold">VERIFIED</span>
                <span className="text-sm">{result.message}</span>
                {result.rewardStatus && (
                  <div className="mt-2 rounded border border-green-200 bg-white px-2 py-1 text-xs">
                    Reward Status: <strong>{result.rewardStatus}</strong>
                  </div>
                )}
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 text-red-600" />
                <span className="text-lg font-semibold">INVALID</span>
                <span className="text-sm">{result.message}</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
