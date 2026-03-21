import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Sparkles } from 'lucide-react';

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
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-[20px] shadow-sm">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-black tracking-tight text-slate-900">
            <div className="flex items-center gap-3">
              <img
                alt="DevIntelligence Icon"
                className="h-8 w-8 rounded-lg object-contain"
                src="/brand-icon.png"
              />
              <span>DevIntelligence</span>
            </div>
          </div>
          <button
              className="bg-[#0051d5] text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-[#0051d5]/20"
              onClick={() => {
                const el = document.querySelector('[data-landing-upload]');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get Started
            </button>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-20">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#6df4ec] text-[#006a66] font-bold text-[0.6875rem] tracking-wider mb-8 uppercase">
              <Sparkles className="w-[18px] h-[18px]" /> Now with ROI Insights
          </div>

          <h1 className="font-headline text-[4.5rem] font-extrabold tracking-tight max-w-4xl mx-auto mb-8 leading-[1.1]">
            Master your GitHub <br /> Copilot adoption.
          </h1>
          <div className="max-w-3xl mx-auto text-[1.125rem] leading-relaxed text-[#414755] space-y-1">
            <p>Unlock the true potential of AI-assisted engineering.</p>
            <p>Transform raw .ndjson data into actionable intelligence</p>
            <p>without ever compromising privacy.</p>
          </div>
        </section>

          {/* Privacy Banner */}
        <section className="max-w-3xl mx-auto px-6 mb-16">
          <div className="flex items-center gap-6 p-6 bg-[#f3f3f7] rounded-2xl border border-[#c3c6d7]/20 shadow-sm">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#a0f1eb] flex items-center justify-center text-[#004d4a]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
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
              <p className="text-sm text-[#414755]">
                All .ndjson data is processed locally in your browser. No source code or
                sensitive logs ever leave your infrastructure.
              </p>
            </div>
          </div>
        </section>

          {/* Upload Zone */}
        <section className="max-w-3xl mx-auto px-6 mb-32" data-landing-upload>
            <div
              {...getRootProps()}
              className={`bg-white rounded-[1.5rem] border-2 border-dashed p-12 text-center shadow-xl cursor-pointer ${
                isDragActive
                  ? 'border-[#0051d5]/60 bg-[#0051d5]/5'
                  : 'border-[#c3c6d7]/40'
              }`}
            >
              <input {...getInputProps()} />
              <div className="mb-6 w-20 h-20 bg-[#2069ff] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-[#0051d5]/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-10 h-10"
                >
                  <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96ZM14 13v4h-4v-4H7l5-5 5 5h-3Z" />
                </svg>
              </div>
              <h2 className="font-headline text-2xl font-bold mb-2">
                Upload your .ndjson data
              </h2>
              <p className="text-[#434654] mb-8">
                Drag and drop your GitHub Copilot usage exports here
              </p>
              <button
                className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#0051d5] to-[#2069ff] shadow-md"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Choose File'}
              </button>
              <div className="flex justify-center gap-6 mt-10">
                <div className="flex items-center gap-2 text-sm text-[#004d4a] font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" /></svg>
                  Max size 500MB
                </div>
                <div className="flex items-center gap-2 text-sm text-[#004d4a] font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" /></svg>
                  NDJSON only
                </div>
              </div>
            </div>
        </section>

        {/* Interface Preview */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center md:text-left">
            <p className="text-[0.6875rem] font-bold tracking-[0.15em] text-[#006a66] uppercase mb-2">Interface Preview</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="font-headline font-bold text-[1.875rem]">
                Experience Editorial Intelligence
              </h2>
              <div className="flex gap-2 pb-2">
                <div className="w-2 h-2 rounded-full bg-[#0051d5]" />
                <div className="w-2 h-2 rounded-full bg-[#c3c6d7]" />
                <div className="w-2 h-2 rounded-full bg-[#c3c6d7]" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Top Metrics Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <MetricPreviewCard color="#3b82f6" label="Total AI Code Added" value="154,894" />
              <MetricPreviewCard color="#10b981" label="Acceptance Rate" value="11.2%" />
              <MetricPreviewCard color="#f59e0b" label="AI Code Amplification" value="336.1%" />
              <MetricPreviewCard color="#14b8a6" label="Development Time Saved (Hours)" value="258" />
            </div>

            {/* Top Metrics Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <MetricPreviewCard color="#16a34a" label="Development Cost Savings" value="$14,190" />
              <MetricPreviewCard color="#a855f7" label="ROI - Investment Return" value="58.3%" />
              <MetricPreviewCard color="#2563eb" label="Active Users" value="52" />
            </div>

            {/* Insight Alerts */}
            <div className="space-y-4 mb-12">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z" />
                    </svg>
                  </div>
                  <span className="font-bold text-amber-900">Adoption Insights</span>
                  <span className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-xs font-bold">
                    8 suggestions
                  </span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-400">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-200/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-bold text-rose-900">Users Needing Attention</span>
                  <span className="px-3 py-1 bg-rose-200 text-rose-900 rounded-full text-xs font-bold">
                    5 users
                  </span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-rose-400">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Activity by Day of Week */}
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <h3 className="font-headline font-bold mb-8">Activity by Day of Week</h3>
                <div className="flex items-end justify-between h-48 gap-2">
                  {[
                    { day: 'Sun', h: '40%' },
                    { day: 'Mon', h: '65%' },
                    { day: 'Tue', h: '85%' },
                    { day: 'Wed', h: '100%' },
                    { day: 'Thu', h: '90%' },
                    { day: 'Fri', h: '45%' },
                    { day: 'Sat', h: '25%' },
                  ].map((bar) => (
                    <div key={bar.day} className="flex-1 bg-[#006763]/30 rounded-t-lg hover:bg-[#006763] transition-all" style={{ height: bar.h }} />
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-[#434654] uppercase tracking-widest">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
              </div>

              {/* IDE & Plugin Version Distribution */}
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <h3 className="font-headline font-bold mb-8">IDE &amp; Plugin Version Distribution</h3>
                <div className="flex items-end justify-between h-48 gap-3">
                  {[
                    [{ c: '#2563eb', h: '20%' }, { c: '#f43f5e', h: '40%' }, { c: '#fbbf24', h: '10%' }],
                    [{ c: '#2563eb', h: '30%' }, { c: '#f43f5e', h: '20%' }, { c: '#10b981', h: '20%' }],
                    [{ c: '#2563eb', h: '50%' }, { c: '#fbbf24', h: '15%' }],
                    [{ c: '#2563eb', h: '60%' }, { c: '#f43f5e', h: '20%' }],
                    [{ c: '#2563eb', h: '20%' }, { c: '#10b981', h: '40%' }],
                    [{ c: '#2563eb', h: '40%' }, { c: '#f43f5e', h: '30%' }],
                    [{ c: '#2563eb', h: '70%' }, { c: '#fbbf24', h: '10%' }],
                  ].map((stack, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-1 h-full justify-end">
                      {stack.map((seg, j) => (
                        <div key={j} className="w-full rounded-sm" style={{ backgroundColor: seg.c, height: seg.h }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Adoption Champions Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-[#e8e8ec] flex justify-between items-center">
                <h3 className="font-headline font-bold">Adoption Champions</h3>
                <button className="text-sm font-bold text-[#0051d5] hover:underline">
                  Show All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[0.6875rem] font-bold text-[#434654] uppercase tracking-[0.1em] bg-[#f3f3f7]">
                      <th className="px-8 py-4">User</th>
                      <th className="px-8 py-4">Performance</th>
                      <th className="px-8 py-4">AI Code Added</th>
                      <th className="px-8 py-4">Efficiency</th>
                      <th className="px-8 py-4">Acceptance Rate</th>
                      <th className="px-8 py-4">AI Amplification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e8ec]">
                    {([
                      { name: 'Developer A', perf: 'Champion', badge: 'bg-blue-100 text-blue-700', code: '42,109', eff: '94%', rate: '18.4%', amp: '412%' },
                      { name: 'Developer B', perf: 'Producer', badge: 'bg-emerald-100 text-emerald-700', code: '38,542', eff: '88%', rate: '14.2%', amp: '320%' },
                      { name: 'Developer C', perf: 'Explorer', badge: 'bg-amber-100 text-amber-700', code: '12,401', eff: '72%', rate: '9.1%', amp: '185%' },
                      { name: 'Developer D', perf: 'Starter', badge: 'bg-slate-100 text-slate-600', code: '2,150', eff: '45%', rate: '4.2%', amp: '110%' },
                    ]).map((dev) => (
                      <tr key={dev.name} className="hover:bg-[#f3f3f7]/50 transition-colors">
                        <td className="px-8 py-5 font-semibold">{dev.name}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${dev.badge}`}>
                            {dev.perf}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-[#434654]">{dev.code}</td>
                        <td className="px-8 py-5 text-[#434654]">{dev.eff}</td>
                        <td className="px-8 py-5 text-[#434654]">{dev.rate}</td>
                        <td className="px-8 py-5 text-[#434654]">{dev.amp}</td>
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
      <footer className="bg-slate-50 w-full rounded-t-[3rem] mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 w-full max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0">
            <div className="text-lg font-bold text-slate-900 mb-2">DevIntelligence</div>
            <div className="text-sm text-slate-500">
              © 2025 AI Development Intelligence. Powered by <a href="https://thetaray.com/" target="_blank" rel="noopener noreferrer" className="underline-offset-4 decoration-slate-300 hover:text-blue-700 transition-colors">Thetaray</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ---- small sub-components used only inside the preview ---- */

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
    <div className="bg-white p-6 rounded-xl border-l-4 shadow-sm" style={{ borderLeftColor: color }}>
      <p className="text-[0.625rem] font-bold text-[#434654] uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-3xl font-headline font-extrabold" style={{ color }}>{value}</p>
    </div>
  );
}
