import type { CopilotDataRow } from "@/pages/Index";

interface ModelFeatureStats {
  model: string;
  feature: string;
  interactions: number;
  generations: number;
  acceptances: number;
  locAdded: number;
}

interface UserStats {
  login: string;
  interactions: number;
  locAdded: number;
  locSuggested: number;
  generations: number;
  acceptances: number;
  acceptanceRate: string;
  usedChat: boolean;
  usedAgent: boolean;
  usedCli: boolean;
  activeDays: number;
  ides: string[];
  models: string[];
}

interface DataSummary {
  metrics: {
    totalRecords: number;
    dateRange: { from: string; to: string };
    activeUsers: number;
    totalAcceptedLines: number;
    totalSuggestedLines: number;
    totalInteractions: number;
    totalGenerations: number;
    totalAcceptances: number;
    acceptanceRate: string;
  };
  users: UserStats[];
  featureAdoption: { chat: number; agent: number; cli: number };
  ideBreakdown: Record<string, number>;
  modelBreakdown: Record<string, { interactions: number; generations: number; acceptances: number; locAdded: number; users: string[] }>;
  userModelUsage: Array<{ login: string; model: string; feature: string; interactions: number; generations: number; acceptances: number; locAdded: number }>;
}

function summarizeData(data: CopilotDataRow[]): DataSummary {
  if (data.length === 0) {
    return {
      metrics: {
        totalRecords: 0,
        dateRange: { from: "", to: "" },
        activeUsers: 0,
        totalAcceptedLines: 0,
        totalSuggestedLines: 0,
        totalInteractions: 0,
        totalGenerations: 0,
        totalAcceptances: 0,
        acceptanceRate: "N/A",
      },
      users: [],
      featureAdoption: { chat: 0, agent: 0, cli: 0 },
      ideBreakdown: {},
      modelBreakdown: {},
      userModelUsage: [],
    };
  }

  const days = data.map((r) => r.day).sort();

  interface UserAcc {
    interactions: number;
    locAdded: number;
    locSuggested: number;
    generations: number;
    acceptances: number;
    usedChat: boolean;
    usedAgent: boolean;
    usedCli: boolean;
    days: Set<string>;
    ides: Set<string>;
    models: Set<string>;
  }

  const userMap = new Map<string, UserAcc>();

  let totalInteractions = 0;
  let totalGenerations = 0;
  let totalAcceptances = 0;
  let totalAcceptedLines = 0;
  let totalSuggestedLines = 0;
  const ideCount: Record<string, number> = {};

  const uniqueUsersChat = new Set<string>();
  const uniqueUsersAgent = new Set<string>();
  const uniqueUsersCli = new Set<string>();

  const modelStats: Record<string, { interactions: number; generations: number; acceptances: number; locAdded: number; users: Set<string> }> = {};
  const userModelDetails: Array<{ login: string; model: string; feature: string; interactions: number; generations: number; acceptances: number; locAdded: number }> = [];

  for (const row of data) {
    totalInteractions += row.user_initiated_interaction_count || 0;
    totalGenerations += row.code_generation_activity_count || 0;
    totalAcceptances += row.code_acceptance_activity_count || 0;
    totalAcceptedLines += row.loc_added_sum || 0;
    totalSuggestedLines += row.loc_suggested_to_add_sum || 0;

    const existing = userMap.get(row.user_login) || {
      interactions: 0, locAdded: 0, locSuggested: 0,
      generations: 0, acceptances: 0,
      usedChat: false, usedAgent: false, usedCli: false,
      days: new Set<string>(), ides: new Set<string>(), models: new Set<string>(),
    };
    existing.interactions += row.user_initiated_interaction_count || 0;
    existing.locAdded += row.loc_added_sum || 0;
    existing.locSuggested += row.loc_suggested_to_add_sum || 0;
    existing.generations += row.code_generation_activity_count || 0;
    existing.acceptances += row.code_acceptance_activity_count || 0;
    if (row.used_chat) existing.usedChat = true;
    if (row.used_agent) existing.usedAgent = true;
    if (row.used_cli) existing.usedCli = true;
    existing.days.add(row.day);
    if (row.totals_by_ide) {
      for (const ide of row.totals_by_ide) {
        existing.ides.add(ide.ide);
      }
    }
    if (row.totals_by_model_feature) {
      for (const mf of row.totals_by_model_feature) {
        existing.models.add(mf.model);
        const key = mf.model;
        if (!modelStats[key]) {
          modelStats[key] = { interactions: 0, generations: 0, acceptances: 0, locAdded: 0, users: new Set() };
        }
        modelStats[key].interactions += mf.user_initiated_interaction_count || 0;
        modelStats[key].generations += mf.code_generation_activity_count || 0;
        modelStats[key].acceptances += mf.code_acceptance_activity_count || 0;
        modelStats[key].locAdded += mf.loc_added_sum || 0;
        modelStats[key].users.add(row.user_login);
        userModelDetails.push({
          login: row.user_login,
          model: mf.model,
          feature: mf.feature,
          interactions: mf.user_initiated_interaction_count || 0,
          generations: mf.code_generation_activity_count || 0,
          acceptances: mf.code_acceptance_activity_count || 0,
          locAdded: mf.loc_added_sum || 0,
        });
      }
    }
    userMap.set(row.user_login, existing);

    if (row.used_chat) uniqueUsersChat.add(row.user_login);
    if (row.used_agent) uniqueUsersAgent.add(row.user_login);
    if (row.used_cli) uniqueUsersCli.add(row.user_login);

    if (row.totals_by_ide) {
      for (const ide of row.totals_by_ide) {
        ideCount[ide.ide] = (ideCount[ide.ide] || 0) + (ide.user_initiated_interaction_count || 0);
      }
    }
  }

  const acceptanceRate = totalGenerations > 0
    ? `${((totalAcceptances / totalGenerations) * 100).toFixed(1)}%`
    : "N/A";

  const users: UserStats[] = Array.from(userMap.entries())
    .map(([login, stats]) => ({
      login,
      interactions: stats.interactions,
      locAdded: stats.locAdded,
      locSuggested: stats.locSuggested,
      generations: stats.generations,
      acceptances: stats.acceptances,
      acceptanceRate: stats.generations > 0
        ? `${((stats.acceptances / stats.generations) * 100).toFixed(1)}%`
        : "N/A",
      usedChat: stats.usedChat,
      usedAgent: stats.usedAgent,
      usedCli: stats.usedCli,
      activeDays: stats.days.size,
      ides: Array.from(stats.ides),
      models: Array.from(stats.models),
    }))
    .sort((a, b) => b.interactions - a.interactions);

  return {
    metrics: {
      totalRecords: data.length,
      dateRange: { from: days[0], to: days[days.length - 1] },
      activeUsers: userMap.size,
      totalAcceptedLines,
      totalSuggestedLines,
      totalInteractions,
      totalGenerations,
      totalAcceptances,
      acceptanceRate,
    },
    users,
    featureAdoption: { chat: uniqueUsersChat.size, agent: uniqueUsersAgent.size, cli: uniqueUsersCli.size },
    ideBreakdown: ideCount,
    modelBreakdown: Object.fromEntries(
      Object.entries(modelStats).map(([model, stats]) => [
        model,
        { interactions: stats.interactions, generations: stats.generations, acceptances: stats.acceptances, locAdded: stats.locAdded, users: Array.from(stats.users) },
      ])
    ),
    userModelUsage: aggregateUserModelUsage(userModelDetails),
  };
}

function aggregateUserModelUsage(details: Array<{ login: string; model: string; feature: string; interactions: number; generations: number; acceptances: number; locAdded: number }>) {
  const map = new Map<string, { login: string; model: string; feature: string; interactions: number; generations: number; acceptances: number; locAdded: number }>();
  for (const d of details) {
    const key = `${d.login}|${d.model}|${d.feature}`;
    const existing = map.get(key);
    if (existing) {
      existing.interactions += d.interactions;
      existing.generations += d.generations;
      existing.acceptances += d.acceptances;
      existing.locAdded += d.locAdded;
    } else {
      map.set(key, { ...d });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.interactions - a.interactions);
}

export function buildChatContext(data: CopilotDataRow[]): string {
  const summary = summarizeData(data);
  return JSON.stringify(summary, null, 2);
}
