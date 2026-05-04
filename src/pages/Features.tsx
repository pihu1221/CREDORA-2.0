import { motion } from "motion/react";
import { Zap, Shield, Target, MessageSquare, BarChart3, Rocket, FileText, Gamepad2 } from "lucide-react";

export function Features() {
  const featuresList = [
    {
      title: "AI Skill DNA Mapping",
      icon: <Target className="w-8 h-8" />,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      desc: "Our AI analyzes 10,000+ data points to create your unique skill fingerprint, identifying both hidden strengths and growth opportunities."
    },
    {
      title: "Reverse Hiring System",
      icon: <Zap className="w-8 h-8" />,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      desc: "Instead of applying to jobs, recruiters filter through Credora's verified talent pool and send you invitations to interview."
    },
    {
      title: "Job Readiness Score",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "text-green-500",
      bg: "bg-green-500/10",
      desc: "Get a real-time percentage score of your readiness for specific roles like 'Senior Frontend Lead' or 'Data Scientist'."
    },
    {
      title: "AI Resume Builder",
      icon: <FileText className="w-8 h-8" />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      desc: "Generate professional, ATS-optimized resumes that automatically highlight your verified Credora skills."
    },
    {
      title: "Mentorship System",
      icon: <MessageSquare className="w-8 h-8" />,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      desc: "Connect with industry leaders from FAANG and high-growth startups for 1-on-1 career guidance."
    },
    {
      title: "Gamification features",
      icon: <Gamepad2 className="w-8 h-8" />,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      desc: "Earn XP, badges, and unlock certifications as you complete skill assessments and project tracks."
    }
  ];

  return (
    <div className="pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="glow-blue top-0 right-0 opacity-20" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-sans font-bold text-white mb-6 tracking-tight"
          >
             Designed for <span className="text-blue-500 italic">Acceleration</span>
          </motion.h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Every feature on Credora is built to remove friction between learning a skill and getting hired for it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group overflow-hidden relative"
            >
              <div className={`w-16 h-16 ${f.bg} rounded-2xl flex items-center justify-center mb-8 bg-slate-900 border border-white/5 shadow-xl group-hover:bg-blue-600 transition-all`}>
                <div className="text-blue-500 group-hover:text-white transition-colors">{f.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Section: Skill DNA */}
        <section className="mt-32">
            <div className="bg-slate-900/40 rounded-[3rem] p-8 md:p-16 border border-white/5 overflow-hidden relative backdrop-blur-md">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-4 block">Core Engine</span>
                        <h2 className="text-4xl md:text-6xl font-sans font-bold mb-8 text-white tracking-tighter">AI Skill DNA Mapping</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed text-lg">
                            Our proprietary algorithm doesn't just look at keywords. It analyzes your approach to problem-solving, your coding style, and your adaptability through various assessments.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                "Behavioral Patterns",
                                "Technical Benchmarking",
                                "Trajectory Prediction",
                                "Soft Skill Quantization"
                            ].map(item => (
                                <div key={item} className="flex items-center gap-3 text-slate-300 bg-black/20 p-3 rounded-xl border border-white/5">
                                    <div className="w-6 h-6 rounded-lg bg-blue-600/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-tight">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <div className="w-72 h-72 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin-slow flex items-center justify-center">
                            <div className="w-56 h-56 rounded-full bg-blue-600/10 flex items-center justify-center">
                                <Target className="w-16 h-16 text-blue-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
