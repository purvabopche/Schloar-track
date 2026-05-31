"use server";

export async function generateAdminInsights(stats: any, recentApps: any[]) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API key is not configured");

        const prompt = `You are the AI System Administrator for a high-end Scholarship Management System. You are addressing the human Admin. Here are the current system stats: ${JSON.stringify(stats)}. Number of applications awaiting final disbursement: ${recentApps.length}. 
Please provide a 2-3 sentence executive summary of the platform's current state. Offer a quick insight or action item regarding the pending disbursements or overall application volume. Keep it professional, concise, and do not use markdown characters or lists.`;

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": apiKey
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            console.error("Gemini API Error", await response.text());
            return "Unable to retrieve AI insights at this time.";
        }

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No insights generated.";
    } catch (error) {
        console.error("Error generating insights:", error);
        return "System offline. AI Analysis unavailable.";
    }
}
