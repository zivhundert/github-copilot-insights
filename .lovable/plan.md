

## Problem: Inconsistent Acceptance Rate Data Sources

The GitHub Copilot API data has **top-level fields** (`loc_added_sum`, `loc_suggested_to_add_sum`) that aggregate across ALL features — code_completion, agent_mode, chat, CLI, etc.

Features like **agent_mode and chat** add lines of code directly (high `loc_added_sum`) but with **zero or low `loc_suggested_to_add_sum`** because they don't follow the suggest→accept flow. This inflates "accepted lines" relative to "suggested lines" and can produce acceptance rates over 100%.

### Current state

| Location | What it uses | Correct? |
|---|---|---|
| **Metrics card** (acceptance rate) | `code_completion` feature only | Yes |
| **Acceptance Rate chart** | `code_completion` feature only | Yes |
| **Contributors table** | Top-level `loc_added_sum` / `loc_suggested_to_add_sum` (ALL features) | **No — bug** |

### Fix

**`src/components/dashboard/charts/TopContributorsTable/dataProcessing.ts`**: Change the acceptance rate calculation to extract `loc_added_sum` and `loc_suggested_to_add_sum` from only the `code_completion` entry in `totals_by_feature`, matching the approach used everywhere else.

The `acceptedLines` field (used for "Lines Accepted" column and ROI) should still use the top-level `loc_added_sum` since that represents total AI-generated code across all features — which is correct for measuring productivity. Only the **acceptance rate** ratio needs the `code_completion` filter.

So the fix adds two new intermediate fields (`ccAcceptedLines`, `ccSuggestedLines`) from `totals_by_feature.code_completion` and uses those for the `acceptanceRate` calculation, while keeping `acceptedLines` from the top-level for display and ROI.

