
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/contexts/SettingsContext";
import { getStorageMeta, clearDataStorage, formatBytes } from "@/utils/dataStorage";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Database, Trash2, Download, Users, Search, X } from "lucide-react";

export interface DashboardSettingsSheetProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onClearData?: () => void;
  exportData?: () => string | null;
  availableUsers?: string[];
}

interface FormFields {
  linesPerMinute: number;
  theme: "light" | "dark";
  pricePerHour: number;
  copilotPricePerUser: number;
}

export const DashboardSettings: React.FC<DashboardSettingsSheetProps> = ({ open, onOpenChange, onClearData, exportData, availableUsers = [] }) => {
  const { settings, updateSetting, resetDefaults, toggleChartVisibility, showAllCharts, hideAllCharts } = useSettings();
  const [teamMembers, setTeamMembers] = React.useState<string[]>(settings.myTeamMembers);
  const [teamSearch, setTeamSearch] = React.useState('');
  const [storageMeta, setStorageMeta] = React.useState(getStorageMeta());
  const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm<FormFields>({
    defaultValues: { 
      linesPerMinute: settings.linesPerMinute, 
      theme: settings.theme,
      pricePerHour: settings.pricePerHour,
      copilotPricePerUser: settings.copilotPricePerUser
    },
    mode: "onBlur",
  });

  React.useEffect(() => {
    if (open) {
      reset({ 
        linesPerMinute: settings.linesPerMinute, 
        theme: settings.theme,
        pricePerHour: settings.pricePerHour,
        copilotPricePerUser: settings.copilotPricePerUser
      });
      setStorageMeta(getStorageMeta());
      setTeamMembers(settings.myTeamMembers);
      setTeamSearch('');
    }
  }, [open, settings.linesPerMinute, settings.theme, settings.pricePerHour, settings.copilotPricePerUser, reset, settings.myTeamMembers]);

  const toggleTeamMember = (user: string) => {
    setTeamMembers(prev =>
      prev.includes(user) ? prev.filter(u => u !== user) : [...prev, user]
    );
  };

  const saveTeam = () => {
    updateSetting('myTeamMembers', teamMembers);
  };

  const clearTeam = () => {
    setTeamMembers([]);
    updateSetting('myTeamMembers', []);
  };

  const filteredAvailableUsers = availableUsers.filter(u =>
    u.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const teamIsDirty = JSON.stringify(teamMembers.slice().sort()) !== JSON.stringify(settings.myTeamMembers.slice().sort());

  const onSubmit = (values: FormFields) => {
    updateSetting("linesPerMinute", values.linesPerMinute);
    updateSetting("theme", values.theme);
    updateSetting("pricePerHour", values.pricePerHour);
    updateSetting("copilotPricePerUser", values.copilotPricePerUser);
    onOpenChange(false);
  };

  const chartLabels = {
    cumulativeChart: "Cumulative Usage Chart",
    acceptanceRateChart: "Acceptance Rate Trend",
    modelUsageChart: "AI Model Usage",
    featureUsageChart: "Feature Usage Breakdown",
    averageInteractionsChart: "Average Interactions per Developer",
    ideDistributionChart: "IDE Distribution",
    programmingLanguageTreemap: "Programming Language Treemap",
    dayOfWeekChart: "Activity by Day of Week",
    ideVersionChart: "IDE & Plugin Version",
    agentAdoptionChart: "Agent/Chat/CLI Adoption",
    topContributorsTable: "AI Adoption Champions Table",
    modelEffectivenessChart: "Model Effectiveness Comparison",
    languageFeatureMatrix: "Language × Feature Matrix",
    engagementHeatmap: "Engagement Heatmap",
    codeChurnChart: "Code Churn (AI Lines Added vs Deleted)",
    insightsPanel: "Adoption Insights",
    userProfileCard: "User Profile Card",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[96vw] max-w-md sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize dashboard calculations, preferences, and chart visibility for your team.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <h3 className="text-lg font-medium mb-4">General Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="linesPerMinute">
                    Team Coding Speed (lines/minute)
                    <span className="block text-xs text-muted-foreground mt-1">
                      <b>Benchmark:</b> Most teams: 8–20 lines/minute.
                    </span>
                  </Label>
                  <Input
                    id="linesPerMinute"
                    type="number"
                    step={1}
                    min={1}
                    max={100}
                    {...register("linesPerMinute", {
                      required: true,
                      valueAsNumber: true,
                      min: 1,
                      max: 100,
                    })}
                    className="mt-1"
                  />
                  {errors.linesPerMinute && (
                    <div className="text-red-600 text-xs mt-1">Enter a number between 1 and 100.</div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="pricePerHour">
                    Developer Hourly Rate ($)
                    <span className="block text-xs text-muted-foreground mt-1">
                      <b>Benchmark:</b> US teams: $80–$120. Global median: $50–$90.
                    </span>
                  </Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    step={1}
                    min={1}
                    max={500}
                    {...register("pricePerHour", {
                      required: true,
                      valueAsNumber: true,
                      min: 1,
                      max: 500,
                    })}
                    className="mt-1"
                  />
                  {errors.pricePerHour && (
                    <div className="text-red-600 text-xs mt-1">Enter a number between 1 and 500.</div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="copilotPricePerUser">
                    GitHub Copilot Cost ($/user/month)
                    <span className="block text-xs text-muted-foreground mt-1">
                      <b>Benchmark:</b> Business: $19/user/month. Enterprise: $39/user/month.
                    </span>
                  </Label>
                  <Input
                    id="copilotPricePerUser"
                    type="number"
                    step={1}
                    min={1}
                    max={200}
                    {...register("copilotPricePerUser", {
                      required: true,
                      valueAsNumber: true,
                      min: 1,
                      max: 200,
                    })}
                    className="mt-1"
                  />
                  {errors.copilotPricePerUser && (
                    <div className="text-red-600 text-xs mt-1">Enter a number between 1 and 200.</div>
                  )}
                </div>
                
                <div>
                  <Label className="mb-1 block">Theme</Label>
                  <Controller
                    control={control}
                    name="theme"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-6"
                      >
                        <div>
                          <RadioGroupItem value="light" id="theme-light"/>
                          <Label htmlFor="theme-light" className="ml-2">Light</Label>
                        </div>
                        <div>
                          <RadioGroupItem value="dark" id="theme-dark"/>
                          <Label htmlFor="theme-dark" className="ml-2">Dark</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 justify-between mt-6">
                <Button type="button" variant="secondary" onClick={() => { reset({ linesPerMinute: 10, theme: "light", pricePerHour: 55, copilotPricePerUser: 39 }); resetDefaults(); }}>
                  Reset to Defaults
                </Button>
                <Button type="submit" variant="default" disabled={!isDirty}>
                  Save Settings
                </Button>
              </div>
            </div>
          </form>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2"><Users className="h-4 w-4" />My Team</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Select your team members to quickly filter the dashboard by your team.
            </p>
            {availableUsers.length > 0 ? (
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">
                    {teamMembers.length} selected
                  </Badge>
                </div>
                <ScrollArea className="max-h-48">
                  <div className="space-y-1">
                    {filteredAvailableUsers.map(user => (
                      <div key={user} className="flex items-center space-x-2 p-1.5 hover:bg-muted rounded">
                        <Checkbox
                          id={`team-${user}`}
                          checked={teamMembers.includes(user)}
                          onCheckedChange={() => toggleTeamMember(user)}
                        />
                        <label htmlFor={`team-${user}`} className="text-sm cursor-pointer truncate flex-1">
                          {user}
                        </label>
                      </div>
                    ))}
                    {filteredAvailableUsers.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">No users match "{teamSearch}"</p>
                    )}
                  </div>
                </ScrollArea>
                {teamMembers.length > 0 && (
                  <div className="border-t pt-2">
                    <div className="flex flex-wrap gap-1">
                      {teamMembers.map(user => (
                        <Badge
                          key={user}
                          variant="secondary"
                          className="text-xs cursor-pointer gap-1"
                          onClick={() => toggleTeamMember(user)}
                        >
                          {user}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={clearTeam}>
                    Clear Team
                  </Button>
                  <Button type="button" variant="default" size="sm" disabled={!teamIsDirty} onClick={saveTeam}>
                    Save Team
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Upload data first to configure your team.</p>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><Database className="h-4 w-4" />Data Storage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your data is saved locally in the browser so you don't need to re-upload each session. Upload additional exports to accumulate historical data beyond 28 days.
            </p>
            {storageMeta ? (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rows saved</span>
                  <span className="font-medium">{storageMeta.rowCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date range</span>
                  <span className="font-medium">{storageMeta.dateRange.from} → {storageMeta.dateRange.to}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Storage used</span>
                  <span className="font-medium">{formatBytes(storageMeta.sizeBytes)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last updated</span>
                  <span className="font-medium">{new Date(storageMeta.lastUpdated).toLocaleString()}</span>
                </div>
                {onClearData && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full mt-2 gap-1.5"
                    onClick={() => {
                      clearDataStorage();
                      setStorageMeta(null);
                      onClearData();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Saved Data
                  </Button>
                )}
                {exportData && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 gap-1.5"
                    onClick={() => {
                      const ndjson = exportData();
                      if (!ndjson) return;
                      const blob = new Blob([ndjson], { type: 'application/x-ndjson' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `copilot-data-merged-${new Date().toISOString().slice(0, 10)}.ndjson`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export Merged Data (.ndjson)
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No data saved yet. Upload a file to get started.</p>
            )}
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">Chart Visibility</h3>
                <p className="text-sm text-muted-foreground">Toggle sections on or off, including fully hiding Adoption Insights.</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={showAllCharts}>
                  Show All
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={hideAllCharts}>
                  Hide All
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {Object.entries(chartLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="text-sm font-normal">
                    {label}
                  </Label>
                  <Switch
                    id={key}
                    checked={settings.chartVisibility[key as keyof typeof settings.chartVisibility]}
                    onCheckedChange={() => toggleChartVisibility(key as keyof typeof settings.chartVisibility)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
