import { groq } from "./groq";
import { env } from "@/config/env";
import { LeadContext } from "@/types";
import { AppError } from "@/lib/errors";
import { getPersonalizationPrompt } from "@/config/prompts";

export const generatePersonalizedMessage = async (context: LeadContext) => {
    const prompt = getPersonalizationPrompt({
        businessName: context.businessName,
        category: context.category,
        city: context.city,
        auditScore: context.auditScore,
        auditIssues: context.auditIssues
    });

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: env.GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 500,
        });

        const content = completion.choices[0]?.message?.content;
        
        if (!content) {
            throw new AppError("Empty response from AI", "AI_GENERATION_FAILED", 500);
        }

        return content;
    } catch (error: unknown) {
        if (error instanceof AppError) throw error;

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

