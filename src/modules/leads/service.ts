import { prisma } from "@/lib/prisma";
import { Lead, LeadStatus, ScrapedLead } from "@/types";
import { AppError } from "@/lib/errors";

export class LeadService {
  static async findById(id: string): Promise<Lead> {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new AppError(`Lead with ID ${id} not found`, 'NOT_FOUND', 404);
    }
    return lead;
  }

  static async findByWebsite(website: string): Promise<Lead | null> {
    return prisma.lead.findFirst({ where: { website } });
  }

  static async upsertScrapedLead(item: ScrapedLead, city: string, category: string): Promise<Lead> {
    if (!item.placeId) {
      throw new AppError("Critical Data Error: placeId is required for lead upsert", "BAD_REQUEST", 400);
    }
    
    return prisma.lead.upsert({
      where: { placeId: item.placeId },
      update: {
        lastScrapedAt: new Date(),
        rating: item.rating ?? undefined,
        reviewsCount: item.reviewsCount ?? undefined,
        website: item.website ?? undefined,
        phone: item.phone ?? undefined,
      },
      create: {
        businessName: item.title,
        placeId: item.placeId,
        website: item.website || null,
        phone: item.phone || null,
        rating: item.rating || null,
        reviewsCount: item.reviewsCount || 0,
        city: city,
        category: category,
        status: "SCRAPED",
        lastScrapedAt: new Date(),
      },
    });
  }

  static async updateStatus(id: string, status: LeadStatus, data: Partial<Lead> = {}): Promise<Lead> {
    try {
      return await prisma.lead.update({
        where: { id },
        data: {
          ...data,
          status,
        },
      });
    } catch (error) {
      throw new AppError("Failed to update lead status", "DATABASE_ERROR", 500, error);
    }
  }

  static async getLeads(params: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    rating?: string;
    category?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  } = {}) {
    const {
      page = 1,
      limit = 50,
      q,
      status,
      rating,
      category,
      sortBy = 'createdAt',
      sortDir = 'desc'
    } = params;
    
    const skip = (page - 1) * limit;

    const where: any = {};
    if (q) {
      where.OR = [
        { businessName: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (status && status !== 'all') where.status = status;
    if (category && category !== 'all') where.category = category;
    if (rating && rating !== 'all') {
      if (rating === 'low') where.rating = { lt: 3 };
      if (rating === 'mid') where.rating = { gte: 3, lt: 4 };
      if (rating === 'high') where.rating = { gte: 4 };
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortDir }
      }),
      prisma.lead.count({ where })
    ]);

    return {
      data: leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getLeadsByIds(ids: string[]): Promise<Lead[]> {
    return prisma.lead.findMany({
      where: {
        id: { in: ids }
      }
    });
  }

  static async deleteLead(id: string): Promise<Lead> {
    try {
      return await prisma.lead.delete({
        where: { id }
      });
    } catch (error) {
      throw new AppError(`Failed to delete lead with ID ${id}`, "DATABASE_ERROR", 500, error);
    }
  }

  static async bulkDeleteLeads(ids: string[]): Promise<{ count: number }> {
    try {
      return await prisma.lead.deleteMany({
        where: {
          id: { in: ids }
        }
      });
    } catch (error) {
      throw new AppError("Failed to perform bulk delete", "DATABASE_ERROR", 500, error);
    }
  }
}
