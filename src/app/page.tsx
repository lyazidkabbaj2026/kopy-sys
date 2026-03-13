import { LeadService } from "@/modules/leads/service";
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

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = process.env.APIFY_API_TOKEN;

  // 1. Fetch User Data
  const userResponse = await apifyClient.user().get();
  const apifyUser = userResponse as ApifyUser;
  const usage = apifyUser?.currentBillingPeriodUsage;

  // 2. Apify Balance Logic
  let balance = 0;
  let resetDate = "N/A";

  if (usage?.remainingSubscriptionCredits !== undefined) {
    balance = usage.remainingSubscriptionCredits;
    resetDate = new Date(usage.cycleEndsAt).toISOString().split('T')[0];
  } else {
    try {
      const usageRes = await fetch(`https://api.apify.com/v2/users/me/usage/monthly?token=${token}`);
      const usageData = await usageRes.json();
      const currentMonth = usageData?.data?.[0];
      
      if (currentMonth) {
        balance = currentMonth.totalUsageCreditsUsd || 0;
        resetDate = new Date(currentMonth.endAt).toISOString().split('T')[0];
      }
    } catch (err) {
      console.error("⚠️ Failed to fetch Apify usage fallback:", err);
    }
  }

  // 3. Server-Side Lead Fetching (Filtered & Paginated)
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const rating = typeof searchParams.rating === 'string' ? searchParams.rating : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const sortBy = typeof searchParams.sortBy === 'string' ? searchParams.sortBy : 'createdAt';
  const sortDir = searchParams.sortDir === 'asc' ? 'asc' : 'desc';

  const { data: leads, meta } = await LeadService.getLeads({
    page,
    q,
    status,
    rating,
    category,
    sortBy,
    sortDir,
    limit: 25, // Optimized page size
  });

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

          <MetricsGrid leadsCount={meta.total} apifyBalance={balance} resetDate={resetDate} />

          <LeadsTable 
            leads={leads} 
            totalCount={meta.total} 
            currentPage={meta.page} 
            totalPages={meta.totalPages} 
          />
        </div>
      </main>
    </div>
  );
}