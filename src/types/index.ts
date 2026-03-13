import { Lead, LeadStatus } from "@prisma/client";

export type { Lead, LeadStatus };

export interface ApifyUser {
  id: string;
  username: string;
  email: string;
  currentBillingPeriodUsage?: {
    remainingSubscriptionCredits: number;
    cycleEndsAt: string;
  };
}

export interface ScrapedLead {
  title: string;
  website?: string | null;
  phone?: string | null;
  placeId: string;
  rating?: number | null;
  reviewsCount?: number | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  count?: number;
}


export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LeadContext {
    businessName: string;
    category?: string | null;
    city?: string | null;
    auditScore?: number | null;
    auditIssues?: string[] | null;
}
