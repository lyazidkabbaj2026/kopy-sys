"use client";

import { DownloadCloud, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { triggerScout } from "@/app/actions/scout";

export default function ScoutButton() {
    const [isPending, startTransition] = useTransition();
    const [city, setCity] = useState("Casablanca");
    const [category, setCategory] = useState("Spa");
    const router = useRouter();

    const handleScout = async () => {
        if (!city || !category) return;
        
        startTransition(async () => {
            try {
                const result = await triggerScout(city, category);
                if (result.success) {
                    router.refresh();
                } else {
                    alert(`Scout failed: ${result.error}`);
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "An unknown error occurred";
                alert(`Scout failed: ${message}`);
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border-subtle bg-panel px-3 py-1.5 focus-within:border-neon transition-colors">
                <Search className="h-4 w-4 text-text-muted mr-2" />
                <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Niche"
                    disabled={isPending}
                    className="w-24 bg-transparent text-xs text-text-main placeholder-text-muted focus:outline-none"
                />
            </div>
            <div className="flex items-center rounded-lg border border-border-subtle bg-panel px-3 py-1.5 focus-within:border-neon transition-colors">
                <Search className="h-4 w-4 text-text-muted mr-2" />
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    disabled={isPending}
                    className="w-24 bg-transparent text-xs text-text-main placeholder-text-muted focus:outline-none"
                />
            </div>
            <button
                onClick={handleScout}
                disabled={isPending || !city || !category}
                className="flex items-center gap-2 rounded-lg border border-border-subtle bg-panel px-4 py-1.5 text-xs font-medium text-text-main hover:border-neon hover:text-neon transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <DownloadCloud className="h-4 w-4" />
                {isPending ? "Scouting..." : "Extract Leads"}
            </button>
        </div>
    );
}