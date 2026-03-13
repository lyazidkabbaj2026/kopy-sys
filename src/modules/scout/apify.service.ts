import { ApifyClient } from 'apify-client';
import { ApifyUser } from '@/types';
import { LeadService } from '../leads/service';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

/**
 * Scrapes Google Places leads for a given city and category in Morocco.
 */
export async function scoutMorocco(city: string, category: string, limit: number = 20) {
  const input = {
    "queries": [`${category} in ${city}`],
    "maxPagesPerQuery": 1,
    "resultsPerPage": limit,
    "language": "en",
    "region": "MA"
  };

  const actorId = process.env.APIFY_SCOUT_ACTOR_ID || "compass/crawler-google-places";
  const run = await apifyClient.actor(actorId).call(input);
  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

  const leads = [];
  for (const item of items) {
    try {
      const lead = await LeadService.upsertScrapedLead(item as any, city, category);
      leads.push(lead);
    } catch (err) {
      console.error("⚠️ Failed to upsert lead:", err);
    }
  }

  return leads;
}

export class ApifyService {
  /**
   * Fetches the current Apify account balance and reset details.
   * Handles both Subscription and Free plan usage fallbacks.
   */
  static async getApifyAccountBalance(): Promise<{ balance: number; resetDate: string }> {
    const token = process.env.APIFY_API_TOKEN;
    
    try {
      // 1. Fetch User Data from Client
      const userResponse = await apifyClient.user().get();
      const apifyUser = userResponse as ApifyUser;
      const usage = apifyUser?.currentBillingPeriodUsage;

      // 2. Resolve Subscription Balance
      if (usage?.remainingSubscriptionCredits !== undefined) {
        return {
          balance: usage.remainingSubscriptionCredits,
          resetDate: new Date(usage.cycleEndsAt).toISOString().split('T')[0]
        };
      }

      // 3. Free Plan Fallback (Monthly Usage API)
      const usageRes = await fetch(`https://api.apify.com/v2/users/me/usage/monthly?token=${token}`);
      const usageData = await usageRes.json();
      const currentMonth = usageData?.data?.[0];
      
      if (currentMonth) {
        return {
          balance: currentMonth.totalUsageCreditsUsd || 0,
          resetDate: new Date(currentMonth.endAt).toISOString().split('T')[0]
        };
      }

      return { balance: 0, resetDate: "N/A" };
    } catch (err) {
      console.error("⚠️ Apify Balance Sync Failed:", err);
      return { balance: 0, resetDate: "Error" };
    }
  }
}