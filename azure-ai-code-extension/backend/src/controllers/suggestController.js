const contextAnalyzer = require('../services/contextAnalyzer');
const ragService = require('../services/ragService');
const promptBuilder = require('../services/promptBuilder');
const llmService = require('../services/llmService');
const responseProcessor = require('../services/responseProcessor');

/**
 * POST /suggest
 * Receives code context from the VS Code extension and returns an AI-generated
 * Azure SDK code suggestion.
 *
 * Request body:
 *   { language, imports[], currentLine, context }
 *
 * Response:
 *   { suggestion: string }
 */
exports.handleSuggest = async (req, res, next) => {
    try {
        const { language, imports, currentLine, context } = req.body;

        // ── Validate required fields ───────────────────────
        if (!language || !currentLine) {
            return res.status(400).json({
                error: 'Missing required fields: "language" and "currentLine" are required.',
            });
        }

        const startTime = Date.now();

        // Step 1 — Analyze the code context
        const analysis = contextAnalyzer.analyze({ language, imports, currentLine, context });

        // Step 2 — Retrieve relevant documentation (RAG – stub)
        const retrievedDocs = await ragService.retrieveDocumentation(analysis.sdkType, analysis.intent);

        // Step 3 — Build the LLM prompt
        const messages = promptBuilder.build({
            retrievedDocs,
            codeContext: context || '',
            currentLine,
            language,
            analysis,
        });

        // Step 4 — Call the LLM
        const rawSuggestion = await llmService.generateCompletion(messages);

        // Step 5 — Post-process the response
        const suggestion = responseProcessor.process(rawSuggestion);

        const latency = Date.now() - startTime;
        console.log(`[SUGGEST] Completed in ${latency}ms | SDK: ${analysis.sdkType} | Intent: ${analysis.intent}`);

        res.json({ suggestion });
    } catch (err) {
        next(err);
    }
};
