import { NextResponse } from 'next/server';
import { scoutMorocco } from '@/services/scout/apify';
import { env } from '@/config/env';
import { AppError } from '@/lib/errors';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const city = body.city || env.DEFAULT_CITY;
        const category = body.category || env.DEFAULT_CATEGORY;

        const leads = await scoutMorocco(city, category);

        return NextResponse.json({
            success: true,
            count: leads.length,
            message: `Scraped ${leads.length} leads in ${city}`
        });
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}