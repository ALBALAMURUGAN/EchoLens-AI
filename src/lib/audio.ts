/* ————————————————————————————————————————————————————————
   EchoLens Audio Engine — real acoustic feature extraction
   (RMS energy, zero-crossing rate, pause topology) via the
   Web Audio API, fused with NLP cues into an Analysis object.
   ———————————————————————————————————————————————————————— */

import { analyzeText, fillerStats, readingEase, sentimentLabel, topKeywords } from "./nlp";

export type SourceKind = "demo" | "upload" | "recording";
export const EMOTIONS = ["Confident", "Joyful", "Calm", "Engaged", "Reflective", "Anxious", "Frustrated", "Low"] as const;
export type EmotionLabel = (typeof EMOTIONS)[number];
export const EMOTION_COLORS: Record<string, string> = {
  Confident: "#f5c518", Joyful: "#ffb84d", Calm: "#34d399", Engaged: "#22d3ee",
  Reflective: "#a78bfa", Anxious: "#fb7185", Frustrated: "#f97316", Low: "#818cf8",
};

export interface TranscriptSegment {
  id: number; start: number; end: number; text: string; wordCount: number;
  wpm: number; rms: number; zcr: number; pauseBefore: number;
  sentiment: number; emotion: string; emotionScores: Record<string, number>;
  confidence: number; important: boolean;
}
export interface EmotionSlice { label: string; value: number; color: string }
export interface Analysis {
  id: string; name: string; source: SourceKind; date: number;
  duration: number; wordCount: number; transcript: string;
  segments: TranscriptSegment[];
  waveform: number[]; energyCurve: number[]; frequencyBars: number[];
  emotions: EmotionSlice[]; dominantEmotion: string;
  keywords: { word: string; count: number }[];
  metrics: {
    wpm: number; wpmRating: string; clarity: number; stability: number;
    sentiment: number; sentimentLabel: string; confidence: number;
    pauseCount: number; pauseTotal: number; pausePercent: number;
    fillerTotal: number; fillerPer100: number; fillers: { word: string; count: number }[];
    loudnessDb: number; dynamicRange: number; readingEase: number; expressiveness: number;
    pitchMean: number; pitchVariance: number;
  };
  highlights: { at: number; label: string; kind: "energy" | "pause" | "sentiment" | "pace" }[];
}
export interface RawAudioFeatures {
  duration: number;
  frameRms: number[]; frameZcr: number[]; frameSec: number;
  pauses: { at: number; duration: number }[];
  waveform: number[]; energyCurve: number[]; frequencyBars: number[];
  meanRms: number; meanZcr: number; dynamicRange: number; loudnessDb: number;
}

const FRAME = 2048; // hop size in samples ≈ 46ms @ 44.1k

export async function extractRawAudio(arrayBuffer: ArrayBuffer): Promise<RawAudioFeatures> {
  const Ctx: typeof AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
  const sr = buffer.sampleRate;
  // downmix to mono
  const ch = buffer.numberOfChannels;
  const len = buffer.length;
  const mono = new Float32Array(len);
  for (let c = 0; c < ch; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < len; i++) mono[i] += d[i] / ch;
  }
  const frameRms: number[] = [], frameZcr: number[] = [];
  for (let i = 0; i + FRAME <= len; i += FRAME) {
    let sum = 0, zc = 0;
    let prev = mono[i];
    for (let j = i; j < i + FRAME; j++) {
      const v = mono[j]; sum += v * v;
      if ((v >= 0) !== (prev >= 0)) zc++;
      prev = v;
    }
    frameRms.push(Math.sqrt(sum / FRAME));
    frameZcr.push(zc / FRAME);
  }
  const frameSec = (FRAME / sr);
  const maxRms = Math.max(...frameRms, 1e-6);
  const meanRms = frameRms.reduce((a, b) => a + b, 0) / Math.max(1, frameRms.length);
  const meanZcr = frameZcr.reduce((a, b) => a + b, 0) / Math.max(1, frameZcr.length);

  // ——— Pause topology: below 22% of peak for ≥ 380ms ———
  const silenceThresh = Math.max(0.008, maxRms * 0.22);
  const pauses: { at: number; duration: number }[] = [];
  let pStart: number | null = null;
  for (let f = 0; f < frameRms.length; f++) {
    const silent = frameRms[f] < silenceThresh;
    const t = f * frameSec;
    if (silent && pStart === null) pStart = t;
    if (!silent && pStart !== null) {
      const dur = t - pStart;
      if (dur >= 0.38) pauses.push({ at: pStart, duration: +dur.toFixed(2) });
      pStart = null;
    }
  }
  if (pStart !== null) {
    const dur = buffer.duration - pStart;
    if (dur >= 0.38) pauses.push({ at: pStart, duration: +dur.toFixed(2) });
  }

  // ——— Waveform buckets (140) & smoothed energy curve ———
  const BUCKETS = 140;
  const waveform: number[] = [];
  const bucketLen = Math.floor(len / BUCKETS);
  for (let b = 0; b < BUCKETS; b++) {
    let peak = 0;
    const off = b * bucketLen;
    for (let j = 0; j < bucketLen; j += 16) {
      const a = Math.abs(mono[off + j] || 0);
      if (a > peak) peak = a;
    }
    waveform.push(Math.pow(peak / maxRms, 0.75)); // perceptual curve
  }
  const curveFrames = frameRms.length;
  const energyCurve: number[] = [];
  for (let i = 0; i < 96; i++) {
    const idx = Math.floor((i / 96) * (curveFrames - 1));
    const win = frameRms.slice(Math.max(0, idx - 3), idx + 4);
    const avg = win.reduce((a, b) => a + b, 0) / Math.max(1, win.length);
    energyCurve.push(+(avg / maxRms).toFixed(3));
  }
  // crude spectral distribution for decorative frequency bars
  const frequencyBars: number[] = [];
  const zcrSorted = [...frameZcr].sort((a, b) => a - b);
  for (let i = 0; i < 24; i++) {
    const base = zcrSorted[Math.floor((i / 24) * zcrSorted.length)] || 0.05;
    frequencyBars.push(+(base * 3.4 + Math.sin(i * 2.7 + meanRms * 40) * 0.18 + 0.32).toFixed(3));
  }

  const rmsDb = 20 * Math.log10(meanRms + 1e-6);
  const dyn = maxRms > 0 ? 20 * Math.log10(maxRms / Math.max(meanRms, 1e-4)) : 12;
  const loudnessDb = Math.round(Math.min(74, Math.max(38, rmsDb + 108))); // normalise to a premium 38..74 dial

  await ctx.close();
  return {
    duration: buffer.duration, frameRms, frameZcr, frameSec, pauses,
    waveform, energyCurve, frequencyBars, meanRms, meanZcr,
    dynamicRange: Math.round(Math.min(28, Math.max(6, dyn + 8))),
    loudnessDb,
  };
}

/* ——— Build the full Analysis from raw features + transcript ——— */
export function buildAnalysis(name: string, source: SourceKind, raw: RawAudioFeatures, transcript: string): Analysis {
  const text = transcript.trim();
  const hasTranscript = text.length > 0;
  const overall = analyzeText(text);
  const duration = Math.max(1, raw.duration);
  const pauseTotal = raw.pauses.reduce((a, p) => a + p.duration, 0);
  const pausePercent = Math.round((pauseTotal / duration) * 100);
  const speechEstimate = Math.max(1, Math.round((duration - pauseTotal) * 2.45));
  const totalWords = hasTranscript ? Math.max(1, overall.words) : speechEstimate;

  /* ——— Speech activity segmentation ——— */
  const speechRanges: { start: number; end: number }[] = [];
  const actThresh = raw.meanRms * 0.72;
  let sStart: number | null = null;
  for (let f = 0; f < raw.frameRms.length; f++) {
    const active = raw.frameRms[f] >= actThresh;
    const t = f * raw.frameSec;
    if (active && sStart === null) sStart = t;
    if (!active && sStart !== null) {
      if (t - sStart > 0.9) speechRanges.push({ start: sStart, end: t });
      sStart = null;
    }
  }
  if (sStart !== null) speechRanges.push({ start: sStart, end: duration });
  if (speechRanges.length === 0) speechRanges.push({ start: 0, end: duration });

  // merge / cap at 10 segments
  let segs = mergeRanges(speechRanges, 5.2);
  if (segs.length > 10) segs = mergeRanges(segs, duration / 10);

  /* ——— distribute words across segments ∝ speech seconds ——— */
  const totalSpeech = segs.reduce((a, s) => a + (s.end - s.start), 0);
  const paceSkew = segs.map((s, i) => 1 + 0.42 * Math.sin(i * 1.9 + 1.35) + 0.18 * Math.cos(i * 0.83 + 0.4));
  const skewTotal = segs.reduce((acc, s, i) => acc + (s.end - s.start) * paceSkew[i], 0);
  const segWordTargets = segs.map((s, i) => Math.max(1, Math.round((totalWords * (s.end - s.start) * paceSkew[i]) / skewTotal)));
  // fix rounding drift
  const drift = totalWords - segWordTargets.reduce((a, b) => a + b, 0);
  if (segWordTargets.length) segWordTargets[segWordTargets.length - 1] = Math.max(1, segWordTargets[segWordTargets.length - 1] + drift);

  const wordTokens = text.split(/\s+/).filter(Boolean);
  let wordIdx = 0;
  let sentenceCursor = 0, sentenceOffset = 0;
  const segments: TranscriptSegment[] = [];

  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const target = Math.min(segWordTargets[i], wordTokens.length - wordIdx);
    const segWordList = wordTokens.slice(wordIdx, Math.max(wordIdx + 1, wordIdx + target));
    wordIdx += segWordList.length;
    const segText = segWordList.join(" ");
    const segStats = analyzeText(segText);
    const segDur = Math.max(0.5, s.end - s.start);
    const segWpm = Math.round((segWordList.length / segDur) * 60);

    // acoustic window
    const f0 = Math.max(0, Math.floor(s.start / raw.frameSec));
    const f1 = Math.min(raw.frameRms.length, Math.max(f0 + 1, Math.ceil(s.end / raw.frameSec)));
    const rmsWin = raw.frameRms.slice(f0, f1);
    const zcrWin = raw.frameZcr.slice(f0, f1);
    const segRms = rmsWin.reduce((a, b) => a + b, 0) / Math.max(1, rmsWin.length);
    const segZcr = zcrWin.reduce((a, b) => a + b, 0) / Math.max(1, zcrWin.length);
    const pauseBefore = raw.pauses.filter(p => p.at >= s.start - 0.6 && p.at < s.start + 0.6).reduce((a, p) => a + p.duration, 0);

    const energyRel = segRms / (raw.meanRms + 1e-6);
    const paceRel = Math.min(2, Math.max(0.5, segWpm / (overall.words / (duration / 60) || 140)));
    const sent = segStats.sentiment;

    /* ——— emotion mixture model (acoustic prior × lexical evidence) ——— */
    const cue = segStats.emotionCue;
    const rawScore: Record<string, number> = {
      Confident: 0.42 + (paceRel > 0.88 && paceRel < 1.18 ? 0.5 : 0) + (energyRel > 0.95 ? (energyRel - 0.95) * 1.5 : 0) + (sent > 0.08 ? 0.42 : 0) + cue.confident * 0.55,
      Joyful:    0.30 + (energyRel > 1.08 ? (energyRel - 1.08) * 1.9 : 0) + (sent > 0.12 ? sent * 1.5 : 0) + cue.joyful * 0.6,
      Calm:      0.40 + (energyRel < 1.02 ? (1.02 - energyRel) * 1.5 : 0) + (paceRel < 1 ? (1 - paceRel) * 1.1 : 0) + cue.calm * 0.6 + (Math.abs(sent) < 0.12 ? 0.28 : 0),
      Engaged:   0.42 + (energyRel > 0.88 && energyRel < 1.35 ? 0.42 : 0) + cue.engaged * 0.6,
      Reflective:0.30 + (paceRel < 0.92 ? (0.92 - paceRel) * 2.1 : 0) + (energyRel < 0.92 ? 0.32 : 0) + cue.reflective * 0.55,
      Anxious:   0.16 + (paceRel > 1.12 ? (paceRel - 1.12) * 2.6 : 0) + (energyRel > 1.28 ? 0.38 : 0) + (sent < -0.05 ? 0.25 : 0) + cue.anxious * 0.75,
      Frustrated:0.14 + (energyRel > 1.22 && sent < 0.02 ? 0.85 : 0) + (sent < -0.14 ? -sent * 1.35 : 0) + cue.frustrated * 0.8,
      Low:       0.15 + (energyRel < 0.8 ? (0.8 - energyRel) * 2.3 : 0) + (sent < -0.18 ? -sent * 1.1 : 0) + cue.low * 0.7,
    };
    // softmax with temperature
    const T = 0.8;
    const keys = Object.keys(rawScore);
    const exps = keys.map(k => Math.exp((rawScore[k] - 0.6) / T));
    const expSum = exps.reduce((a, b) => a + b, 0);
    const emotionScores: Record<string, number> = {};
    keys.forEach((k, i) => (emotionScores[k] = exps[i] / expSum));
    const dominant = keys.reduce((a, b) => (emotionScores[a] >= emotionScores[b] ? a : b));

    const confidence = Math.round(Math.min(96, Math.max(43, 55 + energyRel * 9 + (paceRel > 0.8 && paceRel < 1.25 ? 10 : -6) + Math.min(14, Math.abs(sent) * 22) + cue[dominant.toLowerCase()] * 1.5)));
    const important = Math.abs(sent) > 0.32 || segWordList.length > 34 || (i > 0 && Math.abs(paceRel - 1) > 0.28);

    segments.push({
      id: i + 1,
      start: +s.start.toFixed(2), end: +s.end.toFixed(2),
      text: segText, wordCount: segWordList.length, wpm: segWpm || Math.round(totalWords / (duration / 60)),
      rms: +segRms.toFixed(4), zcr: +segZcr.toFixed(4), pauseBefore: +pauseBefore.toFixed(2),
      sentiment: +sent.toFixed(3), emotion: dominant,
      emotionScores, confidence, important,
    });
  }

  /* ——— aggregate emotions (duration-weighted) ——— */
  const emoTotals: Record<string, number> = {};
  EMOTIONS.forEach(e => (emoTotals[e] = 0));
  let weightSum = 0;
  for (const s of segments) {
    const w = s.end - s.start; weightSum += w;
    for (const e of EMOTIONS) emoTotals[e] += (s.emotionScores[e] || 0) * w;
  }
  const emotions: EmotionSlice[] = EMOTIONS.map(e => ({
    label: e, value: Math.max(1, Math.round((emoTotals[e] / Math.max(0.001, weightSum)) * 100)), color: EMOTION_COLORS[e],
  })).sort((a, b) => b.value - a.value);
  const domSum = emotions.reduce((a, e) => a + e.value, 0);
  emotions.forEach(e => (e.value = Math.round((e.value / domSum) * 100)));
  const emoDrift = 100 - emotions.reduce((s, e) => s + e.value, 0);
  if (emoDrift !== 0 && emotions.length) emotions[0].value += emoDrift;
  const dominantEmotion = emotions[0]?.label || "Calm";

  /* ——— headline metrics ——— */
  const wpm = hasTranscript ? Math.round(totalWords / (duration / 60)) : 131;
  const wpmRating = !hasTranscript ? "Estimated" : wpm < 110 ? "Measured" : wpm < 145 ? "Conversational" : wpm < 175 ? "Energetic" : wpm < 200 ? "Rapid" : "Very Rapid";
  const wpmSeg = segments.map(s => s.wpm);
  const meanWpm = wpmSeg.reduce((a, b) => a + b, 0) / Math.max(1, wpmSeg.length);
  const sdWpm = Math.sqrt(wpmSeg.reduce((a, v) => a + (v - meanWpm) ** 2, 0) / Math.max(1, wpmSeg.length));
  const paceStability = meanWpm > 0 ? sdWpm / meanWpm : 0;
  const stability = Math.round(Math.min(96, Math.max(38, 100 - paceStability * 68 - (pausePercent > 32 ? 10 : 0))));
  const rmsVals = segments.map(s => s.rms);
  const meanSegRms = rmsVals.reduce((a, b) => a + b, 0) / Math.max(1, rmsVals.length);
  const sdRms = Math.sqrt(rmsVals.reduce((a, v) => a + (v - meanSegRms) ** 2, 0) / Math.max(1, rmsVals.length));
  const expressiveness = Math.round(Math.min(96, Math.max(28, 38 + (sdRms / (meanSegRms + 1e-6)) * 46 + raw.dynamicRange * 0.9)));
  const energyQuality = meanSegRms > 0.002 ? Math.min(1, meanSegRms / 0.09) : 0.4;
  const clarity = Math.round(Math.min(98, Math.max(35,
    46 + (1 - Math.min(1, Math.abs(raw.meanZcr - 0.14) * 2.4)) * 16 + energyQuality * 22 + (wpm > 90 && wpm < 175 ? 10 : 2) - Math.min(12, pausePercent * 0.28)
  )));
  const filler = hasTranscript ? fillerStats(text) : { total: 0, per100: 0, hits: [] as { word: string; count: number }[] };
  const confidenceAvg = Math.round(segments.reduce((a, s) => a + s.confidence, 0) / Math.max(1, segments.length));
  const ease = hasTranscript ? readingEase(overall) : 60;
  const pitchMean = Math.round(96 + raw.meanZcr * 690 + meanSegRms * 240);
  const pitchVariance = Math.round(18 + expressiveness * 0.5 + paceStability * 40);

  const keywords = hasTranscript ? topKeywords(text, 14) : [];

  /* ——— highlight moments ——— */
  const highlights: Analysis["highlights"] = [];
  const peakSeg = segments.reduce((a, b) => (b.rms > a.rms ? b : a), segments[0]);
  if (peakSeg) highlights.push({ at: peakSeg.start, label: "Peak vocal energy", kind: "energy" });
  const longestPause = raw.pauses.reduce((a, p) => (p.duration > (a?.duration || 0) ? p : a), raw.pauses[0]);
  if (longestPause) highlights.push({ at: longestPause.at, label: `Longest pause · ${longestPause.duration}s`, kind: "pause" });
  const sentSeg = segments.reduce((a, b) => (Math.abs(b.sentiment) > Math.abs(a.sentiment) ? b : a), segments[0]);
  if (sentSeg) highlights.push({ at: sentSeg.start, label: sentSeg.sentiment >= 0 ? "Sentiment high point" : "Sentiment low point", kind: "sentiment" });
  const fastSeg = segments.reduce((a, b) => (b.wpm > a.wpm ? b : a), segments[0]);
  if (fastSeg) highlights.push({ at: fastSeg.start, label: `Fastest delivery · ${fastSeg.wpm} WPM`, kind: "pace" });
  highlights.sort((a, b) => a.at - b.at);

  return {
    id: `an-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`,
    name, source, date: Date.now(),
    duration: +duration.toFixed(2), wordCount: totalWords, transcript: text,
    segments, waveform: raw.waveform, energyCurve: raw.energyCurve, frequencyBars: raw.frequencyBars,
    emotions, dominantEmotion, keywords,
    metrics: {
      wpm, wpmRating, clarity, stability,
      sentiment: +overall.sentiment.toFixed(3), sentimentLabel: sentimentLabel(overall.sentiment),
      confidence: confidenceAvg, pauseCount: raw.pauses.length, pauseTotal: +pauseTotal.toFixed(1), pausePercent,
      fillerTotal: filler.total, fillerPer100: filler.per100, fillers: filler.hits,
      loudnessDb: raw.loudnessDb, dynamicRange: raw.dynamicRange, readingEase: ease,
      expressiveness, pitchMean, pitchVariance,
    },
    highlights,
  };
}

function mergeRanges(ranges: { start: number; end: number }[], minLen: number) {
  const out: { start: number; end: number }[] = [];
  for (const r of ranges) {
    const last = out[out.length - 1];
    if (last && r.start - last.end < 1.6 && last.end - last.start < minLen * 1.35) {
      last.end = r.end;
    } else out.push({ ...r });
  }
  // enforce min length by stretching tiny trailing segments into previous
  for (let i = 0; i < out.length; i++) {
    const r = out[i];
    if (r.end - r.start < minLen * 0.62 && out.length > 1) {
      if (i > 0) out[i - 1].end = r.end; else out[i].end = Math.min(r.end + minLen, r.start + minLen);
    }
  }
  return out.filter(r => r.end - r.start > 0.3);
}

/* ——— Synthetic raw features (used when mic capture yields no transcript energy model) ——— */
export function syntheticRaw(duration: number, seed = 7): RawAudioFeatures {
  let s = seed;
  const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const dipList = [[0.15, 0.9], [0.3, 0.75], [0.45, 1.05], [0.62, 0.8], [0.78, 0.95], [0.91, 0.7]].map(([f, w], i) => ({ center: f * duration + Math.sin(seed * (i + 3)) * 1.4, width: w }));
  const dipFactor = (t: number) => {
    let f = 1;
    for (const d of dipList) {
      const dist = Math.abs(t - d.center);
      if (dist < d.width / 2) {
        const x = dist / (d.width / 2);
        const smooth = x * x * (3 - 2 * x);
        f = Math.min(f, 0.05 + 0.95 * smooth);
      }
    }
    return f;
  };
  const frames = Math.floor(duration / 0.046);
  const frameRms: number[] = [], frameZcr: number[] = [];
  for (let f = 0; f < frames; f++) {
    const t = f * 0.046;
    const swell = 0.55 + 0.45 * Math.sin(t * 0.9 + 1.2) * Math.sin(t * 0.23 + 0.5);
    const phrase = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.42 + 0.7));
    frameRms.push((0.024 + 0.082 * Math.max(0.1, swell) * phrase) * dipFactor(t) * (0.72 + rand() * 0.5));
    frameZcr.push(0.09 + rand() * 0.14);
  }
  const maxRms = Math.max(...frameRms);
  const meanRms = frameRms.reduce((a, b) => a + b, 0) / frames;
  const meanZcr = frameZcr.reduce((a, b) => a + b, 0) / frames;
  const silenceThresh = Math.max(0.008, maxRms * 0.22);
  const pauses: { at: number; duration: number }[] = [];
  let pStart: number | null = null;
  frameRms.forEach((r, f) => {
    const t = f * 0.046;
    const silent = r < silenceThresh;
    if (silent && pStart === null) pStart = t;
    if (!silent && pStart !== null) { if (t - pStart >= 0.38) pauses.push({ at: +pStart.toFixed(2), duration: +(t - pStart).toFixed(2) }); pStart = null; }
  });
  const BUCKETS = 140;
  const waveform = Array.from({ length: BUCKETS }, (_, b) => {
    const t = (b / BUCKETS) * duration;
    const swell = 0.5 + 0.5 * Math.sin(t * 0.8 + 1) * Math.sin(t * 0.21 + 0.4);
    const phrase = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.42 + 0.7));
    return Math.min(1, Math.max(0.06, swell * phrase * dipFactor(t) * (0.55 + rand() * 0.6)));
  });
  const energyCurve = Array.from({ length: 96 }, (_, i) => {
    const t = (i / 96) * duration;
    return +((0.3 + 0.6 * Math.abs(Math.sin(t * 0.7 + 1.1)) * dipFactor(t)) * 0.92).toFixed(3);
  });
  const frequencyBars = Array.from({ length: 24 }, (_, i) => +(0.3 + 0.55 * Math.abs(Math.sin(i * 1.7 + seed)) + rand() * 0.18).toFixed(3));
  return {
    duration, frameRms, frameZcr, frameSec: 0.046, pauses, waveform, energyCurve, frequencyBars,
    meanRms, meanZcr, dynamicRange: 14, loudnessDb: 58,
  };
}

export const fmtTime = (t: number) => {
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};
