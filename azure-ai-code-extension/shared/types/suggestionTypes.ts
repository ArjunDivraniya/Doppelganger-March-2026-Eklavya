export interface SuggestionRequest {
    codeContext: string;
    language: string;
}

export interface SuggestionResponse {
    suggestion: string;
    confidence: number;
}
