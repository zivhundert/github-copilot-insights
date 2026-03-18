import { useMemo, useState, useCallback } from 'react';
import Highcharts from 'highcharts';
import 'highcharts/modules/treemap';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getTreemapChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MousePointerClick } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProgrammingLanguageTreemapProps {
  data: CopilotDataRow[];
}

interface LangUserStats {
  linesAdded: number;
  generations: number;
  acceptances: number;
}

export const ProgrammingLanguageTreemap = ({ data }: ProgrammingLanguageTreemapProps) => {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const { treemapData, langUsers } = useMemo(() => {
    const langCounts = new Map<string, number>();
    const usersByLang = new Map<string, Map<string, LangUserStats>>();

    data.forEach(row => {
      (row.totals_by_language_feature || []).forEach(lf => {
        const lang = lf.language;
        if (lang && lang !== 'unknown') {
          const lines = (lf.loc_added_sum || 0) + (lf.code_generation_activity_count || 0);
          const generations = lf.code_generation_activity_count || 0;
          const acceptances = lf.code_acceptance_activity_count || 0;
          const linesAdded = lf.loc_added_sum || 0;

          langCounts.set(lang, (langCounts.get(lang) || 0) + lines);

          if (!usersByLang.has(lang)) usersByLang.set(lang, new Map());
          const users = usersByLang.get(lang)!;
          const prev = users.get(row.user_login) || { linesAdded: 0, generations: 0, acceptances: 0 };
          users.set(row.user_login, {
            linesAdded: prev.linesAdded + linesAdded,
            generations: prev.generations + generations,
            acceptances: prev.acceptances + acceptances,
          });
        }
      });
    });

    const totalCount = Array.from(langCounts.values()).reduce((sum, count) => sum + count, 0);

    const points = Array.from(langCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([lang, count], index) => ({
        name: lang,
        value: count,
        percentage: totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0',
        color: CHART_COLORS.treemap[index % CHART_COLORS.treemap.length],
      }));

    return { treemapData: points, langUsers: usersByLang };
  }, [data]);

  const handlePointClick = useCallback(function (this: Highcharts.Point) {
    setSelectedLang(this.name);
  }, []);

  const selectedUsers = useMemo(() => {
    if (!selectedLang) return [];
    const users = langUsers.get(selectedLang);
    if (!users) return [];
    return [...users.entries()]
      .map(([user, stats]) => ({ user, ...stats }))
      .sort((a, b) => b.generations - a.generations);
  }, [selectedLang, langUsers]);

  const options: Partial<HighchartsOptions> = {
    ...getTreemapChartConfig(),
    tooltip: {
      ...getTreemapChartConfig().tooltip,
      pointFormat: '<b>{point.name}</b><br/>Usage: {point.percentage}%<br/><span style="font-size:10px;color:gray">Click to see users</span>',
    },
    plotOptions: {
      treemap: {
        ...getTreemapChartConfig().plotOptions?.treemap,
        cursor: 'pointer',
        point: {
          events: {
            click: handlePointClick,
          },
        },
      },
    },
    series: [{
      type: 'treemap',
      data: treemapData,
      name: 'Programming Languages',
    }],
  };

  const isEmpty = treemapData.length === 0;

  return (
    <ChartContainer
      title="Programming Language Usage"
      helpText="Visual representation of programming languages used with Copilot. Click a language block to see which users are using it."
    >
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No programming language data available
        </div>
      ) : (
        <BaseHighchart options={options} />
      )}

      <Dialog open={!!selectedLang && selectedUsers.length > 0} onOpenChange={(open) => { if (!open) setSelectedLang(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{selectedLang}</span>
              <Badge variant="secondary" className="text-xs">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs text-right">Lines Added</TableHead>
                  <TableHead className="text-xs text-right">Generations</TableHead>
                  <TableHead className="text-xs text-right">Acceptances</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedUsers.map(({ user, linesAdded, generations, acceptances }) => (
                  <TableRow key={user}>
                    <TableCell className="text-sm font-medium py-1.5">{user}</TableCell>
                    <TableCell className="text-sm text-right py-1.5">{linesAdded.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-right py-1.5">{generations.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-right py-1.5">{acceptances.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </ChartContainer>
  );
};
