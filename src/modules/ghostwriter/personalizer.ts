import { groq } from "./groq";

interface LeadContext {
    businessName: string;
    category?: string | null;
    city?: string | null;
    auditScore?: number | null;
    auditIssues?: string[] | null;
}

export const generatePersonalizedMessage = async (context: LeadContext) => {
    const issuesList = context.auditIssues?.join(", ") || "no major technical issues found";
    
    const prompt = `
        You are an expert B2B sales copywriter specializing in the Moroccan market.
        Write a professional, short, and highly personalized cold outreach message to the following business:
        
        Business Name: ${context.businessName}
        Category: ${context.category || "General Business"}
        Location: ${context.city || "Morocco"}
        Website Audit Score: ${context.auditScore || "N/A"}/100
        Known Issues: ${issuesList}
        
        STRICT RULES:
        1. Use a mix of Professional French (80%) and friendly Moroccan Darija (20%).
        2. Specifically reference one of their website audit issues as a pain point if available.
        3. The tone must be premium, helpful, and localized (Moroccan context).
        4. Do NOT use placeholders like [Your Name]. End with "L'équipe NXSURGE".
        5. Keep it under 100 words.
        
        Response format: Just the message text.
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-8b-8192",
            temperature: 0.7,
            max_tokens: 500,
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error: any) {
        console.error("Groq Personalization Error:", error.message);
        throw new Error("Failed to generate AI message.");
    }
};
