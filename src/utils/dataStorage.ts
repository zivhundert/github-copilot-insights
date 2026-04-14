import { CopilotDataRow } from '@/pages/Index';

const STORAGE_KEY = 'copilot_data_archive';
const META_KEY = 'copilot_data_archive_meta';

interface StorageMeta {
  rowCount: number;
  dateRange: { from: string; to: string };
  lastUpdated: string;
  sizeBytes: number;
}

/** Save data to localStorage. Returns false if storage limit reached. */
export const saveDataToStorage = (data: CopilotDataRow[]): boolean => {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, json);

    const days = data.map(r => r.day).sort();
    const meta: StorageMeta = {
      rowCount: data.length,
      dateRange: { from: days[0] || '', to: days[days.length - 1] || '' },
      lastUpdated: new Date().toISOString(),
      sizeBytes: new Blob([json]).size,
    };
    localStorage.setItem(META_KEY, JSON.stringify(meta));
    return true;
  } catch {
    return false;
  }
};

/** Load data from localStorage. Returns empty array if nothing saved. */
export const loadDataFromStorage = (): CopilotDataRow[] => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    return JSON.parse(json) as CopilotDataRow[];
  } catch {
    return [];
  }
};

/** Get metadata about stored data without parsing the full dataset. */
export const getStorageMeta = (): StorageMeta | null => {
  try {
    const meta = localStorage.getItem(META_KEY);
    if (!meta) return null;
    return JSON.parse(meta) as StorageMeta;
  } catch {
    return null;
  }
};

/** Clear all saved data from localStorage. */
export const clearDataStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(META_KEY);
};

/** Format bytes into a human-readable string. */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
