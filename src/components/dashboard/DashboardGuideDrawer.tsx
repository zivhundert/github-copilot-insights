import { useEffect, useMemo, useRef } from 'react';
import { BookOpen, Calculator, Compass, Flag, Info, Lightbulb } from 'lucide-react';

import { dashboardGuideSections, guideTopicTitleMap } from '@/content/dashboardGuide';
import { useDashboardGuide } from '@/contexts/DashboardGuideContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const sectionIcons = {
  overview: BookOpen,
  kpis: Calculator,
  'segments-modes': Compass,
  charts: Lightbulb,
  leaderboard: Flag,
} as const;

export const DashboardGuideDrawer = () => {
  const { isOpen, closeGuide, activeTopicId, openGuide } = useDashboardGuide();
  const topicRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const allTopics = useMemo(
    () => dashboardGuideSections.flatMap((section) => section.topics),
    []
  );

  useEffect(() => {
    if (!isOpen || !activeTopicId) return;

    const node = topicRefs.current[activeTopicId];
    if (!node) return;

    requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [activeTopicId, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (!open ? closeGuide() : openGuide(activeTopicId))}>
      <SheetContent side="right" className="w-full border-l bg-background p-0 sm:max-w-3xl">
        <SheetHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            Dashboard Guide
          </div>
          <SheetTitle className="text-2xl">How to Read This Dashboard</SheetTitle>
          <SheetDescription className="max-w-2xl text-sm leading-6">
            A practical manual for interpreting Copilot adoption, output, fairness-driven segments, usage modes, and business metrics without over-reading any single number.
          </SheetDescription>
        </SheetHeader>

        <div className="border-b px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {dashboardGuideSections.map((section) => {
              const Icon = sectionIcons[section.id as keyof typeof sectionIcons] || Info;
              const firstTopicId = section.topics[0]?.id;

              return (
                <Button
                  key={section.id}
                  variant={activeTopicId && section.topics.some((topic) => topic.id === activeTopicId) ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-8 gap-2 rounded-full"
                  onClick={() => firstTopicId && openGuide(firstTopicId)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {section.title}
                </Button>
              );
            })}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-10.5rem)]">
          <div className="space-y-8 px-6 py-6">
            {dashboardGuideSections.map((section) => (
              <section key={section.id} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{section.title}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>

                <Accordion type="multiple" className="rounded-lg border bg-card px-4">
                  {section.topics.map((topic) => (
                    <AccordionItem
                      key={topic.id}
                      value={topic.id}
                      ref={(node) => {
                        topicRefs.current[topic.id] = node;
                      }}
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="space-y-1 pr-4">
                          <div className="font-semibold text-foreground">{topic.title}</div>
                          <div className="text-sm font-normal text-muted-foreground">{topic.summary}</div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-5 pb-5 text-sm leading-6 text-foreground">
                          {topic.formula && (
                            <div className="rounded-lg border bg-muted/40 p-3">
                              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Formula</div>
                              <code className="block whitespace-pre-wrap break-words text-sm">{topic.formula}</code>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium">What this shows</h4>
                            <p className="mt-1 text-muted-foreground">{topic.whatItShows}</p>
                          </div>

                          <div>
                            <h4 className="font-medium">Why it matters</h4>
                            <p className="mt-1 text-muted-foreground">{topic.whyItMatters}</p>
                          </div>

                          <div>
                            <h4 className="font-medium">How to interpret it</h4>
                            <ul className="mt-2 space-y-2 text-muted-foreground">
                              {topic.howToInterpret.map((item) => (
                                <li key={item} className="flex gap-2">
                                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground/50" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {topic.whatItDoesNotMean && topic.whatItDoesNotMean.length > 0 && (
                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                              <h4 className="font-medium">What this does NOT mean</h4>
                              <ul className="mt-2 space-y-2 text-muted-foreground">
                                {topic.whatItDoesNotMean.map((item) => (
                                  <li key={item} className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground/50" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {topic.actions && topic.actions.length > 0 && (
                            <div className="rounded-lg border border-border bg-secondary/40 p-4">
                              <h4 className="font-medium">How to act on this</h4>
                              <ul className="mt-2 space-y-2 text-muted-foreground">
                                {topic.actions.map((item) => (
                                  <li key={item} className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground/50" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {topic.caveats && topic.caveats.length > 0 && (
                            <div className="rounded-lg border border-border bg-accent/40 p-4">
                              <h4 className="font-medium">Important caveats</h4>
                              <ul className="mt-2 space-y-2 text-muted-foreground">
                                {topic.caveats.map((item) => (
                                  <li key={item} className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground/50" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}

            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              Looking for a specific metric? Use the existing help icons on KPI cards, charts, and the leaderboard to jump here directly: {guideTopicTitleMap[activeTopicId || 'dashboard-overview'] || 'How to Read This Dashboard'}.
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default DashboardGuideDrawer;
