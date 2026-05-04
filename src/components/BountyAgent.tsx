import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  DollarSign, 
  Cpu, 
  ExternalLink, 
  TrendingUp, 
  ShieldAlert,
  BrainCircuit,
  Wrench,
  Loader2,
  ChevronRight,
  Sparkles,
  Trophy,
  Lock,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Gift
} from 'lucide-react';
import { generateBounties, evaluateCodeSubmission } from '../services/geminiService';
import { BountyChallenge, BountyMatch } from '../types/bounty';
import { useAuth } from '../hooks/useAuth';
import { usePremium } from '../hooks/usePremium';

export function BountyAgent() {
  const { profile, user, updateProfile } = useAuth();
  const { isPremium } = usePremium();
  const [loading, setLoading] = useState(true);
  const [bountyData, setBountyData] = useState<BountyMatch | null>(null);
  const [selectedBounty, setSelectedBounty] = useState<BountyChallenge | null>(null);
  const [solvingBounty, setSolvingBounty] = useState<BountyChallenge | null>(null);
  const [submission, setSubmission] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const isBountyReady = true;
  const balance = profile?.balance || 0;
  const points = profile?.points || 0;

  const fetchBounties = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Clear cache for refresh if needed, but here we just call the service which has its own TTL
      const data = await generateBounties(profile);
      setBountyData(data);
    } catch (err) {
      console.error("Failed to fetch bounties", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, [user?.uid]); // Only re-fetch if user changes

  const handleAccept = (bounty: BountyChallenge) => {
    setSelectedBounty(null);
    setSolvingBounty(bounty);
    setFeedback(null);
    setSubmission('');
  };

  const handleSubmit = async () => {
    if (!solvingBounty || !submission.trim()) return;
    setIsSubmitting(true);
    try {
      const [result] = await Promise.all([
        evaluateCodeSubmission(solvingBounty.description, submission),
        new Promise(resolve => setTimeout(resolve, 5000))
      ]);
      setFeedback(result);
      
      if (result.isCorrect && user) {
        // Update profile with rewards
        await updateProfile({
          balance: balance + solvingBounty.prize,
          points: points + (solvingBounty.prize * 10),
          completedBountiesCount: (profile?.completedBountiesCount || 0) + 1
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeem = async (type: 'amazon' | 'flipkart') => {
    if (points < 5000) {
      alert("Insufficient points. 5,000 Neural Points required for redemption.");
      return;
    }
    
    if (confirm(`Redeem 5,000 points for a ₹500 ${type} gift card?`)) {
      await updateProfile({
        points: points - 5000
      });
      alert(`Redemption successful! Your ${type} gift card code will be sent to your verified email within 24 hours.`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <div className="text-center">
          <p className="text-xl font-display font-bold gradient-text">Neural Bounty Matcher Active</p>
          <p className="text-slate-400 text-sm">Analyzing GitHub Issue database & Global Bounty Nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-3xl flex flex-col justify-between border-blue-500/20">
          <div className="flex justify-between items-start mb-4">
             <DollarSign className="text-green-400" size={24} />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Earnings</span>
          </div>
          <p className="text-3xl font-black text-white italic tracking-tighter">${balance.toLocaleString()}</p>
        </div>
        <div className="glass p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
             <Trophy className="text-blue-500" size={24} />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Points</span>
          </div>
          <p className="text-3xl font-black text-white italic tracking-tighter">{points.toLocaleString()}</p>
        </div>
        <button 
          onClick={() => handleRedeem('amazon')}
          className="glass p-6 rounded-3xl transition-all hover:bg-white/5 hover:border-orange-500/30 group text-left"
        >
          <div className="flex justify-between items-center mb-2">
             <Gift className="text-orange-500" size={20} />
             <ArrowRight className="text-slate-600 group-hover:translate-x-1 transition-transform" size={16} />
          </div>
          <p className="text-xs font-black text-white uppercase tracking-widest">Amazon Card</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">5,000 Points = ₹500</p>
        </button>
        <button 
          onClick={() => handleRedeem('flipkart')}
          className="glass p-6 rounded-3xl transition-all hover:bg-white/5 hover:border-blue-500/30 group text-left"
        >
          <div className="flex justify-between items-center mb-2">
             <CreditCard className="text-blue-500" size={20} />
             <ArrowRight className="text-slate-600 group-hover:translate-x-1 transition-transform" size={16} />
          </div>
          <p className="text-xs font-black text-white uppercase tracking-widest">Flipkart Card</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">5,000 Points = ₹500</p>
        </button>
      </div>

      {/* Header Stat Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-[3rem] flex items-center justify-between overflow-hidden relative border-blue-500/10"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <BrainCircuit size={150} />
        </div>
        
        <div className="relative z-10 flex-1">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
            <Sparkles className="text-blue-500" size={32} />
            Work <span className="text-blue-500">&</span> Earn
          </h2>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed font-medium">
            {bountyData?.analysisReason || "Synthesizing high-value GitHub issues matched to your neural performance data."}
          </p>
          <button 
            onClick={() => fetchBounties()}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
          >
            <TrendingUp size={12} /> Refresh Neural Grid
          </button>
        </div>

        <div className="text-right">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black italic">Potential Node Yield</p>
          <p className="text-5xl font-black text-green-400 italic tracking-tighter">
            ${bountyData?.potentialEarnings?.toLocaleString() || '0'}
          </p>
        </div>
      </motion.div>

      {/* Bounty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {bountyData?.challenges.map((bounty, idx) => (
            <motion.div
              key={bounty.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`group p-8 rounded-[3rem] glass border transition-all hover:bg-white/[0.03] ${
                bounty.difficulty === 'Extreme' ? 'border-red-500/20 hover:border-red-500/40' : 'border-white/5 hover:border-blue-500/20'
              } flex flex-col h-[400px]`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                    bounty.source === 'GitHub' ? 'bg-white/5 text-white border border-white/10' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {bounty.source === 'GitHub' ? <Github size={12} /> : <Cpu size={12} />}
                    {bounty.source}
                  </div>
                  <div className="text-green-400 font-black italic flex items-center gap-1 text-xl tracking-tighter">
                    <DollarSign size={18} />
                    {bounty.prize.toLocaleString()}
                  </div>
                </div>

                <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-3 leading-tight group-hover:text-blue-400 transition-colors">{bounty.title}</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-3 mb-6">
                  {bounty.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {bounty.techStack.slice(0, 3).map(tech => (
                    <span key={tech} className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 italic">
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-2 mb-1">
                    <ShieldAlert size={12} /> Tech Complexity
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    "{bounty.complexityAnalysis}"
                  </p>
                </div>

                <button 
                  onClick={() => setSelectedBounty(bounty)}
                  className="w-full py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  View Mission <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedBounty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBounty(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative w-full max-w-2xl glass p-12 rounded-[4rem] border border-white/10 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                   <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                        MISSION #{selectedBounty.id}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        selectedBounty.difficulty === 'Extreme' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-white border-white/10'
                      }`}>
                        {selectedBounty.difficulty}
                      </span>
                   </div>
                   <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedBounty.title}</h2>
                </div>
                <div className="text-right">
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1 italic">Prize Yield</p>
                  <p className="text-4xl font-black text-green-400 italic tracking-tighter">${selectedBounty.prize.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <Wrench size={14} className="text-blue-500" /> Executive Briefing
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    {selectedBounty.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                    <h4 className="text-[10px] font-black text-slate-600 mb-2 uppercase tracking-widest">Source Origin</h4>
                    <p className="text-white font-black italic uppercase tracking-tight flex items-center gap-2">
                      {selectedBounty.source === 'GitHub' ? <Github size={16} /> : <Cpu size={16} />}
                      {selectedBounty.source}
                    </p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                    <h4 className="text-[10px] font-black text-slate-600 mb-2 uppercase tracking-widest">Global Status</h4>
                    <span className="flex items-center gap-2 text-blue-500 font-black italic uppercase tracking-tight">
                      <TrendingUp size={16} /> {selectedBounty.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  {selectedBounty.repoUrl && (
                    <a 
                      href={(() => {
                        let url = selectedBounty.repoUrl;
                        if (!url.startsWith('http')) url = `https://${url}`;
                        if (selectedBounty.issueNumber) {
                          url = `${url.replace(/\/$/, '')}/issues/${selectedBounty.issueNumber}`;
                        }
                        return url;
                      })()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 py-5 bg-white/5 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                    >
                      <Github size={18} />
                      View Issue {selectedBounty.issueNumber ? `#${selectedBounty.issueNumber}` : 'on GitHub'}
                    </a>
                  )}
                  <button 
                    onClick={() => handleAccept(selectedBounty)}
                    className="flex-1 py-5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all"
                  >
                    Accept Bounty <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Solving Phase UI */}
      <AnimatePresence>
        {solvingBounty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl glass p-12 rounded-[4rem] border border-white/10 overflow-hidden"
            >
               <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                 <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{solvingBounty.title}</h2>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Active Mission Node</p>
                 </div>
                 <button onClick={() => setSolvingBounty(null)} className="text-slate-600 hover:text-white uppercase text-[10px] font-black tracking-widest">Abort</button>
               </div>

               {!feedback ? (
                 <div className="space-y-8">
                   <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 italic text-sm text-slate-400">
                     "Provide your architectural solution or codebase patch for verification by the Neural Evaluator."
                   </div>

                   <textarea 
                     value={submission}
                     onChange={(e) => setSubmission(e.target.value)}
                     className="w-full h-64 bg-black/40 border border-white/10 rounded-3xl p-8 text-slate-300 font-mono text-sm focus:border-blue-500/50 outline-none transition-all"
                     placeholder="// Construct your neural solution here..."
                   />

                   <button 
                     disabled={isSubmitting || !submission.trim()}
                     onClick={handleSubmit}
                     className="w-full py-6 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.4em] rounded-3xl flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl shadow-blue-600/40"
                   >
                     {isSubmitting ? (
                       <div className="flex flex-col items-center justify-center gap-1">
                          <div className="flex items-center gap-2">
                            <span className="tracking-[0.4em]">Deep Analysis...</span>
                            <Loader2 className="w-5 h-5 animate-spin" />
                          </div>
                          <span className="text-[9px] text-blue-200/50 tracking-[0.2em] font-black uppercase">POWERED WITH GITHUB MODELS</span>
                        </div>
                     ) : (
                       <>Submit for Verification <CheckCircle2 className="w-5 h-5" /></>
                     )}
                   </button>
                 </div>
               ) : (
                 <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                 >
                    <div className={`p-10 rounded-[3rem] border flex items-center gap-8 ${feedback.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                       <div className={`w-20 h-20 rounded-full flex items-center justify-center ${feedback.isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-400'}`}>
                         {feedback.isCorrect ? <Trophy size={40} /> : <ShieldAlert size={40} />}
                       </div>
                       <div>
                          <h3 className={`text-4xl font-black italic uppercase tracking-tighter ${feedback.isCorrect ? 'text-green-500' : 'text-red-400'}`}>
                            {feedback.isCorrect ? 'Bounty Secured' : 'Node Rejection'}
                          </h3>
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Evaluation Feedback Matrixed</p>
                       </div>
                    </div>
                    
                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5">
                      <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{feedback.feedback}"</p>
                      {feedback.optimizedCode && (
                        <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-[10px] text-blue-400/80 overflow-x-auto">
                           {feedback.optimizedCode}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        if (feedback.isCorrect) setSolvingBounty(null);
                        setFeedback(null);
                      }}
                      className="w-full py-6 bg-white text-black font-black text-xs uppercase tracking-[0.4em] rounded-[2rem]"
                    >
                      {feedback.isCorrect ? 'Return to Grid' : 'Retry Synchronization'}
                    </button>
                 </motion.div>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

