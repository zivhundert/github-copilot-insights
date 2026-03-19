import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useDashboardGuide } from '@/contexts/DashboardGuideContext';
import { getGuideTopicIdFromTitle } from '@/content/dashboardGuide';

interface MetricCardProps {
  title: string;
  value: string;
  gradient: string;
  tooltip: React.ReactNode;
  guideTopicId?: string;
}

const gradientToAccent: Record<string, string> = {
  'from-blue-500 to-blue-600': 'border-l-blue-500',
  'from-emerald-500 to-emerald-600': 'border-l-emerald-500',
  'from-amber-500 to-amber-600': 'border-l-amber-500',
  'from-teal-500 to-teal-600': 'border-l-teal-500',
  'from-green-500 to-green-600': 'border-l-green-500',
  'from-purple-500 to-purple-600': 'border-l-purple-500',
  'from-indigo-500 to-indigo-600': 'border-l-indigo-500',
};

export const MetricCard = ({ title, value, gradient, tooltip, guideTopicId }: MetricCardProps) => {
  const { openGuide } = useDashboardGuide();
  const resolvedGuideTopicId = guideTopicId || getGuideTopicIdFromTitle(title);
  const accentClass = gradientToAccent[gradient] || 'border-l-primary';

  return (
    <Card className={`border-l-[3px] ${accentClass} h-full`}>
      <div className="p-4 flex flex-col justify-between h-full gap-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
            {title}
          </span>
          <Popover>
            <PopoverTrigger className="shrink-0">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="space-y-3">
              <div className="max-w-xs text-sm">{tooltip}</div>
              {resolvedGuideTopicId && (
                <Button variant="secondary" size="sm" className="h-8 w-full" onClick={() => openGuide(resolvedGuideTopicId)}>
                  Learn more in Guide
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
        <div className="text-2xl font-semibold text-foreground tracking-tight">
          {value}
        </div>
      </div>
    </Card>
  );
};