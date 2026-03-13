import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ success: false, error: "Missing or invalid ids" }, { status: 400 });
        }

        await prisma.lead.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        return NextResponse.json({ success: true, message: `${ids.length} leads deleted successfully` });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
