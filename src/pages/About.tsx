import { Link } from "react-router-dom";
import { Sparkles, Target, Users, FlaskConical, ArrowRight, Mail, MapPin, Linkedin, Github, Globe } from "lucide-react";
import { Equalizer } from "../components/charts";

const TEAM = [
  { name: "Dr. Elena Vasquez", role: "Founder & CEO", note: "Formerly speech lab, Stanford HAI. 40+ papers on paralinguistics.", initials: "EV", tint: "#f5c518" },
  { name: "Marcus Chen", role: "Head of ML", note: "Built acoustic fusion at a frontier voice lab; ex-Google Research.", initials: "MC", tint: "#a78bfa" },
  { name: "Dr. Priya Raman", role: "Principal NLP Scientist", note: "Architect of the HV++ lexicon and calibration layer.", initials: "PR", tint: "#22d3ee" },
  { name: "Jonas Whitmore", role: "Design Director", note: "Ten years crafting instruments for humans — from Bloomberg terminals to EchoLens.", initials: "JW", tint: "#fb7185" },
];

export default function About() {
  return (
    <div>
      {/* manifesto hero */}
      <section className="relative overflow-hidden border-b border-line">
        <img src="/img/hero-portrait.png" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover object-[68%_30%] opacity-35" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #07050f 8%, rgba(7,5,15,.82) 42%, transparent 75%), linear-gradient(180deg, transparent 60%, #07050f 100%)" }} />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 py-28">
          <div className="eyebrow mb-4">About EchoLens AI</div>
          <h1 className="font-display text-5xl sm:text-7xl font-black leading-[.98] max-w-3xl">The voice is the <span className="gold-text italic">last frontier</span> of data.</h1>
          <p className="mt-6 text-ink-dim text-[15px] leading-7 max-w-xl">Every generation conquers a new signal — text, then images, now speech. We believe the emotional subtext of a voice is the most valuable unstructured signal left in every company, classroom and clinic on Earth. EchoLens exists to read it honestly.</p>
          <Equalizer bars={24} className="h-10 mt-8 opacity-80" />
        </div>
      </section>

      {/* principles */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 py-16 grid md:grid-cols-3 gap-5">
        {[
          { icon: Target, title: "Precision over magic", body: "Every number EchoLens emits is traceable — to a frame, a token, a calibration curve. If we cannot explain a score, we will not show it.", tint: "#f5c518" },
          { icon: Users, title: "The speaker owns the signal", body: "Your voice is yours. Audio is processed per-session, archiving is explicit and per-user, and deletion is a right, not a support ticket.", tint: "#a78bfa" },
          { icon: FlaskConical, title: "Instruments, not oracles", body: "We build mirrors with confidence intervals — never verdict machines. The human stays in the interpretive loop, always.", tint: "#22d3ee" },
        ].map(({ icon: Icon, title, body, tint }) => (
          <div key={title} className="card card-hover rounded-3xl p-7">
            <div className="w-12 h-12 rounded-2xl grid place-items-center border border-line" style={{ background: `${tint}14` }}><Icon size={22} style={{ color: tint }} strokeWidth={1.7} /></div>
            <h3 className="font-display font-bold text-2xl mt-5">{title}</h3>
            <p className="text-[12px] text-ink-dim leading-6 mt-2">{body}</p>
          </div>
        ))}
      </section>

      {/* team */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 pb-16">
        <div className="eyebrow mb-2">The Lab</div>
        <h2 className="font-display text-3xl sm:text-4xl font-black mb-8">Built by people who <span className="violet-text italic">obsess over signals.</span></h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map(m => (
            <div key={m.name} className="card card-hover rounded-3xl p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl grid place-items-center font-display font-black text-2xl text-[#221500]" style={{ background: `linear-gradient(140deg, ${m.tint}, ${m.tint}77)`, boxShadow: `0 12px 34px -8px ${m.tint}66` }}>{m.initials}</div>
              <div className="font-display font-bold text-lg mt-4">{m.name}</div>
              <div className="mono text-[9px] uppercase tracking-[.25em] text-gold-400 mt-1">{m.role}</div>
              <p className="text-[11px] text-ink-dim leading-5 mt-3">{m.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* timeline */}
      <section className="border-t border-line bg-[#0b0817]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 py-16">
          <div className="eyebrow mb-6">The Road to EchoLens</div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              ["2021", "First notebook", "Dr. Vasquez plots RMS envelopes of her own keynotes at 3 a.m. The pause patterns are unmistakable — and invisible to her."],
              ["2023", "HV++ published", "The 1,400-term weighted emotional lexicon ships as open research. 4,000 stars in a week."],
              ["2025", "Fusion engine", "Acoustic priors × lexical posteriors reach production F1 ≥ 0.78. The Timeline is born."],
              ["2026", "EchoLens 2.4", "Live STT, pause topology v2, duration-weighted ledgers — and the world’s most honest voice instrument."],
            ].map(([y, t, d]) => (
              <div key={y} className="relative pl-6 border-l border-gold-500/30">
                <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gold-400 shadow-[0_0_10px_#f5c518]" />
                <div className="font-display text-3xl font-black gold-text">{y}</div>
                <div className="font-bold text-[13px] mt-1">{t}</div>
                <p className="text-[11px] text-ink-dim leading-5 mt-1.5">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* contact bar */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 py-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-lg">
          <div className="flex items-center gap-2 eyebrow mb-2"><Sparkles size={11} /> Work With The Lab</div>
          <h2 className="font-display text-3xl sm:text-4xl font-black leading-[1.05]">Have a voice problem<br /><span className="gold-text italic">worth solving?</span></h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 mono text-[10px] text-ink-dim">
            <span className="flex items-center gap-1.5"><Mail size={11} className="text-gold-400" /> lab@echolens.ai</span>
            <span className="flex items-center gap-1.5"><MapPin size={11} className="text-gold-400" /> Zürich · Remote-first</span>
            <a href="https://www.linkedin.com/company/echolens-ai" className="flex items-center gap-1.5 hover:text-gold-300"><Linkedin size={11} className="text-gold-400" /> LinkedIn</a>
            <a href="https://github.com/echolens-ai" className="flex items-center gap-1.5 hover:text-gold-300"><Github size={11} className="text-gold-400" /> GitHub</a>
            <a href="https://echolens.ai" className="flex items-center gap-1.5 hover:text-gold-300"><Globe size={11} className="text-gold-400" /> echolens.ai</a>
          </div>
        </div>
        <Link to="/analyzer" className="btn-gold px-8 py-4 text-[14px] shrink-0">Start with your voice <ArrowRight size={16} strokeWidth={2.8} /></Link>
      </section>
    </div>
  );
}
