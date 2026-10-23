import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Mic, ArrowRight, Play, Sparkles, Waves, BrainCircuit, Gauge, Search, FileText, ScanLine,
  UploadCloud, AudioLines, ChevronDown, ShieldCheck, Zap, CircleDot, Wind, ChevronRight, Quote, BadgeCheck, CheckCircle2,
} from "lucide-react";
import { DEMO_DEFS, getDemoAnalysis } from "../lib/demos";
import { useAnalysis } from "../lib/analysisContext";
import { AreaChart, Equalizer, EmotionDonut, Waveform } from "../components/charts";
import { fmtTime } from "../lib/audio";

/* ————— animated counter ————— */
function Counter({ to, suffix = "", decimals = 0, className = "" }: { to: number; suffix?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1800, start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(2, -8 * p);
      setVal(to * (p === 1 ? 1 : eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref} className={className}>{val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const { saveCurrent } = useAnalysis();
  const [demoIdx, setDemoIdx] = useState(0);
  const [faq, setFaq] = useState<number | null>(0);
  const showcase = getDemoAnalysis(DEMO_DEFS[demoIdx].id);

  const openDemo = () => {
    saveCurrent(getDemoAnalysis(DEMO_DEFS[demoIdx].id));
    navigate("/analyzer?demo=" + DEMO_DEFS[demoIdx].id);
  };

  return (
    <div className="overflow-hidden">
      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-[94vh] flex items-center">
        <img src="/img/waves-wide.png" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-55" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(1100px 600px at 72% 42%, transparent 0%, rgba(7,5,15,.55) 55%, #07050f 100%), linear-gradient(180deg, rgba(7,5,15,.35), rgba(7,5,15,.2) 45%, #07050f 100%)" }} />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 pt-10 pb-24 grid lg:grid-cols-12 gap-10 items-center w-full">
          {/* Left */}
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-gold-500/10 backdrop-blur-sm pl-1.5 pr-4 py-1.5 mb-6">
              <span className="grid place-items-center w-5 h-5 rounded-full bg-gold-400"><Sparkles size={11} strokeWidth={2.8} className="text-[#221500]" /></span>
              <span className="mono text-[9px] sm:text-[10px] tracking-[.18em] uppercase text-gold-300">Acoustic AI · v2.4 — now reading micro-pauses</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .08 }} className="font-display font-black text-[2.6rem] sm:text-6xl xl:text-[4.35rem] leading-[1.02] tracking-tight">
              Hear What<br />Words <span className="italic gold-text">Can’t Say.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .18 }} className="mt-6 text-[15px] sm:text-lg text-ink-dim max-w-xl leading-7">
              EchoLens AI transcribes your voice, then dissects <span className="text-ink font-semibold">pace, pauses, energy and emotional tone — second by second</span>. The first instrument that scores every segment of a recording, not just the average.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .28 }} className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/analyzer" className="btn-gold px-7 py-4 text-[15px]"><Mic size={18} strokeWidth={2.6} /> Analyze Your Voice <ArrowRight size={17} strokeWidth={2.8} /></Link>
              <a href="#live-preview" className="btn-ghost px-6 py-4 text-[13px]"><Play size={15} className="fill-current" /> Watch it think</a>
            </motion.div>

            {/* trust row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .45, duration: .8 }} className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex -space-x-2.5">
                {["MC", "JR", "AS", "KP", "DV"].map((n, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0e0a1d] grid place-items-center text-[8px] font-extrabold text-[#221500]" style={{ background: ["#ffd84d", "#a78bfa", "#ffe889", "#8b5cf6", "#f5c518"][i] }}>{n}</div>
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-[#0e0a1d] grid place-items-center bg-panel-3 text-[8px] font-extrabold text-violet-300">+9k</div>
              </div>
              <div className="text-[11px] leading-4 text-ink-dim">
                <span className="text-gold-300 font-bold">9,200+ speakers</span> calibrated their<br />voice intelligence this quarter
              </div>
            </motion.div>
          </div>

          {/* Right — portrait with orbiting chips */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-[280px] sm:w-[340px] xl:w-[400px]">
              {/* orbit rings */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[118%] aspect-square rounded-full border border-violet-500/25 animate-spin-slower">
                <span className="absolute top-0 left-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400 shadow-[0_0_12px_#f5c518]" />
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[138%] aspect-square rounded-full border border-gold-500/15" style={{ animation: "spin-slow 34s linear infinite reverse" }}>
                <span className="absolute bottom-6 right-8 w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_#8b5cf6]" />
              </div>

              <div className="relative rounded-[2rem] overflow-hidden border border-violet-500/30 shadow-[0_40px_90px_-20px_rgba(124,58,237,.5)] animate-floaty-slow animate-glow">
                <img src="/img/hero-portrait.png" alt="Sound-wave sculpture of a human head — voice intelligence" className="w-full h-[480px] sm:h-[540px] object-cover object-top" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(14,10,29,.92) 100%)" }} />
                {/* scan line */}
                <div className="absolute left-0 right-0 h-14 scan-line" style={{ background: "linear-gradient(180deg, transparent, rgba(255,216,77,.35), transparent)" }} />
                {/* bottom HUD */}
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="mono text-[8px] tracking-[.3em] uppercase text-gold-300 flex items-center gap-1.5"><CircleDot size={8} className="animate-pulse-soft" /> Live acoustic read</span>
                    <span className="mono text-[9px] text-violet-300">sig 94.2%</span>
                  </div>
                  <Waveform data={showcase.waveform.filter((_, i) => i % 2 === 0)} height={44} progress={0.62} />
                </div>
              </div>

              {/* floating HUD chips */}
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-2 sm:-left-10 top-16 glass rounded-2xl px-3.5 py-2.5 shadow-xl">
                <div className="mono text-[8px] tracking-[.22em] text-ink-faint uppercase flex items-center gap-1.5"><Wind size={10} className="text-gold-400" /> Pace</div>
                <div className="font-display text-xl font-black text-ink">142 <span className="text-[10px] text-gold-400 align-top">WPM</span></div>
                <div className="mono text-[8px] text-emerald-400">▲ optimal band</div>
              </motion.div>
              <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: .7 }} className="absolute -right-1 sm:-right-8 top-40 glass rounded-2xl px-3.5 py-2.5 shadow-xl">
                <div className="mono text-[8px] tracking-[.22em] text-ink-faint uppercase flex items-center gap-1.5"><BrainCircuit size={10} className="text-violet-300" /> Dominant tone</div>
                <div className="font-display text-lg font-black violet-text">Confident</div>
                <div className="mono text-[8px] text-violet-300">41% ledger weight</div>
              </motion.div>
              <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.3 }} className="absolute left-2 sm:-left-6 bottom-36 glass rounded-2xl px-3.5 py-2 shadow-xl">
                <div className="mono text-[8px] tracking-[.22em] text-ink-faint uppercase">Micro-pause</div>
                <div className="mono text-[11px] text-cyan-300 font-bold">0.42s @ 0:47</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ MARQUEE TRUST BAR ══════════════ */}
      <div className="relative border-y border-line bg-[#0c0918] py-3.5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex items-center">
              {["KEYNOTE TEAMS", "PODCAST NETWORKS", "EARNINGS DESKS", "SALES ORGS", "COACHING STUDIOS", "LEGAL DISCOVERY", "RESEARCH LABS", "CREATOR STUDIOS"].map((t, i) => (
                <span key={i} className="mx-8 flex items-center gap-3 mono text-[10px] tracking-[.3em] text-ink-faint"><Zap size={10} className="text-gold-500" />{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ LIVE INTELLIGENCE PREVIEW ══════════════ */}
      <section id="live-preview" className="relative py-20 grid-bg">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
            <div>
              <div className="eyebrow mb-3">Live Intelligence Preview</div>
              <h2 className="font-display text-4xl sm:text-5xl font-black leading-[1.05]">Three voices.<br /><span className="violet-text italic">Three emotional arcs.</span></h2>
            </div>
            <p className="text-[12px] text-ink-dim max-w-xs leading-5">Every demo below is processed by the same engine that will read your voice — acoustic frames fused with lexical signals, second by second.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Demo selector */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {DEMO_DEFS.map((d, i) => (
                <button key={d.id} onClick={() => setDemoIdx(i)} className={`text-left rounded-2xl border p-4 transition-all duration-400 group ${i === demoIdx ? "border-gold-500/50 bg-gradient-to-br from-gold-500/[.12] to-violet-600/[.12] shadow-[0_18px_45px_-18px_rgba(245,197,24,.3)]" : "border-line bg-white/[.02] hover:border-violet-500/40"}`}>
                  <div className="flex items-center justify-between">
                    <span className="mono text-[8px] tracking-[.3em] uppercase text-gold-400">{d.tag}</span>
                    <span className="mono text-[9px] text-ink-faint">{fmtTime(d.duration)}</span>
                  </div>
                  <div className="font-display font-bold text-[15px] mt-1.5 text-ink group-hover:text-gold-200 transition-colors">{d.title}</div>
                  <div className="text-[10px] text-ink-dim mt-1 leading-4">{d.tagline}</div>
                  <div className="mt-2 flex items-center gap-1.5 mono text-[8px] text-violet-300 uppercase tracking-widest">{i === demoIdx ? <><span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse-soft" /> Analyzing…</> : <>Load analysis <ChevronRight size={10} /></>}</div>
                </button>
              ))}
              <button onClick={openDemo} className="btn-gold justify-center px-6 py-3.5 text-[13px] mt-1">Open full analysis <ArrowRight size={15} strokeWidth={2.8} /></button>
            </div>

            {/* Live analysis card */}
            <div className="lg:col-span-8 card rounded-3xl p-5 sm:p-7 overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-line pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" /><span className="w-3 h-3 rounded-full bg-[#febc2e]" /><span className="w-3 h-3 rounded-full bg-[#28c840]" />
                  <span className="mono text-[9px] text-ink-faint ml-2">echolens://engine/{DEMO_DEFS[demoIdx].id}</span>
                </div>
                <div className="flex items-center gap-2 mono text-[9px] text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" /> ENGINE ONLINE</div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={DEMO_DEFS[demoIdx].id} initial={{ opacity: 0, x: 34 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: .45 }}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center border border-line rounded-2xl py-6 bg-black/25">
                      <EmotionDonut data={showcase.emotions} size={168} stroke={20} centerTop={showcase.dominantEmotion} centerSub={`${Math.round(showcase.emotions[0].value)}% ledger weight`} />
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-4">
                        {showcase.emotions.slice(0, 4).map(e => (
                          <span key={e.label} className="flex items-center gap-1.5 mono text-[9px] text-ink-dim"><span className="w-2 h-2 rounded-sm" style={{ background: e.color }} />{e.label} {e.value}%</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-4">
                      {[
                        ["PACE", `${showcase.metrics.wpm} WPM`, showcase.metrics.wpmRating, Math.min(100, (showcase.metrics.wpm / 220) * 100), "#f5c518"],
                        ["CLARITY", `${showcase.metrics.clarity}%`, "Articulation", showcase.metrics.clarity, "#a78bfa"],
                        ["STABILITY", `${showcase.metrics.stability}%`, "Pace variance", showcase.metrics.stability, "#22d3ee"],
                        ["CONFIDENCE", `${showcase.metrics.confidence}%`, "Delivery assurance", showcase.metrics.confidence, "#ffd84d"],
                      ].map(([label, val, sub, pct, color]) => (
                        <div key={label as string}>
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="mono text-[8px] tracking-[.3em] text-ink-faint">{label as string}</span>
                            <span className="mono text-[10px] text-ink"><span className="font-bold" style={{ color: color as string }}>{val as string}</span> · <span className="text-ink-faint">{sub as string}</span></span>
                          </div>
                          <div className="h-2 rounded-full bg-white/[.06] overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}44, ${color})`, boxShadow: `0 0 12px ${color}88` }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.1, ease: "easeOut" }} /></div>
                        </div>
                      ))}
                      <div className="rounded-xl border border-line bg-white/[.02] p-3">
                        <div className="mono text-[8px] tracking-[.3em] text-ink-faint mb-1.5 uppercase">Energy contour</div>
                        <AreaChart data={showcase.energyCurve} height={56} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ SIGNATURE FEATURE ══════════════ */}
      <section className="relative py-20">
        <img src="/img/waves-wide.png" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-30" style={{ objectPosition: "50% 30%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#07050f 0%, rgba(7,5,15,.62) 30%, rgba(7,5,15,.62) 70%, #07050f 100%)" }} />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="eyebrow mb-4">The Signature Instrument</div>
            <h2 className="font-display text-4xl sm:text-6xl font-black leading-[1.02]">One recording.<br /><span className="gold-text italic">Eight emotional lives.</span></h2>
            <p className="mt-5 text-ink-dim text-[15px] leading-7">Other tools stamp a single emotion on an entire file. EchoLens binds <span className="text-ink">every transcript segment to its acoustic moment</span> — pace, energy, pauses and lexical tone — producing a continuous emotional cartography.</p>
          </div>

          {/* callout diagram */}
          <div className="mt-14 grid lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
              {[
                ["01", "Segment-locked scoring", "Each speech island gets its own 8-channel emotion vector — not a diluted global average."],
                ["02", "Trigram lexical fusion", "1,400-term sentiment lexicon with intensifier & negator handling, weighted per segment."],
              ].map(([n, t, d]) => (
                <div key={n} className="card card-hover rounded-2xl p-5 flex-1">
                  <div className="mono text-[10px] text-gold-500">{n}</div>
                  <div className="font-display font-bold text-lg mt-1">{t}</div>
                  <p className="text-[11px] text-ink-dim leading-5 mt-1.5">{d}</p>
                </div>
              ))}
            </div>

            <div className="lg:col-span-6 card-gold rounded-3xl p-6 sm:p-7 order-1 lg:order-2 relative overflow-hidden">
              <div className="mono text-[9px] tracking-[.35em] uppercase text-gold-300 text-center">Emotion × Pattern Timeline</div>
              <div className="mt-4 space-y-2">
                {[
                  { t: "0:00", emo: "Engaged", sent: 0.22, note: "Opens with a question — curiosity signature, pace 138 WPM" },
                  { t: "0:26", emo: "Calm", sent: 0.05, note: "Measured cadence — energy drops below baseline, 0.6s settling pause" },
                  { t: "0:48", emo: "Frustrated", sent: -0.41, note: "Energy spike 1.9× baseline + negative lexicon — the “evidence” section" },
                  { t: "1:12", emo: "Confident", sent: 0.58, note: "Pace locks to 146 WPM, certainty trigrams: “absolutely”, “undeniable”" },
                  { t: "1:41", emo: "Joyful", sent: 0.66, note: "Peak energy of the session + high-arousal positive cues" },
                ].map((row, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * .12, duration: .6 }} className="flex items-stretch gap-3 rounded-xl border border-gold-500/20 bg-black/35 overflow-hidden">
                    <div className="flex flex-col items-center justify-center w-14 shrink-0" style={{ background: i % 2 ? "rgba(139,92,246,.25)" : "rgba(245,197,24,.16)" }}>
                      <span className="mono text-[9px] text-ink">{row.t}</span>
                    </div>
                    <div className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="mono text-[9px] font-bold text-gold-300 uppercase tracking-widest">{row.emo}</span>
                        <span className="mono text-[8px] text-ink-faint">sentiment {row.sent >= 0 ? "+" : ""}{row.sent}</span>
                      </div>
                      <p className="text-[10px] text-ink-dim leading-4 mt-1">{row.note}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-4 order-3">
              {[
                ["03", "Acoustic priors", "Energy ratio, pace velocity and pause topology seed the model before a single word is read."],
                ["04", "Confidence calibration", "Every segment reports an honest 40–96% certainty — never a false promise of precision."],
              ].map(([n, t, d]) => (
                <div key={n} className="card card-hover rounded-2xl p-5 flex-1">
                  <div className="mono text-[10px] text-gold-500">{n}</div>
                  <div className="font-display font-bold text-lg mt-1">{t}</div>
                  <p className="text-[11px] text-ink-dim leading-5 mt-1.5">{d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-8"><Link to="/analyzer" className="btn-gold px-8 py-4 text-[14px]"><ScanLine size={18} /> See your own timeline <ArrowRight size={16} strokeWidth={2.8} /></Link></div>
        </div>
      </section>

      {/* ══════════════ CAPABILITIES ══════════════ */}
      <section className="relative py-20 bg-[#0b0817]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="eyebrow mb-3">The Instrument Panel</div>
          <h2 className="font-display text-4xl sm:text-5xl font-black max-w-2xl leading-[1.05]">Everything your <span className="gold-text italic">voice is doing</span> — measured.</h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Mic, title: "Transcription Engine", desc: "Live microphone or file upload. Word-level text with timestamps, ready to search, highlight and export.", stat: "98.2%", statLabel: "word accuracy on studio audio", tint: "#f5c518" },
              { icon: BrainCircuit, title: "Emotional Cue Mapping", desc: "Eight emotional channels — confident to low — scored per segment with calibrated certainty.", stat: "8", statLabel: "channels · duration-weighted", tint: "#a78bfa" },
              { icon: Gauge, title: "Pace & Pause Topology", desc: "Words per minute per island, micro-pause detection down to 380 ms, dead-air percentage.", stat: "380ms", statLabel: "minimum pause resolution", tint: "#22d3ee" },
              { icon: Search, title: "Transcript Search & Highlight", desc: "Instant full-text search with phrase highlighting, keyword extraction and lexical fingerprints.", stat: "14ms", statLabel: "average query latency", tint: "#ffd84d" },
              { icon: Waves, title: "Vocal Energy & Dynamics", desc: "RMS energy curves, dynamic range in dB, loudness dial and expressiveness scoring.", stat: "0–28dB", statLabel: "dynamic range resolution", tint: "#fb7185" },
              { icon: FileText, title: "Boardroom-Grade Reports", desc: "One-click premium report: scorecards, ledger tables, charts and a print-perfect PDF export.", stat: "1-click", statLabel: "to a print-ready dossier", tint: "#34d399" },
            ].map(({ icon: Icon, title, desc, stat, statLabel, tint }) => (
              <div key={title} className="card card-hover rounded-3xl p-6 group">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl grid place-items-center border border-line" style={{ background: `${tint}14`, boxShadow: `inset 0 0 18px ${tint}26` }}>
                    <Icon size={22} style={{ color: tint }} strokeWidth={1.8} />
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-black" style={{ color: tint }}>{stat}</div>
                    <div className="mono text-[8px] text-ink-faint uppercase tracking-wider max-w-[110px] ml-auto leading-3 mt-0.5">{statLabel}</div>
                  </div>
                </div>
                <div className="font-display font-bold text-xl mt-5 group-hover:text-gold-200 transition-colors">{title}</div>
                <p className="text-[12px] text-ink-dim leading-6 mt-1.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ NUMBERS ══════════════ */}
      <section className="relative py-16 border-y border-gold-500/15">
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(245,197,24,.06), rgba(124,58,237,.09), rgba(245,197,24,.06))" }} />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center">
          {[
            { to: 2.4, suffix: "M+", label: "Minutes of voice analyzed", decimals: 1 },
            { to: 98.2, suffix: "%", label: "Transcription fidelity", decimals: 1 },
            { to: 1400, suffix: "", label: "Weighted sentiment terms", decimals: 0 },
            { to: 9200, suffix: "+", label: "Speakers calibrated since 2024", decimals: 0 },
          ].map(s => (
            <div key={s.label}>
              <div className="font-display text-4xl sm:text-5xl font-black gold-text"><Counter to={s.to} suffix={s.suffix} decimals={s.decimals} /></div>
              <div className="mono text-[9px] tracking-[.22em] uppercase text-ink-dim mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ PIPELINE ══════════════ */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="eyebrow mb-3">Under the Gold Hood</div>
          <h2 className="font-display text-4xl sm:text-5xl font-black leading-[1.05]">From raw air <span className="violet-text italic">to emotional truth</span> —<br />in ninety seconds.</h2>
          <div className="mt-12 grid md:grid-cols-4 gap-4">
            {[
              { n: "01", icon: UploadCloud, title: "Ingest", desc: "Upload MP3, WAV, M4A, WebM or record live. 44.1 kHz mono downmix, de-noising profile applied.", chip: "Web Audio API" },
              { n: "02", icon: AudioLines, title: "Extract", desc: "Python DSP slices 46 ms frames: RMS energy, zero-crossing rate, silence topology, speech islands.", chip: "Python · NumPy" },
              { n: "03", icon: BrainCircuit, title: "Fuse", desc: "Whisper-class STT meets a 1,400-term sentiment lexicon. Intensifiers, negators and pacing priors combined.", chip: "STT + NLP" },
              { n: "04", icon: FileText, title: "Deliver", desc: "Segment-locked timeline, lexical fingerprint, scorecards and a boardroom PDF — straight to your report.", chip: "Live render" },
            ].map(({ n, icon: Icon, title, desc, chip }, i) => (
              <div key={n} className="relative">
                <div className="card rounded-3xl p-6 h-full">
                  <div className="flex items-center justify-between"><span className="font-display text-5xl font-black text-white/[.06]">{n}</span><Icon size={26} className="text-gold-400" strokeWidth={1.6} /></div>
                  <div className="font-display font-bold text-2xl mt-2">{title}</div>
                  <p className="text-[11px] text-ink-dim leading-5 mt-2">{desc}</p>
                  <div className="mono text-[8px] uppercase tracking-[.25em] text-violet-300 mt-4 inline-block rounded-full border border-violet-500/30 px-3 py-1">{chip}</div>
                </div>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-3 z-10"><ChevronRight className="text-gold-500" size={22} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section className="relative py-16 bg-[#0b0817] border-t border-line overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="eyebrow mb-8 text-center">Signals From The Field</div>
        </div>
        <div className="flex whitespace-nowrap animate-marquee w-max" style={{ animationDuration: "52s" }}>
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex">
              {[
                { q: "EchoLens caught three moments in my earnings call where the room turned. Our IR strategy changed after one report.", a: "Daniel V.", r: "CFO · Meridian Industrial" },
                { q: "The timeline is the magic. One number for the whole talk tells you nothing. Eight emotional lives tells you everything.", a: "Priya R.", r: "Head of Speech · Northwind Media" },
                { q: "I pause my podcast at every segment flagged 'Frustrated'. Listener retention is up 31% in two months.", a: "Marcus L.", r: "Host · The Long Game" },
                { q: "We use the pause topology metrics in negotiation training. 380 milliseconds of silence is now a skill, not a fear.", a: "Elena S.", r: "Principal · Vantage Negotiation" },
                { q: "As a researcher I appreciate the honesty — every score comes with a confidence interval. That is how you build trust.", a: "Dr. Hana B.", r: "Cognitive Scientist · TU Berlin" },
              ].map((t, i) => (
                <figure key={i} className="mx-3 w-[420px] shrink-0 card rounded-3xl p-6 whitespace-normal">
                  <Quote size={20} className="text-gold-500 mb-3" fill="currentColor" strokeWidth={0} />
                  <blockquote className="text-[12px] leading-6 text-ink-dim">“{t.q}”</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-violet-600 grid place-items-center text-[9px] font-black text-[#221500]">{t.a.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                    <div><div className="text-[11px] font-bold text-ink flex items-center gap-1">{t.a} <BadgeCheck size={11} className="text-gold-400" /></div><div className="mono text-[8px] text-ink-faint">{t.r}</div></div>
                  </figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ ETHICS + FAQ ══════════════ */}
      <section className="relative py-20 grid-bg">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="eyebrow mb-3">Honest Instrument</div>
            <h2 className="font-display text-4xl font-black leading-[1.06]">An estimate,<br /><span className="gold-text italic">honestly labeled.</span></h2>
            <p className="mt-5 text-[13px] text-ink-dim leading-7">Voice emotion detection is statistical inference — not mind reading. Every EchoLens score ships with a calibrated confidence interval, explicit methodology, and a promise: <span className="text-ink font-semibold">insights about your delivery, never verdicts about your character.</span></p>
            <ul className="mt-6 space-y-3">
              {["Charts, never pseudo-diagnoses — we score the signal, not the soul.", "No biometric fingerprinting, no cross-recording identity tracking.", "Audio processed in-session; nothing stored without your explicit save."].map(t => (
                <li key={t} className="flex items-start gap-2.5 text-[12px] text-ink-dim"><ShieldCheck size={15} className="text-emerald-400 shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <div className="eyebrow mb-4">Frequently Asked</div>
            <div className="divide-y divide-line border border-line rounded-3xl overflow-hidden bg-white/[.02]">
              {[
                ["How accurate is the emotion detection?", "Directional, not diagnostic. On calibrated studio speech our tone labels reach ~78% agreement with human annotators — which is why every segment carries a 43–96% confidence interval and why we say 'emotional cues', never 'emotional facts'."],
                ["What audio formats can I analyze?", "MP3, WAV, M4A, OGG, WebM and FLAC up to 25 MB, or a live microphone recording of any length. Files are decoded locally in your browser via the Web Audio API before analysis."],
                ["Does EchoLens store my recordings?", "No. Analysis runs in your session. Your transcript and metrics persist only in your private browser library — export a PDF or delete everything with one click, always."],
                ["Can it handle accents and multiple speakers?", "Transcription is accent-robust for 45+ English dialects. Multi-speaker diarization is on the 2026 roadmap; today, per-segment scoring remains your best lens on conversation flow."],
                ["Is this suitable for hiring or screening?", "No — and it never will be. EchoLens is a delivery-coaching instrument. Using voice analysis to profile candidates or surveil employees is a misuse we explicitly forbid in our charter."],
              ].map(([q, a], i) => (
                <div key={i}>
                  <button onClick={() => setFaq(faq === i ? null : i)} className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 hover:bg-white/[.03] transition-colors">
                    <span className="font-bold text-[13px] text-ink">{q}</span>
                    <ChevronDown size={17} className={`text-gold-400 shrink-0 transition-transform duration-300 ${faq === i ? "rotate-180" : ""}`} />
                  </button>
                  {faq === i && <div className="px-6 pb-5 -mt-1"><p className="text-[12px] leading-6 text-ink-dim max-w-2xl">{a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="relative py-28">
        <img src="/img/hero-portrait.png" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover object-[50%_20%] opacity-40" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(900px 500px at 50% 45%, rgba(124,58,237,.28), transparent), linear-gradient(180deg,#07050f, rgba(7,5,15,.35) 40%, #07050f)" }} />
        <div className="relative text-center px-6">
          <Equalizer bars={32} className="h-16 justify-center mx-auto mb-8 opacity-90" />
          <h2 className="font-display text-5xl sm:text-7xl font-black leading-[.98]">Your voice is<br />a <span className="gold-text italic">dataset.</span></h2>
          <p className="mt-6 text-ink-dim text-[15px] max-w-md mx-auto">Drop in ninety seconds of audio. Walk out with a dossier you have never seen about yourself.</p>
          <Link to="/analyzer" className="btn-gold px-9 py-5 text-base mt-9 inline-flex"><Mic size={20} /> Analyze Your First Voice <ArrowRight size={18} strokeWidth={2.8} /></Link>
          <div className="mono text-[8px] tracking-[.4em] uppercase text-ink-faint mt-8 flex items-center justify-center gap-2"><CheckCircle2 size={10} className="text-gold-500" /> Free during beta · No signup · Runs in your browser</div>
        </div>
      </section>
    </div>
  );
}
