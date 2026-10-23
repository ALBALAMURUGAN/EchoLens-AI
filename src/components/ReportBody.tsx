/* ——— Full premium report body, shared by Analyzer print view & Report page ——— */
import { fmtTime, type Analysis } from "../lib/audio";
import { AreaChart, KeywordCloud, RadialGauge, SentimentMeter } from "./charts";
import { AlertTriangle, FileText } from "lucide-react";

export default function ReportBody({ analysis }: { analysis: Analysis }) {
  const m = analysis.metrics;
  const topEmotions = analysis.emotions.slice(0, 4);
  return (
    <div className="space-y-5">
      {/* Masthead */}
      <div className="text-center border-b border-line pb-5">
        <div className="mono text-[9px] tracking-[.4em] uppercase text-gold-400">EchoLens AI · Audio Intelligence Report</div>
        <h1 className="font-display text-3xl md:text-4xl font-black mt-2 text-ink">{analysis.name}</h1>
        <div className="mono text-[10px] text-ink-faint mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>Generated {new Date(analysis.date).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}</span>
          <span>·</span><span>Duration {fmtTime(analysis.duration)}</span><span>·</span><span>{analysis.wordCount.toLocaleString()} words</span><span>·</span><span>{analysis.segments.length} segments</span>
        </div>
      </div>

      {/* Executive summary */}
      <section className="card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2 mono text-[9px] tracking-[.3em] uppercase text-violet-300"><FileText size={11} /> Executive Summary</div>
        <p className="text-[12px] leading-6 text-ink-dim">
          Delivery analysis of <span className="text-ink font-semibold">“{analysis.name}”</span> indicates a{" "}
          <span className="text-gold-300 font-semibold">{m.wpmRating.toLowerCase()} pace of {m.wpm} WPM</span> with {m.clarity >= 70 ? "strong" : m.clarity >= 55 ? "moderate" : "developing"} articulation quality ({m.clarity}/100) and{" "}
          {m.stability >= 70 ? "steady" : "variable"} pacing stability ({m.stability}/100). The emotional ledger resolves to a dominant{" "}
          <span className="text-gold-300 font-semibold">{analysis.dominantEmotion}</span> signature — led by {topEmotions.slice(0, 3).map(e => `${e.label} ${e.value}%`).join(", ")}.
          Overall sentiment registers <span className="text-ink font-semibold">{m.sentiment >= 0 ? "+" : ""}{m.sentiment.toFixed(2)} ({m.sentimentLabel})</span>, with {m.pauseCount} significant pauses occupying {m.pausePercent}% of total airtime and {m.fillerTotal} filler expressions detected.
        </p>
      </section>

      {/* Scorecard */}
      <section className="card rounded-2xl p-5">
        <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300 mb-4">Performance Scorecard</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
          <RadialGauge value={m.clarity} label="Clarity" sub="articulation quality" size={104} />
          <RadialGauge value={m.confidence} label="Confidence" sub="delivery assurance" tint="#ffd84d" size={104} />
          <RadialGauge value={m.stability} label="Stability" sub="pace consistency" tint="#a78bfa" size={104} />
          <RadialGauge value={m.expressiveness} label="Expressiveness" sub="dynamic range" tint="#22d3ee" size={104} />
        </div>
      </section>

      {/* Sentiment + acoustics */}
      <section className="grid md:grid-cols-5 gap-5">
        <div className="card rounded-2xl p-5 md:col-span-2">
          <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300 mb-1">Sentiment Polarity</div>
          <div className="font-display text-4xl font-black text-ink my-3">{m.sentiment >= 0 ? "+" : ""}{m.sentiment.toFixed(2)}
            <span className="block text-[11px] font-sans font-bold text-gold-400 tracking-wide mt-1">{m.sentimentLabel}</span>
          </div>
          <SentimentMeter value={m.sentiment} />
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            {[["Reading ease", `${m.readingEase}`], ["Loudness", `${m.loudnessDb} LK`], ["Dyn. range", `${m.dynamicRange} dB`]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-white/[.03] py-2">
                <div className="font-display text-lg font-bold text-ink">{v}</div>
                <div className="mono text-[8px] uppercase tracking-widest text-ink-faint">{k}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card rounded-2xl p-5 md:col-span-3">
          <div className="flex items-center justify-between mb-2">
            <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300">Energy Curve</div>
            <div className="mono text-[9px] text-ink-faint">smoothed RMS · {analysis.duration}s window</div>
          </div>
          <AreaChart data={analysis.energyCurve} height={140} />
          <div className="flex justify-between mono text-[8px] text-ink-faint mt-1">
            <span>0:00</span><span>{fmtTime(analysis.duration / 2)}</span><span>{fmtTime(analysis.duration)}</span>
          </div>
        </div>
      </section>

      {/* Emotion board */}
      <section className="card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300">Emotion Ledger <span className="text-ink-faint">(duration-weighted)</span></div>
          <div className="mono text-[9px] text-gold-400">dominant: {analysis.dominantEmotion}</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {analysis.emotions.map(e => (
            <div key={e.label} className="rounded-xl border border-line bg-black/30 px-2 py-3 text-center">
              <div className="font-display text-xl font-black" style={{ color: e.color }}>{e.value}<span className="text-[10px]">%</span></div>
              <div className="mono text-[8px] uppercase tracking-wider text-ink-dim mt-1">{e.label}</div>
              <div className="h-1 rounded-full mt-2 bg-white/5 overflow-hidden"><div className="h-full" style={{ width: `${e.value}%`, background: e.color }} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* Temporal ledger table */}
      <section className="card rounded-2xl overflow-hidden">
        <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300 px-5 pt-4">Temporal Emotion Ledger</div>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line mono text-[8px] uppercase tracking-[.2em] text-ink-faint">
                <th className="px-5 py-2 font-semibold">#</th><th className="px-3 py-2 font-semibold">Time</th><th className="px-3 py-2 font-semibold">Dominant tone</th><th className="px-3 py-2 font-semibold">Conf.</th><th className="px-3 py-2 font-semibold">WPM</th><th className="px-3 py-2 font-semibold">Sentiment</th><th className="px-3 py-2 font-semibold">Words</th>
              </tr>
            </thead>
            <tbody>
              {analysis.segments.map(s => (
                <tr key={s.id} className="border-b border-line/60 text-[10px] hover:bg-white/[.03]">
                  <td className="px-5 py-1.5 mono text-ink-faint">{s.id}</td>
                  <td className="px-3 py-1.5 mono text-gold-500">{fmtTime(s.start)}–{fmtTime(s.end)}</td>
                  <td className="px-3 py-1.5 font-bold" style={{ color: s.emotion === analysis.dominantEmotion ? "#ffd84d" : "#c9c2e6" }}>{s.emotion}</td>
                  <td className="px-3 py-1.5 mono text-ink-dim">{s.confidence}%</td>
                  <td className="px-3 py-1.5 mono text-ink-dim">{s.wpm}</td>
                  <td className="px-3 py-1.5 mono" style={{ color: s.sentiment >= 0 ? "#a7f3d0" : "#fdba74" }}>{s.sentiment >= 0 ? "+" : ""}{s.sentiment.toFixed(2)}</td>
                  <td className="px-3 py-1.5 mono text-ink-dim">{s.wordCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Keywords */}
      <section className="card rounded-2xl p-5">
        <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300 mb-2">Lexical Fingerprint</div>
        <KeywordCloud keywords={analysis.keywords.slice(0, 12)} />
      </section>

      {/* Disclaimer */}
      <section className="rounded-2xl border border-gold-500/40 bg-gold-500/[.07] p-4 flex gap-3">
        <AlertTriangle size={18} className="text-gold-400 shrink-0 mt-0.5" />
        <p className="text-[10px] leading-5 text-ink-dim"><span className="text-gold-300 font-bold">Methodological note.</span> Emotion detection from voice is an uncertain estimate derived from acoustic energy, pacing, pause structure and lexical cues — not a measurement of a person's actual feelings, identity or state of mind. EchoLens AI is a communication-coaching instrument; it must not be used for diagnosis, hiring, surveillance or any consequential decision about an individual.</p>
      </section>
      <div className="text-center mono text-[8px] uppercase tracking-[.4em] text-ink-faint pb-2">EchoLens AI · molten intelligence for the human voice</div>
    </div>
  );
}
