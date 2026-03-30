#!/usr/bin/env node

/**
 * Pre-fetch Copilot metrics from the GitHub Enterprise API.
 * Runs at build time — the result is a static file, no middleware needed.
 *
 * Env vars (from .env.local or hosting platform):
 *   GITHUB_BASE_URL   – e.g. https://api.github.example.com
 *   GITHUB_PAT        – Personal access token
 *   GITHUB_ENTERPRISE  (or VITE_GITHUB_ENTERPRISE) – Enterprise slug
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '../public/copilot_data.ndjson');

/* ── Load .env.local (no extra deps) ── */
function loadDotEnv() {
  const p = resolve(__dirname, '../.env.local');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

loadDotEnv();

const BASE_URL   = process.env.GITHUB_BASE_URL;
const PAT        = process.env.GITHUB_PAT;
const ENTERPRISE = process.env.GITHUB_ENTERPRISE || process.env.VITE_GITHUB_ENTERPRISE;

if (!BASE_URL || !PAT || !ENTERPRISE) {
  console.log('⏭  Copilot fetch skipped — env vars not set.');
  process.exit(0); // not an error, file upload still works
}

async function main() {
  console.log(`🔄 Fetching Copilot metrics for "${ENTERPRISE}"…`);

  const metaRes = await fetch(
    `${BASE_URL}/enterprises/${ENTERPRISE}/copilot/metrics/reports/users-28-day/latest`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${PAT}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!metaRes.ok) {
    console.error(`❌ GitHub API ${metaRes.status}: ${await metaRes.text().catch(() => '')}`);
    process.exit(1);
  }

  const { download_links: links } = await metaRes.json();
  if (!links?.length) { console.error('❌ No download links.'); process.exit(1); }

  console.log(`📥 Downloading ${links.length} file(s)…`);
  const chunks = [];
  for (const link of links) {
    const r = await fetch(link);
    if (r.ok) chunks.push(await r.text());
    else console.warn(`⚠  Chunk failed (${r.status})`);
  }

  const ndjson = chunks.join('\n').trim();
  const rows = ndjson.split('\n').filter(l => l.trim()).length;
  writeFileSync(OUTPUT, ndjson, 'utf-8');
  console.log(`✅ ${rows} rows → public/copilot_data.ndjson`);
}

main().catch(e => { console.error('❌', e); process.exit(1); });

