# Extension Flow

1. User opens a file with Azure SDK usage.
2. `codeWatcher` detects the pattern.
3. Extension sends context to `apiService`.
4. `apiService` calls Backend API `/suggest`.
5. Backend calls Azure OpenAI.
6. Suggestion is returned and displayed in the Extension Webview.
