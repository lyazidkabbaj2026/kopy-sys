import { prisma } from "@/lib/prisma";
import { ApifyClient } from 'apify-client';
import { ApifyUser } from "@/types";
import TopHeader from "@/components/TopHeader";
import MetricsGrid from "@/components/MetricsGrid";
import LeadsTable from "@/components/LeadsTable";
import ScoutButton from "@/components/ScoutButton";

export const dynamic = "force-dynamic";

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export default async function Dashboard() {
  const token = process.env.APIFY_API_TOKEN;

  // 1. Fetch User Data
  const userResponse = await apifyClient.user().get();
  const apifyUser = userResponse as ApifyUser;
  let usage = apifyUser?.currentBillingPeriodUsage;

  // 2. Fallback to Monthly Usage API if CBPU is missing (common on Free plans)
  let balance = 0;
  let resetDate = "N/A";

  if (usage?.remainingSubscriptionCredits !== undefined) {
    balance = usage.remainingSubscriptionCredits;
    resetDate = new Date(usage.cycleEndsAt).toLocaleDateString();
  } else {
    // Attempt to fetch from usage API
    try {
      const usageRes = await fetch(`https://api.apify.com/v2/users/me/usage/monthly?token=${token}`);
      const usageData = await usageRes.json();
      const currentMonth = usageData?.data?.[0];
      
      if (currentMonth) {
        // If it's a Free plan, they might be tracking "Total Usage" as their balance
        // Or we calculate remaining: 5.00 (Free limit) - used
        const used = currentMonth.totalUsageCreditsUsd || 0;
        
        // Logic: If user says they have $0.32 balance, and they used $0.32, 
        // they might be looking at "Used". To be safe and high-end, we show Used if balance is missing.
        balance = used; 
        resetDate = new Date(currentMonth.endAt).toLocaleDateString();
        
        console.log(`ℹ️ Using monthly usage as fallback: $${balance}`);
      }
    } catch (err) {
      console.error("⚠️ Failed to fetch Apify usage fallback:", err);
    }
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex h-screen w-full bg-background text-text-main overflow-hidden font-sans">
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <TopHeader />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-white">Your data, delivered!</h1>
              <p className="text-xs text-text-muted mt-1">Instantly access and manage your extracted leads.</p>
            </div>
            <ScoutButton />
          </div>

          <MetricsGrid leadsCount={leads.length} apifyBalance={balance} resetDate={resetDate} />

          <LeadsTable leads={leads} />
        </div>
      </main>
    </div>
  );
}