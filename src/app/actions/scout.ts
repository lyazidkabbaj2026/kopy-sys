"use server";

import { scoutMorocco } from "@/modules/scout/apify.service";

export async function triggerScout(city: string, category: string) {
    try {
        const leads = await scoutMorocco(city, category);
        return { success: true, count: leads.length };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred during scouting";
        return { 
            success: false, 
            error: message 
        };
    }
}
