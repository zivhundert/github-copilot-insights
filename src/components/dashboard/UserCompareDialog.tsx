import { useMemo, useState, useRef, useEffect } from 'react';
import { CopilotDataRow } from '@/pages/Index';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Activity,
  Plus,
  X,
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
  totalLinesSuggestedAdd: number;
  totalLinesSuggestedDelete: number;
  acceptanceRate: number | null;
  aiAmplification: number | null;
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

const USER_COLORS = [
  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-400', ring: 'ring-blue-400' },
  { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-400', ring: 'ring-amber-400' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-400', ring: 'ring-emerald-400' },
  { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-400', ring: 'ring-violet-400' },
  { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-400', ring: 'ring-rose-400' },
];

const MAX_USERS = 5;

function buildProfile(userName: string, allData: CopilotDataRow[]): UserProfile | null {
  const userData = allData.filter((r) => r.user_login === userName);
  if (userData.length === 0) return null;

  const modelCounts = new Map<string, number>();
  userData.forEach((row) => {
    (row.totals_by_model_feature || []).forEach((mf) => {
      modelCounts.set(mf.model, (modelCounts.get(mf.model) || 0) + (mf.user_initiated_interaction_count || 0));
    });
  });
  const modelsSorted = Array.from(modelCounts.entries()).sort((a, b) => b[1] - a[1]);

  const ideCounts = new Map<string, number>();
  userData.forEach((row) => {
    (row.totals_by_ide || []).forEach((ide) => {
      ideCounts.set(ide.ide, (ideCounts.get(ide.ide) || 0) + (ide.user_initiated_interaction_count || 0));
    });
  });
  const idesSorted = Array.from(ideCounts.entries()).sort((a, b) => b[1] - a[1]);

  const langCounts = new Map<string, number>();
  userData.forEach((row) => {
    (row.totals_by_language_feature || []).forEach((lf) => {
      if (lf.language && lf.language !== 'unknown') {
        langCounts.set(lf.language, (langCounts.get(lf.language) || 0) + (lf.code_generation_activity_count || 0));
      }
    });
  });
  const topLanguages = Array.from(langCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([lang, count]) => ({ lang, count }));

  const featureCounts = new Map<string, number>();
  userData.forEach((row) => {
    (row.totals_by_feature || []).forEach((f) => {
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
  const totalLinesDeleted = userData.reduce((s, r) => s + (r.loc_deleted_sum || 0), 0);
  const totalLinesSuggestedAdd = userData.reduce((s, r) => s + (r.loc_suggested_to_add_sum || 0), 0);
  const totalLinesSuggestedDelete = userData.reduce((s, r) => s + (r.loc_suggested_to_delete_sum || 0), 0);
  const acceptanceRate = totalGenerations > 0 ? (totalAcceptances / totalGenerations) * 100 : null;
  const aiAmplification = totalLinesSuggestedAdd > 0 ? (totalLinesAdded / totalLinesSuggestedAdd) * 100 : null;

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
    totalLinesSuggestedAdd,
    totalLinesSuggestedDelete,
    acceptanceRate,
    aiAmplification,
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

/* ── Inline dropdown picker (works inside Dialog) ── */

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

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground h-9"
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
              onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); setSearch(''); } }}
            />
          </div>
          <div className="max-h-[180px] overflow-y-auto p-1">
            {filtered.map((user) => (
              <button
                key={user}
                type="button"
                className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors text-left ${selected === user ? 'bg-muted font-medium' : ''}`}
                onClick={() => { onSelect(user); setOpen(false); setSearch(''); }}
              >
                <div className="h-5 w-5 rounded-full bg-muted-foreground/10 flex items-center justify-center text-[10px] font-medium shrink-0">
                  {user.slice(0, 2).toUpperCase()}
                </div>
                <span className="truncate">{user}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-4">No users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Main dialog ── */

export const UserCompareDialog = ({ allData, open, onOpenChange }: UserCompareDialogProps) => {
  const [selectedUsers, setSelectedUsers] = useState<(string | null)[]>([null, null]);

  const allUsers = useMemo(
    () => Array.from(new Set(allData.map((r) => r.user_login))).sort(),
    [allData]
  );

  const profiles = useMemo(
    () => selectedUsers.map((u) => (u ? buildProfile(u, allData) : null)),
    [selectedUsers, allData]
  );

  const validProfiles = profiles.filter((p): p is UserProfile => p !== null);
  const canCompare = validProfiles.length >= 2;

  const alreadySelected = new Set(selectedUsers.filter((u): u is string => u !== null));

  const updateUser = (index: number, user: string) => {
    setSelectedUsers((prev) => {
      const next = [...prev];
      next[index] = user;
      return next;
    });
  };

  const removeUser = (index: number) => {
    setSelectedUsers((prev) => prev.filter((_, i) => i !== index));
  };

  const addSlot = () => {
    if (selectedUsers.length < MAX_USERS) {
      setSelectedUsers((prev) => [...prev, null]);
    }
  };

  // Dynamic grid cols based on user count
  const colCount = selectedUsers.length;
  const gridCols =
    colCount === 2 ? 'grid-cols-2' :
    colCount === 3 ? 'grid-cols-3' :
    colCount === 4 ? 'grid-cols-4' :
    'grid-cols-5';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base">Compare Users</DialogTitle>
        </DialogHeader>

        {/* User picker slots */}
        <div className="shrink-0 flex flex-wrap items-center gap-2">
          {selectedUsers.map((user, idx) => (
            <div key={idx} className="flex items-center gap-1 min-w-[180px] flex-1 max-w-[240px]">
              <div className={`w-1.5 h-8 rounded-full shrink-0 ${USER_COLORS[idx % USER_COLORS.length].dot}`} />
              <div className="flex-1">
                <UserPicker
                  users={allUsers.filter((u) => !alreadySelected.has(u) || u === user)}
                  selected={user}
                  onSelect={(u) => updateUser(idx, u)}
                  label={`User ${idx + 1}`}
                />
              </div>
              {selectedUsers.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeUser(idx)}
                  className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {selectedUsers.length < MAX_USERS && (
            <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={addSlot}>
              <Plus className="h-3.5 w-3.5" />
              Add user
            </Button>
          )}
        </div>

        {canCompare ? (
          <div className="overflow-y-auto flex-1 -mr-6 pr-6">
            <div className="space-y-5">

              {/* ── User identity headers ── */}
              <div className={`grid ${gridCols} gap-3`}>
                {profiles.map((profile, idx) =>
                  profile ? (
                    <UserHeader key={profile.userName} profile={profile} color={USER_COLORS[idx % USER_COLORS.length]} />
                  ) : (
                    <div key={idx} className="rounded-lg border border-dashed p-3 flex items-center justify-center text-xs text-muted-foreground">
                      Select a user
                    </div>
                  )
                )}
              </div>

              {/* ── Key metrics ── */}
              <div>
                <SectionLabel>Key Metrics</SectionLabel>
                <div className="rounded-lg border divide-y">
                  <MultiMetricRow label="Active Days" icon={<Calendar className="h-3.5 w-3.5" />} profiles={profiles} getValue={(p) => p.activeDays} />
                  <MultiMetricRow label="Interactions" icon={<Zap className="h-3.5 w-3.5" />} profiles={profiles} getValue={(p) => p.totalInteractions} />
                  <MultiMetricRow label="Code Generations" icon={<FileCode className="h-3.5 w-3.5" />} profiles={profiles} getValue={(p) => p.totalGenerations} />
                  <MultiMetricRow label="Code Acceptances" icon={<TrendingUp className="h-3.5 w-3.5" />} profiles={profiles} getValue={(p) => p.totalAcceptances} />
                  <MultiMetricRow label="Acceptance Rate" icon={<Activity className="h-3.5 w-3.5" />} profiles={profiles} getValue={(p) => p.acceptanceRate} format="percent" />
                </div>
              </div>

              {/* ── Lines of code ── */}
              <div>
                <SectionLabel>Lines of Code</SectionLabel>
                <div className="rounded-lg border divide-y">
                  <MultiMetricRow label="Lines Added" icon={<ArrowUp className="h-3.5 w-3.5" />} profiles={profiles} getValue={(p) => p.totalLinesAdded} />
                  <MultiMetricRow label="Lines Deleted" icon={<ArrowDown className="h-3.5 w-3.5" />} profiles={profiles} getValue={(p) => p.totalLinesDeleted} />
                  <MultiMetricRow label="Lines Suggested (Add)" icon={<ArrowUpDown className="h-3.5 w-3.5" />} profiles={profiles} getValue={(p) => p.totalLinesSuggestedAdd} />
                  <MultiMetricRow label="Lines Suggested (Delete)" icon={<ArrowUpDown className="h-3.5 w-3.5" />} profiles={profiles} getValue={(p) => p.totalLinesSuggestedDelete} />
                  <MultiMetricRow label="AI Amplification" icon={<Activity className="h-3.5 w-3.5" />} profiles={profiles} getValue={(p) => p.aiAmplification} format="percent" />
                </div>
              </div>

              {/* ── Modes ── */}
              <div>
                <SectionLabel>Modes Used</SectionLabel>
                <div className={`grid ${gridCols} gap-3`}>
                  {profiles.map((profile, idx) => (
                    <div key={idx} className="rounded-lg border p-3">
                      {profile ? <ModesBadges profile={profile} /> : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── IDEs ── */}
              <div>
                <SectionLabel>IDEs</SectionLabel>
                <div className={`grid ${gridCols} gap-3`}>
                  {profiles.map((profile, idx) => (
                    <div key={idx} className="rounded-lg border p-3">
                      {profile ? <ListItems items={profile.idesSorted} /> : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Models ── */}
              <div>
                <SectionLabel>Models</SectionLabel>
                <div className={`grid ${gridCols} gap-3`}>
                  {profiles.map((profile, idx) => (
                    <div key={idx} className="rounded-lg border p-3">
                      {profile ? <ListItems items={profile.modelsSorted} /> : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Languages ── */}
              <div>
                <SectionLabel>Top Languages</SectionLabel>
                <div className={`grid ${gridCols} gap-3`}>
                  {profiles.map((profile, idx) => (
                    <div key={idx} className="rounded-lg border p-3">
                      {profile ? <NamedListItems items={profile.topLanguages.map((l) => [l.lang, l.count])} suffix="gen." /> : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Features ── */}
              <div>
                <SectionLabel>Top Features</SectionLabel>
                <div className={`grid ${gridCols} gap-3`}>
                  {profiles.map((profile, idx) => (
                    <div key={idx} className="rounded-lg border p-3">
                      {profile ? <NamedListItems items={profile.topFeatures.map((f) => [f.feature.replace(/_/g, ' '), f.count])} capitalize /> : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Select at least two users above to compare their Copilot usage.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ── helper components ── */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{children}</div>
);

const UserHeader = ({ profile, color }: { profile: UserProfile; color: typeof USER_COLORS[number] }) => (
  <div className={`rounded-lg border p-3 ${color.bg}`}>
    <div className="flex items-center gap-2 mb-2">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${color.dot} text-white text-xs font-bold shrink-0`}>
        {profile.userName.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className={`text-sm font-semibold truncate ${color.text}`}>{profile.userName}</div>
        <div className="text-[10px] text-muted-foreground">{profile.firstDay} → {profile.lastDay}</div>
      </div>
    </div>
    <div className="flex flex-wrap gap-1">
      <Badge variant="outline" className="text-[10px] font-normal gap-1">
        <Calendar className="h-2.5 w-2.5" />{profile.activeDays} day{profile.activeDays !== 1 ? 's' : ''}
      </Badge>
      <Badge variant="outline" className="text-[10px] font-normal gap-1">
        <Zap className="h-2.5 w-2.5" />{profile.totalInteractions.toLocaleString()}
      </Badge>
    </div>
  </div>
);

/** A metric row that compares N users. Highlights the best value. */
const MultiMetricRow = ({
  label,
  icon,
  profiles,
  getValue,
  format,
}: {
  label: string;
  icon: React.ReactNode;
  profiles: (UserProfile | null)[];
  getValue: (p: UserProfile) => number | null;
  format?: 'percent' | 'number';
}) => {
  const fmt = (v: number | null) => {
    if (v === null) return 'N/A';
    if (format === 'percent') return `${v.toFixed(1)}%`;
    return v.toLocaleString();
  };

  const values = profiles.map((p) => (p ? getValue(p) : null));
  const numericValues = values.filter((v): v is number => v !== null);
  const maxVal = numericValues.length > 0 ? Math.max(...numericValues) : null;
  const minVal = numericValues.length > 0 ? Math.min(...numericValues) : null;
  const allSame = maxVal !== null && maxVal === minVal;

  return (
    <div className="flex items-center px-4 py-2.5 gap-3">
      {/* Label */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap w-[160px] shrink-0">
        {icon}
        <span>{label}</span>
      </div>
      {/* Values */}
      <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${profiles.length}, 1fr)` }}>
        {values.map((val, idx) => {
          const isBest = !allSame && val !== null && val === maxVal;
          return (
            <div key={idx} className="flex items-center gap-1.5">
              <span className={`text-base tabular-nums ${isBest ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'font-semibold'}`}>
                {fmt(val)}
              </span>
              {isBest && <ArrowUp className="h-3 w-3 text-emerald-500 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ModesBadges = ({ profile }: { profile: UserProfile }) => (
  <div className="flex flex-wrap gap-1.5">
    {profile.usedAgent && (
      <Badge className="gap-1 text-xs bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 hover:bg-violet-100">
        <Bot className="h-3 w-3" />Agent
      </Badge>
    )}
    {profile.usedChat && (
      <Badge className="gap-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 hover:bg-blue-100">
        <MessageSquare className="h-3 w-3" />Chat
      </Badge>
    )}
    {profile.usedCLI && (
      <Badge className="gap-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 hover:bg-green-100">
        <Terminal className="h-3 w-3" />CLI
      </Badge>
    )}
    {!profile.usedAgent && !profile.usedChat && !profile.usedCLI && (
      <span className="text-xs text-muted-foreground">None detected</span>
    )}
  </div>
);

const ListItems = ({ items }: { items: [string, number][] }) => {
  if (items.length === 0) return <span className="text-xs text-muted-foreground">None</span>;
  return (
    <div className="space-y-1.5">
      {items.map(([name, count], i) => (
        <div key={name} className="flex items-center justify-between text-sm">
          <span className={i === 0 ? 'font-medium' : 'text-muted-foreground'}>{name}</span>
          <span className="text-xs text-muted-foreground tabular-nums">{count.toLocaleString()}</span>
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
  if (items.length === 0) return <span className="text-xs text-muted-foreground">None</span>;
  return (
    <div className="space-y-1.5">
      {items.map(([name, count]) => (
        <div key={name} className="flex items-center justify-between text-sm">
          <span className={`font-medium ${cap ? 'capitalize' : ''}`}>{name}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {count.toLocaleString()}{suffix ? ` ${suffix}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
};

