import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useDashboardGuide } from '@/contexts/DashboardGuideContext';
import { getGuideTopicIdFromTitle } from '@/content/dashboardGuide';

interface ChartContainerProps {
  title: string;
  helpText: string;
  children: ReactNode;
  className?: string;
  guideTopicId?: string;
  headerRight?: ReactNode;
}

export const ChartContainer = ({ title, helpText, children, className, guideTopicId, headerRight }: ChartContainerProps) => {
  const { openGuide } = useDashboardGuide();
  const resolvedGuideTopicId = guideTopicId || getGuideTopicIdFromTitle(title);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
            <Popover>
            <PopoverTrigger>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="space-y-3">
              <p className="text-sm">{helpText}</p>
              {resolvedGuideTopicId && (
                <Button variant="secondary" size="sm" className="h-8 w-full" onClick={() => openGuide(resolvedGuideTopicId)}>
                  Learn more in Guide
                </Button>
              )}
            </PopoverContent>
            </Popover>
          </div>
          {headerRight}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};