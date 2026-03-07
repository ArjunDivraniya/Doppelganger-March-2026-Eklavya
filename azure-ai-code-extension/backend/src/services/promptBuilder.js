/**
 * Prompt Builder
 * Constructs the messages array for the Groq chat completion API.
 * Combines system instructions, retrieved documentation, and developer code context.
 */

/**
 * Build the LLM messages array.
 * @param {{ retrievedDocs: string, codeContext: string, currentLine: string, language: string, analysis: object }} opts
 * @returns {{ role: string, content: string }[]}
 */
exports.build = ({ retrievedDocs, codeContext, currentLine, language, analysis }) => {
    const systemPrompt = buildSystemPrompt(retrievedDocs, analysis);
    const userPrompt = buildUserPrompt(codeContext, currentLine, language, analysis);

    return [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ];
};

// ── Internal helpers ───────────────────────────────────

function buildSystemPrompt(retrievedDocs, analysis) {
    return `You are an expert Azure SDK developer assistant.
Your task is to generate accurate, production-ready code completions for Azure SDK usage.

Rules:
- Return ONLY the code snippet that completes the current line or block.
- Do NOT include explanations, comments, or markdown formatting.
- Follow Azure SDK best practices and official API patterns.
- Use the correct SDK methods for ${analysis.sdkType}.
- The developer's intent is: ${analysis.intent}.

${retrievedDocs ? `Relevant Azure SDK Documentation:\n${retrievedDocs}` : ''}`.trim();
}

function buildUserPrompt(codeContext, currentLine, language, analysis) {
    return `Language: ${language}
Azure SDK: ${analysis.sdkType}
Intent: ${analysis.intent}
Code Location: ${analysis.codeLocation}

${codeContext ? `Existing Code:\n\`\`\`${language}\n${codeContext}\n\`\`\`\n` : ''}Current Line to Complete:
\`\`\`${language}
${currentLine}
\`\`\`

Generate the correct code completion. Return ONLY the code — no explanations.`.trim();
}
