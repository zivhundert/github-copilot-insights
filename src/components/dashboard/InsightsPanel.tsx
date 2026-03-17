
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { CopilotDataRow } from '@/pages/Index';
import { Lightbulb, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(true);

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

    data.forEach(row => {
      if (row.used_agent) modeUsage.agent.add(row.user_login);
      if (row.used_chat) modeUsage.chat.add(row.user_login);
      if (row.used_cli) modeUsage.cli.add(row.user_login);

      (row.totals_by_feature || []).forEach(f => {
        if (!featureUsage.has(f.feature)) featureUsage.set(f.feature, new Set());
        if (f.user_initiated_interaction_count > 0) {
          featureUsage.get(f.feature)!.add(row.user_login);
        }
      });
    });

    const results: Array<{ feature: string; usagePercent: number; recommendation: string }> = [];

    // Check modes
    Object.entries(modeUsage).forEach(([mode, users]) => {
      const pct = (users.size / totalUsers) * 100;
      if (pct < THRESHOLD) {
        results.push({
          feature: mode,
          usagePercent: Math.round(pct),
          recommendation: FEATURE_RECOMMENDATIONS[mode] || `Consider promoting ${mode} usage across the team.`,
        });
      }
    });

    // Check features
    featureUsage.forEach((users, feature) => {
      // Skip if already covered by modes
      if (['agent', 'chat', 'cli'].includes(feature)) return;
      const pct = (users.size / totalUsers) * 100;
      if (pct < THRESHOLD) {
        results.push({
          feature,
          usagePercent: Math.round(pct),
          recommendation: FEATURE_RECOMMENDATIONS[feature] || `Only ${Math.round(pct)}% of your team uses ${feature.replace(/_/g, ' ')} — consider training sessions.`,
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
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">
                        {insight.feature.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {insight.usagePercent}% adoption
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
