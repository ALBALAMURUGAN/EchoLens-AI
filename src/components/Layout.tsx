/* ——— App shell: premium navbar + footer + route outlet ——— */
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Mic, Library, Cpu, FileText, Info } from "lucide-react";
import { Equalizer } from "./charts";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group select-none" aria-label="EchoLens AI — home">
      <span className="relative grid place-items-center w-9 h-9">
        <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-400 via-gold-600 to-violet-700 opacity-90 blur-[10px] group-hover:opacity-100 transition-opacity" />
        <svg viewBox="0 0 64 64" className="relative w-9 h-9 drop-shadow-lg">
          <rect x="2" y="2" width="60" height="60" rx="15" fill="#0e0a1d" stroke="#f5c518" strokeWidth="3" strokeOpacity=".8" />
          <circle cx="32" cy="32" r="12.5" fill="none" stroke="#a78bfa" strokeWidth="4" strokeOpacity=".9" />
          <circle cx="32" cy="32" r="5" fill="#ffd84d" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="font-display font-black text-[1.28rem] text-ink tracking-tight">Echo<span className="gold-text">Lens</span></span>
          <span className="block mono text-[7.5px] tracking-[.42em] text-violet-300 uppercase mt-[3px]">Speech × Emotion Intelligence</span>
        </span>
      )}
    </Link>
  );
}

const NAV = [
  { to: "/analyzer", label: "Analyzer", icon: Mic },
  { to: "/library", label: "Library", icon: Library },
  { to: "/methodology", label: "Methodology", icon: Cpu },
  { to: "/report", label: "Report", icon: FileText },
  { to: "/about", label: "About", icon: Info },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="relative min-h-screen bg-void text-ink">
      {/* film grain + ambient aurora */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[46rem] h-[46rem] rounded-full opacity-25" style={{ background: "radial-gradient(circle, #5b21b6 0%, transparent 65%)" }} />
        <div className="absolute top-[30%] -right-48 w-[42rem] h-[42rem] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #d4a017 0%, transparent 62%)" }} />
        <div className="absolute bottom-[-20%] left-[28%] w-[50rem] h-[50rem] rounded-full opacity-[.16]" style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 60%)" }} />
      </div>

      {/* scroll progress */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-transparent print-hidden">
        <div ref={progressRef} className="h-full origin-left" style={{ background: "linear-gradient(90deg,#f5c518,#ffd84d,#a78bfa)", transform: "scaleX(0)" }} />
      </div>

      {/* ————— Navbar ————— */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 print-hidden ${scrolled ? "py-2" : "py-4"}`}>
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 transition-all duration-500 ${scrolled ? "" : ""}`}>
          <div className={`flex items-center justify-between rounded-2xl border px-4 sm:px-5 transition-all duration-500 ${scrolled ? "border-line bg-[#0e0a1d]/85 backdrop-blur-xl shadow-[0_18px_50px_-20px_rgba(0,0,0,.8)] py-2.5" : "border-transparent py-2"}`}>
            <Logo />
            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map(({ to, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) =>
                  `px-4 py-2 text-[12px] font-bold tracking-wide rounded-full transition-all duration-300 ${isActive ? "text-[#221500] bg-gradient-to-br from-gold-300 to-gold-500 shadow-[0_6px_20px_-6px_rgba(245,197,24,.55)]" : "text-ink-dim hover:text-gold-300"}`
                }>{label}</NavLink>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-3">
              <Equalizer bars={4} className="h-5 opacity-80" />
              <button onClick={() => navigate("/analyzer")} className="btn-gold px-5 py-2.5 text-[12px]">
                <Mic size={14} strokeWidth={2.6} /> Analyze a Voice
              </button>
            </div>
            <button className="lg:hidden p-2 text-ink" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">{open ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
          {/* mobile menu */}
          {open && (
            <div className="lg:hidden mt-2 glass rounded-2xl p-4">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${isActive ? "bg-gold-500/15 text-gold-300" : "text-ink-dim"}`}>
                  <Icon size={16} /> {label}
                </NavLink>
              ))}
              <button onClick={() => navigate("/analyzer")} className="btn-gold w-full justify-center mt-2 px-5 py-3 text-sm"><Mic size={16} /> Analyze a Voice</button>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 pt-[72px]">
        <Outlet />
      </main>

      {/* ————— Footer ————— */}
      <footer className="relative z-10 border-t border-line bg-[#0a0717]/90 print-hidden">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <Logo compact />
              <p className="mt-4 text-[11px] leading-5 text-ink-dim">Molten intelligence for the human voice — transcription, acoustic analysis and emotional cartography in one precision instrument.</p>
              <div className="mt-4 flex items-center gap-2 mono text-[8px] tracking-[.3em] uppercase text-ink-faint"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" /> All engines operational</div>
            </div>
            <div>
              <div className="mono text-[9px] tracking-[.3em] uppercase text-gold-400 mb-3">Product</div>
              <ul className="space-y-2 text-[11px] text-ink-dim">
                <li><Link to="/analyzer" className="hover:text-gold-300 transition-colors">Speech Analyzer</Link></li>
                <li><Link to="/report" className="hover:text-gold-300 transition-colors">Audio Reports</Link></li>
                <li><Link to="/methodology" className="hover:text-gold-300 transition-colors">How It Works</Link></li>
                <li><Link to="/library" className="hover:text-gold-300 transition-colors">My Library</Link></li>
              </ul>
            </div>
            <div>
              <div className="mono text-[9px] tracking-[.3em] uppercase text-gold-400 mb-3">Company</div>
              <ul className="space-y-2 text-[11px] text-ink-dim">
                <li><Link to="/about" className="hover:text-gold-300 transition-colors">About & Ethics</Link></li>
                <li><Link to="/methodology" className="hover:text-gold-300 transition-colors">Responsible AI</Link></li>
                <li><a href="mailto:lab@echolens.ai" className="hover:text-gold-300 transition-colors">lab@echolens.ai</a></li>
              </ul>
            </div>
            <div>
              <div className="mono text-[9px] tracking-[.3em] uppercase text-gold-400 mb-3">Stack</div>
              <ul className="space-y-1.5 text-[10px] mono text-ink-faint">
                <li>React 19 · TypeScript · Tailwind</li>
                <li>Node.js gateway · Python DSP</li>
                <li>Whisper-class STT · NLP lexicons</li>
                <li>PostgreSQL · Redis · Web Audio</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="mono text-[9px] text-ink-faint">© 2026 EchoLens AI Labs — All signals reserved.</p>
            <p className="text-[9px] text-ink-faint max-w-md text-center sm:text-right">Emotion detection from voice is an uncertain estimate, not a reliable measure of actual feelings.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
