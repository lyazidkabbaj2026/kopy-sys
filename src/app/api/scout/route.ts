import { NextResponse } from 'next/server';
import { scoutMorocco } from '@/modules/scout/apify.service';
import { env } from '@/config/env';
import { z } from 'zod';
import { withErrorHandler } from '@/lib/api-wrapper';

const ScoutRequestSchema = z.object({
    city: z.string().optional(),
    category: z.string().optional(),
});

export const POST = withErrorHandler(async (request: Request) => {
    const body = await request.json();
    const validated = ScoutRequestSchema.parse(body);
    
    const city = validated.city || env.DEFAULT_CITY;
    const category = validated.category || env.DEFAULT_CATEGORY;

    const leads = await scoutMorocco(city, category);

    return NextResponse.json({
        success: true,
        count: leads.length,
        message: `Scraped ${leads.length} leads in ${city}`
    });
});