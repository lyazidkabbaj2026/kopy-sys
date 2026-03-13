import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.warn("⚠️ GROQ_API_KEY is missing from environment variables. AI personalization will not work.");
}

export const groq = new Groq({
    apiKey: apiKey || "BUILD_TIME_PLACEHOLDER",
});
