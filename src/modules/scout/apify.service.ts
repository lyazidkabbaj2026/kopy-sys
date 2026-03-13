import { ApifyClient } from 'apify-client';
import { ApifyUser } from '@/types';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

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