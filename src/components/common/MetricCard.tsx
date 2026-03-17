import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export const MetricCard = ({ title, value, gradient, tooltip, guideTopicId }: MetricCardProps) => {
  const { openGuide } = useDashboardGuide();
  const resolvedGuideTopicId = guideTopicId || getGuideTopicIdFromTitle(title);

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className={`bg-gradient-to-br ${gradient} text-white pb-3 min-h-[80px] flex flex-col justify-center`}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium opacity-90 leading-tight flex-1">
            {title}
          </CardTitle>
          <Popover>
            <PopoverTrigger className="shrink-0">
              <HelpCircle className="h-4 w-4 text-white opacity-75 hover:opacity-100 hover:scale-110 transition-all cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="space-y-3">
              <div className="max-w-xs">{tooltip}</div>
              {resolvedGuideTopicId && (
                <Button variant="secondary" size="sm" className="h-8 w-full" onClick={() => openGuide(resolvedGuideTopicId)}>
                  Learn more in Guide
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-6 flex items-center justify-center min-h-[80px]">
        <div className="text-3xl font-bold text-foreground text-center">
          {value}
        </div>
      </CardContent>
    </Card>
  );
};