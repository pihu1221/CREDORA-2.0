/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  BookOpen, 
  CheckCircle2, 
  XCircle,
  ChevronRight, 
  Zap, 
  BrainCircuit, 
  Trophy,
  Activity,
  ArrowLeft,
  Target,
  Sparkles,
  Loader2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CAREER_PATHS } from '../data/careerData';
import { CareerField, Topic as CareerTopic } from '../types/career';
import { generateTestByField, generateCompanyPrep, parseAIResponse, askGemini } from '../services/geminiService';
import { CompanyPrep } from '../types/career';
import { getStockQuestions, Question as StockQuestion } from '../data/questionStock';
import { CodeEditor } from '../components/CodeEditor';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';

export function LearningPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const selectedField = (localStorage.getItem('student_career_field') || 'Engineer') as CareerField;
  const careerTopics = CAREER_PATHS[selectedField]?.topics || [];
  
  const [selectedTopic, setSelectedTopic] = useState<CareerTopic | null>(null);
  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [isGeneratingShards, setIsGeneratingShards] = useState(false);
  const [generatedShards, setGeneratedShards] = useState<any[]>([]);
  const [currentShardIndex, setCurrentShardIndex] = useState(0);
  const [userShardAnswers, setUserShardAnswers] = useState<Record<number, string>>({});
  const [shardSubtopic, setShardSubtopic] = useState<string | null>(null);

  // Massive Practice States
  const [massivePracticeTopic, setMassivePracticeTopic] = useState<string | null>(null);
  const [massiveDifficulty, setMassiveDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Expert'>('Medium');
  const [massiveQuestions, setMassiveQuestions] = useState<any[]>([]);
  const [isMassiveLoading, setIsMassiveLoading] = useState(false);
  const [userMassiveAnswers, setUserMassiveAnswers] = useState<Record<number, string>>({});

  // Company Prep States
  const [currentView, setCurrentView] = useState<'curriculum' | 'company-prep'>('curriculum');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyPrep | null>(null);

  // Shorts Explainer State
  const [explainerTopic, setExplainerTopic] = useState<string | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  const startCompanyPrep = async (company: string) => {
    setSelectedCompany(company);
    setIsCompanyLoading(true);
    const data = await generateCompanyPrep(company, selectedField);
    setCompanyData(data);
    setIsCompanyLoading(false);
  };

  useEffect(() => {
    if (selectedTopic && selectedTopic.lectures && selectedTopic.lectures.length > 0) {
      setActiveLecture(selectedTopic.lectures[0]);
    } else {
      setActiveLecture(null);
    }
  }, [selectedTopic]);

  const startMassivePractice = async (topic: string, difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert') => {
    const cacheKey = `massive_${selectedField}_${topic}_${difficulty}_5_only`;
    const cached = localStorage.getItem(cacheKey);

    setMassivePracticeTopic(topic);
    setMassiveDifficulty(difficulty);
    setIsMassiveLoading(true);
    setUserMassiveAnswers({}); // Reset answers on new session
    
    if (cached) {
      setMassiveQuestions(JSON.parse(cached));
      setIsMassiveLoading(false);
      return;
    }

    try {
      const prompt = `Generate exactly 5 high-quality questions for the topic "${topic}" at ${difficulty} difficulty in ${selectedField} domain. 
      Return a JSON array of exactly 5 complex, unique questions.
      Each question must follow this structure: 
      { 
        "id": number, 
        "text": "string", 
        "options": ["string", "string", "string", "string"], 
        "correct": "string (must be exact match of one option)", 
        "explanation": "string", 
        "youtubeSearch": "string" 
      }
      Return ONLY the JSON array.`;
      
      const aiText = await askGemini(prompt, [], 'EN');
      
      const aiQuestions = parseAIResponse(aiText || "[]");
      setMassiveQuestions(aiQuestions);
      localStorage.setItem(cacheKey, JSON.stringify(aiQuestions));
    } catch (e) {
      console.error("AI Generation failed:", e);
      setMassiveQuestions([]);
    } finally {
      setIsMassiveLoading(false);
    }
  };

  useEffect(() => {
    if (careerTopics.length > 0 && !selectedTopic && currentView === 'curriculum') {
      setSelectedTopic(careerTopics[0]);
    }
  }, [careerTopics, selectedTopic, currentView]);

  const [userShardCode, setUserShardCode] = useState<{ [key: number]: string }>({});
  const [shardLanguage, setShardLanguage] = useState('javascript');
  const [assessmentTimeLeft, setAssessmentTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    let timer: any;
    if (assessmentTimeLeft !== null && assessmentTimeLeft > 0) {
      timer = setInterval(() => {
        setAssessmentTimeLeft(prev => {
          if (prev !== null && prev > 0) return prev - 1;
          return 0;
        });
      }, 1000);
    } else if (assessmentTimeLeft === 0) {
      alert("Verification Protocol Timed Out. Analysis Stopped.");
      setMassivePracticeTopic(null);
      setAssessmentTimeLeft(null);
    }
    return () => clearInterval(timer);
  }, [assessmentTimeLeft]);

  const generate100Shards = async (subtopicTitle: string) => {
    const cacheKey = `shards_${selectedField}_${subtopicTitle}`;
    const cached = localStorage.getItem(cacheKey);

    setIsGeneratingShards(true);
    setShardSubtopic(subtopicTitle);
    setCurrentShardIndex(0);
    setUserShardAnswers({});
    
    if (cached) {
      setGeneratedShards(JSON.parse(cached));
      setIsGeneratingShards(false);
      return;
    }

    // Load local stock first for speed if not cached
    const stock = getStockQuestions(selectedField, subtopicTitle, 10);
    setGeneratedShards(stock);

    try {
      const prompt = `Generate exactly 20 high-quality technical multiple choice questions for the topic: ${subtopicTitle} in the field of ${selectedField}. 
      Generate 5 Easy, 5 Medium, 5 Hard, and 5 Expert questions.
      Return exactly 20 objects in a JSON array. 
      Each object must have: 
      - id (number)
      - text (string)
      - options (array of 4 strings)
      - correct (string, must match one of options)
      - explanation (string, brief)
      - deepAnalysis (string, detailed technical analysis)
      - writtenSolution (string, step-by-step logic)
      - youtubeSearch (string, a specific search query for a related video)
      - difficulty (string: 'Easy', 'Medium', 'Hard', or 'Expert')

      Return ONLY the JSON array.`;
      
      const aiText = await askGemini(prompt, [], 'EN');
      
      const parsed = parseAIResponse(aiText || "[]");
      const combined = [...parsed];
      setGeneratedShards(combined);
      localStorage.setItem(`5level_${cacheKey}`, JSON.stringify(combined));
    } catch (e) {
      console.error("AI Generation failed:", e);
      setGeneratedShards([]);
    } finally {
      setIsGeneratingShards(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all transform hover:-translate-x-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="transform -skew-x-12">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">{selectedField} <span className="text-blue-500">Archive</span></h1>
              <div className="flex items-center gap-3 mt-2">
                 <div className="px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 rounded text-[8px] font-black text-blue-400 uppercase tracking-widest">Access Level: Unified</div>
                 <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] italic">Knowledge Nodes Synchronized</p>
              </div>
            </div>
          </div>
          
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
             <div className="px-4 py-2 border-r border-white/10">
                <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">XP Gain</span>
                <span className="text-sm font-black text-blue-500 italic">+2500</span>
             </div>
             <div className="px-4 py-2">
                <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Field</span>
                <span className="text-sm font-black text-white italic">{selectedField}</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Topic Selection */}
          <div className="lg:col-span-3 space-y-8 sticky top-28">
            <section className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 space-y-4">
              <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 mb-4">
                <button 
                  onClick={() => {
                    setCurrentView('curriculum');
                    setSelectedTopic(null);
                    setShardSubtopic(null);
                  }}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${currentView === 'curriculum' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  Course Catalog
                </button>
                <button 
                  onClick={() => {
                    setCurrentView('company-prep');
                    setSelectedTopic(null);
                    setShardSubtopic(null);
                  }}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${currentView === 'company-prep' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  Company Prep
                </button>
              </div>

              {currentView === 'curriculum' ? (
                <>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 italic">Available Courses</h3>
                  <div className="space-y-3">
                    {careerTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => {
                          setSelectedTopic(topic);
                          setActiveLecture(topic.lectures[0]);
                          setGeneratedShards([]);
                          setShardSubtopic(null);
                          setMassivePracticeTopic(null);
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                          selectedTopic?.id === topic.id 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                          : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-black text-[10px] uppercase tracking-tight italic">{topic.title}</span>
                          <ChevronRight className={`w-3 h-3 transition-transform ${selectedTopic?.id === topic.id ? 'rotate-90' : ''}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 italic">Company Extraction</h3>
                  <div className="space-y-3">
                    {['Google', 'Meta', 'Amazon', 'Microsoft', 'Tesla', 'OpenAI'].map((company) => (
                      <button
                        key={company}
                        onClick={() => startCompanyPrep(company)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                          selectedCompany === company 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                          : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <span className="font-black text-xs uppercase tracking-tight italic">{company}</span>
                        <Target className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="p-8 rounded-[2.5rem] bg-blue-600/5 border border-indigo-500/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <BrainCircuit className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 italic">Neural Delta</h3>
              <p className="text-[10px] text-slate-500 mb-8 leading-relaxed font-bold uppercase italic">
                Calculate your readiness delta for {selectedField} specialization.
              </p>
              
              <Link 
                to="/dashboard"
                className="w-full py-4 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 text-center block italic"
              >
                Back to Workspace
              </Link>
            </section>
          </div>

          {/* Right Column: Content Area */}
          <div id="learning-portal-content" className="lg:col-span-9 space-y-12 relative">
            {/* CSS Selector Indicator */}
            <div className="absolute -top-10 right-0 z-20 hidden md:block">
              <div className="px-3 py-1 bg-black/40 border border-white/5 rounded-lg backdrop-blur-sm">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Selector: #learning-portal-content</p>
              </div>
            </div>
            
            {!selectedTopic && !shardSubtopic && currentView === 'curriculum' && (
              <div className="space-y-12">
                <div className="glass p-12 rounded-[4rem] border border-white/5 bg-indigo-600/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5"><BrainCircuit className="w-48 h-48" /></div>
                  <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-6">Course Path: <span className="text-indigo-400">{selectedField}</span></h2>
                    <p className="text-slate-400 font-medium leading-relaxed italic mb-10">
                      Welcome to your tailored curriculum for {selectedField}. This path is engineered to validate your technical competencies through high-fidelity lectures and dynamic AI assessment shards. 
                      Select a module from the sidebar to begin your verification journey. 
                    </p>
                    <div className="flex items-center gap-8">
                       <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Total Modules</p>
                          <p className="text-2xl font-black text-white italic leading-none">{careerTopics.length}</p>
                       </div>
                       <div className="w-px h-10 bg-white/10" />
                       <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Verification Nodes</p>
                          <p className="text-2xl font-black text-indigo-400 italic leading-none">{careerTopics.reduce((acc, t) => acc + t.subtopics.length, 0)}</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-10 rounded-[3rem] bg-black/40 border border-white/5">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 italic">Course Roadmap</h4>
                      <div className="space-y-6">
                        <div className="flex gap-4">
                           <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0">
                              <Play className="w-4 h-4 text-indigo-400" />
                           </div>
                           <p className="text-[11px] text-slate-400 font-medium italic">Video Lectures: High-fidelity conceptual synchronization for each Course Node.</p>
                        </div>
                        <div className="flex gap-4">
                           <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4 text-blue-400" />
                           </div>
                           <p className="text-[11px] text-slate-400 font-medium italic">Neural Practice: Execute 1000+ targeted questions across 4 complexity tiers (Easy to Expert).</p>
                        </div>
                      </div>
                   </div>
                   <div className="p-10 rounded-[3rem] bg-blue-600/10 border border-blue-500/20 flex flex-col justify-center text-center">
                      <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2 italic">Ready to Begin?</p>
                      <p className="text-white font-black text-lg uppercase italic tracking-tighter leading-none mb-6">Launch DNA Diagnostic</p>
                      <div className="flex justify-center">
                        <button 
                          onClick={() => startMassivePractice(`Diagnostic: ${selectedField}`, 'Medium')}
                          className="px-8 py-4 rounded-xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 group"
                        >
                          <div className="flex items-center gap-2">
                             <Sparkles className="w-4 h-4 animate-pulse" />
                             <span>Initialize Neural Test</span>
                             <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            )}
            
                {massivePracticeTopic ? (
                   /* Massive Practice View */
                   <div className="space-y-8 pb-32">
                      <div className="flex justify-between items-center bg-white/5 p-8 rounded-[3rem] border border-white/5">
                         <div>
                            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{massivePracticeTopic} • Assessment</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">High-Density AI Synthesis Active</p>
                         </div>
                         <div className="flex items-center gap-6">
                            {assessmentTimeLeft !== null && (
                              <div className="glass px-6 py-2 rounded-xl flex items-center gap-3 border border-red-500/30">
                                <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                                <span className="text-xl font-black text-white font-mono italic">
                                  {Math.floor(assessmentTimeLeft / 60)}:{String(assessmentTimeLeft % 60).padStart(2, '0')}
                                </span>
                              </div>
                            )}
                            <button 
                              onClick={() => {
                                setMassivePracticeTopic(null);
                                setAssessmentTimeLeft(null);
                              }}
                              className="px-8 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                            >
                               Terminate Protocol
                            </button>
                         </div>
                      </div>

                  <div className="flex flex-wrap gap-4 mb-10">
                     {(['Easy', 'Medium', 'Hard', 'Expert'] as const).map((diff) => (
                       <button
                         key={diff}
                         onClick={() => startMassivePractice(massivePracticeTopic, diff)}
                         className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                           massiveDifficulty === diff 
                           ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                           : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                         }`}
                       >
                         {diff} Mode
                       </button>
                     ))}
                  </div>

                  {isMassiveLoading ? (
                    <div className="p-20 text-center">
                       <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-6" />
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Initializing Neural Shards...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-8">
                       {massiveQuestions.map((q, i) => {
                         const hasAnswered = userMassiveAnswers[i] !== undefined;
                         const isCorrect = userMassiveAnswers[i] === q.correct;

                         return (
                           <motion.div 
                             key={i}
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             className={`p-10 rounded-[3rem] border transition-all ${
                               hasAnswered 
                                 ? (isCorrect ? 'bg-green-600/5 border-green-500/20' : 'bg-red-600/5 border-red-500/20')
                                 : 'bg-black/40 border-white/5'
                             }`}
                           >
                              <h5 className="text-xl font-black text-white mb-8 italic leading-tight tracking-tight">{q.text}</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {q.options.map((opt: string) => {
                                   const isSelected = userMassiveAnswers[i] === opt;
                                   const isOptionCorrect = opt === q.correct;
                                   
                                   return (
                                     <button 
                                       key={opt}
                                       disabled={hasAnswered}
                                       onClick={() => setUserMassiveAnswers(prev => ({ ...prev, [i]: opt }))}
                                       className={`p-6 rounded-2xl border text-left text-[11px] font-bold transition-all italic
                                         ${hasAnswered ? 
                                           (isOptionCorrect ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-600/20' : 
                                             (isSelected ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20' : 'bg-black/40 border-white/5 text-slate-700')) : 
                                           (isSelected ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400 hover:text-white')}`}
                                     >
                                        {opt}
                                     </button>
                                   );
                                 })}
                              </div>
                              {hasAnswered && !isCorrect && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="pt-8 border-t border-white/5 overflow-hidden"
                                >
                                   <div className="flex items-center gap-3 mb-4">
                                     <div className="w-2 h-2 rounded-full animate-pulse bg-red-500" />
                                     <span className="text-[10px] font-black uppercase tracking-widest italic text-red-500">
                                        Logic Discrepancy Detected • Resolution Required
                                     </span>
                                   </div>
                                   <p className="text-slate-400 text-xs italic leading-relaxed mb-6">{q.explanation}</p>
                                   {q.youtubeSearch && (
                                     <a 
                                       href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q.youtubeSearch)}`}
                                       target="_blank"
                                       rel="noreferrer"
                                       className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 transition-all text-[9px] font-black uppercase tracking-widest"
                                     >
                                       <Play className="w-3 h-3 fill-current" /> Technical Video Breakdown
                                     </a>
                                   )}
                                </motion.div>
                              )}
                              {hasAnswered && isCorrect && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="pt-8 border-t border-white/5 overflow-hidden text-center"
                                >
                                   <div className="flex items-center justify-center gap-3">
                                     <div className="w-2 h-2 rounded-full animate-pulse bg-green-500" />
                                     <span className="text-[10px] font-black uppercase tracking-widest italic text-green-500">
                                        Neural Match Verified
                                     </span>
                                   </div>
                                </motion.div>
                              )}
                           </motion.div>
                         );
                       })}
                    </div>
                  )}
               </div>
            ) : shardSubtopic ? (
              /* Practice Shards View */
              <div className={`grid grid-cols-1 ${isExpanded ? 'lg:grid-cols-1' : 'lg:grid-cols-5'} gap-10 transition-all duration-500`}>
                 {!isExpanded && (
                   <motion.div 
                     initial={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="lg:col-span-2 space-y-8"
                   >
                     <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/5">
                        <div>
                           <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-tight">{shardSubtopic}</h3>
                           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Node: {currentShardIndex + 1} / {generatedShards.length}</p>
                        </div>
                        <button 
                          onClick={() => setShardSubtopic(null)}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all focus:outline-none"
                        >
                           Close
                        </button>
                     </div>

                     {isGeneratingShards ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-6">
                           <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Initializing Mesh...</p>
                        </div>
                     ) : generatedShards.length > 0 && (
                        <motion.div 
                          key={currentShardIndex}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass p-8 rounded-[2.5rem] border border-white/5"
                        >
                          <h4 className="text-lg font-black text-white mb-8 italic tracking-tight leading-relaxed">{generatedShards[currentShardIndex].text}</h4>
                          <div className="grid grid-cols-1 gap-3">
                             {generatedShards[currentShardIndex].options.map((opt: string, i: number) => {
                                const isSelected = userShardAnswers[currentShardIndex] === opt;
                                const isCorrect = opt === generatedShards[currentShardIndex].correct;
                                 const hasAnswered = userShardAnswers[currentShardIndex] !== undefined;

                                 return (
                                   <button
                                     key={i}
                                     disabled={hasAnswered}
                                     onClick={() => {
                                       setUserShardAnswers(prev => ({ ...prev, [currentShardIndex]: opt }));
                                       if (opt === generatedShards[currentShardIndex].correct) {
                                          setTimeout(() => {
                                             if (currentShardIndex < generatedShards.length - 1) {
                                                setCurrentShardIndex(p => p + 1);
                                             }
                                          }, 1000);
                                       }
                                     }}
                                     className={`p-4 rounded-xl border text-left text-[10px] font-bold uppercase tracking-widest transition-all
                                       ${hasAnswered ? 
                                         (isCorrect ? 'bg-green-600/20 border-green-500 text-green-400' : 
                                           (isSelected ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-black/40 border-white/5 text-slate-700')) : 
                                         (isSelected ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400')}`}
                                   >
                                      {opt}
                                   </button>
                                );
                             })}
                          </div>
                        </motion.div>
                     )}
                   </motion.div>
                 )}

                 <div className={`${isExpanded ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-8`}>
                   <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2">
                              <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Logic Input Terminal</h5>
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                           </div>
                           <select 
                              value={shardLanguage}
                              onChange={(e) => setShardLanguage(e.target.value)}
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
                      
                      <div className="h-[400px] relative bg-black/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <CodeEditor 
                          code={userShardCode[currentShardIndex] || ''}
                          onChange={(val) => setUserShardCode(prev => ({ ...prev, [currentShardIndex]: val }))}
                          language={shardLanguage}
                          className={isExpanded ? 'text-xl md:text-2xl' : ''}
                        />
                      </div>

                      {userShardAnswers[currentShardIndex] && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4"
                        >
                           <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                             {generatedShards[currentShardIndex].deepAnalysis || generatedShards[currentShardIndex].explanation}
                           </p>
                        </motion.div>
                      )}

                      <div className="mt-8 flex justify-between items-center gap-4">
                         <button 
                           onClick={() => setCurrentShardIndex(p => Math.max(0, p - 1))}
                           disabled={currentShardIndex === 0}
                           className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                         >
                            Previous
                         </button>
                         <button 
                           onClick={async () => {
                              if (currentShardIndex < generatedShards.length - 1) {
                                 setCurrentShardIndex(p => p + 1);
                              } else {
                                 if (user) {
                                   await dataService.addDocument(`users/${user.uid}/learning`, {
                                     topicId: selectedTopic?.id,
                                     subtopicId: shardSubtopic,
                                     completed: true,
                                     lastAccessed: new Date().toISOString()
                                   });
                                   
                                   await dataService.addDocument(`users/${user.uid}/notifications`, {
                                     type: 'learning_complete',
                                     message: `Topic Verified: ${shardSubtopic}. Shards integrated into Knowledge Node.`,
                                     read: false,
                                     timestamp: new Date().toISOString()
                                   });
                                 }
                                 alert("Verification Complete! Result synced to your Profile.");
                                 setShardSubtopic(null);
                              }
                           }}
                           className="flex-1 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all rounded-xl shadow-lg shadow-blue-600/20"
                         >
                            {currentShardIndex < generatedShards.length - 1 ? 'Next Shard' : 'Finalize Sync'}
                         </button>
                      </div>
                   </div>
                 </div>
              </div>
            ) : selectedTopic ? (
              /* Course Content View */
              <div className="space-y-12">
                {/* Lecture Player Placeholder */}
                <section className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative">
                   <div className="aspect-video bg-black flex items-center justify-center group overflow-hidden relative">
                      {activeLecture?.youtubeVideoId ? (
                        <iframe 
                          width="100%" 
                          height="100%" 
                          src={`https://www.youtube.com/embed/${activeLecture.youtubeVideoId}?autoplay=0&rel=0`}
                          title={activeLecture.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          allowFullScreen
                          className="absolute inset-0"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />
                          <Play className="w-20 h-20 text-white opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all cursor-pointer relative z-20" />
                          
                          <div className="absolute bottom-8 left-8 z-20">
                             <div className="px-3 py-1 bg-blue-600 rounded text-[9px] font-black italic tracking-widest text-white mb-2 inline-block uppercase">Now Syncing</div>
                             <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{activeLecture?.title || selectedTopic.title}</h3>
                          </div>
                        </>
                      )}
                   </div>
                   
                   <div className="p-8 bg-black/40 backdrop-blur-xl border-t border-white/5 flex flex-wrap justify-between items-center gap-6">
                      <div className="flex gap-4">
                         {selectedTopic.lectures?.map(lecture => (
                            <button 
                              key={lecture.id}
                              onClick={() => setActiveLecture(lecture)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                                ${activeLecture?.id === lecture.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                            >
                               {lecture.title}
                            </button>
                         ))}
                      </div>
                      <div className="flex gap-2">
                         <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-widest">{activeLecture?.duration}</div>
                         <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-widest">{activeLecture?.type}</div>
                      </div>
                   </div>
                </section>

                {/* Shard Grid */}
                <section className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter border-l-4 border-blue-600 pl-6">Verification Shards</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 ml-6">Initialize high-density neural stress tests across sub-nodes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedTopic.subtopics.map((st, i) => (
                       <motion.div
                         key={st.id}
                         onClick={() => generate100Shards(st.title)}
                         className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-blue-500/20 transition-all text-left relative overflow-hidden group cursor-pointer"
                       >
                          <div className="flex justify-between items-start mb-6">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Target className="w-6 h-6" />
                             </div>
                             <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic group-hover:text-blue-500 transition-colors">Fragment 0{i + 1}</span>
                          </div>
                          <h4 className="text-xl font-black text-white mb-2 italic tracking-tight uppercase group-hover:text-blue-400 transition-colors">{st.title}</h4>
                          <p className="text-[10px] text-slate-600 font-bold uppercase italic">Requires validation protocol • 100 Points XP</p>
                          
                          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 generate100Shards(st.title);
                               }}
                               className="flex-1 flex items-center justify-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest transition-all bg-blue-500/10 px-4 py-3 rounded-xl border border-blue-500/20 active:scale-95 hover:bg-blue-600 hover:text-white"
                             >
                               Generate Shards <Sparkles className="w-3 h-3" />
                             </button>
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 startMassivePractice(st.title, 'Medium');
                               }}
                               className="flex-1 flex items-center justify-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest transition-all bg-indigo-500/10 px-4 py-3 rounded-xl border border-indigo-500/20 active:scale-95 hover:bg-indigo-600 hover:text-white"
                             >
                               Practice 1000+ <BookOpen className="w-3 h-3" />
                             </button>
                          </div>

                          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-600/5 blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-all" />
                       </motion.div>
                    ))}
                  </div>
                </section>

                {/* AI-Generated Assessments Section */}
                <section className="space-y-8 pt-12 border-t border-white/5">
                   <div className="flex justify-between items-end">
                      <div>
                         <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">AI Standardized Assessments</h3>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Generate 5 timed AI-powered questions for deep certification readiness.</p>
                      </div>
                   </div>
                   
                   <div className="glass p-10 rounded-[3rem] border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Career Field Path</label>
                         <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none">
                            <option>{selectedField}</option>
                            <option>Fullstack Engineer</option>
                            <option>Cloud Architect</option>
                            <option>SRE Specialist</option>
                         </select>
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Complexity Tier</label>
                         <select 
                           className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                           onChange={(e) => setMassiveDifficulty(e.target.value as any)}
                         >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                            <option value="Expert">Expert</option>
                         </select>
                      </div>
                      <div className="flex items-end">
                         <button 
                           onClick={async () => {
                             await startMassivePractice(`Standardized: ${selectedTopic.title}`, massiveDifficulty);
                             setAssessmentTimeLeft(5 * 60); // 5 minutes for 5 questions
                           }}
                           className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                         >
                            <Zap className="w-4 h-4" /> Initialize 5-Min Test
                         </button>
                      </div>
                   </div>
                </section>

                {/* Progress Stats */}
                <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-12">
                   <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                         <Trophy className="w-10 h-10 text-indigo-500" />
                      </div>
                      <div>
                         <h4 className="text-xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Specialization Progress</h4>
                         <div className="flex items-center gap-4 mt-2">
                            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-600 w-1/3" />
                            </div>
                            <span className="text-xs font-black text-blue-500 italic">33% SYNC</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="text-center px-6">
                         <p className="text-[8px] font-black text-slate-600 uppercase mb-1">XP Points</p>
                         <p className="text-lg font-black text-white italic tracking-tighter">14,200</p>
                      </div>
                      <div className="text-center border-l border-white/10 px-6">
                         <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Rank</p>
                         <p className="text-lg font-black text-blue-500 italic tracking-tighter">SILVER IV</p>
                      </div>
                   </div>
                </section>
              </div>
            ) : null}

            {/* Company Preparation View */}
            {currentView === 'company-prep' && !selectedTopic && !shardSubtopic && (
              <div className="space-y-12">
                {isCompanyLoading ? (
                  <div className="py-40 flex flex-col items-center justify-center space-y-6">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Scanning Company Data Mesh...</p>
                  </div>
                ) : companyData && selectedCompany ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12 pb-32"
                  >
                     <div className="glass p-12 rounded-[4rem] border border-white/5 bg-blue-600/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10"><Target className="w-32 h-32 text-blue-500" /></div>
                        <div className="relative z-10">
                           <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">{selectedCompany} <span className="text-blue-500">Preparation Protocol</span></h2>
                           <p className="text-slate-400 font-medium italic mb-10 max-w-2xl">
                             Deep analysis of hiring logic and technical expectations for {selectedField} roles at {selectedCompany}.
                           </p>
                           <div className="flex gap-4">
                              <button 
                                onClick={() => startMassivePractice(`Interview: ${selectedCompany}`, 'Expert')}
                                className="px-8 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 transition-all"
                              >
                                Initialize Test Protocol
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Requirements */}
                        <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-8">
                           <div>
                              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">Standard Requirements</h3>
                              <p className="text-2xl font-black text-white italic tracking-tighter uppercase">Expectation Mesh</p>
                           </div>
                           <ul className="space-y-4">
                              {companyData.requirements.map((req, i) => (
                                 <li key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 italic text-[11px] font-medium text-slate-400">
                                    <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                       <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                    </div>
                                    {req}
                                 </li>
                              ))}
                           </ul>
                        </div>

                        {/* Interview Process */}
                        <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-8">
                           <div>
                              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 italic">Walkthrough Logic</h3>
                              <p className="text-2xl font-black text-white italic tracking-tighter uppercase">Interview Journey</p>
                           </div>
                           <div className="space-y-4 relative">
                              <div className="absolute left-6 top-4 bottom-4 w-px bg-white/10" />
                              {companyData.interviewProcess.map((step, i) => (
                                 <div key={i} className="flex gap-6 items-center relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center font-black text-xs text-indigo-400 italic">
                                       0{i + 1}
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-tight italic">{step}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     {/* 100+ Questions Preview */}
                     <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-10">
                        <div className="flex justify-between items-end">
                           <div>
                              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">The extraction Lab</h3>
                              <p className="text-3xl font-black text-white italic tracking-tighter uppercase">100+ High-Frequency Exam Patterns</p>
                           </div>
                           <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Verified by AI</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {companyData.questions.slice(0, 10).map((q, i) => (
                              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all flex gap-4">
                                 <Zap className="w-4 h-4 text-blue-500 shrink-0" />
                                 <p className="text-[11px] font-medium text-slate-400 italic">{q}</p>
                                 <button 
                                   onClick={(e) => {
                                      e.stopPropagation();
                                      setExplainerTopic(q);
                                   }}
                                   className="ml-auto w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                                 >
                                   <Play className="w-3 h-3" />
                                 </button>
                              </div>
                           ))}
                           <div className="col-span-full text-center p-12 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-6 animate-pulse italic">Scanning remaining 90+ Patterns for your Neural Profile...</p>
                              <button 
                                onClick={() => startMassivePractice(`Questions: ${selectedCompany}`, 'Expert')}
                                className="px-10 py-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                              >
                                Start 100+ Question Simulation
                              </button>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-40">
                    <Target className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                    <h2 className="text-4xl font-black text-white/5 uppercase italic tracking-tighter">Select Company Node</h2>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
        {/* Neural Explainer (Short Video) Overlay */}
        <AnimatePresence>
          {explainerTopic && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            >
              <div className="relative w-full max-w-[400px] aspect-[9/16] glass rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                 <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(explainerTopic + ' technical concept animation short')}&autoplay=1`}
                    title="Neural Explainer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="absolute inset-0"
                 />
                 <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none">
                    <div className="glass px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Live Neural Explanation</span>
                    </div>
                    <button 
                      onClick={() => setExplainerTopic(null)}
                      className="w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center text-white text-xl font-bold hover:bg-white/10 transition-all pointer-events-auto"
                    >
                      ×
                    </button>
                 </div>
                 <div className="absolute bottom-12 left-12 right-12 pointer-events-none">
                    <h5 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{explainerTopic}</h5>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Powered by Gemini Visualizer Engine</p>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
