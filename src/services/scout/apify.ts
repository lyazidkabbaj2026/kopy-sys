import { ApifyClient } from 'apify-client';
import { env } from '@/config/env';
import { LeadService } from '../leadService';
import { ScrapedLead } from '@/types';
import { AppError } from '@/lib/errors';

const client = new ApifyClient({
    token: env.APIFY_API_TOKEN,
});

export const scoutMorocco = async (city: string = env.DEFAULT_CITY, category: string = env.DEFAULT_CATEGORY) => {
    try {
        const run = await client.actor(env.APIFY_SCOUT_ACTOR_ID).call({
            "searchStringsArray": [`${category}`],
            "locationQuery": `${city}, Morocco`,
            "maxCrawledPlacesPerSearch": 10,
            "language": env.APP_LANGUAGE,
            "maxImages": 0,
            "maxReviews": 0,
            "includeWebsites": true
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        const validItems = (items as unknown as ScrapedLead[]).filter(
            (item) => item.website || item.phone
        );

        const savedLeads = await Promise.all(
            validItems.map((item) => LeadService.upsertScrapedLead(item, city, category))
        );

        return savedLeads;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Scout Error:", error);
        throw new AppError(
            message || "Failed to scrape leads from Apify", 
            "SCRAPING_FAILED", 
            500, 
            error
        );
    }
};