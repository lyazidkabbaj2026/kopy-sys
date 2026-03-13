import * as cheerio from 'cheerio';

export interface AuditResult {
    score: number;
    issues: string[];
}

export const analyzeWebsite = async (url: string): Promise<AuditResult> => {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 }
        });

        if (!response.ok) throw new Error(`Failed to fetch website: ${response.statusText}`);

        const html = await response.text();
        const $ = cheerio.load(html);
        const issues: string[] = [];
        let score = 100;

        // 1. Meta Tags Check
        const title = $('title').text();
        if (!title || title.length < 10) {
            issues.push("Missing or short SEO title");
            score -= 15;
        }

        const description = $('meta[name="description"]').attr('content');
        if (!description) {
            issues.push("Missing meta description");
            score -= 15;
        }

        // 2. Mobile Optimization (Viewport Tag)
        const viewport = $('meta[name="viewport"]').attr('content');
        if (!viewport) {
            issues.push("Missing viewport tag (Not mobile optimized)");
            score -= 20;
        }

        // 3. SSL Check (Simple protocol check)
        if (!url.startsWith('https')) {
            issues.push("Not using HTTPS");
            score -= 20;
        }

        // 4. Content Analysis
        const h1 = $('h1').length;
        if (h1 === 0) {
            issues.push("Missing H1 heading");
            score -= 10;
        } else if (h1 > 1) {
            issues.push("Multiple H1 headings (Bad for SEO)");
            score -= 5;
        }

        // 5. Performance Indicators (Simple check for large quantity of scripts)
        const scripts = $('script').length;
        if (scripts > 50) {
            issues.push("Too many external scripts (Potential performance lag)");
            score -= 10;
        }

        return {
            score: Math.max(0, score),
            issues
        };
    } catch (error: any) {
        console.error(`Audit error for ${url}:`, error.message);
        return {
            score: 0,
            issues: [`Failed to analyze website: ${error.message}`]
        };
    }
};
