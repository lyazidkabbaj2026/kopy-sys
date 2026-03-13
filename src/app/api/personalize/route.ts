import { NextResponse } from 'next/server';
import { LeadService } from '@/modules/leads/service';
import { generatePersonalizedMessage } from '@/modules/ghostwriter/personalizer';
import { z } from 'zod';
import { withErrorHandler, withAuth } from '@/lib/api-wrapper';

const PersonalizeRequestSchema = z.object({
    leadId: z.string().min(1, "leadId is required"),
});

export const POST = withErrorHandler(withAuth(async (request: Request) => {
    const body = await request.json();
    const { leadId } = PersonalizeRequestSchema.parse(body);

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
}));


