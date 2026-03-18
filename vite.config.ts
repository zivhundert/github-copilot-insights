import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Vite plugin that serves /api/copilot-data.
 * It performs the full two-step GitHub API fetch server-side so the
 * browser never touches the Azure CDN download links (which lack CORS headers).
 */
function copilotApiPlugin(env: Record<string, string>): Plugin {
  const baseUrl = env.GITHUB_BASE_URL;
  const pat = env.GITHUB_PAT;
  const enterprise = env.VITE_GITHUB_ENTERPRISE;

  return {
    name: 'copilot-api',
    configureServer(server) {
      if (!baseUrl || !pat || !enterprise) return;

      server.middlewares.use('/api/copilot-data', async (_req, res) => {
        try {
          // Step 1 – get download links
          const metaUrl = `${baseUrl}/enterprises/${enterprise}/copilot/metrics/reports/users-28-day/latest`;
          const metaRes = await fetch(metaUrl, {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: `Bearer ${pat}`,
              'X-GitHub-Api-Version': '2022-11-28',
            },
          });

          if (!metaRes.ok) {
            const body = await metaRes.text().catch(() => '');
            res.writeHead(metaRes.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `GitHub API ${metaRes.status}: ${body}` }));
            return;
          }

          const meta = await metaRes.json() as { download_links?: string[] };
          if (!meta.download_links?.length) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No download links returned by GitHub API.' }));
            return;
          }

          // Step 2 – fetch all NDJSON files from the download links
          const chunks: string[] = [];
          for (const link of meta.download_links) {
            const dataRes = await fetch(link);
            if (dataRes.ok) {
              chunks.push(await dataRes.text());
            }
          }

          res.writeHead(200, {
            'Content-Type': 'application/x-ndjson',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(chunks.join('\n'));
        } catch (err: any) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message ?? String(err) }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (including those without VITE_ prefix) for server-side use
  const env = loadEnv(mode, process.cwd(), '');

  return {
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    copilotApiPlugin(env),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});
