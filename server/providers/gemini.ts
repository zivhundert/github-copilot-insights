import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatProvider, ChatMessage } from "./types.js";

export function createGeminiProvider(
  apiKey: string,
  model = "gemini-2.0-flash"
): ChatProvider {
  const genAI = new GoogleGenerativeAI(apiKey);

  return {
    async sendMessage(
      systemPrompt: string,
      userMessage: string,
      history: ChatMessage[] = []
    ): Promise<AsyncIterable<string>> {
      const generativeModel = genAI.getGenerativeModel({
        model,
        systemInstruction: systemPrompt,
      });

      const chat = generativeModel.startChat({
        history: history.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessageStream(userMessage);

      return (async function* () {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            yield text;
          }
        }
      })();
    },
  };
}
