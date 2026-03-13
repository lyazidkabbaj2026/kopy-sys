import { NextResponse } from 'next/server';
import { LeadService } from '@/modules/leads/service';
import { withErrorHandler, withAuth } from '@/lib/api-wrapper';
import { z } from 'zod';

const BulkDeleteSchema = z.object({
    ids: z.array(z.string()).min(1, "At least one ID is required"),
});

export const POST = withErrorHandler(withAuth(async (request: Request) => {
    const body = await request.json();
    const { ids } = BulkDeleteSchema.parse(body);

    const result = await LeadService.bulkDelete(ids);

    return NextResponse.json({ 
        success: true, 
        message: `${result.count} leads deleted successfully` 
    });
}));

