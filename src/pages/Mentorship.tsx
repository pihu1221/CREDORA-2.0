import { motion, AnimatePresence } from "motion/react";
import { Search, Calendar, MessageCircle, Star, BadgeCheck, BookOpen, Sparkles, Loader2, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { CAREER_PATHS } from "../data/careerData";
import { matchMentors } from "../services/geminiService";

export function Mentorship() {
  const [selectedField, setSelectedField] = useState<string>('All');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{ mentorName: string, matchReason: string } | null>(null);
  
  const studentField = localStorage.getItem('student_career_field') || 'Engineer';
  const studentScore = parseInt(localStorage.getItem('student_onboarding_score') || '75');

  const mentors = [
    { name: "Rohit Kumar", role: "AI & Machine Learning", field: "Software Engineer", company: "Google", rating: 4.9, sessions: 120, img: "R" },
    { name: "Om Mishra", role: "Full Stack Engineering", field: "Software Engineer", company: "Netflix", rating: 4.8, sessions: 210, img: "O" }
  ];

  const filteredMentors = mentors.filter(m => selectedField === 'All' || m.field === selectedField);

  const handleAIMatch = async () => {
    setIsMatching(true);
    setMatchResult(null);
    try {
      const goals = `Become a high-performing ${studentField} specialist with focus on technical depth and leadership.`;
      const result = await matchMentors(studentField, studentScore, goals, mentors);
      if (result) {
        setMatchResult(result);
        // Auto-filter to the matched field if helpful
        const matchedMentor = mentors.find(m => m.name === result.mentorName);
        if (matchedMentor) setSelectedField(matchedMentor.field);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen relative overflow-hidden">
      <div className="glow-blue top-0 right-0 opacity-20" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
          <div>
            <h1 className="text-4xl md:text-7xl font-sans font-bold mb-4 text-white tracking-tighter uppercase">Expert <span className="text-blue-500">Mentorship</span></h1>
            <p className="text-slate-400 max-w-xl text-lg leading-relaxed font-medium">Learn from folks who've been there. 1-on-1 tactical sessions with world-class industry leaders.</p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
             <button 
               onClick={handleAIMatch}
               disabled={isMatching}
               className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
             >
                {isMatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:animate-pulse" />}
                Sync AI Selection
             </button>
             <div className="w-full md:w-96 relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
               <input 
                 type="text" 
                 placeholder="Skill, Company or Name..."
                 className="w-full bg-brand-bg/60 backdrop-blur-md border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm tracking-tight shadow-2xl"
               />
             </div>
          </div>
        </div>

        <AnimatePresence>
          {matchResult && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 48 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
               <div className="bg-blue-600/10 border-2 border-blue-600/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10 relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.1),transparent)] pointer-events-none" />
                  <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/40 shrink-0">
                     <Target className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Neural Recommendation Engine</span>
                     </div>
                     <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Top Sync: <span className="text-blue-500">{matchResult.mentorName}</span></h3>
                     <p className="text-slate-400 text-sm font-medium italic leading-relaxed max-w-3xl">"{matchResult.matchReason}"</p>
                  </div>
                  <button 
                    onClick={() => setMatchResult(null)}
                    className="px-6 py-2 rounded-xl border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                  >
                     Dismiss
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Field Category Pills */}
        <div className="flex flex-wrap gap-3 mb-12">
          {['All', 'Software Engineer'].map(field => (
            <button
              key={field}
              onClick={() => setSelectedField(field)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                selectedField === field 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {field}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMentors.map((mentor, i) => (
            <motion.div
              key={mentor.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden backdrop-blur-md"
            >
              <div className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-3xl text-blue-500 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                    {mentor.img}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl flex items-center gap-2 text-white mb-1 uppercase tracking-tight">
                      {mentor.name} <BadgeCheck className="w-4 h-4 text-blue-500" />
                    </h3>
                    <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">{mentor.role}</p>
                    <p className="text-slate-500 text-[11px] font-medium italic">@{mentor.company}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10 mb-6 px-4 py-5 bg-black/20 rounded-2xl border border-white/5">
                <div>
                   <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 tracking-widest">Sessions</p>
                   <p className="text-white font-bold text-sm">{mentor.sessions}+</p>
                </div>
                <div className="w-[1px] h-8 bg-white/5" />
                <div>
                   <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 tracking-widest">Rating</p>
                   <p className="text-blue-400 font-bold text-sm flex items-center gap-1">
                     <Star className="w-3 h-3 fill-current" /> {mentor.rating}
                   </p>
                </div>
              </div>

              <div className="mb-10 px-4">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 italic flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Specialization Focus
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {CAREER_PATHS[mentor.field]?.topics.slice(0, 2).map(t => (
                       <span key={t.id} className="px-3 py-1 rounded-lg bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-tighter border border-blue-500/10">
                          {t.title}
                       </span>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button className="btn-primary w-full py-4 text-xs font-bold leading-none shadow-blue-500/10 uppercase tracking-widest">
                  Book 1-on-1
                </button>
              </div>
              
              {/* Subtle hover detail */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        {/* Mentor Insight: New Student Profiles */}
        <section className="mt-24 space-y-8">
           <div className="flex justify-between items-end">
              <div>
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Daily Profile Pulse</h2>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">New high-potential talent syncing for mentorship logic.</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { name: "Vikram Seth", field: "Software Engineer", score: 92, status: "Seeking Mentor", level: "2nd Year" }
              ].map((student, i) => (
                <div key={i} className="glass p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:border-blue-500/30 transition-all flex flex-col justify-between group">
                   <div>
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {student.name[0]}
                         </div>
                         <span className="text-[8px] font-black px-2 py-1 bg-green-500/10 text-green-500 rounded-lg uppercase">NEW</span>
                      </div>
                      <h4 className="text-white font-bold tracking-tight mb-1">{student.name}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">{student.field}</p>
                      <p className="text-[8px] text-blue-400 font-black uppercase mt-2">{student.level}</p>
                   </div>
                   <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-xs font-black text-white italic">{student.score}%</span>
                      <button className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline">Draft Invite</button>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Featured Discussion Section */}
        <section className="mt-32">
            <div className="bg-slate-900/40 rounded-[3rem] p-8 md:p-16 border border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center backdrop-blur-md">
                <div className="order-2 lg:order-1 relative">
                    {/* Floating Glow */}
                    <div className="absolute -inset-10 bg-blue-500/10 blur-[80px] -z-10" />
                    <div className="space-y-6">
                        {[
                            { user: "Pihu Jaiswal", msg: "Hey guys, just launched the new Skill Gap analysis tool! Any feedback?", time: "2m", color: "bg-purple-500/20 text-purple-400" },
                            { user: "Alex Johnson", msg: "Wow, it clearly showed why I wasn't getting past the screen at Stripe. Fixed my AWS focus!", time: "Now", color: "bg-blue-500/20 text-blue-400" },
                            { user: "Narayani Dixit", msg: "That's exactly what we aimed for. Try the new interview prep track next.", time: "1m", color: "bg-pink-500/20 text-pink-400" }
                        ].map((chat, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i} 
                                className="bg-black/40 p-5 rounded-2xl border border-white/5 max-w-sm relative group hover:border-white/10 transition-colors"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${chat.color}`}>
                                        {chat.user}
                                    </div>
                                    <span className="text-slate-600 text-[10px] font-mono">{chat.time}</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">{chat.msg}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div className="order-1 lg:order-2">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6 leading-none">
                     Community Live
                   </div>
                   <h2 className="text-4xl md:text-6xl font-sans font-bold mb-8 text-white tracking-tighter uppercase leading-[1.1]">Tactical Feedback & <br /><span className="text-blue-500">Live Support</span></h2>
                   <p className="text-slate-400 mb-10 text-lg leading-relaxed">It takes a village to build a career. Get instant tactical feedback on your projects and strategy through our integrated chat system.</p>
                   <button className="btn-secondary w-full md:w-auto px-10 border-white/10 hover:bg-white hover:text-black">
                       Join the Circle
                   </button>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
