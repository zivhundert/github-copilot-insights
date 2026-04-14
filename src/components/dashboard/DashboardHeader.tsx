import { RefreshCcw, Settings, Download, Linkedin, BookOpen, BarChart3, ArrowLeftRight, MessageSquare, FolderUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useEffect, useRef } from "react";
import { DashboardSettings } from "./DashboardSettings";
import { useToast } from '@/hooks/use-toast';
import { exportToImage } from '@/utils/exportUtils';
import { analytics } from '@/services/analytics';
import { useDashboardGuide } from '@/contexts/DashboardGuideContext';
import { ChatPanel } from './ChatPanel';
import type { CopilotDataRow } from '@/pages/Index';

interface DashboardHeaderProps {
  showReloadButton?: boolean;
  onReloadCSV?: () => void;
  showExportButton?: boolean;
  showSettingsButton?: boolean;
  showCompareButton?: boolean;
  onCompareOpen?: () => void;
  reloadLabel?: string;
  showChatButton?: boolean;
  chatData?: CopilotDataRow[];
  onImportMoreData?: (files: File[]) => void;
  onClearData?: () => void;
  exportData?: () => string | null;
}

const LINKEDIN_URL = "https://www.linkedin.com/in/zivhundert/";

export const DashboardHeader = ({ 
  showReloadButton = false, 
  onReloadCSV,
  showExportButton = false,
  showSettingsButton = true,
  showCompareButton = false,
  onCompareOpen,
  reloadLabel,
  showChatButton = false,
  chatData = [],
  onImportMoreData,
  onClearData,
  exportData,
}: DashboardHeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [chatConfigured, setChatConfigured] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { openGuide } = useDashboardGuide();
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showChatButton) return;
    fetch("/api/chat/status")
      .then((res) => res.json())
      .then((data) => setChatConfigured(data.configured))
      .catch(() => setChatConfigured(false));
  }, [showChatButton]);

  const handleChatClick = () => {
    if (chatConfigured === false) {
      toast({
        title: "AI Chat Not Configured",
        description: "Add your Gemini API key to the .env file to enable AI Chat. See .env.example for details.",
        variant: "destructive",
      });
      return;
    }
    setChatOpen(true);
  };

  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      await exportToImage();
      analytics.trackExport('image');
      toast({
        title: "Image Export Successful",
        description: "Your dashboard has been downloaded as an image.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the dashboard image.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
    analytics.trackSettingsOpen();
  };

  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-foreground text-background">
          <BarChart3 className="w-[18px] h-[18px]" />
        </div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          AI Development Intelligence
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => openGuide()} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <BookOpen className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Guide</TooltipContent>
        </Tooltip>

        {showReloadButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onReloadCSV} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{reloadLabel || 'Load New File'}</TooltipContent>
          </Tooltip>
        )}

        {onImportMoreData && (
          <>
            <input
              ref={importInputRef}
              type="file"
              accept=".ndjson,.json"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) onImportMoreData(files);
                e.target.value = '';
              }}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => importInputRef.current?.click()} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <FolderUp className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import More Data</TooltipContent>
            </Tooltip>
          </>
        )}

        {showExportButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isExporting} onClick={handleExportImage} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Download className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isExporting ? 'Exporting...' : 'Export as Image'}</TooltipContent>
          </Tooltip>
        )}

        {showCompareButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onCompareOpen} className="h-8 gap-1.5 text-muted-foreground hover:text-foreground ml-1">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span className="text-xs">Compare</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Compare Users</TooltipContent>
          </Tooltip>
        )}

        {showChatButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleChatClick}
                className={`h-8 w-8 ${chatConfigured === false ? 'text-muted-foreground/40' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {chatConfigured === false ? 'AI Chat (API key not configured)' : 'AI Chat'}
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => window.open(LINKEDIN_URL, "_blank", "noopener,noreferrer")}>
              <Linkedin className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Follow on LinkedIn</TooltipContent>
        </Tooltip>

        {showSettingsButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleSettingsOpen} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        )}
      </div>

      <DashboardSettings open={settingsOpen} onOpenChange={setSettingsOpen} onClearData={onClearData} exportData={exportData} />
      <ChatPanel open={chatOpen} onOpenChange={setChatOpen} data={chatData} />
    </header>
  );
};
