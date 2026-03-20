export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatProvider {
  sendMessage(
    systemPrompt: string,
    userMessage: string,
    history?: ChatMessage[]
  ): Promise<AsyncIterable<string>>;
}
