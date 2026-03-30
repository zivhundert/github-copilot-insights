# Contributing to GitHub Copilot Adoption Insights

Thank you for your interest in contributing! This guide will help you get started.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/amitrok1/remix-of-github-adoption-insights.git
cd remix-of-github-adoption-insights

# Install dependencies
npm install

# Copy the env template
cp .env.example .env

# Start the dev server
npm run dev
```

The app runs at `http://localhost:8080`.

## Optional Features

### AI Chat (DevIntelligence)

To enable the chat assistant, add a Gemini API key to your `.env`:

```
GEMINI_API_KEY=your_key_here
```

Get a key at https://aistudio.google.com/apikey. The chat feature only works during local development (Vite dev server).

### GitHub Enterprise Auto-Fetch

To auto-fetch Copilot metrics at build time, set these in `.env.local`:

```
GITHUB_BASE_URL=https://api.github.com
GITHUB_PAT=ghp_...
GITHUB_ENTERPRISE=your-enterprise-slug
VITE_GITHUB_ENTERPRISE=your-enterprise-slug
```

Without these, the app still works — users upload NDJSON files manually.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm run build:dev` | Development build (includes dev plugins) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |
| `npm run fetch-data` | Fetch Copilot data from GitHub API |

## Project Structure

```
src/
├── components/     # React components
│   ├── dashboard/  # Dashboard-specific components
│   ├── landing/    # Landing page
│   ├── common/     # Shared components
│   └── ui/         # shadcn/ui primitives
├── hooks/          # Custom React hooks
├── services/       # API and analytics services
├── utils/          # Helper functions
├── contexts/       # React contexts
├── config/         # Chart and app configuration
└── pages/          # Route pages
server/             # Vite dev server plugins (chat API)
scripts/            # Build-time scripts
```

## Pull Request Process

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `npm run lint` and fix any issues
4. Run `npm run build` to ensure it compiles
5. Submit a PR with a clear description of the change

## Code Style

- TypeScript with React 18
- Tailwind CSS for styling
- shadcn/ui for UI primitives
- Highcharts for data visualization
- Follow existing patterns in the codebase

## Reporting Issues

Use [GitHub Issues](https://github.com/amitrok1/remix-of-github-adoption-insights/issues) to report bugs or request features.
