import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full bg-background text-text-main overflow-hidden font-sans">
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mock TopHeader Skeleton */}
        <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/60 backdrop-blur-xl shrink-0 h-16">
          <div className="flex items-center justify-between h-full px-8 max-w-[1400px] mx-auto">
            <div className="flex items-center gap-8">
              <div className="w-16 h-6 bg-white/5 rounded animate-pulse" />
              <div className="hidden md:flex w-80 h-10 bg-panel/30 border border-border-subtle/50 rounded-xl animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-8 bg-neon/10 border border-neon/20 rounded-lg animate-pulse" />
              <div className="w-20 h-10 bg-panel/30 border border-border-subtle rounded-xl animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-white/5 animate-pulse" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-end justify-between mb-6">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-neon/20 rounded-lg animate-pulse" />
          </div>

          {/* MetricsGrid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-panel/40 border border-border-subtle rounded-xl animate-pulse" />
            ))}
          </div>

          {/* LeadsTable Skeleton */}
          <div className="space-y-4">
            <div className="h-16 bg-panel/40 border border-border-subtle rounded-xl animate-pulse" />
            <div className="h-[400px] bg-panel/20 border border-border-subtle rounded-xl animate-pulse relative flex flex-col items-center justify-center">
               <Loader2 className="h-8 w-8 text-neon animate-spin mb-4" />
               <p className="text-xs text-text-muted font-medium uppercase tracking-widest animate-pulse">Syncing ApxLeads Dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
