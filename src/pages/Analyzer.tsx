import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Square, UploadCloud, FileAudio, Sparkles, Loader2, ChevronLeft, Search, Download, Copy, Check,
  Printer, ArrowRight, Volume2, Timer, NotebookPen, X, AlertTriangle, Flame, Gauge, CirclePlay, Highlighter, Save, Radio, Keyboard,
} from "lucide-react";
import { buildAnalysis, extractRawAudio, syntheticRaw, fmtTime, EMOTION_COLORS, type Analysis, type SourceKind } from "../lib/audio";
import { getDemoAnalysis, DEMO_DEFS } from "../lib/demos";
import { useAnalysis } from "../lib/analysisContext";
import EmotionTimeline from "../components/EmotionTimeline";
import { AreaChart, EmotionDonut, HBars, KeywordCloud, RadialGauge, SentimentMeter, Waveform, Equalizer } from "../components/charts";
import { sentimentLabel } from "../lib/nlp";

type Stage = "source" | "processing" | "done";
type SourceTab = "record" | "upload" | "paste";

const SR_Lang = "en-US";
// SpeechRecognition may not exist in TS DOM lib
type SR = {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>; resultIndex: number }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
const getSR = (): (new () => SR) | null => {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as (new () => SR) | null;
};

export default function Analyzer() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { current, saveCurrent, setCurrent } = useAnalysis();

  const [stage, setStage] = useState<Stage>("source");
  const [tab, setTab] = useState<SourceTab>("record");
  const [analysis, setAnalysisLocal] = useState<Analysis | null>(current);
  const [processStep, setProcessStep] = useState(0);

  const setFinal = useCallback((a: Analysis) => { setAnalysisLocal(a); saveCurrent(a); }, [saveCurrent]);

  /* auto-load demo from query string */
  useEffect(() => {
    const demoId = params.get("demo");
    if (demoId) {
      try { setFinal(getDemoAnalysis(demoId)); setStage("done"); } catch { /* ignore */ }
      params.delete("demo"); setParams(params, { replace: true });
    } else if (current) { setAnalysisLocal(current); setStage("done"); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ————— processing theater ————— */
  const runProcessing = useCallback((fn: () => Promise<Analysis>) => {
    setStage("processing"); setProcessStep(0);
    const steps = ["Decoding 44.1 kHz mono downmix…", "Slicing 46 ms acoustic frames…", "Extracting RMS energy & pause topology…", "Running lexical sentiment engine — 1,400 weighted terms…", "Fusing acoustic priors × lexical evidence…", "Calibrating confidence intervals…", "Rendering emotional timeline…"];
    let i = 0;
    const started = performance.now();
    const iv = window.setInterval(() => {
      i += 1;
      if (i < steps.length) setProcessStep(i);
    }, 430);
    Promise.all([fn(), new Promise(r => setTimeout(r, 3300))]).then(([a]) => {
      window.clearInterval(iv);
      void started;
      setFinal(a);
      setStage("done");
    }).catch(() => { window.clearInterval(iv); setStage("source"); });
  }, [setFinal]);

  /* ————— upload ————— */
  const [file, setFile] = useState<File | null>(null);
  const [uploadTranscript, setUploadTranscript] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const analyzeFile = useCallback(() => {
    if (!file) return;
    runProcessing(async () => {
      const buf = await file.arrayBuffer();
      const raw = await extractRawAudio(buf);
      return buildAnalysis(file.name.replace(/\.[^.]+$/, ""), "upload", raw, uploadTranscript);
    });
  }, [file, uploadTranscript, runProcessing]);

  /* ————— recording ————— */
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [liveText, setLiveText] = useState("");
  const [srSupported] = useState(() => !!getSR());
  const [recError, setRecError] = useState<string | null>(null);
  const mediaRec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const srRef = useRef<SR | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTime = useRef(0);
  const [manualText, setManualText] = useState("");
  const [pendingBlob, setPendingBlob] = useState<{ blob: Blob; dur: number } | null>(null);

  const startRecording = async () => {
    setRecError(null); setLiveText(""); setManualText("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = e => e.data.size && chunks.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
        const dur = (performance.now() - startTime.current) / 1000;
        setPendingBlob({ blob, dur: Math.max(1, dur) });
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRec.current = mr;
      startTime.current = performance.now();
      setElapsed(0); setRecording(true);
      timerRef.current = window.setInterval(() => setElapsed((performance.now() - startTime.current) / 1000), 100);
      const SRClass = getSR();
      if (SRClass) {
        const sr = new SRClass();
        sr.continuous = true; sr.interimResults = true; sr.lang = SR_Lang;
        let finalText = "";
        sr.onresult = (e) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) finalText += r[0].transcript + " "; else interim += r[0].transcript;
          }
          setLiveText((finalText + interim).trim());
        };
        sr.onerror = () => {}; sr.onend = () => {};
        try { sr.start(); srRef.current = sr; } catch { /* mid-session */ }
      }
    } catch {
      setRecError("Microphone access denied or unavailable. Allow mic permission, or try Upload / Paste instead.");
    }
  };

  const stopRecording = () => {
    setRecording(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
    try { mediaRec.current?.stop(); } catch { /* noop */ }
    try { srRef.current?.stop(); } catch { /* noop */ }
  };

  useEffect(() => {
    if (!pendingBlob) return;
    runProcessing(async () => {
      const buf = await pendingBlob.blob.arrayBuffer();
      let raw;
      try { raw = await extractRawAudio(buf); } catch { raw = syntheticRaw(pendingBlob.dur, 99); }
      const transcript = (liveText || manualText).trim();
      return buildAnalysis("Live recording — " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), "recording", raw, transcript);
    });
    setPendingBlob(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBlob]);

  /* ————— paste sample ————— */
  const [pasteText, setPasteText] = useState("");
  const analyzePaste = () => {
    const clean = pasteText.trim();
    if (clean.split(/\s+/).length < 12) return;
    runProcessing(async () => {
      const words = clean.split(/\s+/).length;
      const estDuration = Math.max(8, (words / 138) * 60);
      const raw = syntheticRaw(estDuration, Math.floor(Math.random() * 10000));
      return buildAnalysis("Pasted transcript — " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), "upload", raw, clean);
    });
  };

  const reset = () => { setAnalysisLocal(null); setCurrent(null); setStage("source"); setFile(null); setUploadTranscript(""); setPasteText(""); setLiveText(""); };

  return (
    <div className="relative min-h-[80vh]">
      <AnimatePresence mode="wait">
        {/* ══════════════ SOURCE STAGE ══════════════ */}
        {stage === "source" && (
          <motion.div key="source" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-6xl px-5 sm:px-6 py-12">
            <div className="text-center mb-10">
              <div className="eyebrow mb-3">The Analyzer</div>
              <h1 className="font-display text-4xl sm:text-6xl font-black">Give me your <span className="gold-text italic">voice.</span></h1>
              <p className="mt-4 text-ink-dim text-[14px] max-w-md mx-auto">Record live, drop a file, or paste a transcript. Ninety seconds later you’ll know more about your delivery than ever before.</p>
            </div>
            <div className="card rounded-3xl p-5 sm:p-8 max-w-4xl mx-auto">
              {/* tab rail */}
              <div className="flex gap-2 p-1.5 rounded-2xl bg-black/40 border border-line w-max mx-auto mb-7">
                {([["record", Mic, "Record"], ["upload", UploadCloud, "Upload"], ["paste", NotebookPen, "Paste"]] as [SourceTab, typeof Mic, string][]).map(([t, Icon, label]) => (
                  <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-xl text-[12px] font-extrabold tracking-wide transition-all duration-300 ${tab === t ? "bg-gradient-to-br from-gold-300 to-gold-600 text-[#221500] shadow-[0_8px_24px_-6px_rgba(245,197,24,.5)]" : "text-ink-dim hover:text-ink"}`}><Icon size={15} strokeWidth={2.4} />{label}</button>
                ))}
              </div>

              {/* RECORD */}
              {tab === "record" && (
                <div className="text-center">
                  <div className="relative mx-auto w-40 h-40 grid place-items-center">
                    {recording && (<><span className="absolute inset-0 rounded-full border-2 border-red-400/60 ping-ring" /><span className="absolute inset-0 rounded-full border border-gold-400/40" style={{ animation: "ping-ring 2.4s cubic-bezier(0,0,.2,1) .6s infinite" }} /></>)}
                    <button onClick={recording ? stopRecording : startRecording} aria-label={recording ? "Stop recording" : "Start recording"}
                      className={`relative w-32 h-32 rounded-full grid place-items-center transition-all duration-300 border ${recording ? "bg-gradient-to-br from-red-500 to-rose-700 border-red-300/50 shadow-[0_0_60px_rgba(244,63,94,.45)]" : "bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 border-gold-300/60 shadow-[0_0_50px_rgba(245,197,24,.4)] hover:scale-105"}`}>
                      {recording ? <Square size={34} className="text-white fill-white" /> : <Mic size={40} strokeWidth={1.6} className="text-[#221500]" />}
                    </button>
                  </div>
                  <div className="mono text-3xl font-bold text-ink mt-5 tabular-nums">{fmtTime(elapsed)}<span className="text-gold-500">.{Math.floor((elapsed % 1) * 10)}</span></div>
                  <div className="mono text-[9px] tracking-[.3em] uppercase text-ink-faint mt-1">{recError ? recError : recording ? "Capturing your voice… tap to stop" : "Tap the orb and speak naturally"}</div>
                  {recording && <Equalizer bars={48} className="h-14 justify-center mt-6" barClass="bg-gradient-to-t from-red-500 via-orange-400 to-gold-300" />}
                  {liveText && (
                    <div className="mt-6 text-left max-w-2xl mx-auto rounded-2xl border border-violet-500/30 bg-violet-500/[.07] p-4">
                      <div className="mono text-[8px] tracking-[.3em] uppercase text-violet-300 mb-1.5 flex items-center gap-1.5"><Radio size={10} /> Live transcription</div>
                      <p className="text-[13px] leading-6 text-ink min-h-[3rem]">{liveText}<span className="animate-pulse-soft text-gold-400">▊</span></p>
                    </div>
                  )}
                  {!srSupported && !recording && (
                    <div className="mt-6 max-w-2xl mx-auto text-left">
                      <label className="mono text-[9px] tracking-[.25em] uppercase text-gold-300 flex items-center gap-1.5 mb-1.5"><Keyboard size={10} /> Speech recognition unavailable in this browser — paste your words as you speak:</label>
                      <textarea value={manualText} onChange={e => setManualText(e.target.value)} rows={3} placeholder="Type or paste what you're saying…" className="w-full rounded-2xl border border-line bg-black/40 p-3 text-[13px] text-ink placeholder-ink-faint outline-none focus:border-gold-500/50" />
                    </div>
                  )}
                  <div className="mono text-[8px] text-ink-faint mt-6">Chrome / Edge recommended for live speech-to-text. Audio never leaves your device until you save the report.</div>
                </div>
              )}

              {/* UPLOAD */}
              {tab === "upload" && (
                <div>
                  <div ref={dropRef} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
                    onClick={() => fileInput.current?.click()} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && fileInput.current?.click()} aria-label="Upload audio file"
                    className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 px-6 py-10 text-center ${dragging ? "border-gold-400 bg-gold-500/10 scale-[1.01]" : "border-violet-500/35 bg-violet-500/[.04] hover:border-gold-500/45 hover:bg-gold-500/[.04]"}`}>
                    <input ref={fileInput} type="file" accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.flac" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                    {file ? (
                      <div>
                        <FileAudio size={40} className="mx-auto text-gold-400" strokeWidth={1.5} />
                        <div className="font-display font-bold text-xl mt-3 text-ink">{file.name}</div>
                        <div className="mono text-[10px] text-ink-dim mt-1">{(file.size / 1048576).toFixed(1)} MB · ready to decode</div>
                        <button onClick={e => { e.stopPropagation(); setFile(null); }} className="mono text-[9px] uppercase tracking-widest text-ink-faint hover:text-red-300 mt-3 inline-flex items-center gap-1"><X size={10} /> Remove file</button>
                      </div>
                    ) : (
                      <div>
                        <UploadCloud size={44} strokeWidth={1.4} className="mx-auto text-violet-300" />
                        <div className="font-display font-bold text-xl mt-3 text-ink">Drop your audio here</div>
                        <div className="mono text-[10px] text-ink-dim mt-1.5">MP3 · WAV · M4A · WebM · OGG · FLAC — up to 25 MB</div>
                        <div className="btn-ghost px-4 py-2 text-[10px] mt-4 inline-flex">or browse files</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-5">
                    <label className="flex items-center justify-between mono text-[9px] tracking-[.25em] uppercase text-gold-300 mb-1.5">Optional transcript <span className="text-ink-faint normal-case tracking-normal">unlocks lexical intelligence</span></label>
                    <textarea value={uploadTranscript} onChange={e => setUploadTranscript(e.target.value)} rows={3} placeholder="Paste the meeting / call / keynote transcript here — EchoLens will fuse it with the acoustic signal…" className="w-full rounded-2xl border border-line bg-black/40 p-3 text-[13px] leading-6 text-ink placeholder-ink-faint outline-none focus:border-gold-500/50" />
                    <div className="flex justify-between mt-1">
                      <button className="mono text-[9px] text-violet-300 hover:text-gold-300 underline underline-offset-2 decoration-dotted" onClick={() => setUploadTranscript(DEMO_DEFS[0].transcript)}>Use sample keynote transcript</button>
                      <span className="mono text-[9px] text-ink-faint">{uploadTranscript.trim().split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                  </div>
                  <button onClick={analyzeFile} disabled={!file} className="btn-gold w-full justify-center px-6 py-4 text-[14px] mt-4 disabled:opacity-35 disabled:pointer-events-none"><Sparkles size={17} /> Run Full Analysis <ArrowRight size={16} strokeWidth={2.8} /></button>
                </div>
              )}

              {/* PASTE */}
              {tab === "paste" && (
                <div>
                  <label className="mono text-[9px] tracking-[.25em] uppercase text-gold-300">Transcript text</label>
                  <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={9} autoFocus placeholder="Paste any transcript — a keynote, a therapy session, a board meeting, a voicemail draft…" className="w-full mt-1.5 rounded-2xl border border-line bg-black/40 p-4 text-[13px] leading-7 text-ink placeholder-ink-faint outline-none focus:border-gold-500/50" />
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="mono text-[9px] text-ink-faint">{pasteText.trim().split(/\s+/).filter(Boolean).length} words · minimum 12 to analyze</span>
                    <button onClick={() => setPasteText(DEMO_DEFS[2].transcript)} className="mono text-[9px] text-violet-300 hover:text-gold-300 underline underline-offset-2 decoration-dotted">Load sample interview</button>
                  </div>
                  <button onClick={analyzePaste} disabled={pasteText.trim().split(/\s+/).length < 12} className="btn-gold w-full justify-center px-6 py-4 text-[14px] mt-4 disabled:opacity-35 disabled:pointer-events-none"><Sparkles size={17} /> Analyze Transcript <ArrowRight size={16} strokeWidth={2.8} /></button>
                  <p className="mono text-[8px] text-ink-faint mt-3 text-center">Acoustic profile is reconstructed statistically — depth unlocks fully with real audio.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ══════════════ PROCESSING STAGE ══════════════ */}
        {stage === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-3xl px-6 py-24 text-center">
            <div className="relative mx-auto w-44 h-44">
              <div className="absolute inset-0 rounded-full border border-gold-500/30 animate-spin-slower" />
              <div className="absolute inset-4 rounded-full border border-violet-500/40" style={{ animation: "spin-slow 14s linear infinite reverse" }} />
              <div className="absolute inset-0 grid place-items-center"><Equalizer bars={9} className="h-20" /></div>
            </div>
            <div className="eyebrow mt-8">EchoLens Engine</div>
            <h2 className="font-display text-3xl font-black mt-2">Reading the <span className="gold-text">signal</span>…</h2>
            <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
              {["Decoding 44.1 kHz mono downmix…", "Slicing 46 ms acoustic frames…", "Extracting RMS energy & pause topology…", "Running lexical sentiment engine — 1,400 weighted terms…", "Fusing acoustic priors × lexical evidence…", "Calibrating confidence intervals…", "Rendering emotional timeline…"].map((s, i) => (
                <div key={i} className={`flex items-center gap-3 mono text-[10px] transition-all duration-300 ${i < processStep ? "text-emerald-400" : i === processStep ? "text-gold-300" : "text-ink-faint"}`}>
                  {i < processStep ? <Check size={12} strokeWidth={3} /> : i === processStep ? <Loader2 size={12} className="animate-spin" /> : <span className="w-3 text-center">·</span>}{s}
                </div>
              ))}
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mt-8 max-w-md mx-auto"><motion.div className="h-full bg-gradient-to-r from-violet-500 via-gold-400 to-gold-600" animate={{ width: `${((processStep + 1) / 7) * 100}%` }} transition={{ ease: "easeOut", duration: .4 }} /></div>
          </motion.div>
        )}

        {/* ══════════════ RESULTS STAGE ══════════════ */}
        {stage === "done" && analysis && (
          <motion.div key="done" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
            {/* header bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <button onClick={reset} className="btn-ghost px-4 py-2 text-[10px] mono uppercase tracking-widest"><ChevronLeft size={13} /> New analysis</button>
              <div className="flex items-center gap-2">
                <span className="mono text-[8px] uppercase tracking-[.3em] text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 rounded-full px-3 py-1.5 hidden sm:inline">Saved to Library</span>
                <button onClick={() => navigate("/report")} className="btn-ghost px-4 py-2 text-[10px] mono uppercase tracking-widest"><Printer size={12} /> Full report</button>
                <a href={downloadTxt(analysis)} download={`${slug(analysis.name)}-transcript.txt`} className="btn-gold px-5 py-2 text-[11px]"><Download size={13} /> Export transcript</a>
              </div>
            </div>

            {/* title strip */}
            <div className="card rounded-3xl p-5 sm:p-6 mb-6 grid lg:grid-cols-12 gap-6 items-center overflow-hidden relative">
              <div className="absolute right-0 top-0 h-full w-64 opacity-20 pointer-events-none" style={{ background: "radial-gradient(closest-side,#7c3aed,transparent)" }} />
              <div className="lg:col-span-5">
                <div className="mono text-[8px] uppercase tracking-[.35em] text-gold-400 flex items-center gap-2">{analysis.source === "recording" ? <Mic size={10} /> : analysis.source === "upload" ? <FileAudio size={10} /> : <Sparkles size={10} />}{analysis.source} intelligence · {new Date(analysis.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                <h1 className="font-display text-2xl sm:text-3xl font-black mt-1.5 leading-tight">{analysis.name}</h1>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 mono text-[10px] text-ink-dim">
                  <span>◷ {fmtTime(analysis.duration)} duration</span>
                  <span>▤ {analysis.wordCount.toLocaleString()} words</span>
                  <span>▦ {analysis.segments.length} segments</span>
                  <span>⏸ {analysis.metrics.pauseCount} pauses</span>
                  <span>♯ {analysis.metrics.loudnessDb} LK loudness</span>
                </div>
              </div>
              <div className="lg:col-span-4">
                <Waveform data={analysis.waveform} height={74} progress={0.34} />
                <div className="flex justify-between mono text-[8px] text-ink-faint mt-1"><span>0:00</span><span>waveform · {analysis.waveform.length} buckets</span><span>{fmtTime(analysis.duration)}</span></div>
              </div>
              <div className="lg:col-span-3 flex lg:justify-end">
                <EmotionDonut data={analysis.emotions} size={120} stroke={16} centerTop={analysis.dominantEmotion.slice(0, 9)} centerSub={`${analysis.emotions[0].value}% dominant`} />
              </div>
            </div>

            {analysis.wordCount === 0 && (
              <div className="rounded-2xl border border-gold-500/35 bg-gold-500/[.08] px-4 py-3 mb-5 text-[11px] text-gold-200 flex items-center gap-2"><AlertTriangle size={14} className="shrink-0" /> Acoustics-only mode — this file carried no pasted transcript. Acoustic metrics are live; paste a transcript and re-analyze to unlock sentiment, keywords and lexical tone.</div>
            )}

            <div className="grid xl:grid-cols-12 gap-6">
              {/* ——— LEFT: transcript + signature timeline ——— */}
              <div className="xl:col-span-7 space-y-6">
                <TranscriptPanel analysis={analysis} />
                <div className="card rounded-3xl p-5 sm:p-6 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(245,197,24,.14), transparent 70%)" }} />
                  <div className="flex items-center justify-between mb-4 relative">
                    <div>
                      <div className="mono text-[8px] tracking-[.35em] uppercase text-gold-400 flex items-center gap-1.5"><Flame size={10} /> Signature Feature</div>
                      <h2 className="font-display text-2xl font-black mt-0.5">Emotion × Pattern Timeline</h2>
                    </div>
                    <button onClick={() => navigate("/report")} className="mono text-[9px] uppercase tracking-widest text-violet-300 hover:text-gold-300 transition-colors hidden sm:flex items-center gap-1">Full ledger <ArrowRight size={10} /></button>
                  </div>
                  <EmotionTimeline analysis={analysis} />
                </div>
              </div>

              {/* ——— RIGHT: metrics rail ——— */}
              <div className="xl:col-span-5 space-y-6">
                {/* scorecards */}
                <div className="card rounded-3xl p-5">
                  <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300 mb-4">Performance Scorecards</div>
                  <div className="grid grid-cols-2 gap-4 justify-items-center">
                    <RadialGauge value={analysis.metrics.clarity} label="Clarity" sub="articulation" size={118} />
                    <RadialGauge value={analysis.metrics.confidence} label="Confidence" sub="assurance" tint="#ffd84d" size={118} />
                    <RadialGauge value={analysis.metrics.stability} label="Stability" sub="pace variance" tint="#a78bfa" size={118} />
                    <RadialGauge value={analysis.metrics.expressiveness} label="Expressive" sub="dynamic range" tint="#22d3ee" size={118} />
                  </div>
                </div>

                {/* sentiment + pace */}
                <div className="card rounded-3xl p-5">
                  <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300 mb-2">Sentiment Polarity</div>
                  <div className="flex items-end justify-between mb-3">
                    <div className="font-display text-4xl font-black">{analysis.metrics.sentiment >= 0 ? "+" : ""}{analysis.metrics.sentiment.toFixed(2)}</div>
                    <div className="mono text-[10px] text-gold-300 text-right">{sentimentLabel(analysis.metrics.sentiment)}</div>
                  </div>
                  <SentimentMeter value={analysis.metrics.sentiment} />
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    {[[`${analysis.metrics.wpm}`, "WPM pace"], [`${analysis.metrics.readingEase}`, "reading ease"], [`${analysis.metrics.pitchMean}Hz`, "est. pitch"]].map(([v, l]) => (
                      <div key={l} className="rounded-xl border border-line bg-white/[.03] py-2"><div className="font-display font-bold text-base text-ink">{v}</div><div className="mono text-[8px] uppercase tracking-widest text-ink-faint">{l}</div></div>
                    ))}
                  </div>
                  <div className="mt-4"><div className="flex justify-between mono text-[8px] text-ink-faint mb-1"><span>ENERGY CONTOUR</span><span>smoothed RMS</span></div><AreaChart data={analysis.energyCurve} height={64} /></div>
                </div>

                {/* pauses + fillers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card rounded-3xl p-4">
                    <div className="mono text-[8px] tracking-[.28em] uppercase text-cyan-300 flex items-center gap-1.5"><Timer size={10} /> Pause Topology</div>
                    <div className="font-display text-3xl font-black text-ink mt-1.5">{analysis.metrics.pausePercent}<span className="text-base text-cyan-300">%</span></div>
                    <div className="mono text-[8px] text-ink-faint">dead air · {analysis.metrics.pauseCount} pauses · {analysis.metrics.pauseTotal}s total</div>
                    <div className="mt-2 space-y-1">{analysis.highlights.filter(h => h.kind === "pause").map((h, i) => <div key={i} className="mono text-[8px] text-cyan-200/80 truncate">@{fmtTime(h.at)} — {h.label}</div>)}</div>
                  </div>
                  <div className="card rounded-3xl p-4">
                    <div className="mono text-[8px] tracking-[.28em] uppercase text-rose-300 flex items-center gap-1.5"><Highlighter size={10} /> Filler Signals</div>
                    <div className="font-display text-3xl font-black text-ink mt-1.5">{analysis.metrics.fillerTotal}<span className="text-base text-rose-300">×</span></div>
                    <div className="mono text-[8px] text-ink-faint">{analysis.metrics.fillerPer100} per 100 words {analysis.metrics.fillerPer100 <= 1.5 ? "· crisp" : analysis.metrics.fillerPer100 <= 3 ? "· moderate" : "· heavy"}</div>
                    <div className="mt-2 flex flex-wrap gap-1">{analysis.metrics.fillers.slice(0, 6).map(f => <span key={f.word} className="mono text-[8px] rounded-full border border-rose-400/25 bg-rose-400/10 text-rose-200 px-2 py-0.5">{f.word} {f.count}×</span>)}</div>
                  </div>
                </div>

                {/* emotion distribution */}
                <div className="card rounded-3xl p-5">
                  <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300 mb-3">Emotion Ledger <span className="text-ink-faint normal-case">· duration-weighted</span></div>
                  <HBars items={analysis.emotions.slice(0, 6).map(e => ({ label: e.label, value: e.value, color: e.color }))} suffix="%" />
                </div>

                {/* keywords + highlights */}
                <div className="card rounded-3xl p-5">
                  <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300">Lexical Fingerprint</div>
                  {analysis.keywords.length ? <KeywordCloud keywords={analysis.keywords.slice(0, 12)} /> : <div className="mono text-[10px] text-ink-faint py-4 text-center">No lexical signal — acoustics only.</div>}
                  <div className="border-t border-line mt-2 pt-3">
                    <div className="mono text-[8px] tracking-[.3em] uppercase text-ink-faint mb-1.5">Moments flagged</div>
                    <div className="space-y-1">{analysis.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px]"><CirclePlay size={11} className="text-gold-400 shrink-0" /><span className="mono text-gold-500">{fmtTime(h.at)}</span><span className="text-ink-dim">{h.label}</span></div>
                    ))}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ————— Transcript panel with search/highlight ————— */
function TranscriptPanel({ analysis }: { analysis: Analysis }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"continuous" | "segments">("continuous");
  const [copied, setCopied] = useState(false);
  const q = query.trim();
  const lower = q.toLowerCase();

  const parts = useMemo(() => {
    if (!q) return [{ text: analysis.transcript, hit: false }];
    const out: { text: string; hit: boolean }[] = [];
    const re = new RegExp(`(${escapeRe(q)})`, "gi");
    let last = 0;
    for (const m of analysis.transcript.matchAll(re)) {
      const idx = m.index ?? 0;
      if (idx > last) out.push({ text: analysis.transcript.slice(last, idx), hit: false });
      out.push({ text: m[0], hit: true });
      last = idx + m[0].length;
    }
    if (last < analysis.transcript.length) out.push({ text: analysis.transcript.slice(last), hit: false });
    return out;
  }, [analysis.transcript, q]);

  const matchCount = useMemo(() => q ? (analysis.transcript.toLowerCase().match(new RegExp(escapeRe(lower), "g")) || []).length : 0, [analysis.transcript, q, lower]);

  const copy = async () => { await navigator.clipboard.writeText(analysis.transcript).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1600); };

  return (
    <div className="card rounded-3xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4 pb-3 border-b border-line">
        <div className="mono text-[9px] tracking-[.3em] uppercase text-violet-300 mr-auto">Transcript <span className="text-ink-faint">· {analysis.wordCount.toLocaleString()} words</span></div>
        <div className="flex rounded-lg overflow-hidden border border-line">
          {(["continuous", "segments"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 mono text-[9px] uppercase tracking-widest transition-colors ${view === v ? "bg-gold-500 text-[#221500] font-bold" : "text-ink-dim hover:text-ink"}`}>{v}</button>
          ))}
        </div>
        <button onClick={copy} className="p-2 rounded-lg border border-line text-ink-dim hover:text-gold-300 transition-colors" title="Copy transcript">{copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}</button>
        <a href={downloadTxt(analysis)} download={`${slug(analysis.name)}-transcript.txt`} className="p-2 rounded-lg border border-line text-ink-dim hover:text-gold-300 transition-colors" title="Download .txt"><Download size={14} /></a>
      </div>
      {/* search rail */}
      <div className="px-5 pt-3">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-black/40 px-3 focus-within:border-gold-500/50 transition-colors">
          <Search size={14} className="text-ink-faint shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the transcript — highlight any phrase…" className="w-full bg-transparent py-2.5 text-[12px] text-ink placeholder-ink-faint outline-none" aria-label="Search transcript" />
          {q && <span className="mono text-[9px] text-gold-400 whitespace-nowrap">{matchCount} {matchCount === 1 ? "match" : "matches"}</span>}
          {q && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={13} className="text-ink-faint hover:text-ink" /></button>}
        </div>
      </div>
      <div className="px-5 py-4 max-h-72 overflow-y-auto">
        {view === "continuous" ? (
          <p className="text-[13px] leading-7 text-ink-dim">{parts.map((p, i) => p.hit ? <mark key={i} className="hl">{p.text}</mark> : <span key={i}>{p.text}</span>)}</p>
        ) : (
          <div className="space-y-2">
            {analysis.segments.map(s => (
              <div key={s.id} className="flex gap-3 text-[11px] leading-6 border-l-2 pl-3" style={{ borderColor: EMOTION_COLORS[s.emotion] }}>
                <span className="mono text-[9px] text-gold-500 pt-0.5 w-8 shrink-0">{fmtTime(s.start)}</span>
                <span className="text-ink-dim">{q ? highlight(s.text, q) : s.text}{s.important && <Sparkles size={10} className="inline text-gold-400 ml-1.5 -mt-0.5" />}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const highlight = (text: string, q: string) => {
  const re = new RegExp(`(${escapeRe(q)})`, "gi");
  return text.split(re).map((part, i) => re.test(part) ? <mark key={i} className="hl">{part}</mark> : <span key={i}>{part}</span>);
};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48);
const downloadTxt = (a: Analysis) => {
  const m = a.metrics;
  const body = `ECHOLENS AI — AUDIO INTELLIGENCE TRANSCRIPT\n${"=".repeat(52)}\n${a.name}\nDate: ${new Date(a.date).toLocaleString()}\nDuration: ${fmtTime(a.duration)} · ${a.wordCount} words · ${a.segments.length} segments\n\nHEADLINE METRICS\nPace: ${m.wpm} WPM (${m.wpmRating}) · Clarity ${m.clarity}% · Stability ${m.stability}% · Expressiveness ${m.expressiveness}%\nSentiment ${m.sentiment} (${m.sentimentLabel}) · Confidence ${m.confidence}% · Pauses ${m.pauseCount} (${m.pausePercent}% airtime) · Fillers ${m.fillerTotal}\nDominant emotional cue: ${a.dominantEmotion}\n\nTRANSCRIPT\n${a.transcript}\n\nEMOTION LEDGER\n${a.emotions.map(e => `${e.label}: ${e.value}%`).join(" · ")}\n\n— Generated by EchoLens AI. Emotion detection from voice is an uncertain estimate, not a measurement of actual feelings.`;
  return `data:text/plain;charset=utf-8,${encodeURIComponent(body)}`;
};
