import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowUpDown, Library as LibraryIcon, Mic, FileAudio, Sparkles, BarChart3, ChevronRight, Inbox, ArrowLeftRight } from "lucide-react";
import { useAnalysis } from "../lib/analysisContext";
import { timeAgo, formatDuration } from "../lib/store";
import { fmtTime, EMOTION_COLORS, type Analysis } from "../lib/audio";
import { Sparkline } from "../components/charts";

type SortKey = "date" | "duration" | "wpm" | "clarity" | "sentiment";
const SORTS: Record<SortKey, (a: Analysis, b: Analysis) => number> = {
  date: (a, b) => b.date - a.date,
  duration: (a, b) => b.duration - a.duration,
  wpm: (a, b) => b.metrics.wpm - a.metrics.wpm,
  clarity: (a, b) => b.metrics.clarity - a.metrics.clarity,
  sentiment: (a, b) => b.metrics.sentiment - a.metrics.sentiment,
};
const SOURCE_ICON = { recording: Mic, upload: FileAudio, demo: Sparkles } as const;

export default function Library() {
  const { library, setCurrent, removeAnalysis } = useAnalysis();
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortKey>("date");
  const [compare, setCompare] = useState<[string | null, string | null]>([null, null]);
  const sorted = useMemo(() => [...library].sort(SORTS[sort]), [library, sort]);
  const cmp = compare.map(id => library.find(a => a.id === id) || null);

  const open = (a: Analysis) => { setCurrent(a); navigate("/analyzer"); };
  const toggleCompare = (id: string) =>
    setCompare(([a, b]) => (a === id ? [null, b] : b === id ? [a, null] : !a ? [id, b] : !b ? [a, id] : [b, id]));

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-6 py-12 min-h-[70vh]">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="eyebrow mb-2 flex items-center gap-2"><LibraryIcon size={12} /> Your Intelligence Vault</div>
          <h1 className="font-display text-4xl sm:text-5xl font-black">The <span className="gold-text italic">Library</span></h1>
          <p className="text-[12px] text-ink-dim mt-2 max-w-md">Every analysis you have run, preserved with full emotional ledgers. Search, compare, reopen — or export a boardroom dossier.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="mono text-[9px] uppercase tracking-widest text-ink-faint flex items-center gap-1.5"><ArrowUpDown size={10} /> Sort</span>
          {(["date", "duration", "wpm", "clarity", "sentiment"] as SortKey[]).map(k => (
            <button key={k} onClick={() => setSort(k)} className={`mono text-[9px] uppercase tracking-widest rounded-full px-3 py-1.5 border transition-all ${sort === k ? "border-gold-500/60 bg-gold-500/15 text-gold-300" : "border-line text-ink-dim hover:text-ink"}`}>{k}</button>
          ))}
        </div>
      </div>

      {/* stat strip */}
      {library.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            [String(library.length), "Analyses stored"],
            [formatDuration(library.reduce((a, b) => a + b.duration, 0)), "Total audio processed"],
            [String(Math.round(library.reduce((a, b) => a + b.metrics.wpm, 0) / library.length)), "Avg WPM across vault"],
            [String(Math.round(library.reduce((a, b) => a + b.metrics.clarity, 0) / library.length)) + "%", "Avg clarity score"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-line bg-white/[.03] py-3 px-4 text-center">
              <div className="font-display text-2xl font-black gold-text">{v}</div>
              <div className="mono text-[8px] uppercase tracking-[.22em] text-ink-faint mt-1">{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* compare rail */}
      {cmp[0] && cmp[1] && <ComparePanel a={cmp[0]} b={cmp[1]} onClear={() => setCompare([null, null])} onOpen={open} />}

      {/* empty state */}
      {library.length === 0 && (
        <div className="mt-16 text-center">
          <div className="w-24 h-24 mx-auto rounded-3xl border border-violet-500/30 bg-violet-500/[.07] grid place-items-center"><Inbox size={38} className="text-violet-300" strokeWidth={1.4} /></div>
          <h2 className="font-display text-2xl font-bold mt-6">Your vault is silent — for now.</h2>
          <p className="text-[12px] text-ink-dim mt-2 max-w-sm mx-auto">Run your first analysis and it will be catalogued here with its complete emotional ledger.</p>
          <Link to="/analyzer" className="btn-gold px-7 py-4 text-sm mt-6 inline-flex"><Mic size={16} /> Analyze Your First Voice</Link>
        </div>
      )}

      {/* cards */}
      <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence>
          {sorted.map(a => {
            const Icon = SOURCE_ICON[a.source];
            const selected = compare.includes(a.id);
            return (
              <motion.article layout key={a.id} initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .9, height: 0, marginTop: 0 }} transition={{ duration: .35 }}
                className={`card card-hover rounded-3xl p-5 flex flex-col border ${selected ? "border-gold-500/60 shadow-[0_0_0_1px_rgba(245,197,24,.4)]" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="mono text-[8px] uppercase tracking-[.3em] text-gold-400 flex items-center gap-1.5"><Icon size={10} />{a.source}</span>
                  <span className="mono text-[9px] text-ink-faint">{timeAgo(a.date)}</span>
                </div>
                <h3 className="font-display font-bold text-[17px] leading-snug mt-2 line-clamp-2 min-h-[3.4rem]">{a.name}</h3>
                {/* mini emotion strip */}
                <div className="flex h-2.5 rounded-full overflow-hidden mt-2 border border-white/5">
                  {a.segments.map(s => <div key={s.id} style={{ width: `${((s.end - s.start) / a.duration) * 100}%`, background: EMOTION_COLORS[s.emotion], opacity: .85 }} />)}
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                  {[[`${a.metrics.wpm}`, "WPM"], [`${a.metrics.clarity}%`, "Clarity"], [`${a.metrics.stability}%`, "Stability"], [`${a.metrics.sentiment >= 0 ? "+" : ""}${a.metrics.sentiment.toFixed(1)}`, "Sent."]].map(([v, l]) => (
                    <div key={l} className="rounded-xl bg-white/[.03] border border-line/60 py-1.5"><div className="mono text-[12px] font-bold text-ink">{v}</div><div className="mono text-[7px] uppercase tracking-widest text-ink-faint">{l}</div></div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="mono text-[9px] text-violet-300">{a.dominantEmotion} <span className="text-ink-faint">· dominant</span></div>
                  <Sparkline data={a.energyCurve.filter((_, i) => i % 4 === 0)} width={96} height={26} />
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-line">
                  <button onClick={() => open(a)} className="btn-ghost flex-1 justify-center px-3 py-2 text-[10px] mono uppercase tracking-widest">Open <ChevronRight size={12} /></button>
                  <button onClick={() => toggleCompare(a.id)} title="Add to comparison" className={`p-2 rounded-xl border transition-all ${selected ? "border-gold-500/60 text-gold-300 bg-gold-500/15" : "border-line text-ink-dim hover:text-gold-300"}`} aria-pressed={selected}><ArrowLeftRight size={14} /></button>
                  <button onClick={() => { setCurrent(a); navigate("/report"); }} title="Open report" className="p-2 rounded-xl border border-line text-ink-dim hover:text-gold-300 transition-colors"><BarChart3 size={14} /></button>
                  <button onClick={() => removeAnalysis(a.id)} title="Delete" className="p-2 rounded-xl border border-line text-ink-dim hover:text-red-300 hover:border-red-400/40 transition-all"><Trash2 size={14} /></button>
                </div>
                <div className="mono text-[8px] text-ink-faint mt-2 text-right">{fmtTime(a.duration)} · {a.wordCount.toLocaleString()} words · {a.segments.length} segments</div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ComparePanel({ a, b, onClear, onOpen }: { a: Analysis; b: Analysis; onClear: () => void; onOpen: (x: Analysis) => void }) {
  const rows: [string, (x: Analysis) => number, string, boolean][] = [
    ["Pace (WPM)", x => x.metrics.wpm, "", false],
    ["Clarity", x => x.metrics.clarity, "%", true],
    ["Stability", x => x.metrics.stability, "%", true],
    ["Expressiveness", x => x.metrics.expressiveness, "%", true],
    ["Confidence", x => x.metrics.confidence, "%", true],
    ["Sentiment", x => Math.round((x.metrics.sentiment + 1) * 50), "", true],
    ["Reading ease", x => x.metrics.readingEase, "", true],
  ];
  return (
    <div className="mt-6 card-gold rounded-3xl p-5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="mono text-[9px] tracking-[.35em] uppercase text-gold-300 flex items-center gap-2"><ArrowLeftRight size={12} /> Head-to-Head Intelligence</div>
        <button onClick={onClear} className="mono text-[9px] uppercase tracking-widest text-ink-faint hover:text-ink">Clear comparison ✕</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {[a, b].map((x, i) => (
          <div key={i} className="rounded-2xl border border-gold-500/25 bg-black/40 p-4">
            <div className="mono text-[8px] uppercase tracking-widest text-violet-300">{i === 0 ? "Challenger A" : "Challenger B"}</div>
            <button onClick={() => onOpen(x)} className="font-display font-bold text-[14px] leading-snug mt-1 text-left hover:text-gold-200 transition-colors line-clamp-1">{x.name}</button>
            <div className="mono text-[9px] text-ink-faint mt-0.5">{x.dominantEmotion} dominant · {fmtTime(x.duration)} · {x.wordCount.toLocaleString()} words</div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {rows.map(([label, fn, suffix, higherBetter]) => {
          const va = fn(a), vb = fn(b);
          const max = Math.max(va, vb, 1);
          const winA = higherBetter ? va >= vb : va <= vb;
          return (
            <div key={label} className="grid grid-cols-[92px_1fr_1fr] items-center gap-2">
              <span className="mono text-[8px] uppercase tracking-wider text-ink-dim">{label}</span>
              {[["A", va, winA], ["B", vb, !winA]].map(([side, v, win]) => (
                <div key={side as string} className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-white/[.06] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(Number(v) / max) * 100}%`, background: win ? "linear-gradient(90deg,#ffd84d,#f5c518)" : "linear-gradient(90deg,#5b4a8a,#7c6aa8)" }} />
                  </div>
                  <span className={`mono text-[9px] w-10 text-right ${win ? "text-gold-300" : "text-ink-faint"}`}>{String(v)}{suffix as string}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
