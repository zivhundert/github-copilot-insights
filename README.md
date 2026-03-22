# AI Development Intelligence Dashboard

A modern analytics dashboard for tracking GitHub Copilot adoption and ROI across your engineering team. Upload your Copilot usage data or connect directly to the GitHub Enterprise API to get actionable insights.

## Features

### 📊 Metrics at a Glance
- **Total AI Code Added** — lines accepted through Copilot workflows
- **Acceptance Rate** — developer trust in AI suggestions
- **AI Code Amplification** — ratio of code added vs. suggested
- **Development Time Saved** — estimated hours saved (configurable)
- **Cost Savings & ROI** — financial impact of Copilot adoption

### 📈 15+ Interactive Charts
- Cumulative code trends over time
- Acceptance rate tracking
- Model usage distribution (GPT-4, Codex, etc.)
- Feature usage breakdown (chat, agent, completions, CLI)
- IDE distribution and version tracking
- Programming language treemap
- Agent adoption trends
- Model effectiveness comparison
- Language × Feature matrix heatmap
- Engagement heatmap
- Code churn analysis
- Day-of-week activity patterns
- Top contributors leaderboard with performance segments

### 🔍 Advanced Analysis
- **Adoption Insights Panel** — automated suggestions for underused features, with champion users highlighted
- **User Profile Cards** — click any user to see their detailed Copilot stats
- **User Comparison** — compare 2–5 users side by side across all metrics (key stats, modes, IDEs, models, languages, features)
- **Performance Segments** — Champion, Producer, Explorer, Starter classifications

### 🎛️ Filters & Settings
- Date range picker
- User selector (multi-select)
- Aggregation period (day / week / month)
- Configurable coding speed, hourly rate, and Copilot license cost
- Toggle visibility of individual charts
- Export dashboard as image

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)

### Installation

```bash
git clone <your-repo-url>
cd remix-of-github-adoption-insights
bun install     # or: npm install
```

### Running Locally

```bash
bun run dev     # or: npm run dev
```

This starts the Vite dev server (default: `http://localhost:5173`).

### Option A: Upload Data Manually

No configuration needed — just start the app and drag & drop your GitHub Copilot admin export (`.ndjson` or `.json` file) into the upload area.

### Option B: Auto-Fetch from GitHub Enterprise API

Create a `.env.local` file in the project root:

```env
# Enterprise slug (exposed to client for display purposes)
VITE_GITHUB_ENTERPRISE=your-enterprise-slug

# Server-side only (used by the build-time fetch script)
GITHUB_BASE_URL=https://api.your-enterprise.ghe.com
GITHUB_PAT=ghp_your_personal_access_token
```

With these set, `bun run dev` and `bun run build` will automatically fetch the latest 28-day Copilot metrics report and write it to `public/copilot_data.ndjson`. The app then loads this file on startup.

> **Note:** The GitHub Copilot Metrics API has a ~2 day processing delay. Data for today/yesterday may not be available yet.

#### Required PAT Permissions

Your Personal Access Token needs:
- `manage_billing:copilot` (or enterprise admin access)
- Read access to the Copilot usage reports endpoint

### Data Fetch Only

To fetch data without starting the dev server:

```bash
bun run fetch-data
```

## Building for Production

```bash
bun run build      # outputs to dist/
bun run preview    # preview the production build locally
```

## Project Structure

```
src/
├── pages/              # Page components (Index, NotFound)
├── components/
│   ├── common/         # Shared components (MetricCard, ChartContainer, PrivacyFooter)
│   ├── dashboard/      # Dashboard-specific components
│   │   ├── charts/     # All chart components (15+ charts)
│   │   ├── filters/    # Filter components (date, user, aggregation)
│   │   ├── DashboardHeader.tsx
│   │   ├── DashboardMetrics.tsx
│   │   ├── DashboardCharts.tsx
│   │   ├── DashboardFilters.tsx
│   │   ├── InsightsPanel.tsx
│   │   ├── UserCompareDialog.tsx
│   │   └── ...
│   └── ui/             # shadcn/ui primitives
├── hooks/              # Custom hooks (data loading, filtering, file upload)
├── contexts/           # React contexts (settings, dashboard guide)
├── services/           # GitHub API service, analytics
├── utils/              # Data aggregation, metrics calculation, export, parsing
├── config/             # Chart configurations
└── content/            # Dashboard guide content
scripts/
└── fetch-copilot-data.mjs   # Build-time data fetcher
public/
└── copilot_data.ndjson       # Pre-fetched data (auto-generated, gitignored)
```

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [React](https://react.dev/) 18 |
| Build Tool | [Vite](https://vite.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Charts | [Highcharts](https://www.highcharts.com/) |
| Data Fetching | [TanStack Query](https://tanstack.com/query) |
| Routing | [React Router](https://reactrouter.com/) |
| Runtime | [Bun](https://bun.sh/) (or Node.js) |

## Configuration

Dashboard settings are persisted in `localStorage` and can be adjusted via the ⚙️ Settings button:

| Setting | Default | Description |
|---------|---------|-------------|
| Coding Speed | 10 lines/min | Used to estimate time saved |
| Hourly Rate | $55/hr | Used to estimate cost savings |
| Copilot License Cost | $39/user/month | Used to calculate ROI |
| Chart Visibility | All on | Toggle individual charts on/off |

## Privacy

This dashboard runs entirely in the browser. No data is sent to external servers. The only network request is the optional GitHub Enterprise API fetch at build time. Anonymous usage analytics can be collected for improving the dashboard experience — no personal information is stored.

## License

Private project.
