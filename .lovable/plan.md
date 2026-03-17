
Part A - Recommended UX approach and why

Recommendation: Option 5, a hybrid help system centered on a lazy-loaded global help drawer.

Best pattern for this dashboard:
- Primary pattern: one on-demand “Guide” entry in the header
- Secondary pattern: keep only the existing lightweight per-widget help icons for quick context
- Enhancement: add “Learn more in guide” links only in the highest-value places:
  - KPI cards
  - chart container popovers
  - Adoption Champions help popover

Why this is the best fit:
- Highest user value: users get one complete place to understand the whole product, plus fast local explanations where needed
- Lowest complexity: reuses the current header, popover, card, accordion, and sheet primitives
- Lowest performance impact: guide UI and content load only when opened
- Maintainable: one centralized content source instead of long text spread across many widgets
- Clear and scalable: new charts can be added by adding one content object and, optionally, one guideSectionId

Why not the other options:
- Dedicated page: clear, but heavier routing and feels disconnected from the dashboard users are reading
- Global drawer only: strong, but misses quick in-context help
- Modal only: okay for short help, weaker for a long manual with sections
- Per-widget only: too fragmented for a dashboard with many metrics and caveats

Recommended UX behavior:
- Header action: “Guide”
- Opens a right-side Sheet/Drawer with section navigation and scrollable content
- Existing ? icons remain small and lightweight
- Popovers can include a “Learn more” link that opens the drawer to the relevant section

Part B - Information architecture for the guide

Top-level guide structure:
1. Overview
2. Core KPIs
3. Segments and usage modes
4. Charts and sections
5. Adoption Champions leaderboard
6. Important metric caveats
7. How to use this dashboard
8. Glossary

Recommended section flow:
```text
Overview
  Purpose
  Why the dashboard is structured this way

Core KPIs
  Total AI Code Added
  Acceptance Rate
  AI Code Amplification
  Development Time Saved
  Development Cost Savings
  ROI
  Active Users

Segments and usage modes
  Champion / Producer / Explorer / Starter
  Chat-heavy / Hybrid / Agent-heavy

Charts and sections
  Adoption Insights
  User Profile
  AI Code Generation Growth
  Acceptance Rate Trend
  AI Model Usage
  Feature Usage Breakdown
  Model Effectiveness Comparison
  Code Churn
  Interactions per Developer
  IDE Distribution
  Programming Language Usage
  Agent/Chat/CLI Users
  Language × Feature Matrix
  Engagement Heatmap
  Activity by Day of Week
  IDE & Plugin Version Distribution

Leaderboard
  Column-by-column explanation
  Ranking logic vs secondary signals

Important metric caveats
  What metrics do and do not mean
  Responsible interpretation rules

How to use this dashboard
  Engineering manager
  Team lead
  Enablement/adoption owner
  Individual developer

Glossary
  Short definitions for repeated terms
```

Part C - Exact content structure for the guide/manual

Use one centralized typed content file, for example:
- `src/content/dashboardGuide.ts`

Content model:
```ts
type GuideTopic = {
  id: string;
  title: string;
  summary?: string;
  formula?: string;
  whatItShows: string;
  whyItMatters: string;
  howToInterpret: string[];
  whatItDoesNotMean?: string[];
  actions?: string[];
  caveats?: string[];
};
```

Exact content sections to include

1. Overview
- Purpose:
  - track Copilot adoption
  - suggestion-based usage
  - Copilot-related code output
  - agent-heavy vs chat-heavy patterns
  - segmented performance in a more balanced way
- Why structured this way:
  - combine engagement, output, efficiency, and business context
  - avoid over-relying on a single metric like acceptance rate

2. KPI definitions
Use plain language + formula + caveats.

Include:
- Total AI Code Added
  - based on `loc_added_sum`
  - includes accepted completions, applied code blocks, and agent/edit output
  - note: not the same as acceptance
- Acceptance Rate
  - formula: `code_acceptance_activity_count / code_generation_activity_count × 100`
  - event-based only
  - useful for suggestion workflows
  - may underrepresent agent-heavy work
- AI Code Amplification
  - formula: `loc_added_sum / loc_suggested_to_add_sum × 100`
  - line-based, not acceptance
  - can exceed 100%
- Suggested Code
  - based on `loc_suggested_to_add_sum`
  - mostly reflects suggestion/ghost-text behavior
- Interactions
  - based on `user_initiated_interaction_count`
  - engagement signal, not value by itself
- Efficiency / AI Output per Interaction
  - formula: `addedLines / interactions`
  - output relative to prompt effort
- Development Time Saved
  - formula: `round(totalAddedLines / (linesPerMinute × 60))`
  - depends on settings assumption
- Development Cost Savings
  - formula: `estimatedHoursSaved × pricePerHour`
- ROI
  - formula: `estimatedMoneySaved / (activeUsers × copilotPricePerUser × 12) × 100`
  - business context metric, not code quality
- Active Users
  - distinct `user_login` count in base filtered data

3. Segmentation model
Explain:
- Champion = Adoption Score ≥ 70 and Impact Score ≥ 70
- Producer = Adoption Score ≥ 50 and Impact Score ≥ 40
- Explorer = Adoption Score ≥ 20 and below higher thresholds
- Starter = Adoption Score < 20

Explain calculation inputs:
- Adoption Score = normalized log score of `interactions + codeGenerations`
- Impact Score = normalized log score of `addedLines`
- Efficiency = `addedLines / interactions`

Explain clearly:
- segments are driven mainly by adoption + impact
- acceptance is a secondary signal, not the core segment rule
- this helps avoid under-crediting agent-heavy users whose value may not appear in classic acceptance metrics

4. Usage modes
Explain actual behavioral classification:
- Agent-heavy:
  - strong added-code signal
  - often high amplification
  - may have low classic acceptance or fewer generations
- Chat-heavy:
  - stronger suggestion/generation flow
  - measurable acceptance
  - chat days at least as common as agent days
- Hybrid:
  - mixed behavior between both patterns

5. Charts and sections
For each current dashboard section, include:
- what it shows
- why it matters
- how to read high/low values
- common mistakes
- action ideas

Must cover:
- Adoption Insights
- User Profile Card
- AI Code Generation Growth
- Acceptance Rate Trend
- AI Model Usage
- Feature Usage Breakdown
- Model Effectiveness Comparison
- Code Churn
- Interactions per Developer
- IDE Distribution
- Programming Language Usage
- Agent/Chat/CLI Users
- Language × Feature Matrix
- Engagement Heatmap
- Activity by Day of Week
- IDE & Plugin Version Distribution
- Adoption Champions leaderboard

6. Leaderboard guide
Explain all visible columns:
- Performance
- AI Code Added
- Interactions
- Adoption Score
- Impact Score
- Efficiency
- Acceptance Rate
- Suggested Code
- AI Amplification
- Code Generations
- Code Acceptances
- Lines Deleted
- User ROI

For each column:
- meaning
- formula/source
- primary ranking metric or secondary signal
- warning if needed

7. Important metric caveats
Required notes:
- line-based ratios are not acceptance
- AI Amplification can exceed 100%
- low acceptance does not automatically mean low value
- interactions alone do not equal success
- agent-heavy workflows can look different from classic suggestion workflows
- low-confidence acceptance should be treated carefully when generations are low

8. How to use this dashboard
Role-based examples:
- Engineering managers:
  - spot low adoption groups
  - find strong Champions
  - compare usage patterns before training/investment decisions
- Team leads:
  - identify coaching candidates
  - distinguish experimentation from productive usage
- Enablement/adoption owners:
  - find underused features and workflow gaps
- Individual developers:
  - compare engagement, output, and workflow style without over-focusing on one metric

Part D - UI implementation plan

1. Add a global Guide entry point
- Add a “Guide” button to `DashboardHeader`
- Keep it visible even before file upload
- Place it alongside export/settings in both mobile and desktop header button groups

2. Add a lightweight guide controller
- Create a small context/provider, e.g. `DashboardGuideContext`
- State only:
  - `isOpen`
  - `activeSectionId`
  - `openGuide(sectionId?)`
  - `closeGuide()`

3. Build a lazy-loaded guide drawer
- New component: `DashboardGuideDrawer`
- Open via `React.lazy` + `Suspense`
- Use existing `Sheet` component for a right-side drawer
- Inside:
  - top summary
  - compact section nav chips/buttons
  - scrollable accordion-based content
  - formula blocks in monospace
  - “What this does NOT mean” and “How to act on this” callouts

4. Reuse existing help entry points
- Extend shared components with optional guide hooks:
  - `MetricCard` gets optional `guideTopicId`
  - `ChartContainer` gets optional `guideTopicId`
- In popovers, add a tiny “Learn more in Guide” button only when `guideTopicId` exists
- In `TopContributorsTable`, add the same jump link from the existing help popover

5. Centralize content
- Store all guide copy in one content/config file
- Keep rendering generic so future charts only require content additions, not custom UI code

Part E - Lightweight performance-conscious implementation details

Recommended implementation details:
- Lazy-load the drawer component and its content renderer
- Keep the provider tiny and mounted once near `App` or `Index`
- Do not inject long help text into every chart component
- Pass only small `guideTopicId` strings to widgets
- Reuse current popovers instead of adding new per-widget state systems
- Render the long-form guide only when opened
- Use accordion sections instead of a large interactive walkthrough
- Keep the guide content static and typed for easy maintenance

Exact files likely involved
- Modify:
  - `src/components/dashboard/DashboardHeader.tsx`
  - `src/components/common/MetricCard.tsx`
  - `src/components/common/ChartContainer.tsx`
  - `src/components/dashboard/charts/TopContributorsTable/TopContributorsTable.tsx`
  - `src/App.tsx` or `src/pages/Index.tsx`
- Add:
  - `src/content/dashboardGuide.ts`
  - `src/contexts/DashboardGuideContext.tsx`
  - `src/components/dashboard/DashboardGuideDrawer.tsx`
  - optional small subcomponents like `DashboardGuideSection.tsx`

Final recommendation
Build a hybrid system with:
- one polished, on-demand Guide drawer as the main manual
- minimal “Learn more” bridges from existing KPI/chart/table help
- centralized guide content
- lazy loading for near-zero idle overhead

This gives you the highest-value “amazing but practical” result with the lowest risk to current dashboard performance and UX.
