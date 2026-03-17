

## Plan: Add 5 New Features to the Dashboard

Based on the features discussed, here's what I'll build:

---

### Feature 2: Model Effectiveness Comparison

**What**: A grouped bar chart comparing acceptance rates across AI models (e.g., claude-4.6-sonnet vs gpt-5.3-codex vs claude-opus-4.6).

**Data source**: `totals_by_model_feature[]` — aggregate `loc_added_sum / loc_suggested_to_add_sum` per model, filtering to `code_completion` feature for accurate rates. Also show total interactions per model as a secondary metric.

**UI**: Half-width chart using `ChartContainer` + `BaseHighchart`. Grouped column chart with two series: acceptance rate (%) on left axis, total interactions on right axis.

**File**: `src/components/dashboard/charts/ModelEffectivenessChart.tsx`

---

### Feature 3: Language x Feature Matrix (Heatmap)

**What**: A heatmap grid showing which Copilot features are used for which programming languages. Rows = languages, columns = features (code_completion, agent_mode, ask_mode, agent_edit, etc.), cell color intensity = `loc_added_sum` or `code_generation_activity_count`.

**Data source**: `totals_by_language_feature[]` — each entry has `language`, `feature`, and activity counts.

**UI**: Full-width Highcharts heatmap (requires `highcharts/modules/heatmap` import). Color gradient from light to dark based on activity intensity. Tooltip shows exact counts.

**File**: `src/components/dashboard/charts/LanguageFeatureMatrix.tsx`

---

### Feature 4: Engagement Heatmap (Activity Calendar)

**What**: A GitHub-style contribution calendar showing daily team activity intensity. Each cell = one day, color intensity = total interactions or lines added that day.

**Data source**: Aggregate `user_initiated_interaction_count` per `day` across all users.

**UI**: Full-width chart using Highcharts heatmap. X-axis = weeks, Y-axis = day of week (Mon-Sun). Green color gradient. Tooltip shows date and total activity count.

**File**: `src/components/dashboard/charts/EngagementHeatmap.tsx`

---

### Feature 5: Code Churn Chart (Lines Added vs Deleted)

**What**: A dual-series area/line chart showing `loc_added_sum` and `loc_deleted_sum` over time, with a net churn line.

**Data source**: Aggregate `loc_added_sum` and `loc_deleted_sum` per period from top-level row fields.

**UI**: Half-width chart. Area chart with green for additions, red for deletions, and a dashed line for net churn. Respects aggregation period.

**File**: `src/components/dashboard/charts/CodeChurnChart.tsx`

---

### Feature 6: User Profile Card (Personal Insights)

**What**: When a single user is selected in the user filter, display a personalized summary card above the charts showing their key stats and preferences.

**Content**:
- Preferred AI model (most interactions)
- Preferred IDE
- Top 3 programming languages
- Personal acceptance rate trend (sparkline or mini chart)
- Features used (agent, chat, CLI badges)
- Performance segment badge (reuse existing logic)

**Data source**: Filter all data for the selected `user_login`, then aggregate from nested arrays.

**UI**: A prominent Card component shown conditionally when exactly 1 user is selected. Grid layout with stat items and badges. Placed between the filters and charts in the dashboard.

**File**: `src/components/dashboard/UserProfileCard.tsx`

---

### Feature 10: Underutilized Features Alert

**What**: An alert/insight panel highlighting features with low adoption across the team, with actionable recommendations.

**Logic**:
- Calculate % of users who have used each mode (agent, chat, CLI, code_completion, ask_mode, plan_mode, etc.)
- Flag features used by less than 30% of users as "underutilized"
- Show specific recommendations (e.g., "Only 15% of your team uses Agent mode — consider training sessions")

**UI**: A Card with amber/yellow accent, placed after the metrics section. List of underutilized features with usage % and recommendation text. Collapsible so it doesn't take too much space.

**File**: `src/components/dashboard/InsightsPanel.tsx`

---

### Integration Changes

- **`SettingsContext.tsx`**: Add visibility toggles for new charts (`modelEffectivenessChart`, `languageFeatureMatrix`, `engagementHeatmap`, `codeChurnChart`, `insightsPanel`)
- **`DashboardCharts.tsx`**: Add new chart components to the chart rows config
- **`Index.tsx`**: Add `UserProfileCard` (conditional on single user selected) and `InsightsPanel` between metrics and filters
- **`DashboardSettings.tsx`**: Add toggle controls for new chart visibility
- **Highcharts modules**: Import `highcharts/modules/heatmap` in `BaseHighchart.tsx`

