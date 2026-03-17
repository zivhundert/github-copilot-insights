import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface DashboardGuideContextValue {
  isOpen: boolean;
  activeTopicId?: string;
  openGuide: (topicId?: string) => void;
  closeGuide: () => void;
}

const DashboardGuideContext = createContext<DashboardGuideContextValue | undefined>(undefined);

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

export const useDashboardGuide = () => {
  const context = useContext(DashboardGuideContext);

  if (!context) {
    throw new Error('useDashboardGuide must be used within DashboardGuideProvider');
  }

  return context;
};
