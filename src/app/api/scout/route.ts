import { NextResponse } from 'next/server';
import { scoutMorocco } from '@/modules/scout/apify.service';
import { env } from '@/config/env';
import { z } from 'zod';
import { withErrorHandler, withAuth } from '@/lib/api-wrapper';

const ScoutRequestSchema = z.object({
    city: z.string().optional(),
    category: z.string().optional(),
    limit: z.number().min(1).max(500).optional(),
});

export const POST = withErrorHandler(withAuth(async (request: Request) => {
    const body = await request.json();
    const validated = ScoutRequestSchema.parse(body);
    
    const city = validated.city || env.DEFAULT_CITY;
    const category = validated.category || env.DEFAULT_CATEGORY;
    const limit = validated.limit || 10;

    const leads = await scoutMorocco(city, category, limit);

    return NextResponse.json({
        success: true,
        count: leads.length,
        message: `Scraped ${leads.length} leads in ${city}`
    });
}));