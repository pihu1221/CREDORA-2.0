import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, CheckCircle, Zap, Shield, Target, Users, 
  BookOpen, BrainCircuit, Lock, Play, ChevronRight,
  Database, Cpu, Globe, CreditCard, Landmark, Wallet, XCircle, Loader2, PlayCircle, HelpCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { usePremium } from "../hooks/usePremium";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext";
import { Logo } from "../components/Logo";

export function Home() {
  const { isPremium, upgradeToPremium } = usePremium();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);

  const handlePremiumClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/premium-lab' } });
    } else {
      navigate('/premium-lab');
    }
  };
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'debit'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const features = [
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Reverse Hiring System",
      description: "Stop applying, start being recruited. Companies match with you based on verified skill levels."
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Job Readiness Score",
      description: "Real-time updates on how prepared you are for specific roles in the current market."
    },
    {
      icon: <Globe className="w-6 h-6 text-green-500" />,
      title: "Global Talent Network",
      description: "Connect with industry leaders and mentors from top tech hubs across the globe."
    }
  ];

  const steps = [
    { title: "Create Profile", desc: "Build your AI-powered profile with your experience and interests." },
    { title: "Skill Validation", desc: "Take validated assessments to map your Skill DNA." },
    { title: "Get Matched", desc: "Our system matches you with roles where your skills are in high demand." },
    { title: "Career Acceleration", desc: "Access personalized mentorship and resources to keep growing." }
  ];

  return (
    <div className="overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="glow-blue top-[-10%] right-[-10%] opacity-30" />
      <div className="glow-indigo bottom-[-10%] left-[-10%] opacity-30" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 md:pt-40 md:pb-40 px-4 overflow-hidden will-change-transform">
        {/* Kinetic Neural Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none contain-strict">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] opacity-20">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent flex items-center justify-center">
                {Array.from({length: 20}).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.3, 0.1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 10 + i * 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute border border-blue-500/10 rounded-full"
                    style={{
                      width: `${20 + i * 8}%`,
                      height: `${20 + i * 8}%`,
                    }}
                  />
                ))}
             </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <Logo size="xl" showText={false} className="opacity-80" />
            </motion.div>
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </div>
              Neural Infrastructure v4.2 Stable
            </div>

            <div className="relative mb-12">
              <h1 className={`text-6xl md:text-[11vw] font-black leading-[0.85] tracking-[-0.04em] uppercase text-white ${theme === 'light' ? 'drop-shadow-[0_4px_20px_rgba(59,130,246,0.15)]' : 'drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]'}`}>
                CREDORA
              </h1>
              <div className="absolute -top-4 -right-12 text-[10px] font-black uppercase tracking-widest text-slate-700 hidden md:block">
                [ CREDORA CORE ]
              </div>
            </div>

            <p className="max-w-xl text-slate-400 text-lg md:text-xl mb-16 leading-relaxed font-medium">
              The first AI-orchestrated skill DNA platform. Beyond resumes. <br className="hidden md:block" />
              Verified neural nodes for the next generation of talent.
            </p>

            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/signup"}
                  className={`group relative px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all overflow-hidden active:scale-95 ${
                    theme === 'light' 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800' 
                    : 'bg-white text-black shadow-2xl shadow-white/5 hover:bg-blue-50'
                  }`}
                >
                  <div className="relative z-10 flex items-center gap-2">
                    {isAuthenticated ? "Enter Neural Lab" : "Initialize Sync"}
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Link>
                <Link to="/ai-test" className="px-12 py-5 rounded-[2rem] bg-slate-900/60 border border-white/10 text-white font-black uppercase tracking-widest text-[11px] hover:bg-white/5 transition-all backdrop-blur-xl active:scale-95">
                  Global Index Scan
                </Link>
              </div>

              <button
                onClick={handlePremiumClick}
                className="group relative flex items-center gap-4 px-10 py-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-600 hover:text-white transition-all shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:shadow-[0_0_40px_rgba(79,70,229,0.3)] overflow-hidden active:scale-95"
              >
                <div className="relative z-10 flex items-center gap-3">
                  <Shield className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {isPremium ? "Access Premium Lab" : "Unlock Premium Lab"}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            </div>
          </motion.div>

          {/* Founding Team - Advanced Layout */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-24 pt-12 border-t border-white/5 w-full flex flex-col items-center"
          >
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mb-8">Architectural Guardians</span>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { name: "Rohit Kumar", role: "Core Lead" },
                { name: "Om Mishra", role: "Logic" },
                { name: "Pihu Jaiswal", role: "Neural" },
                { name: "Narayani Dixit", role: "Design" },
                { name: "Mimansa Saini", role: "Systems" }
              ].map((m) => (
                <div key={m.name} className="flex flex-col items-center">
                  <span className="text-xs font-black text-white uppercase tracking-widest mb-1 italic">{m.name}</span>
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em]">{m.role}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advanced Stats Visualizer */}
      <section className="py-20 border-y border-white/5 bg-black/40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "Global Syncs", val: "1.4M", icon: Globe },
            { label: "Neural Nodes", val: "842k", icon: Cpu },
            { label: "Match Velocity", val: "0.2s", icon: Zap },
            { label: "Trust Index", val: "99.9", icon: Shield }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">{s.label}</span>
              <div className="text-4xl font-black text-white italic tracking-tighter mb-2">{s.val}</div>
              <div className="h-[1px] w-8 bg-blue-500/20" />
            </div>
          ))}
        </div>
      </section>


      {/* Interactive Demo Section - Validation Lab */}
      {/* Interactive Demo Section - Validation Lab (Premium Only) */}
      {isPremium && (
        <section className="py-24 px-4 relative overflow-hidden bg-black/40">
          <div className="glow-blue top-0 right-[-10%] opacity-10" />
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                Premium Engine
              </div>
              <h2 className="text-4xl md:text-6xl font-sans font-bold text-white tracking-tighter uppercase leading-none">Tactical <span className="text-blue-500">Validation</span> Lab</h2>
              <p className="mt-6 text-slate-500 max-w-xl mx-auto font-medium">Full access to AI models and behavioral analysis engines.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Test Card */}
                <div className={`backdrop-blur-md border rounded-[2.5rem] p-8 relative overflow-hidden group ${
                    theme === 'light' ? 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-slate-200/60' : 'bg-slate-900/60 border-white/10'
                }`}>
                  <div className="flex items-center gap-3 mb-10">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <BrainCircuit className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="font-bold text-white text-lg tracking-tight italic">AI BEHAVIORAL MAPPING</h4>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="h-40 bg-black/40 rounded-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                       <Database className="w-8 h-8 text-blue-500 animate-pulse" />
                       <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-4">Node Active: Multi-User Sync</span>
                    </div>
                    
                    <button className="btn-primary w-full py-4 text-[10px] font-black tracking-[0.2em] uppercase leading-none">
                      Run Neural Analysis
                    </button>
                    
                    <Link to="/learning" className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                      Deep Dive DNA <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Practice Area */}
                <div className={`backdrop-blur-md border rounded-[2.5rem] p-10 relative overflow-hidden lg:col-span-2 ${
                    theme === 'light' ? 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-slate-200/60' : 'bg-slate-900/60 border-white/10'
                }`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                    <div>
                      <h4 className="font-bold text-white text-xl tracking-tight mb-1 uppercase italic">Tactical Practice Area</h4>
                      <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">Verified Environment: Stable</p>
                    </div>
                    <div className="flex gap-2">
                       <span className="px-4 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-[9px] font-black border border-green-500/30 tracking-widest">ADVANCED</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-black/40 border border-white/5 min-h-[140px]">
                        <div className="flex items-center gap-2 text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                          <Zap className="w-3 h-3" /> Current Scenario
                        </div>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                          Optimization protocols for distributed nodes in a high-latency cluster...
                        </p>
                      </div>
                      <Link to="/learning" className="flex items-center gap-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-blue-500/20 pb-1 w-fit">
                        Explore Full Library
                      </Link>
                    </div>

                    <div className="flex flex-col justify-center items-center p-8 bg-black/20 rounded-3xl border border-white/5 border-dashed">
                       <Cpu className="w-12 h-12 text-slate-700 mb-4" />
                       <p className="text-[10px] font-bold text-slate-600 uppercase text-center tracking-[0.2em]">Hardware Acceleration Enabled for Practice Core</p>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Overview */}
      <section className="py-20 bg-black/50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Everything you need to accelerate your career, powered by cutting-edge AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass p-8 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-display font-bold mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-brand-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">How it Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">A seamless journey from skill identification to career placement.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-[2px] bg-gradient-to-r from-indigo-500/50 to-transparent z-0 -translate-x-12" />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-lg shadow-indigo-600/20">
                    {i + 1}
                  </div>
                  <h4 className="text-lg font-bold mb-2">{step.title}</h4>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8">Built for Both Sides of the <span className="text-indigo-500">Market</span></h2>
            <div className="space-y-6">
              <div className="glass p-6 rounded-2xl border-l-4 border-l-indigo-500">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" /> For Students
                </h4>
                <p className="text-gray-400 text-sm">Validate your skills, build an AI-enhanced resume, and get direct visibility to recruiters without the application fatigue.</p>
              </div>
              <div className="glass p-6 rounded-2xl border-l-4 border-l-purple-500">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" /> For Companies
                </h4>
                <p className="text-gray-400 text-sm">Reduce hiting time by 60% with pre-verified skill assessments and AI-matched candidate profiles.</p>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center">
             <div className="w-full max-w-md aspect-square bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-transparent rounded-full blur-3xl absolute -z-10" />
             <div className="glass rounded-[2rem] p-8 w-full border border-white/10">
                <div className="flex items-center justify-between mb-8">
                    <h5 className="font-bold">Skill DNA Analysis</h5>
                    <span className="text-xs text-indigo-400 uppercase tracking-widest font-semibold">Active Profile</span>
                </div>
                <div className="space-y-6">
                    {[
                        { label: 'Frontend Development', val: 92, color: 'bg-indigo-500' },
                        { label: 'UI/UX Design', val: 78, color: 'bg-purple-500' },
                        { label: 'Problem Solving', val: 85, color: 'bg-pink-500' },
                        { label: 'Cloud Architecture', val: 64, color: 'bg-blue-500' },
                    ].map((s, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-gray-400 uppercase font-bold">{s.label}</span>
                                <span className="text-white">{s.val}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${s.val}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className={`h-full ${s.color}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-indigo-900/5">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-center text-3xl md:text-5xl font-display font-bold mb-16">Trusted by Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: "John Smith", role: "Frontend Lead at Vercel", quote: "Credora's Neural DNA mapping identified exact gaps in my distributed systems knowledge. Landed my lead role in weeks." },
                    { name: "Sarah Chen", role: "Engineering Manager at Airbnb", quote: "We've stopped manual screening for senior devs. Credora's verified engineering nodes bring us battle-tested talent." },
                    { name: "Arun Kumar", role: "CS Student at IIT Delhi", quote: "The mentorship system for Software Engineers is incredible. Guidance from Netflix leads changed my project trajectory." }
                ].map((t, i) => (
                    <div key={i} className="glass p-8 rounded-2xl border border-white/5 italic">
                        <p className="text-gray-300 mb-6 leading-relaxed">"{t.quote}"</p>
                        <div className="flex items-center gap-4 not-italic">
                            <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center font-bold text-indigo-400">
                                {t.name[0]}
                            </div>
                            <div>
                                <h5 className="text-white text-sm font-bold">{t.name}</h5>
                                <p className="text-gray-500 text-xs">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto glass rounded-[3rem] p-12 text-center border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
            
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Ready to Accelerate Your Career?</h2>
            <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg">Join 10,000+ students and 500+ companies already building the future of talent on Credora.</p>
            <button
              onClick={handlePremiumClick}
              className="inline-flex bg-white text-black px-10 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs"
            >
              {isPremium ? 'Access Premium Lab' : 'Upgrade to Premium Lab'}
            </button>
        </div>
      </section>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && !isPremium && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 sm:p-12">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Upgrade to Premium</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Unlock 100% Talent Potential</p>
                  </div>
                  <button 
                    onClick={() => setShowPayment(false)}
                    className="p-2 rounded-full hover:bg-white/5 text-slate-500"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-10 p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40">
                         <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Premium Node Access</p>
                        <p className="text-xl font-black text-white">Full DNA Mapping</p>
                      </div>
                   </div>
                   <div className="text-2xl font-black text-white italic">$500</div>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Select Payment Method</div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'card', label: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> },
                      { id: 'debit', label: 'Debit Card', icon: <Wallet className="w-4 h-4" /> },
                      { id: 'bank', label: 'Net Banking', icon: <Landmark className="w-4 h-4" /> }
                    ].map((m) => (
                      <button 
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all
                          ${paymentMethod === m.id 
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/10' 
                            : 'bg-black/20 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                          }`}
                      >
                        {m.icon}
                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                   <input 
                     type="text" 
                     placeholder={paymentMethod === 'bank' ? 'Account Number / ID' : 'Card Number (XXXX XXXX XXXX XXXX)'}
                     className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                   />
                   <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                      />
                      <input 
                        type="password" 
                        placeholder="SECURE ID"
                        className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                      />
                   </div>
                </div>

                <button 
                  onClick={() => {
                    setIsProcessing(true);
                    setTimeout(() => {
                      upgradeToPremium();
                      setIsProcessing(false);
                      setShowPayment(false);
                    }, 2000);
                  }}
                  disabled={isProcessing}
                  className="w-full py-5 rounded-full bg-white text-black font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-white/10 hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> 
                      VALIDATING TRANSACTION...
                    </>
                  ) : (
                    <>BUY NOW & UNLOCK ALL</>
                  )}
                </button>

                <p className="text-[9px] text-center text-slate-600 mt-6 font-black uppercase tracking-[0.3em] leading-relaxed">
                  Secure tactical payment system • Encrypted Node Transaction
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
