
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopilotDataRow } from '@/pages/Index';
import { User, Cpu, Monitor, Code, TrendingUp, Bot, MessageSquare, Terminal } from 'lucide-react';

interface UserProfileCardProps {
  data: CopilotDataRow[];
  userName: string;
}

export const UserProfileCard = ({ data, userName }: UserProfileCardProps) => {
  const profile = useMemo(() => {
    // Preferred model
    const modelCounts = new Map<string, number>();
    data.forEach(row => {
      (row.totals_by_model_feature || []).forEach(mf => {
        modelCounts.set(mf.model, (modelCounts.get(mf.model) || 0) + (mf.user_initiated_interaction_count || 0));
      });
    });
    const preferredModel = Array.from(modelCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Preferred IDE
    const ideCounts = new Map<string, number>();
    data.forEach(row => {
      (row.totals_by_ide || []).forEach(ide => {
        ideCounts.set(ide.ide, (ideCounts.get(ide.ide) || 0) + (ide.user_initiated_interaction_count || 0));
      });
    });
    const preferredIDE = Array.from(ideCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Top languages
    const langCounts = new Map<string, number>();
    data.forEach(row => {
      (row.totals_by_language_feature || []).forEach(lf => {
        langCounts.set(lf.language, (langCounts.get(lf.language) || 0) + (lf.code_generation_activity_count || 0));
      });
    });
    const topLanguages = Array.from(langCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);

    // Acceptance rate
    const totalAdded = data.reduce((s, r) => s + (r.loc_added_sum || 0), 0);
    const totalSuggested = data.reduce((s, r) => s + (r.loc_suggested_to_add_sum || 0), 0);
    const acceptanceRate = totalSuggested > 0 ? (totalAdded / totalSuggested) * 100 : 0;

    // Total interactions
    const totalInteractions = data.reduce((s, r) => s + (r.user_initiated_interaction_count || 0), 0);

    // Features used
    const usedAgent = data.some(r => r.used_agent);
    const usedChat = data.some(r => r.used_chat);
    const usedCLI = data.some(r => r.used_cli);

    // Active days
    const uniqueDays = new Set(data.map(r => r.day)).size;

    return { preferredModel, preferredIDE, topLanguages, acceptanceRate, totalInteractions, usedAgent, usedChat, usedCLI, uniqueDays };
  }, [data]);

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{userName}'s Profile</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Cpu className="h-3.5 w-3.5" />
              Preferred Model
            </div>
            <p className="text-sm font-medium truncate">{profile.preferredModel}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Monitor className="h-3.5 w-3.5" />
              Preferred IDE
            </div>
            <p className="text-sm font-medium">{profile.preferredIDE}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Code className="h-3.5 w-3.5" />
              Top Languages
            </div>
            <div className="flex flex-wrap gap-1">
              {profile.topLanguages.map(lang => (
                <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Acceptance Rate
            </div>
            <p className="text-sm font-medium">{profile.acceptanceRate.toFixed(1)}%</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Total Interactions
            </div>
            <p className="text-sm font-medium">{profile.totalInteractions.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Features Used
            </div>
            <div className="flex flex-wrap gap-1">
              {profile.usedAgent && <Badge variant="outline" className="text-xs gap-1"><Bot className="h-3 w-3" />Agent</Badge>}
              {profile.usedChat && <Badge variant="outline" className="text-xs gap-1"><MessageSquare className="h-3 w-3" />Chat</Badge>}
              {profile.usedCLI && <Badge variant="outline" className="text-xs gap-1"><Terminal className="h-3 w-3" />CLI</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
