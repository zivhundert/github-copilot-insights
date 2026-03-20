import { useState, useCallback, useRef } from "react";
import { sendChatMessage, type ChatMessage } from "@/services/chatApi";
import { buildChatContext } from "@/utils/chatContextBuilder";
import type { CopilotDataRow } from "@/pages/Index";

export function useChat(data: CopilotDataRow[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (question: string) => {
      if (!question.trim() || isStreaming) return;

      const userMsg: ChatMessage = { role: "user", content: question.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      const abortController = new AbortController();
      abortRef.current = abortController;

      const assistantMsg: ChatMessage = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        const dataContext = buildChatContext(data);
        const history = [...messages, userMsg].slice(-10); // keep last 10 for context

        await sendChatMessage(
          { question: question.trim(), dataContext, history },
          (chunk) => {
            assistantMsg.content += chunk;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...assistantMsg };
              return updated;
            });
          },
          abortController.signal
        );
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        const errorText = error instanceof Error ? error.message : "Something went wrong";
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `Error: ${errorText}`,
          };
          return updated;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [data, messages, isStreaming]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, send, stop, clear };
}
