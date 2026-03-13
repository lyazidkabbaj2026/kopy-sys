// src/components/StatCard.tsx
"use client";

import { LucideIcon, RefreshCw, Database, Zap, Wallet, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const iconMap = {
    database: Database,
    zap: Zap,
    wallet: Wallet,
    search: Search,
};

interface StatCardProps {
    title: string;
    value: string;
    subtext: React.ReactNode;
    iconName: keyof typeof iconMap;
    iconColor?: string;
    actionIcon?: "refresh" | "plus";
    footer?: React.ReactNode;
}

export default function StatCard({
    title,
    value,
    subtext,
    iconName,
    iconColor = "text-neon",
    actionIcon,
    footer,
}: StatCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // FIX: Define Icon by mapping the iconName string to the iconMap
    const Icon = iconMap[iconName];

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    return (
        <div className="bg-panel border border-border-subtle rounded-xl p-5 flex flex-col h-full transition-all hover:border-neon/30">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                    {/* Now 'Icon' is defined and safe to use */}
                    {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
                    {title}
                </div>
                {actionIcon === "refresh" && (
                    <RefreshCw 
                        onClick={handleRefresh} 
                        className={`h-3.5 w-3.5 text-text-muted cursor-pointer hover:text-white transition-all ${isPending ? "animate-spin text-neon" : ""}`} 
                    />
                )}
            </div>
            <div className="text-3xl font-semibold text-white mb-1">{value}</div>
            <div className="text-[10px] mb-auto">{subtext}</div>
            {footer && (
                <div className="mt-4 pt-3 border-t border-border-subtle/50 flex items-center gap-2 text-xs text-text-muted">
                    {footer}
                </div>
            )}
        </div>
    );
}