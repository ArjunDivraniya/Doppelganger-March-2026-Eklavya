/**
 * Response Processor
 * Cleans the raw LLM output so only valid code is returned to the extension.
 */

/**
 * Process raw LLM text and extract clean code.
 * @param {string} raw — raw text from the LLM
 * @returns {string} — clean code snippet
 */
exports.process = (raw) => {
    if (!raw || typeof raw !== 'string') return '';

    let cleaned = raw.trim();

    // Remove markdown code fences (```language ... ```)
    cleaned = stripCodeFences(cleaned);

    // Remove common LLM prefixes / explanations
    cleaned = stripExplanations(cleaned);

    // Final trim
    cleaned = cleaned.trim();

    return cleaned;
};

// ── Internal helpers ───────────────────────────────────

function stripCodeFences(text) {
    // Match ```lang\n...\n``` or ```\n...\n```
    const fenceRegex = /^```[\w]*\n?([\s\S]*?)```$/;
    const match = text.match(fenceRegex);
    if (match) return match[1].trim();

    // Also handle inline single backticks
    if (text.startsWith('`') && text.endsWith('`')) {
        return text.slice(1, -1).trim();
    }

    return text;
}

function stripExplanations(text) {
    const lines = text.split('\n');
    const codeLines = [];
    let foundCode = false;

    for (const line of lines) {
        // Skip lines that look like explanations
        if (!foundCode && isExplanationLine(line)) continue;

        foundCode = true;
        // Stop if we hit trailing explanation after code
        if (foundCode && codeLines.length > 0 && isExplanationLine(line) && !looksLikeCode(line)) break;

        codeLines.push(line);
    }

    return codeLines.join('\n').trim();
}

function isExplanationLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return false;
    // Lines starting with "Here", "This", "The", "Note:", "Output:", "Explanation:" etc.
    return /^(Here|This|The|Note|Output|Explanation|Sure|I'll|Below|Above|Let me)/i.test(trimmed);
}

function looksLikeCode(line) {
    const trimmed = line.trim();
    // Heuristic: code usually has symbols like =, (, ), {, }, ;, etc.
    return /[=(){};[\]<>]/.test(trimmed) || trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('import ') || trimmed.startsWith('await ') || trimmed.startsWith('//');
}
