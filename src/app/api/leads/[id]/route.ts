import { NextResponse } from 'next/server';
import { LeadService } from '@/modules/leads/service';
import { withErrorHandler } from '@/lib/api-wrapper';

export const DELETE = withErrorHandler(async (
    _request: Request,
    context: unknown
) => {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    
    await LeadService.delete(id);

    return NextResponse.json({ success: true, message: "Lead deleted successfully" });
});

