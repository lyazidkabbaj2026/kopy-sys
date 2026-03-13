import { NextResponse } from 'next/server';
import { LeadService } from '@/services/leadService';
import { generatePersonalizedMessage } from '@/modules/ghostwriter/personalizer';
import { AppError } from '@/lib/errors';

export async function POST(request: Request) {
    try {
        const { leadId } = await request.json();

        if (!leadId) {
            throw new AppError("Missing leadId", "BAD_REQUEST", 400);
        }

        const lead = await LeadService.findById(leadId);

        const aiMessage = await generatePersonalizedMessage({
            businessName: lead.businessName,
            category: lead.category,
            city: lead.city,
            auditScore: lead.auditScore,
            auditIssues: lead.auditIssues,
        });

        const updatedLead = await LeadService.updateStatus(leadId, "MESSAGED", {
            aiMessageDraft: aiMessage
        });

        return NextResponse.json({
            success: true,
            data: updatedLead,
            message: "AI message generated successfully"
        });
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

