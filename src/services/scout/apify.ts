import { ApifyClient } from 'apify-client';
import { prisma } from "@/lib/prisma";
import { ScrapedLead } from '@/types';

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

export const scoutMorocco = async (city: string, category: string) => {
    try {
        const run = await client.actor("compass/crawler-google-places").call({
            "searchStringsArray": [`${category}`],
            "locationQuery": `${city}, Morocco`,
            "maxCrawledPlacesPerSearch": 10,
            "language": "fr",
            "maxImages": 0,
            "maxReviews": 0,
            "includeWebsites": true
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        const validItems = (items as unknown as ScrapedLead[]).filter(
            (item) => item.website || item.phone
        );

        const savedLeads = await Promise.all(
            validItems.map((item) => {
                const uniqueKey = item.website || item.placeId;

                return prisma.lead.upsert({
                    where: { website: uniqueKey },
                    update: {
                        lastScrapedAt: new Date(),
                    },
                    create: {
                        businessName: item.title,
                        website: item.website || null,
                        phone: item.phone || null,
                        rating: item.rating || null,
                        reviewsCount: item.reviewsCount || 0,
                        city: city,
                        category: category,
                        status: "SCRAPED",
                        lastScrapedAt: new Date(),
                    },
                });
            })
        );

        return savedLeads;
    } catch (error) {
        console.error("Scout Error:", error);
        throw error;
    }
};