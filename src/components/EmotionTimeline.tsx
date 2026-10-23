/* ————————————————————————————————————————————————————
   The Signature — Emotion × Pattern Timeline.
   Every transcript segment is bound to its acoustic moment:
   rhythm (pace), energy (volume), pauses and a dominant
   emotional estimate. Not one emotion per recording —
   a continuous map.
   ———————————————————————————————————————————————————— */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Volume2, Timer, ChevronDown, Sparkles, ArrowRightLeft } from "lucide-react";
import { EMOTIONS, EMOTION_COLORS, type Analysis, type TranscriptSegment, fmtTime } from "../lib/audio";

export default function EmotionTimeline({ analysis, onSeek }: { analysis: Analysis; onSeek?: (t: number) => void }) {
  const segs = analysis.segments;
  const [active, setActive] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(segs[0]?.id ?? null);
  const dur = analysis.duration;
  const maxWpm = Math.max(...segs.map(s => s.wpm), 200);
  const activeSeg = active != null ? segs.find(s => s.id === active) : undefined;

  const transitionPoints = useMemo(() => {
    const pts: { at: number; from: string; to: string }[] = [];
    for (let i = 1; i < segs.length; i++) {
      if (segs[i].emotion !== segs[i - 1].emotion) pts.push({ at: segs[i].start, from: segs[i - 1].emotion, to: segs[i].emotion });
    }
    return pts;
  }, [segs]);

  return (
    <div className="w-full">
      {/* ————— Emotional ribbon ————— */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="mono text-[9px] tracking-[.3em] uppercase text-ink-faint">Emotional ribbon · {segs.length} segments</div>
          <div className="mono text-[9px] text-ink-faint">0:00 — {fmtTime(dur)}</div>
        </div>

        {/* sentiment curve */}
        <div className="relative h-16 rounded-xl border border-line bg-black/30 overflow-hidden mb-1.5">
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
          <svg viewBox={`0 0 ${dur * 10} 60`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <motion.path
              d={buildSentimentPath(segs, dur)}
              fill="rgba(245,197,24,.13)" stroke="#ffd84d" strokeWidth="1.8" vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6 }} />
          </svg>
          {transitionPoints.map((t, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-gold-400/50" style={{ left: `${(t.at / dur) * 100}%` }} title={`${t.from} → ${t.to}`}>
              <div className="absolute -left-[3px] top-1 w-[7px] h-[7px] rotate-45 bg-gold-400" />
            </div>
          ))}
          <span className="absolute left-2 top-1 mono text-[8px] text-gold-300/80 uppercase tracking-widest">+ positive</span>
          <span className="absolute left-2 bottom-1 mono text-[8px] text-orange-300/80 uppercase tracking-widest">− negative</span>
        </div>

        {/* segment bands */}
        <div className="relative h-14 rounded-xl overflow-hidden border border-line flex">
          {segs.map(s => (
            <button
              key={s.id}
              onMouseEnter={() => setActive(s.id)} onMouseLeave={() => setActive(null)}
              onClick={() => { setExpanded(s.id === expanded ? null : s.id); onSeek?.(s.start); }}
              className="relative h-full group focus:outline-none"
              style={{ width: `${((s.end - s.start) / dur) * 100}%` }}
              aria-label={`Segment ${s.id}: ${s.emotion}, ${s.wpm} words per minute`}
            >
              <div
                className="absolute inset-0 transition-all duration-300 group-hover:brightness-125"
                style={{ background: `linear-gradient(180deg, ${EMOTION_COLORS[s.emotion]}e6, ${EMOTION_COLORS[s.emotion]}59)` }}
              />
              <div className="absolute inset-0 border-r border-black/40" />
              <span className="absolute inset-0 grid place-items-center mono text-[9px] font-bold text-black/70 group-hover:text-black/90">{s.id}</span>
            </button>
          ))}
        </div>

        {/* pace & energy dual lanes */}
        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
          <div className="rounded-xl border border-line bg-black/30 px-2.5 py-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="mono text-[8px] tracking-[.25em] uppercase text-violet-300 flex items-center gap-1"><Zap size={9} /> Pace</span>
              <span className="mono text-[8px] text-ink-faint">WPM per segment</span>
            </div>
            <div className="flex items-end gap-[3px] h-9">
              {segs.map(s => (
                <button key={s.id} onClick={() => onSeek?.(s.start)} onMouseEnter={() => setActive(s.id)} onMouseLeave={() => setActive(null)} title={`${s.wpm} WPM`} className="flex-1 h-full flex items-end">
                  <div className="w-full rounded-t-sm" style={{ height: `${(s.wpm / maxWpm) * 100}%`, background: s.wpm > 172 ? "#fb7185" : s.wpm < 110 ? "#22d3ee" : "linear-gradient(180deg,#c4b5fd,#7c3aed)", opacity: .9 }} />
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-black/30 px-2.5 py-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="mono text-[8px] tracking-[.25em] uppercase text-gold-300 flex items-center gap-1"><Volume2 size={9} /> Energy</span>
              <span className="mono text-[8px] text-ink-faint">RMS level</span>
            </div>
            <div className="flex items-end gap-[3px] h-9">
              {segs.map(s => (
                <button key={s.id} onClick={() => onSeek?.(s.start)} onMouseEnter={() => setActive(s.id)} onMouseLeave={() => setActive(null)} className="flex-1 h-full flex items-end">
                  <div className="w-full rounded-t-sm" style={{ height: `${Math.min(100, s.rms * 100 * 9)}%`, background: "linear-gradient(180deg,#ffe889,#f5c518 60%,#8a6d00)", opacity: .92 }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* pause ticks */}
        <div className="relative h-4 mt-1.5">
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
          {analysis.segments.some(s => s.pauseBefore > 0.3) && analysis.segments.map(s =>
            s.pauseBefore > 0.3 ? (
              <div key={s.id} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${(s.start / dur) * 100}%` }} title={`Pause ${s.pauseBefore}s`}>
                <div className="w-[3px] h-3 rounded-full bg-cyan-300/80" />
              </div>
            ) : null
          )}
          <span className="absolute right-0 top-[-2px] mono text-[8px] text-cyan-200/70 uppercase tracking-widest flex items-center gap-1"><Timer size={9} /> pauses</span>
        </div>
      </div>

      {/* hover readout */}
      {activeSeg && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-gold-500/25 bg-gold-500/[.06] px-3 py-1.5 text-[10px] mono text-ink-dim">
          <span className="text-gold-400 font-bold">SEG {activeSeg.id}</span>
          <span>{fmtTime(activeSeg.start)}–{fmtTime(activeSeg.end)}</span>
          <span>{activeSeg.wpm} WPM</span>
          <span style={{ color: EMOTION_COLORS[activeSeg.emotion] }}>{activeSeg.emotion} · {Math.round(activeSeg.emotionScores[activeSeg.emotion] * 100)}%</span>
          <span>sentiment {activeSeg.sentiment >= 0 ? "+" : ""}{activeSeg.sentiment.toFixed(2)}</span>
          <span>confidence {activeSeg.confidence}%</span>
        </div>
      )}

      {/* ————— Segment ledger ————— */}
      <div className="mt-4 space-y-1.5 max-h-[430px] overflow-y-auto pr-1">
        {segs.map(s => (
          <SegmentRow key={s.id} seg={s} expanded={expanded === s.id} onToggle={() => setExpanded(expanded === s.id ? null : s.id)} onSeek={onSeek} active={active === s.id} onHover={setActive} />
        ))}
      </div>

      {/* transitions summary */}
      {transitionPoints.length > 0 && (
        <div className="mt-3 rounded-xl border border-violet-500/25 bg-violet-500/[.07] px-3 py-2">
          <div className="flex items-center gap-1.5 mono text-[8px] tracking-[.28em] uppercase text-violet-300 mb-1.5"><ArrowRightLeft size={10} /> Emotional shifts detected · {transitionPoints.length}</div>
          <div className="flex flex-wrap gap-1.5">
            {transitionPoints.map((t, i) => (
              <button key={i} onClick={() => onSeek?.(t.at)} className="mono text-[9px] flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-ink-dim hover:border-gold-500/40 hover:text-gold-300 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: EMOTION_COLORS[t.from] }} />{t.from}
                <span className="text-gold-400">→</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: EMOTION_COLORS[t.to] }} />{t.to}
                <span className="text-ink-faint">@{fmtTime(t.at)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function buildSentimentPath(segs: TranscriptSegment[], dur: number): string {
  const W = dur * 10, H = 60, mid = H / 2, amp = 22;
  const pts: [number, number][] = [
    [0, mid - segs[0].sentiment * amp],
    ...segs.flatMap(s => [
      [s.start * 10, mid - s.sentiment * amp] as [number, number],
      [((s.start + s.end) / 2) * 10, mid - s.sentiment * amp * 1.15] as [number, number],
      [s.end * 10, mid - s.sentiment * amp] as [number, number],
    ]),
    [W, mid - segs[segs.length - 1].sentiment * amp],
  ];
  let d = `M 0 ${H} L ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
  d += ` L ${W} ${H} Z`;
  return d;
}

const EMOTION_CHIP: Record<string, string> = Object.fromEntries(EMOTIONS.map(e => [e, EMOTION_COLORS[e]]));

function SegmentRow({ seg, expanded, onToggle, onSeek, active, onHover }: {
  seg: TranscriptSegment; expanded: boolean; onToggle: () => void; onSeek?: (t: number) => void;
  active: boolean; onHover: (id: number | null) => void;
}) {
  const color = EMOTION_CHIP[seg.emotion];
  const sentPct = Math.round((seg.sentiment + 1) * 50);
  return (
    <div
      onMouseEnter={() => onHover(seg.id)} onMouseLeave={() => onHover(null)}
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${active ? "border-gold-500/45 bg-gold-500/[.05]" : "border-line bg-white/[.025]"}`}
    >
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-3 py-2 text-left">
        <span className="mono text-[9px] text-ink-faint w-7 shrink-0">{String(seg.id).padStart(2, "0")}</span>
        <span className="mono text-[9px] text-gold-500/90 w-9 shrink-0">{fmtTime(seg.start)}</span>
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        <span className="text-[10px] font-bold text-ink truncate w-20 shrink-0">{seg.emotion}</span>
        {/* inline mini sentiment bar */}
        <span className="hidden sm:block flex-1 h-1.5 rounded-full bg-white/[.06] overflow-hidden">
          <span className="block h-full rounded-full" style={{ width: `${sentPct}%`, background: sentPct >= 50 ? "linear-gradient(90deg,#a78bfa,#ffd84d)" : "linear-gradient(90deg,#f97316,#a78bfa)" }} />
        </span>
        <span className="mono text-[9px] text-ink-dim w-14 text-right shrink-0">{seg.wpm} wpm</span>
        <span className="mono text-[9px] text-violet-300 w-9 text-right shrink-0">{seg.confidence}%</span>
        <ChevronDown size={14} className={`text-ink-faint transition-transform duration-300 shrink-0 ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-4 pb-3 pt-1 border-t border-line/70">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] leading-relaxed text-ink-dim line-clamp-3">{seg.text}</p>
            <button onClick={() => onSeek?.(seg.start)} className="shrink-0 btn-ghost px-3 py-1 text-[9px] mono uppercase tracking-widest">
              Seek {fmtTime(seg.start)}
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {EMOTIONS.map(e => {
              const v = Math.round((seg.emotionScores[e] || 0) * 100);
              return (
                <div key={e} className="text-center">
                  <div className="mono text-[8px] text-ink-faint uppercase">{e.slice(0, 4)}</div>
                  <div className="h-8 flex items-end justify-center">
                    <div className="w-3.5 rounded-sm" style={{ height: `${Math.max(8, v)}%`, background: EMOTION_COLORS[e], opacity: e === seg.emotion ? 1 : 0.45 }} />
                  </div>
                  <div className="mono text-[8px]" style={{ color: e === seg.emotion ? EMOTION_COLORS[e] : "#6f6594" }}>{v}</div>
                </div>
              );
            })}
          </div>
          {seg.important && (
            <div className="mt-2 flex items-center gap-1.5 mono text-[8px] uppercase tracking-[.25em] text-gold-400/90"><Sparkles size={9} /> High-signal segment · flagged for review</div>
          )}
        </motion.div>
      )}
    </div>
  );
}
