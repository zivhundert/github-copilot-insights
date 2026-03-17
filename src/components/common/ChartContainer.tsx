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
}

export const ChartContainer = ({ title, helpText, children, className, guideTopicId }: ChartContainerProps) => {
  const { openGuide } = useDashboardGuide();
  const resolvedGuideTopicId = guideTopicId || getGuideTopicIdFromTitle(title);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <Popover>
            <PopoverTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground hover:scale-110 transition-all cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="space-y-3">
              <p>{helpText}</p>
              {resolvedGuideTopicId && (
                <Button variant="secondary" size="sm" className="h-8 w-full" onClick={() => openGuide(resolvedGuideTopicId)}>
                  Learn more in Guide
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[420px]">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};