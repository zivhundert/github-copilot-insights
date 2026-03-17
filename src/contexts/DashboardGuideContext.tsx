import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface DashboardGuideContextValue {
  isOpen: boolean;
  activeTopicId?: string;
  openGuide: (topicId?: string) => void;
  closeGuide: () => void;
}

const fallbackDashboardGuideContext: DashboardGuideContextValue = {
  isOpen: false,
  activeTopicId: 'dashboard-overview',
  openGuide: () => undefined,
  closeGuide: () => undefined,
};

const DashboardGuideContext = createContext<DashboardGuideContextValue>(fallbackDashboardGuideContext);

export const DashboardGuideProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState<string | undefined>('dashboard-overview');

  const openGuide = useCallback((topicId?: string) => {
    setActiveTopicId(topicId || 'dashboard-overview');
    setIsOpen(true);
  }, []);

  const closeGuide = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      activeTopicId,
      openGuide,
      closeGuide,
    }),
    [activeTopicId, closeGuide, isOpen, openGuide]
  );

  return <DashboardGuideContext.Provider value={value}>{children}</DashboardGuideContext.Provider>;
};

export const useDashboardGuide = () => useContext(DashboardGuideContext);
