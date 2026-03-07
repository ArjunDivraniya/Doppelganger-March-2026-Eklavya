# Extension Architecture

## Overview
The extension detects Azure SDK usage and requests AI-powered suggestions.

## Components
- **Extension Core**: Manages lifecycle and commands.
- **Listeners**: Watches for code changes.
- **Webview**: Renders UI for suggestions using React.
- **Backend API**: Bridges to Azure OpenAI.
