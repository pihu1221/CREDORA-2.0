import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, Clock, CheckCircle2, XCircle, AlertCircle, 
  ChevronRight, ChevronLeft, Award, BarChart3, 
  Zap, Brain, Loader2, Sparkles, BookOpen, Trophy
} from 'lucide-react';
import { generateDiagnosticTest } from '../services/geminiService';

interface Question {
  id: number;
  title: string;
  description: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
}

interface DiagnosticTestProps {
  onComplete: (results: any) => void;
  userName: string;
  field?: string;
}

export function DiagnosticTest({ onComplete, userName, field = 'Software Engineering' }: DiagnosticTestProps) {
  const [step, setStep] = useState<'intro' | 'testing' | 'analyzing' | 'results'>('intro');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<Record<number, number>>({});
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorLoad, setErrorLoad] = useState('');

  // Fallback static questions just in case API fails completely
  const fallbackQuestions: Question[] = [
    {
      id: 1,
      title: "Binary Search Implementation",
      description: "In a sorted array of size N, what is the best case time complexity of searching for an element?",
      options: ["O(N)", "O(log N)", "O(1)", "O(N log N)"],
      correctAnswer: 2,
      topic: "Searching",
      difficulty: "Medium",
      explanation: "The best case is when the middle element of the array is the target, which takes constant time O(1)."
    },
    {
      id: 2,
      title: "Lowest Common Ancestor",
      description: "Which algorithm is commonly used to find the LCA in a Binary Search Tree efficiently?",
      options: ["BFS", "Iterative Comparison", "Dijkstra", "Floyd Warshall"],
      correctAnswer: 1,
      topic: "Trees",
      difficulty: "Medium",
      explanation: "In a BST, we can simply compare the root value with the two node values to decide which subtree to search."
    },
    {
      id: 3,
      title: "Cycle Detection",
      description: "Which technique is optimal for detecting a cycle in a directed graph?",
      options: ["Kruskal's", "Prim's", "Tarjan's (DFS)", "Binary Lifting"],
      correctAnswer: 2,
      topic: "Graphs",
      difficulty: "Medium",
      explanation: "Tarjan's algorithm or simple DFS with recursive stack tracking can detect cycles in O(V+E)."
    },
    {
      id: 4,
      title: "Dynamic Programming: Knapsack",
      description: "In the 0/1 Knapsack problem, if we have N items and capacity W, what is the space complexity of the optimized DP approach?",
      options: ["O(N*W)", "O(N)", "O(W)", "O(N+W)"],
      correctAnswer: 2,
      topic: "DP",
      difficulty: "Medium",
      explanation: "By using only the previous row, we can reduce space complexity to O(W)."
    },
    {
      id: 5,
      title: "Sliding Window Maximum",
      description: "Which data structure is most efficient to maintain the maximum of elements in a sliding window?",
      options: ["Stack", "Deque", "Priority Queue", "Linked List"],
      correctAnswer: 1,
      topic: "Sliding Window",
      difficulty: "Medium",
      explanation: "A double-ended queue (Deque) allows us to maintain elements in a way that the front is always the max for the current window."
    }
  ];

  const loadQuestions = async () => {
    setIsLoading(true);
    setErrorLoad('');
    try {
      const qs = await generateDiagnosticTest(field, 10);
      if (qs && qs.length > 0) {
        setQuestions(qs);
      } else {
        setQuestions(fallbackQuestions);
      }
    } catch (e) {
      console.error(e);
      setQuestions(fallbackQuestions);
      setErrorLoad('API Error. Using fallback questions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [field]);

  const handleAnswer = (optionIndex: number) => {
    const now = Date.now();
    const timeSpent = (now - questionStartTime) / 1000;
    
    setTimeSpentPerQuestion(prev => ({
      ...prev,
      [currentQIndex]: (prev[currentQIndex] || 0) + timeSpent
    }));
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQIndex]: optionIndex
    }));

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setQuestionStartTime(Date.now());
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    setIsSynthesizing(true);
    setStep('analyzing');
    
    // Artificial delay for "AI Synthesis" vibe
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setStep('results');
    setIsSynthesizing(false);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswer) score += 1;
    });
    return score;
  };

  const getLeaderboardRank = (score: number) => {
    // Mocked rank calculation
    const baseRank = 5000;
    const len = questions.length || 10;
    const scaledScore = (score / len) * 30;
    const offset = Math.floor((30 - scaledScore) * 150);
    return Math.max(1, baseRank - (scaledScore * 120) + offset);
  };

  const getAverageTime = () => {
    const values = Object.values(timeSpentPerQuestion) as number[];
    const totalTime = values.reduce((a, b) => a + b, 0);
    return (totalTime / questions.length).toFixed(1);
  };

  const handleFinalSubmit = () => {
    const score = calculateScore();
    const results = {
      score,
      total: questions.length,
      averageTime: getAverageTime(),
      timeSpentPerQuestion,
      userAnswers,
      rank: getLeaderboardRank(score),
      topicAnalysis: questions.reduce((acc, q, i) => {
        const topic = q.topic;
        if (!acc[topic]) acc[topic] = { correct: 0, total: 0 };
        acc[topic].total += 1;
        if (userAnswers[i] === q.correctAnswer) acc[topic].correct += 1;
        return acc;
      }, {} as any)
    };
    onComplete(results);
  };

  if (step === 'intro') {
    return (
      <div className="fixed inset-0 z-[100] bg-brand-bg flex items-center justify-center p-4 transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="max-w-2xl w-full p-10 md:p-16 rounded-[4rem] bg-slate-900 border border-white/5 relative z-10 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-10">
             <Brain className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-6">Neural Diagnostic</h2>
          <p className="text-slate-400 text-lg font-medium italic mb-12 uppercase tracking-widest leading-relaxed">
            Welcome, {userName}. To initialize your professional profile, we must benchmark your core logic nodes. 
            {questions.length || 10} {field} challenges await.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mb-12 text-left">
             <div className="p-6 rounded-3xl bg-white/5 border border-white/5 relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center rounded-3xl backdrop-blur-sm z-10">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                )}
                <Target className="w-6 h-6 text-blue-500 mb-3" />
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Target</p>
                <p className="text-sm font-bold text-white">{questions.length || 10} Nodes</p>
             </div>
             <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                <Clock className="w-6 h-6 text-indigo-500 mb-3" />
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Complexity</p>
                <p className="text-sm font-bold text-white">Dynamic Scale</p>
             </div>
          </div>

          <button 
            disabled={isLoading || questions.length === 0}
            onClick={() => {
              setStep('testing');
              setQuestionStartTime(Date.now());
            }}
            className="w-full py-6 rounded-full bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
          >
            Initialize Uplink
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  }

  if (step === 'testing') {
    const q = questions[currentQIndex];
    const progress = ((currentQIndex + 1) / questions.length) * 100;

    return (
      <div className="fixed inset-0 z-[100] bg-brand-bg flex flex-col p-4 md:p-10 transition-colors duration-300">
        <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col pt-20">
           {/* Top Stats */}
           <div className="flex justify-between items-end mb-10">
              <div>
                 <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] italic mb-2">Node Verification {currentQIndex + 1}/{questions.length}</p>
                 <h3 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase">{q.topic || 'Logic'} Protocol</h3>
              </div>
              <div className="text-right">
                 <p className="text-slate-500 text-[8px] font-black uppercase mb-1">System Time</p>
                 <p className="text-xl font-mono text-white">{(Object.values(timeSpentPerQuestion) as number[]).reduce((a,b)=>a+b, 0).toFixed(0)}s</p>
              </div>
           </div>

           {/* Progress Bar */}
           <div className="w-full h-1 bg-white/5 rounded-full mb-16 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
              />
           </div>

           {/* Question Card */}
           <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-12">
                 <div className="p-8 md:p-16 rounded-[4rem] bg-slate-900 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                       <Zap className="w-32 h-32 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                       <h4 className="text-xl md:text-3xl font-bold text-white mb-12 leading-relaxed italic">{q.description}</h4>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, idx) => (
                             <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/50 hover:bg-blue-600/5 text-left transition-all relative overflow-hidden"
                             >
                                <div className="flex items-center gap-6">
                                   <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-slate-500 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">
                                      {String.fromCharCode(65 + idx)}
                                   </div>
                                   <span className="text-lg font-medium text-slate-200 group-hover:text-white transition-colors uppercase italic">{opt}</span>
                                </div>
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="fixed inset-0 z-[100] bg-brand-bg flex flex-col items-center justify-center p-10 transition-colors duration-300">
         <div className="relative">
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="w-48 h-48 rounded-full border-2 border-dashed border-blue-600/30"
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
         </div>
         <h3 className="mt-12 text-2xl font-black text-white italic tracking-widest uppercase animate-pulse">Synthesizing Neural Profile...</h3>
         <p className="mt-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Mapping DSA Load Variance • Analyzing Complexity Bias</p>
      </div>
    );
  }

  const score = calculateScore();
  const avgTime = getAverageTime();
  const rank = getLeaderboardRank(score);

  return (
    <div className="fixed inset-0 z-[100] bg-brand-bg overflow-y-auto transition-colors duration-300">
       <div className="max-w-6xl mx-auto px-4 md:px-10 py-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 border-b border-white/5 pb-12">
             <div>
                <div className="flex items-center gap-3 mb-4">
                   <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[8px] font-black text-green-500 uppercase tracking-widest">Verification Success</div>
                   <span className="text-slate-500 text-[10px] font-black uppercase italic tracking-widest">Node ID: SYNTH-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-tight">Diagnostic <span className="text-blue-500">Analysis</span></h2>
             </div>
             <button 
              onClick={handleFinalSubmit}
              className="px-10 py-5 rounded-full bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
             >
                Initialize Portfolio
             </button>
          </div>

          {/* Key Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
             {[
                { label: 'Neural Score', val: `${score}/${questions.length}`, sub: `${((score/(questions.length||1))*100).toFixed(0)}% Accuracy`, icon: <Zap className="text-yellow-400" /> },
                { label: 'Global Rank', val: `#${rank}`, sub: 'Estimated Position', icon: <Trophy className="text-blue-500" /> },
                { label: 'Avg Velocity', val: `${avgTime}s`, sub: 'Per Question', icon: <Clock className="text-indigo-500" /> },
                { label: 'Logic Tier', val: (score / (questions.length || 1)) > 0.8 ? 'Tier 1' : (score / (questions.length || 1)) > 0.5 ? 'Tier 2' : 'Tier 3', sub: 'Calculated Capability', icon: <Brain className="text-fuchsia-500" /> },
             ].map((stat, i) => (
                <div key={i} className="p-8 rounded-[3rem] bg-slate-900 border border-white/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      {React.cloneElement(stat.icon as any, { size: 32 })}
                   </div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">{stat.label}</p>
                   <p className="text-4xl font-black text-white italic tracking-tighter mb-2">{stat.val}</p>
                   <p className="text-[8px] font-black text-blue-500 uppercase">{stat.sub}</p>
                </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             {/* Mistake Review Area */}
             <div className="lg:col-span-8 space-y-8">
                <div className="p-10 rounded-[4rem] bg-slate-900 border border-white/5">
                   <div className="flex justify-between items-center mb-10">
                      <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Root Cause Review</h3>
                      <div className="flex gap-2">
                         <button 
                            onClick={() => setActiveReviewIndex(prev => Math.max(0, prev - 1))}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                         >
                            <ChevronLeft className="w-5 h-5" />
                         </button>
                         <button 
                            onClick={() => setActiveReviewIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                         >
                            <ChevronRight className="w-5 h-5" />
                         </button>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-500 uppercase">Mistake {activeReviewIndex + 1}</span>
                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${userAnswers[activeReviewIndex] === questions[activeReviewIndex].correctAnswer ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                               {userAnswers[activeReviewIndex] === questions[activeReviewIndex].correctAnswer ? 'Optimal' : 'Compromised'}
                            </div>
                         </div>
                         <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase">{timeSpentPerQuestion[activeReviewIndex]?.toFixed(1)}s</span>
                         </div>
                      </div>

                      <h4 className="text-2xl font-bold text-white italic leading-relaxed">{questions[activeReviewIndex].description}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {questions[activeReviewIndex].options.map((opt, i) => {
                            const isUserAnswer = userAnswers[activeReviewIndex] === i;
                            const isCorrect = questions[activeReviewIndex].correctAnswer === i;
                            
                            return (
                               <div 
                                  key={i} 
                                  className={`p-4 rounded-2xl border ${
                                     isCorrect ? 'bg-green-500/5 border-green-500/30 text-green-500' : 
                                     isUserAnswer ? 'bg-red-500/5 border-red-500/30 text-red-500' : 
                                     'bg-white/5 border-white/5 text-slate-400'
                                  } flex items-center justify-between`}
                               >
                                  <span className="text-xs font-bold uppercase italic">{opt}</span>
                                  {isCorrect && <CheckCircle2 className="w-4 h-4" />}
                                  {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4" />}
                               </div>
                            );
                         })}
                      </div>

                      <div className="mt-10 p-6 rounded-3xl bg-blue-600/5 border border-blue-600/10 backdrop-blur-3xl">
                         <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest italic">Logic Solution Protocol</h5>
                         </div>
                         <p className="text-sm text-slate-300 font-medium leading-relaxed italic">{questions[activeReviewIndex].explanation}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Topic Breakdown Sidebar */}
             <div className="lg:col-span-4 space-y-8">
                <div className="p-8 rounded-[3rem] bg-slate-900 border border-white/5">
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10 italic">Neural Shard Analysis</h3>
                   <div className="space-y-6">
                      {Object.entries<{correct: number, total: number}>(questions.reduce((acc, q, i) => {
                         const topic = q.topic;
                         if (!acc[topic]) acc[topic] = { correct: 0, total: 0 };
                         acc[topic].total += 1;
                         if (userAnswers[i] === q.correctAnswer) acc[topic].correct += 1;
                         return acc;
                      }, {} as any)).map(([topic, stats]) => {
                         const pct = (stats.correct / stats.total) * 100;
                         return (
                            <div key={topic}>
                               <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] font-black text-white uppercase italic">{topic}</span>
                                  <span className="text-[10px] font-bold text-slate-500">{pct.toFixed(0)}%</span>
                               </div>
                               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                     className={`h-full ${pct > 80 ? 'bg-green-500' : pct > 50 ? 'bg-blue-500' : 'bg-red-500'}`} 
                                     style={{ width: `${pct}%` }} 
                                  />
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>

                <div className="p-8 rounded-[3rem] bg-indigo-600/5 border border-indigo-500/10">
                   <div className="flex items-center gap-3 mb-6">
                      <Brain className="w-5 h-5 text-indigo-400" />
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">AI Evolution Guidance</h4>
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase italic leading-relaxed mb-8">
                      Based on your {avgTime}s response velocity, you excel at structural pattern matching but exhibit latency in dynamic state evaluation. Daily missions will focus on "Recursive Optimization" to reduce synaptic delay.
                   </p>
                   <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                         <span className="text-[9px] font-black text-white uppercase italic">Critical Topic</span>
                         <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 text-[8px] font-black uppercase">Graphs</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                         <span className="text-[9px] font-black text-white uppercase italic">Optimal Node</span>
                         <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-[8px] font-black uppercase">Searching</span>
                      </div>
                   </div>
                   <div className="mt-8">
                      <button 
                         onClick={handleFinalSubmit}
                         className="w-full py-5 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                      >
                         Acknowledge & Proceed
                      </button>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
