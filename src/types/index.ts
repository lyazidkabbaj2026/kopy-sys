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
  website?: string;
  phone?: string;
  placeId: string;
  rating?: number;
  reviewsCount?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}
