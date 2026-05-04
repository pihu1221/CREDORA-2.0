import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Target, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  BrainCircuit, 
  ShieldCheck, 
  Trophy,
  Activity,
  ChevronRight,
  Play,
  Grid,
  X,
  Search,
  BookOpen,
  Filter,
  Info,
  HelpCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { CAREER_PATHS } from '../data/careerData';
import { parseAIResponse, askGemini } from '../services/geminiService';

const HEATMAP_DATA = [
  { id: 1, branch: 'CS', skill: 'DS & Algo', score: 85, students: ['Rahul S.', 'Priya M.', 'Amit K.'] },
  { id: 2, branch: 'CS', skill: 'Web Dev', score: 92, students: ['Sameer V.', 'Neha R.'] },
  { id: 3, branch: 'CS', skill: 'AI/ML', score: 45, students: ['Vikram T.', 'Sanjana P.'] },
  { id: 4, branch: 'IT', skill: 'DS & Algo', score: 78, students: ['Arjun L.', 'Kavita B.'] },
  { id: 5, branch: 'IT', skill: 'Web Dev', score: 88, students: ['Rohan G.', 'Ishani S.'] },
  { id: 6, branch: 'IT', skill: 'AI/ML', score: 38, students: ['Deepak M.', 'Anjali F.'] },
  { id: 7, branch: 'ECE', skill: 'DS & Algo', score: 55, students: ['Manoj H.', 'Sneha J.'] },
  { id: 8, branch: 'ECE', skill: 'Web Dev', score: 42, students: ['Pankaj D.', 'Tanvi C.'] },
  { id: 9, branch: 'ECE', skill: 'Core Eng', score: 82, students: ['Gaurav B.', 'Akash N.'] },
];

const READINESS_DATA = [
  { name: 'Placement Ready', value: 65, color: '#22c55e' },
  { name: 'Needs Improvement', value: 25, color: '#eab308' },
  { name: 'High Risk', value: 10, color: '#ef4444' },
];

const COMPANY_ALIGNMENT_DATA = [
  {
    company: 'TCS (Digital)',
    requirements: ['SQL', 'Python', 'DS & Algo'],
    matches: 82,
    gap: 'Advanced System Design'
  },
  {
    company: 'Infosys (Power)',
    requirements: ['Java/Spring', 'Microservices', 'React'],
    matches: 65,
    gap: 'Distributed Systems'
  },
  {
    company: 'Wipro (Turbo)',
    requirements: ['C++', 'Cloud Basics', 'Cybersecurity'],
    matches: 74,
    gap: 'Cloud Security Compliance'
  },
];

export function Institutions() {
  const { theme } = useTheme();
  const [selectedCell, setSelectedCell] = useState<typeof HEATMAP_DATA[0] | null>(null);
  const [showToolbarTool, setShowToolbarTool] = useState(false);
  const [showAlignmentDetails, setShowAlignmentDetails] = useState(false);

  // Gemini Practice States
  const [selectedTopic, setSelectedTopic] = useState<string>('Data Structures & Algorithms (DSA)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [practiceQuestion, setPracticeQuestion] = useState<{
    text: string;
    options: string[];
    correctAnswer: string;
    analysis: string;
  } | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Extract all topics from CAREER_PATHS
  const allTopics = Object.values(CAREER_PATHS).flatMap(path => path.topics.map(t => t.title));

  const generateAIQuestion = async (topic: string) => {
    setIsGenerating(true);
    setPracticeQuestion(null);
    setUserAnswer(null);
    setShowAnalysis(false);

    try {
      const prompt = `Generate a high-quality, technically rigorous multiple choice question for the topic: "${topic}".
      Return ONLY a JSON object with this EXACT structure:
      {
        "text": "The question text...",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The exact string of the correct option",
        "analysis": "A deep, tactical analysis of why this answer is correct and why others might be tempting but wrong. Focus on industrial application and efficiency."
      }
      The question should be different every time and vary in complexity (Intermediate to Expert).`;

      const aiText = await askGemini(prompt, [], 'EN');

      const parsed = parseAIResponse(aiText || "{}");
      setPracticeQuestion(parsed);
    } catch (error) {
      console.error("AI Question Generation Error:", error);
      // Fallback
      setPracticeQuestion({
        text: `Technical Scenario in ${topic}: How would you optimize the neural sync for high-concurrency event loops?`,
        options: ["Asynchronous Batching", "Linear Backoff", "Thread Pooling", "Gossip-based Propagation"],
        correctAnswer: "Asynchronous Batching",
        analysis: "Asynchronous batching reduces syscall overhead by grouping multiple neural signals into a single I/O operation, critical for ${topic} at scale."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (showToolbarTool && !practiceQuestion) {
      generateAIQuestion(selectedTopic);
    }
  }, [showToolbarTool]);

  const getHeatmapColor = (score: number) => {
    if (score >= 80) return theme === 'light' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30';
    if (score >= 50) return theme === 'light' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30';
    return theme === 'light' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30';
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-slate-950'} transition-colors duration-500`}>
      {/* Practice Floating Toolbar */}
      <div className="fixed right-8 top-32 z-50 flex flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowToolbarTool(!showToolbarTool)}
          className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center relative overflow-hidden group"
        >
          <HelpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform rounded-full" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showToolbarTool && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed right-20 top-32 w-96 p-8 rounded-[2.5rem] border z-50 backdrop-blur-3xl overflow-hidden shadow-3xl ${
              theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/95 border-white/10'
            }`}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 italic">Neural Practice Hub</h4>
                <p className={`text-sm font-black italic ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Instant Logic Assessment</p>
              </div>
              <button 
                onClick={() => setShowToolbarTool(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Topic Selector */}
            <div className="mb-8">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Choose Target Domain</label>
              <div className="relative">
                <select 
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    generateAIQuestion(e.target.value);
                  }}
                  className={`w-full p-4 pr-10 rounded-2xl border text-[10px] font-black appearance-none cursor-pointer focus:outline-none transition-all ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  {allTopics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-40" />
              </div>
            </div>

            <div className={`p-6 rounded-[2rem] min-h-[300px] flex flex-col justify-center border ${
              theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-black/40 border-white/5'
            }`}>
              {isGenerating ? (
                <div className="text-center py-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="inline-block mb-4"
                  >
                    <Loader2 className="w-10 h-10 text-blue-500" />
                  </motion.div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Synthesizing Logic...</p>
                </div>
              ) : practiceQuestion ? (
                <div className="space-y-6">
                  <p className={`text-xs font-bold leading-relaxed italic ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    "{practiceQuestion.text}"
                  </p>
                  <div className="space-y-3">
                    {practiceQuestion.options.map((opt) => (
                      <button 
                        key={opt} 
                        disabled={!!userAnswer}
                        onClick={() => setUserAnswer(opt)}
                        className={`w-full p-4 text-[10px] font-black uppercase rounded-xl border text-left transition-all relative overflow-hidden group ${
                          userAnswer === opt 
                          ? (opt === practiceQuestion.correctAnswer ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white')
                          : (theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300' : 'border-white/5 bg-white/5 hover:bg-white/10')
                        }`}
                      >
                        {opt}
                        {userAnswer && opt === practiceQuestion.correctAnswer && (
                          <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>

                  {userAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-6 border-t border-white/5"
                    >
                      <button 
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest mb-4 group"
                      >
                        {showAnalysis ? 'Hide Analysis' : 'Show Deep Analysis'}
                        <ArrowRight className={`w-3 h-3 group-hover:translate-x-1 transition-transform ${showAnalysis ? 'rotate-90' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {showAnalysis && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10 overflow-hidden"
                          >
                            <p className="text-[10px] text-blue-400 font-bold leading-relaxed italic">
                              {practiceQuestion.analysis}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button 
                        onClick={() => generateAIQuestion(selectedTopic)}
                        className="w-full mt-6 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all shadow-xl"
                      >
                        Next Intelligence Shard
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : null}
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-3 opacity-40">
              <BrainCircuit className="w-4 h-4 text-blue-500" />
              <p className="text-[8px] font-black text-slate-500 uppercase italic tracking-[0.2em]">Neural Engine v3.14 (FastSync)</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-8">
              Institution Intelligence <ChevronRight className="w-3 h-3" />
            </span>
            <h1 className={`text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Turn Placement Chaos into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 italic">Data-Driven Success</span>
            </h1>
            <p className={`max-w-2xl mx-auto text-lg mb-12 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Credora helps colleges track student skill gaps, predict placement readiness, and align with company requirements — all in one powerful dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                theme === 'light' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800' : 'bg-white text-slate-950 shadow-2xl shadow-blue-500/20 hover:bg-blue-50'
              }`}>
                Request Demo
              </button>
              <Link to="/ai-test" className={`px-10 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all ${
                theme === 'light' ? 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}>
                View Sample Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Interactive Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mt-24 max-w-5xl mx-auto rounded-[3rem] border p-4 sm:p-8 backdrop-blur-xl ${
              theme === 'light' ? 'bg-white/80 shadow-[0_50px_100px_rgba(0,0,0,0.05)] border-slate-200/60' : 'bg-slate-900/40 border-white/10 shadow-2xl'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`font-black text-xs uppercase tracking-[0.2em] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Skill Gap Heatmap (Departmental)</h3>
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded bg-green-500/20" />
                    <span className="w-3 h-3 rounded bg-red-500/20" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 relative">
                  {HEATMAP_DATA.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedCell(item)}
                      className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group relative ${getHeatmapColor(item.score)}`}
                    >
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-4 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                         <div className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl ${
                           theme === 'light' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                         }`}>
                           {item.branch} • {item.score}% Readiness
                         </div>
                      </div>

                      <span className="text-[10px] font-black uppercase opacity-60 tracking-wider font-mono">{item.branch}</span>
                      <span className="text-xl font-black italic">{item.score}%</span>
                      <span className="text-[8px] font-bold uppercase tracking-tighter text-center">{item.skill}</span>
                    </motion.div>
                  ))}

                  <AnimatePresence>
                    {selectedCell && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         className={`absolute inset-0 z-40 p-6 rounded-3xl border backdrop-blur-2xl flex flex-col ${
                           theme === 'light' ? 'bg-white/95 border-slate-200' : 'bg-slate-900/95 border-white/10'
                         }`}
                       >
                          <div className="flex justify-between items-center mb-6">
                             <div>
                                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">{selectedCell.branch} • {selectedCell.skill}</h4>
                                <p className={`text-xl font-black italic ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Top Performers</p>
                             </div>
                             <button onClick={() => setSelectedCell(null)} className="p-2 rounded-full hover:bg-white/10 transition-all"><X className="w-5 h-5" /></button>
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-3">
                             {selectedCell.students.map((student, i) => (
                               <div key={i} className={`p-4 rounded-xl border flex justify-between items-center ${
                                 theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'
                               }`}>
                                  <span className={`text-[11px] font-black italic ${theme === 'light' ? 'text-slate-700' : 'text-white'}`}>{student}</span>
                                  <button className="px-3 py-1 bg-blue-600 text-[8px] font-black uppercase rounded text-white italic">View DNA</button>
                               </div>
                             ))}
                          </div>
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex flex-col justify-between p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                <h3 className={`font-black text-xs uppercase tracking-[0.2em] mb-6 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Placement Prediction</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={READINESS_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {READINESS_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4">
                  {READINESS_DATA.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className={`py-32 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/30'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-20 items-center">
            <div className="flex-1">
              <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">The Bottleneck</span>
              <h2 className={`text-4xl md:text-5xl font-black mb-10 leading-tight tracking-tight ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                Placement Cells Are Working <br />
                <span className="text-slate-500 italic">Without Clear Data</span>
              </h2>
              <p className={`text-lg mb-8 leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Most colleges don’t know which skills students are lacking until placement season begins. By then, it’s too late to fix major gaps.
              </p>
              
              <div className="space-y-4">
                {[
                  "Guessing student readiness",
                  "Reacting at the last moment",
                  "Missing chances to improve results"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                      <ChevronRight className="w-3 h-3" />
                    </div>
                    <span className={`font-black text-xs uppercase tracking-widest opacity-80 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{item}</span>
                  </div>
                ))}
              </div>

              <p className="mt-12 text-sm font-black uppercase italic tracking-widest text-red-500/60">
                "They are flying blind — and it affects placement outcomes."
              </p>
            </div>
            <div className="flex-1 relative">
               <div className={`aspect-square rounded-[3rem] p-10 flex flex-col justify-center border ${
                 theme === 'light' ? 'bg-white shadow-xl border-slate-200' : 'bg-slate-900/60 border-white/5'
               }`}>
                  <BarChart3 className="w-16 h-16 text-red-500 mb-8 opacity-20" />
                  <div className="space-y-8">
                     <div className="h-2 bg-slate-800/10 rounded-full overflow-hidden w-full">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: '85%' }} className="h-full bg-red-500" />
                     </div>
                     <div className="h-2 bg-slate-800/10 rounded-full overflow-hidden w-[80%]">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: '70%' }} className="h-full bg-red-400" />
                     </div>
                     <div className="h-2 bg-slate-800/10 rounded-full overflow-hidden w-[90%]">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: '95%' }} className="h-full bg-red-600" />
                     </div>
                  </div>
                  <div className="mt-12 text-[10px] font-black text-slate-500 uppercase tracking-widest">Late Stage Skill Breakdown (Typical)</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">The Credora Edge</span>
            <h2 className={`text-4xl md:text-6xl font-black mb-8 italic tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              One Dashboard. <span className="text-blue-500">Complete Visibility.</span>
            </h2>
            <p className={`max-w-2xl mx-auto text-lg mb-16 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Credora gives real-time insights into student skills, performance, and industry alignment — helping colleges take early action and improve placement results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Skill Gap Heatmap",
                icon: Grid,
                color: "blue",
                desc: "Instantly identify weak areas across departments and organize targeted training before it's too late."
              },
              {
                title: "Batch-Level Prediction",
                icon: Activity,
                color: "green",
                desc: "Predict outcomes months in advance based on technical DNA and behavioral metrics."
              },
              {
                title: "Company-Skill Alignment",
                icon: Target,
                color: "indigo",
                action: () => setShowAlignmentDetails(true),
                desc: "Match student skills with recruiter expectations like TCS, Infosys, and Wipro automatically."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                onClick={feature.action}
                className={`p-10 rounded-[3rem] border text-left transition-all group relative overflow-hidden ${
                  feature.action ? 'cursor-pointer' : ''
                } ${
                  theme === 'light' ? 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-slate-200' : 'bg-slate-900/40 border-white/5'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-all group-hover:scale-110 ${
                  feature.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 
                  feature.color === 'green' ? 'bg-green-500/10 text-green-500' : 
                  'bg-indigo-500/10 text-indigo-500'
                }`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className={`text-2xl font-black mb-6 italic tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{feature.title}</h4>
                <p className={`text-sm leading-relaxed font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {feature.desc}
                </p>

                {feature.action && (
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 group-hover:gap-4 transition-all">
                    View Alignment <ArrowRight className="w-4 h-4" />
                  </div>
                )}

                <AnimatePresence>
                  {feature.title === "Company-Skill Alignment" && showAlignmentDetails && (
                    <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className={`absolute inset-0 z-50 p-8 flex flex-col justify-between ${
                        theme === 'light' ? 'bg-white' : 'bg-slate-900 shadow-2xl'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h5 className="font-black text-xs uppercase tracking-widest">Industry Alignment Map</h5>
                        <button onClick={(e) => { e.stopPropagation(); setShowAlignmentDetails(false); }} className="p-1 hover:bg-slate-100 rounded-full dark:hover:bg-white/5">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-4 overflow-y-auto pr-2">
                        {COMPANY_ALIGNMENT_DATA.map((company, i) => (
                          <div key={i} className={`p-4 rounded-2xl border ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase text-indigo-500">{company.company}</span>
                              <span className="text-[10px] font-black">{company.matches}% Match</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {company.requirements.map(req => (
                                <span key={req} className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-bold rounded uppercase">{req}</span>
                              ))}
                            </div>
                            <p className="text-[9px] font-bold text-red-500 uppercase tracking-tighter italic">Gap: {company.gap}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className={`py-32 ${theme === 'light' ? 'bg-slate-950 text-white' : 'bg-blue-600 text-white'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-12 italic tracking-tighter leading-tight">
                Why Top Institutions <br /> Choose Credora
              </h2>
              <div className="space-y-8">
                {[
                  "Improve placement percentage by up to 40%",
                  "Make objective, data-driven decisions",
                  "Prepare students earlier with targeted training",
                  "Reduce last-minute pressure on TPOs",
                  "Improve NAAC rankings and institutional reputation"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-5">
                    <div className="mt-1 w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold opacity-90">{point}</span>
                  </div>
                ))}
              </div>
              <p className="mt-16 text-xs font-black uppercase tracking-[0.5em] opacity-60">Better insights lead to better placements.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-6 pt-12">
                  <div className="p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/10 aspect-square flex flex-col justify-center text-center">
                     <span className="text-4xl font-black mb-2 italic">98%</span>
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Recall Accuracy</span>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/10 aspect-[4/5] flex flex-col justify-center text-center">
                     <Users className="w-10 h-10 mx-auto mb-6 opacity-30" />
                     <span className="text-3xl font-black mb-2 italic">50k+</span>
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Students Mapped</span>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/10 aspect-[4/5] flex flex-col justify-center text-center">
                     <Trophy className="w-10 h-10 mx-auto mb-6 opacity-30" />
                     <span className="text-3xl font-black mb-2 italic">120+</span>
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Partnerships</span>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/10 aspect-square flex flex-col justify-center text-center">
                     <ShieldCheck className="w-10 h-10 mx-auto mb-6 opacity-30" />
                     <span className="text-2xl font-black mb-2 italic tracking-tighter">B2B Standard</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Explanation */}
      <section className="py-32 bg-white">
         <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="p-3 bg-green-500/10 rounded-full inline-block mb-10">
               <Activity className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-8 italic tracking-tighter">A Health Report for Student Employability</h2>
            <p className="text-lg text-slate-600 mb-12 leading-relaxed font-medium">
              Credora works like a real-time health report for your entire student batch. We measure strengths, weaknesses, and progress over time so colleges fix problems early instead of reacting late.
            </p>
            <div className={`p-8 rounded-[2rem] border border-slate-200 text-left bg-slate-50 relative overflow-hidden`}>
               <div className="flex gap-4 items-center mb-6">
                  <div className="w-2 h-10 bg-blue-600 rounded-full" />
                  <h4 className="font-black text-slate-900 uppercase tracking-widest">Real-time Vitals</h4>
               </div>
               <ul className="space-y-4">
                  <li className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 italic font-bold text-slate-900">
                     <span>Technical Core DNA</span>
                     <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] rounded-lg">88% Stable</span>
                  </li>
                  <li className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 italic font-bold text-slate-900">
                     <span>Logical Reasoning Baseline</span>
                     <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] rounded-lg">Processing</span>
                  </li>
                  <li className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 italic font-bold text-slate-900">
                     <span>Industry Compatibility</span>
                     <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] rounded-lg">Gap Detected: Python</span>
                  </li>
               </ul>
            </div>
         </div>
      </section>

      {/* Business Value */}
      <section className={`py-32 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/20'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mb-20">
            <span className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Institutional Framework</span>
            <h2 className={`text-4xl md:text-5xl font-black mb-8 italic tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
               Built for Institutions, <br /> <span className="text-indigo-500">Not Just Students</span>
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Credora is a B2B platform that colleges adopt and provide to all students. This ensures higher adoption, better results, and a scalable impact across every branch of study.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Scalable Deployment", val: "One-Click Hub" },
              { label: "Faculty Dashboard", val: "Granular Control" },
              { label: "Integration Ready", val: "ERP/LMS Sync" },
              { label: "Placement Predictor", val: "AI Algorithmic" }
            ].map((stat, i) => (
              <div key={i} className={`p-8 rounded-[2rem] border ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-white/5'
              }`}>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                <p className={`text-xl font-black italic ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-40 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600 blur-[150px] rounded-full" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight uppercase italic">
               Start Improving <br /> <span className="text-blue-500">Placement Results</span> Today
            </h2>
            <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium">
               Deploy the predictive power of Credora in your institution and bridge the gap between education and employability.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <button className="w-full sm:w-auto px-12 py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all shadow-2xl active:scale-95">
                  Book a Demo Integration
               </button>
               <button className="w-full sm:w-auto px-12 py-5 rounded-[2rem] bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all active:scale-95 backdrop-blur-xl">
                  Contact Sales Office
               </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Corporate Footer Link */}
      <footer className={`py-20 border-t ${theme === 'light' ? 'bg-white border-slate-100' : 'bg-slate-950 border-white/5'}`}>
         <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic">Cr</div>
                  <span className={`text-xl font-black uppercase tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Credora Business</span>
               </div>
               <div className="flex gap-10">
                  {["Terms", "Privacy", "SLA", "Security"].map((link, i) => (
                    <a key={i} href="#" className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'light' ? 'text-slate-400 hover:text-slate-900' : 'text-slate-600 hover:text-white'}`}>
                      {link}
                    </a>
                  ))}
               </div>
            </div>
            
            <div className={`pt-12 border-t text-center ${theme === 'light' ? 'border-slate-100' : 'border-white/5'}`}>
               <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-4 flex items-center justify-center gap-3 ${theme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>
                 <BrainCircuit className="w-4 h-4" /> Powered by Gemini Neural Engine
               </p>
               <p className={`text-[8px] font-bold max-w-2xl mx-auto leading-relaxed uppercase tracking-widest ${theme === 'light' ? 'text-slate-300' : 'text-slate-700'}`}>
                  © 2026 Credora Institutions. All assessment logic, technical questions, and neural mapping are generated using Google Gemini Models. Historical data and benchmarks are synthesized from public institutional data and industry standards. 
               </p>
            </div>
         </div>
      </footer>
    </div>
  );
}
