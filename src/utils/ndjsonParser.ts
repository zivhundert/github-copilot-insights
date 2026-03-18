
import { CopilotDataRow } from '@/pages/Index';

export interface ParseResult {
  data: CopilotDataRow[];
  error?: string;
}

/** Map a raw JSON object to a typed CopilotDataRow */
const mapRow = (row: any): CopilotDataRow => ({
  day: row.day || '',
  user_login: row.user_login || '',
  user_id: row.user_id || 0,
  enterprise_id: row.enterprise_id || '',
  user_initiated_interaction_count: row.user_initiated_interaction_count || 0,
  code_generation_activity_count: row.code_generation_activity_count || 0,
  code_acceptance_activity_count: row.code_acceptance_activity_count || 0,
  loc_suggested_to_add_sum: row.loc_suggested_to_add_sum || 0,
  loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum || 0,
  loc_added_sum: row.loc_added_sum || 0,
  loc_deleted_sum: row.loc_deleted_sum || 0,
  used_agent: row.used_agent || false,
  used_chat: row.used_chat || false,
  used_cli: row.used_cli || false,
  totals_by_ide: row.totals_by_ide || [],
  totals_by_feature: row.totals_by_feature || [],
  totals_by_language_feature: row.totals_by_language_feature || [],
  totals_by_model_feature: row.totals_by_model_feature || [],
});

/** Parse an NDJSON string (one JSON object per line) */
export const parseNDJSONString = (text: string): ParseResult => {
  try {
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return { data: [], error: 'Response is empty. No data returned from GitHub API.' };
    }

    const parsedData: CopilotDataRow[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      try {
        const row = JSON.parse(line);
        parsedData.push(mapRow(row));
      } catch (e) {
        errors.push(`Line ${index + 1}: Invalid JSON`);
      }
    });

    if (parsedData.length === 0) {
      return { data: [], error: 'No valid data rows found in the response.' };
    }

    return { data: parsedData };
  } catch (error) {
    return { data: [], error: 'Failed to parse response. Please check the format.' };
  }
};

export const parseNDJSONFile = async (file: File): Promise<ParseResult> => {
  try {
    const text = await file.text();
    return parseNDJSONString(text);
  } catch (error) {
    return { data: [], error: 'Failed to parse file. Please check the format and try again.' };
  }
};
