/* ——— EchoLens premium SVG chart kit ——— */
import { useId, useMemo } from "react";
import { motion } from "framer-motion";

const smoothPath = (pts: [number, number][]) => {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
};

/* ————————— Waveform bars (scrubbable) ————————— */
export function Waveform({ data, progress = 0, onScrub, height = 96 }: { data: number[]; progress?: number; onScrub?: (p: number) => void; height?: number }) {
  const id = useId().replace(/:/g, "");
  const n = data.length;
  const w = 100 / n;
  const handle = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onScrub) return;
    const r = e.currentTarget.getBoundingClientRect();
    onScrub(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
  };
  return (
    <div
      className={`relative flex items-center gap-[2px] w-full select-none ${onScrub ? "cursor-ew-resize" : ""}`}
      style={{ height }}
      onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); handle(e); }}
      onPointerMove={(e) => e.buttons === 1 && handle(e)}
      role={onScrub ? "slider" : undefined} aria-label="Seek" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}
    >
      {data.map((v, i) => {
        const played = i / n < progress;
        const bh = Math.max(6, v * 100);
        return (
          <div key={i} className="flex-1 flex items-center justify-center" style={{ height: "100%" }}>
            <div
              className="w-full rounded-full transition-colors duration-150"
              style={{
                height: `${bh}%`,
                background: played
                  ? `linear-gradient(180deg,#ffe889,#f5c518 55%,#b8860b)`
                  : "linear-gradient(180deg, rgba(167,139,250,.75), rgba(91,33,182,.65))",
                boxShadow: played ? "0 0 10px rgba(245,197,24,.4)" : "none",
              }}
            />
          </div>
        );
      })}
      {/* playhead */}
      <div className="absolute top-[-6px] bottom-[-6px] w-[2px] bg-gold-400 shadow-[0_0_12px_rgba(245,197,24,.9)] pointer-events-none" style={{ left: `calc(${progress * 100}% - 1px)` }}>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-gold-400" />
      </div>
      <span className="hidden">{id}</span>
    </div>
  );
}

/* ————————— Energy area curve ————————— */
export function AreaChart({ data, height = 150, stroke = "#f5c518", from = "#f5c518", to = "#7c3aed", className = "" }: { data: number[]; height?: number; stroke?: string; from?: string; to?: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const W = 1000, H = 100;
  const max = Math.max(...data, 0.001);
  const pts = data.map((v, i): [number, number] => [(i / (data.length - 1)) * W, H - 6 - (v / max) * (H - 16)]);
  const line = smoothPath(pts);
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={`w-full ${className}`} style={{ height }} role="img" aria-label="Energy curve">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} stopOpacity=".55" />
          <stop offset="55%" stopColor={to} stopOpacity=".18" />
          <stop offset="100%" stopColor={to} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 50, 75].map(y => <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="rgba(167,139,250,.12)" strokeDasharray="3 6" strokeWidth=".6" />)}
      <motion.path d={area} fill={`url(#g${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: .25 }} />
      <motion.path d={line} fill="none" stroke={stroke} strokeWidth="2.6" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: "easeOut" }} />
    </svg>
  );
}

/* ————————— Pace line chart ————————— */
export function PaceChart({ points, reference = 150, height = 190 }: { points: { t: number; wpm: number }[]; reference?: number; height?: number }) {
  const id = useId().replace(/:/g, "");
  const W = 1000, H = 100, pad = 8;
  const maxY = Math.max(220, ...points.map(p => p.wpm)) * 1.08;
  const pts: [number, number][] = points.map(p => [(p.t / Math.max(1, points[points.length - 1].t + 4)) * W, H - pad - (p.wpm / maxY) * (H - pad * 2)]);
  const yRef = H - pad - (reference / maxY) * (H - pad * 2);
  const line = smoothPath(pts);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label="Pace per segment">
      <defs>
        <linearGradient id={`pg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity=".4" /><stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* healthy band 120–170 */}
      <rect x="0" width={W} y={H - pad - (170 / maxY) * (H - pad * 2)} height={((170 - 120) / maxY) * (H - pad * 2)} fill="rgba(245,197,24,.07)" />
      <line x1="0" x2={W} y1={yRef} y2={yRef} stroke="#ffd84d" strokeWidth="1.4" strokeDasharray="6 6" opacity=".8" />
      <motion.path d={`${line} L ${W} ${H} L 0 ${H} Z`} fill={`url(#pg${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }} />
      <motion.path d={line} fill="none" stroke="#a78bfa" strokeWidth="2.4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4 }} />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.4" fill="#0e0a1d" stroke="#ffd84d" strokeWidth="2.2" />)}
    </svg>
  );
}

/* ————————— Emotion donut ————————— */
export function EmotionDonut({ data, size = 210, stroke = 22, centerTop, centerSub }: { data: { label: string; value: number; color: string }[]; size?: number; stroke?: number; centerTop?: string; centerSub?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  let offset = 25; // start at 12 o'clock
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(167,139,250,.09)" strokeWidth={stroke} />
        {data.map(seg => {
          const frac = seg.value / 100;
          const dash = Math.max(0.5, frac * c - 2.4);
          const el = (
            <motion.circle
              key={seg.label} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={seg.color} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={`${dash} ${c - dash}`}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -c * (offset / 100) }}
              transition={{ duration: .9, delay: .15 }}
              opacity={.92}
              style={{ filter: `drop-shadow(0 0 6px ${seg.color}55)` }}
            />
          );
          offset = (offset + seg.value) % 100;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="mono text-[9px] tracking-[.28em] text-ink-faint uppercase">Dominant</div>
          <div className="font-display text-2xl font-black gold-text leading-tight">{centerTop}</div>
          <div className="mono text-[10px] text-violet-300">{centerSub}</div>
        </div>
      </div>
    </div>
  );
}

/* ————————— Radial gauge ————————— */
export function RadialGauge({ value, label, sub, size = 132, tint = "#f5c518" }: { value: number; label: string; sub?: string; size?: number; tint?: string }) {
  const stroke = 11, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const frac = Math.min(100, Math.max(0, value)) / 100;
  const id = useId().replace(/:/g, "");
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <defs>
            <linearGradient id={`rg${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={tint} /><stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(167,139,250,.12)" strokeWidth={stroke} />
          <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#rg${id})`} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - frac * 0.75) }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }} style={{ filter: "drop-shadow(0 0 8px rgba(245,197,24,.35))" }}
            transform={`rotate(45 ${size / 2} ${size / 2})`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[1.65rem] leading-none font-black text-ink">{Math.round(value)}<span className="text-sm text-gold-400">%</span></span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-[11px] font-bold tracking-wide text-ink">{label}</div>
        {sub && <div className="mono text-[9px] text-ink-faint mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

/* ————————— Sentiment meter -1..1 ————————— */
export function SentimentMeter({ value }: { value: number }) {
  const pct = ((value + 1) / 2) * 100;
  return (
    <div className="w-full">
      <div className="relative h-3.5 rounded-full" style={{ background: "linear-gradient(90deg,#f97316 0%,#a78bfa 32%,#3b3554 50%,#a78bfa 68%,#f5c518 100%)" }}>
        <div className="absolute left-1/2 top-[-5px] bottom-[-5px] w-px bg-white/25" />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-gold-400 bg-[#17102b] shadow-[0_0_14px_rgba(245,197,24,.6)] grid place-items-center"
          animate={{ left: `${pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 16 }}
        >
          <div className="w-2 h-2 rounded-full bg-gold-400" />
        </motion.div>
      </div>
      <div className="flex justify-between mono text-[9px] text-ink-faint mt-2 uppercase tracking-widest">
        <span>Negative</span><span>Neutral</span><span>Positive</span>
      </div>
    </div>
  );
}

/* ————————— Keyword cloud ————————— */
export function KeywordCloud({ keywords }: { keywords: { word: string; count: number }[] }) {
  const max = Math.max(...keywords.map(k => k.count), 1);
  const palette = ["#ffd84d", "#a78bfa", "#ffe889", "#c4b5fd", "#f5c518", "#8b5cf6"];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center py-2">
      {keywords.map((k, i) => {
        const size = 13 + (k.count / max) * 22;
        return (
          <span key={k.word} title={`${k.count} occurrence${k.count > 1 ? "s" : ""}`}
            className="font-display font-bold leading-none transition-transform hover:scale-110 cursor-default"
            style={{ fontSize: size, color: palette[i % palette.length], opacity: 0.62 + (k.count / max) * 0.38 }}>
            {k.word}
          </span>
        );
      })}
    </div>
  );
}

/* ————————— Horizontal bars (emotion / fillers) ————————— */
export function HBars({ items, color = "#f5c518", suffix = "%", maxValue }: { items: { label: string; value: number; color?: string }[]; color?: string; suffix?: string; maxValue?: number }) {
  const max = maxValue ?? Math.max(...items.map(i => i.value), 1);
  return (
    <div className="space-y-2.5">
      {items.map(it => (
        <div key={it.label}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[11px] font-semibold text-ink-dim">{it.label}</span>
            <span className="mono text-[10px] text-gold-400">{it.value}{suffix}</span>
          </div>
          <div className="h-[7px] rounded-full bg-white/[.06] overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${it.color || color}66, ${it.color || color})`, boxShadow: `0 0 10px ${it.color || color}66` }}
              initial={{ width: 0 }} animate={{ width: `${(it.value / max) * 100}%` }} transition={{ duration: .9, ease: "easeOut" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ————————— Decorative equalizer ————————— */
export function Equalizer({ bars, className = "", barClass = "bg-gradient-to-t from-violet-600 via-violet-400 to-gold-400" }: { bars: number; className?: string; barClass?: string }) {
  const heights = useMemo(() => Array.from({ length: bars }, (_, i) => 30 + 70 * Math.abs(Math.sin(i * 1.7 + 0.8) * Math.cos(i * 0.6))), [bars]);
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden>
      {heights.map((h, i) => (
        <div key={i} className={`eq-bar w-[5px] rounded-sm ${barClass}`} style={{ height: `${h}%`, animationDelay: `${-(i * 0.13) % 1.2}s`, animationDuration: `${0.8 + (i % 5) * 0.11}s` }} />
      ))}
    </div>
  );
}

/* ————————— Sparkline ————————— */
export function Sparkline({ data, stroke = "#ffd84d", width = 120, height = 36 }: { data: number[]; stroke?: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i): [number, number] => [(i / (data.length - 1)) * width, height - 3 - ((v - min) / range) * (height - 6)]);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={smoothPath(pts)} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" opacity=".9" />
    </svg>
  );
}
