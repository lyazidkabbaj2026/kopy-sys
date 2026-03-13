import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';

export async function POST(request: Request) {
    try {
        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids)) {
            throw new AppError("Missing or invalid ids", "BAD_REQUEST", 400);
        }

        await prisma.lead.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        return NextResponse.json({ success: true, message: `${ids.length} leads deleted successfully` });
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

