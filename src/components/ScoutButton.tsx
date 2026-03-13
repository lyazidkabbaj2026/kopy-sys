"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, DownloadCloud } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function ScoutButton() {
    const [loading, setLoading] = useState(false);
    const [city, setCity] = useState("Casablanca");
    const [category, setCategory] = useState("Spa");
    const router = useRouter();

    const handleScout = async () => {
        if (!city || !category) return;
        setLoading(true);
        try {
            await apiClient.post("/api/scout", { city, category });
            router.refresh();
        } catch (error: any) {
            alert(`Scout failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
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
                    disabled={loading}
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
                    disabled={loading}
                    className="w-24 bg-transparent text-xs text-text-main placeholder-text-muted focus:outline-none"
                />
            </div>
            <button
                onClick={handleScout}
                disabled={loading || !city || !category}
                className="flex items-center gap-2 rounded-lg border border-border-subtle bg-panel px-4 py-1.5 text-xs font-medium text-text-main hover:border-neon hover:text-neon transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <DownloadCloud className="h-4 w-4" />
                {loading ? "Scouting..." : "Extract Leads"}
            </button>
        </div>
    );
}