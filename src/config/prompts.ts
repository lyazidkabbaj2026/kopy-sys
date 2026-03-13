import { env } from "./env";

interface PersonalizationPromptArgs {
    businessName: string;
    category?: string | null;
    city?: string | null;
    auditScore?: number | null;
    auditIssues?: string[] | null;
}

export const getPersonalizationPrompt = ({
    businessName,
    category,
    city,
    auditScore,
    auditIssues
}: PersonalizationPromptArgs) => {
    const issuesList = auditIssues?.join(", ") || "no major technical issues found";
    
    return `
        You are an expert B2B sales copywriter specializing in the Moroccan market.
        Write a professional, short, and highly personalized cold outreach message for ${businessName}.
        
        Context:
        - Category: ${category || "General Business"}
        - Location: ${city || env.DEFAULT_CITY}
        - Website Audit Score: ${auditScore || "N/A"}/100
        - Known Issues: ${issuesList}
        
        STRICT RULES:
        1. Use a mix of Professional French (80%) and friendly Moroccan Darija (20%).
        2. Specifically reference one of their website audit issues as a pain point if available.
        3. The tone must be premium, helpful, and localized (Moroccan context).
        4. Do NOT use placeholders like [Your Name]. End with "L'équipe ${env.BRAND_NAME}".
        5. Keep it under 100 words.
        
        Response format: Just the message text.
    `;
};
