# Extension Source (`extension/src`)

Core TypeScript source for the VS Code extension runtime.

This folder contains the logic that detects Azure context in the editor, requests AI suggestions from the backend, renders inline ghost text, and handles acceptance/feedback flows.

## Purpose
- Activate extension features for supported languages.
- Detect Azure SDK intent while user types.
- Build request context from editor state.
- Fetch and filter suggestions from backend.
- Provide inline completions and import fixes.
- Send feedback and log debug telemetry.

## File Map
- `extension.ts`: Entry point (`activate`). Registers commands, inline provider, quick-fix provider, watcher, and webview messaging bridge.
- `inlineProvider.ts`: Copilot-style inline completion provider (`registerInlineCompletionItemProvider`).
- `codeWatcher.ts`: Debounced typing watcher and manual trigger orchestrator.
- `azureDetector.ts`: Azure context detection using imports, keywords, and file-pattern signals.
- `contextBuilder.ts`: Builds `CodeContext` payload (line, surrounding code, cursor, imports, services).
- `apiService.ts`: Calls backend `/suggest`, cleans output, deduplicates overlaps, tracks accepted suggestions, applies fallback behavior.
- `feedbackService.ts`: Posts feedback to backend `/feedback` and derives lightweight intent tags.
- `importFixer.ts`: Quick Fix provider for unresolved Azure symbols.
- `importInjector.ts`: Auto-injects known Azure imports when suggestion is accepted.
- `config.ts`: Runtime flags and backend URL selection.
- `logger.ts`: Structured logs to `AzureAI Debug` output channel.
- `mockData.ts`: Local fallback suggestion snippets used when backend is disabled/unavailable.

## Runtime Flow
```text
User types code
  -> inlineProvider/codeWatcher
  -> azureDetector
  -> contextBuilder
  -> apiService (POST /suggest)
  -> suggestion cleanup + dedupe
  -> ghost text shown in editor
  -> accept suggestion command
  -> import injection + accepted tracking
  -> optional feedback (POST /feedback)
```

## Supported Languages
- TypeScript
- JavaScript
- TSX
- JSX
- C#

Configured in `extension.ts` and `inlineProvider.ts`.

## Commands Registered (from this source layer)
- `azureai.suggest`
- `azureai.showDebugLogs`
- `azureai.debugProbe`
- `azureai.acceptSuggestion`

## Development Notes
- Inline suggestions require VS Code setting: `editor.inlineSuggest.enabled = true`.
- Backend URL and behavior flags are controlled via `config.ts`.
- Debug output is available in the `AzureAI Debug` output channel.
- Import automation currently uses symbol/string matching, not AST transforms.

## Local Work
From `extension/` root:

```bash
npm install
npm run watch
```

Then run extension host using VS Code `F5`.

## Related Docs
- `../EXTENSION_ANALYSIS.md`
- `../../docs/architecture.md`
- `../../docs/extension-flow.md`
- `../../backend/README.md`
