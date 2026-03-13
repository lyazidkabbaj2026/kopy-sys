"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full bg-background items-center justify-center p-4">
      <div className="max-w-md w-full bg-panel/40 border border-red-500/20 rounded-2xl p-8 backdrop-blur-xl text-center space-y-6 shadow-2xl shadow-red-500/5">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Data Stream Interrupted
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            {error.message || "We encountered an unexpected error while syncing your dashboard data. This might be a temporary network issue."}
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-text-muted/50 uppercase">
              ID: {error.digest}
            </p>
          )}
        </div>

        <button
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 hover:border-red-500 py-3 rounded-xl text-sm font-bold transition-all group"
        >
          <RefreshCcw className="h-4 w-4 transform group-hover:rotate-180 transition-transform duration-500" />
          Try Recovery Sync
        </button>

        <p className="text-[10px] text-text-muted/40 uppercase tracking-widest font-medium">
          Kopy CRM Resilience Layer v1.0
        </p>
      </div>
    </div>
  );
}
