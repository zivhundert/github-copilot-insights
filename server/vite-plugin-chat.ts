import { type Plugin, type ViteDevServer, loadEnv } from "vite";
import type { IncomingMessage, ServerResponse } from "http";
import { buildSystemPrompt } from "./promptBuilder.js";
import { createGeminiProvider } from "./providers/gemini.js";
import type { ChatProvider, ChatMessage } from "./providers/types.js";

function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

export default function chatPlugin(): Plugin {
  let provider: ChatProvider | null = null;

  return {
    name: "vite-plugin-chat",
    configureServer(server: ViteDevServer) {
      // loadEnv reads all vars from .env (not just VITE_ prefixed ones)
      const env = loadEnv("development", process.cwd(), "");
      const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const model = env.CHAT_MODEL || process.env.CHAT_MODEL || "gemini-2.0-flash";

      if (apiKey) {
        provider = createGeminiProvider(apiKey, model);
      }

      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url === "/api/chat/status" && req.method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ configured: provider !== null }));
          return;
        }

        if (req.url !== "/api/chat" || req.method !== "POST") {
          return next();
        }

        if (!provider) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "GEMINI_API_KEY is not configured. Add it to your .env file." }));
          return;
        }

        try {
          const rawBody = await parseBody(req);
          const body = JSON.parse(rawBody);

          const { question, dataContext, history } = body as {
            question?: string;
            dataContext?: string;
            history?: ChatMessage[];
          };

          if (!question || typeof question !== "string" || question.trim().length === 0) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Missing or empty 'question' field." }));
            return;
          }

          if (!dataContext || typeof dataContext !== "string") {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Missing 'dataContext' field." }));
            return;
          }

          const systemPrompt = buildSystemPrompt(dataContext);
          const stream = await provider.sendMessage(systemPrompt, question.trim(), history);

          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          });

          for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          }

          res.write("data: [DONE]\n\n");
          res.end();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Internal server error";
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: message }));
          } else {
            res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
            res.end();
          }
        }
      });
    },
  };
}
