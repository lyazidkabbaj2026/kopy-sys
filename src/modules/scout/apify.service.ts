import { ApifyClient } from 'apify-client';
import { env } from '@/config/env';
import { LeadService } from '../leads/service';
import { ScrapedLead } from '@/types';
import { AppError } from '@/lib/errors';

import { z } from 'zod';

const client = new ApifyClient({
    token: env.APIFY_API_TOKEN,
});

const ApifyItemSchema = z.object({
    title: z.string(),
    placeId: z.string(),
    website: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    rating: z.number().optional().nullable(),
    reviewsCount: z.number().optional().nullable(),
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

        const validLeads = items
            .map((item) => {
                const result = ApifyItemSchema.safeParse(item);
                return result.success ? result.data : null;
            })
            .filter((item): item is z.infer<typeof ApifyItemSchema> => item !== null);

        const savedLeads: any[] = [];
        for (const lead of validLeads) {
            const saved = await LeadService.upsertScrapedLead(lead, city, category);
            savedLeads.push(saved);
        }

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