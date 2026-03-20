import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Square, Trash2, Bot, User } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import type { CopilotDataRow } from "@/pages/Index";

interface ChatPanelProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  data: CopilotDataRow[];
}

const SUGGESTED_QUESTIONS = [
  "Who are the most active Copilot users?",
  "What is the overall acceptance rate?",
  "Which IDEs are most popular?",
  "Show me the feature adoption breakdown",
];

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
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Bot className="w-4 h-4" />
            AI Chat
          </SheetTitle>
          <SheetDescription className="text-xs">
            Ask questions about your Copilot adoption data
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="py-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ask me anything about your dashboard data
                </p>
                <div className="grid gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSuggestion(q)}
                      className="text-left text-sm px-3 py-2 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content || (isStreaming && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  ) : "")}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4 space-y-2">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your data..."
              rows={1}
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              disabled={isStreaming}
            />
            {isStreaming ? (
              <Button size="icon" variant="destructive" onClick={stop} className="shrink-0">
                <Square className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="icon" onClick={handleSend} disabled={!input.trim()} className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear} className="h-7 text-xs text-muted-foreground gap-1">
              <Trash2 className="w-3 h-3" />
              Clear chat
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
