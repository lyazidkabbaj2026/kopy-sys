"use server";

import { LeadService } from "@/modules/leads/service";
import { analyzeWebsite } from "@/modules/audit/analyzer";
import { generatePersonalizedMessage } from "@/modules/ghostwriter/personalizer";
import { AppError } from "@/lib/errors";
import { Lead } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function deleteLeadAction(id: string) {
    try {
        await LeadService.deleteLead(id);
        revalidatePath("/");
        return { success: true };
    } catch (error: unknown) {
        console.error("[Action Error] deleteLeadAction:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Delete failed" 
        };
    }
}

export async function bulkDeleteLeadsAction(ids: string[]) {
    try {
        await LeadService.bulkDeleteLeads(ids);
        revalidatePath("/");
        return { success: true };
    } catch (error: unknown) {
        console.error("[Action Error] bulkDeleteLeadsAction:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Bulk delete failed" 
        };
    }
}

export async function auditLeadAction(id: string) {
    try {
        const lead = await LeadService.findById(id);
        if (!lead.website) {
            throw new AppError("Lead has no website to audit", "BAD_REQUEST", 400);
        }
        
        const result = await analyzeWebsite(lead.website);
        
        // Update lead with audit results
        await LeadService.updateStatus(id, "AUDITED", {
            auditScore: result.score,
            auditIssues: result.issues
        });

        revalidatePath("/");
        return { success: true, data: result };
    } catch (error: unknown) {
        console.error("[Action Error] auditLeadAction:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Audit failed" 
        };
    }
}

export async function personalizeLeadAction(id: string) {
    try {
        const lead = await LeadService.findById(id);
        
        // Pass the lead as context (LeadContext matches Lead properties)
        const result = await generatePersonalizedMessage(lead);
        
        // Update lead with AI draft
        await LeadService.updateStatus(id, "MESSAGED", {
            aiMessageDraft: result
        });

        revalidatePath("/");
        return { success: true, data: result };
    } catch (error: unknown) {
        console.error("[Action Error] personalizeLeadAction:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Personalization failed" 
        };
    }
}

export async function exportLeadsAction(
    filters?: Record<string, string | undefined>, 
    selectedIds?: string[]
) {
    try {
        let leads: Lead[];
        if (selectedIds && selectedIds.length > 0) {
            leads = await LeadService.getLeadsByIds(selectedIds);
        } else {
            const result = await LeadService.getLeads(filters || {});
            leads = result.data;
        }

        const headers = ["Business Name", "Category", "Rating", "Reviews", "City", "Status", "Website", "Phone", "Scraped Date"];
        const rows = leads.map((l: Lead) => [
            `"${l.businessName.replace(/"/g, '""')}"`,
            `"${(l.category || "N/A").replace(/"/g, '""')}"`,
            l.rating || "N/A",
            l.reviewsCount || 0,
            `"${(l.city || "N/A").replace(/"/g, '""')}"`,
            l.status,
            `"${(l.website || "N/A").replace(/"/g, '""')}"`,
            `"${(l.phone || "N/A").replace(/"/g, '""')}"`,
            new Date(l.createdAt).toISOString().split('T')[0]
        ]);

        const csvContent = [headers.join(","), ...rows.map((r: (string | number)[]) => r.join(","))].join("\n");
        return { success: true, data: csvContent };
    } catch (error: unknown) {
        console.error("[Action Error] exportLeadsAction:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Export failed" 
        };
    }
}
