import { useMemo, useState, useRef, useEffect } from 'react';
import { CopilotDataRow } from '@/pages/Index';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Cpu,
  Monitor,
  Code,
  TrendingUp,
  Bot,
  MessageSquare,
  Terminal,
  Zap,
  FileCode,
  ArrowUpDown,
  Calendar,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import React from 'react';

interface UserCompareDialogProps {
  allData: CopilotDataRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserProfile {
  userName: string;
  totalInteractions: number;
  totalGenerations: number;
  totalAcceptances: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  acceptanceRate: number | null;
  usedAgent: boolean;
  usedChat: boolean;
  usedCLI: boolean;
  activeDays: number;
  firstDay: string;
  lastDay: string;
  modelsSorted: [string, number][];
  idesSorted: [string, number][];
  topLanguages: { lang: string; count: number }[];
  topFeatures: { feature: string; count: number }[];
}

function buildProfile(userName: string, allData: CopilotDataRow[]): UserProfile | null {
  const userData = allData.filter((r) => r.user_login === userName);
  if (userData.length === 0) return null;

  const modelCounts = new Map<string, number>();
  userData.forEach((row) => {
    (row.totals_by_model_feature || []).forEach((mf) => {
      modelCounts.set(
        mf.model,
        (modelCounts.get(mf.model) || 0) + (mf.user_initiated_interaction_count || 0)
      );
    });
  });
  const modelsSorted = Array.from(modelCounts.entries()).sort((a, b) => b[1] - a[1]);

  const ideCounts = new Map<string, number>();
  userData.forEach((row) => {
    (row.totals_by_ide || []).forEach((ide) => {
      ideCounts.set(
        ide.ide,
        (ideCounts.get(ide.ide) || 0) + (ide.user_initiated_interaction_count || 0)
      );
    });
  });
  const idesSorted = Array.from(ideCounts.entries()).sort((a, b) => b[1] - a[1]);

  const langCounts = new Map<string, number>();
  userData.forEach((row) => {
    (row.totals_by_language_feature || []).forEach((lf) => {
      if (lf.language && lf.language !== 'unknown') {
        langCounts.set(
          lf.language,
          (langCounts.get(lf.language) || 0) + (lf.code_generation_activity_count || 0)
        );
      }
    });
  });
  const topLanguages = Array.from(langCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => ({ lang, count }));

  const featureCounts = new Map<string, number>();
  userData.forEach((row) => {
    (row.totals_by_feature || []).forEach((f) => {
      if (f.user_initiated_interaction_count > 0) {
        featureCounts.set(
          f.feature,
          (featureCounts.get(f.feature) || 0) + f.user_initiated_interaction_count
        );
      }
    });
  });
  const topFeatures = Array.from(featureCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([feature, count]) => ({ feature, count }));

  const totalInteractions = userData.reduce(
    (s, r) => s + (r.user_initiated_interaction_count || 0),
    0
  );
  const totalGenerations = userData.reduce(
    (s, r) => s + (r.code_generation_activity_count || 0),
    0
  );
  const totalAcceptances = userData.reduce(
    (s, r) => s + (r.code_acceptance_activity_count || 0),
    0
  );
  const totalLinesAdded = userData.reduce((s, r) => s + (r.loc_added_sum || 0), 0);
  const totalLinesDeleted = userData.reduce((s, r) => s + (r.loc_deleted_sum || 0), 0);
  const acceptanceRate =
    totalGenerations > 0 ? (totalAcceptances / totalGenerations) * 100 : null;

  const usedAgent = userData.some((r) => r.used_agent);
  const usedChat = userData.some((r) => r.used_chat);
  const usedCLI = userData.some((r) => r.used_cli);

  const activeDays = new Set(userData.map((r) => r.day)).size;
  const dateRange = userData.map((r) => r.day).sort();

  return {
    userName,
    totalInteractions,
    totalGenerations,
    totalAcceptances,
    totalLinesAdded,
    totalLinesDeleted,
    acceptanceRate,
    usedAgent,
    usedChat,
    usedCLI,
    activeDays,
    firstDay: dateRange[0],
    lastDay: dateRange[dateRange.length - 1],
    modelsSorted,
    idesSorted,
    topLanguages,
    topFeatures,
  };
}

const DeltaIndicator = ({ a, b }: { a: number; b: number }) => {
  if (a === b) return <Minus className="h-3 w-3 text-muted-foreground" />;
  if (a > b) return <ArrowUp className="h-3 w-3 text-emerald-500" />;
  return <ArrowDown className="h-3 w-3 text-red-400" />;
};

const UserPicker = ({
  users,
  selected,
  onSelect,
  label,
}: {
  users: string[];
  selected: string | null;
  onSelect: (user: string) => void;
  label: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = search
    ? users.filter((u) => u.toLowerCase().includes(search.toLowerCase()))
    : users;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground h-9"
        onClick={() => setOpen(!open)}
      >
        <span className="truncate text-left">{selected || label}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full z-[100] rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search users…"
              className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false);
                  setSearch('');
                }
              }}
            />
          </div>
          <div className="max-h-[180px] overflow-y-auto p-1">
            {filtered.map((user) => (
              <button
                key={user}
                type="button"
                className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors text-left ${
                  selected === user ? 'bg-muted font-medium' : ''
                }`}
                onClick={() => {
                  onSelect(user);
                  setOpen(false);
                  setSearch('');
                }}
              >
                <div className="h-5 w-5 rounded-full bg-muted-foreground/10 flex items-center justify-center text-[10px] font-medium shrink-0">
                  {user.slice(0, 2).toUpperCase()}
                </div>
                <span className="truncate">{user}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-4">
                No users found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const UserCompareDialog = ({
  allData,
  open,
  onOpenChange,
}: UserCompareDialogProps) => {
  const [userA, setUserA] = useState<string | null>(null);
  const [userB, setUserB] = useState<string | null>(null);

  const allUsers = useMemo(
    () => Array.from(new Set(allData.map((r) => r.user_login))).sort(),
    [allData]
  );

  const profileA = useMemo(
    () => (userA ? buildProfile(userA, allData) : null),
    [userA, allData]
  );
  const profileB = useMemo(
    () => (userB ? buildProfile(userB, allData) : null),
    [userB, allData]
  );

  const bothSelected = profileA && profileB;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-base">Compare Users</DialogTitle>
        </DialogHeader>

        {/* User pickers */}
        <div className="grid grid-cols-2 gap-4">
          <UserPicker
            users={allUsers.filter((u) => u !== userB)}
            selected={userA}
            onSelect={setUserA}
            label="Select first user"
          />
          <UserPicker
            users={allUsers.filter((u) => u !== userA)}
            selected={userB}
            onSelect={setUserB}
            label="Select second user"
          />
        </div>

        {bothSelected ? (
          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-4 pr-4">
              {/* Key metrics comparison */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-x-3 gap-y-0">
                <MetricRow
                  label="Active Days"
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  valueA={profileA.activeDays}
                  valueB={profileB.activeDays}
                />
                <MetricRow
                  label="Interactions"
                  icon={<Zap className="h-3.5 w-3.5" />}
                  valueA={profileA.totalInteractions}
                  valueB={profileB.totalInteractions}
                />
                <MetricRow
                  label="Generations"
                  icon={<FileCode className="h-3.5 w-3.5" />}
                  valueA={profileA.totalGenerations}
                  valueB={profileB.totalGenerations}
                />
                <MetricRow
                  label="Acceptances"
                  icon={<TrendingUp className="h-3.5 w-3.5" />}
                  valueA={profileA.totalAcceptances}
                  valueB={profileB.totalAcceptances}
                />
                <MetricRow
                  label="Lines Added"
                  icon={<ArrowUpDown className="h-3.5 w-3.5" />}
                  valueA={profileA.totalLinesAdded}
                  valueB={profileB.totalLinesAdded}
                />
                <MetricRow
                  label="Lines Deleted"
                  icon={<ArrowUpDown className="h-3.5 w-3.5" />}
                  valueA={profileA.totalLinesDeleted}
                  valueB={profileB.totalLinesDeleted}
                />
                <MetricRow
                  label="Acceptance Rate"
                  icon={<TrendingUp className="h-3.5 w-3.5" />}
                  valueA={profileA.acceptanceRate}
                  valueB={profileB.acceptanceRate}
                  format="percent"
                />
              </div>

              {/* Modes */}
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Modes Used
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ModesBadges profile={profileA} />
                  <ModesBadges profile={profileB} />
                </div>
              </div>

              {/* IDEs & Models */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                    <Monitor className="h-3.5 w-3.5" />
                    IDEs — {profileA.userName}
                  </div>
                  <ListItems items={profileA.idesSorted} />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                    <Monitor className="h-3.5 w-3.5" />
                    IDEs — {profileB.userName}
                  </div>
                  <ListItems items={profileB.idesSorted} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                    <Cpu className="h-3.5 w-3.5" />
                    Models — {profileA.userName}
                  </div>
                  <ListItems items={profileA.modelsSorted} />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                    <Cpu className="h-3.5 w-3.5" />
                    Models — {profileB.userName}
                  </div>
                  <ListItems items={profileB.modelsSorted} />
                </div>
              </div>

              {/* Languages & Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                    <Code className="h-3.5 w-3.5" />
                    Languages — {profileA.userName}
                  </div>
                  <NamedListItems
                    items={profileA.topLanguages.map((l) => [l.lang, l.count])}
                    suffix="gen."
                  />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                    <Code className="h-3.5 w-3.5" />
                    Languages — {profileB.userName}
                  </div>
                  <NamedListItems
                    items={profileB.topLanguages.map((l) => [l.lang, l.count])}
                    suffix="gen."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                    <Zap className="h-3.5 w-3.5" />
                    Features — {profileA.userName}
                  </div>
                  <NamedListItems
                    items={profileA.topFeatures.map((f) => [
                      f.feature.replace(/_/g, ' '),
                      f.count,
                    ])}
                    capitalize
                  />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                    <Zap className="h-3.5 w-3.5" />
                    Features — {profileB.userName}
                  </div>
                  <NamedListItems
                    items={profileB.topFeatures.map((f) => [
                      f.feature.replace(/_/g, ' '),
                      f.count,
                    ])}
                    capitalize
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Select two users above to compare their Copilot usage side by side.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ── helper components ── */

const MetricRow = ({
  label,
  icon,
  valueA,
  valueB,
  format,
}: {
  label: string;
  icon: React.ReactNode;
  valueA: number | null;
  valueB: number | null;
  format?: 'percent' | 'number';
}) => {
  const fmt = (v: number | null) => {
    if (v === null) return 'N/A';
    if (format === 'percent') return `${v.toFixed(1)}%`;
    return v.toLocaleString();
  };

  const numA = valueA ?? 0;
  const numB = valueB ?? 0;

  return (
    <>
      <div className="flex items-center justify-between py-2 border-b border-border/50">
        <span className="text-lg font-semibold tabular-nums">{fmt(valueA)}</span>
        {valueA !== null && valueB !== null && <DeltaIndicator a={numA} b={numB} />}
      </div>
      <div className="flex items-center justify-center gap-1.5 py-2 border-b border-border/50 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center justify-between py-2 border-b border-border/50">
        {valueA !== null && valueB !== null && <DeltaIndicator a={numB} b={numA} />}
        <span className="text-lg font-semibold tabular-nums ml-auto">{fmt(valueB)}</span>
      </div>
    </>
  );
};

const ModesBadges = ({ profile }: { profile: UserProfile }) => (
  <div className="flex flex-wrap gap-1.5">
    {profile.usedAgent && (
      <Badge className="gap-1 text-xs bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 hover:bg-violet-100">
        <Bot className="h-3 w-3" />
        Agent
      </Badge>
    )}
    {profile.usedChat && (
      <Badge className="gap-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 hover:bg-blue-100">
        <MessageSquare className="h-3 w-3" />
        Chat
      </Badge>
    )}
    {profile.usedCLI && (
      <Badge className="gap-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 hover:bg-green-100">
        <Terminal className="h-3 w-3" />
        CLI
      </Badge>
    )}
    {!profile.usedAgent && !profile.usedChat && !profile.usedCLI && (
      <span className="text-xs text-muted-foreground">None detected</span>
    )}
  </div>
);

const ListItems = ({ items }: { items: [string, number][] }) => {
  if (items.length === 0)
    return <span className="text-xs text-muted-foreground">None</span>;
  return (
    <div className="space-y-1">
      {items.map(([name, count], i) => (
        <div key={name} className="flex items-center justify-between text-sm">
          <span className={i === 0 ? 'font-medium' : 'text-muted-foreground'}>
            {name}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {count.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const NamedListItems = ({
  items,
  suffix,
  capitalize: cap,
}: {
  items: [string, number][];
  suffix?: string;
  capitalize?: boolean;
}) => {
  if (items.length === 0)
    return <span className="text-xs text-muted-foreground">None</span>;
  return (
    <div className="space-y-1">
      {items.map(([name, count]) => (
        <div key={name} className="flex items-center justify-between text-sm">
          <span className={`font-medium ${cap ? 'capitalize' : ''}`}>{name}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {count.toLocaleString()}
            {suffix ? ` ${suffix}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
};






