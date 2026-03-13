import { NextResponse } from 'next/server';
import { LeadService } from '@/modules/leads/service';
import { analyzeWebsite } from '@/modules/audit/analyzer';
import { withErrorHandler } from '@/lib/api-wrapper';
import { AppError } from '@/lib/errors';

export const POST = withErrorHandler(async (request: Request) => {
    const { leadId } = await request.json();

    if (!leadId) {
        throw new AppError("Missing leadId", "BAD_REQUEST", 400);
    }

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
});

