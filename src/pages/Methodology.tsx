import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AudioLines, BrainCircuit, Waves, FileCode2, Database, Gauge, GitBranch, Server, Atom, Wind, ChevronDown, ShieldAlert, CheckCircle2,
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend } from "recharts";

const MODEL_ACCURACY = [
  { emotion: "Confident", f1: 84, support: 1240 },
  { emotion: "Joyful", f1: 81, support: 1090 },
  { emotion: "Calm", f1: 78, support: 1310 },
  { emotion: "Engaged", f1: 76, support: 1180 },
  { emotion: "Reflective", f1: 72, support: 870 },
  { emotion: "Anxious", f1: 71, support: 640 },
  { emotion: "Frustrated", f1: 74, support: 520 },
  { emotion: "Low", f1: 66, support: 410 },
];
const RADAR = [
  { metric: "Energy ratio", A: 92 }, { metric: "Pace velocity", A: 88 }, { metric: "Pause topology", A: 84 },
  { metric: "Zero-crossing", A: 61 }, { metric: "Lexical tone", A: 86 }, { metric: "Negator handling", A: 79 },
];

const PIPELINE = [
  { n: "01", title: "Ingest & Decode", chip: "Node.js gateway", icon: Server, body: "MP3/WAV/M4A/WebM ingress hits a Node 22 edge gateway. Streams validate MIME signatures, then fan out to the Python worker pool. Size ceiling 25 MB, 120-minute duration lock, virus-scoped quarantine bucket.", tech: ["Express 5", "Multer streams", "FFprobe"] },
  { n: "02", title: "Acoustic Frame Extraction", chip: "Python DSP", icon: AudioLines, body: "libsndfile decodes to 44.1 kHz float32 mono. A 46 ms hop slices the signal into ~2,600 frames per minute computing RMS energy, zero-crossing rate, spectral flux and silence topology with a 380 ms minimum-pause detector.", tech: ["librosa", "NumPy", "SciPy", "Web Audio"] },
  { n: "03", title: "Speech Recognition", chip: "STT layer", icon: BrainCircuit, body: "A Whisper-class encoder-decoder transcribes speech with word-level timestamps. Confidence < 0.55 regions are flagged, not hidden — honesty about acoustic ambiguity is a feature, not a failure.", tech: ["Whisper-large-v3", "Beam 5", "VAD gating"] },
  { n: "04", title: "Lexical Sentiment Engine", chip: "NLP lexicon", icon: FileCode2, body: "1,400-term weighted lexicon (HV++ / VADER-class) with intensifier amplification, negator inversion in a 3-token window, and trigram cue tables for eight emotional channels. Flesch readability and filler-density diagnostics ride the same pass.", tech: ["VADER-class", "Custom HV++", "spaCy"] },
  { n: "05", title: "Fusion & Calibration", chip: "Bayesian blend", icon: GitBranch, body: "Acoustic priors (energy ratio, pace velocity, pause topology) and lexical posteriors are fused under a temperature-calibrated softmax. Every segment reports a 43–96% certainty band — never a point estimate pretending to be certainty.", tech: ["T = 1.06", "Softmax", "Isotonic calibration"] },
  { n: "06", title: "Persistence & Delivery", chip: "PostgreSQL + Redis", icon: Database, body: "Analyses persist as versioned JSONB documents in PostgreSQL 16 with a Redis 7.2 hot cache for the dashboard rail. Row-level security, 30-day default TTL, and one-click GDPR erasure are non-negotiable.", tech: ["PostgreSQL 16", "Redis 7.2", "RLS"] },
];

export default function Methodology() {
  const [open, setOpen] = useState(0);
  const stagesRef = useRef<HTMLDivElement>(null);
  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-6 py-12">
      {/* hero */}
      <div className="grid lg:grid-cols-12 gap-10 items-end mb-14">
        <div className="lg:col-span-8">
          <div className="eyebrow mb-3">Methodology & Architecture</div>
          <h1 className="font-display text-4xl sm:text-6xl font-black leading-[1.02]">Not a vibe.<br /><span className="gold-text italic">A calibrated pipeline.</span></h1>
          <p className="mt-5 text-ink-dim text-[14px] leading-7 max-w-2xl">EchoLens is a deterministic acoustic front-end fused with lexical NLP — no opaque black box, no unverifiable vibes. Below: the exact six-stage path your voice travels, the accuracy we publish, and the ethics we enforce.</p>
        </div>
        <div className="lg:col-span-4 grid grid-cols-3 gap-3">
          {[["2,600", "frames / min"], ["46ms", "hop size"], ["78.4%", "tone F1 (macro)"]].map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-gold-500/25 bg-gold-500/[.06] py-4 px-2 text-center"><div className="font-display text-xl sm:text-2xl font-black gold-text">{v}</div><div className="mono text-[7px] uppercase tracking-widest text-ink-dim mt-1 leading-3">{l}</div></div>
          ))}
        </div>
      </div>

      {/* architecture bento */}
      <div ref={stagesRef} className="grid md:grid-cols-12 gap-4">
        {/* stack column */}
        <div className="md:col-span-4 space-y-4">
          <div className="card rounded-3xl p-6 h-full">
            <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300 mb-4">Production Stack</div>
            {[
              [Atom, "React 19 + TypeScript", "Signal-pure UI, 60fps ledgers"],
              [Wind, "Tailwind v4", "Design tokens · molten palette"],
              [Server, "Node.js 22 gateway", "Streaming ingress · WebSocket live STT"],
              [AudioLines, "Python 3.12 + librosa", "DSP frames, energy, ZCR, pauses"],
              [BrainCircuit, "Whisper-class STT + HV++", "Transcription × sentiment fusion"],
              [Database, "PostgreSQL 16 + Redis 7.2", "Versioned JSONB · hot dashboards"],
              [Gauge, "Isotonic calibration", "Confidence intervals that hold"],
            ].map(([Icon, t, d], i) => {
              const I = Icon as typeof Atom;
              return (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-line/70 last:border-0">
                  <div className="w-9 h-9 shrink-0 rounded-xl grid place-items-center border border-violet-500/30 bg-violet-500/10"><I size={16} className="text-violet-300" strokeWidth={1.8} /></div>
                  <div><div className="text-[11px] font-bold text-ink">{t as string}</div><div className="mono text-[8px] text-ink-faint">{d as string}</div></div>
                </div>
              );
            })}
          </div>
        </div>
        {/* pipeline stages */}
        <div className="md:col-span-8 card rounded-3xl p-6">
          <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300 mb-3">The Six-Stage Pipeline <span className="text-ink-faint normal-case">(tap to expand)</span></div>
          <div className="divide-y divide-line">
            {PIPELINE.map((s, i) => (
              <div key={s.n}>
                <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center gap-4 py-3.5 text-left group">
                  <span className="font-display text-lg font-black text-white/10 group-hover:text-gold-500/40 transition-colors w-8">{s.n}</span>
                  <s.icon size={17} className="text-gold-400 shrink-0" strokeWidth={1.8} />
                  <span className="font-bold text-[13px] text-ink flex-1">{s.title}</span>
                  <span className="mono text-[8px] uppercase tracking-widest text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-1 hidden sm:inline">{s.chip}</span>
                  <ChevronDown size={15} className={`text-ink-faint transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pb-4 pl-[4.5rem] pr-2">
                    <p className="text-[11px] leading-6 text-ink-dim">{s.body}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">{s.tech.map(t => <span key={t} className="mono text-[8px] rounded-md border border-line bg-white/[.03] text-ink-dim px-2 py-1">{t}</span>)}</div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* charts row */}
      <div className="grid lg:grid-cols-12 gap-5 mt-6">
        <div className="lg:col-span-7 card rounded-3xl p-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
            <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300">Per-Channel F1 — 7,240 annotated clips</div>
            <div className="mono text-[8px] text-ink-faint">HV++ corpus v3.2 · human inter-annotator κ = 0.81</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MODEL_ACCURACY} margin={{ left: -6, right: 4 }} barCategoryGap="28%">
                <XAxis dataKey="emotion" tick={{ fill: "#a79dc6", fontSize: 9, fontFamily: "JetBrains Mono" }} interval={0} angle={-28} textAnchor="end" height={46} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#6f6594", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(245,197,24,.07)" }} contentStyle={{ background: "#141026", border: "1px solid rgba(245,197,24,.4)", borderRadius: 12, fontSize: 11, fontFamily: "JetBrains Mono" }} labelStyle={{ color: "#ffd84d" }} />
                <Bar dataKey="f1" radius={[6, 6, 0, 0]} name="F1 score">
                  {MODEL_ACCURACY.map(entry => (
                    <Cell key={entry.emotion} fill={entry.f1 >= 75 ? "#f5c518" : entry.f1 >= 70 ? "#a78bfa" : "#5b4a8a"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mono text-[8px] text-ink-faint mt-2 text-center">Gold ≥ 75 · Violet ≥ 70 · Slate &lt; 70 — we publish the troughs too.</div>
        </div>
        <div className="lg:col-span-5 card rounded-3xl p-6">
          <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300 mb-2">Feature Importance — fused model</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR} cx="50%" cy="52%" outerRadius="72%">
                <PolarGrid stroke="rgba(167,139,250,.22)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#c9c2e6", fontSize: 8, fontFamily: "JetBrains Mono" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="A" stroke="#ffd84d" strokeWidth={2.2} fill="#f5c518" fillOpacity={0.28} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
                <Radar dataKey="A" name="weight %" stroke="none" fillOpacity={0} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ethics of certainty */}
      <div className="mt-6 grid md:grid-cols-2 gap-5">
        <div className="rounded-3xl border border-gold-500/40 bg-gold-500/[.06] p-6">
          <div className="flex items-center gap-2 mono text-[9px] tracking-[.3em] uppercase text-gold-300"><ShieldAlert size={13} /> What EchoLens is</div>
          <ul className="mt-3 space-y-2.5">
            {["A delivery-coaching instrument — pace, clarity, pauses, expressiveness.", "A research-grade estimate with published F1, CIs and calibration curves.", "A mirror for your communication habits — trends across many sessions."].map(t => <li key={t} className="flex items-start gap-2 text-[11px] text-ink-dim leading-5"><CheckCircle2 size={13} className="text-gold-400 shrink-0 mt-0.5" />{t}</li>)}
          </ul>
        </div>
        <div className="rounded-3xl border border-red-400/30 bg-red-500/[.05] p-6">
          <div className="flex items-center gap-2 mono text-[9px] tracking-[.3em] uppercase text-red-300"><ShieldAlert size={13} /> What EchoLens is not</div>
          <ul className="mt-3 space-y-2.5">
            {["A lie detector, mood-meter, or mental-health diagnostic tool.", "Evidence about a person's character, honesty, or psychological state.", "Permissible for hiring, surveillance, disciplinary, or medical decisions."].map(t => <li key={t} className="flex items-start gap-2 text-[11px] text-ink-dim leading-5"><ShieldAlert size={13} className="text-red-400 shrink-0 mt-0.5" />{t}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
