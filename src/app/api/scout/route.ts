import { NextResponse } from 'next/server';
import { scoutMorocco } from '@/modules/scout/apify.service';
import { env } from '@/config/env';
import { AppError } from '@/lib/errors';
import { z, ZodError } from 'zod';

const ScoutRequestSchema = z.object({
    city: z.string().optional(),
    category: z.string().optional(),
});

export async function POST(request: Request) {
    try {
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
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return NextResponse.json({ 
                success: false, 
                error: "Validation failed", 
                details: error.format() 
            }, { status: 400 });
        }
        if (error instanceof AppError) {
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
