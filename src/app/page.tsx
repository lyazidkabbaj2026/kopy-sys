import { LeadService } from "@/modules/leads/service";
import { ApifyService } from "@/modules/scout/apify.service";
import TopHeader from "@/components/TopHeader";
import MetricsGrid from "@/components/MetricsGrid";
import LeadsTable from "@/components/LeadsTable";
import ScoutButton from "@/components/ScoutButton";

export const dynamic = "force-dynamic";

export default async function Dashboard(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  // 1. Fetch Apify Account Balance (Encapsulated)
  const { balance, resetDate } = await ApifyService.getApifyAccountBalance();

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