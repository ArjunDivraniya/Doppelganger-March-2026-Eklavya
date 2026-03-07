/**
 * Prompt Builder
 * Builds a single instruction prompt that combines retrieval context and current
 * developer code for the generation model.
 */

/**
 * @param {{ userCode: string, retrievedDocs: string[] }} opts
 * @returns {string}
 */
exports.buildPrompt = ({ userCode, retrievedDocs }) => {
    const docsText = Array.isArray(retrievedDocs) ? retrievedDocs.filter(Boolean).join('\n\n---\n\n') : '';

    return `You are an expert Azure SDK assistant.

Use the following documentation context to generate a correct Azure SDK code suggestion.

Documentation:
${docsText || 'No documentation retrieved.'}

Developer Code Context:
${userCode || 'No code context provided.'}

Task:
Suggest the next Azure SDK code snippet.`.trim();
};
