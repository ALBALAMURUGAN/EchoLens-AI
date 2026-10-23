import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Download, ChevronLeft, FileText } from "lucide-react";
import { useAnalysis } from "../lib/analysisContext";
import ReportBody from "../components/ReportBody";
import { getDemoAnalysis, DEMO_DEFS } from "../lib/demos";
import { fmtTime } from "../lib/audio";

export default function Report() {
  const { current, setCurrent } = useAnalysis();
  const navigate = useNavigate();

  useEffect(() => {
    if (!current) setCurrent(getDemoAnalysis(DEMO_DEFS[0].id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analysis = current ?? getDemoAnalysis(DEMO_DEFS[0].id);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ meta: { exported: new Date().toISOString(), engine: "EchoLens AI 2.4" }, ...analysis }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement("a");
    aEl.href = url; aEl.download = `${analysis.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48)}-echolens-report.json`;
    aEl.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      {/* action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print-hidden">
        <button onClick={() => navigate(-1)} className="btn-ghost px-4 py-2 text-[10px] mono uppercase tracking-widest"><ChevronLeft size={13} /> Back</button>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="mono text-[8px] uppercase tracking-[.3em] text-ink-faint hidden md:block">Canvas: boardroom A4 · EchoLens watermarked</div>
          <button onClick={downloadJson} className="btn-ghost px-4 py-2 text-[10px] mono uppercase tracking-widest"><Download size={12} /> JSON</button>
          <button onClick={() => window.print()} className="btn-gold px-5 py-2.5 text-[12px]"><Printer size={14} /> Print / Save PDF</button>
        </div>
      </div>

      {/* document sheet */}
      <div className="card rounded-[1.6rem] p-5 sm:p-10 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "linear-gradient(90deg,#f5c518,#ffd84d 30%,#8b5cf6 70%,#5b21b6)" }} />
        <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-gold-400" />
            <div>
              <div className="mono text-[9px] tracking-[.4em] uppercase text-gold-400">Official Report</div>
              <div className="mono text-[9px] text-ink-faint">Doc {analysis.id.toUpperCase()} · {fmtTime(analysis.duration)} runtime</div>
            </div>
          </div>
          <svg viewBox="0 0 64 64" className="w-11 h-11 opacity-90"><rect width="64" height="64" rx="14" fill="#141026" /><path d="M10 32h6l2.5-7 3.5 13 3-16 3.5 18 3-12 2.5 4H54" fill="none" stroke="#f5c518" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <ReportBody analysis={analysis} />
      </div>
    </div>
  );
}
