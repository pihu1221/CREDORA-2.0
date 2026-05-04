import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ShieldCheck, Loader2, Github } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Logo } from "../components/Logo";

export function Signup() {
  const { signupWithEmail, loginWithGoogle, loginWithGithub } = useAuth();
  const [role, setRole] = useState<'student' | 'recruiter' | 'mentor'>('student');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRedirect = () => {
    if (role === 'student') navigate('/onboarding');
    else if (role === 'recruiter') navigate('/recruiter');
    else navigate('/mentorship');
  };

  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setError("");
    try {
      await signupWithEmail(email, password);
      // We could store the name elsewhere if needed, but for now just redirect
      handleRedirect();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsBusy(false);
    }
  };

  const onSocialSignup = async (provider: 'google' | 'github') => {
    setIsBusy(true);
    setError("");
    try {
      if (provider === 'google') await loginWithGoogle();
      else await loginWithGithub();
      handleRedirect();
    } catch (err: any) {
      setError(err.message || "Social registration failed");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="glow-indigo top-[-10%] left-[-10%] opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass p-10 rounded-[3rem] border border-white/10 shadow-2xl relative"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-10 group">
             <Logo size="lg" />
          </Link>
          <h2 className="text-3xl font-sans font-bold text-white mb-2 uppercase tracking-tighter italic">Join The Network</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">Initializing DNA Protocol</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-400 uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <div className="mb-10">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-4 text-center">Entity Role</p>
            <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                {(['student', 'recruiter', 'mentor'] as const).map(r => (
                    <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`flex-grow py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${role === r ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        {r}
                    </button>
                ))}
            </div>
        </div>

        <form className="space-y-4" onSubmit={handleManualSignup}>
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Name Index"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm tracking-tight"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="email" 
              placeholder="Primary Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm tracking-tight"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="password" 
              placeholder="Security Key"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm tracking-tight"
            />
          </div>

          <div className="flex items-start gap-4 py-4 px-2">
            <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 accent-blue-600" />
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
              Acceptance of <a href="#" className="text-blue-500">Security Protocols</a> and <br /><a href="#" className="text-blue-500">Data Usage Rights</a>.
            </p>
          </div>

          <button 
            type="submit"
            disabled={isBusy}
            className="btn-primary w-full py-5 text-xs font-black shadow-blue-600/10 uppercase tracking-[0.2em] group flex items-center justify-center gap-3"
          >
            {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Construct Profile"}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/5"></div>
          <span className="relative z-10 bg-brand-bg px-4 text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] left-1/2 -translate-x-1/2">Or Sync via Hub</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={() => onSocialSignup('google')}
             disabled={isBusy}
             className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
           >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4081ec" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-white">Google</span>
           </button>
           <button 
             onClick={() => onSocialSignup('github')}
             disabled={isBusy}
             className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
           >
              <Github className="w-4 h-4 text-slate-400 group-hover:text-white" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-white">Github</span>
           </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-2">Existing Entity?</p>
          <Link to="/login" className="text-white font-black text-xs hover:text-blue-400 transition-colors uppercase tracking-widest border-b border-white/10 pb-1">Bypass to Authentication</Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3 h-3 text-blue-500" /> Protocol Secure (SSL/TSL)
        </div>
      </motion.div>
    </div>
  );
}
