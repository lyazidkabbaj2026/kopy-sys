import { groq } from "./groq";
import { env } from "@/config/env";
import { LeadContext } from "@/types";
import { AppError } from "@/lib/errors";

export const generatePersonalizedMessage = async (context: LeadContext) => {
    const issuesList = context.auditIssues?.join(", ") || "no major technical issues found";
    
    const prompt = `
        You are an expert B2B sales copywriter specializing in the Moroccan market.
        Write a professional, short, and highly personalized cold outreach message for ${context.businessName}.
        
        Context:
        - Category: ${context.category || "General Business"}
        - Location: ${context.city || env.DEFAULT_CITY}
        - Website Audit Score: ${context.auditScore || "N/A"}/100
        - Known Issues: ${issuesList}
        
        STRICT RULES:
        1. Use a mix of Professional French (80%) and friendly Moroccan Darija (20%).
        2. Specifically reference one of their website audit issues as a pain point if available.
        3. The tone must be premium, helpful, and localized (Moroccan context).
        4. Do NOT use placeholders like [Your Name]. End with "L'équipe ${env.BRAND_NAME}".
        5. Keep it under 100 words.
        
        Response format: Just the message text.
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: env.GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 500,
        });

        const content = completion.choices[0]?.message?.content;
        
        if (!content) {
            throw new Error("Empty response from AI");
        }

        return content;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Groq Personalization Error:", message);
        throw new AppError(
            "Failed to generate AI message", 
            "AI_GENERATION_FAILED", 
            500, 
            error
        );
    }
};

