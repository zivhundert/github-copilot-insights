import { CopilotDataRow } from '@/pages/Index';
import { parseNDJSONString } from '@/utils/ndjsonParser';

const DATA_URL = '/copilot_data.ndjson';

/**
 * Check if pre-fetched data is expected to exist
 * (the build script runs when VITE_GITHUB_ENTERPRISE is set).
 */
export const isGitHubApiConfigured = (): boolean => {
  return !!import.meta.env.VITE_GITHUB_ENTERPRISE;
};

/**
 * Load the pre-fetched Copilot data from the static NDJSON file
 * written by scripts/fetch-copilot-data.mjs at build time.
 */
export const fetchCopilotMetrics = async (): Promise<{
  data: CopilotDataRow[];
  error?: string;
}> => {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      if (response.status === 404) {
        return { data: [], error: 'No pre-fetched data found. Upload a file manually or re-run the build with GitHub credentials configured.' };
      }
      return { data: [], error: `Failed to load data: ${response.status}` };
    }

    const text = await response.text();
    if (!text.trim()) {
      return { data: [], error: 'Pre-fetched data file is empty.' };
    }

    return parseNDJSONString(text);
  } catch (err: any) {
    return { data: [], error: `Failed to load Copilot data: ${err.message ?? err}` };
  }
};
