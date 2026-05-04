import { Link, useLocation } from "react-router-dom";
import { Rocket, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (!isHomePage) return null;

  return (
    <footer className="bg-brand-bg border-t border-white/5 pt-20 pb-10 px-4 mt-20 relative overflow-hidden transition-colors duration-300">
      <div className="glow-blue bottom-[-20%] right-[-10%] opacity-10" />
      
      <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-2">
              <Link to="/" className="inline-block mb-6 group">
                <Logo size="md" />
              </Link>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-8">
                The AI-powered engine for skill validation and career acceleration. Moving the world beyond the static resume.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'LinkedIn', 'GitHub', 'Discord'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-center text-slate-500 hover:text-blue-400 hover:border-blue-500/30 transition-all">
                    <span className="text-[10px] font-bold uppercase tracking-tight">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/features" className="text-slate-500 hover:text-blue-400 text-sm transition-colors">Skill DNA</Link></li>
                <li><Link to="/mentorship" className="text-slate-500 hover:text-blue-400 text-sm transition-colors">Tactical Mentors</Link></li>
                <li><Link to="/about" className="text-slate-500 hover:text-blue-400 text-sm transition-colors">Vision</Link></li>
                <li><Link to="/login" className="text-slate-500 hover:text-blue-400 text-sm transition-colors">Partner Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Founding Team</h4>
              <ul className="space-y-1">
                {['Rohit Kumar', 'Om Mishra', 'Pihu Jaiswal', 'Narayani Dixit', 'Mimansa Saini'].map(name => (
                  <li key={name} className="text-slate-500 text-[11px] font-medium py-1">{name}</li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Intelligence</h4>
              <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-500/10">
                  <p className="text-[10px] font-bold text-blue-500 uppercase mb-2 tracking-widest italic">Live Status</p>
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-300">Validation Engine Active</span>
                  </div>
              </div>
            </div>
          </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Credora Intelligence Labs. Africa & Global.
            </p>
            <p className="text-slate-700 text-[8px] font-medium uppercase tracking-[0.2em] max-w-lg">
              Educational content, assessments, and neural mapping are synthesized via Google Gemini LLM. Some structures inspired by industry leaders (Stripe, Notion, Duolingo). All technical problems are generated dynamically.
            </p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-slate-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors font-mono">EN | ES | HI | ZH | FR</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
