import { NextResponse } from 'next/server';
import { LeadService } from '@/modules/leads/service';
import { withErrorHandler } from '@/lib/api-wrapper';
import { z } from 'zod';

const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  
  const validated = PaginationSchema.parse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });

  const result = await LeadService.getLeads(validated.page, validated.limit);

  return NextResponse.json({
    success: true,
    ...result
  });
});
