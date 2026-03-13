"use server";

import { LeadService } from "@/modules/leads/service";
import { analyzeWebsite } from "@/modules/audit/analyzer";
import { generatePersonalizedMessage } from "@/modules/ghostwriter/personalizer";
import { AppError } from "@/lib/errors";

export async function deleteLeadAction(id: string) {
    try {
        await LeadService.deleteLead(id);
        return { success: true };
    } catch (error: unknown) {
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Delete failed" 
        };
    }
}

export async function bulkDeleteLeadsAction(ids: string[]) {
    try {
        await LeadService.bulkDeleteLeads(ids);
        return { success: true };
    } catch (error: unknown) {
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

        return { success: true, data: result };
    } catch (error: unknown) {
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

        return { success: true, data: result };
    } catch (error: unknown) {
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Personalization failed" 
        };
    }
}
