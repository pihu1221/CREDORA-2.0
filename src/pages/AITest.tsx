/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BrainCircuit, Trophy, CheckCircle2, 
  XCircle, ChevronRight, Play, Loader2, Sparkles,
  Target, BarChart3, Clock, Lock, ShieldCheck, Search,
  ChevronDown, Check, MousePointer2, Plus, Terminal, Code2, AlertTriangle, Info, BookOpen, RotateCcw,
  Maximize2, Minimize2, ArrowRight
} from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { generateTest, generateCodingChallenges, evaluateCodeSubmission } from '../services/geminiService';
import { usePremium } from '../hooks/usePremium';
import { useTheme } from '../contexts/ThemeContext';
import { CAREER_PATHS } from '../data/careerData';
import { dataService } from '../services/dataService';
import { useAuth } from '../hooks/useAuth';

interface Question {
  id: string;
  text: string;
  codeSnippet?: string | null;
  options: string[];
  correctAnswer: string;
  solutionAnalysis?: string;
  writtenSolution?: string;
  youtubeSearchQuery?: string;
}

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export function AITest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { theme } = useTheme();
  const [level, setLevel] = useState<Difficulty>('Medium');
  const [topic, setTopic] = useState('Data Structures & Algorithms (DSA)');
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'finished'>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isCorrectResult, setIsCorrectResult] = useState<boolean | null>(null);
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes default
  const [lastAutoSave, setLastAutoSave] = useState(Date.now());
  const [timerInterval, setTimerInterval] = useState<any>(null);
  const [activeSolutionIdx, setActiveSolutionIdx] = useState<number | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [codingChallenges, setCodingChallenges] = useState<any[]>([]);
  const [isCodingMode, setIsCodingMode] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const allTopics = Array.from(new Set(Object.values(CAREER_PATHS).flatMap(path => path.topics.map(t => t.title))));
  const filteredTopics = allTopics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

  const questionLimit = 30; // Fixed 30 question set

  const startAssessment = async () => {
    setStatus('loading');
    try {
      const isSoftwareEng = topic.toLowerCase().includes('engineer') || topic.toLowerCase().includes('software') || topic.toLowerCase().includes('developer');
      
      const [generatedQuestions, challenges] = await Promise.all([
        generateTest(topic, level, questionLimit),
        isSoftwareEng ? generateCodingChallenges(topic, level, 1) : Promise.resolve([])
      ]);

      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setCodingChallenges(challenges);
        setStatus('active');
        setCurrentIndex(0);
        setUserAnswers({});
        setTimeElapsed(0);
        const limitSeconds = level === 'Expert' ? 3600 : level === 'Hard' ? 2400 : 1800;
        setTimeLeft(limitSeconds);

        const interval = setInterval(() => {
          setTimeElapsed(prev => prev + 1);
          setTimeLeft(prev => {
            if (prev <= 0) {
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setTimerInterval(interval);
      } else {
        setStatus('idle');
        alert("Failed to generate test. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
      alert("Error initializing synthesis.");
    }
  };

  const handleCodeSubmit = async () => {
    if (!codingChallenges[0]) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateCodeSubmission(codingChallenges[0].description, userCode, language);
      setEvaluation(result);
      if (result.isCorrect) {
        // Automatically finish if correct or let them see feedback
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Auto-save logic
  React.useEffect(() => {
    if (status === 'active' && questions.length > 0) {
      const saveInterval = setInterval(() => {
        const session = {
          topic,
          level,
          questions,
          userAnswers,
          currentIndex,
          timeElapsed,
          timeLeft,
          timestamp: Date.now()
        };
        localStorage.setItem('creadora_ai_test_session', JSON.stringify(session));
        setLastAutoSave(Date.now());
      }, 60000); // Every minute

      return () => clearInterval(saveInterval);
    }
  }, [status, questions, userAnswers, currentIndex, timeElapsed, timeLeft, topic, level]);

  // Check for timeout
  React.useEffect(() => {
    if (status === 'active' && timeLeft === 0) {
      finishTest();
    }
  }, [timeLeft, status]);

  const handleAnswer = (answer: string) => {
    if (hasAnsweredCurrent) return;
    
    setHasAnsweredCurrent(true);
    setUserAnswers(prev => ({ ...prev, [currentIndex]: answer }));
    
    const isCorrect = answer === questions[currentIndex].correctAnswer;
    setIsCorrectResult(isCorrect);
    setShowImmediateFeedback(true);

    if (isCorrect) {
      // Auto-advance after 1s if correct
      setTimeout(() => {
        proceedToNext();
      }, 1000);
    }
  };

  const proceedToNext = () => {
    setShowImmediateFeedback(false);
    setIsCorrectResult(null);
    setHasAnsweredCurrent(false);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (codingChallenges.length > 0 && !isCodingMode) {
      setIsCodingMode(true);
      setUserCode(codingChallenges[0].initialCode || '// Initialize sequence...');
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    clearInterval(timerInterval);
    setStatus('finished');
    
    // Persist result to Firestore
    if (user) {
      const score = calculateScore();
      const assessmentData = {
        type: 'diagnostic',
        score,
        totalQuestions: questions.length,
        accuracy: `${Math.round((questions.filter((q, i) => userAnswers[i] === q.correctAnswer).length / questions.length) * 100)}%`,
        topic,
        level,
        timeElapsed,
        timestamp: new Date().toISOString()
      };
      
      await dataService.addDocument(`users/${user.uid}/assessments`, assessmentData);
      
      // Update User Profile
      await dataService.setDocument('users', user.uid, {
        diagnosticCompleted: true,
        onboardingScore: score,
        careerField: topic,
        updatedAt: new Date().toISOString()
      });
      
      // Also add a system notification
      await dataService.addDocument(`users/${user.uid}/notifications`, {
        type: 'assessment_complete',
        message: `Assessment complete: ${topic} (${score}%). Profile nodes synchronized.`,
        read: false,
        timestamp: new Date().toISOString()
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleQuestionExplanation = (idx: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const calculateScore = () => {
    if (!questions || questions.length === 0) return 0;
    const mcqTotal = questions.length;
    const mcqScore = questions.filter((q, i) => {
      const userAns = userAnswers[i]?.toString().trim().toLowerCase();
      const correctAns = q.correctAnswer?.toString().trim().toLowerCase();
      return userAns === correctAns;
    }).length;
    
    let totalScore = (mcqScore / mcqTotal) * 100;

    if (codingChallenges.length > 0 && evaluation) {
      // Weight coding challenge as 40% of final score if present
      const codingWeight = 0.4;
      const mcqWeight = 0.6;
      totalScore = (totalScore * mcqWeight) + (evaluation.score * codingWeight);
    }
    
    return Math.round(totalScore);
  };

  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-12 border-b border-white/5 pb-8">
          <button 
            onClick={() => window.history.back()}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all transform hover:-translate-x-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="transform -skew-x-12">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Neural <span className="text-blue-500">DNA</span> Test</h1>
            <div className="flex items-center gap-3 mt-2">
               <div className="px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 rounded text-[8px] font-black text-blue-400 uppercase tracking-widest">Protocol: Gemini-X</div>
               <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] italic">Full Diagnostic Integration</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-8 bg-slate-900/40 border border-white/10 rounded-[3rem] p-12 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <BrainCircuit className="w-64 h-64 text-blue-500" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-12">
                    <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Config Node</h2>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Set Diagnostic Parameters</p>
                    </div>
                  </div>
                  
                  <div className="space-y-12 mb-16">
                    <div className="space-y-6 relative">
                      <div className="flex justify-between items-end ml-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Target Discipline</label>
                         <span className="text-[9px] font-mono text-blue-500 uppercase">Neural Selective</span>
                      </div>
                      
                      <div className="relative group">
                         <div 
                           className={`w-full bg-black/60 border rounded-[2rem] p-6 pr-14 flex items-center justify-between cursor-pointer transition-all ${
                             isDropdownOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-white/10'
                           }`}
                           onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                         >
                            <span className="text-white font-black italic tracking-tight overflow-hidden text-ellipsis whitespace-nowrap">
                               {topic}
                            </span>
                            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                         </div>

                         <AnimatePresence>
                           {isDropdownOpen && (
                             <motion.div 
                               initial={{ opacity: 0, y: 10, scale: 0.95 }}
                               animate={{ opacity: 1, y: 0, scale: 1 }}
                               exit={{ opacity: 0, y: 10, scale: 0.95 }}
                               className="absolute left-0 right-0 top-full mt-4 z-50 bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden backdrop-blur-2xl"
                             >
                                <div className="p-4 border-b border-white/5 relative">
                                   <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                   <input 
                                     type="text"
                                     value={searchQuery}
                                     onChange={(e) => setSearchQuery(e.target.value)}
                                     placeholder="Search Neural Hub..."
                                     className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500/50"
                                     onClick={(e) => e.stopPropagation()}
                                   />
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                   {filteredTopics.length > 0 ? (
                                     filteredTopics.map((t, idx) => (
                                       <button
                                         key={idx}
                                         onClick={() => {
                                           setTopic(t);
                                           setIsDropdownOpen(false);
                                           setSearchQuery('');
                                         }}
                                         className={`w-full p-6 text-left text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group/item ${
                                           topic === t ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                         }`}
                                       >
                                          {t}
                                          {topic === t && <CheckCircle2 className="w-4 h-4" />}
                                       </button>
                                     ))
                                   ) : (
                                     <div className="p-12 text-center">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">No Neural Match Found</p>
                                     </div>
                                   )}
                                </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end ml-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Difficulty Mode</label>
                        <span className="text-xl font-black text-white italic">{level}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(['Easy', 'Medium', 'Hard', 'Expert'] as Difficulty[]).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setLevel(mode)}
                            className={`py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                              level === mode 
                              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20 scale-105' 
                              : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/10 hover:text-white'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={startAssessment}
                    className="group relative w-full py-6 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-transform active:scale-95"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3 italic">
                       Initiate DNA Synthesis <Play className="w-3 h-3" />
                    </span>
                    <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  </button>
                </div>
              </div>

              {/* Side Panels */}
              <div className="lg:col-span-4 space-y-6">
                 <div className="p-8 rounded-[2.5rem] bg-blue-600/5 border border-white/5 space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Core Protocol</h4>
                    <div className="space-y-4">
                       {[
                         { icon: <Target className="w-4 h-4" />, label: 'Questions', val: isPremium ? '30 Nodes' : '06 Nodes' },
                         { icon: <Clock className="w-4 h-4" />, label: 'Est. Time', val: isPremium ? '45 MIN' : '10 MIN' },
                         { icon: <ShieldCheck className="w-4 h-4" />, label: 'Validation', val: 'BLOCKCHAIN' }
                       ].map((item, i) => (
                         <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-3">
                               <div className="text-blue-500">{item.icon}</div>
                               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                            </div>
                            <span className="text-xs font-black text-white italic">{item.val}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 relative overflow-hidden">
                    <div className="relative z-10">
                      <Lock className="w-8 h-8 text-indigo-500/40 mb-4" />
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Certification Node</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Successful validation grants a permanent Logic Node badge to your Neural Profile.</p>
                    </div>
                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl" />
                 </div>
              </div>
            </motion.div>
          )}

          {status === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40 space-y-12"
            >
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-4 border border-indigo-500/20 rounded-full animate-pulse" />
                <BrainCircuit className="w-12 h-12 text-blue-500 animate-pulse" />
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Synthesizing...</h3>
                <div className="flex flex-col items-center gap-1">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Querying Global Talent Matrix</p>
                   <div className="flex gap-1 mt-2">
                      {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {status === 'active' && questions.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 <div className="md:col-span-3 p-10 rounded-[3.5rem] bg-slate-900/40 border border-white/10 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                             {isCodingMode ? <Terminal className="w-6 h-6 text-blue-500" /> : <BrainCircuit className="w-6 h-6 text-blue-500" />}
                          </div>
                          <div>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-1">
                               {isCodingMode ? 'Technical DNA Extraction' : 'Neural Thread'}
                             </span>
                             <div className="flex items-center gap-3">
                                <span className="text-xl font-black text-white italic tracking-tighter">
                                  {isCodingMode ? 'Coding Node' : `Node ${currentIndex + 1}`}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-400 uppercase tracking-widest">Active</span>
                             </div>
                          </div>
                       </div>
                       <span className="text-sm font-black text-slate-500 italic uppercase tracking-widest">
                          {isCodingMode ? '100%' : `${Math.round(((currentIndex + 1) / questions.length) * 100)}%`}
                       </span>
                    </div>
                    
                    <div className="relative">
                       <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: isCodingMode ? '100%' : `${((currentIndex + 1) / questions.length) * 100}%` }}
                            transition={{ type: "spring", stiffness: 50, damping: 20 }}
                            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 relative"
                          >
                             <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" />
                          </motion.div>
                       </div>
                    </div>
                 </div>

                 <div className="p-10 rounded-[3.5rem] bg-black/40 border border-white/10 flex flex-col items-center justify-center backdrop-blur-xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Clock className={`w-8 h-8 mb-4 animate-pulse ${timeLeft < 300 ? 'text-red-500' : 'text-blue-500'}`} />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Time Remaining</span>
                    <span className={`text-3xl font-black italic tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(37,99,235,0.3)] ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
                      {formatTimeRemaining(timeLeft)}
                    </span>
                 </div>
              </div>

              <AnimatePresence mode="wait">
                {isCodingMode && codingChallenges[0] ? (
                  <motion.div
                    key="coding-node"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`grid grid-cols-1 ${isExpanded ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-8 transition-all duration-500`}
                  >
                    {/* Problem Description */}
                    {!isExpanded && (
                      <motion.div 
                        initial={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 space-y-8 flex flex-col"
                      >
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                                 <Info className="w-4 h-4 text-blue-500" />
                              </div>
                              <h3 className="text-lg font-black text-white italic tracking-tight">{codingChallenges[0].title}</h3>
                           </div>
                           <span className="px-3 py-1 rounded bg-blue-600 text-white text-[9px] font-black uppercase italic tracking-widest">{codingChallenges[0].difficulty}</span>
                        </div>

                        <div className="prose prose-invert max-w-none flex-grow overflow-y-auto custom-scrollbar pr-4">
                           <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium italic">
                              {codingChallenges[0].description}
                           </p>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                           <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              <div className="flex items-center gap-2">
                                 <BookOpen className="w-4 h-4 text-blue-500" />
                                 Topic: {codingChallenges[0].topic}
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Editor & Evaluation */}
                    <div className="space-y-6">
                       <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition" />
                          <div className="relative bg-black border border-white/10 rounded-[2rem] overflow-hidden">
                             <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                   <div className="flex gap-2">
                                      <div className="w-3 h-3 rounded-full bg-red-500/20 shadow-inner" />
                                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 shadow-inner" />
                                      <div className="w-3 h-3 rounded-full bg-green-500/20 shadow-inner" />
                                   </div>
                                   <select 
                                      value={language}
                                      onChange={(e) => setLanguage(e.target.value)}
                                      className="bg-transparent text-[9px] font-mono text-slate-500 uppercase tracking-widest border-none focus:ring-0 cursor-pointer outline-none"
                                   >
                                      <option value="javascript" className="bg-slate-900">javascript</option>
                                      <option value="typescript" className="bg-slate-900">typescript</option>
                                      <option value="python" className="bg-slate-900">python</option>
                                      <option value="java" className="bg-slate-900">java</option>
                                      <option value="cpp" className="bg-slate-900">cpp</option>
                                      <option value="go" className="bg-slate-900">go</option>
                                      <option value="sql" className="bg-slate-900">sql</option>
                                   </select>
                                </div>
                                <button 
                                  onClick={() => setIsExpanded(!isExpanded)}
                                  className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors"
                                >
                                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                  <span className="text-[10px] font-mono uppercase tracking-widest hidden md:inline">
                                    {isExpanded ? 'Compress' : 'Expand'}
                                  </span>
                                </button>
                             </div>
                             <div className="h-[500px] relative">
                                <CodeEditor 
                                  code={userCode} 
                                  onChange={setUserCode}
                                  language={language}
                                  className={isExpanded ? 'text-2xl md:text-3xl' : ''}
                                />
                             </div>
                             <div className="p-6 bg-white/5 border-t border-white/10 flex justify-between items-center">
                                <button 
                                  onClick={() => setUserCode(codingChallenges[0].initialCode)}
                                  className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                                >
                                   <RotateCcw className="w-3 h-3" /> Reset Node
                                </button>
                                <button 
                                  onClick={handleCodeSubmit}
                                  disabled={isEvaluating}
                                  className="px-8 py-3 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 disabled:opacity-50"
                                >
                                   {isEvaluating ? (
                                      <>Evaluating... <Loader2 className="w-3 h-3 animate-spin" /></>
                                   ) : (
                                      <>Transmit Sequence <ChevronRight className="w-3 h-3" /></>
                                   )}
                                </button>
                             </div>
                          </div>
                       </div>

                       {/* Evaluation Feedback */}
                       <AnimatePresence>
                          {evaluation && (
                             <motion.div
                               initial={{ opacity: 0, y: 20 }}
                               animate={{ opacity: 1, y: 0 }}
                               className={`p-8 rounded-[2rem] border overflow-hidden relative ${evaluation.isCorrect ? 'bg-green-600/10 border-green-500/20' : 'bg-red-600/10 border-red-500/20'}`}
                             >
                                <div className="flex items-center justify-between mb-6">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${evaluation.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                         {evaluation.isCorrect ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                      </div>
                                      <span className={`text-[10px] font-black uppercase tracking-widest ${evaluation.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                         {evaluation.isCorrect ? 'Logic Sync Successful' : 'Sequence Integration Failed'}
                                      </span>
                                   </div>
                                   <span className="text-xl font-black italic">{evaluation.score}%</span>
                                </div>

                                <p className="text-slate-300 text-sm italic font-medium mb-6">{evaluation.feedback}</p>

                                {evaluation.lineByLine && evaluation.lineByLine.length > 0 && (
                                   <div className="space-y-4 mb-6">
                                      {evaluation.lineByLine.map((err: any, i: number) => (
                                         <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                                            <div className="flex justify-between items-center">
                                               <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Line {err.lineNumber} Error</span>
                                               <span className="text-[9px] font-mono text-slate-500">{err.issue}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                               <div className="space-y-1">
                                                  <span className="text-[8px] font-black text-slate-600 uppercase">Correct Injection:</span>
                                                  <code className="block text-[11px] text-green-400 bg-green-400/5 p-2 rounded">{err.correction}</code>
                                               </div>
                                               <div className="space-y-1">
                                                  <span className="text-[8px] font-black text-slate-600 uppercase">Logic Rationale:</span>
                                                  <p className="text-[10px] text-slate-400 italic">{err.explanation}</p>
                                               </div>
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                )}

                                 <div className="space-y-6">
                                    {(evaluation.timeComplexity || evaluation.spaceComplexity) && (
                                      <div className="flex gap-4 mb-2">
                                        {evaluation.timeComplexity && (
                                          <div className="flex-1 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                            <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Time</span>
                                            <div className="text-xs font-mono text-purple-200 mt-1">{evaluation.timeComplexity}</div>
                                          </div>
                                        )}
                                        {evaluation.spaceComplexity && (
                                          <div className="flex-1 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                            <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Space</span>
                                            <div className="text-xs font-mono text-purple-200 mt-1">{evaluation.spaceComplexity}</div>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {evaluation.topicInsights && (
                                       <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                          <h5 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1 italic">
                                             Cognitive Weakness: {evaluation.topicInsights.weakTopic}
                                          </h5>
                                          <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                             {evaluation.topicInsights.advice}
                                          </p>
                                       </div>
                                    )}

                                    {evaluation.conceptualGaps && evaluation.conceptualGaps.length > 0 && (
                                       <div className="flex flex-wrap gap-2">
                                          {evaluation.conceptualGaps.map((gap: string, i: number) => (
                                             <span key={i} className="px-3 py-1 rounded bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest italic">
                                                Gap: {gap}
                                             </span>
                                          ))}
                                       </div>
                                    )}
                                 </div>

                                {evaluation.isCorrect && (
                                   <button 
                                     onClick={finishTest}
                                     className="w-full mt-8 py-4 rounded-xl bg-green-600 text-white font-black text-xs uppercase tracking-widest italic"
                                   >
                                      Finalize Diagnostic
                                   </button>
                                )}
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="bg-slate-900/20 border border-white/5 rounded-[4rem] p-12 md:p-20 relative shadow-3xl backdrop-blur-sm"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.5em] italic shadow-2xl">
                       Logical Assessment Core
                    </div>
                    
                    <div className="mb-16 text-center space-y-6">
                       <h3 className="text-2xl md:text-3xl font-black text-white leading-tight italic tracking-tight">
                          {questions[currentIndex]?.text || "Processing Neural Query..."}
                       </h3>
                       <div className="flex justify-center gap-2">
                          <div className="w-12 h-1 bg-blue-500/20 rounded-full" />
                          <div className="w-4 h-1 bg-blue-500/60 rounded-full" />
                          <div className="w-12 h-1 bg-blue-500/20 rounded-full" />
                       </div>
                    </div>

                    {questions[currentIndex]?.codeSnippet && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 relative group"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                        <div className="relative p-8 bg-black/80 rounded-2xl border border-white/10 font-mono text-sm leading-relaxed text-blue-300 overflow-x-auto whitespace-pre custom-scrollbar">
                          <code>{questions[currentIndex]?.codeSnippet}</code>
                        </div>
                      </motion.div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(questions[currentIndex]?.options || []).map((opt, i) => {
                        const isSelected = userAnswers[currentIndex] === opt;
                        const isCorrect = opt === questions[currentIndex].correctAnswer;
                        const showCorrectness = showImmediateFeedback;

                        let buttonStyles = 'bg-black/40 border-white/5 text-slate-500 hover:border-white/20 hover:text-white hover:bg-slate-900/60';
                        if (isSelected) {
                          if (showCorrectness) {
                            buttonStyles = isCorrect 
                             ? 'bg-green-600 border-green-500 text-white shadow-[0_20px_50px_rgba(34,197,94,0.4)] ring-4 ring-green-600/20 translate-y-[-4px]'
                             : 'bg-red-600 border-red-500 text-white shadow-[0_20px_50px_rgba(239,68,68,0.4)] ring-4 ring-red-600/20 translate-y-[-4px]';
                          } else {
                            buttonStyles = 'bg-blue-600 border-blue-500 text-white shadow-[0_20px_50px_rgba(37,99,235,0.4)] ring-4 ring-blue-600/20 translate-y-[-4px]';
                          }
                        } else if (showCorrectness && isCorrect) {
                           buttonStyles = 'bg-green-600/20 border-green-500/50 text-green-400';
                        }

                        return (
                          <motion.button 
                            key={i}
                            disabled={hasAnsweredCurrent}
                            onClick={() => handleAnswer(opt)}
                            whileHover={{ scale: (isSelected || hasAnsweredCurrent) ? 1 : 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className={`group relative p-10 rounded-[2.5rem] border transition-all text-left flex items-start gap-6 overflow-hidden ${buttonStyles}`}
                          >
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                              isSelected 
                                ? (showCorrectness && !isCorrect ? 'bg-white text-red-600 border-white' : 'bg-white text-blue-600 border-white')
                                : (showCorrectness && isCorrect ? 'bg-green-500 text-white border-green-400' : 'bg-white/5 border-white/10 text-slate-700 group-hover:border-blue-500/50 group-hover:text-blue-500')
                            }`}>
                               {isSelected && showCorrectness && !isCorrect ? <XCircle className="w-4 h-4" /> : (isSelected || (showCorrectness && isCorrect) ? <Check className="w-4 h-4" /> : <span className="text-[10px] font-black">{String.fromCharCode(65 + i)}</span>)}
                            </div>
                            
                            <div className="flex-grow">
                               <div className={`text-[9px] uppercase tracking-widest font-black mb-3 transition-colors ${
                                 isSelected ? 'text-white/60' : (showCorrectness && isCorrect ? 'text-green-400' : 'text-slate-700 group-hover:text-blue-500')
                               }`}>
                                  Node Option {i + 1}
                               </div>
                               <span className="text-sm font-black italic tracking-tight leading-relaxed">{opt}</span>
                            </div>

                            {(isSelected || (showCorrectness && isCorrect)) && (
                              <motion.div 
                                layoutId="active-bg"
                                className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                       {showImmediateFeedback && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 p-8 rounded-[2.5rem] border bg-black/40 border-white/10 backdrop-blur-xl"
                          >
                             <div className="flex items-center gap-4 mb-6">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCorrectResult ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}`}>
                                   {isCorrectResult ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </div>
                                <div>
                                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                      {isCorrectResult ? 'Neural Sync Successful' : 'Logic Fault Detected'}
                                   </span>
                                   <h4 className="text-white font-black italic">Solution Analysis</h4>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                   <p className="text-slate-300 text-sm italic font-medium leading-relaxed">
                                      {questions[currentIndex].solutionAnalysis || "Analysis mapped to neural nodes..."}
                                   </p>
                                </div>

                                {!isCorrectResult && (
                                   <button 
                                     onClick={proceedToNext}
                                     className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 group"
                                   >
                                      Continue to Next Node <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                   </button>
                                )}
                             </div>
                          </motion.div>
                       )}
                    </AnimatePresence>

                    <div className="mt-16 flex justify-center gap-8 items-center border-t border-white/5 pt-12">
                       <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                          <MousePointer2 className="w-4 h-4" />
                          {showImmediateFeedback && isCorrectResult ? 'Auto-advancing node...' : 'Select option to advance'}
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}


          {status === 'finished' && (
            <motion.div 
              key="finished"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`border rounded-[3rem] p-12 text-center backdrop-blur-md shadow-2xl relative overflow-hidden ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-white/10'
              }`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy className="w-64 h-64 text-yellow-500" />
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex p-6 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 mb-8">
                  <Trophy className="w-16 h-16 text-yellow-500" />
                </div>
                <h2 className="text-5xl font-black text-white mb-2 uppercase tracking-tighter italic">Analysis Complete</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-12">
                  {isPremium ? 'Credora Readiness Score Calculated' : 'DEMO MODE: 20% Skill DNA Mapped'}
                </p>

                <div className="flex flex-col md:flex-row justify-center items-center gap-12 mb-12">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Final Score</span>
                    <span className="text-7xl font-black text-white tracking-tighter italic">{calculateScore()}%</span>
                  </div>
                  <div className="w-[1px] h-16 bg-white/10 hidden md:block" />
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-left">
                    <div>
                       <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Time Used</span>
                       <span className="text-xl font-bold text-white">{formatTime(timeElapsed)}</span>
                    </div>
                    <div>
                       <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Accuracy</span>
                       <span className="text-xl font-bold text-white">{Math.round((questions.slice(0, questionLimit).filter((q, i) => userAnswers[i] === q.correctAnswer).length / questionLimit) * 100)}%</span>
                    </div>
                    <div>
                       <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Difficulty</span>
                       <span className="text-xl font-bold text-blue-500">{level}</span>
                    </div>
                    <div>
                       <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Result</span>
                       <span className={`text-xl font-bold ${calculateScore() >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                         {calculateScore() >= 70 ? 'CERTIFIED' : 'FAILED'}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Solution Review Trigger */}
                <div className="mb-12">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Neural Breakdown</h4>
                   <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                      {questions.slice(0, questionLimit).map((q, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSolutionIdx(i)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${
                            userAnswers[i] === q.correctAnswer 
                            ? 'bg-green-600/10 border-green-500/20 text-green-500' 
                            : 'bg-red-600/10 border-red-500/20 text-red-500'
                          } hover:scale-110`}
                        >
                          {i + 1}
                        </button>
                      ))}
                   </div>
                </div>

                <AnimatePresence>
                  {activeSolutionIdx !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="mb-12 p-10 bg-black/60 border border-white/10 rounded-[3rem] text-left relative"
                    >
                      <button 
                        onClick={() => setActiveSolutionIdx(null)}
                        className="absolute top-8 right-8 text-slate-500 hover:text-white"
                      >
                        <ArrowLeft className="w-6 h-6 rotate-90" />
                      </button>

                      <div className="flex items-center gap-4 mb-8">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${userAnswers[activeSolutionIdx] === questions[activeSolutionIdx].correctAnswer ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}`}>
                            {userAnswers[activeSolutionIdx] === questions[activeSolutionIdx].correctAnswer ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                         </div>
                         <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question {activeSolutionIdx + 1}</span>
                            <h5 className="text-white font-black italic">Solution Analysis</h5>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-white text-sm font-bold leading-relaxed italic mb-4">{questions[activeSolutionIdx].text}</p>
                            <div className="flex flex-col gap-2">
                               <div className="flex justify-between items-center px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                  <span className="text-[9px] font-black text-green-500 uppercase">Correct Answer</span>
                                  <span className="text-xs font-black text-white">{questions[activeSolutionIdx].correctAnswer}</span>
                               </div>
                               {userAnswers[activeSolutionIdx] !== questions[activeSolutionIdx].correctAnswer && (
                                 <div className="flex justify-between items-center px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <span className="text-[9px] font-black text-red-500 uppercase">Your Selection</span>
                                    <span className="text-xs font-black text-white">{userAnswers[activeSolutionIdx] || 'No Answer'}</span>
                                 </div>
                               )}
                            </div>
                         </div>

                         {!expandedQuestions[activeSolutionIdx] ? (
                           <div className="flex justify-center py-4">
                              <button 
                                onClick={() => toggleQuestionExplanation(activeSolutionIdx!)}
                                className="px-10 py-4 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600/20 transition-all flex items-center gap-3 group"
                              >
                                 <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                                 Show Deep Analysis
                              </button>
                           </div>
                         ) : (
                           <motion.div 
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: 'auto' }}
                             className="space-y-10"
                           >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                 <div>
                                    <h6 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Deep Analysis</h6>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium italic">
                                      {questions[activeSolutionIdx].solutionAnalysis || "Analysis synchronized from core logic..."}
                                    </p>
                                 </div>
                                 <div>
                                    <h6 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Written Solution</h6>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium italic">
                                      {questions[activeSolutionIdx].writtenSolution || "Solution mapped to neural nodes..."}
                                    </p>
                                 </div>
                              </div>

                              <div className="flex justify-center">
                                 <button 
                                   onClick={() => toggleQuestionExplanation(activeSolutionIdx!)}
                                   className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
                                 >
                                    Hide Analysis
                                 </button>
                              </div>
                           </motion.div>
                         )}

                         {expandedQuestions[activeSolutionIdx] && questions[activeSolutionIdx].youtubeSearchQuery && (
                           <div className="pt-8 border-t border-white/5">
                              <h6 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Play className="w-3 h-3 fill-current" /> Video Solution Reference
                              </h6>
                              <a 
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(questions[activeSolutionIdx].youtubeSearchQuery)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-3 px-6 py-3 bg-red-600/10 border border-red-600/20 rounded-xl text-red-400 hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                              >
                                Find Tutorial on YouTube <ChevronRight className="w-4 h-4" />
                              </a>
                           </div>
                         )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isPremium && (
                  <div className="mb-12 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] text-left relative overflow-hidden">
                    <Lock className="absolute top-4 right-4 w-12 h-12 text-indigo-500/20" />
                    <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2">Premium Required</h4>
                    <p className="text-slate-400 text-sm mb-6 max-w-md">You just completed the diagnostic. Upgrade to Premium to receive a formal certification and Neural Insights.</p>
                    <Link 
                      to="/premium"
                      className="inline-flex items-center gap-2 text-white font-bold bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl transition-all text-xs uppercase tracking-widest"
                    >
                      Upgrade for $500 <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => setStatus('idle')}
                      className={`px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                         theme === 'light' ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      Initialize New Node
                    </button>
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="px-10 py-5 rounded-full bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
                    >
                      Return to Dashboard <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
