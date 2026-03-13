import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeWebsite } from '@/modules/audit/analyzer';
import { ApiResponse } from '@/types';

export async function POST(request: Request) {
    try {
        const { leadId } = await request.json();

        if (!leadId) {
            return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
        }

        const lead = await prisma.lead.findUnique({ where: { id: leadId } });

        if (!lead || !lead.website) {
            return NextResponse.json({ success: false, error: "Lead not found or has no website" }, { status: 404 });
        }

        const audit = await analyzeWebsite(lead.website);

        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: {
                auditScore: audit.score,
                auditIssues: audit.issues,
                status: "AUDITED"
            }
        });

        const response: ApiResponse = {
            success: true,
            data: updatedLead,
            message: `Audit completed with score: ${audit.score}`
        };

        return NextResponse.json(response);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
