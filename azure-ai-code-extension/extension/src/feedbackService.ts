// FEEDBACK SERVICE — sends user ratings to backend

import axios from "axios";

export interface FeedbackData {
    suggestion: string;
    rating: "positive" | "negative";
    sdkType: string;
    intent: string;
}

export async function sendFeedback(
    data: FeedbackData,
    backendUrl: string
): Promise<boolean> {
    try {
        const body = {
            suggestion: data.suggestion,
            rating: data.rating,
            sdkType: data.sdkType,
            intent: data.intent
        };

        const response = await axios.post(
            `${backendUrl}/feedback`,
            body,
            {
                headers: { "Content-Type": "application/json" },
                timeout: 5000
            }
        );

        if (response.status === 200 || response.status === 201) {
            console.log("[feedbackService] ✅ Feedback sent:", data.rating);
            return true;
        }

        return false;
    } catch (err: any) {
        console.log("[feedbackService] ❌ Failed:", err.message);
        return false;
    }
}

export function detectIntent(
    currentLine: string,
    detectedService: string
): string {
    const line = currentLine.toLowerCase();
    if (line.includes("new") || line.includes("create") || line.includes("client")) return "create-client";
    if (line.includes("upload") || line.includes("send") || line.includes("put")) return "upload-data";
    if (line.includes("download") || line.includes("get") || line.includes("read")) return "read-data";
    if (line.includes("delete") || line.includes("remove")) return "delete-resource";
    if (line.includes("list") || line.includes("query") || line.includes("fetch")) return "query-data";
    if (line.includes("auth") || line.includes("credential") || line.includes("token")) return "authentication";

    return "general-" + detectedService;
}
