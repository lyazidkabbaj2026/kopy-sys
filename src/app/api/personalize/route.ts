import { NextResponse } from 'next/server';
import { LeadService } from '@/modules/leads/service';
import { generatePersonalizedMessage } from '@/modules/ghostwriter/personalizer';
import { AppError } from '@/lib/errors';
import { z, ZodError } from 'zod';

const PersonalizeRequestSchema = z.object({
    leadId: z.string().min(1, "leadId is required"),
});

export async function POST(request: Request) {
    try {
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
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return NextResponse.json({ 
                success: false, 
                error: "Validation failed", 
                details: error.format() 
            }, { status: 400 });
        }
        if (error instanceof AppError) {
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}


