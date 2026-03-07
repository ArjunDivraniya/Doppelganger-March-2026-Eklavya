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
 *   { language, imports[], currentLine, context, cursorPosition? }
 *
 * Response:
 *   { suggestion: string }
 */
exports.handleSuggest = async (req, res, next) => {
    try {
        const { language, imports, currentLine, context, cursorPosition } = req.body;

        // ── Validate required fields ───────────────────────
        if (!language || !currentLine) {
            return res.status(400).json({
                error: 'Missing required fields: "language" and "currentLine" are required.',
            });
        }

        const startTime = Date.now();

        // Step 1 — Analyze the code context
        const analysis = contextAnalyzer.analyze({ 
            language, 
            imports, 
            currentLine, 
            context, 
            cursorPosition 
        });

        const userCode = [context, currentLine].filter(Boolean).join('\n');
        const userQuery = `${analysis.sdkType} ${analysis.intent} ${currentLine}`.trim();

        // Step 2 — Retrieve relevant documentation via vector search
        const docs = await ragService.retrieveRelevantDocs(userQuery, { 
            sdkType: analysis.sdkType 
        });

        // Step 3 — Build prompt for the LLM
        const prompt = promptBuilder.buildPrompt({
            userCode,
            retrievedDocs: docs,
        });

        // Step 4 — Call the LLM
        const rawSuggestion = await llmService.generate(prompt);

        // Step 5 — Post-process the response
        const suggestion = responseProcessor.process(rawSuggestion);

        const latency = Date.now() - startTime;
        console.log(
            `[SUGGEST] Completed in ${latency}ms | SDK: ${analysis.sdkType} | Intent: ${analysis.intent} | RetrievedDocs: ${docs.length}`
        );

        res.json({ suggestion });
    } catch (err) {
        next(err);
    }
};
