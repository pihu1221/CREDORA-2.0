import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Stethoscope, Briefcase, Landmark, Scroll, 
  ArrowRight, CheckCircle2, Play, Loader2, Sparkles,
  Trophy, BrainCircuit, Clock, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CareerField, ExperienceLevel } from '../types/career';
import { generateTestByField } from '../services/geminiService';

const CATEGORIES = [
  { 
    id: 'Engineer', 
    icon: <Building2 className="w-8 h-8" />, 
    color: 'blue',
    description: 'Master the art of building scalable, secure, and intelligent systems.',
    specializations: [
      { 
        id: 'Software Engineer', 
        label: 'Software Engineering', 
        desc: 'Coding, Algorithm Design, AI',
        subDomains: [
          { id: 'Data Analysis', label: 'Data Analysis', desc: 'Big Data, Visualization, Insights' },
          { id: 'Cybersecurity', label: 'Cybersecurity', desc: 'Ethical Hacking, Network Defense' },
          { id: 'Cloud Computing', label: 'Cloud Computing', desc: 'AWS, Azure, Infrastructure' }
        ]
      }
    ]
  }
];

export function Onboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'field-selection' | 'sub-field-selection' | 'domain-selection' | 'level-selection' | 'diagnostic' | 'completion'>('field-selection');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedField, setSelectedField] = useState<CareerField | null>(null);
  const [selectedSubDomain, setSelectedSubDomain] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | null>(null);
  
  // Test State
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'finished'>('idle');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);

  const selectCategory = (category: any) => {
    setSelectedCategory(category);
    setStep('sub-field-selection');
  };

  const startDiagnostic = async () => {
    if (!selectedField || !selectedLevel) return;
    
    setStep('diagnostic');
    setStatus('loading');
    
    try {
      // Pass sub-domain context if available
      const context = selectedSubDomain ? `${selectedField} (${selectedSubDomain})` : selectedField;
      const generated = await generateTestByField(context as any, selectedLevel, 5);
      if (generated && generated.length > 0) {
        setQuestions(generated);
        setStatus('active');
        const interval = setInterval(() => {
          setTimeElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
      }
    } catch (error) {
      console.error("Test generation failed", error);
      setStatus('idle');
    }
  };

  const handleAnswer = (answer: string) => {
    setUserAnswers(prev => ({ ...prev, [currentIndex]: answer }));
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      setStatus('finished');
      setStep('completion');
    }
  };

  const calculateScore = () => {
    if (!questions || questions.length === 0) return 0;
    const correctItems = questions.filter((q, i) => {
      const userAns = userAnswers[i]?.toString().trim().toLowerCase();
      const correctAns = q.correctAnswer?.toString().trim().toLowerCase();
      return userAns === correctAns;
    });
    return Math.round((correctItems.length / questions.length) * 100);
  };

  const [isFinishing, setIsFinishing] = useState(false);

  const finalizeOnboarding = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    
    try {
      const score = calculateScore();
      
      // Save to Firestore
      if (user && selectedField && selectedLevel) {
        localStorage.setItem('credo_diagnostic_completed', 'true');
        localStorage.setItem('student_career_field', selectedField);
        localStorage.setItem('student_sub_domain', selectedSubDomain || '');
        localStorage.setItem('student_diagnostic_score', score.toString());
        
        await updateProfile({
          careerField: selectedField,
          subDomain: selectedSubDomain || '',
          experienceLevel: selectedLevel,
          onboardingScore: score,
          diagnosticCompleted: true,
          isBountyReady: false,
          points: 0,
          balance: 0,
          completedBountiesCount: 0
        });
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to finalize onboarding:", error);
      // Still attempt navigation as fallback
      navigate('/dashboard');
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="glow-indigo top-[-20%] left-[-20%] opacity-20" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {step === 'field-selection' && (
            <motion.div 
              key="fields"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Choose Your <span className="text-blue-500">Domain</span></h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Initializing Career DNA Mapping</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {CATEGORIES.map((field) => (
                  <button
                    key={field.id}
                    onClick={() => selectCategory(field)}
                    className="group relative p-8 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-blue-500/50 transition-all text-left flex flex-col justify-between min-h-[320px] overflow-hidden"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-${field.color}-600/10 border border-${field.color}-500/20 flex items-center justify-center text-${field.color}-500 group-hover:scale-110 transition-transform`}>
                      {field.icon}
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">{field.id}</h3>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">{field.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                      Select Path <ArrowRight className="w-3 h-3" />
                    </div>

                    <div className={`absolute inset-0 bg-${field.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'sub-field-selection' && selectedCategory && (
            <motion.div 
              key="sub-fields"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <button 
                  onClick={() => setStep('field-selection')}
                  className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 hover:underline"
                >
                  ← Back to Domains
                </button>
                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Select <span className="text-blue-500">Specialization</span></h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Focusing {selectedCategory.id} Neural Pathways</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {selectedCategory.specializations.map((spec: any) => (
                  <button
                    key={spec.id}
                    onClick={() => {
                      setSelectedField(spec.id as CareerField);
                      if (spec.subDomains) {
                        setStep('domain-selection');
                      } else {
                        setStep('level-selection');
                      }
                    }}
                    className="group relative p-10 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-blue-500/50 transition-all text-left overflow-hidden"
                  >
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-3">{spec.label}</h3>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest mb-6">{spec.desc}</p>
                      
                      <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                        {spec.subDomains ? 'View Domains' : 'Define Level'} <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>

                    <div className={`absolute inset-0 bg-${selectedCategory.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'domain-selection' && selectedField && (
            <motion.div 
              key="domains"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <button 
                  onClick={() => setStep('sub-field-selection')}
                  className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 hover:underline"
                >
                  ← Back to Specialization
                </button>
                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Choose <span className="text-blue-500">Domain</span></h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Narrowing Focus to Targeted Nodes</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {selectedCategory.specializations.find((s: any) => s.id === selectedField)?.subDomains?.map((sub: any) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubDomain(sub.id);
                      setStep('level-selection');
                    }}
                    className="group relative p-10 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-blue-500/50 transition-all text-left overflow-hidden min-h-[260px] flex flex-col justify-between"
                  >
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-3 leading-none">{sub.label}</h3>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">{sub.desc}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                      Select Path <ArrowRight className="w-3 h-3" />
                    </div>

                    <div className={`absolute inset-0 bg-${selectedCategory.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'level-selection' && selectedField && (
            <motion.div 
              key="level-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <button 
                  onClick={() => setStep('sub-field-selection')}
                  className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 hover:underline"
                >
                  ← Back to Specializations
                </button>
                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Your <span className="text-blue-500">Current Phase</span></h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Calibrating Diagnostic Difficulty for {selectedField}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
                {(['1st Year', '2nd Year', '3rd Year', 'Final Year', 'Job Ready'] as ExperienceLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSelectedLevel(level);
                      startDiagnostic();
                    }}
                    className="group relative p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-blue-500/50 transition-all text-center flex flex-col justify-center items-center gap-4 overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">{level}</h3>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Calibration: {
                        level === '1st Year' ? 'Basic Fundamentals' :
                        level === '2nd Year' ? 'Intermediate Logic' :
                        level === '3rd Year' ? 'System Patterns' :
                        level === 'Final Year' ? 'Production Ready' : 'Industry Standard'
                      }</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'diagnostic' && (
            <motion.div 
              key="diagnostic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
              {status === 'loading' && (
                <div className="flex flex-col items-center justify-center py-40 space-y-12">
                   <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                    <BrainCircuit className="w-12 h-12 text-blue-500 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Analyzing Field DNA...</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mt-2">Constructing 5-Node Assessment</p>
                  </div>
                </div>
              )}

              {status === 'active' && questions.length > 0 && (
                <div className="space-y-8">
                  <div className="flex justify-between items-end px-4">
                    <div>
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{selectedField} Diagnostic</h2>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Foundation Integrity Check</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Time Elapsed</span>
                      <span className="text-xl font-bold text-blue-500 italic">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>

                  <div className="glass p-12 rounded-[4rem] border border-white/10 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-12">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Node {currentIndex + 1} / {questions.length}</span>
                       <div className="h-1 flex-1 mx-8 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
                       </div>
                    </div>

                    <h3 className="text-2xl font-black text-white italic mb-16 leading-relaxed max-w-2xl">
                      {questions[currentIndex]?.text || "Initializing Node Content..."}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {questions[currentIndex]?.options?.map((opt: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt)}
                          className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all active:scale-95"
                        >
                          <span className="text-[10px] text-blue-500 font-black mr-4 uppercase">Option 0{i+1}</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 'completion' && (
            <motion.div 
              key="completion"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl mx-auto glass p-16 rounded-[4rem] border border-white/10 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-10">
                <Trophy className="w-12 h-12 text-green-500" />
              </div>

              <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">Profile Architected</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Diagnostic Score Matrixed Successfully</p>

              <div className="flex justify-center gap-16 mb-16 pb-12 border-b border-white/5">
                <div>
                   <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">Field Alignment</span>
                   <span className="text-2xl font-black text-white italic uppercase">{selectedField}</span>
                </div>
                <div>
                   <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">Readiness Index</span>
                   <span className="text-4xl font-black text-blue-500 italic uppercase">{calculateScore()}%</span>
                </div>
              </div>

              <button
                onClick={finalizeOnboarding}
                disabled={isFinishing}
                className="btn-primary w-full py-6 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isFinishing ? (
                  <>
                    Synchronizing... <Loader2 className="w-4 h-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Access Neural Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
