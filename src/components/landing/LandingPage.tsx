import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Rocket, Sparkles, TrendingUp, Sprout } from 'lucide-react';

interface LandingPageProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export const LandingPage = ({ onFileUpload, isLoading }: LandingPageProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-ndjson': ['.ndjson'],
      'application/json': ['.json'],
    },
    multiple: false,
  });

  return (
    <div className="min-h-screen bg-landing-surface text-landing-on-surface font-body selection:bg-[#2069ff] selection:text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-bold tracking-tight text-slate-900 font-headline">
            DevIntelligence
          </div>
          <div className="flex items-center gap-4">
            <button
              className="bg-[#0051d5] text-white px-5 py-2 rounded-xl font-headline font-semibold text-sm active:scale-95 transition-all shadow-sm"
              onClick={() => {
                const el = document.querySelector('[data-landing-upload]');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 landing-hero-pattern min-h-screen">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6df4ec] text-[#006a66] mb-6">
            <span className="text-[0.6875rem] font-bold tracking-wider uppercase font-label">
              Now with ROI Insights
            </span>
          </div>

          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto mb-6 leading-[1.1]">
            Master your GitHub Copilot adoption.
          </h1>
          <p className="text-landing-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Unlock the true potential of AI-assisted engineering.
            <br />
            Transform raw .ndjson data into actionable intelligence
            <br />
            without ever compromising privacy.
          </p>

          {/* Privacy Banner */}
          <div className="max-w-3xl mx-auto mb-16 px-6 py-4 rounded-2xl bg-[#f3f3f8] border border-[#c1c6d7]/20 flex items-center gap-4 text-left">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#006a66]/10 flex items-center justify-center text-[#006a66]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-7 h-7"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold">Privacy First</h3>
              <p className="text-sm text-landing-on-surface-variant leading-tight">
                No backend, everything happens locally on your computer. Your
                data never leaves your browser.
              </p>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="max-w-3xl mx-auto relative group" data-landing-upload>
            <div className="absolute -inset-4 bg-[#0051d5]/5 rounded-[2rem] blur-2xl group-hover:bg-[#0051d5]/10 transition-all duration-500" />
            <div
              {...getRootProps()}
              className={`relative bg-white border-2 border-dashed rounded-[1.5rem] p-12 text-center shadow-xl shadow-black/5 cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-[#0051d5]/60 bg-[#0051d5]/5'
                  : 'border-[#c1c6d7]/40 hover:border-[#0051d5]/40'
              }`}
            >
              <input {...getInputProps()} />
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#2069ff] text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                  />
                </svg>
              </div>
              <h2 className="font-headline text-2xl font-bold mb-2">
                Upload your .ndjson data
              </h2>
              <p className="text-landing-on-surface-variant mb-8 max-w-md mx-auto">
                Drag and drop your GitHub Copilot export file here or click to
                browse your local files.
              </p>
              <button
                className="bg-gradient-to-br from-[#0051d5] to-[#2069ff] text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-[#0051d5]/20 hover:shadow-[#0051d5]/30 active:scale-95 transition-all inline-flex items-center gap-3 mx-auto"
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                {isLoading ? 'Processing...' : 'Choose File'}
              </button>
              <div className="mt-8 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-xs font-medium text-[#717786]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Max size 500MB
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#717786]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  NDJSON only
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interface Preview */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="text-left">
              <span className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-[#006a66] font-label block mb-2">
                Interface Preview
              </span>
              <h2 className="text-3xl font-headline font-bold">
                Experience Editorial Intelligence
              </h2>
            </div>
            <div className="hidden md:flex gap-2">
              <div className="h-1.5 w-12 rounded-full bg-[#0051d5]" />
              <div className="h-1.5 w-4 rounded-full bg-[#c1c6d7]" />
              <div className="h-1.5 w-4 rounded-full bg-[#c1c6d7]" />
            </div>
          </div>

          <div className="space-y-6">
            {/* Top Metrics Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricPreviewCard color="blue-500" label="Total AI Code Added" value="154,894" />
              <MetricPreviewCard color="emerald-500" label="Acceptance Rate" value="11.2%" />
              <MetricPreviewCard color="amber-500" label="AI Code Amplification" value="336.1%" />
              <MetricPreviewCard color="teal-500" label="Development Time Saved (Hours)" value="258" />
            </div>

            {/* Top Metrics Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricPreviewCard color="green-600" label="Development Cost Savings" value="$14,190" />
              <MetricPreviewCard color="purple-500" label="ROI - Investment Return" value="58.3%" />
              <MetricPreviewCard color="blue-600" label="Active Users" value="52" />
            </div>

            {/* Insight Alerts */}
            <div className="space-y-3">
              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-600">
                    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z" />
                  </svg>
                  <span className="font-bold text-orange-900">Adoption Insights</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wide">
                    8 suggestions
                  </span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-orange-400">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-rose-600">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-rose-900">Users Needing Attention</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wide">
                    5 users
                  </span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-rose-400">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Activity by Day of Week */}
              <div className="bg-white p-6 rounded-2xl border border-[#c1c6d7]/20 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-bold flex items-center gap-2">
                    Activity by Day of Week
                  </h4>
                </div>
                <div className="flex items-end justify-between h-48 gap-1 sm:gap-3 px-1 sm:px-2 overflow-hidden">
                  {[
                    { day: 'Sunday', short: 'Sun', h: 38 },
                    { day: 'Monday', short: 'Mon', h: 140 },
                    { day: 'Tuesday', short: 'Tue', h: 95 },
                    { day: 'Wednesday', short: 'Wed', h: 155 },
                    { day: 'Thursday', short: 'Thu', h: 90 },
                    { day: 'Friday', short: 'Fri', h: 53 },
                    { day: 'Saturday', short: 'Sat', h: 12 },
                  ].map((bar) => (
                    <div key={bar.day} className="flex flex-col items-center gap-2 w-full min-w-0">
                      <div
                        className="w-full rounded-t bg-[#2a9d8f]"
                        style={{ height: `${bar.h}px` }}
                      />
                      <span className="text-[10px] text-[#717786] font-medium truncate w-full text-center">
                        <span className="hidden sm:inline">{bar.day}</span>
                        <span className="sm:hidden">{bar.short}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-landing-on-surface-variant">
                    <div className="w-2 h-2 rounded-full bg-[#2a9d8f]" /> Added Code
                  </div>
                </div>
              </div>

              {/* IDE & Plugin Version Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-[#c1c6d7]/20 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-bold flex items-center gap-2">
                    IDE &amp; Plugin Version Distribution
                  </h4>
                </div>
                <div className="flex items-end justify-between h-48 gap-2 px-2">
                  {[
                    [{ c: '#3b82f6', h: 60 }, { c: '#fb7185', h: 40 }],
                    [{ c: '#3b82f6', h: 50 }, { c: '#fb7185', h: 30 }, { c: '#fbbf24', h: 20 }],
                    [{ c: '#3b82f6', h: 40 }, { c: '#fb7185', h: 40 }, { c: '#fbbf24', h: 10 }, { c: '#34d399', h: 10 }],
                    [{ c: '#3b82f6', h: 70 }, { c: '#fb7185', h: 20 }, { c: '#a78bfa', h: 10 }],
                    [{ c: '#3b82f6', h: 45 }, { c: '#fbbf24', h: 45 }, { c: '#fb7185', h: 10 }],
                    [{ c: '#3b82f6', h: 80 }, { c: '#34d399', h: 20 }],
                    [{ c: '#3b82f6', h: 30 }, { c: '#fb7185', h: 30 }, { c: '#fbbf24', h: 20 }, { c: '#a78bfa', h: 20 }],
                  ].map((stack, i) => (
                    <div key={i} className="w-full flex flex-col-reverse h-full rounded overflow-hidden">
                      {stack.map((seg, j) => (
                        <div key={j} style={{ backgroundColor: seg.c, height: `${seg.h}%` }} />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1">
                  <LegendDot color="#3b82f6" label="intellij (1.5.61)" />
                  <LegendDot color="#fb7185" label="intellij (1.6.1)" />
                  <LegendDot color="#fbbf24" label="vscode (0.33.2)" />
                  <LegendDot color="#34d399" label="intellij (1.6.0-rc)" />
                </div>
              </div>
            </div>

            {/* Adoption Champions Table */}
            <div className="bg-white rounded-2xl border border-[#c1c6d7]/20 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#c1c6d7]/10 flex justify-between items-center">
                <h4 className="font-bold flex items-center gap-2">Adoption Champions</h4>
                <button className="text-xs font-bold text-[#0051d5] border border-[#0051d5]/20 px-3 py-1 rounded-lg hover:bg-[#0051d5]/5 transition-colors">
                  Show All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-[#717786] border-b border-[#c1c6d7]/5">
                      <th className="px-6 py-4 font-bold">User</th>
                      <th className="px-6 py-4 font-bold">Performance</th>
                      <th className="px-6 py-4 font-bold">AI Code Added</th>
                      <th className="px-6 py-4 font-bold">Efficiency</th>
                      <th className="px-6 py-4 font-bold">Acceptance Rate</th>
                      <th className="px-6 py-4 font-bold">AI Amplification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c1c6d7]/5">
                    {([
                      { name: 'Developer A', perf: 'Champion', icon: <Rocket className="h-3.5 w-3.5 shrink-0" />, badge: 'border-segment-champion-border bg-segment-champion text-segment-champion-foreground', code: '21,430', eff: '109.3', rate: '0.2%', amp: '929.7%' },
                      { name: 'Developer B', perf: 'Producer', icon: <Sparkles className="h-3.5 w-3.5 shrink-0" />, badge: 'border-segment-producer-border bg-segment-producer text-segment-producer-foreground', code: '16,077', eff: '52.5', rate: '3.7%', amp: '197.2%' },
                      { name: 'Developer C', perf: 'Explorer', icon: <TrendingUp className="h-3.5 w-3.5 shrink-0" />, badge: 'border-segment-explorer-border bg-segment-explorer text-segment-explorer-foreground', code: '13,777', eff: '45.2', rate: '0.0%', amp: '652.0%' },
                      { name: 'Developer D', perf: 'Starter', icon: <Sprout className="h-3.5 w-3.5 shrink-0" />, badge: 'border-segment-starter-border bg-segment-starter text-segment-starter-foreground', code: '3,872', eff: '10.4', rate: '4.0%', amp: '58.8%' },
                    ]).map((dev) => (
                      <tr key={dev.name} className="hover:bg-[#f9f9fe]/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{dev.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${dev.badge}`}>
                            {dev.icon} {dev.perf}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-landing-on-surface-variant">{dev.code}</td>
                        <td className="px-6 py-4 text-landing-on-surface-variant">{dev.eff}</td>
                        <td className="px-6 py-4 text-landing-on-surface-variant">{dev.rate}</td>
                        <td className="px-6 py-4 text-landing-on-surface-variant">{dev.amp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-slate-100 bg-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
          <div className="text-xs text-slate-500">
            © 2025 AI Development Intelligence. Powered by <a href="https://thetaray.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 underline">Thetaray</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ---- small sub-components used only inside the preview ---- */

const colorMap: Record<string, string> = {
  'blue-500': '#3b82f6',
  'emerald-500': '#10b981',
  'amber-500': '#f59e0b',
  'teal-500': '#14b8a6',
  'green-600': '#16a34a',
  'purple-500': '#a855f7',
  'blue-600': '#2563eb',
};

function MetricPreviewCard({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="bg-white p-6 rounded-xl border border-[#c1c6d7]/20 shadow-sm"
      style={{ borderLeftWidth: 4, borderLeftColor: colorMap[color] ?? color }}
    >
      <div className="flex justify-between items-start mb-2">
        <p className="text-[0.6875rem] font-bold text-landing-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-3xl font-headline font-extrabold">{value}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] font-bold text-landing-on-surface-variant">
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}
