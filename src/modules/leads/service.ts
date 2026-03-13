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

  static async getLeads(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.lead.count()
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

  static async delete(id: string): Promise<Lead> {
    try {
      return await prisma.lead.delete({
        where: { id }
      });
    } catch (error) {
      throw new AppError(`Failed to delete lead with ID ${id}`, "DATABASE_ERROR", 500, error);
    }
  }

  static async bulkDelete(ids: string[]): Promise<{ count: number }> {
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
