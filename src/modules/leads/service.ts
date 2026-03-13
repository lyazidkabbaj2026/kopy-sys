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

  static async getAllLeads() {
    return prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
