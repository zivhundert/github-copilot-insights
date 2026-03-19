import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { CopilotDataRow } from '@/pages/Index';
import { Lightbulb, ChevronDown, ChevronUp, AlertTriangle, Star, UserX, Activity, FileCode, TrendingUp, Monitor, Code, Zap, Calendar, Bot, MessageSquare, Terminal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserStatsDialog } from './charts/UserStatsDialog';

interface InsightsPanelProps {
  data: CopilotDataRow[];
}

const FEATURE_RECOMMENDATIONS: Record<string, string> = {
  agent: 'Agent mode automates multi-file changes — run a workshop to demonstrate it.',
  chat: 'Chat enables inline Q&A with Copilot — encourage devs to use it for code understanding.',
  cli: 'CLI integration lets developers use Copilot from the terminal — share setup guides.',
  code_completion: 'Code completion is the core feature — ensure IDE plugins are up to date.',
  agent_mode: 'Agent mode handles complex multi-step tasks — schedule a demo session.',
  ask_mode: 'Ask mode helps answer questions about the codebase — promote it for onboarding.',
  plan_mode: 'Plan mode helps break down tasks — introduce it for sprint planning.',
  agent_edit: 'Agent edit enables AI-driven refactoring — show examples in code reviews.',
  chat_inline: 'Inline chat provides contextual help — remind devs about the keyboard shortcut.',
};

const THRESHOLD = 30;

export const InsightsPanel = ({ data }: InsightsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNonAdoptersOpen, setIsNonAdoptersOpen] = useState(false);
  const [clickedUser, setClickedUser] = useState<string | null>(null);

  const insights = useMemo(() => {
    const uniqueUsers = new Set(data.map(r => r.user_login));
    const totalUsers = uniqueUsers.size;
    if (totalUsers === 0) return [];

    // Check mode adoption from boolean fields
    const modeUsage: Record<string, Set<string>> = {
      agent: new Set(),
      chat: new Set(),
      cli: new Set(),
    };

    // Check feature adoption from totals_by_feature
    const featureUsage = new Map<string, Set<string>>();

    // Track per-user interaction counts for each feature / mode
    const featureUserInteractions = new Map<string, Map<string, number>>();

    const addInteraction = (feature: string, user: string, count: number) => {
      if (!featureUserInteractions.has(feature)) featureUserInteractions.set(feature, new Map());
      const userMap = featureUserInteractions.get(feature)!;
      userMap.set(user, (userMap.get(user) || 0) + count);
    };

    data.forEach(row => {
      if (row.used_agent) {
        modeUsage.agent.add(row.user_login);
        addInteraction('agent', row.user_login, row.user_initiated_interaction_count);
      }
      if (row.used_chat) {
        modeUsage.chat.add(row.user_login);
        addInteraction('chat', row.user_login, row.user_initiated_interaction_count);
      }
      if (row.used_cli) {
        modeUsage.cli.add(row.user_login);
        addInteraction('cli', row.user_login, row.user_initiated_interaction_count);
      }

      (row.totals_by_feature || []).forEach(f => {
        if (!featureUsage.has(f.feature)) featureUsage.set(f.feature, new Set());
        if (f.user_initiated_interaction_count > 0) {
          featureUsage.get(f.feature)!.add(row.user_login);
          addInteraction(f.feature, row.user_login, f.user_initiated_interaction_count);
        }
      });
    });

    const results: Array<{
      feature: string;
      usagePercent: number;
      recommendation: string;
      champions: Array<{ user: string; interactions: number }>;
    }> = [];

    const getTopChampions = (feature: string, limit = 5) => {
      const userMap = featureUserInteractions.get(feature);
      if (!userMap) return [];
      return [...userMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([user, interactions]) => ({ user, interactions }));
    };

    // Check modes
    Object.entries(modeUsage).forEach(([mode, users]) => {
      const pct = (users.size / totalUsers) * 100;
      if (pct < THRESHOLD) {
        results.push({
          feature: mode,
          usagePercent: Math.round(pct),
          recommendation: FEATURE_RECOMMENDATIONS[mode] || `Consider promoting ${mode} usage across the team.`,
          champions: getTopChampions(mode),
        });
      }
    });

    // Check features
    featureUsage.forEach((users, feature) => {
      if (['agent', 'chat', 'cli'].includes(feature)) return;
      const pct = (users.size / totalUsers) * 100;
      if (pct < THRESHOLD) {
        results.push({
          feature,
          usagePercent: Math.round(pct),
          recommendation: FEATURE_RECOMMENDATIONS[feature] || `Only ${Math.round(pct)}% of your team uses ${feature.replace(/_/g, ' ')} — consider training sessions.`,
          champions: getTopChampions(feature),
        });
      }
    });

    return results.sort((a, b) => a.usagePercent - b.usagePercent);
  }, [data]);

  // ── Non-adopter / low-adopter analysis ──
  const nonAdopters = useMemo(() => {
    const userMap = new Map<string, {
      interactions: number;
      generations: number;
      acceptances: number;
      linesAdded: number;
      linesSuggested: number;
      activeDays: Set<string>;
      usedAgent: boolean;
      usedChat: boolean;
      usedCLI: boolean;
      ides: Map<string, number>;
      languages: Map<string, number>;
      features: Map<string, number>;
    }>();

    data.forEach(row => {
      if (!userMap.has(row.user_login)) {
        userMap.set(row.user_login, {
          interactions: 0, generations: 0, acceptances: 0,
          linesAdded: 0, linesSuggested: 0,
          activeDays: new Set(), usedAgent: false, usedChat: false, usedCLI: false,
          ides: new Map(), languages: new Map(), features: new Map(),
        });
      }
      const u = userMap.get(row.user_login)!;
      u.interactions += row.user_initiated_interaction_count || 0;
      u.generations += row.code_generation_activity_count || 0;
      u.acceptances += row.code_acceptance_activity_count || 0;
      u.linesAdded += row.loc_added_sum || 0;
      u.linesSuggested += row.loc_suggested_to_add_sum || 0;
      u.activeDays.add(row.day);
      if (row.used_agent) u.usedAgent = true;
      if (row.used_chat) u.usedChat = true;
      if (row.used_cli) u.usedCLI = true;

      (row.totals_by_ide || []).forEach(ide => {
        u.ides.set(ide.ide, (u.ides.get(ide.ide) || 0) + (ide.user_initiated_interaction_count || 0));
      });
      (row.totals_by_language_feature || []).forEach(lf => {
        if (lf.language && lf.language !== 'unknown') {
          u.languages.set(lf.language, (u.languages.get(lf.language) || 0) + (lf.code_generation_activity_count || 0));
        }
      });
      (row.totals_by_feature || []).forEach(f => {
        if (f.user_initiated_interaction_count > 0) {
          u.features.set(f.feature, (u.features.get(f.feature) || 0) + f.user_initiated_interaction_count);
        }
      });
    });

    type NonAdopterReport = {
      userName: string;
      activeDays: number;
      interactions: number;
      generations: number;
      acceptances: number;
      linesAdded: number;
      linesSuggested: number;
      usedAgent: boolean;
      usedChat: boolean;
      usedCLI: boolean;
      topIde: string | null;
      topLanguages: string[];
      topFeatures: string[];
      issues: string[];
    };

    const results: NonAdopterReport[] = [];

    userMap.forEach((stats, userName) => {
      const issues: string[] = [];

      // Identify problems
      if (stats.generations === 0 && stats.acceptances === 0) {
        issues.push('No code generation or acceptance activity');
      } else if (stats.generations === 0) {
        issues.push('No code generation events detected');
      }

      if (stats.interactions === 0) {
        issues.push('Zero interactions with Copilot');
      } else if (stats.interactions <= 3) {
        issues.push(`Only ${stats.interactions} total interaction${stats.interactions !== 1 ? 's' : ''}`);
      }

      if (stats.linesAdded === 0 && stats.linesSuggested === 0) {
        issues.push('No lines of code suggested or added via AI');
      }

      if (stats.activeDays.size <= 2) {
        issues.push(`Active only ${stats.activeDays.size} day${stats.activeDays.size !== 1 ? 's' : ''} in the period`);
      }

      if (!stats.usedAgent && !stats.usedChat && !stats.usedCLI) {
        issues.push('Has not used Agent, Chat, or CLI modes');
      }

      // Only include users with at least 2 issues (real non-adopters)
      if (issues.length < 2) return;

      const topIde = stats.ides.size > 0
        ? Array.from(stats.ides.entries()).sort((a, b) => b[1] - a[1])[0][0]
        : null;
      const topLanguages = Array.from(stats.languages.entries())
        .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([l]) => l);
      const topFeatures = Array.from(stats.features.entries())
        .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f]) => f.replace(/_/g, ' '));

      results.push({
        userName, activeDays: stats.activeDays.size,
        interactions: stats.interactions, generations: stats.generations,
        acceptances: stats.acceptances, linesAdded: stats.linesAdded,
        linesSuggested: stats.linesSuggested,
        usedAgent: stats.usedAgent, usedChat: stats.usedChat, usedCLI: stats.usedCLI,
        topIde, topLanguages, topFeatures, issues,
      });
    });

    return results.sort((a, b) => a.issues.length === b.issues.length
      ? a.interactions - b.interactions
      : b.issues.length - a.issues.length);
  }, [data]);

  if (insights.length === 0 && nonAdopters.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* ── Feature Adoption Insights ── */}
      {insights.length > 0 && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
                      Adoption Insights
                    </CardTitle>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-300">
                      {insights.length} suggestion{insights.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div
                      key={insight.feature}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background/60 border border-border"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">
                            {insight.feature.replace(/_/g, ' ')}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {insight.usagePercent}% adoption
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{insight.recommendation}</p>

                        {insight.champions.length > 0 && (
                          <div className="pt-1">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                Learn from these champions
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {insight.champions.map(({ user, interactions }) => (
                                <Tooltip key={user}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-xs cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
                                      onClick={() => setClickedUser(user)}
                                    >
                                      <Avatar className="h-4 w-4">
                                        <AvatarFallback className="text-[8px] bg-amber-300 dark:bg-amber-700 text-amber-900 dark:text-amber-100">
                                          {user.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium text-amber-800 dark:text-amber-200">{user}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <span>{interactions} interaction{interactions !== 1 ? 's' : ''} with {insight.feature.replace(/_/g, ' ')} · Click to view profile</span>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* ── Non-Adopters / Low Usage Report ── */}
      {nonAdopters.length > 0 && (
        <Collapsible open={isNonAdoptersOpen} onOpenChange={setIsNonAdoptersOpen}>
          <Card className="border-red-500/30 bg-red-50/50 dark:bg-red-950/20">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <CardTitle className="text-lg text-red-900 dark:text-red-100">
                      Users Needing Attention
                    </CardTitle>
                    <Badge variant="outline" className="border-red-500/50 text-red-700 dark:text-red-300">
                      {nonAdopters.length} user{nonAdopters.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {isNonAdoptersOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-3">
                  These users show low or no code generation activity. Each report shows what was observed so you can provide targeted support.
                </p>
                <div className="space-y-3">
                  {nonAdopters.map((user) => (
                    <div
                      key={user.userName}
                      className="rounded-lg bg-background/60 border border-border overflow-hidden"
                    >
                      {/* Header */}
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setClickedUser(user.userName)}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                            {user.userName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate">{user.userName}</span>
                            <Badge variant="outline" className="text-[10px] border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 shrink-0">
                              {user.issues.length} issue{user.issues.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.issues.map((issue, i) => (
                              <span key={i} className="text-[10px] text-red-600 dark:text-red-400">
                                {i > 0 && '·'} {issue}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Activity report */}
                      <div className="border-t border-border/50 px-3 py-2 bg-muted/20">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                          Observed Activity
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-1.5">
                          <NonAdopterStat
                            icon={<Calendar className="h-3 w-3" />}
                            label="Active Days"
                            value={user.activeDays.toString()}
                            warn={user.activeDays <= 2}
                          />
                          <NonAdopterStat
                            icon={<Zap className="h-3 w-3" />}
                            label="Interactions"
                            value={user.interactions.toLocaleString()}
                            warn={user.interactions <= 3}
                          />
                          <NonAdopterStat
                            icon={<FileCode className="h-3 w-3" />}
                            label="Generations"
                            value={user.generations.toLocaleString()}
                            warn={user.generations === 0}
                          />
                          <NonAdopterStat
                            icon={<TrendingUp className="h-3 w-3" />}
                            label="Acceptances"
                            value={user.acceptances.toLocaleString()}
                            warn={user.acceptances === 0}
                          />
                          <NonAdopterStat
                            icon={<Activity className="h-3 w-3" />}
                            label="Lines Added"
                            value={user.linesAdded.toLocaleString()}
                            warn={user.linesAdded === 0}
                          />
                          <NonAdopterStat
                            icon={<Monitor className="h-3 w-3" />}
                            label="IDE"
                            value={user.topIde || 'None'}
                            warn={!user.topIde}
                          />
                        </div>

                        {/* Modes & features */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-border/30">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">Modes:</span>
                            {user.usedAgent && <Badge variant="secondary" className="text-[10px] h-5 gap-0.5"><Bot className="h-2.5 w-2.5" />Agent</Badge>}
                            {user.usedChat && <Badge variant="secondary" className="text-[10px] h-5 gap-0.5"><MessageSquare className="h-2.5 w-2.5" />Chat</Badge>}
                            {user.usedCLI && <Badge variant="secondary" className="text-[10px] h-5 gap-0.5"><Terminal className="h-2.5 w-2.5" />CLI</Badge>}
                            {!user.usedAgent && !user.usedChat && !user.usedCLI && (
                              <span className="text-[10px] text-red-500">None</span>
                            )}
                          </div>
                          {user.topLanguages.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground">Languages:</span>
                              {user.topLanguages.map(lang => (
                                <Badge key={lang} variant="secondary" className="text-[10px] h-5 gap-0.5">
                                  <Code className="h-2.5 w-2.5" />{lang}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {user.topFeatures.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground">Features:</span>
                              {user.topFeatures.map(f => (
                                <Badge key={f} variant="secondary" className="text-[10px] h-5 capitalize">{f}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      <UserStatsDialog
        userName={clickedUser}
        allData={data}
        open={!!clickedUser}
        onOpenChange={(open) => { if (!open) setClickedUser(null); }}
      />
    </div>
  );
};

const NonAdopterStat = ({
  icon,
  label,
  value,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  warn: boolean;
}) => (
  <div className="flex items-center gap-1.5">
    <span className={warn ? 'text-red-500' : 'text-muted-foreground'}>{icon}</span>
    <span className="text-[10px] text-muted-foreground">{label}:</span>
    <span className={`text-xs font-medium ${warn ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
      {value}
    </span>
  </div>
);

