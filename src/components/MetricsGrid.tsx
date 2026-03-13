import StatCard from "./StatCard";

interface MetricsGridProps {
    leadsCount: number;
    apifyBalance: number;
    resetDate: string;
}

export default function MetricsGrid({ leadsCount, apifyBalance, resetDate }: MetricsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
                title="Total Scrapped"
                value={leadsCount.toLocaleString()}
                actionIcon="refresh"
                iconName="database"
                subtext={<span className="text-green-400">Real-time database count</span>}
            />

            <StatCard
                title="Available Credits"
                value={`$${Number(apifyBalance).toFixed(2)}`}
                actionIcon="refresh"
                iconName="wallet"
                iconColor="text-blue-400"
                subtext={<span className="text-text-muted">Apify Usage / Balance</span>}
                footer={
                    <span className="text-[10px] text-text-muted">
                        Cycle ends: <span className="text-neon">{resetDate}</span>
                    </span>
                }
            />

            <StatCard
                title="Usage Limit"
                value="84%"
                iconName="zap"
                subtext={<span className="text-text-muted">Monthly platform usage</span>}
                footer={
                    <span className="text-[10px] text-text-muted">
                        Resets in <span className="text-neon">12 days</span>
                    </span>
                }
            />
        </div>
    );
}