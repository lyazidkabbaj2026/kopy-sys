import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full bg-background text-text-main overflow-hidden font-sans">
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Exact TopHeader Skeleton (64px / h-16) */}
        <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/60 backdrop-blur-xl shrink-0 h-16">
          <div className="flex items-center justify-between h-full px-8 max-w-[1400px] mx-auto">
            <div className="flex items-center gap-8">
              <div className="w-20 h-7 bg-white/5 rounded animate-pulse" />
              <div className="hidden md:flex w-80 h-10 bg-panel/20 border border-border-subtle/30 rounded-xl animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-8 bg-neon/10 border border-neon/20 rounded-lg animate-pulse" />
              <div className="w-20 h-10 bg-panel/20 border border-border-subtle rounded-xl animate-pulse" />
              <div className="h-8 w-8 rounded-xl bg-white/5 animate-pulse" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Dashboard Header Skeleton */}
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-3">
              <div className="h-8 w-64 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-72 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="h-11 w-40 bg-neon/20 border border-neon/10 rounded-xl animate-pulse" />
          </div>

          {/* MetricsGrid Skeleton (Exact h-32 blocks) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-panel/30 border border-border-subtle/50 rounded-2xl animate-pulse" />
            ))}
          </div>

          {/* LeadsTable Skeleton Container */}
          <div className="space-y-4">
            {/* Filter Bar Skeleton */}
            <div className="h-16 bg-panel/30 border border-border-subtle rounded-xl animate-pulse" />
            
            {/* Main Table Body Skeleton */}
            <div className="h-[500px] bg-panel/10 border border-border-subtle rounded-xl animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-12 border-b border-border-subtle/20" />
               <div className="p-8 flex flex-col items-center justify-center h-full">
                  <div className="p-4 bg-neon/5 rounded-full border border-neon/10 mb-4 animate-pulse">
                    <Loader2 className="h-8 w-8 text-neon/40 animate-spin" />
                  </div>
                  <div className="h-4 w-48 bg-white/5 rounded animate-pulse mb-2" />
                  <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
