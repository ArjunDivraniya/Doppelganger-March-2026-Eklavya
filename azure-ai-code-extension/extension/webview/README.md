# Extension Webview (`extension/webview`)

React + TypeScript UI rendered inside VS Code as the suggestion dashboard panel.

This app is not a standalone product page. It is the in-editor webview surface that receives suggestion events from the extension host and presents them in a polished UI.

## Purpose
- Display suggestion cards when the extension generates completions.
- Provide a richer, visual companion to inline ghost text.
- Keep developers inside VS Code while reviewing generated code.

## Runtime Integration
The extension host (`extension/src/extension.ts`) opens a webview panel and posts messages into this app.

Current inbound message pattern used by `src/App.tsx`:

```ts
{
  type: "suggestion",
  suggestion: string,
  service: string,
  sdkType?: string,
  intent?: string,
  triggerLine?: string
}
```

`App.tsx` listens to `window.message` events and maps payload to `SuggestionPanel` items.

## Folder Structure
```text
webview/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── App.css
│   ├── index.css
│   └── components/
│       ├── Header.tsx
│       ├── SuggestionPanel.tsx
│       ├── SuggestionCard.tsx
│       ├── LoadingState.tsx
│       └── BackgroundAnimation.tsx
├── public/
├── package.json
└── vite.config.ts
```

## UI Flow
1. Webview opens and shows `LoadingState` when there is no suggestion.
2. Extension posts a `type: "suggestion"` message.
3. App updates state and renders `SuggestionPanel`.
4. Footer displays runtime status branding (`Azure AI Assistant`, version, RAG/LLM tags).

## Development
From `extension/webview`:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Tech Stack
- React 19
- TypeScript
- Vite 7
- Framer Motion
- Lucide React icons

## Important Notes
- This app depends on extension-side message posting; in plain browser mode, it will stay in loading state until a message is sent.
- Keep message contracts synchronized with `extension/src/extension.ts` when adding new interaction types.
- Use this folder for webview UI only; marketing site UI lives in `extension/frontend`.

## Related Docs
- `../EXTENSION_ANALYSIS.md`
- `../src/README.md`
- `../../docs/extension-flow.md`
