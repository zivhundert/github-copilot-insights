import { CopilotDataRow } from '@/pages/Index';
import { parseNDJSONString } from '@/utils/ndjsonParser';

/**
 * Check whether the GitHub Enterprise integration is configured
 * (VITE_GITHUB_ENTERPRISE is the only env var exposed to the client).
 */
export const isGitHubApiConfigured = (): boolean => {
  return !!import.meta.env.VITE_GITHUB_ENTERPRISE;
};

/**
 * Fetch Copilot 28-day user metrics via the Vite server middleware at
 * /api/copilot-data which handles the full two-step GitHub API flow
 * server-side (no CORS issues).
 */
export const fetchCopilotMetrics = async (): Promise<{
  data: CopilotDataRow[];
  error?: string;
}> => {
  try {
    const response = await fetch('/api/copilot-data');

    const contentType = response.headers.get('content-type') || '';

    // If the middleware returned a JSON error envelope
    if (contentType.includes('application/json')) {
      const body = await response.json();
      if (body.error) {
        return { data: [], error: body.error };
      }
    }

    if (!response.ok) {
      return {
        data: [],
        error: `Server returned ${response.status}: ${response.statusText}`,
      };
    }

    const text = await response.text();
    return parseNDJSONString(text);
  } catch (err: any) {
    return {
      data: [],
      error: `Failed to fetch Copilot data: ${err.message ?? err}`,
    };
  }
};




