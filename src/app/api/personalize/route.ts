import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePersonalizedMessage } from '@/modules/ghostwriter/personalizer';
import { ApiResponse } from '@/types';

export async function POST(request: Request) {
    try {
        const { leadId } = await request.json();

        if (!leadId) {
            return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
        }

        const lead = await prisma.lead.findUnique({ where: { id: leadId } });

        if (!lead) {
            return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
        }

        const aiMessage = await generatePersonalizedMessage({
            businessName: lead.businessName,
            category: lead.category,
            city: lead.city,
            auditScore: lead.auditScore,
            auditIssues: lead.auditIssues,
        });

        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: {
                aiMessageDraft: aiMessage,
                status: "MESSAGED"
            }
        });

        const response: ApiResponse = {
            success: true,
            data: updatedLead,
            message: "AI message generated successfully"
        };

        return NextResponse.json(response);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
