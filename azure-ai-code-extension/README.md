# AI Powered Azure Code Assistant

VS Code extension that detects Azure SDK usage and provides AI-powered code suggestions via Azure OpenAI.

## Project Structure

- `extension/`: VS Code Extension (TypeScript + React + Tailwind)
- `backend/`: Node.js Express API
- `shared/`: Shared TypeScript types and constants
- `docs/`: Technical documentation
- `scripts/`: Development and installation scripts

## Getting Started

1. Run `.\scripts\install-all.ps1` to install dependencies.
2. Configure `.env` files in `root` and `backend/`.
3. Run `.\scripts\start-dev.ps1` to start development servers.
