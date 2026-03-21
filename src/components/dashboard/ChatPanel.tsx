import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Square, Trash2, Bot, User, Users, TrendingUp, Monitor, BarChart3, Sparkles } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import type { CopilotDataRow } from "@/pages/Index";

interface ChatPanelProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  data: CopilotDataRow[];
}

const SUGGESTED_QUESTIONS = [
  { text: "Who are the most active Copilot users?", icon: Users },
  { text: "What is the overall acceptance rate?", icon: TrendingUp },
  { text: "Which IDEs are most popular?", icon: Monitor },
  { text: "Show me the feature adoption breakdown", icon: BarChart3 },
];

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const boldMatch = part.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) return <strong key={i} className="font-semibold">{boldMatch[1]}</strong>;
    return <span key={i}>{part}</span>;
  });
}

export const ChatPanel = ({ open, onOpenChange, data }: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const { messages, isStreaming, send, stop, clear } = useChat(data);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    send(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (question: string) => {
    send(question);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full p-0 gap-0 border-l border-border/40">

        {/* Gradient Header */}
        <SheetHeader className="px-6 pt-8 pb-6 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <SheetTitle className="text-lg font-semibold tracking-tight">
              DevIntelligence
            </SheetTitle>
          </div>
          <SheetDescription className="text-sm text-muted-foreground/80 pl-[42px]">
            Ask about your Copilot adoption data
          </SheetDescription>
        </SheetHeader>

        {/* Chat Area */}
        <ScrollArea className="flex-1 px-5" ref={scrollRef}>
          <div className="py-5 space-y-4">

            {/* Empty State */}
            {messages.length === 0 && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary/70" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Ask me anything about your dashboard data
                </p>
                <div className="grid gap-2.5">
                  {SUGGESTED_QUESTIONS.map(({ text, icon: Icon }) => (
                    <button
                      key={text}
                      onClick={() => handleSuggestion(text)}
                      className="flex items-center gap-3 text-left text-sm px-4 py-3 rounded-xl border border-border/60 bg-card hover:bg-accent/50 hover:border-border hover:shadow-sm transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted/60 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-foreground/80 group-hover:text-foreground transition-colors">{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/60 text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content ? (
                    msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content
                  ) : (isStreaming && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1 py-0.5">
                      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: "300ms" }} />
                    </span>
                  ) : "")}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-foreground/60" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 pt-3 border-t border-border/40 space-y-2 bg-gradient-to-t from-background to-transparent">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your data..."
                rows={1}
                className="w-full resize-none rounded-xl border border-border/60 bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30 disabled:opacity-50 transition-all"
                disabled={isStreaming}
              />
            </div>
            {isStreaming ? (
              <Button size="icon" variant="destructive" onClick={stop} className="shrink-0 h-10 w-10 rounded-xl">
                <Square className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim()}
                className="shrink-0 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between px-1">
            {messages.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={clear} className="h-6 text-xs text-muted-foreground/60 hover:text-muted-foreground gap-1 px-2">
                <Trash2 className="w-3 h-3" />
                Clear chat
              </Button>
            ) : (
              <span />
            )}
            <span className="text-[10px] text-muted-foreground/40 tracking-wide">
              Powered by Gemini
            </span>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
};
