import { NextResponse } from 'next/server';
import { LeadService } from '@/modules/leads/service';
import { analyzeWebsite } from '@/modules/audit/analyzer';
import { withErrorHandler, withAuth } from '@/lib/api-wrapper';
import { z } from 'zod';

import { AppError } from '@/lib/errors';

const AuditRequestSchema = z.object({
    leadId: z.string().min(1, "leadId is required"),
});

export const POST = withErrorHandler(withAuth(async (request: Request) => {
    const body = await request.json();
    const { leadId } = AuditRequestSchema.parse(body);

    const lead = await LeadService.findById(leadId);

    if (!lead.website) {
        throw new AppError("Lead has no website to audit", "BAD_REQUEST", 400);
    }

    const audit = await analyzeWebsite(lead.website);

    const updatedLead = await LeadService.updateStatus(leadId, "AUDITED", {
        auditScore: audit.score,
        auditIssues: audit.issues
    });

    return NextResponse.json({
        success: true,
        data: updatedLead,
        message: `Audit completed with score: ${audit.score}`
    });
}));

