import { NextResponse } from 'next/server';
import { LeadService } from '@/services/leadService';
import { analyzeWebsite } from '@/modules/audit/analyzer';
import { AppError } from '@/lib/errors';

export async function POST(request: Request) {
    try {
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
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

