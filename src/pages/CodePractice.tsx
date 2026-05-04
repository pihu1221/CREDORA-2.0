import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  ChevronRight, 
  Play, 
  CheckCircle, 
  XCircle, 
  Terminal, 
  Brain, 
  Zap,
  RotateCcw,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { generateCodingChallenges, evaluateCodeSubmission } from '../services/geminiService';
import { CodingChallenge, CodeEvaluation } from '../types/coding';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';

export const CodePractice: React.FC = () => {
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Expert'>('Medium');
  const [topic, setTopic] = useState('Data Structures & Algorithms');
  const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<CodeEvaluation | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentChallenge = challenges[currentIndex];

  useEffect(() => {
    loadChallenges();
  }, [difficulty, topic]);

  async function loadChallenges() {
    setIsGenerating(true);
    setEvaluation(null);
    setShowSolution(false);
    try {
      const data = await generateCodingChallenges(topic, difficulty, 2);
      setChallenges(data);
      if (data.length > 0) {
        setCode(data[0].initialCode);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Failed to load challenges", error);
    } finally {
      setIsGenerating(false);
    }
  }

  const topics = [
    'Data Structures & Algorithms',
    'System Design',
    'Full Stack Logic',
    'Cloud Architecture',
    'Security & Cryptography',
    'Database Optimization'
  ];

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'sql', label: 'SQL' }
  ];

  async function handleSubmit() {
    if (!currentChallenge) return;
    setIsEvaluating(true);
    setEvaluation(null);
    try {
      const [result] = await Promise.all([
        evaluateCodeSubmission(currentChallenge.description, code, language),
        new Promise(resolve => setTimeout(resolve, 5000))
      ]);
      setEvaluation(result);

      // Persist to Firestore
      if (user && result.score >= 80) {
        await dataService.addDocument(`users/${user.uid}/projects`, {
          title: currentChallenge.title,
          description: currentChallenge.description,
          code,
          language,
          score: result.score,
          type: 'practice_challenge',
          timestamp: new Date().toISOString()
        });

        await dataService.addDocument(`users/${user.uid}/notifications`, {
          type: 'challenge_complete',
          message: `Challenge Verified: ${currentChallenge.title}. Added to Neural Portfolio.`,
          read: false,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setIsEvaluating(false);
    }
  }

  function handleNext() {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCode(challenges[currentIndex + 1].initialCode);
      setEvaluation(null);
      setShowSolution(false);
    } else {
      loadChallenges();
    }
  }

  function handleRetry() {
    setEvaluation(null);
    setShowSolution(false);
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 bg-brand-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="glow-blue top-0 -left-64 opacity-20" />
      <div className="glow-indigo bottom-0 -right-64 opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Terminal size={18} />
              <span className="text-sm font-mono tracking-wider uppercase">Advanced Practice Lab</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
              AI Code Architect
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              {topics.slice(0, 3).map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    topic === t 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t.split(' ')[0]}
                </button>
              ))}
              <select 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-transparent text-slate-400 text-[10px] font-bold uppercase tracking-widest border-none outline-none focus:ring-0 cursor-pointer px-2"
              >
                {topics.map(t => <option key={t} value={t} className="bg-brand-bg text-white">{t}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              {(['Easy', 'Medium', 'Hard', 'Expert'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    difficulty === level 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-[600px] glass rounded-3xl">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-mono animate-pulse text-lg">Architecting new challenges...</p>
          </div>
        ) : challenges.length > 0 ? (
          <div className="flex flex-col gap-8">
            <div className={`grid grid-cols-1 ${isExpanded ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-8 transition-all duration-500`}>
              {/* Left: Question Area */}
              {!isExpanded && (
                <motion.div 
                  initial={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-6 overflow-auto pr-2 custom-scrollbar h-[600px]"
                >
                  <div className="glass rounded-2xl p-6 border-white/5 relative overflow-hidden group h-full">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Brain size={120} />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        difficulty === 'Expert' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        difficulty === 'Hard' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}>
                        {difficulty} Level
                      </span>
                      <span className="text-slate-500 text-[10px] uppercase tracking-widest">•</span>
                      <span className="text-slate-400 text-[10px] uppercase tracking-widest">{currentChallenge.topic}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">{currentChallenge.title}</h2>
                    <div className="prose prose-invert max-w-none text-slate-300">
                      {currentChallenge.description.split('\n').map((line, i) => (
                        <p key={i} className="mb-2">{line}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Right: Code Editor Area */}
              <div className={`flex flex-col h-[600px] glass rounded-3xl border-white/5 overflow-hidden shadow-2xl relative transition-all duration-500 ${isExpanded ? 'w-full scale-100' : ''}`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                      <div className="w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/40" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                    </div>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-transparent text-xs font-mono text-slate-500 uppercase tracking-widest border-none outline-none focus:ring-0 cursor-pointer p-0 font-sans"
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value} className="bg-brand-bg text-white">
                          file.{lang.value === 'javascript' ? 'js' : lang.value === 'typescript' ? 'ts' : lang.value === 'python' ? 'py' : lang.value === 'cpp' ? 'cpp' : lang.value === 'java' ? 'java' : lang.value === 'go' ? 'go' : 'sql'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors"
                    >
                      {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      <span className="text-[10px] font-mono uppercase tracking-widest hidden md:inline">
                        {isExpanded ? 'Scale Down' : 'Scale Up'}
                      </span>
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">Node Status: <span className="text-green-500 font-bold uppercase tracking-wider">Active</span></span>
                  </div>
                </div>

                <div className="flex-grow relative overflow-hidden bg-black/40">
                  <CodeEditor 
                    code={code} 
                    onChange={setCode} 
                    language={language}
                    className={isExpanded ? 'text-2xl md:text-3xl' : ''}
                  />
                </div>

                <div className="p-4 bg-black/40 border-t border-white/5 flex gap-4">
                  <button 
                    onClick={() => setCode(currentChallenge.initialCode)}
                    className="p-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all"
                    title="Reset Boilerplate"
                  >
                    <RotateCcw size={20} />
                  </button>
                  <button 
                    disabled={isEvaluating}
                    onClick={handleSubmit}
                    className="flex-grow py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 overflow-hidden relative group"
                  >
                    {isEvaluating ? (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span className="font-black text-[11px] uppercase tracking-widest">Deep Analysis...</span>
                        </div>
                        <span className="text-[9px] text-blue-200/50 uppercase tracking-widest">Powered with GitHub Models</span>
                      </div>
                    ) : (
                      <>
                        <Zap size={18} className="group-hover:scale-125 transition-transform" />
                        <span>Execute Submission</span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section: Evaluation Results */}
            <AnimatePresence>
              {evaluation && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className={`glass rounded-3xl p-8 border ${
                    evaluation.isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                  } shadow-2xl relative overflow-hidden`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500/50 to-transparent opacity-50" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                       <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${evaluation.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {evaluation.isCorrect ? <CheckCircle size={32} /> : <XCircle size={32} />}
                          </div>
                          <div>
                            <h3 className={`text-2xl font-bold ${evaluation.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {evaluation.isCorrect ? 'Neural Sequence Verified' : 'Logic Integrity Breach Detected'}
                            </h3>
                            <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">
                              Verification Phase: {evaluation.isCorrect ? 'Completed' : 'Fault Identified'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Mastery Index</div>
                           <div className="text-4xl font-display font-black text-blue-400 tabular-nums">
                            {evaluation.score}<span className="text-xl text-blue-500/40">%</span>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Terminal size={16} className="text-blue-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiler Feedback</span>
                          </div>
                          <div className="bg-black/60 rounded-2xl p-6 font-mono text-sm leading-relaxed text-blue-300/80 border border-white/5 whitespace-pre-wrap">
                            {evaluation.executionOutput}
                          </div>
                        </div>

                        <p className="text-lg text-slate-200 font-medium leading-relaxed italic border-l-4 border-blue-500/30 pl-4 py-2">
                          "{evaluation.feedback}"
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                      {(evaluation.timeComplexity || evaluation.spaceComplexity) && (
                        <div className="glass bg-white/5 rounded-2xl p-6 border-white/5">
                          <h4 className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-4">
                            <Zap size={16} /> Complexity Analysis
                          </h4>
                          <div className="space-y-4">
                            {evaluation.timeComplexity && (
                              <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Time Complexity</div>
                                <div className="text-sm font-mono text-slate-300">{evaluation.timeComplexity}</div>
                              </div>
                            )}
                            {evaluation.spaceComplexity && (
                              <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Space Complexity</div>
                                <div className="text-sm font-mono text-slate-300">{evaluation.spaceComplexity}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {evaluation.lineByLine.length > 0 && (
                        <div className="glass bg-white/5 rounded-2xl p-6 border-white/5">
                          <h4 className="flex items-center gap-2 text-xs font-black text-red-400 uppercase tracking-widest mb-4">
                            <AlertCircle size={16} /> Syntax Faults Found
                          </h4>
                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {evaluation.lineByLine.map((fb, i) => (
                              <div key={i} className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-mono bg-red-500/20 text-red-400 px-2 rounded">LN {fb.lineNumber}</span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">{fb.issue.substring(0, 20)}...</span>
                                </div>
                                <p className="text-xs text-slate-300 mb-3">{fb.explanation}</p>
                                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                                  <code className="text-[10px] text-green-300 block">{fb.correction}</code>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="glass bg-white/5 rounded-2xl p-6 border-white/5">
                        <h4 className="flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-widest mb-4">
                          <Brain size={16} /> Concept Gaps
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {evaluation.conceptualGaps.map((gap, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase">
                              {gap}
                            </span>
                          ))}
                        </div>
                        {evaluation.topicInsights && (
                          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                            <h5 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 italic">
                              Mentor Insight: {evaluation.topicInsights.weakTopic}
                            </h5>
                            <p className="text-xs text-slate-400 italic leading-relaxed">
                              {evaluation.topicInsights.advice}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center">
                    <button 
                      onClick={() => setShowSolution(!showSolution)}
                      className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-all uppercase tracking-widest"
                    >
                      <Lightbulb size={16} />
                      {showSolution ? 'Hide Verified Pattern' : 'Request AI Solution Node'}
                    </button>
                    
                    <div className="flex-grow flex gap-4 w-full sm:w-auto">
                      {evaluation.isCorrect ? (
                        <button 
                          onClick={handleNext}
                          className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group shadow-xl shadow-green-500/20"
                        >
                          Next Evolution <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={handleRetry}
                            className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group border border-white/5"
                          >
                            <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500" /> Re-Sync Logic
                          </button>
                          <button 
                            onClick={handleNext}
                            className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-100 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group border border-red-500/20"
                          >
                            Skip to Next <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {showSolution && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 bg-black/80 rounded-2xl p-8 overflow-x-auto border border-blue-500/20 relative group"
                    >
                      <div className="absolute top-4 right-4 text-[10px] font-mono text-blue-500/40 uppercase">Optimized Neural Network Script</div>
                      <pre className="text-sm font-mono text-blue-200/90 leading-loose">
                        {evaluation.optimizedCode}
                      </pre>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-3xl">
            <AlertCircle size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No challenges synthesized yet. Attempt to re-establish connection.</p>
            <button onClick={loadChallenges} className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">
              Retry Sync
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
