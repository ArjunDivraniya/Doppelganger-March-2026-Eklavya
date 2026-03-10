# Azure AI Assist Frontend Website Overview

## What This Website Is
This website is the landing page for the **Azure AI Assist** VS Code extension. It presents the product, explains how it works, and demonstrates how developers get AI-powered Azure SDK code suggestions directly inside VS Code.

It is built with React + TypeScript + Vite and uses animated UI sections to show the extension workflow.

## Main Purpose
- Introduce Azure AI Assist to developers.
- Show the extension workflow from installation to suggestion acceptance.
- Demonstrate AI inline suggestions with an interactive mock editor.
- Build trust with feature explanations and a feedback/review experience.
- Encourage installation from the VS Code Marketplace.

## Website Sections

### 1. Navbar
- Sticky, animated top navigation.
- Links: `Overview`, `How It Works`, `Features`, `Demo`, `Feedback`.
- Primary CTA button: `Install Extension` (opens VS Code Marketplace).
- Mobile menu support.

### 2. Hero Section
- Big headline: **Azure AI Assistant for VS Code**.
- Typewriter subtitle describing intelligent Azure SDK suggestions.
- Animated visual background with floating Azure and VS Code logos.
- CTAs:
  - `Install Extension`
  - `See How It Works`

### 3. Overview Section
Shows a 4-step high-level journey:
1. Install from Marketplace.
2. Start typing Azure SDK code.
3. Receive intelligent inline suggestions.
4. Press `TAB` to accept.

Each step has descriptive details and a visual preview panel.

### 4. How It Works Section
Detailed technical flow in 4 stages:
1. User writes Azure-related code.
2. Extension detects Azure context/patterns.
3. Azure OpenAI + RAG generates a relevant suggestion.
4. User accepts (Tab) or ignores.

Hover interactions reveal more details and visuals.

### 5. Features Section
Highlights key product capabilities:
- Intelligent inline (ghost text) suggestions.
- Automatic Azure context detection.
- RAG-enhanced accuracy using documentation grounding.

Presented as alternating feature cards with visuals and bullet points.

### 6. Demo Section
Interactive simulation of the extension behavior:
- Mock VS Code editor UI.
- Suggestion appears as ghost text while typing.
- User can press `TAB` or click a button to accept suggestion.
- Acceptance updates code and status bar in the demo.

### 7. Feedback Section
Represents post-suggestion feedback workflow:
- Star rating input (1-5).
- Optional text feedback submission.
- Live-style recent review feed.
- Example product metrics (average rating, total reviews, helpfulness).

### 8. Footer
- Credits `Team Eklavya`.
- Mentions `Powered by Azure OpenAI`.

## User Journey Summary
A visitor lands on the page, understands the extension value quickly, learns the technical flow, sees a practical demo, checks social proof via feedback/reviews, and is pushed toward installing from the VS Code Marketplace.

## Notes
- Current visuals use placeholder image asset paths (`/image.png`) across multiple sections.
- The content and interactions are optimized for a product demo/landing page experience rather than a documentation portal.
