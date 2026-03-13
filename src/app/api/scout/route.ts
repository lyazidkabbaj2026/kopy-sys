import { NextResponse } from 'next/server';
import { scoutMorocco } from '@/services/scout/apify';
import { ApiResponse } from '@/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const city = body.city || "Casablanca";
        const category = body.category || "Spa";

        if (!process.env.APIFY_API_TOKEN) {
            const errorResponse: ApiResponse = {
                success: false,
                error: "Missing APIFY_API_TOKEN"
            };
            return NextResponse.json(errorResponse, { status: 500 });
        }

        const leads = await scoutMorocco(city, category);

        const successResponse: ApiResponse = {
            success: true,
            count: leads.length,
            message: `Scraped ${leads.length} leads in ${city}`
        };

        return NextResponse.json(successResponse);
    } catch (error: any) {
        const errorResponse: ApiResponse = {
            success: false,
            error: error.message
        };
        return NextResponse.json(errorResponse, { status: 500 });
    }
}