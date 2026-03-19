import { useMemo } from 'react';
import { CopilotDataRow } from '@/pages/Index';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Cpu, Monitor, Code, TrendingUp, Bot, MessageSquare, Terminal, Calendar, Zap, FileCode, ArrowUpDown } from 'lucide-react';
import React from 'react';

interface UserStatsDialogProps {
  userName: string | null;
  allData: CopilotDataRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserStatsDialog = ({ userName, allData, open, onOpenChange }: UserStatsDialogProps) => {
  const profile = useMemo(() => {
    if (!userName) return null;
    const userData = allData.filter(r => r.user_login === userName);
    if (userData.length === 0) return null;

    const modelCounts = new Map<string, number>();
    userData.forEach(row => {
      (row.totals_by_model_feature || []).forEach(mf => {
        modelCounts.set(mf.model, (modelCounts.get(mf.model) || 0) + (mf.user_initiated_interaction_count || 0));
      });
    });
    const modelsSorted = Array.from(modelCounts.entries()).sort((a, b) => b[1] - a[1]);

    const ideCounts = new Map<string, number>();
    userData.forEach(row => {
      (row.totals_by_ide || []).forEach(ide => {
        ideCounts.set(ide.ide, (ideCounts.get(ide.ide) || 0) + (ide.user_initiated_interaction_count || 0));
      });
    });
    const idesSorted = Array.from(ideCounts.entries()).sort((a, b) => b[1] - a[1]);

    const langCounts = new Map<string, number>();
    userData.forEach(row => {
      (row.totals_by_language_feature || []).forEach(lf => {
        if (lf.language && lf.language !== 'unknown') {
          langCounts.set(lf.language, (langCounts.get(lf.language) || 0) + (lf.code_generation_activity_count || 0));
        }
      });
    });
    const topLanguages = Array.from(langCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([lang, count]) => ({ lang, count }));

    const featureCounts = new Map<string, number>();
    userData.forEach(row => {
      (row.totals_by_feature || []).forEach(f => {
        if (f.user_initiated_interaction_count > 0) {
          featureCounts.set(f.feature, (featureCounts.get(f.feature) || 0) + f.user_initiated_interaction_count);
        }
      });
    });
    const topFeatures = Array.from(featureCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([feature, count]) => ({ feature, count }));

    const totalInteractions = userData.reduce((s, r) => s + (r.user_initiated_interaction_count || 0), 0);
    const totalGenerations = userData.reduce((s, r) => s + (r.code_generation_activity_count || 0), 0);
    const totalAcceptances = userData.reduce((s, r) => s + (r.code_acceptance_activity_count || 0), 0);
    const totalLinesAdded = userData.reduce((s, r) => s + (r.loc_added_sum || 0), 0);
    const acceptanceRate = totalGenerations > 0 ? (totalAcceptances / totalGenerations) * 100 : null;

    const usedAgent = userData.some(r => r.used_agent);
    const usedChat = userData.some(r => r.used_chat);
    const usedCLI = userData.some(r => r.used_cli);

    const activeDays = new Set(userData.map(r => r.day)).size;
    const dateRange = userData.map(r => r.day).sort();

    return { topLanguages, topFeatures, totalInteractions, totalGenerations, totalAcceptances, totalLinesAdded, acceptanceRate, usedAgent, usedChat, usedCLI, activeDays, firstDay: dateRange[0], lastDay: dateRange[dateRange.length - 1], modelsSorted, idesSorted };
  }, [userName, allData]);

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-lg">{userName}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className="text-[10px] font-normal gap-1"><Calendar className="h-2.5 w-2.5" />{profile.activeDays} active day{profile.activeDays !== 1 ? 's' : ''}</Badge>
                <Badge variant="outline" className="text-[10px] font-normal">{profile.firstDay} → {profile.lastDay}</Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={<Zap className="h-3.5 w-3.5" />} label="Interactions" value={profile.totalInteractions.toLocaleString()} />
              <StatCard icon={<FileCode className="h-3.5 w-3.5" />} label="Generations" value={profile.totalGenerations.toLocaleString()} />
              <StatCard icon={<TrendingUp className="h-3.5 w-3.5" />} label="Acceptance Rate" value={profile.acceptanceRate !== null ? `${profile.acceptanceRate.toFixed(1)}%` : 'N/A'} />
              <StatCard icon={<ArrowUpDown className="h-3.5 w-3.5" />} label="Lines Added" value={profile.totalLinesAdded.toLocaleString()} />
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground mb-2">Modes Used</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.usedAgent && <Badge className="gap-1 text-xs bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 hover:bg-violet-100"><Bot className="h-3 w-3" />Agent</Badge>}
                {profile.usedChat && <Badge className="gap-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 hover:bg-blue-100"><MessageSquare className="h-3 w-3" />Chat</Badge>}
                {profile.usedCLI && <Badge className="gap-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 hover:bg-green-100"><Terminal className="h-3 w-3" />CLI</Badge>}
                {!profile.usedAgent && !profile.usedChat && !profile.usedCLI && <span className="text-xs text-muted-foreground">None detected</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2"><Monitor className="h-3.5 w-3.5" />IDEs</div>
                <div className="space-y-1">{profile.idesSorted.map(([ide, count], i) => (<div key={ide} className="flex items-center justify-between text-sm"><span className={i === 0 ? 'font-medium' : 'text-muted-foreground'}>{ide}</span><span className="text-xs text-muted-foreground">{count.toLocaleString()}</span></div>))}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2"><Cpu className="h-3.5 w-3.5" />Models</div>
                <div className="space-y-1">{profile.modelsSorted.map(([model, count], i) => (<div key={model} className="flex items-center justify-between text-sm"><span className={i === 0 ? 'font-medium' : 'text-muted-foreground'}>{model}</span><span className="text-xs text-muted-foreground">{count.toLocaleString()}</span></div>))}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.topLanguages.length > 0 && (<div className="rounded-lg border p-3"><div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2"><Code className="h-3.5 w-3.5" />Top Languages</div><div className="space-y-1">{profile.topLanguages.map(({ lang, count }) => (<div key={lang} className="flex items-center justify-between text-sm"><span className="font-medium">{lang}</span><span className="text-xs text-muted-foreground">{count.toLocaleString()} gen.</span></div>))}</div></div>)}
              {profile.topFeatures.length > 0 && (<div className="rounded-lg border p-3"><div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2"><Zap className="h-3.5 w-3.5" />Top Features</div><div className="space-y-1">{profile.topFeatures.map(({ feature, count }) => (<div key={feature} className="flex items-center justify-between text-sm"><span className="font-medium capitalize">{feature.replace(/_/g, ' ')}</span><span className="text-xs text-muted-foreground">{count.toLocaleString()}</span></div>))}</div></div>)}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-lg border p-3 text-center">
    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">{icon}{label}</div>
    <div className="text-lg font-bold">{value}</div>
  </div>
);
