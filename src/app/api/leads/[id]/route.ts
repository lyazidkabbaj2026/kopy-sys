import { NextResponse } from 'next/server';
import { LeadService } from '@/modules/leads/service';
import { withErrorHandler, withAuth } from '@/lib/api-wrapper';

import { z } from 'zod';

const RouteContextSchema = z.object({ 
    params: z.promise(z.object({ id: z.string() })) 
});

export const DELETE = withErrorHandler(withAuth(async (
    _request: Request,
    context: unknown
) => {
    const { params } = RouteContextSchema.parse(context);
    const { id } = await params;
    
    await LeadService.delete(id);

    return NextResponse.json({ success: true, message: "Lead deleted successfully" });
}));

