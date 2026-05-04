import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Zap, BrainCircuit, Database, Cpu, 
  ChevronRight, ArrowLeft, Shield, CreditCard,
  Landmark, Wallet, XCircle, Loader2, PlayCircle, BookOpen, HelpCircle,
  CheckCircle, Target, Users, TrendingUp, Award, DollarSign, Globe,
  MessageSquare, Send, BarChart3, Fingerprint, Search, FileText, Download,
  Edit3, Trash2, ArrowRight, Mic, MicOff, UserCheck, HeartHandshake, Headphones,
  Maximize2, Minimize2
} from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { Link } from 'react-router-dom';
import { usePremium } from '../hooks/usePremium';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { CareerField } from '../types/career';
import { CAREER_PATHS } from '../data/careerData';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { parseAIResponse, evaluateCodeSubmission, askGemini } from '../services/geminiService';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, Cell, AreaChart, Area 
} from 'recharts';

export function PremiumLab() {
  const { user } = useAuth();
  const { isPremium, upgradeToPremium } = usePremium();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const selectedField = (localStorage.getItem('student_career_field') || 'Engineer') as CareerField;
  const careerConfig = CAREER_PATHS[selectedField];

  const [showPayment, setShowPayment] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'debit' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Custom Word Limit Popup
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  // Simulation / Data States
  const [dnaScanning, setDnaScanning] = useState(false);
  const [dnaReport, setDnaReport] = useState<string | null>(null);
  const [dnaStats, setDnaStats] = useState<any[]>([]);
  const [techProficiency, setTechProficiency] = useState<any[]>([]);
  const [localLeaderboard, setLocalLeaderboard] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [syncResults, setSyncResults] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Algo Hub States
  const [algoStep, setAlgoStep] = useState(0); // 0: Selection, 1: Test
  const [algoLevel, setAlgoLevel] = useState('');
  const [algoTopic, setAlgoTopic] = useState('');
  const [algoQuestion, setAlgoQuestion] = useState<any>(null);
  const [algoLoading, setAlgoLoading] = useState(false);
  const [algoUserResponse, setAlgoUserResponse] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [algoLanguage, setAlgoLanguage] = useState('javascript');
  const [algoFeedback, setAlgoFeedback] = useState<any | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Interview Simulator Specific States
  const [interviewRole, setInterviewRole] = useState('');
  const [interviewIndustry, setInterviewIndustry] = useState('');
  const [interviewStep, setInterviewStep] = useState(0); // 0: Selection, 1: Interview

  // Mentorship and Counselling States
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [expertWordCount, setExpertWordCount] = useState(0);
  const WORD_LIMIT = 100;

  // Resume Builder States
  const [resumeData, setResumeData] = useState({
    name: '',
    role: '',
    experience: '',
    skills: '',
    vibe: 'Professional'
  });
  const [resumeOutput, setResumeOutput] = useState<string | null>(null);
  const [isBuildingResume, setIsBuildingResume] = useState(false);

  const runNodeSync = async () => {
    setIsSyncing(true);
    try {
      const prompt = `Generate a JSON array of 4 objects representing hypothetical companies/institutions and their 'sync' match (0-100) with a specialist in the field of ${selectedField}. 
        Each object should have: name (organization name), sync (number), role (specific position for ${selectedField}). 
        Format: [{"name": "...", "sync": 80, "role": "..."}, ...]. IMPORTANT: ONLY RETURN JSON. NO MARKDOWN. LANG: ${language}`;
      const aiText = await askGemini(prompt);
      setSyncResults(parseAIResponse(aiText || "[]"));
    } catch (e) {
      setSyncResults([
        { name: 'Quantum Analytics', sync: 98, role: 'Systems Architect' },
        { name: 'Nebula Cloud', sync: 84, role: 'Full Stack Node' },
        { name: 'Apex Robotics', sync: 42, role: 'Logic Engineer' },
        { name: 'Z-Global', sync: 12, role: 'Data Scientist' }
      ]);
    }
    setIsSyncing(false);
  };

  const labItems = [
    { id: 'dna', title: 'Neural DNA Scanner', desc: 'Map behavioral traits using AI.', unlocked: true, icon: Fingerprint, category: 'AI Tools' },
    { id: 'algo', title: 'Algo-Readiness Hub', desc: 'Master DS & Algorithms.', unlocked: true, icon: PlayCircle, category: 'Learning' },
    { id: 'logic', title: 'Logic Intake Test', desc: 'Gemini-powered cognitive audit.', unlocked: true, icon: BrainCircuit, category: 'Assessment' },
    { id: 'mentorship', title: 'AI Mentorship Node', desc: 'Expert neural guidance.', unlocked: false, icon: UserCheck, category: 'Mentoring' },
    { id: 'counselling', title: 'Neural Career Counsel', desc: 'Deep-path alignment therapy.', unlocked: false, icon: HeartHandshake, category: 'Mentoring' },
    { id: 'synapse', title: 'Advanced Synapse Mapping', desc: 'Predictive performance modeling.', unlocked: false, icon: Target, category: 'Intelligence' },
    { id: 'interview', title: 'Interview Simulator X', desc: 'Real-time AI behavioral interviewing.', unlocked: false, icon: MessageSquare, category: 'AI Tools' },
    { id: 'sync', title: 'Corporate Node Sync', desc: 'Company-capability alignment.', unlocked: false, icon: Database, category: 'Intelligence' },
    { id: 'badge', title: 'Expert Certification Node', desc: 'Skill-indexed verified badges.', unlocked: false, icon: Award, category: 'Assessment' },
    { id: 'convergence', title: 'Skill Convergence Lab', desc: 'Market-gap convergence analysis.', unlocked: false, icon: TrendingUp, category: 'Learning' },
    { id: 'salary', title: 'Global Salary Oracle', desc: 'Real-time market value calculation.', unlocked: false, icon: DollarSign, category: 'Intelligence' },
    { id: 'resume', title: 'AI Resume Synthesizer', desc: 'Neural-optimized resume generation.', unlocked: false, icon: FileText, category: 'AI Tools' },
    { id: 'index', title: 'Talent Liquidity Index', desc: 'Real-time global leaderboard.', unlocked: false, icon: Globe, category: 'Assessment' },
  ];

  const [salaryResult, setSalaryResult] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  const mentors = [
    { id: 'expert-1', name: `${selectedField} Lead Apex`, expertise: `Domain Specialist: ${selectedField}`, icon: Cpu, bio: `A high-caliber expert in ${selectedField} protocols, specializing in strategic optimization and critical decision logic.` },
    { id: 'expert-2', name: 'Strategic Architect', expertise: 'Cross-Domain Synthesis', icon: BrainCircuit, bio: 'Expert in bridging technical complexity with market execution strategies.' },
    { id: 'expert-3', name: 'Compliance Oracle', expertise: 'Regulatory & Safety Governance', icon: Shield, bio: 'Ensures all neural and institutional protocols meet global verification standards.' }
  ];

  const counsellors = [
    { id: 'neural-strat', name: 'Dr. Synapse', expertise: 'Career Pathfinding & Neural Alignment', icon: HeartHandshake, bio: 'Ph.D. in Cognitive Psychology, specializing in developer burnout and high-performance alignment.' }
  ];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        // Update the relevant state based on which item is active
        if (activeItem?.id === 'algo') {
          setAlgoUserResponse(transcript);
        } else if (activeItem?.id === 'mentorship' || activeItem?.id === 'counselling' || activeItem?.id === 'interview') {
          // We can't easily find "the" input in a one-size-fits-all way without refs, 
          // so we'll look for the specific input elements and trigger their state if possible,
          // or just update a dedicated "voiceBuffer" if needed.
          // For now, let's target the DOM element AND try to find if we can hook into state.
          const activeInput = document.querySelector('input[placeholder*="Neural"], textarea[placeholder*="Neural"]') as HTMLInputElement | HTMLTextAreaElement;
          if (activeInput) {
            activeInput.value = transcript;
            // Dispatch input event to trigger React onChange if listeners exist
            activeInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [activeItem]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleItemClick = (item: any) => {
    if (!isPremium && !item.unlocked) {
      setShowPayment(true);
      return;
    }
    setActiveItem(item);
    
    // Auto-run certain features
    if (item.id === 'sync' && syncResults.length === 0) {
      runNodeSync();
    }
    if (item.id === 'index' && leaderboardData.length === 0) {
      generateLeaderboard();
    }
    if (item.id === 'algo') {
      setAlgoStep(0);
      setAlgoLevel('');
      setAlgoTopic('');
      setAlgoQuestion(null);
      setAlgoFeedback(null);
    }
    if (item.id === 'interview') {
      setInterviewStep(0);
      setInterviewRole('');
      setInterviewIndustry('');
      setChatMessages([]);
    }
    if (item.id === 'mentorship' || item.id === 'counselling') {
      setSelectedExpert(null);
      setChatMessages([]);
      setExpertWordCount(0);
    }
  };

  const startExpertChat = (expert: any) => {
    setSelectedExpert(expert);
    const welcomeMsg = activeItem?.id === 'mentorship' 
      ? `Greetings. I am ${expert.name}. Ready to optimize your ${expert.expertise} competencies. What specific protocol shall we analyze today?`
      : `Welcome. I am ${expert.name}. I am here to help you align your neural career path with your core values. How are you feeling about your current trajectory?`;
      
    setChatMessages([{ 
      role: 'ai', 
      text: welcomeMsg
    }]);
  };

  const sendExpertMessage = async (text: string) => {
    if (!text) return;
    
    // Check word limit
    if (!isPremium && expertWordCount >= WORD_LIMIT) {
      setShowUpgradePopup(true);
      return;
    }

    const newMessages = [...chatMessages, { role: 'user', text }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsTyping(true);

    try {
      const prompt = `You are ${selectedExpert.name}, an expert in ${selectedExpert.expertise}. Your bio is: ${selectedExpert.bio}. 
          Keep your response professional, insightful, and slightly futuristic. 
          The user says: ${text}. 
          IMPORTANT: You MUST respond in the following language: ${language}`;
          
      const aiText = await askGemini(prompt);
      const addedWords = aiText.split(/\s+/).length;
      
      setExpertWordCount(prev => prev + addedWords);
      setChatMessages([...newMessages, { role: 'ai', text: aiText }]);
      
      if (!isPremium && (expertWordCount + addedWords) >= WORD_LIMIT) {
        setShowUpgradePopup(true);
      }
    } catch (e) {
      setChatMessages([...newMessages, { role: 'ai', text: "Neural link disrupted. Static detected." }]);
    }
    setIsTyping(false);
  };

  const startInterview = () => {
    if (!interviewRole || !interviewIndustry) return;
    setInterviewStep(1);
    setChatMessages([{ 
      role: 'ai', 
      text: `Welcome to your tailored assessment for the ${interviewRole} position in the ${interviewIndustry} industry. I've configured my neural subsystems to evaluate your specific domain expertise. Please state your primary technical stack or core competencies to begin.` 
    }]);
  };

  const generateAlgoTest = async () => {
    if (!algoLevel || !algoTopic) return;
    setAlgoLoading(true);
    setAlgoStep(1);
    try {
      const { generateTest } = await import('../services/geminiService');
      const test = await generateTest(algoTopic, algoLevel, 1);
      setAlgoQuestion(test[0] || {
        title: `${algoTopic} Diagnostic`,
        problem: `Explain and implement a ${algoLevel} level solution for a standard ${algoTopic} problem.`,
        example: "Depends on specific topic parameters.",
        constraints: "N/A"
      });
    } catch (e) {
      setAlgoQuestion({
        title: `${algoTopic} Diagnostic`,
        problem: `Explain and implement a ${algoLevel} level solution for a standard ${algoTopic} problem.`,
        example: "Depends on specific topic parameters.",
        constraints: "N/A"
      });
    }
    setAlgoLoading(false);
  };

  const generateResume = async () => {
    if (!resumeData.name || !resumeData.role) return;
    setIsBuildingResume(true);
    try {
      const prompt = `Synthesize a high-impact, futuristic resume for:
      Name: ${resumeData.name}
      Target Role: ${resumeData.role}
      Experience Highlight: ${resumeData.experience}
      Core Competencies: ${resumeData.skills}
      Vibe: ${resumeData.vibe}

      Format with cyberpunk/tactical headings. Use punchy, result-oriented language. Include a 'Neural DNA Profile' summary section.
      IMPORTANT: Respond in ${language}.`;

      const aiText = await askGemini(prompt);
      setResumeOutput(aiText || "");
    } catch (e) {
      setResumeOutput("Synthesis failed. Neural link disrupted. Ensure all parameters are set.");
    }
    setIsBuildingResume(false);
  };

  const submitAlgoResponse = async () => {
    if (!algoUserResponse || !user) return;
    setAlgoLoading(true);
    setAlgoFeedback(null); // Clear previous feedback to show fresh analysis
    try {
      const result = await evaluateCodeSubmission(algoQuestion?.problem || "Coding Challenge", algoUserResponse, algoLanguage);
      setAlgoFeedback(result);

      // Persist to Firebase if score is decent or verified
      if (result.score > 0) {
        await dataService.addDocument(`users/${user.uid}/projects`, {
          title: algoQuestion?.title || "Coding Challenge",
          description: algoQuestion?.problem || "Verification Algorithm",
          code: algoUserResponse,
          language: algoLanguage,
          score: result.score,
          type: 'lab_challenge',
          timestamp: new Date().toISOString()
        });

        await dataService.addDocument(`users/${user.uid}/notifications`, {
          type: 'challenge_complete',
          message: `Intelligence Lab Node Synced: ${algoQuestion?.title || 'Coding Challenge'}. Mastery: ${result.score}%`,
          read: false,
          timestamp: new Date().toISOString()
        });
      }

      // Auto-progress if correct
      if (result.isCorrect) {
        setTimeout(() => {
          setAlgoFeedback(null);
          setAlgoUserResponse('');
          generateAlgoTest();
        }, 3000);
      }
    } catch (e) {
      setAlgoFeedback({
        isCorrect: false,
        score: 0,
        executionOutput: "Neural link timeout.",
        feedback: "Analysis failed. Static in neural relay.",
        lineByLine: [],
        conceptualGaps: ["System error"],
        topicInsights: { weakTopic: "Infrastructure", advice: "Neural connection disrupted. Retry synchronization." },
        optimizedCode: ""
      });
    }
    setAlgoLoading(false);
  };

  const generateLeaderboard = () => {
    const data = Array.from({ length: 20 }, (_, i) => ({
      rank: i + 1,
      name: `Agent_${Math.random().toString(36).substring(7).toUpperCase()}`,
      score: 9500 - (i * 200 + Math.floor(Math.random() * 100)),
      skills: ['React', 'Solidity', 'AI'].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
    setLeaderboardData(data);
  };

  const runDNAMap = async () => {
    setDnaScanning(true);
    setDnaReport(null);
    try {
      const prompt = `Generate a detailed futuristic 'Neural DNA Report' for a professional in the field of ${selectedField}. 
        Focus on 4 core attributes: Logic Density, Creative Variance, Collaborative Entropy, and Execution Velocity within the context of ${selectedField}. 
        Keep it under 100 words and use technical, cyberpunk-style language. 
        IMPORTANT: The report must be written in the following language: ${language}`;
        
      const aiText = await askGemini(prompt);
      setDnaReport(aiText || "");
      // Removed undefined statusInterval clearInterval

      // Generate hypothetical stats
      setDnaStats([
        { subject: 'Logic', A: 90 + Math.random() * 10, fullMark: 100 },
        { subject: 'Creativity', A: 70 + Math.random() * 25, fullMark: 100 },
        { subject: 'Entropy', A: 40 + Math.random() * 20, fullMark: 100 },
        { subject: 'Velocity', A: 85 + Math.random() * 15, fullMark: 100 },
        { subject: 'Resilience', A: 75 + Math.random() * 20, fullMark: 100 },
        { subject: 'Depth', A: 80 + Math.random() * 15, fullMark: 100 },
      ]);

      setTechProficiency([
        { name: 'Core Architecture', score: 88, color: '#3B82F6' },
        { name: 'Distributed Sytems', score: 76, color: '#6366F1' },
        { name: 'AI Integration', score: 94, color: '#8B5CF6' },
        { name: 'Security Protocol', score: 65, color: '#EC4899' },
      ]);

      setLocalLeaderboard([
        { rank: 1, name: 'Agent_XERO', score: 9840 },
        { rank: 2, name: 'Agent_QUBIT', score: 9620 },
        { rank: 3, name: 'YOU', score: 9410, isUser: true },
        { rank: 4, name: 'Agent_VOID', score: 9100 },
        { rank: 5, name: 'Agent_CYBER', score: 8850 },
      ]);

    } catch (e) {
      setDnaReport("Neural link disrupted. Static detected in DNA sequence. Try again.");
    }
    setDnaScanning(false);
  };

  const handleSalaryCalc = () => {
    setSalaryResult({
      min: 145000,
      max: 280000,
      avg: 212500,
      companies: ['Neuro-Link Corp', 'Bio-Mesh Systems', 'Zettabyte Labs']
    });
  };

  const sendInterviewMessage = async (text: string) => {
    if (!text) return;
    const newMessages = [...chatMessages, { role: 'user', text } as const];
    setChatMessages(newMessages);
    setChatInput('');
    setIsTyping(true);
    
    try {
      const prompt = `You are an AI Interviewer for a ${interviewRole} position in the ${interviewIndustry} industry. Keep it technical and slightly intimidating. Ask one deep question based on the user's input: ${text}. If the user provides an answer, provide brief feedback before asking the next question. IMPORTANT: You MUST respond in the following language: ${language}`;
      const aiText = await askGemini(prompt);
      setChatMessages([...newMessages, { role: 'ai', text: aiText || "" }]);
    } catch (e) {
      setChatMessages([...newMessages, { role: 'ai', text: "Communication error. Reconnecing..." }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20 px-4 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
         <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 border-l-4 border-blue-600 pl-8 pb-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all transform hover:-translate-x-1">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="transform -skew-x-12">
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none">Intelligence <span className="text-blue-500">Lab</span></h1>
              <div className="flex items-center gap-3 mt-2">
                 <div className="px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 rounded text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none">System Rank: Alpha</div>
                 <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em] italic">Cognitive Augmentation Active</p>
              </div>
            </div>
          </div>
          <div className="mt-8 md:mt-0 flex gap-4">
             <div className="px-6 py-3 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md">
                <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">Authorization</span>
                <span className={`text-sm font-black italic uppercase ${isPremium ? 'text-green-500' : 'text-slate-400'}`}>
                   {isPremium ? 'Lvl-MAX UNLOCKED' : 'Lvl-02 RESTRICTED'}
                </span>
             </div>
             {isPremium && (
               <div className="px-6 py-3 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none italic">Secure Linkage</span>
               </div>
             )}
          </div>
        </div>

        {!isPremium && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 p-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-blue-600/20 rounded-[3rem] border border-white/5"
          >
            <div className="p-10 bg-[#080808] rounded-[2.8rem] flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                  <Target className="w-48 h-48 text-blue-500 rotate-12" />
               </div>
               <div className="flex items-center gap-8 text-left relative z-10">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] shrink-0 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">Authorize <span className="text-blue-500">Universal</span> Protocol</h3>
                    <p className="text-slate-500 text-sm font-medium italic max-w-lg">Unlock all intelligence nodes, predictive performance modeling, and AI tactical simulations at a 80% compression rate.</p>
                  </div>
               </div>
               <button 
                 onClick={() => setShowPayment(true)}
                 className="px-10 py-5 rounded-2xl bg-white text-black font-black text-[12px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 relative z-10 shadow-2xl shadow-blue-500/10 italic shrink-0"
               >
                 Authorize Node Access ($500)
               </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {labItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5, borderColor: 'rgba(37,99,235,0.3)' }}
              onClick={() => handleItemClick(item)}
              className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden group h-[260px] flex flex-col justify-between
                ${(isPremium || item.unlocked) 
                  ? 'bg-slate-900 border-white/5 hover:bg-slate-800' 
                  : 'bg-black/40 border-white/5 grayscale-[0.8] opacity-50 hover:grayscale-0'}`}
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                 <item.icon className="w-20 h-20 text-blue-500" />
              </div>

              {/* Status Header */}
              <div className="flex justify-between items-start relative z-10">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all
                   ${(isPremium || item.unlocked) ? 'bg-blue-600/10 text-blue-500 shadow-inner' : 'bg-slate-800/50 text-slate-700'}`}>
                   <item.icon className="w-5 h-5" />
                 </div>
                 {!(isPremium || item.unlocked) && (
                    <div className="px-2 py-0.5 rounded border border-white/10 bg-black/40 text-[7px] font-black text-slate-600 uppercase tracking-widest italic">Encrypted</div>
                 )}
              </div>
              
              <div className="relative z-10 mt-6">
                <h4 className="font-black text-white uppercase tracking-tighter italic text-lg leading-[1.1] mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.1em] italic leading-tight group-hover:text-slate-500 transition-colors">{item.desc}</p>
              </div>

              <div className="relative z-10 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 italic group-hover:text-blue-500 transition-colors">Sector_{item.category.split(' ')[0]}</span>
                 <div className="h-[1px] flex-1 bg-white/5" />
                 <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-800 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Item Modal Container */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveItem(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            >
              <div className="p-8 sm:p-12">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
                      <activeItem.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        {activeItem.title}
                      </h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{activeItem.category}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveItem(null)} className="p-3 rounded-full hover:bg-white/5 text-slate-500 transition-all">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* MODAL CONTENT SWITCHER */}
                <div className="min-h-[400px]">
                  
                  {/* Mentorship & Counselling */}
                  {(activeItem.id === 'mentorship' || activeItem.id === 'counselling') && (
                    <div className="w-full">
                      {!selectedExpert ? (
                        <div className="max-w-4xl mx-auto space-y-12 py-10">
                          <div className="text-center">
                            <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4 shadow-blue-500/20">
                              {activeItem.id === 'mentorship' ? 'Initialize Expert Mentorship' : 'Neural Path Counselling'}
                            </h4>
                            <p className="text-slate-500 font-medium">Select a highly-calibrated AI node to begin your session.</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {(activeItem.id === 'mentorship' ? mentors : counsellors).map((expert) => (
                              <motion.div 
                                key={expert.id}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-[3rem] bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all flex flex-col items-center text-center group relative overflow-hidden"
                              >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                  <expert.icon className="w-20 h-20" />
                                </div>
                                <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-500 mb-8 ring-1 ring-blue-500/20 group-hover:scale-110 transition-transform">
                                  <expert.icon className="w-10 h-10" />
                                </div>
                                <h5 className="text-white font-black uppercase text-lg mb-2">{expert.name}</h5>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">{expert.expertise}</p>
                                <p className="text-slate-400 text-xs font-medium leading-relaxed mb-10 italic">"{expert.bio}"</p>
                                <button 
                                  onClick={() => startExpertChat(expert)}
                                  className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 transition-all"
                                >
                                  Establish Connection
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-4xl mx-auto h-[700px] flex flex-col bg-black/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative">
                           {/* Word Limit Progress Bar */}
                           {!isPremium && (
                             <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((expertWordCount / WORD_LIMIT) * 100, 100)}%` }}
                                  className={`h-full ${expertWordCount >= WORD_LIMIT ? 'bg-red-500' : 'bg-blue-600'}`}
                                />
                             </div>
                           )}

                           <div className="p-8 bg-blue-600/5 border-b border-white/10 flex items-center justify-between">
                              <div className="flex items-center gap-4 text-left">
                                 <button 
                                    onClick={() => setSelectedExpert(null)}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all mr-2"
                                 >
                                    <ArrowLeft className="w-4 h-4" />
                                 </button>
                                 <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 relative">
                                    <selectedExpert.icon className="w-6 h-6 text-white" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                                 </div>
                                 <div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest block">{selectedExpert.name}</span>
                                    <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">{selectedExpert.expertise}</span>
                                 </div>
                              </div>
                              {!isPremium && (
                                <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
                                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                      Neural Sync: <span className={expertWordCount >= WORD_LIMIT ? 'text-red-500' : 'text-blue-500'}>{expertWordCount}/{WORD_LIMIT} Words</span>
                                   </p>
                                </div>
                              )}
                           </div>
                           
                           <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                              {chatMessages.map((m, i) => (
                                 <motion.div 
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   key={i} 
                                   className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                                 >
                                    <div className={`max-w-[75%] p-8 rounded-[2.5rem] text-base font-bold leading-relaxed shadow-lg
                                       ${m.role === 'ai' ? 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none italic' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                                       {m.text}
                                    </div>
                                 </motion.div>
                              ))}
                              
                              {isTyping && (
                                 <div className="flex justify-start">
                                    <div className="px-6 py-4 rounded-[1.5rem] bg-slate-900 border border-white/10 flex gap-2">
                                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                 </div>
                              )}
                           </div>

                            <div className="p-8 bg-blue-600/5 border-t border-white/10">
                              <div className="relative group flex items-center gap-4">
                                 <div className="relative flex-1">
                                    <input 
                                       type="text"
                                       value={chatInput}
                                       onChange={(e) => setChatInput(e.target.value)}
                                       placeholder="Neural Input Terminal..."
                                       className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 pr-20 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                                       onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                             sendExpertMessage(chatInput);
                                          }
                                       }}
                                    />
                                    <button 
                                      onClick={() => {
                                        sendExpertMessage(chatInput);
                                      }}
                                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                                    >
                                       <Send className="w-6 h-6" />
                                    </button>
                                 </div>
                                 
                                 <button 
                                   onClick={toggleListening}
                                   className={`p-6 rounded-2xl border transition-all ${isListening ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/40' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                                 >
                                    {isListening ? <MicOff className="w-6 h-6 text-white animate-pulse" /> : <Mic className="w-6 h-6" />}
                                 </button>
                              </div>
                              <p className="mt-4 text-center text-[9px] text-slate-600 font-black uppercase tracking-widest">Connect via Neural Relay or Voice Frequency</p>
                           </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DNA Scanner */}
                  {activeItem.id === 'dna' && (
                    <div className="flex flex-col items-center justify-center text-center py-10 w-full">
                      <div className="relative mb-12">
                        <div className={`w-40 h-40 rounded-full border-4 ${dnaScanning ? 'border-blue-500/20 border-t-blue-500 animate-spin' : 'border-white/5'} flex items-center justify-center relative mb-8`}>
                           <Fingerprint className={`w-20 h-20 ${dnaScanning ? 'text-blue-500 animate-pulse' : 'text-slate-700'}`} />
                           {dnaScanning && (
                             <motion.div 
                               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                               transition={{ duration: 2, repeat: Infinity }}
                               className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl"
                             />
                           )}
                        </div>
                        {dnaScanning && <motion.div animate={{ y: [0, 160, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute top-0 left-[-20%] w-[140%] h-0.5 bg-blue-500 shadow-[0_0_20px_#3b82f6] z-10" />}
                      </div>
                      {!dnaReport && !dnaScanning && (
                        <button onClick={runDNAMap} className="px-12 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 italic">Initialize Neural Scan</button>
                      )}
                      {dnaScanning && (
                        <div className="space-y-4">
                           <p className="text-blue-500 font-black uppercase tracking-[0.4em] animate-pulse text-xs italic">Decompiling Neural Pathways</p>
                           <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">System is performing a deep-node audit of your technical and behavioral attributes. This process requires significant neural computation.</p>
                           <div className="w-64 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
                              <motion.div 
                                className="h-full bg-blue-600 shadow-[0_0_10px_#3b82f6]"
                                animate={{ x: [-256, 256] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              />
                           </div>
                        </div>
                      )}
                      {dnaReport && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-5xl text-left">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                            {/* AI Description */}
                            <div className="p-10 rounded-[3rem] bg-black/40 border border-blue-500/20 relative overflow-hidden h-full flex flex-col justify-center">
                              <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="w-24 h-24" /></div>
                              <h4 className="text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-8">Verified Intelligence Report</h4>
                              <p className="text-white text-xl font-bold leading-relaxed italic border-l-4 border-blue-600 pl-8">{dnaReport}</p>
                            </div>

                            {/* Radar Chart Diagram */}
                            <div className={`p-10 rounded-[3rem] border flex flex-col items-center justify-center h-[400px] ${
                                theme === 'light' ? 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-slate-200/60' : 'bg-black/40 border-white/5'
                            }`}>
                              <h4 className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-6">Neural Attribute Balance</h4>
                              <div className="w-full h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dnaStats}>
                                    <PolarGrid stroke={theme === 'light' ? '#e2e8f0' : '#ffffff10'} />
                                    <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} fontWeight="bold" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="none" />
                                    <Radar
                                      name="Attributes"
                                      dataKey="A"
                                      stroke="#3b82f6"
                                      fill="#3b82f6"
                                      fillOpacity={0.3}
                                    />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Local Leaderboard */}
                            <div className="lg:col-span-1 p-10 rounded-[3rem] bg-black/40 border border-white/5">
                              <h4 className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-8 text-center">Local Area Intelligence Ranking</h4>
                              <div className="space-y-4">
                                {localLeaderboard.map((entry) => (
                                  <div 
                                    key={entry.rank} 
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${entry.isUser ? 'bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-white/5 border-white/5'}`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <span className={`text-[10px] font-black italic ${entry.isUser ? 'text-blue-400' : 'text-slate-600'}`}>#{entry.rank}</span>
                                      <span className={`text-xs font-black tracking-tight ${entry.isUser ? 'text-white' : 'text-slate-400'}`}>{entry.name}</span>
                                    </div>
                                    <span className={`text-sm font-black italic ${entry.isUser ? 'text-blue-500' : 'text-slate-600'}`}>{entry.score}</span>
                                  </div>
                                ))}
                              </div>
                              <p className="mt-6 text-[8px] text-slate-600 font-black uppercase text-center tracking-widest italic leading-none">Scanning Cluster: Global-North-Delta</p>
                            </div>

                            {/* Tech Proficiency Graph */}
                            <div className="lg:col-span-2 p-10 rounded-[3rem] bg-black/40 border border-white/5">
                              <h4 className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-10">Technical Domain Proficiency</h4>
                              <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={techProficiency} layout="vertical">
                                    <XAxis type="number" hide domain={[0, 100]} />
                                    <YAxis 
                                      dataKey="name" 
                                      type="category" 
                                      axisLine={false} 
                                      tickLine={false} 
                                      stroke="#94a3b8" 
                                      fontSize={10} 
                                      fontWeight="bold"
                                      width={120}
                                    />
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                      itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="score" radius={[0, 10, 10, 0]}>
                                      {techProficiency.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="mt-8 flex justify-between items-center bg-blue-600/5 p-6 rounded-2xl border border-blue-500/10">
                                 <div>
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">Strategic Advice</span>
                                    <p className="text-[11px] text-slate-400 font-medium italic">Focus on Security Protocol to achieve 99th percentile across all domains.</p>
                                 </div>
                                 <button onClick={() => setDnaReport(null)} className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest italic shrink-0">Re-Initialize Link</button>
                              </div>
                            </div>
                          </div>

                          <div className="p-10 rounded-[3rem] bg-black/40 border border-white/5 mb-12">
                             <h4 className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-10 text-center">Neural Convergence Frequency</h4>
                             <div className="h-[200px] w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={[
                                   { time: 'T-10', sync: 45 },
                                   { time: 'T-8', sync: 52 },
                                   { time: 'T-6', sync: 48 },
                                   { time: 'T-4', sync: 70 },
                                   { time: 'T-2', sync: 85 },
                                   { time: 'NOW', sync: 94 },
                                 ]}>
                                   <defs>
                                     <linearGradient id="colorSync" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                     </linearGradient>
                                   </defs>
                                   <Tooltip 
                                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                   />
                                   <Area type="monotone" dataKey="sync" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSync)" />
                                 </AreaChart>
                               </ResponsiveContainer>
                             </div>
                             <p className="mt-4 text-[9px] text-slate-600 font-black uppercase text-center tracking-[0.5em] italic">Harmonic Resonance: STABLE</p>
                          </div>
                          
                          <div className="mt-12 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                             <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                   <PlayCircle className="w-8 h-8" />
                                </div>
                                <div>
                                   <h5 className="text-white font-black uppercase italic tracking-tighter text-lg">Neural Learning Node</h5>
                                   <p className="text-slate-500 text-xs font-medium">Deep dive into cognitive performance for engineering excellence.</p>
                                </div>
                             </div>
                             <a 
                                href="https://youtube.com/watch?v=SqcY0GlETPk" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="px-10 py-4 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3"
                              >
                                Access Lecture Protocol
                                <ChevronRight className="w-4 h-4" />
                              </a>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Algo Hub */}
                  {activeItem.id === 'algo' && (
                    <div className="w-full">
                      {algoStep === 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          <div className="space-y-4">
                            <h4 className="text-white font-black uppercase italic tracking-tighter mb-6">Curated Technical Nodes</h4>
                            {[
                              { title: 'Data Structures and Algorithms for Beginners', videoId: '8hly31xKli0' },
                              { title: 'Graph Theory Algorithms Course', videoId: '09_LlHjoEiY' },
                              { title: 'Dynamic Programming - Learn to Solve Problems', videoId: 'oBt53YbR9Kk' },
                              { title: 'Sorting Algorithms Masterclass', videoId: 'k9Hn6j_fD3E' }
                            ].map((topic, i) => (
                               <div key={i} className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all group flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                     <span className="text-slate-800 font-black text-2xl italic tracking-tighter">0{i+1}</span>
                                     <div>
                                       <p className="text-white font-bold">{topic.title}</p>
                                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Expert-led Deep Dive</p>
                                     </div>
                                  </div>
                                  <a href={`https://youtube.com/watch?v=${topic.videoId}`} target="_blank" rel="noopener noreferrer">
                                    <PlayCircle className="w-6 h-6 text-slate-700 group-hover:text-blue-500 transition-all" />
                                  </a>
                               </div>
                            ))}
                          </div>
                          
                          <div id="algo-selection-node" className="p-10 rounded-[3rem] bg-indigo-600/5 border border-indigo-500/20 space-y-8 shadow-[0_0_50px_rgba(79,70,229,0.1)] relative">
                             <div className="absolute -top-4 -right-4 p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/40 text-white font-black text-[8px] uppercase tracking-widest italic z-10">AI Diagnostic v2</div>
                             <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-500 mb-6 mx-auto group-hover:scale-110 transition-transform">
                                   <Cpu className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-black text-white uppercase italic mb-4 tracking-tighter">AI Knowledge Protocol</h4>
                                <p className="text-slate-500 text-xs mb-8 font-medium">Select parameters to synthesize a tailored technical assessment.</p>
                             </div>

                             <div className="space-y-6">
                                <div>
                                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Complexity Tier</label>
                                   <div className="flex gap-3">
                                      {['Easy', 'Hard', 'Expert'].map((lvl) => (
                                        <button 
                                          key={lvl}
                                          onClick={() => setAlgoLevel(lvl)}
                                          className={`flex-1 py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                                            ${algoLevel === lvl ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                        >
                                          {lvl}
                                        </button>
                                      ))}
                                   </div>
                                </div>

                                <div>
                                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Technical Domain</label>
                                   <div className="grid grid-cols-2 gap-3">
                                      {['Arrays & Hashing', 'Dynamic Programming', 'Graph Theory', 'Trees & Tries', 'Concurrency', 'System Design'].map((topic) => (
                                        <button 
                                          key={topic}
                                          onClick={() => setAlgoTopic(topic)}
                                          className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                                            ${algoTopic === topic ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                        >
                                          {topic}
                                        </button>
                                      ))}
                                   </div>
                                </div>
                             </div>

                             <button 
                               onClick={generateAlgoTest}
                               disabled={!algoLevel || !algoTopic}
                               className="w-full py-5 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                             >
                               Generate AI Powered Test
                               <ChevronRight className="w-4 h-4" />
                             </button>
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-4xl mx-auto space-y-10">
                          <div className="flex items-center justify-between">
                            <button 
                              onClick={() => setAlgoStep(0)}
                              className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              Back to Selection
                            </button>
                            <div className="flex items-center gap-4">
                               <div className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase italic">
                                  Level: {algoLevel}
                               </div>
                               <div className="px-4 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase italic">
                                  Topic: {algoTopic}
                               </div>
                            </div>
                          </div>

                          {algoLoading && !algoQuestion ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                              <p className="text-blue-500 font-black uppercase tracking-[0.3em] animate-pulse">Forging Neural Challenge...</p>
                            </div>
                          ) : algoQuestion && (
                            <div className={`grid grid-cols-1 ${isExpanded ? 'lg:grid-cols-1' : 'lg:grid-cols-5'} gap-10 transition-all duration-500`}>
                              {!isExpanded && (
                                <motion.div 
                                  initial={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="lg:col-span-2 space-y-8"
                                >
                                  <div className="p-8 rounded-[2.5rem] bg-black/40 border border-white/5">
                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 border-l-4 border-blue-600 pl-6">{algoQuestion.title}</h4>
                                    <div className="prose prose-invert prose-sm">
                                      <p className="text-slate-400 font-medium leading-relaxed mb-6">{algoQuestion.problem}</p>
                                      <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                                        <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Example Protocol</h5>
                                        <code className="text-xs text-white block">{algoQuestion.example}</code>
                                        <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">System Constraints</h5>
                                        <code className="text-xs text-slate-400 block">{algoQuestion.constraints}</code>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              <div className={`${isExpanded ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-8`}>
                                <div className="p-8 rounded-[2.5rem] bg-black/40 border border-white/5 relative">
                                  <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Implementation Terminal</h4>
                                      <select 
                                        value={algoLanguage}
                                        onChange={(e) => setAlgoLanguage(e.target.value)}
                                        className="bg-transparent text-[9px] font-mono text-slate-500 uppercase tracking-widest border-none focus:ring-0 cursor-pointer outline-none"
                                      >
                                        <option value="javascript" className="bg-slate-900 text-white">javascript</option>
                                        <option value="typescript" className="bg-slate-900 text-white">typescript</option>
                                        <option value="python" className="bg-slate-900 text-white">python</option>
                                        <option value="java" className="bg-slate-900 text-white">java</option>
                                        <option value="cpp" className="bg-slate-900 text-white">cpp</option>
                                        <option value="go" className="bg-slate-900 text-white">go</option>
                                        <option value="sql" className="bg-slate-900 text-white">sql</option>
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
                                  <div className="h-[400px] relative bg-black/60 border border-white/10 rounded-2xl overflow-hidden">
                                    <CodeEditor 
                                      code={algoUserResponse}
                                      onChange={setAlgoUserResponse}
                                      language={algoLanguage}
                                      className={isExpanded ? 'text-2xl md:text-3xl' : ''}
                                    />
                                  </div>
                                  <div className="flex gap-4">
                                    <button 
                                      onClick={submitAlgoResponse}
                                      disabled={algoLoading || !algoUserResponse}
                                      className="flex-1 mt-6 py-5 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 disabled:opacity-50"
                                    >
                                      {algoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Solution'}
                                    </button>
                                    
                                    {algoFeedback && (
                                      <button 
                                        onClick={() => { setAlgoFeedback(null); setAlgoUserResponse(''); generateAlgoTest(); }}
                                        className="mt-6 px-8 py-5 rounded-full bg-white/5 border border-blue-500/30 text-blue-400 font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3"
                                      >
                                        Next Question
                                        <ArrowRight className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {algoFeedback && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={`p-8 rounded-[2.5rem] border ${algoFeedback.isCorrect ? 'bg-green-600/10 border-green-500/20' : 'bg-red-600/10 border-red-500/20'}`}
                                    >
                                      <div className="flex justify-between items-center mb-4">
                                        <h5 className={`text-[10px] font-black uppercase tracking-widest ${algoFeedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                          {algoFeedback.isCorrect ? 'Logic Sync Complete' : 'Neural Integrity Warning'}
                                        </h5>
                                        <span className="text-xl font-black italic">{algoFeedback.score}%</span>
                                      </div>
                                      
                                      {algoFeedback.isCorrect && (
                                        <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3 animate-pulse">
                                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                                          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic">Correct protocol detected. Initializing next node in 3s...</span>
                                        </div>
                                      )}
                                      
                                      <p className="text-white text-sm font-bold italic leading-relaxed mb-6">{algoFeedback.feedback}</p>
                                      
                                      {algoFeedback.lineByLine && algoFeedback.lineByLine.length > 0 && (
                                        <div className="space-y-4 mb-6">
                                          {algoFeedback.lineByLine.map((err: any, i: number) => (
                                            <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                                              <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Line {err.lineNumber}</span>
                                                <span className="text-[8px] font-mono text-slate-500 uppercase">{err.issue}</span>
                                              </div>
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <span className="text-[8px] font-black text-slate-600 uppercase">Correct Injection:</span>
                                                  <code className="block text-[10px] text-green-400 bg-green-400/5 p-2 rounded truncate">{err.correction}</code>
                                                </div>
                                                <div>
                                                  <span className="text-[8px] font-black text-slate-600 uppercase">Rationale:</span>
                                                  <p className="text-[9px] text-slate-400 italic line-clamp-2">{err.explanation}</p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {algoFeedback.topicInsights && (
                                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-6">
                                          <h5 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">
                                            Insight: {algoFeedback.topicInsights.weakTopic}
                                          </h5>
                                          <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                            {algoFeedback.topicInsights.advice}
                                          </p>
                                        </div>
                                      )}

                                      {(algoFeedback.timeComplexity || algoFeedback.spaceComplexity) && (
                                        <div className="flex gap-4 mb-6">
                                          {algoFeedback.timeComplexity && (
                                            <div className="flex-1 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                              <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Time</span>
                                              <div className="text-xs font-mono text-purple-200 mt-1">{algoFeedback.timeComplexity}</div>
                                            </div>
                                          )}
                                          {algoFeedback.spaceComplexity && (
                                            <div className="flex-1 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                              <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Space</span>
                                              <div className="text-xs font-mono text-purple-200 mt-1">{algoFeedback.spaceComplexity}</div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <div className="flex gap-4">
                                        <button 
                                          onClick={() => { setAlgoFeedback(null); setAlgoUserResponse(''); generateAlgoTest(); }}
                                          className="flex-1 py-4 rounded-xl bg-white/10 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all italic flex items-center justify-center gap-2"
                                        >
                                          Next Question <ChevronRight size={14} />
                                        </button>
                                        
                                        {!algoFeedback.isCorrect && (
                                          <button 
                                            onClick={() => setAlgoFeedback(null)}
                                            className="px-6 py-4 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all italic"
                                          >
                                            Retry
                                          </button>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Logic Intake */}
                  {activeItem.id === 'logic' && (
                    <div className="max-w-3xl mx-auto py-10">
                      <div className="mb-12 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                         <span>Complexity Cluster: Delta-7</span>
                         <span className="text-blue-500">Level 4 / 10</span>
                      </div>
                      <div className="p-10 rounded-[3rem] bg-black/40 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all"><Database className="w-32 h-32" /></div>
                        <p className="text-2xl font-black text-white italic leading-tight mb-12 border-l-4 border-blue-600 pl-8">
                          "Three containers hold different volumes: 8L, 5L, and 3L. The 8L is full of code. How do you measure exactly 4L using only these containers in minimal operations?"
                        </p>
                          <div className="space-y-4">
                            {['7 Operations', '6 Operations', '8 Operations', 'Impossible Protocol'].map((opt, i) => (
                               <button 
                                 key={i} 
                                 onClick={() => {
                                    const isCorrect = opt === '7 Operations';
                                    alert(isCorrect ? "Protocol Verified: Recursive logic logic chain optimal." : "Integrity Breach: Calculation mismatch in temporal path.");
                                    if (isCorrect && user) {
                                       dataService.addDocument(`users/${user.uid}/notifications`, {
                                          type: 'logic_verified',
                                          message: 'Logic Node Verified: Water Jug Algorithm solved.',
                                          read: false,
                                          timestamp: new Date().toISOString()
                                       });
                                    }
                                 }}
                                 className="w-full p-6 text-left rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:border-blue-500/50 hover:text-white transition-all uppercase tracking-widest text-xs flex justify-between items-center group/opt"
                               >
                                  {opt}
                                  <ChevronRight className="w-4 h-4 opacity-0 group-hover/opt:opacity-100 transition-all" />
                               </button>
                            ))}
                          </div>
                        <div className="mt-12 flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                              <span className="text-[10px] text-slate-500 font-black uppercase">Gemini Protocol Analyzing...</span>
                           </div>
                           <button 
                             onClick={() => alert("Complexity Cluster Delta-7 requires all sub-nodes to be solved first. Submit final solution to the Credora Core once 100% verified.")}
                             className="text-blue-500 font-black text-[10px] uppercase tracking-widest border-b border-blue-500/20 hover:border-blue-500 transition-all">Submit Solution</button>
                        </div>
                        <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group cursor-pointer" onClick={() => window.open('https://youtube.com/watch?v=LpU_pX4E0e0', '_blank')}>
                           <div>
                              <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Logic Masterclass</h5>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Recursive Problem Solving Fundamentals</p>
                           </div>
                           <PlayCircle className="w-6 h-6 text-slate-700 group-hover:text-blue-500 transition-all" />
                        </div>
                      </div>
                      <div className="mt-8 grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {Array.from({length: 10}).map((_, i) => (
                          <div key={i} className={`h-1.5 rounded-full ${i < 4 ? 'bg-blue-600 shadow-[0_0_10px_#3b82f6]' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Corporate Node Sync */}
                  {activeItem.id === 'sync' && (
                    <div className="max-w-4xl mx-auto py-10 space-y-12">
                      {isSyncing ? (
                        <div className="flex flex-col items-center justify-center py-20">
                           <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                           <p className="text-blue-500 font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Global Nodes...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {(syncResults.length > 0 ? syncResults : [
                            { name: 'Quantum Analytics', sync: 98, role: 'Systems Architect' },
                            { name: 'Nebula Cloud', sync: 84, role: 'Full Stack Node' },
                            { name: 'Apex Robotics', sync: 42, role: 'Logic Engineer' },
                            { name: 'Z-Global', sync: 12, role: 'Data Scientist' }
                          ]).map((c, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-black/40 border border-white/5 relative overflow-hidden group">
                               <div className="flex justify-between items-start mb-6">
                                  <div>
                                     <h4 className="text-xl font-black text-white italic">{c.name}</h4>
                                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{c.role}</p>
                                  </div>
                                  <div className={`text-xl font-black ${c.sync > 80 ? 'text-green-500' : c.sync > 50 ? 'text-yellow-500' : 'text-red-500'}`}>{c.sync}%</div>
                               </div>
                               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.sync}%` }} className={`h-full ${c.sync > 80 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : c.sync > 50 ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
                               </div>
                               <div className="mt-6 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500 opacity-60 group-hover:opacity-100 transition-all">
                                  <span>Requirements Matched: {Math.floor(c.sync/10)}/10</span>
                                  <button onClick={runNodeSync} className="text-white border-b border-white/20">Re-Sync Node</button>
                               </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="p-8 rounded-[3rem] bg-blue-600/10 border border-blue-500/20 text-center">
                         <Search className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                         <h4 className="text-white font-black uppercase italic italic">Neural Search Protocol</h4>
                         <p className="text-slate-400 text-sm font-medium mt-2">Gemini is continuously scanning 10k+ global nodes for your intelligence profile.</p>
                      </div>

                      {/* Added Lecture */}
                      <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10">
                         <h4 className="text-white font-black uppercase italic mb-8">Node Sync Masterclass</h4>
                         <a href="https://youtube.com/watch?v=1Z_pI7_F3y8" target="_blank" rel="noopener noreferrer" className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                  <PlayCircle className="w-5 h-5" />
                               </div>
                               <div>
                                  <span className="text-xs font-bold text-white uppercase tracking-wider block">Enterprise System Integration</span>
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Architectural Alignment</span>
                               </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-all" />
                         </a>
                      </div>
                    </div>
                  )}

                  {/* Advanced Synapse Mapping */}
                  {activeItem.id === 'synapse' && (
                    <div className="max-w-5xl mx-auto py-10 flex flex-col md:flex-row gap-12 items-center">
                       <div className="relative w-64 h-64 shrink-0">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border-2 border-dashed border-blue-500/20 rounded-full" />
                          <div className="absolute inset-4 border border-white/5 rounded-full flex items-center justify-center">
                             <div className="text-center">
                                <p className="text-4xl font-black text-white italic">87%</p>
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Confidence Index</p>
                             </div>
                          </div>
                          <div className="absolute top-0 right-0 p-2 bg-blue-600 rounded-full shadow-[0_0_20px_#3b82f6]"><Zap className="w-4 h-4 text-white" /></div>
                       </div>
                       <div className="flex-1 space-y-8">
                          <h4 className="text-2xl font-black text-white italic tracking-tighter border-b border-white/5 pb-4 uppercase">Predictive Intelligence Map</h4>
                          <div className="space-y-6">
                             {[
                               { label: 'Market Scalability', val: 'High', color: 'text-green-500' },
                               { label: 'Technical Depth', val: 'Delta-4', color: 'text-blue-500' },
                               { label: 'Execution Variance', val: 'Low', color: 'text-indigo-400' }
                             ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-6 rounded-2xl bg-black/40 border border-white/5">
                                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                                   <span className={`text-lg font-black italic uppercase ${s.color}`}>{s.val}</span>
                                </div>
                             ))}
                          </div>
                          <p className="text-slate-500 text-sm font-medium italic leading-relaxed">
                             "Based on current synaptic activity, your trajectory suggests a 92% placement probability in Tier-1 nodes within 6 months. Focus on 'Distributed Integrity' to reach P-99."
                          </p>
                          <div className="pt-6 border-t border-white/10">
                             <a href="https://youtube.com/watch?v=i7abcZ_v7G0" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                   <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500"><BookOpen className="w-4 h-4" /></div>
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Mastering Distributed Systems</span>
                                </div>
                                <PlayCircle className="w-5 h-5 text-slate-700 group-hover:text-blue-500" />
                             </a>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* Certification Badge Node */}
                  {activeItem.id === 'badge' && (
                    <div className="py-10 space-y-12">
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                         {[
                           { name: 'Core Architect', rank: 'Gold', icon: Shield, color: 'text-yellow-500' },
                           { name: 'Logic Master', rank: 'Platinum', icon: Zap, color: 'text-slate-300' },
                           { name: 'Data Weaver', rank: 'Silver', icon: Database, color: 'text-orange-400' },
                           { name: 'Sync Specialist', rank: 'Bronze', icon: TrendingUp, color: 'text-amber-600' }
                         ].map((b, i) => (
                            <div key={i} className="p-8 rounded-[2.5rem] bg-black/40 border border-white/5 flex flex-col items-center text-center group hover:bg-white/5 transition-all">
                               <div className={`w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${b.color} mb-6 shadow-2xl group-hover:scale-110 transition-transform`}>
                                  <b.icon className="w-10 h-10" />
                               </div>
                               <h4 className="text-white font-black uppercase tracking-tighter italic mb-1">{b.name}</h4>
                               <p className={`text-[10px] font-black uppercase tracking-widest ${b.color}`}>{b.rank} Tier</p>
                               <div className="mt-4 px-3 py-1 rounded bg-white/5 text-[8px] font-black text-slate-600 uppercase tracking-widest">Verified on Node-Chain</div>
                            </div>
                         ))}
                       </div>

                       {/* Added Lecture */}
                       <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 max-w-4xl mx-auto">
                          <h4 className="text-white font-black uppercase italic mb-8">Trust & Verification Nodes</h4>
                          <a href="https://youtube.com/watch?v=hYip_Vuv8J0" target="_blank" rel="noopener noreferrer" className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all flex items-center justify-between group">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500">
                                   <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                   <span className="text-xs font-bold text-white uppercase tracking-wider block">Blockchain & Identity Fundamentals</span>
                                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Digital Trust Architecture</span>
                                </div>
                             </div>
                             <PlayCircle className="w-6 h-6 text-slate-700 group-hover:text-blue-500 transition-all" />
                          </a>
                       </div>
                    </div>
                  )}

                  {/* Skill Convergence Lab */}
                  {activeItem.id === 'convergence' && (
                    <div className="max-w-4xl mx-auto py-10 space-y-12">
                       <div className="p-10 rounded-[3rem] bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden">
                          <h4 className="text-white font-black uppercase italic mb-6">Market Convergence Report</h4>
                          <div className="space-y-6">
                             {[
                               { skill: 'Rust Systems', demand: 94, gap: 12 },
                               { skill: 'AI Orchestration', demand: 89, gap: 42 },
                               { skill: 'Zero-Knowledge Proofs', demand: 72, gap: 68 }
                             ].map((s, i) => (
                                <div key={i} className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                   <div className="flex justify-between items-center mb-2">
                                      <span className="text-white font-bold">{s.skill}</span>
                                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Demand: {s.demand}%</span>
                                   </div>
                                   <div className="flex items-center gap-4">
                                      <div className="h-1.5 flex-1 bg-white/10 rounded-full">
                                         <div className="h-full bg-indigo-500" style={{ width: `${s.demand}%` }} />
                                      </div>
                                      <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Gap: {s.gap}%</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="p-8 rounded-3xl bg-black/40 border border-white/5">
                             <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Gemini Roadmap</h5>
                             <p className="text-slate-400 text-sm italic">"Your profile shows a divergence in AI Core. Accelerate 'Vector Database Modeling' to capture the 14% demand surge in Q3."</p>
                          </div>
                          <div className="p-8 rounded-3xl bg-black/40 border border-white/5">
                             <h5 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-4">Priority Nodes</h5>
                             <div className="flex flex-wrap gap-2">
                                {['Kubernetes', 'WebGPU', 'TRPC', 'Vector DB'].map(t => (
                                   <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">{t}</span>
                                ))}
                             </div>
                          </div>
                       </div>
                       
                       {/* Recommended Lectures */}
                       <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10">
                          <h4 className="text-white font-black uppercase italic mb-8">Foundational Architecture Lectures</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {[
                                { title: 'Understanding Kubernetes Architecture', videoId: 'PzvUq0uzWTE' },
                                { title: 'Introduction to Vector Databases', videoId: 'dN0lsF2ZaBM' },
                                { title: 'Modern React Design Patterns', videoId: 'SqcY0GlETPk' },
                                { title: 'System Design: Distributed Systems', videoId: 'i7abcZ_v7G0' }
                             ].map((v, i) => (
                                <a key={i} href={`https://youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer" className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all flex items-center justify-between group">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                         <PlayCircle className="w-5 h-5" />
                                      </div>
                                      <span className="text-xs font-bold text-white uppercase tracking-wider">{v.title}</span>
                                   </div>
                                   <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-all translate-x-0 group-hover:translate-x-1" />
                                </a>
                             ))}
                          </div>
                       </div>
                    </div>
                  )}

                  {/* Salary Oracle */}
                  {activeItem.id === 'salary' && (
                    <div className="max-w-4xl mx-auto py-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Neural Specialization</label>
                              <select className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-blue-500/30 transition-all font-bold">
                                 <option>AI Core Infrastructure</option>
                                 <option>Distributed Systems Architect</option>
                                 <option>Neural Network Specialist</option>
                                 <option>Quantum Logic Developer</option>
                              </select>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Deployment Node (Region)</label>
                              <select className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-blue-500/30 transition-all font-bold">
                                 <option>United States (West)</option>
                                 <option>Europe (Zurich)</option>
                                 <option>Asia Pacific (Singapore)</option>
                                 <option>Emerging (Dubai)</option>
                              </select>
                           </div>
                           <button onClick={handleSalaryCalc} className="w-full py-5 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">Calculate Yield</button>
                        </div>

                        <AnimatePresence>
                          {salaryResult && (
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-10 rounded-[3rem] bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden flex flex-col justify-between"
                            >
                               <div className="absolute top-0 right-0 p-8 opacity-10"><DollarSign className="w-24 h-24" /></div>
                               <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-8">Estimated Market Yield</h4>
                               <div>
                                 <div className="text-6xl font-black text-white italic tracking-tighter mb-2">
                                    ${(salaryResult.avg/1000).toFixed(0)}k <span className="text-slate-600 text-lg">/yr</span>
                                 </div>
                                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Node Average Yield Range: ${salaryResult.min/1000}k - ${salaryResult.max/1000}k</p>
                               </div>
                               
                               <div className="mt-12 space-y-4">
                                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-4">High-Compatibility Entities:</p>
                                  {salaryResult.companies.map((c: string) => (
                                     <div key={c} className="flex justify-between items-center text-xs font-bold text-slate-400 p-4 rounded-xl bg-white/5 border border-white/5">
                                        <span>{c}</span>
                                        <div className="flex items-center gap-2">
                                           <span className="text-[8px] text-indigo-400">SYNCED</span>
                                           <CheckCircle className="w-4 h-4 text-indigo-500" />
                                        </div>
                                     </div>
                                  ))}
                               </div>

                               {/* Added Lecture */}
                               <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/10 group cursor-pointer" onClick={() => window.open('https://youtube.com/watch?v=nwYtB_h6K9E', '_blank')}>
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Negotiation Intelligence</h5>
                                    <PlayCircle className="w-4 h-4 text-slate-600 group-hover:text-white" />
                                  </div>
                                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Market Value Scaling Strategies</p>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* Resume Synthesizer */}
                  {activeItem.id === 'resume' && (
                    <div className="max-w-6xl mx-auto py-10 space-y-12">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Editor Side */}
                        <div className="p-10 rounded-[3rem] bg-black/40 border border-white/5 space-y-8">
                           <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
                                 <Edit3 className="w-6 h-6" />
                              </div>
                              <div>
                                 <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Neural Input Terminal</h4>
                                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Feed data into the synthesis engine</p>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block ml-2">Legacy Identity (Name)</label>
                                    <input 
                                       type="text" 
                                       value={resumeData.name}
                                       onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
                                       className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-slate-800"
                                       placeholder="Neural Identity..."
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block ml-2">Target Node (Role)</label>
                                    <input 
                                       type="text" 
                                       value={resumeData.role}
                                       onChange={(e) => setResumeData({...resumeData, role: e.target.value})}
                                       className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-slate-800"
                                       placeholder="Neural Node..."
                                    />
                                 </div>
                              </div>

                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block ml-2">Core Competencies (Skills)</label>
                                 <input 
                                    type="text" 
                                    value={resumeData.skills}
                                    onChange={(e) => setResumeData({...resumeData, skills: e.target.value})}
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-slate-800"
                                    placeholder="Rust, Kubernetes, Neural Ops..."
                                 />
                              </div>

<div className="space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block ml-2">Neural Experience Delta (Summary)</label>
                                       <button 
                                         onClick={toggleListening}
                                         className={`p-2 rounded-lg border transition-all ${isListening ? 'bg-red-600 border-red-500 shadow-md' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                                       >
                                          {isListening ? <MicOff className="w-4 h-4 text-white animate-pulse" /> : <Mic className="w-4 h-4" />}
                                       </button>
                                    </div>
                                    <textarea 
                                       value={resumeData.experience}
                                       onChange={(e) => setResumeData({...resumeData, experience: e.target.value})}
                                       className="w-full h-32 bg-black/60 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-slate-800"
                                       placeholder="Neural Experience: Describe your previous nodes and protocols..."
                                    />
                                 </div>

                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block ml-2">Neural Vector (Tone)</label>
                                 <div className="flex gap-3">
                                    {['Professional', 'Futuristic', 'Minimal'].map(v => (
                                       <button 
                                          key={v}
                                          onClick={() => setResumeData({...resumeData, vibe: v})}
                                          className={`flex-1 py-4 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all
                                             ${resumeData.vibe === v ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                                       >
                                          {v}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <button 
                              onClick={generateResume}
                              disabled={isBuildingResume || !resumeData.name || !resumeData.role}
                              className="w-full py-5 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl"
                           >
                              {isBuildingResume ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Synthesize Resume'}
                              <Zap className="w-4 h-4 fill-current" />
                           </button>
                        </div>

                        {/* Preview Side */}
                        <div className="relative group">
                           <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition-all duration-1000" />
                           <div className="relative h-full min-h-[600px] p-12 rounded-[3rem] bg-slate-900 border border-white/10 overflow-hidden flex flex-col">
                              {isBuildingResume ? (
                                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-8" />
                                    <p className="text-blue-500 font-black uppercase tracking-[0.3em] animate-pulse">Compiling Neural Data...</p>
                                 </div>
                              ) : resumeOutput ? (
                                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-8">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                             <FileText className="w-5 h-5" />
                                          </div>
                                          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Synthesized Result</h5>
                                       </div>
                                       <button 
                                          onClick={() => alert("Resume exported to local secure node.")}
                                          className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all flex items-center gap-3"
                                       >
                                          <Download className="w-4 h-4" />
                                          <span className="text-[9px] font-black uppercase tracking-widest">Secure Export</span>
                                       </button>
                                    </div>
                                    <div className="space-y-6 prose prose-invert prose-sm max-w-none">
                                       <div className="whitespace-pre-wrap font-bold text-slate-300 leading-relaxed italic border-l-2 border-blue-500/50 pl-8">
                                          {resumeOutput}
                                       </div>
                                    </div>
                                    {/* Footer Watermark */}
                                    <div className="mt-auto pt-12 text-center opacity-20">
                                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em]">Verified by Credo-Neural-Synthesizer-v4.0.1</p>
                                    </div>
                                 </motion.div>
                              ) : (
                                 <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                                    <FileText className="w-24 h-24 text-slate-600 mb-8" />
                                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Waiting for Data Injection...</p>
                                 </div>
                              )}
                           </div>
                        </div>
                      </div>

                      {/* Educational Protocol Replacement */}
                      <div className="p-10 rounded-[3rem] bg-indigo-600/5 border border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-10">
                         <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 relative">
                               <PlayCircle className="w-10 h-10" />
                               <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-4 border-slate-900 animate-ping" />
                            </div>
                            <div>
                               <h5 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Neural Presentation Protocol</h5>
                               <p className="text-slate-500 text-sm font-medium">Master the art of high-impact technical documentation and presentation.</p>
                            </div>
                         </div>
                         <a 
                           href="https://youtube.com/watch?v=SqcY0GlETPk" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="px-12 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all flex items-center gap-4 group"
                         >
                           Access Lecture Node
                           <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                         </a>
                      </div>
                    </div>
                  )}

                  {/* Leaderboard */}
                  {activeItem.id === 'index' && (
                    <div className="py-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                          { label: 'Market Liquidity', val: '98.4%', icon: TrendingUp },
                          { label: 'Verified Nodes', val: '14,202', icon: Users },
                          { label: 'Intelligence Depth', val: 'P-99', icon: Landmark }
                        ].map((s, i) => (
                          <div key={i} className="p-8 rounded-3xl bg-black/40 border border-white/5 flex items-center gap-6 group hover:border-blue-500/20 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                               <s.icon className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{s.label}</p>
                               <p className="text-2xl font-black text-white italic">{s.val}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-[3rem] overflow-hidden">
                        {/* Added Lecture */}
                        <div className="p-8 bg-blue-600/5 border-b border-white/5 flex items-center justify-between group cursor-pointer" onClick={() => window.open('https://youtube.com/watch?v=Xm2_sJ4kX0s', '_blank')}>
                           <div className="flex items-center gap-4">
                              <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500">
                                 <Globe className="w-5 h-5" />
                              </div>
                              <div>
                                 <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Global Talent Report</h5>
                                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Analyzing High-Liquidity Technical Nodes</p>
                              </div>
                           </div>
                           <PlayCircle className="w-6 h-6 text-slate-700 group-hover:text-blue-500 transition-all" />
                        </div>
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              <th className="px-10 py-6">Rank</th>
                              <th className="px-10 py-6">Agent Signature</th>
                              <th className="px-10 py-6">Node Score</th>
                              <th className="px-10 py-6">Technical Schema</th>
                              <th className="px-10 py-6 text-right">Protocol</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {leaderboardData.map((d, i) => (
                               <tr key={i} className="hover:bg-white/5 transition-all text-sm font-medium text-slate-400 group">
                                  <td className="px-10 py-8 font-black italic text-white flex items-center gap-4">
                                     {d.rank < 4 ? <Award className={`w-5 h-5 ${d.rank === 1 ? 'text-yellow-500' : d.rank === 2 ? 'text-slate-300' : 'text-orange-400'}`} /> : <span className="text-slate-700">#{d.rank}</span>}
                                  </td>
                                  <td className="px-10 py-8 text-white font-black tracking-tight">{d.name}</td>
                                  <td className="px-10 py-8 text-blue-500 font-black text-xl italic">{d.score}</td>
                                  <td className="px-10 py-8">
                                     <div className="flex gap-2">
                                        {d.skills.map((s: string) => (
                                           <span key={s} className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400">{s}</span>
                                        ))}
                                     </div>
                                  </td>
                                  <td className="px-10 py-8 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button className="text-[10px] font-black uppercase tracking-widest text-white px-4 py-2 bg-white/5 rounded-full hover:bg-white/10">Synchronize</button>
                                  </td>
                               </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Interview Simulator */}
                  {activeItem.id === 'interview' && (
                    <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-black/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                      {interviewStep === 0 ? (
                        <div className="flex-1 p-10 overflow-y-auto scrollbar-hide">
                          <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 border-l-4 border-blue-600 pl-6">Configure Simulation Parameters</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Industry Selection */}
                            <div className="space-y-6">
                              <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] block">Select Industry Node</label>
                              <div className="grid grid-cols-2 gap-3">
                                {['Technology', 'Finance', 'Healthcare', 'Cybersecurity', 'FinTech', 'E-commerce'].map((ind) => (
                                  <button
                                    key={ind}
                                    onClick={() => setInterviewIndustry(ind)}
                                    className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                                      ${interviewIndustry === ind ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                                  >
                                    {ind}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-6">
                              <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] block">Target Career Path</label>
                              <div className="grid grid-cols-2 gap-3">
                                {['Software Engineer', 'Product Manager', 'Data Scientist', 'Security Architect', 'DevOps Specialist', 'AI Engineer'].map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => setInterviewRole(role)}
                                    className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                                      ${interviewRole === role ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                                  >
                                    {role}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-12 p-8 rounded-3xl bg-blue-600/5 border border-blue-500/10 text-center">
                            <p className="text-slate-500 text-xs italic mb-6">Simulation parameters will be used to calibrate the behavioral and technical assessment engine.</p>
                            <button
                              onClick={startInterview}
                              disabled={!interviewIndustry || !interviewRole}
                              className="px-12 py-4 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] hover:bg-blue-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed group flex items-center gap-3 mx-auto"
                            >
                              Initialize Neural Assessment
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-8 bg-blue-600/5 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-left">
                               <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 relative">
                                  <MessageSquare className="w-6 h-6 text-white" />
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                               </div>
                               <div>
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest block">{interviewRole} Simulation</span>
                                  <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">{interviewIndustry} Sector Calibrated</span>
                               </div>
                            </div>
                            <button 
                              onClick={() => setInterviewStep(0)}
                              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                            >
                              Reset Calibration
                            </button>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                             {chatMessages.map((m, i) => (
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  key={i} 
                                  className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                                >
                                   <div className={`max-w-[75%] p-8 rounded-[2.5rem] text-base font-bold leading-relaxed shadow-lg
                                      ${m.role === 'ai' ? 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none italic' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                                      {m.text}
                                   </div>
                                </motion.div>
                             ))}
                             
                             {/* Behavioral Interview Support Video */}
                             {chatMessages.length > 0 && (
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer" onClick={() => window.open('https://youtube.com/watch?v=9_q90V_5zsw', '_blank')}>
                                   <div>
                                      <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 block">Behavioral Node Support</label>
                                      <span className="text-[10px] text-slate-100 font-bold uppercase tracking-wider">Communication & Influence Protocol</span>
                                   </div>
                                   <PlayCircle className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all" />
                                </div>
                             )}

                             {isTyping && (
                                <div className="flex justify-start">
                                   <div className="px-6 py-4 rounded-[1.5rem] bg-slate-900 border border-white/10 flex gap-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                   </div>
                                </div>
                             )}
                          </div>

                          <div className="p-8 bg-blue-600/5 border-t border-white/10">
                             <div className="relative group">
                                <input 
                                   type="text"
                                   placeholder="Transmit Neural Response..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                   className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 pr-20 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                                   onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                         sendInterviewMessage(chatInput);
                                      }
                                   }}
                                />
                                <button 
                                  onClick={() => sendInterviewMessage(chatInput)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                                >
                                   <Send className="w-6 h-6" />
                                </button>
                             </div>
                             <p className="mt-4 text-center text-[9px] text-slate-600 font-black uppercase tracking-widest">Press Enter to Transmit Analysis</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && !isPremium && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Upgrade Station</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1 italic">Authorize Premium Protocol</p>
                  </div>
                  <button onClick={() => setShowPayment(false)} className="p-2 rounded-full hover:bg-white/5 text-slate-500">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-10 p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform">
                         <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Global Node Access</p>
                        <p className="text-xl font-black text-white">Full Intelligence Protocol</p>
                      </div>
                   </div>
                   <div className="text-2xl font-black text-white italic">$500</div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    {['card', 'debit', 'bank'].map((m) => (
                      <button 
                        key={m}
                        onClick={() => setPaymentMethod(m as any)}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all
                          ${paymentMethod === m ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-black/20 border-white/5 text-slate-500 hover:border-white/10'}`}
                      >
                        {m === 'card' ? <CreditCard className="w-4 h-4" /> : m === 'bank' ? <Landmark className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                        <span className="text-[8px] font-black uppercase tracking-widest">{m}</span>
                      </button>
                    ))}
                  </div>

                  <input 
                    type="text" 
                    placeholder="ACCOUNT OR CARD IDENTIFIER"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                  />

                  <button 
                    onClick={() => {
                      setIsProcessing(true);
                      setTimeout(() => {
                        upgradeToPremium();
                        setIsProcessing(false);
                        setShowPayment(false);
                      }, 1500);
                    }}
                    disabled={isProcessing}
                    className="w-full py-5 rounded-full bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Protocol Authorization • $500'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade Prompt Popup */}
      <AnimatePresence>
        {showUpgradePopup && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
             <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={() => setShowUpgradePopup(false)} />
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="relative max-w-lg w-full p-12 rounded-[3.5rem] bg-slate-900 border border-blue-500/30 overflow-hidden text-center shadow-[0_0_50px_rgba(59,130,246,0.1)]"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <div className="w-24 h-24 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 mx-auto mb-10 ring-1 ring-blue-500/20">
                   <Headphones className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Neural Bandwidth Depleted</h3>
                <p className="text-slate-400 font-medium leading-relaxed mb-10">
                  To continue talking with expert mentors and counsellors without limitations, you must upgrade to a <span className="text-blue-400 font-black italic">Premium Protocol</span>.
                </p>
                
                <div className="space-y-4">
                   <button 
                      onClick={() => {
                        setShowUpgradePopup(false);
                        setShowPayment(true);
                      }}
                      className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-4"
                   >
                      Upgrade to Premium
                      <ChevronRight className="w-4 h-4" />
                   </button>
                   <button 
                      onClick={() => setShowUpgradePopup(false)}
                      className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-slate-500 font-black uppercase tracking-widest text-[11px] hover:text-white transition-all"
                   >
                      Remain in Limited Mode
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
