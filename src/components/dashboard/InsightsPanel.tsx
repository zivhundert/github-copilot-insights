import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { CopilotDataRow } from '@/pages/Index';
import { Lightbulb, ChevronDown, ChevronUp, AlertTriangle, Star } from 'lucide-react';
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

  if (insights.length === 0) return null;

  return (
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
      <UserStatsDialog
        userName={clickedUser}
        allData={data}
        open={!!clickedUser}
        onOpenChange={(open) => { if (!open) setClickedUser(null); }}
      />
    </Collapsible>
  );
};
