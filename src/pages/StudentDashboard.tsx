import { motion, AnimatePresence } from "motion/react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  BookOpen, Target, FileText, Briefcase, Award, TrendingUp, Play, 
  MapPin, Calendar, Clock, CheckCircle2, ChevronRight, LayoutDashboard, Code,
  Settings, LogOut, Bell, Users, Zap, Globe, Sparkles, Star, Trophy, Loader2, Rocket, BrainCircuit, Brain,
  Mic, MicOff, Lock, Camera, CameraOff, AlertTriangle, Info, BarChart3, Youtube, ChevronLeft,
  Handshake, Gavel, Radio, ArrowUpRight, ShieldCheck, Mail, MapPin as MapPinIcon, BookOpen as BookIcon, CheckCircle as CheckIcon, Copy,
  DollarSign, ArrowRight
} from "lucide-react";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext";
import { parseAIResponse, askGemini } from "../services/geminiService";
import Markdown from 'react-markdown';
import { BountyAgent } from "../components/BountyAgent";
import { StellarMap } from "../components/StellarMap";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import { dataService } from "../services/dataService";
import { doc, onSnapshot, collection, query, orderBy, setDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { CareerField } from "../types/career";
import { CAREER_PATHS } from "../data/careerData";
import { DiagnosticTest } from "../components/DiagnosticTest";

export function StudentDashboard() {
  const location = useLocation();
  const { logout, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const selectedField = (profile?.careerField || localStorage.getItem('student_career_field') || 'Engineer') as CareerField;
  const currentSubDomain = profile?.subDomain || localStorage.getItem('student_sub_domain') || '';
  
  const careerPathKey = currentSubDomain ? `${selectedField} (${currentSubDomain})` : selectedField;
  const careerPath = CAREER_PATHS[careerPathKey] || CAREER_PATHS[selectedField];

  const diagnosticScore = profile?.onboardingScore || parseInt(localStorage.getItem('student_diagnostic_score') || '0');
  const points = profile?.points || 0;
  const balance = profile?.balance || 0;

  const [isChangingDomain, setIsChangingDomain] = useState(false);
  const [targetDomain, setTargetDomain] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleDomainChange = async (newDomain: string) => {
    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        subDomain: newDomain,
        diagnosticCompleted: false, // Reset diagnostic for new domain as requested
        isBountyReady: false
      });
      localStorage.setItem('student_sub_domain', newDomain);
      localStorage.setItem('credo_diagnostic_completed', 'false');
      window.location.reload(); // Re-trigger onboarding/diagnostic flow for the new domain
    } catch (error) {
      console.error("Failed to change domain:", error);
    } finally {
      setIsUpdatingProfile(false);
      setIsChangingDomain(false);
    }
  };

  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === '/profile') return 'portfolio';
    return 'overview';
  });

  const [certificates, setCertificates] = useState<any[]>([]);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [isTasksLoaded, setIsTasksLoaded] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);
  const [coachChat, setCoachChat] = useState<any[]>([]);
  const [interviewChat, setInterviewChat] = useState<any[]>([]);
  const [isInterviewTyping, setIsInterviewTyping] = useState(false);
  const [activeInterviewMode, setActiveInterviewMode] = useState<'behavioral' | 'technical' | null>(null);

  const isBountyReady = true;

  // Update bounty readiness automatically
  useEffect(() => {
    if (profile && !profile.isBountyReady) {
      updateProfile({ isBountyReady: true });
    }
  }, [profile, updateProfile]);

  // Firestore Subscriptions
  useEffect(() => {
    if (!user) return;

    const unsubCerts = onSnapshot(query(collection(db, `users/${user.uid}/certificates`), orderBy("timestamp", "desc")), (snap) => {
      setCertificates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubProjs = onSnapshot(query(collection(db, `users/${user.uid}/projects`), orderBy("timestamp", "desc")), (snap) => {
      setUserProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubTasks = onSnapshot(query(collection(db, `users/${user.uid}/tasks`), orderBy("timestamp", "asc")), (snap) => {
      setDailyTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsTasksLoaded(true);
    });

    const unsubNotifs = onSnapshot(query(collection(db, `users/${user.uid}/notifications`), orderBy("timestamp", "desc")), (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubStickers = onSnapshot(collection(db, `users/${user.uid}/stickers`), (snap) => {
      setStickers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubChat = onSnapshot(query(collection(db, `users/${user.uid}/coachChat`), orderBy("timestamp", "asc")), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoachChat(data.length > 0 ? data : [{ role: 'ai', text: "Tactical Synchronization Initialized. I am your Credo Specialist. I provide rigorous mentorship on skill DNA, placement logic, and market pivots. State your objective." }]);
    });

    const unsubInterview = onSnapshot(query(collection(db, `users/${user.uid}/interviewChat`), orderBy("timestamp", "asc")), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInterviewChat(data);
    });

    return () => {
      unsubCerts();
      unsubProjs();
      unsubTasks();
      unsubNotifs();
      unsubStickers();
      unsubChat();
      unsubInterview();
    };
  }, [user]);
  
  // Contest State
  const [isContestActive, setIsContestActive] = useState(false);
  const [contestQuestions, setContestQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [contestTimer, setContestTimer] = useState(3600); // 1 hour
  const [proctoringActive, setProctoringActive] = useState(false);
  const [proctoringWarnings, setProctoringWarnings] = useState(0);
  const [micEnabled, setMicEnabled] = useState(false);
  const [camEnabled, setCamEnabled] = useState(false);
  const [contestResult, setContestResult] = useState<any>(null);
  const [contestLeaderboard, setContestLeaderboard] = useState<any[]>([]);
  const [isAnalyzingResult, setIsAnalyzingResult] = useState(false);
  const [deepAnalysis, setDeepAnalysis] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [locationCoords, setLocationCoords] = useState<any>(null);
  const [selectedJobRole, setSelectedJobRole] = useState<string | null>(null);
  const [isMappingLoading, setIsMappingLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Contest Logic
  useEffect(() => {
    let interval: any;
    if (isContestActive && contestTimer > 0) {
      interval = setInterval(() => {
        setContestTimer(prev => prev - 1);
        if (Math.random() > 0.98) {
           setContestLeaderboard(prev => {
             return prev.map(p => ({
               ...p,
               solved: p.solved + (Math.random() > 0.9 ? 1 : 0),
               time: p.time + 1
             })).sort((a: any, b: any) => b.solved - a.solved || a.time - b.time);
          });
        }
      }, 1000);
    } else if (contestTimer === 0 && isContestActive) {
      submitContest();
    }
    return () => clearInterval(interval);
  }, [isContestActive, contestTimer]);

  useEffect(() => {
    if (!proctoringActive || !isContestActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        terminateContest("Tab Switching / Navigation Detected");
      }
    };

    const handleBlur = () => {
      terminateContest("Window Focus Lost");
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    const proctorInterval = setInterval(() => {
      if (!micEnabled || !camEnabled) {
        setProctoringWarnings(prev => {
          const next = prev + 1;
          if (next >= 3) {
            terminateContest("Lack of Proctoring Verification (Cam/Mic Off)");
            return 0;
          }
          recordViolation(`Biometric Warning ${next}/2 triggered. Cam: ${camEnabled}, Mic: ${micEnabled}`);
          return next;
        });
      }
    }, 10000);

    return () => {
      clearInterval(proctorInterval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [proctoringActive, micEnabled, camEnabled, isContestActive]);

  const startContest = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocationCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }

    const mockQs = [
      {
        id: 0,
        title: "Inverse B-Tree Transformation",
        description: "Given a B-Tree of order M, implement an algorithm to transform it into its inverted mirrored equivalent while maintaining the search property for a different scalar basis. Ensure the operation completed in O(log N) time.",
        difficulty: "Mid",
        topic: "Trees",
        timeLimit: "300ms",
        points: 100,
        topperTime: 145
      },
      {
        id: 1,
        title: "Distributed Graph Cycle Detection",
        description: "In a massively distributed graph spanning multiple network nodes, detect cycles using a modified Tarjan's algorithm that accounts for packet latency and asynchronous edge verification. Return the minimal length cycle.",
        difficulty: "Mid",
        topic: "Graphs",
        timeLimit: "300ms",
        points: 150,
        topperTime: 180
      },
      {
        id: 2,
        title: "Maximum Subarray XOR Sum",
        description: "Given an array of integers, find the maximum possible XOR sum of any contiguous subarray. Use a Trie-based approach to optimize the search process from O(N^2) to O(N * 32).",
        difficulty: "High",
        topic: "Trie/Bitmask",
        timeLimit: "300ms",
        points: 200,
        topperTime: 210
      },
      {
        id: 3,
        title: "Dynamic LCA in DAG",
        description: "Find the Lowest Common Ancestor in a Dynamic Directed Acyclic Graph where edges can be added at runtime. Implement an efficient solution using binary lifting or heavy-light decomposition.",
        difficulty: "High",
        topic: "Graphs",
        timeLimit: "300ms",
        points: 250,
        topperTime: 235
      },
      {
        id: 4,
        title: "Multi-Dim Knapsack Constraints",
        description: "Optimize a storage system where items have multiple dimensions (weight, volume, thermal load). Implement a 3D Dynamic Programming solution to maximize utility while staying under capacity limits.",
        difficulty: "High",
        topic: "DP",
        timeLimit: "300ms",
        points: 300,
        topperTime: 255
      },
      {
        id: 5,
        title: "Median of Distributed Arrays",
        description: "Given two sorted arrays representing data shards across different nodes, find the combined median without merging the arrays. Optimize for O(log(min(m, n))) complexity.",
        difficulty: "Mid",
        topic: "Binary Search",
        timeLimit: "300ms",
        points: 120,
        topperTime: 120
      },
      {
        id: 6,
        title: "Sliding Window Distinct Entropy",
        description: "Find the longest substring within a sequence of network packets that contains exactly K distinct protocol headers. Use a sliding window approach with a frequency map for O(N).",
        difficulty: "Mid",
        topic: "Sliding Window",
        timeLimit: "300ms",
        points: 110,
        topperTime: 95
      },
      {
        id: 7,
        title: "Eulerian Path Itinerary",
        description: "Reconstruct a flight itinerary given a list of tickets represented as pairs of airports. Use Hierholzer's Algorithm to find the lexical smallest Eulerian path starting from 'JFK'.",
        difficulty: "High",
        topic: "Graphs",
        timeLimit: "300ms",
        points: 180,
        topperTime: 165
      },
      {
        id: 8,
        title: "Persistent Stack Protocol",
        description: "Implement a persistent stack data structure where every operation (push, pop) creates a new version while sharing the underlying structure. Use functional programming principles to optimize memory.",
        difficulty: "High",
        topic: "Data Structures",
        timeLimit: "300ms",
        points: 220,
        topperTime: 190
      },
      {
        id: 9,
        title: "Network Flow Optimization",
        description: "Calculate the maximum data throughput between two nodes in a server cluster topology with varying bandwidth constraints. Use Edmonds-Karp or Dinic's Algorithm.",
        difficulty: "Extreme",
        topic: "Max Flow",
        timeLimit: "300ms",
        points: 400,
        topperTime: 280
      },
      {
        id: 10,
        title: "Suffix Automaton Search",
        description: "Build a Suffix Automaton for a given neural sequence to perform rapid pattern matching and substring counting. Analyze its space complexity compared to a Suffix Tree.",
        difficulty: "Extreme",
        topic: "Strings",
        timeLimit: "300ms",
        points: 450,
        topperTime: 310
      },
      {
        id: 11,
        title: "Bipartite Resource Matching",
        description: "Assign N tasks to M resources such that the total matching is maximized and no resource is overloaded. Implement using the Hopcroft-Karp algorithm.",
        difficulty: "High",
        topic: "Matching",
        timeLimit: "300ms",
        points: 280,
        topperTime: 240
      },
      {
        id: 12,
        title: "Lazy Segment Tree Sum",
        description: "Implement a Segment Tree to handle range additions and range sum queries on an array representing energy consumption over time. Use lazy propagation for O(log N) operations.",
        difficulty: "Mid",
        topic: "Segment Trees",
        timeLimit: "300ms",
        points: 160,
        topperTime: 155
      },
      {
        id: 13,
        title: "Smallest Sufficient Skill Set",
        description: "Given a list of required skills and several candidates with subsets of those skills, find the smallest team that covers all requirements. Use bitmasking and backtracking.",
        difficulty: "High",
        topic: "Backtracking",
        timeLimit: "300ms",
        points: 320,
        topperTime: 275
      },
      {
        id: 14,
        title: "Tarjan's SCC Identification",
        description: "Identify all Strongly Connected Components in a directed dependency graph of microservices. Ensure orphans and cyclic dependencies are correctly categorized.",
        difficulty: "Mid",
        topic: "Graphs",
        timeLimit: "300ms",
        points: 140,
        topperTime: 130
      },
      {
        id: 15,
        title: "Burst Balloon Maximization",
        description: "You are given N balloons with values. Bursting a balloon gives points based on neighbors. Implement a DP solution to find the max points obtainable by bursting all balloons.",
        difficulty: "High",
        topic: "DP",
        timeLimit: "300ms",
        points: 350,
        topperTime: 260
      },
      {
        id: 16,
        title: "Dominator Tree in CFG",
        description: "Construct a dominator tree for a control flow graph representing a compiled binary. Use the Lengauer-Tarjan algorithm for high-performance analysis.",
        difficulty: "Extreme",
        topic: "Advanced Graphs",
        timeLimit: "300ms",
        points: 500,
        topperTime: 350
      },
      {
        id: 17,
        title: "Optimal Matrix Multiplication",
        description: "Find the most efficient way to multiply a sequence of matrices representing multi-layer neural network weight transformations. Use DP to minimize scalar multiplications.",
        difficulty: "Mid",
        topic: "DP",
        timeLimit: "300ms",
        points: 130,
        topperTime: 110
      },
      {
        id: 18,
        title: "Kth Smallest in Sorted Matrix",
        description: "Find the Kth smallest element in an N x N matrix where each row and column is sorted in ascending order. Optimize using a binary search on the value range.",
        difficulty: "Mid",
        topic: "Binary Search",
        timeLimit: "300ms",
        points: 125,
        topperTime: 105
      },
      {
        id: 19,
        title: "Self-Balancing Tree Auditor",
        description: "Implement an auditor that verifies if a given tree is a valid Red-Black tree by checking color properties, root constraints, and leaf depth consistency.",
        difficulty: "High",
        topic: "Trees",
        timeLimit: "300ms",
        points: 210,
        topperTime: 195
      }
    ];
    
    setContestQuestions(mockQs);
    setContestLeaderboard(Array.from({length: 10}, (_, i) => ({
      name: `Agent_${Math.floor(Math.random() * 9000) + 1000}`,
      solved: Math.floor(Math.random() * 2),
      time: 0
    })));
    
    setIsContestActive(true);
    setContestTimer(3600);
    setCurrentQuestionIndex(0);
    setProctoringActive(true);
    setProctoringWarnings(0);
    setMicEnabled(false);
    setCamEnabled(false);
    setUserAnswers({});
    setContestResult(null);
    setDeepAnalysis(null);
  };

  const submitContest = async () => {
    setIsContestActive(false);
    setProctoringActive(false);
    setIsAnalyzingResult(true);
    
    const score = Object.keys(userAnswers).length * 45; 
    const rank = Math.floor(Math.random() * 500) + 12;
    
    const result = {
       score,
       rank,
       totalStudents: 5000,
       accuracy: Math.floor(Math.random() * 20) + 75 + "%",
       timeSpent: 3600 - contestTimer,
       analysis: Array.from({length: 20}, (_, i) => ({
         qId: i,
         status: userAnswers[i] ? (Math.random() > 0.2 ? 'Correct' : 'Incorrect') : 'Unattempted',
         userTime: Math.floor(Math.random() * 300) + 200,
         topperTime: 180,
         aiSolution: "Utilize a memoized recursive bridge between system states to minimize redundant calculations. The primary bottleneck is detected in the vertex traversal where a Min-Heap should be employed for logarithmic selection."
       }))
    };
    
    setContestResult(result);

    if (user) {
      await dataService.addDocument(`users/${user.uid}/assessments`, {
        type: 'contest',
        score,
        rank,
        timestamp: new Date().toISOString()
      });
      
      await dataService.addDocument(`users/${user.uid}/notifications`, {
        type: 'contest_complete',
        message: `Contest complete. Global Rank: #${rank}. Neural sync updated.`,
        read: false,
        timestamp: new Date().toISOString()
      });
    }
    
    try {
       const prompt = `Analyze these contest results: ${JSON.stringify(result)}. 
       Explain which topics like DP, Graphs, or Greedy were weak. Suggest improvements.
       Return JSON object with 'weakTopics' (array), 'improvementPlan' (string), 'resources' (array of {topic, subtitle, youtube, notes}). 
       Return ONLY JSON.`;
       
       const aiText = await askGemini(prompt, [], 'EN');
       setDeepAnalysis(parseAIResponse(aiText || "{}"));
    } catch(e) {
       setDeepAnalysis({
         weakTopics: ["Neural Graph Traversal", "Distributed Memory Optimization"],
         improvementPlan: "Enhance your understanding of temporal data structures and concurrent execution models.",
         resources: [
           { topic: "Graphs", subtitle: "Edge Case Detection", youtube: "https://youtube.com/sample", notes: "Notes on graph sync..." },
           { topic: "Memory", subtitle: "Heap Allocation", youtube: "https://youtube.com/sample2", notes: "Memory safety protocols..." }
         ]
       });
    }
    setIsAnalyzingResult(false);
  };

  const [isGeneratingProjDesc, setIsGeneratingProjDesc] = useState<string | null>(null);
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [interviewFeedback, setInterviewFeedback] = useState<any>(null);
  const [isCoachTyping, setIsCoachTyping] = useState(false);

  const suggestProjectDescription = async (projectId: string) => {
    if (!user) return;
    const project = userProjects.find(p => p.id === projectId);
    if (!project) return;
    
    setIsGeneratingProjDesc(projectId);
    try {
      const prompt = `Based on the student's Credora activity (Score: ${studentProfile.score || 0}, Rank: ${studentProfile.rank || 'N/A'}, Role: ${studentProfile.role || 'Agent'}) and the project title "${project.title}" using "${project.tech || 'various technologies'}", generate a highly technical and impact-focused 2-sentence description for a portfolio. Use futuristic, professional tone. Return ONLY the description string.`;
      const desc = await askGemini(prompt);
      if (desc && desc.length > 5) {
        await dataService.updateDocument(`users/${user.uid}/projects`, projectId, { description: desc });
      }
    } catch (e) {
      console.error("Failed to generate project description:", e);
    }
    setIsGeneratingProjDesc(null);
  };

  const addUserProject = async () => {
    if (!user) return;
    const newProj = {
      title: 'New Neural Node',
      description: 'Protocol pending initialization. Synthesize description via AI or manual override.',
      tech: 'Stack Pending',
      link: '#',
      timestamp: new Date().toISOString()
    };
    await dataService.addDocument(`users/${user.uid}/projects`, newProj);
  };

  const removeUserProject = async (id: string) => {
    if (!user) return;
    await dataService.deleteDocument(`users/${user.uid}/projects`, id);
  };

  const handleCoachMessage = async (input: string) => {
    if (!input.trim() || !user) return;
    
    const userMsg = { role: 'user', text: input, timestamp: new Date().toISOString() };
    await dataService.addDocument(`users/${user.uid}/coachChat`, userMsg);
    
    setIsCoachTyping(true);

    try {
      // Create a brief chat history string for context
      const chatHistory = coachChat.map(msg => `${msg.role.toUpperCase()}: ${msg.text}`).join('\n');
      const profileCtx = typeof studentProfile !== 'undefined' ? JSON.stringify(studentProfile) : JSON.stringify(profile);

      const prompt = `You are an elite AI Career Coach for a student in the Credora platform. 
      Student Context: ${profileCtx}. 
      Activity Log: ${JSON.stringify(dailyWorkHistory)}.
      
      Chat History:
      ${chatHistory}

      User says: "${input}". 
      Provide rigorous, 1-on-1 personalized pathway planning, mentorship, and deep analysis of their profile and questions. 
      Explain concepts clearly, answer student doubts realistically like an expert tutor, and suggest actionable future pathways.
      Be structured, highly detailed but conversational and empathetic. Formulate a rich text markdown response.`;

      const aiText = await askGemini(prompt);
      
      const aiMsg = { role: 'ai', text: aiText || "", timestamp: new Date().toISOString() };
      await dataService.addDocument(`users/${user.uid}/coachChat`, aiMsg);
    } catch (e) {
      const errorMsg = { role: 'ai', text: "Protocol interference detected. My neural links are stabilizing. Please re-transmission your inquiry.", timestamp: new Date().toISOString() };
      await dataService.addDocument(`users/${user.uid}/coachChat`, errorMsg);
    }
    setIsCoachTyping(false);
  };
  const handleInterviewMessage = async (input: string) => {
    if (!input.trim() || !user || !activeInterviewMode) return;
    
    const userMsg = { role: 'user', text: input, timestamp: new Date().toISOString() };
    await dataService.addDocument(`users/${user.uid}/interviewChat`, userMsg);
    
    setIsInterviewTyping(true);

    try {
      const isBehavioral = activeInterviewMode === 'behavioral';
      const chatHistory = interviewChat.map(msg => `${msg.role.toUpperCase()}: ${msg.text}`).join('\n');
      const profileCtx = typeof studentProfile !== 'undefined' ? JSON.stringify(studentProfile) : JSON.stringify(profile);

      const prompt = isBehavioral ? 
        `You are an elite Tech Interviewer conducting a Behavioral Master Simulation.
        Candidate Profile: ${profileCtx}
        
        Chat History:
        ${chatHistory}
        
        User says: "${input}"
        
        Act as the proctor. Ask deep, behavioral questions (leadership, conflict resolution, ambiguity). Provide real-time feedback on communication clarity. Emulate a real 1-on-1 interview environment. Formulate a rich text markdown response.`
        : 
        `You are an elite Tech Interviewer conducting a System Design and Technical Stress Test.
        Candidate Profile: ${profileCtx}
        
        Chat History:
        ${chatHistory}
        
        User says: "${input}"
        
        Act as the proctor. Ask highly technical questions (DSA, System Design, scalability, edge cases). Push the candidate on trade-offs and robust architecture. Emulate a real 1-on-1 interview environment. Formulate a rich text markdown response.`;

      const aiText = await askGemini(prompt);
      
      const aiMsg = { role: 'ai', text: aiText || "", timestamp: new Date().toISOString() };
      await dataService.addDocument(`users/${user.uid}/interviewChat`, aiMsg);
    } catch (e) {
      const errorMsg = { role: 'ai', text: "Signal loss detected. Retransmitting...", timestamp: new Date().toISOString() };
      await dataService.addDocument(`users/${user.uid}/interviewChat`, errorMsg);
    }
    setIsInterviewTyping(false);
  };
  
  const [dailyWorkHistory, setDailyWorkHistory] = useState([
    { day: 'Mon', progress: 0, completed: 0 },
    { day: 'Tue', progress: 0, completed: 0 },
    { day: 'Wed', progress: 0, completed: 0 },
    { day: 'Thu', progress: 0, completed: 0 },
    { day: 'Fri', progress: 0, completed: 0 },
    { day: 'Sat', progress: 0, completed: 0 },
    { day: 'Sun', progress: 0, completed: 0 },
  ]);

  useEffect(() => {
    // Generate dynamic performance data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon is 0

    const newHistory = days.map((day, idx) => {
      if (idx > currentDayIndex) return { day: day, progress: 0, completed: 0 };
      
      const baseProgress = diagnosticScore > 0 ? (diagnosticScore * 0.4) : 10;
      const taskWeight = dailyTasks.filter(t => t.completed).length * 10;
      const certWeight = certificates.length * 15;
      
      const totalProgress = Math.min(100, baseProgress + taskWeight + certWeight);
      const completedCount = dailyTasks.filter(t => t.completed).length + certificates.length;

      // Variance for historical feel
      const variance = idx === currentDayIndex ? 0 : (currentDayIndex - idx) * -3;
      
      return {
        day: day,
        progress: idx <= currentDayIndex ? Math.max(5, totalProgress + variance) : 0,
        completed: idx <= currentDayIndex ? Math.max(0, completedCount - (currentDayIndex - idx)) : 0
      };
    });
    setDailyWorkHistory(newHistory);
  }, [diagnosticScore, dailyTasks, certificates]);
  const [isPremium, setIsPremium] = useState(false);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [isExportingResume, setIsExportingResume] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [salaryData, setSalaryData] = useState<any>(null);
  const [isCalculatingSalary, setIsCalculatingSalary] = useState(false);

  const recordViolation = async (reason: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/violations`, Date.now().toString()), {
        reason,
        timestamp: serverTimestamp(),
        contestActive: true,
        cameraOn: camEnabled,
        micOn: micEnabled
      });
    } catch (e) {
      console.error("Failed to record violation:", e);
    }
  };

  const terminateContest = async (reason: string) => {
    if (!isContestActive) return;
    setIsContestActive(false);
    setProctoringActive(false);
    await recordViolation(reason);
    
    setContestResult({
       score: 0,
       rank: 5000,
       totalStudents: 5000,
       accuracy: "0%",
       timeSpent: 3600 - contestTimer,
       analysis: [],
       terminated: true,
       reason
    });

    if (user) {
      await dataService.addDocument(`users/${user.uid}/assessments`, {
        type: 'contest_terminated',
        score: 0,
        rank: 5000,
        reason,
        timestamp: new Date().toISOString()
      });
      
      // Mark red in Recruiter Profile (meta field)
      await setDoc(doc(db, 'users', user.uid), {
        proctoringAlert: true,
        lastViolation: reason,
        violationTimestamp: serverTimestamp()
      }, { merge: true });
    }
    
    alert(`Contest Terminated: ${reason}. Score set to 0.`);
    setActiveTab('overview');
  };

  const saveResumeToStorage = async (data: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/resumes`, 'latest'), {
        ...data,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to save resume:", e);
    }
  };

  useEffect(() => {
    if (!user || activeTab !== 'resume') return;
    const unsub = onSnapshot(doc(db, `users/${user.uid}/resumes`, 'latest'), (snap) => {
      if (snap.exists()) {
        setResumeData(snap.data() as any);
      }
    });
    return () => unsub();
  }, [user, activeTab]);

  const downloadResume = async () => {
    if (!resumeRef.current) return;
    setIsExportingResume(true);
    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${profile?.displayName || 'Credora'}_Resume.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsExportingResume(false);
    }
  };

  const calculateSalary = async () => {
    setIsCalculatingSalary(true);
    try {
      const skills = profile?.skillPoints ? Object.keys(profile.skillPoints) : ['React', 'TypeScript'];
      const prompt = `Estimate the annual salary (in USD) for a software engineer with these skills: ${skills.join(', ')}. 
      Consider market trends in major tech hubs (SF, NYC, London, Bangalore).
      Return a JSON object with: 
      - estimated_range (string, e.g. "$120k - $160k")
      - percentile (string, e.g. "90th")
      - factors (array of reasons why)
      - market_insights (array of strings)
      - currency (string, always USD)
      Return ONLY JSON.`;
      
      const aiText = await askGemini(prompt, [], 'EN');
      setSalaryData(parseAIResponse(aiText || "{}"));
    } catch (e) {
      setSalaryData({
        estimated_range: "$115,000 - $145,000",
        percentile: "85th",
        factors: ["High demand for React/TypeScript ecosystem", "Senior-level system design patterns detected"],
        market_insights: ["Remote roles paying 10% premium for this stack", "Fintech sector shows highest growth for your profile"],
        currency: "USD"
      });
    }
    setIsCalculatingSalary(false);
  };
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  
  const hasCompletedDiagnostic = profile?.diagnosticCompleted || localStorage.getItem('credo_diagnostic_completed') === 'true';
  const [showDiagnosticTest, setShowDiagnosticTest] = useState(!hasCompletedDiagnostic);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('credo_diagnostic_results');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Sync diagnostic results from profile if local is missing
  useEffect(() => {
    if (profile?.onboardingScore && !diagnosticResults) {
      setDiagnosticResults({
        score: profile.onboardingScore,
        total: 30, // Default total
        rank: 1000 - profile.onboardingScore * 10
      });
    }
  }, [profile, diagnosticResults]);

  const studentProfile = {
    name: profile?.displayName || user?.displayName || "Elite Agent",
    email: user?.email || "agent@creadora.io",
    role: profile?.careerField || selectedField,
    location: profile?.location || "Global Distributed Node",
    github: profile?.github || "github.com/creadora-agent",
    linkedin: profile?.linkedin || "linkedin.com/in/creadora-master",
    rank: diagnosticResults?.rank || (1000 - diagnosticScore * 10),
    score: diagnosticResults?.score || diagnosticScore
  };

  const handleDiagnosticComplete = async (results: any) => {
    setDiagnosticResults(results);
    setShowDiagnosticTest(false);
    localStorage.setItem('credo_diagnostic_completed', 'true');
    localStorage.setItem('credo_diagnostic_results', JSON.stringify(results));
    
    // Persist to Firestore
    if (user) {
      await updateProfile({
        onboardingScore: results.score,
        diagnosticCompleted: true
      });
      
      // Save full assessment data
      await dataService.addDocument(`users/${user.uid}/assessments`, {
        type: 'diagnostic',
        score: results.score,
        totalQuestions: results.total,
        accuracy: `${((results.score / results.total) * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Immediately regenerate tasks based on these results
    await generateDailyTasks(results);
  };
  
  const [recruiterBids, setRecruiterBids] = useState([
    { id: 1, company: 'Google Neural', basePay: '$180k', equity: '0.05%', status: 'Active Bid', color: 'bg-red-500' },
    { id: 2, company: 'Matrix Systems', basePay: '$165k', equity: '0.12%', status: 'High Intent', color: 'bg-green-500' },
    { id: 3, company: 'Nebula Core', basePay: '$195k', equity: '0.08%', status: 'Negotiating', color: 'bg-blue-500' },
  ]);

  const [activeRecruiter, setActiveRecruiter] = useState<any>(null);

  // Daily Tasks & Stickers State
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Load notifications
    const loadNotifications = () => {
      const saved = JSON.parse(localStorage.getItem('credo_notifications') || '[]');
      
      // Add a simulated market demand notification if none exists recently
      const lastMarketUpdate = localStorage.getItem('last_market_update');
      const now = Date.now();
      
      if (!lastMarketUpdate || now - parseInt(lastMarketUpdate) > 3600000) { // 1 hour
        const trends = [
          "System Design is seeing a 40% uptick in recruitment demand.",
          "Proficiency in Rust is now a top 3 requirement for Backend roles.",
          "Real-time data visualization skills (D3.js) are trending in Fintech.",
          "Advanced Graph algorithms knowledge is highly sought by AI companies."
        ];
        const randomTrend = trends[Math.floor(Math.random() * trends.length)];
        
        saved.push({
          id: 'market_' + now,
          type: 'market_demand',
          message: randomTrend,
          timestamp: new Date().toISOString(),
          read: false
        });
        localStorage.setItem('credo_notifications', JSON.stringify(saved));
        localStorage.setItem('last_market_update', now.toString());
      }
      
      setNotifications(saved.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 5000); // Poll for new recruiter notifications
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    if (!user) return;
    for (const notif of notifications) {
      if (!notif.read) {
        await dataService.setDocument(`users/${user.uid}/notifications`, notif.id, { read: true });
      }
    }
  };
  const [analyzingTasks, setAnalyzingTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskChat, setTaskChat] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [taskUserInput, setTaskUserInput] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [activeSkillCategory, setActiveSkillCategory] = useState<'Technical' | 'Soft Skills' | 'Leadership'>('Technical');
  
  const skillDNAData = [
    { subject: 'Logic', A: 120, Benchmark: 110, fullMark: 150 },
    { subject: 'Systems', A: 98, Benchmark: 130, fullMark: 150 },
    { subject: 'AI Architect', A: 145, Benchmark: 90, fullMark: 150 },
    { subject: 'Memory Opt', A: 86, Benchmark: 100, fullMark: 150 },
    { subject: 'Concurrency', A: 110, Benchmark: 120, fullMark: 150 },
    { subject: 'Neural Sync', A: 135, Benchmark: 80, fullMark: 150 },
  ];

  const generatePortfolioLink = () => {
    setIsSharing(true);
    setTimeout(() => {
      const slug = user?.displayName?.toLowerCase().replace(/\s+/g, '-') || 'elite-agent';
      setPortfolioLink(`https://credora.io/portfolio/${slug}-${Math.random().toString(36).substring(7)}`);
      setIsSharing(false);
    }, 2000);
  };

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
        
        let targetElem = document.activeElement;
        
        // Check if the user is in the coach tab directly (via controlled search logic or finding the input)
        const coachInput = document.getElementById('coach-input-field') as HTMLInputElement;
        const interviewInput = document.getElementById('interview-input-field') as HTMLInputElement;
        const taskInput = document.querySelector('textarea[placeholder*="Neural Transmission"]') as HTMLTextAreaElement;
        
        if (coachInput && document.body.contains(coachInput)) {
           targetElem = coachInput;
        } else if (interviewInput && document.body.contains(interviewInput)) {
           targetElem = interviewInput;
        } else if (taskInput && document.body.contains(taskInput)) {
           targetElem = taskInput;
        }

        if (targetElem && (targetElem.tagName === 'INPUT' || targetElem.tagName === 'TEXTAREA')) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(targetElem),
            "value"
          )?.set;
          nativeInputValueSetter?.call(targetElem, transcript);
          targetElem.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const openTaskTerminal = (task: any) => {
    setSelectedTask(task);
    setTaskChat([{
      role: 'ai',
      text: `Protocol Initialized: ${task.title}. Target parameter detected: ${task.target}. Please describe your progress or submit your codebase for validation.`
    }]);
  };

  const sendTaskMessage = async (text: string) => {
    if (!text) return;
    const newChat = [...taskChat, { role: 'user' as const, text }];
    setTaskChat(newChat);
    setIsTalking(true);

    try {
      const isInterview = selectedTask.title.toLowerCase().includes("simulation") || selectedTask.title.toLowerCase().includes("stress test");
      const previousChat = newChat.map(msg => `${msg.role.toUpperCase()}: ${msg.text}`).join('\n');
      const profileCtx = typeof studentProfile !== 'undefined' ? JSON.stringify(studentProfile) : JSON.stringify(profile);
      
      const prompt = isInterview ? 
        `You are an elite Tech Interviewer at a top-tier company. You are conducting an interview named "${selectedTask.title}".
        You are evaluating the candidate for ${selectedTask.target}.
        
        Candidate Profile: ${profileCtx}
        
        Chat History:
        ${previousChat}
        
        Based on their last response, evaluate their technical depth, communication clarity, and problem-solving process. Ask realistic follow-up questions, push them on edge cases, or request behavioral examples. Be rigorous, professional, and simulate a real 1-on-1 interview environment. Formulate a rich text markdown response. Conclude with "[STATUS: COMPLETED]" only if the candidate has fully satisfied the objective.`
        : 
        `You are the Mission Control AI. Evaluate the student's progress for this mission: ${selectedTask.title} (${selectedTask.target}). 
        Current user update: ${text}. 
        If they seem to have completed the task, conclude with "[STATUS: COMPLETED]". Otherwise, give technical guidance. 
        Keep it concise and futuristic.`;

      const aiResponse = await askGemini(prompt);
      setTaskChat([...newChat, { role: 'ai' as const, text: aiResponse }]);

      if (aiResponse.includes('[STATUS: COMPLETED]')) {
        completeTask(selectedTask.id);
      }
    } catch (e) {
      setTaskChat([...newChat, { role: 'ai' as const, text: "Signal loss detected. Retransmitting..." }]);
    }
    setIsTalking(false);
  };

  useEffect(() => {
    if (location.pathname === '/profile') {
      setActiveTab('portfolio');
    } else if (location.pathname === '/dashboard') {
      setActiveTab('overview');
    }
  }, [location.pathname]);

   const skillDataByCategory = {
    Technical: [
      { subject: 'Logic', A: 120, fullMark: 150 },
      { subject: 'System', A: 98, fullMark: 150 },
      { subject: 'Creative', A: 86, fullMark: 150 },
      { subject: 'Frontend', A: 99, fullMark: 150 },
      { subject: 'Backend', A: 85, fullMark: 150 },
      { subject: 'Cloud', A: 65, fullMark: 150 },
    ],
    'Soft Skills': [
      { subject: 'Comms', A: 135, fullMark: 150 },
      { subject: 'Teams', A: 110, fullMark: 150 },
      { subject: 'Empathy', A: 125, fullMark: 150 },
      { subject: 'Pitching', A: 90, fullMark: 150 },
      { subject: 'Agile', A: 140, fullMark: 150 },
      { subject: 'Values', A: 115, fullMark: 150 },
    ],
    Leadership: [
      { subject: 'Vision', A: 95, fullMark: 150 },
      { subject: 'Strategy', A: 80, fullMark: 150 },
      { subject: 'Mentorship', A: 120, fullMark: 150 },
      { subject: 'Execution', A: 110, fullMark: 150 },
      { subject: 'Conflict', A: 75, fullMark: 150 },
      { subject: 'Growth', A: 130, fullMark: 150 },
    ]
  };

  const handleRoleSelection = (roleId: string) => {
    if (selectedJobRole === roleId) {
      setSelectedJobRole(null);
      return;
    }
    
    setIsMappingLoading(true);
    setSelectedJobRole(roleId);
    
    // Simulate AI delta calculation
    setTimeout(() => {
      setIsMappingLoading(false);
    }, 1500);
  };
  
  const handleCategoryChange = (category: any) => {
    setIsMappingLoading(true);
    setActiveSkillCategory(category);
    setTimeout(() => {
      setIsMappingLoading(false);
    }, 1000);
  };
  
  // Video Showreel State
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [topicExplanation, setTopicExplanation] = useState<string | null>(null);

  const generateShowreel = async () => {
    // Check for API Key
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // Proceed assuming success as per guidelines
    }

    setIsVideoLoading(true);
    setVideoUrl(null);
    
    const statuses = [
      "Initializing Neural Core...",
      "Analyzing Skill DNA Patterns...",
      "Synthesizing Visual Assets...",
      "Mapping Career Trajectory...",
      "Rendering Cinematic Sequence...",
      "Finalizing Professional Showreel..."
    ];

    let currentStatusIndex = 0;
    const statusInterval = setInterval(() => {
      setVideoStatus(statuses[currentStatusIndex]);
      currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
    }, 5000);

    try {
      const apiKey = process.env.GEMINI_API_KEY || "";
      const topic = videoPrompt || "AI Skill DNA";
      setVideoStatus(`Generating Expert Explanation for ${topic}...`);

      // 1. Generate explanation and video prompt using Gemini
      const prompt = `Act as a world-class AI expert. 
        Topic: ${topic}. 
        Tasks: 
        1. Write a 3-sentence high-impact explanation of this topic for a professional portfolio.
        2. Write a 1-sentence highly cinematic visual prompt for a video generation model (Veo) that would act as a background or visual aid for this explanation. Include keywords like 'cinematic', '4k', 'futuristic', 'holographic', 'neural'.
        Return in JSON format: { "explanation": "...", "videoPrompt": "..." }`;

      const aiText = await askGemini(prompt, [], 'EN');
      const aiData = parseAIResponse(aiText || "{}");
      setTopicExplanation(aiData.explanation || "");
      
      setVideoStatus("Synthesizing Neural Visuals...");
      
      // Simulation of a video URL since direct client-side generation is restricted
      setTimeout(() => {
        setVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
        setVideoStatus("Link Established");
      }, 3000);
    } catch (e) {
      console.error("Video generation failed:", e);
      alert("Neural synthesis failed. Please verify your API parameters and try again.");
    } finally {
      setIsVideoLoading(false);
      clearInterval(statusInterval);
    }
  };

  const jobRoles = [
    { id: 'senior-fullstack', name: 'Senior Fullstack Engineer', requirements: { Logic: 130, System: 135, Creative: 100, Frontend: 140, Backend: 135, Cloud: 110, Comms: 120, Teams: 130, Vision: 100, Strategy: 90 } },
    { id: 'ai-specialist', name: 'AI Solutions Architect', requirements: { Logic: 145, System: 140, Creative: 115, Frontend: 65, Backend: 125, Cloud: 140, Comms: 110, Mentorship: 135, Vision: 140, Growth: 145 } },
    { id: 'product-engineer', name: 'Product Growth Engineer', requirements: { Logic: 105, System: 95, Creative: 145, Frontend: 140, Backend: 95, Cloud: 85, Pitching: 145, Empathy: 140, Vision: 120, Execution: 135 } },
  ];

  const mergedSkillData = skillDataByCategory[activeSkillCategory].map(skill => {
    const role = jobRoles.find(r => r.id === selectedJobRole);
    return {
      ...skill,
      Target: role ? ((role.requirements as any)[skill.subject] || 80) : 0
    };
  });

  const [progressData, setProgressData] = useState([
    { name: 'Mon', score: 40 },
    { name: 'Tue', score: 45 },
    { name: 'Wed', score: 62 },
    { name: 'Thu', score: 58 },
    { name: 'Fri', score: 75 },
    { name: 'Sat', score: 85 },
    { name: 'Sun', score: 92 },
  ]);

  const [courses, setCourses] = useState([
    { id: 1, title: "Neural Architecture", duration: "24 Lessons", instructor: "High Readiness", progress: 65, color: "bg-indigo-600/20 text-indigo-400", completed: false },
    { id: 2, title: "Cloud Scalability", duration: "18 Lessons", instructor: "Skill Gap Fill", progress: 20, color: "bg-blue-600/20 text-blue-400", completed: false },
    { id: 3, title: "DSA Mastery", duration: "32 Lessons", instructor: "Core Engineering", progress: 10, color: "bg-cyan-600/20 text-cyan-400", completed: false },
  ]);

  useEffect(() => {
    if (isTasksLoaded && dailyTasks.length === 0 && profile?.diagnosticCompleted) {
      generateDailyTasks();
    }
  }, [isTasksLoaded, profile?.diagnosticCompleted, dailyTasks.length]);

  const generateDailyTasks = async (resultsFromDiagnostic?: any) => {
    if (!user) return;
    setAnalyzingTasks(true);
    try {
      const results = resultsFromDiagnostic || diagnosticResults;
      let diagnosticContext = "";
      if (results) {
        diagnosticContext = `The student recently completed a diagnostic test scoring ${results.score}/${results.total} with an average time of ${results.averageTime}s per question. 
        Topic Analysis: ${JSON.stringify(results.topicAnalysis)}.`;
      }

      const prompt = `Based on a student's progress in 'Neural Architecture' (65%) and 'Cloud Scalability' (20%), and their recent diagnostic results: ${diagnosticContext}, generate 3-4 specific, actionable daily tasks for a tech student. 
      Focus on improving their weak areas identified in the diagnostic.
      Format as a JSON array of objects with: 'id' (number), 'title' (string), 'target' (string e.g., '10 questions'), 'type' (string: lecture/question/practice). 
      Return ONLY the JSON array.`;
      
      const aiText = await askGemini(prompt, [], 'EN');
      const text = aiText || "[]";
      const tasks = parseAIResponse(text).map((t: any) => ({ ...t, completed: false, timestamp: new Date().toISOString() }));
      
      // Clear old tasks and add new ones in Firestore
      // For simplicity in this demo, we'll just add the new ones
      for (const task of tasks) {
        await dataService.addDocument(`users/${user.uid}/tasks`, task);
      }
    } catch (e) {
      console.error("Task generation failed", e);
    }
    setAnalyzingTasks(false);
  };

  const completeTask = async (id: string) => {
    if (!user) return;
    await dataService.setDocument(`users/${user.uid}/tasks`, id, { completed: true });
    
    // Check if all tasks are done for sticker
    const updatedTasks = dailyTasks.map(t => t.id === id ? { ...t, completed: true } : t);
    const allDone = updatedTasks.every(t => t.completed);
    if (allDone && dailyTasks.length > 0 && !dailyTasks.every(t => t.completed)) {
      addSticker('assignment_done', 'Daily Oracle', '🌟');
    }
  };

  const addSticker = async (id: string, name: string, icon: string) => {
    if (!user) return;
    if (stickers.find(s => s.id === id)) return;
    const newSticker = { id, name, icon, date: new Date().toISOString().split('T')[0], timestamp: new Date().toISOString() };
    await dataService.setDocument(`users/${user.uid}/stickers`, id, newSticker);
  };

  const completeCourse = async (courseId: number) => {
    if (!user) return;
     setCourses(prev => {
        const course = prev.find(c => c.id === courseId);
        if (course && course.completed) return prev;
        
        const updated = prev.map(c => c.id === courseId ? { ...c, progress: 100, completed: true } : c);
        const completedCourse = updated.find(c => c.id === courseId);
        
        if (completedCourse) {
           addSticker(`course_${courseId}`, `${completedCourse.title} Master`, '🏆');
           const newCert = {
              title: completedCourse.title,
              date: new Date().toISOString(),
              hours: 45,
              grade: 'A+',
              timestamp: new Date().toISOString()
           };
           dataService.addDocument(`users/${user.uid}/certificates`, newCert);
           setSelectedCertificate(newCert);
        }
        return updated;
     });
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col lg:flex-row pb-20 lg:pb-0 overflow-x-hidden selection:bg-fuchsia-500 selection:text-white">
      {/* Decorative Background Mesh - Aesthetic GenZ elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[20%] w-[10%] h-[10%] bg-cyan-400/10 rounded-full blur-[60px]" />
        
        {/* Aesthetic Floaties */}
        <motion.div 
           animate={{ y: [0, -40, 0], rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[10%] left-[10%] text-6xl opacity-20 hover:opacity-100 transition-opacity cursor-default"
        >
          👾
        </motion.div>
        <motion.div 
           animate={{ y: [0, 35, 0], rotate: [0, -20, 0] }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
           className="absolute bottom-[25%] left-[12%] text-6xl opacity-20 hover:opacity-100 transition-opacity cursor-default"
        >
           🌈
        </motion.div>
        <motion.div 
           animate={{ x: [0, 30, 0], rotate: [0, 360, 0] }}
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className="absolute top-[45%] right-[15%] text-6xl opacity-20 hover:opacity-100 transition-opacity cursor-default"
        >
           💿
        </motion.div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-brand-bg/40 backdrop-blur-md border-r border-white/5 hidden lg:flex flex-col p-6 fixed h-full pt-28 transition-colors duration-300">
        <div className="space-y-2 flex-grow overflow-y-auto">
           {[
             { id: 'overview', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Home' },
             { id: 'reports', icon: <TrendingUp className="w-5 h-5" />, label: 'Reports' },
             { id: 'missions', icon: <Zap className="w-5 h-5" />, label: 'Daily Pulse' },
             { id: 'roadmap', icon: <MapPin className="w-5 h-5" />, label: 'Pathfinder' },
             { id: 'practice', icon: <Code className="w-5 h-5" />, label: 'AI Code Lab' },
             { id: 'skills', icon: <Target className="w-5 h-5" />, label: 'Skill DNA' },
             { id: 'interview', icon: <Mic className="w-5 h-5" />, label: 'Interview Prep' },
             { id: 'coach', icon: <Users className="w-5 h-5" />, label: 'AI Coach' },
             { id: 'showreel', icon: <Youtube className="w-5 h-5" />, label: 'AI Showreel' },
             { id: 'courses', icon: <BookOpen className="w-5 h-5" />, label: 'Courses' },
             { id: 'resume', icon: <FileText className="w-5 h-5" />, label: 'Resume' },
             { id: 'salary', icon: <DollarSign className="w-5 h-5" />, label: 'Salary Intel' },
             { id: 'contest', icon: <Trophy className="w-5 h-5" />, label: 'Contest' },
             { id: 'jobs', icon: <Briefcase className="w-5 h-5" />, label: 'Reverse Hiring' },
             { id: 'portfolio', icon: <Award className="w-5 h-5" />, label: 'Portfolio' },
             { id: 'bounties', icon: <DollarSign className="w-5 h-5" />, label: 'Neural Bounties' },
           ].map(item => (
             <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'courses') {
                    navigate('/learning');
                  } else if (item.id === 'practice') {
                    navigate('/practice');
                  } else {
                    setActiveTab(item.id);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
             >
                {item.icon} {item.label}
             </button>
           ))}
        </div>
        
        <div className="pt-6 border-t border-white/5 space-y-2">
            <button 
              onClick={() => {
                setActiveTab('settings');
                window.scrollTo(0, 0);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                <Settings className="w-5 h-5" /> Settings
            </button>
            <button 
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left"
            >
                <LogOut className="w-5 h-5" /> Logout
            </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-16 sm:bottom-0 left-0 right-0 z-50 bg-brand-bg/80 backdrop-blur-lg border-t border-white/5 flex items-center justify-around px-2 py-3 transition-colors duration-300">
        {[
          { id: 'overview', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'reports', icon: <TrendingUp className="w-5 h-5" /> },
          { id: 'missions', icon: <Zap className="w-5 h-5" /> },
          { id: 'interview', icon: <Mic className="w-5 h-5" /> },
          { id: 'coach', icon: <Users className="w-5 h-5" /> },
          { id: 'roadmap', icon: <MapPin className="w-5 h-5" /> },
          { id: 'practice', icon: <Code className="w-5 h-5" /> },
          { id: 'skills', icon: <Target className="w-5 h-5" /> },
          { id: 'resume', icon: <FileText className="w-5 h-5" /> },
          { id: 'salary', icon: <DollarSign className="w-5 h-5" /> },
          { id: 'portfolio', icon: <Award className="w-5 h-5" /> },
          { id: 'bounties', icon: <DollarSign className="w-5 h-5" /> },
          { id: 'contest', icon: <Trophy className="w-5 h-5" /> },
          { id: 'settings', icon: <Settings className="w-5 h-5" /> },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'courses') {
                navigate('/learning');
              } else if (item.id === 'practice') {
                navigate('/practice');
              } else {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }
            }}
            className={`p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110' : 'text-slate-500'}`}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className={`flex-grow lg:ml-64 min-h-screen pb-20 overflow-x-hidden ${activeTab === 'overview' ? 'p-0 relative' : 'pt-32 px-4 md:px-8'}`}>
        <div className={activeTab === 'overview' ? 'w-full h-full absolute inset-0' : 'max-w-7xl mx-auto'}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
            {activeTab !== 'overview' && (
              <>
                {/* Header - Advanced Command Style */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12 border-b border-white/5 pb-8">
                  <div className="">
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Neural <span className="text-blue-500">Workspace</span>
                      </h1>
                      <div className="flex items-center gap-3 mt-2">
                         <div className="px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 rounded text-[8px] font-black text-blue-400 uppercase tracking-widest">Node: AJ-842</div>
                         <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] italic">Systems Synchronized • Latency 14ms</p>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full xl:w-auto">
                      <div className="flex-grow xl:flex-grow-0 grid grid-cols-2 gap-4">
                         <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Rank Index</div>
                            <div className="text-lg font-black text-white italic tracking-tighter">
                              {diagnosticResults ? `TOP ${((diagnosticResults.rank / 5000) * 100).toFixed(1)}%` : "N/A"}
                            </div>
                         </div>
                         <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Load</div>
                            <div className="text-lg font-black text-blue-500 italic tracking-tighter">94.8%</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 pl-6 border-l border-white/10 relative">
                          <button 
                            onClick={() => {
                              setShowNotifications(!showNotifications);
                              if (!showNotifications) markAllRead();
                            }}
                            className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center relative hover:bg-white/10 transition-all"
                          >
                              <Bell className="w-4 h-4 text-slate-400" />
                              {notifications.some(n => !n.read) && (
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                              )}
                          </button>
      
                          {showNotifications && (
                            <div className="absolute top-full right-0 mt-4 w-80 glass border border-white/10 rounded-3xl overflow-hidden z-[100] shadow-2xl shadow-blue-600/20">
                              <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Signal Intel</h4>
                                <button onClick={() => setNotifications([])} className="text-[10px] text-slate-500 hover:text-white uppercase font-bold">Clear</button>
                              </div>
                              <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                  <div className="p-10 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
                                    No signals detected
                                  </div>
                                ) : (
                                  notifications.map(n => (
                                    <div key={n.id} className={`p-5 border-b border-white/5 hover:bg-white/[0.02] transition-all cursor-default ${!n.read ? 'bg-blue-500/5' : ''}`}>
                                      <div className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                          n.type === 'market_demand' ? 'bg-purple-600/20 text-purple-400' : 
                                          n.type === 'assessment_invite' ? 'bg-green-600/20 text-green-400' :
                                          'bg-blue-600/20 text-blue-400'
                                        }`}>
                                          {n.type === 'market_demand' ? <TrendingUp className="w-4 h-4" /> : 
                                           n.type === 'assessment_invite' ? <Zap className="w-4 h-4" /> : 
                                           <Users className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-[11px] font-bold text-white mb-1 leading-relaxed">
                                            {n.message}
                                          </p>
                                          {n.isTest && !isContestActive && (
                                            <button 
                                              onClick={() => {
                                                setShowNotifications(false);
                                                startContest();
                                              }}
                                              className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                                            >
                                              Initialize Audit Protocol
                                            </button>
                                          )}
                                          <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-2">
                                            {new Date(n.timestamp).toLocaleTimeString()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
      
                          <button 
                            onClick={() => setActiveTab('settings')}
                            className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm italic shadow-lg shadow-blue-600/20 hover:scale-110 hover:rotate-3 transition-all active:scale-95"
                          >
                            AJ
                          </button>
                      </div>
                  </div>
                </div>
              </>
            )}

        {activeTab === 'roadmap' && (
          <div className="space-y-12 pb-20">
            <div className="text-center mb-16 px-4">
              <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedField} <span className="text-blue-500">Pathfinder</span></h2>
              <div className="flex flex-col items-center gap-4 mt-6">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Calculated trajectory for {currentSubDomain || selectedField} Specialization</p>
                <button 
                  onClick={() => setIsChangingDomain(true)}
                  className="px-6 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 font-black text-[9px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <Zap className="w-3 h-3" />
                  Shift Domain Protocol
                </button>
              </div>
            </div>

            <div className="relative max-w-5xl mx-auto px-4">
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-indigo-600 to-slate-800 -translate-x-1/2 hidden md:block opacity-20" />
              
              <div className="space-y-24 relative">
                {careerPath?.topics.map((topic: any, idx: number) => (
                  <motion.div 
                    key={topic.id} 
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    <div className="hidden md:block flex-1" />
                    
                    <div className={`w-16 h-16 rounded-full border-4 border-blue-500 glass flex items-center justify-center shrink-0 z-10 relative bg-blue-500/10`}>
                      <span className="text-xl font-black text-white italic">{idx + 1}</span>
                    </div>

                    <div className="flex-1 w-full">
                      <div className="glass p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Phase 0{idx + 1}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500 text-blue-500 bg-blue-500/10">
                              Active Node
                            </span>
                          </div>
                          <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4">{topic.title}</h4>
                          <p className="text-slate-400 text-xs font-medium mb-6 italic">{topic.description}</p>
                          
                          <div className="space-y-6">
                             {/* Lectures */}
                             <div>
                                <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Learning Modules</h5>
                                <div className="space-y-2">
                                   {topic.lectures.map(lecture => (
                                      <div key={lecture.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group/lec cursor-pointer hover:bg-white/10 transition-all">
                                         <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                                               <Play className="w-4 h-4" />
                                            </div>
                                            <span className="text-[11px] font-bold text-white uppercase tracking-tight">{lecture.title}</span>
                                         </div>
                                         <span className="text-[10px] font-black text-slate-600 uppercase italic">{lecture.duration}</span>
                                      </div>
                                   ))}
                                </div>
                             </div>

                             {/* Practice Nodes */}
                             <div>
                                <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Practice Shards (100 Questions Each)</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                   {topic.subtopics.map(st => (
                                      <button 
                                        key={st.id} 
                                        className="p-3 rounded-xl bg-slate-900 border border-white/5 text-left hover:border-blue-500/50 transition-all"
                                        onClick={async () => {
                                          alert(`Initializing 100-Question Assessment Node for ${st.title}...`);
                                          // Here we would call generateSubtopicQuestions with count: 100
                                          // For now, it's a simulated jump-start
                                        }}
                                      >
                                         <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{st.title}</span>
                                            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                                               <Target className="w-3 h-3 text-white" />
                                            </div>
                                         </div>
                                      </button>
                                   ))}
                                </div>
                             </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="max-w-4xl mx-auto glass p-10 rounded-[3.5rem] border border-white/5 bg-indigo-600/[0.03] text-center">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 italic">Neural Sync Status</h4>
              <p className="text-gray-400 text-sm leading-relaxed italic max-w-2xl mx-auto">
                "Your diagnostic score of {diagnosticScore}% indicates a strong alignment with {selectedField} fundamentals. Focus on the advanced lectures in Phase 01 to accelerate your deployment timeline."
              </p>
            </div>
          </div>
        )}

        {activeTab === 'bounties' && (
          <BountyAgent />
        )}

        {activeTab === 'overview' && (
          <StellarMap profile={profile} />
        )}
        
        {activeTab === 'reports' && (
          <div className="space-y-10">
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Profile Card - Bento Large */}
              <div className="lg:col-span-4 p-10 rounded-[3.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group shadow-2xl shadow-blue-600/20">
                 <div className="absolute top-0 right-0 p-8">
                    <Zap className="w-12 h-12 opacity-20 group-hover:rotate-12 transition-transform" />
                 </div>
                 <div className="relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-3xl font-black italic mb-8">
                       {studentProfile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-2 leading-none font-display">{studentProfile.name}</h2>
                    <p className="text-blue-200 text-xs font-black uppercase tracking-[0.2em] italic mb-10">{studentProfile.role}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 opacity-60 mb-1">Rank</p>
                          <p className="text-xl font-black italic tracking-tighter">#{studentProfile.rank}</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 opacity-60 mb-1">Experience</p>
                          <p className="text-xl font-black italic tracking-tighter">LVL {Math.floor(studentProfile.score / 2) + 1}</p>
                       </div>
                    </div>
                 </div>
                 <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
              </div>

              {/* Weekly Progress - Bento Main */}
              <div className="lg:col-span-8 p-10 rounded-[3.5rem] bg-slate-900 border border-white/5 relative group hover:border-blue-500/20 transition-all overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="flex justify-between items-center mb-10">
                    <div>
                       <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">Neural Growth Log</h3>
                       <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global Synaptic Performance</p>
                    </div>
                    <div className="flex gap-2">
                       {['Week', 'Month'].map(p => (
                          <button key={p} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${p === 'Week' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>{p}</button>
                       ))}
                    </div>
                 </div>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={dailyWorkHistory}>
                          <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={5} dot={false} strokeLinecap="round" />
                          <Line type="monotone" dataKey="completed" stroke="#f472b6" strokeWidth={5} dot={false} strokeLinecap="round" />
                          <Tooltip contentStyle={{ backgroundColor: theme === 'light' ? '#ffffff' : '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }} />
                       </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Sticker Collection - Bento Small */}
              <div className="lg:col-span-4 p-8 rounded-[3.5rem] bg-black/40 border border-white/5 relative overflow-hidden group">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 italic">Memory Vault</h3>
                 <div className="flex flex-wrap gap-4">
                    {stickers.map(s => (
                       <motion.div 
                          key={s.id}
                          whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                          className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-xl hover:bg-white/10 cursor-pointer relative"
                          title={s.name}
                       >
                          {s.icon}
                       </motion.div>
                    ))}
                    <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center text-slate-800 text-xs font-black">
                       ?
                    </div>
                 </div>
              </div>

              {/* Feed Card - Bento Long */}
              <div className="lg:col-span-5 p-8 rounded-[3.5rem] bg-slate-900/60 border border-white/5">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Signal Transmission</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                 </div>
                 <div className="space-y-6">
                    {[
                      { icon: '🔥', text: '5 Day Streak Achieved', time: '2m' },
                      { icon: '👾', text: 'DSA Boss Defeated', time: '1h' },
                      { icon: '💎', text: 'New Skill Shard: Rust', time: '4h' }
                    ].map((item, i) => (
                       <div key={i} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">{item.icon}</div>
                          <div className="flex-1">
                             <p className="text-[11px] font-bold text-white uppercase tracking-tight">{item.text}</p>
                             <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{item.time} ago</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
                       </div>
                    ))}
                 </div>
              </div>

              {/* Skill Radar - Bento Medium */}
              <div className="lg:col-span-3 p-8 rounded-[3.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Neural DNA</h3>
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart data={skillDataByCategory.Technical}>
                        <PolarGrid stroke={theme === 'light' ? '#e2e8f0' : '#ffffff10'} />
                          <Radar dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex justify-center gap-4 mt-4">
                    <div className="text-center">
                       <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Logic</p>
                       <p className="text-xs font-black text-white italic">92%</p>
                    </div>
                    <div className="text-center border-l border-white/10 pl-4">
                       <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Creative</p>
                       <p className="text-xs font-black text-white italic">78%</p>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'missions' && (
           <div className="space-y-12 pb-20">
              <div className="flex justify-between items-end mb-8">
                 <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Daily Pulse</h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic mt-1">Live Efficiency Tracking • Mission Control</p>
                 </div>
                 <div className="px-6 py-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 font-black text-[10px] uppercase tracking-widest">
                    Streak: 12 Days
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 {/* Left: Daily Missions */}
                 <div className="lg:col-span-8 space-y-8">
                    <div className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                       <div className="flex items-center justify-between mb-10">
                          <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">Primary Missions</h4>
                          <button onClick={generateDailyTasks} className="p-3 rounded-xl bg-white/5 border border-white/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all">
                             <Sparkles className="w-4 h-4" />
                          </button>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {dailyTasks.length === 0 ? (
                              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                                 <Rocket className="w-12 h-12 text-slate-800 mb-4 animate-bounce" />
                                 <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">No missions active. Initialize via Diagnostic or start a Course.</p>
                              </div>
                           ) : (
                              dailyTasks.map(task => (
                             <div 
                                key={task.id} 
                                onClick={() => !task.completed && openTaskTerminal(task)}
                                className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer group flex items-start gap-6
                                  ${task.completed ? 'bg-green-500/10 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'bg-black/40 border-white/5 hover:border-blue-500/30'}`}
                             >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0
                                   ${task.completed ? 'bg-green-500 text-white shadow-lg shadow-green-500/40' : 'bg-slate-900 border border-white/10 text-slate-500 group-hover:text-blue-500'}`}>
                                   {task.completed ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-6 h-6" />}
                                </div>
                                <div className="flex-grow">
                                   <div className="flex justify-between items-start mb-2">
                                      <span className={`text-[9px] font-black uppercase tracking-widest ${task.completed ? 'text-green-500' : 'text-slate-500'}`}>{task.type}</span>
                                      {task.completed && <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-[0.2em]">Verified</span>}
                                   </div>
                                   <h5 className={`font-black uppercase tracking-tighter italic text-lg leading-tight ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>{task.title}</h5>
                                   <p className="text-[10px] text-slate-600 font-bold uppercase mt-2">{task.target}</p>
                                </div>
                             </div>
                          )))}
                       </div>
                    </div>

                    {/* Daily Work Graph */}
                    <div className="glass p-10 rounded-[3.5rem] border border-white/5">
                       <h4 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">Neural Growth & Payload Log</h4>
                       <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10">Verification Stats: Progress (%) vs Quests Completed</p>
                       <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={dailyWorkHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="day" stroke="#ffffff30" fontSize={10} tickFormatter={(v) => v.toUpperCase()} />
                                <YAxis yAxisId="left" stroke="#ffffff30" fontSize={10} />
                                <YAxis yAxisId="right" orientation="right" stroke="#ffffff30" fontSize={10} />
                                <Tooltip 
                                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                   itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Line 
                                   yAxisId="left"
                                   type="monotone" 
                                   dataKey="progress" 
                                   stroke="#8b5cf6" 
                                   strokeWidth={4} 
                                   name="Neural Progress (%)"
                                   dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} 
                                />
                                <Line 
                                   yAxisId="right"
                                   type="monotone" 
                                   dataKey="completed" 
                                   stroke="#3b82f6" 
                                   strokeWidth={6} 
                                   name="Quests Completed"
                                   dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} 
                                   activeDot={{ r: 10, fill: '#60a5fa' }}
                                />
                             </LineChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                 </div>

                 {/* Right: Daily Gifts & Certs */}
                 <div className="lg:col-span-4 space-y-8">
                    <div className="p-10 rounded-[3rem] bg-indigo-600 border border-white/10 text-white relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform">
                          <Award className="w-24 h-24" />
                       </div>
                       <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Daily Gift</h3>
                       <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-10">Verification Protocol Required</p>
                       
                       <div className="relative">
                          <div className={`p-8 rounded-[2.5rem] border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-6 transition-all duration-700
                             ${dailyTasks.length > 0 && dailyTasks.every(t => t.completed) ? 'bg-white text-indigo-600 border-solid border-white' : 'backdrop-blur-3xl'}`}>
                             
                             {!(dailyTasks.length > 0 && dailyTasks.every(t => t.completed)) ? (
                                <>
                                   <div className="w-20 h-20 rounded-full bg-black/20 flex items-center justify-center">
                                      <Lock className="w-10 h-10 text-white/50" />
                                   </div>
                                   <div className="text-center">
                                      <p className="text-xs font-black uppercase tracking-widest mb-1">Encrypted Payload</p>
                                      <p className="text-[10px] text-white/60 font-bold uppercase italic italic">Complete all missions to unlock</p>
                                   </div>
                                </>
                             ) : (
                                <>
                                   <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-5xl">
                                      ✨
                                   </div>
                                   <div className="text-center">
                                      <p className="text-xs font-black uppercase tracking-widest mb-1">Gift Available</p>
                                      <button 
                                         onClick={() => navigate('/ai-test')}
                                         className="mt-4 px-8 py-3 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                                      >
                                         <Sparkles className="w-3 h-3" /> Initialize AI Test
                                      </button>
                                   </div>
                                </>
                             )}
                          </div>
                          {!(dailyTasks.length > 0 && dailyTasks.every(t => t.completed)) && (
                            <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center">
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] rotate-90">UNAUTHORIZED</p>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="glass p-10 rounded-[3rem] border border-white/5">
                       <h4 className="text-xl font-black text-white italic tracking-tighter uppercase mb-8">Valid Certificates</h4>
                       <div className="space-y-4">
                          {certificates.length === 0 ? (
                             <div className="h-40 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center text-center p-6">
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">No academic protocols verified. Complete courses to generate certificates.</p>
                             </div>
                          ) : (
                             certificates.map(cert => (
                                <div 
                                   key={cert.id} 
                                   onClick={() => setSelectedCertificate(cert)}
                                   className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all flex items-center gap-4 cursor-pointer group"
                                >
                                   <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                      <Award className="w-6 h-6" />
                                   </div>
                                   <div>
                                      <h5 className="font-black text-white uppercase text-xs tracking-widest">{cert.title}</h5>
                                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{cert.date}</p>
                                   </div>
                                </div>
                             ))
                          )}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
        {activeTab === 'salary' && (
          <div className="max-w-5xl mx-auto space-y-12 pb-20">
             <div className="p-10 md:p-20 rounded-[4rem] bg-slate-900 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                <div className="relative z-10">
                   <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
                      <div>
                         <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4 leading-tight">Skill to Salary</h2>
                         <p className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] italic">Neural Market Prediction Engine</p>
                      </div>
                      <button 
                        onClick={calculateSalary}
                        disabled={isCalculatingSalary}
                        className="px-8 py-4 rounded-full bg-cyan-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-cyan-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                      >
                         {isCalculatingSalary ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />}
                         Calculate Market Value
                      </button>
                   </div>

                   {salaryData ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-10"
                      >
                         <div className="p-10 rounded-[3rem] bg-white text-slate-900 shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Estimated Range (Annual)</p>
                            <h3 className="text-5xl font-black italic tracking-tighter text-blue-600 mb-6">{salaryData.estimated_range}</h3>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                               <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">{salaryData.percentile}</div>
                               <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Top Percentile of your skill cluster</p>
                            </div>
                            
                            <div className="mt-10 space-y-4">
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Core Value Drivers</h4>
                               {salaryData.factors?.map((f: string, i: number) => (
                                 <div key={i} className="flex items-center gap-3 text-sm font-bold italic">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {f}
                                 </div>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div className="p-10 rounded-[3rem] bg-slate-800/50 backdrop-blur border border-white/5">
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4" /> Market Intelligence
                               </h4>
                               <div className="space-y-6">
                                  {salaryData.market_insights?.map((m: string, i: number) => (
                                    <p key={i} className="text-white font-medium italic leading-relaxed text-sm">
                                       <span className="text-blue-500 mr-2 font-black">»</span> {m}
                                    </p>
                                  ))}
                               </div>
                            </div>

                            <div className="p-10 rounded-[3rem] bg-emerald-600 text-white shadow-2xl shadow-emerald-600/20">
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Credora Confidence</h4>
                               <div className="text-4xl font-black italic tracking-tighter mb-4">98.2% Accuracy</div>
                               <p className="text-xs font-bold text-white/80 leading-relaxed uppercase tracking-wider">
                                  Based on live data from 4,000+ placement nodes across the global neural mesh.
                               </p>
                            </div>
                         </div>
                      </motion.div>
                   ) : (
                      <div className="h-96 rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-10">
                         <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Brain className="w-10 h-10 text-white/20" />
                         </div>
                         <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-4">Awaiting Signal</h3>
                         <p className="text-slate-500 text-sm font-medium max-w-md italic leading-relaxed">
                            Initialize the Market Prediction Engine to calculate your real-time value based on your unique Skill DNA.
                         </p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}
        {activeTab === 'resume' && (
           <div className="max-w-5xl mx-auto space-y-12 pb-20">
              <div className="p-10 md:p-16 rounded-[4rem] bg-slate-900 border border-white/5 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4 leading-tight">Identity Synthesis</h2>
                        <p className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] italic">AI-Powered Career Architect</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={async () => {
                            setIsAnalyzingResume(true);
                            try {
                               const prompt = `Generate a highly professional, tech-focused resume based on this profile: ${JSON.stringify(studentProfile)}. 
                               Include sections: Profile Summary, Core Competencies (keywords), Experience (detailed), Projects (impact-focused), Education, and Certifications.
                               Make it sound like a top-tier software engineer. Return ONLY JSON object.`;
                               
                               const aiText = await askGemini(prompt, [], 'EN');
                               const generatedData = parseAIResponse(aiText || "{}");
                               setResumeData(generatedData);
                               saveResumeToStorage(generatedData);
                            } catch (e) {
                               setResumeData({
                                  name: studentProfile.name,
                                  title: "Senior Neural Engineer",
                                  summary: "Expert in distributed high-frequency systems and neural network optimization. Proven track record of architecting scalable cloud solutions and leading multi-disciplinary teams through complex lifecycle transitions.",
                                  skills: ["TypeScript", "React", "Rust", "Distributed Systems", "LLM Integration", "Advanced DSA"],
                                  experience: [
                                     { company: "Credora Labs", role: "Elite Developer", period: "2024 - Present", achievements: ["Reduced query latency by 45% using custom trie-based caching.", "Mentored 50+ junior agents in neural architecture."] },
                                     { company: "Global Core", role: "Systems Architect", period: "2022 - 2024", achievements: ["Led migration of 2M+ users to distributed node cluster.", "Implemented zero-knowledge proof verification layers."] }
                                  ],
                                  projects: [
                                     { name: "Atlas Network", tech: "Rust / Web3", desc: "Decentralized reputation protocol for verifiable skill graphs." },
                                     { name: "Deep Analysis Engine", tech: "Python / Gemini", desc: "Sentiment translation layer for high-density neural logs." }
                                  ],
                                  education: profile?.education || "Massachusetts Institute of Technology"
                               });
                            }
                            setIsAnalyzingResume(false);
                          }}
                          className="px-8 py-4 rounded-full bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                        >
                           {isAnalyzingResume ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                           Synthesize Professional Identity
                        </button>

                        {resumeData && (
                          <button 
                            onClick={downloadResume}
                            disabled={isExportingResume}
                            className="px-8 py-4 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 border border-white/20 disabled:opacity-50"
                          >
                             {isExportingResume ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                             Download PDF
                          </button>
                        )}
                    </div>
                 </div>

                 {resumeData ? (
                    <motion.div 
                      ref={resumeRef}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-12 md:p-20 rounded-[3rem] shadow-2xl shadow-black text-slate-900 font-sans relative overflow-hidden"
                    >
                       <div className="absolute top-10 right-10 text-[10px] font-black uppercase text-slate-300 italic tracking-widest">Verified by Credora Protocol</div>
                       
                       <div className="border-b-4 border-slate-900 pb-10 mb-12">
                          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2 italic">{resumeData.name}</h1>
                          <p className="text-xl font-bold text-blue-600 uppercase tracking-widest">{resumeData.title}</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                          <div className="md:col-span-2 space-y-12">
                             <section>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-100 pb-2">Profile Narrative</h3>
                                <p className="text-lg font-medium leading-relaxed italic text-slate-700">{resumeData.summary}</p>
                             </section>

                             <section>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 border-b border-slate-100 pb-2">Professional Evolution</h3>
                                <div className="space-y-10">
                                   {resumeData.experience?.map((exp: any, i: number) => (
                                      <div key={i} className="relative pl-6 border-l-2 border-slate-100">
                                         <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-blue-600" />
                                         <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-xl font-black uppercase italic">{exp.role}</h4>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{exp.period}</span>
                                         </div>
                                         <p className="text-blue-600 font-bold text-sm mb-4 uppercase">{exp.company}</p>
                                         <ul className="space-y-2">
                                            {exp.achievements?.map((a: string, j: number) => (
                                               <li key={j} className="text-sm font-medium text-slate-600 flex gap-3"><span className="text-blue-500">→</span> {a}</li>
                                            ))}
                                         </ul>
                                      </div>
                                   ))}
                                </div>
                             </section>

                             <section>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 border-b border-slate-100 pb-2">Strategic Initiatives</h3>
                                <div className="grid grid-cols-1 gap-6">
                                   {resumeData.projects?.map((p: any, i: number) => (
                                      <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                         <h4 className="text-lg font-black uppercase italic mb-1">{p.name}</h4>
                                         <p className="text-blue-600 text-[10px] font-bold mb-3 uppercase tracking-tighter">{p.tech}</p>
                                         <p className="text-sm font-medium text-slate-600 italic">{p.desc}</p>
                                      </div>
                                   ))}
                                </div>
                             </section>
                          </div>

                          <div className="space-y-12">
                             <section>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-100 pb-2">Core Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                   {resumeData.skills?.map((s: string) => (
                                      <span key={s} className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase italic tracking-widest rounded-lg">{s}</span>
                                   ))}
                                </div>
                             </section>

                             <section>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-100 pb-2">Academic Foundation</h3>
                                <div className="text-sm font-black uppercase italic leading-loose text-slate-800">
                                   {(() => {
                                      const edu = resumeData?.education;
                                      if (!edu) return "Information not provided";
                                      if (typeof edu === 'string') return edu;
                                      const renderEdu = (item: any) => (
                                         <div className="space-y-1">
                                            <p className="font-extrabold italic text-slate-900">{String(item.degree || item.major || "Advanced Studies")}</p>
                                            <p className="text-blue-600 text-[10px] font-black">{String(item.institution || item.university || "Academic Institution")}</p>
                                            {(item.distinction || item.gpa) && <p className="text-slate-400 text-[10px] font-bold italic tracking-tighter">{String(item.distinction || `GPA: ${item.gpa}`)}</p>}
                                         </div>
                                      );
                                      if (Array.isArray(edu)) return <div className="space-y-4">{edu.map((item: any, idx: number) => <React.Fragment key={idx}>{renderEdu(item)}</React.Fragment>)}</div>;
                                      if (typeof edu === 'object') return renderEdu(edu);
                                      return String(edu);
                                   })()}
                                </div>
                             </section>

                             <section className="p-6 rounded-3xl bg-blue-600/5 border-2 border-blue-600/10">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-4">Neural Analytics</h3>
                                <div className="space-y-4">
                                   <div className="flex justify-between items-center"><span className="text-[10px] font-bold uppercase">DSA Mastery</span> <span className="text-xs font-black">98th Percentile</span></div>
                                   <div className="flex justify-between items-center"><span className="text-[10px] font-bold uppercase">System IQ</span> <span className="text-xs font-black">165+</span></div>
                                </div>
                             </section>
                          </div>
                       </div>

                       <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
                          <div className="flex gap-4">
                             <button className="px-6 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Download PDF</button>
                             <button className="px-6 py-3 rounded-xl border-2 border-slate-900 text-slate-900 text-[10px] font-black uppercase tracking-widest">Share Node</button>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><CheckCircle2 className="w-4 h-4" /></div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Integrity Shield Active</span>
                          </div>
                       </div>
                    </motion.div>
                 ) : (
                    <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[3rem]">
                       <FileText className="w-16 h-16 text-slate-800 mb-6" />
                       <p className="text-slate-500 font-bold uppercase tracking-widest text-center max-w-xs">Initialize synthesis to generate your professional career blueprint.</p>
                    </div>
                 )}
              </div>
           </div>
        )}

         {activeTab === 'skills' && (
            <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">AI Skill <span className="text-blue-500">DNA Mapping</span></h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Comparing neural fingerprint against industry benchmarks</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Role Benchmarking</p>
                      <select 
                         value={selectedJobRole || ''}
                         onChange={(e) => handleRoleSelection(e.target.value)}
                         className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-all uppercase tracking-widest"
                      >
                         <option value="" disabled className="bg-slate-900 hidden">Select Benchmark</option>
                         {jobRoles.map(role => (
                            <option key={role.id} value={role.id} className="bg-slate-900">{role.name}</option>
                         ))}
                      </select>
                   </div>
                   <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5 h-fit">
                       {['Technical', 'Soft Skills', 'Leadership'].map(c => (
                           <button 
                             key={c} 
                             onClick={() => {
                                setIsMappingLoading(true);
                                setTimeout(() => {
                                   setActiveSkillCategory(c as any);
                                   setIsMappingLoading(false);
                                }, 800);
                             }}
                             className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${activeSkillCategory === c ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-white/10'}`}
                           >
                             {c}
                           </button>
                       ))}
                   </div>
                </div>
            </div>

            {/* DNA Visualization Arena */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden h-[500px]">
                  <AnimatePresence>
                    {isMappingLoading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-brand-bg/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-6"
                      >
                         <div className="relative">
                            <div className="w-20 h-20 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                            <BrainCircuit className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                         </div>
                         <div className="text-center">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2 animate-pulse">Calculating Neural Delta</p>
                            <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest leading-relaxed max-w-[180px]">Comparing neural fingerprint against market benchmarks</p>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="absolute top-6 right-10 z-20 flex flex-col items-end">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">Baseline Analysis</p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-blue-500" />
                           <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Your DNA</span>
                        </div>
                        {selectedJobRole && (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-fuchsia-500/50" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Market Target</span>
                          </div>
                        )}
                      </div>
                  </div>

                  <div className="w-full h-full pt-10">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart data={mergedSkillData}>
                        <PolarGrid stroke={theme === 'light' ? '#e2e8f0' : '#ffffff10'} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                          <Radar 
                            name="Your DNA" 
                            dataKey="A" 
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.5} 
                            strokeWidth={3}
                          />
                          {selectedJobRole && (
                            <Radar 
                              name="Industry Benchmark" 
                              dataKey="Target" 
                              stroke="#f43f5e" 
                              fill="#f43f5e" 
                              fillOpacity={0.2} 
                              strokeWidth={2} 
                              strokeDasharray="4 4"
                            />
                          )}
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '1rem', color: '#fff' }}
                            itemStyle={{ color: '#fff', fontSize: '10px' }}
                          />
                       </RadarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 italic">Target Optimization</h4>
                    <p className="text-slate-400 text-xs mb-6 font-medium">Select a career protocol to calculate your delta across the neural mesh.</p>
                    
                    <div className="space-y-3">
                      {jobRoles.map(role => (
                        <button 
                          key={role.id}
                          onClick={() => handleRoleSelection(role.id)}
                          className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedJobRole === role.id ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`text-sm font-bold tracking-tight ${selectedJobRole === role.id ? 'text-white' : 'text-slate-300'}`}>{role.name}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${selectedJobRole === role.id ? 'rotate-90 text-white' : 'text-slate-600'}`} />
                          </div>
                          {selectedJobRole === role.id && (
                             <motion.div 
                               initial={{ opacity: 0, height: 0 }}
                               animate={{ opacity: 1, height: 'auto' }}
                               className="mt-4 pt-4 border-t border-white/10"
                             >
                                <div className="grid grid-cols-2 gap-4">
                                   <div>
                                      <p className="text-[8px] font-black text-blue-200 uppercase">Readiness</p>
                                      <p className="text-xl font-black text-white italic">82%</p>
                                   </div>
                                   <div>
                                      <p className="text-[8px] font-black text-blue-200 uppercase">Est. Market Value</p>
                                      <p className="text-xl font-black text-white italic">$140k+</p>
                                   </div>
                                </div>
                             </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-40 transition-opacity">
                        <Sparkles className="w-8 h-8 text-indigo-400" />
                     </div>
                     <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 italic">DNA Insights</h4>
                     <p className="text-indigo-200 text-xs font-bold leading-relaxed">
                        {selectedJobRole 
                          ? "Your 'System' and 'Logic' parameters exceed the role requirements, but a delta remains in 'Cloud Architecture' and 'Backend Scalability' layers."
                          : "Protocol standby. Select a target to initiate delta calculations and gap-filling recommendations."
                        }
                     </p>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { title: "Node.js Expert Track", questions: 45, status: "In Progress", color: "text-green-500", icon: <Radio className="w-5 h-5" /> },
                 { title: "System Design for Scale", questions: 30, status: "Locked", color: "text-gray-500", icon: <Lock className="w-5 h-5" /> },
                 { title: "React Performance optimization", questions: 25, status: "Completed", color: "text-indigo-500", icon: <Award className="w-5 h-5" /> },
                 { title: "Cloud Architecture (AWS)", questions: 60, status: "New", color: "text-purple-500", icon: <Sparkles className="w-5 h-5" /> }
               ].map((track, i) => (
                 <div key={i} className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all flex justify-between items-center group">
                    <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${track.color} border border-white/5 shadow-xl`}>
                            {track.icon}
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{track.title}</h4>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">Contains 10 questions per major topic • Total {track.questions} min</p>
                        </div>
                    </div>
                    <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${track.status === 'Locked' ? 'bg-white/5 text-gray-600' : 'bg-white text-black hover:bg-indigo-500 hover:text-white'}`}>
                        {track.status === 'Locked' ? <Lock className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                    </button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'interview' && (
           <div className="max-w-4xl mx-auto h-full flex flex-col pt-8">
              {!activeInterviewMode ? (
                <div className="space-y-12 pb-20">
                   <div className="text-center mb-16">
                      <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-tight">Neural <span className="text-blue-500">Interview</span> Prep</h2>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] italic mt-4">Simulating elite technical assessments via AI proctoring</p>
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass p-12 rounded-[4rem] border border-white/5 space-y-8 flex flex-col justify-center items-center text-center">
                         <div className="w-24 h-24 rounded-[2.5rem] bg-blue-600/20 flex items-center justify-center text-blue-500 border border-blue-500/20">
                            <Mic className="w-10 h-10" />
                         </div>
                         <div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Behavioral Simulation</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto italic">AI-driven mock interview focusing on leadership, conflict resolution, and core values. Real-time feedback on communication clarity.</p>
                         </div>
                         <button 
                           onClick={() => {
                             setActiveInterviewMode('behavioral');
                             if (interviewChat.length === 0) {
                               dataService.addDocument(`users/${user?.uid}/interviewChat`, { role: 'ai', text: 'Welcome to the Neural Behavioral Lab. I am your proctor. Let us start: Tell me about a time you resolved a major technical conflict in a distributed team.', timestamp: new Date().toISOString() });
                             }
                           }}
                           className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:scale-105 transition-all"
                         >
                            Initialize Protocol
                         </button>
                      </div>

                      <div className="glass p-12 rounded-[4rem] border border-white/5 space-y-8 flex flex-col justify-center items-center text-center">
                         <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <Target className="w-10 h-10" />
                         </div>
                         <div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Technical Stress Test</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto italic">Deep technical verification on DSA, System Design, and Platform architecture. Expect complex edge-case inquiries.</p>
                         </div>
                         <button 
                            onClick={() => {
                             setActiveInterviewMode('technical');
                             if (interviewChat.length === 0) {
                               dataService.addDocument(`users/${user?.uid}/interviewChat`, { role: 'ai', text: 'Initializing System Stress Test. Scenario: You are designing a real-time analytics engine for a global stock exchange handling 10M events/sec. How do you ensure idempotent processing during node failures?', timestamp: new Date().toISOString() });
                             }
                           }}
                           className="px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
                         >
                            Enter Neural Loop
                         </button>
                      </div>
                   </div>

                   <div className="p-10 rounded-[4rem] bg-white/[0.02] border border-white/5">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 italic text-center">Interview History & Analytics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                         {[
                            { label: 'Avg Clarity', val: '92%', detail: 'Top 5% of Global Pool' },
                            { label: 'Technical Depth', val: '165', detail: 'Elite Logic Tier' },
                            { label: 'Problem Solving', val: 'Fast', detail: '85ms Avg Synapse' }
                         ].map(stat => (
                            <div key={stat.label} className="space-y-2">
                               <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{stat.label}</p>
                               <p className="text-4xl font-black text-white italic tracking-tighter">{stat.val}</p>
                               <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{stat.detail}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col h-[calc(100vh-250px)]">
                  <div className="flex justify-between items-center mb-8">
                      <div>
                          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{activeInterviewMode === 'behavioral' ? 'Behavioral Simulation' : 'Technical Stress Test'} <span className="text-blue-500">Active</span></h3>
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Simulating elite technical assessments via AI proctoring</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <button onClick={() => setActiveInterviewMode(null)} className="p-3 rounded-full hover:bg-white/5 text-slate-400 transition-all font-bold">Close Session</button>
                         <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 animate-pulse">
                            {activeInterviewMode === 'behavioral' ? <Mic className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                         </div>
                      </div>
                  </div>

                  <div className="flex-1 glass border border-white/5 rounded-[3rem] overflow-hidden flex flex-col">
                      <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide bg-black/20">
                         {interviewChat.map((msg, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                            >
                               <div className={`max-w-[80%] p-6 rounded-[2.5rem] text-sm font-medium leading-relaxed relative ${msg.role === 'ai' ? 'bg-white/5 border border-white/5 text-slate-300 italic' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'}`}>
                                  {msg.role === 'ai' && <div className="absolute -left-2 top-6 w-4 h-4 bg-white/5 rotate-45 border-l border-b border-white/5" />}
                                  {msg.role === 'user' && <div className="absolute -right-2 top-6 w-4 h-4 bg-blue-600 rotate-45" />}
                                  {msg.role === 'ai' ? (
                                    <div className="markdown-body text-slate-300">
                                       <Markdown>{msg.text}</Markdown>
                                    </div>
                                  ) : (
                                    msg.text
                                  )}
                               </div>
                            </motion.div>
                         ))}
                         {isInterviewTyping && (
                            <div className="flex justify-start">
                               <div className="px-6 py-4 rounded-full bg-white/5 border border-white/5 flex gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '200ms' }} />
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '400ms' }} />
                               </div>
                            </div>
                         )}
                      </div>

                      <div className="p-8 border-t border-white/5 bg-black/40">
                          <div className="relative flex items-center">
                             <input 
                                id="interview-input-field"
                                type="text" 
                                placeholder="Speak or type your response..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-8 pr-32 text-white font-medium outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                                onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                      handleInterviewMessage((e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                   }
                                }}
                             />
                             <div className="absolute right-4 flex items-center gap-2">
                                 <button onClick={toggleListening} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/40' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}>
                                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                 </button>
                                 <button onClick={() => {
                                     const val = (document.getElementById('interview-input-field') as HTMLInputElement).value;
                                     if (val) {
                                        handleInterviewMessage(val);
                                        (document.getElementById('interview-input-field') as HTMLInputElement).value = '';
                                     }
                                 }} className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-all shadow-lg hover:scale-105 active:scale-95">
                                    <ArrowUpRight className="w-5 h-5" />
                                 </button>
                             </div>
                          </div>
                      </div>
                  </div>
                </div>
              )}
           </div>
        )}

        {activeTab === 'coach' && (
           <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-250px)]">
              <div className="flex justify-between items-center mb-8">
                  <div>
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">AI Career <span className="text-blue-500">Coach</span></h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Real-time personalized growth intelligence</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 animate-pulse">
                     <Users className="w-6 h-6" />
                  </div>
              </div>

              <div className="flex-1 glass border border-white/5 rounded-[3rem] overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide bg-black/20">
                     {coachChat.map((msg, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                        >
                           <div className={`max-w-[80%] p-6 rounded-[2.5rem] text-sm font-medium leading-relaxed relative ${msg.role === 'ai' ? 'bg-white/5 border border-white/5 text-slate-300 italic' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'}`}>
                              {msg.role === 'ai' && <div className="absolute -left-2 top-6 w-4 h-4 bg-white/5 rotate-45 border-l border-b border-white/5" />}
                              {msg.role === 'user' && <div className="absolute -right-2 top-6 w-4 h-4 bg-blue-600 rotate-45" />}
                              {msg.role === 'ai' ? (
                                <div className="markdown-body text-slate-300">
                                   <Markdown>{msg.text}</Markdown>
                                </div>
                              ) : (
                                msg.text
                              )}
                           </div>
                        </motion.div>
                     ))}
                     {isCoachTyping && (
                        <div className="flex justify-start">
                           <div className="px-6 py-4 rounded-full bg-white/5 border border-white/5 flex gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '200ms' }} />
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '400ms' }} />
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="p-8 border-t border-white/5 bg-black/40">
                      <div className="relative flex items-center">
                         <input 
                            id="coach-input-field"
                            type="text" 
                            placeholder="Ask your coach anything..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-8 pr-32 text-white font-medium outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                            onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                  handleCoachMessage((e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                               }
                            }}
                         />
                         <div className="absolute right-4 flex items-center gap-2">
                             <button onClick={toggleListening} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/40' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}>
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                             </button>
                             <button onClick={() => {
                                 const val = (document.getElementById('coach-input-field') as HTMLInputElement).value;
                                 if (val) {
                                    handleCoachMessage(val);
                                    (document.getElementById('coach-input-field') as HTMLInputElement).value = '';
                                 }
                             }} className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-all shadow-lg hover:scale-105 active:scale-95">
                                <ArrowUpRight className="w-5 h-5" />
                             </button>
                         </div>
                      </div>
                  </div>
              </div>
           </div>
        )}

        {activeTab === 'showreel' && (
          <div className="max-w-4xl mx-auto space-y-12 pb-20">
             <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-tight">Neural <span className="text-blue-500">Showreel</span></h2>
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] italic mt-4">Visualizing your skill DNA for the next generation of employers</p>
             </div>

             <div className="glass p-12 rounded-[4rem] border border-white/5 relative overflow-hidden text-center">
                {isVideoLoading ? (
                  <div className="py-20 space-y-8">
                     <div className="relative inline-block text-center mx-auto">
                        <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center">
                           <Rocket className="w-12 h-12 text-blue-500 animate-pulse" />
                        </div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -top-4 -right-4"
                        >
                           <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
                        </motion.div>
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{videoStatus}</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">This process requires significant neural computation and may take a few minutes. Protocol remains active in the background.</p>
                        <div className="w-64 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
                           <motion.div 
                             className="h-full bg-blue-600"
                             animate={{ x: [-256, 256] }}
                             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                           />
                        </div>
                     </div>
                  </div>
                ) : videoUrl ? (
                  <div className="space-y-8">
                     <div className="aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative group bg-black">
                        <video 
                          key={videoUrl}
                          src={videoUrl} 
                          controls 
                          autoPlay 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-6 left-6 px-4 py-2 bg-blue-600/20 backdrop-blur-md rounded-full border border-blue-500/30 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                           <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Neural Draft v1.0</span>
                        </div>
                     </div>
                     
                     {topicExplanation && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-left relative overflow-hidden"
                       >
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                             <Sparkles className="w-6 h-6 text-blue-400" />
                          </div>
                          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">AI Intelligence Protocol</h4>
                          <p className="text-white text-lg font-medium leading-relaxed italic">"{topicExplanation}"</p>
                       </motion.div>
                     )}

                     <div className="flex flex-wrap justify-center gap-4">
                        <button 
                          onClick={() => setVideoUrl(null)}
                          className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                           Regenerate
                        </button>
                        <a 
                          href={videoUrl} 
                          download="Credora_Showreel.mp4"
                          className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 transition-all text-center"
                        >
                           Download Showreel
                        </a>
                     </div>
                  </div>
                ) : (
                  <div className="py-20 space-y-12">
                     <div className="max-w-xl mx-auto space-y-8">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-blue-600/10 flex items-center justify-center mx-auto border border-blue-500/20">
                           <Youtube className="w-10 h-10 text-blue-500" />
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-tight">Generate Your Neural Blueprint</h3>
                           <p className="text-slate-500 text-sm font-medium leading-relaxed">Synthesize a cinematic 7-second showreel that visually maps your unique skill DNA, complexity scores, and career potential.</p>
                        </div>
                        
                        <div className="space-y-3 pt-6 text-left">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Topic for AI Explanation</label>
                           <textarea 
                             value={videoPrompt}
                             onChange={(e) => setVideoPrompt(e.target.value)}
                             placeholder="E.g. The benefits of System Design for Scale, Future of Quantum Computing, My Skill DNA..."
                             className="w-full h-32 bg-white/5 border border-white/5 rounded-[2rem] p-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                           />
                        </div>

                        <button 
                          onClick={generateShowreel}
                          className="w-full py-6 rounded-[2rem] bg-blue-600 text-white font-black text-sm uppercase tracking-widest italic shadow-2xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                        >
                           Initialize Neural Synthesis
                           <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/5 mx-6">
                        {[
                           { label: "Duration", val: "7 Seconds" },
                           { label: "Resolution", val: "720p" },
                           { label: "Model", val: "Veo Lite 3.1" }
                        ].map((stat, i) => (
                           <div key={i} className="text-center">
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{stat.label}</p>
                              <p className="text-xs font-black text-white italic uppercase tracking-tighter">{stat.val}</p>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
             </div>
          </div>
        )}
        {activeTab === 'jobs' && (
           <div className="max-w-6xl mx-auto space-y-12 pb-20">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                 <div>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-tight">Reverse <span className="text-blue-500">Hiring</span></h2>
                    <p className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] italic">Recruiters are bidding for your protocol</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
                       <Radio className="w-3 h-3 text-green-500 animate-pulse" />
                       <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live Auction Active</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Main Bidding Arena */}
                 <div className="lg:col-span-2 space-y-8">
                    <div className="p-10 rounded-[4rem] bg-slate-900 border border-white/5 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-12">
                             <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl">
                                   <Gavel className="w-8 h-8" />
                                </div>
                                <div>
                                   <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Current Bidding War</h3>
                                   <p className="text-[10px] text-slate-500 font-bold uppercase">3 Protocols Interested</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Highest Offer</p>
                                <p className="text-3xl font-black text-white italic">$195,000</p>
                             </div>
                          </div>

                          <div className="space-y-4">
                             {recruiterBids.map((bid, i) => (
                                <motion.div 
                                  key={bid.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-pointer"
                                  onClick={() => setActiveRecruiter(bid)}
                                >
                                   <div className="flex items-center gap-6">
                                      <div className={`w-12 h-12 rounded-xl ${bid.color} flex items-center justify-center text-white font-black italic shadow-lg`}>
                                         {bid.company[0]}
                                      </div>
                                      <div>
                                         <h4 className="text-lg font-black text-white uppercase italic">{bid.company}</h4>
                                         <div className="flex gap-4 mt-1">
                                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{bid.equity} Equity</span>
                                            <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">{bid.status}</span>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-6">
                                      <div className="text-right">
                                         <p className="text-[10px] font-black text-white uppercase">{bid.basePay}</p>
                                         <p className="text-[8px] text-slate-500 font-bold uppercase">Base Package</p>
                                      </div>
                                      <button className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                         <ArrowUpRight className="w-5 h-5" />
                                      </button>
                                   </div>
                                </motion.div>
                             ))}
                          </div>

                          <div className="mt-12 p-8 rounded-[3rem] bg-blue-600/5 border border-blue-600/10 backdrop-blur-3xl">
                             <div className="flex items-center gap-4 mb-4">
                                <Sparkles className="w-5 h-5 text-blue-500" />
                                <h4 className="text-sm font-black text-white uppercase tracking-widest italic">AI Negotiation Strategy</h4>
                             </div>
                             <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed uppercase">
                                Analysis suggests Nebula Core is desperate for your "Neural Distributed Search" expertise. Recommended action: Delay response by 12 hours to trigger a recursive bid increase from Matrix Systems.
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="p-8 rounded-[3rem] bg-black/40 border border-white/5">
                          <div className="flex items-center gap-3 mb-6">
                             <ShieldCheck className="w-5 h-5 text-green-500" />
                             <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Guard</h4>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-6 leading-relaxed">Your personal information is encrypted. Recruiters only see your validated skill graph and code artifacts until you authorize a handshake.</p>
                          <div className="flex justify-between items-center">
                             <span className="text-[8px] font-black text-slate-400 uppercase italic">Anonymity: 98%</span>
                             <button className="text-[8px] font-black text-blue-500 uppercase tracking-widest border-b border-blue-500/20 pb-1">Reveal Identity</button>
                          </div>
                       </div>
                       <div className="p-8 rounded-[3rem] bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/10">
                          <div className="flex items-center gap-3 mb-6">
                             <Handshake className="w-5 h-5 text-indigo-400" />
                             <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Neural Contracts</h4>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-6 leading-relaxed">Direct algorithmic matching for permanent roles. Skip the sourcing phase and enter the validation loop immediately.</p>
                          <button className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20">Active Matches (12)</button>
                       </div>
                    </div>
                 </div>

                 {/* Recruiter Sidebar */}
                 <div className="space-y-8">
                    <div className="p-8 rounded-[3rem] bg-slate-900/50 border border-white/5 h-full">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 italic">Recruiter Pulse</h4>
                       
                       <AnimatePresence mode="wait">
                          {activeRecruiter ? (
                             <motion.div 
                                key={activeRecruiter.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                             >
                                <div className="text-center group">
                                   <div className={`w-24 h-24 rounded-[2.5rem] ${activeRecruiter.color} mx-auto flex items-center justify-center text-4xl font-black text-white shadow-2xl mb-6 relative`}>
                                      {activeRecruiter.company[0]}
                                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                                         <Mail className="w-4 h-4 text-blue-500" />
                                      </div>
                                   </div>
                                   <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{activeRecruiter.company}</h3>
                                   <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-2 italic">Senior Talent Scouter</p>
                                </div>

                                <div className="space-y-4">
                                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                      <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Recruiter Pitch</p>
                                      <p className="text-[10px] text-slate-300 font-bold italic leading-relaxed uppercase">"We've tracked your recent DSA Master performance. Your 'Binary Search' solutions are among the most elegant we've seen since the node-split of '22. We want you for our core Neural team."</p>
                                   </div>
                                   
                                   <div className="grid grid-cols-2 gap-4">
                                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                         <p className="text-sm font-black text-white uppercase italic">15M</p>
                                         <p className="text-[8px] text-slate-500 font-black uppercase">Avg Response</p>
                                      </div>
                                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                         <p className="text-sm font-black text-white uppercase italic">320+</p>
                                         <p className="text-[8px] text-slate-500 font-black uppercase">Recent Hires</p>
                                      </div>
                                   </div>
                                </div>

                                <div className="space-y-2 pt-8">
                                   <button className="w-full py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Accept Handshake</button>
                                   <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 transition-all">Decline Protocol</button>
                                   <button 
                                     onClick={() => setActiveRecruiter(null)}
                                     className="w-full py-4 text-slate-600 text-[8px] font-black uppercase tracking-widest"
                                   >
                                      Close Protocol
                                   </button>
                                </div>
                             </motion.div>
                          ) : (
                             <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                <Briefcase className="w-16 h-16 text-slate-500 mb-6" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest max-w-[150px]">Select a recruiter bid to initialize direct neural link.</p>
                             </div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>
              </div>
           </div>
        )}
        {activeTab === 'portfolio' && (
           <div className="space-y-12">
              <div className="flex justify-between items-end">
                  <div>
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Public Portfolio</h3>
                      <p className="text-slate-500 text-xs font-medium tracking-widest uppercase italic mt-1">Recruiter-Viewable Protocol</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                     <div className="flex gap-2">
                        <button 
                          onClick={() => setIsChangingDomain(true)}
                          className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                           <Zap className="w-4 h-4 text-yellow-400" />
                           Shift Domain
                        </button>
                        <button 
                          onClick={generatePortfolioLink}
                          disabled={isSharing}
                          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                           {isSharing ? (
                              <>
                                 <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                 Generating...
                              </>
                           ) : (
                              <>
                                 <Award className="w-4 h-4" />
                                 Share Protocol
                              </>
                           )}
                        </button>
                      </div>
                      {portfolioLink && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                           <p className="text-[10px] font-bold text-blue-400 font-mono tracking-tighter">{portfolioLink}</p>
                           <button 
                             onClick={() => navigator.clipboard.writeText(portfolioLink)}
                             className="p-1 hover:text-white text-blue-500 transition-colors"
                           >
                              <Copy className="w-3 h-3" />
                           </button>
                        </div>
                      )}
                  </div>
              </div>

              {/* Portfolio Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                 <div className="p-10 rounded-[3rem] bg-indigo-600/5 border border-indigo-500/10 space-y-8">
                    <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-6">Neural Trophy Case</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-6">
                       {stickers.map((sticker, i) => (
                          <motion.div 
                            key={sticker.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col items-center gap-3 group"
                          >
                             <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-xl hover:scale-110 hover:rotate-6 transition-all relative">
                                {sticker.icon}
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                             </div>
                             <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">{sticker.name}</div>
                          </motion.div>
                       ))}
                       {Array.from({ length: 8 - stickers.length }).map((_, i) => (
                          <div 
                            key={i} 
                            onClick={() => setActiveTab('overview')}
                            className="flex flex-col items-center gap-3 opacity-40 hover:opacity-100 cursor-pointer transition-all group"
                          >
                             <div className="w-20 h-20 rounded-full bg-black/40 border border-dashed border-white/20 flex items-center justify-center group-hover:border-blue-500/50">
                                <Sparkles className="w-6 h-6 text-blue-500/50 group-hover:text-blue-400 group-hover:animate-pulse" />
                             </div>
                             <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Available Slot</div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="glass p-10 rounded-[4rem] border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12">
                      <div className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-2xl shadow-indigo-600/50 italic">
                          Neural Verified Profile
                      </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-16">
                      <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-blue-600/40 border-4 border-white/10 uppercase">
                         {studentProfile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-center md:text-left pt-4">
                          <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-3 leading-none">{studentProfile.name}</h2>
                          <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                             <p className="text-blue-500 font-black uppercase text-xs tracking-widest">{studentProfile.role}</p>
                             <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                             <p className="text-slate-500 font-black uppercase text-xs tracking-widest">Logic Tier {Math.floor(studentProfile.score / 10) || 1}</p>
                          </div>
                          <div className="flex gap-6 justify-center md:justify-start">
                              <span className="text-[10px] text-slate-500 flex items-center gap-2 font-black uppercase tracking-widest"><MapPin className="w-3 h-3 text-blue-500" /> {profile?.location || 'Remote Grid'}</span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-2 font-black uppercase tracking-widest"><Calendar className="w-3 h-3 text-blue-500" /> {profile?.experience || 'Neural Rookie'}</span>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div>
                          <div className="flex items-center gap-4 mb-8">
                             <div className="h-px bg-white/10 flex-grow" />
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic whitespace-nowrap">Skill Frequency</h4>
                             <div className="h-px bg-white/10 flex-grow" />
                          </div>
                          <div className="space-y-8">
                              {[
                                  { label: 'Cloud Architecture', score: 96, col: 'bg-blue-500' },
                                  { label: 'React / Next.js', score: 94, col: 'bg-indigo-500' },
                                  { label: 'Distributed Systems', score: 89, col: 'bg-cyan-500' }
                              ].map(s => (
                                  <div key={s.label}>
                                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                          <span className="text-slate-400">{s.label}</span>
                                          <span className="text-white">Top 1%</span>
                                      </div>
                                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                          <div className={`h-full ${s.col}`} style={{ width: `${s.score}%` }} />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      <div className="space-y-8">
                          <div className="flex justify-between items-center mb-8">
                             <div className="h-px bg-white/10 flex-grow" />
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic whitespace-nowrap px-4">Neural Milestones</h4>
                             <div className="h-px bg-white/10 flex-grow" />
                             <button 
                               onClick={addUserProject}
                               className="ml-4 p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-600/10"
                             >
                                <Zap className="w-4 h-4" />
                             </button>
                          </div>
                          <div className="space-y-6">
                            {userProjects.map(project => (
                             <div key={project.id} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all group relative">
                                 <button 
                                   onClick={() => removeUserProject(project.id)}
                                   className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all"
                                 >
                                    <LogOut className="w-4 h-4" />
                                 </button>
                                 <h5 className="font-black uppercase text-xs text-white mb-2 group-hover:text-blue-500 transition-colors">{project.title}</h5>
                                 <p className="text-[10px] text-slate-500 leading-relaxed font-medium mb-4">{project.description}</p>
                                 <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md">{project.tech}</span>
                                    <button 
                                      onClick={() => suggestProjectDescription(project.id)}
                                      disabled={isGeneratingProjDesc === project.id}
                                      className="flex items-center gap-2 text-[8px] font-black text-fuchsia-500 uppercase tracking-widest hover:text-fuchsia-400 transition-colors disabled:opacity-50"
                                    >
                                       <Sparkles className="w-3 h-3" />
                                       {isGeneratingProjDesc === project.id ? 'Synthesizing...' : 'Magic Description'}
                                    </button>
                                 </div>
                             </div>
                            ))}
                          </div>
                      </div>
                  </div>
               </div>

               {/* Mission Terminal Modal */}
               <AnimatePresence>
                 {selectedTask && (
                   <motion.div 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }} 
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 mb-0"
                   >
                     <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={() => setSelectedTask(null)} />
                     <motion.div 
                       initial={{ scale: 0.9, y: 30 }}
                       animate={{ scale: 1, y: 0 }}
                       exit={{ scale: 0.9, y: 30 }}
                       className="relative w-full max-w-4xl h-[600px] flex flex-col bg-slate-900 border border-blue-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)]"
                     >
                        <div className="p-8 border-b border-white/5 bg-blue-600/5 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                                 <Sparkles className="w-6 h-6" />
                              </div>
                              <div>
                                 <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{selectedTask.title}</h4>
                                 <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Target: {selectedTask.target}</p>
                              </div>
                           </div>
                           <button onClick={() => setSelectedTask(null)} className="p-3 rounded-full hover:bg-white/5 text-slate-500 transition-all">
                              <LogOut className="w-6 h-6" />
                           </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                           {taskChat.map((m, i) => (
                             <motion.div 
                               initial={{ opacity: 0, x: m.role === 'ai' ? -20 : 20 }}
                               animate={{ opacity: 1, x: 0 }}
                               key={i} 
                               className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                             >
                                <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm font-bold leading-relaxed
                                   ${m.role === 'ai' ? 'bg-black/40 border border-white/10 text-slate-300 italic' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'}`}>
                                   {m.role === 'ai' ? (
                                      <div className="markdown-body">
                                         <Markdown>{m.text}</Markdown>
                                      </div>
                                   ) : (
                                      m.text
                                   )}
                                </div>
                             </motion.div>
                           ))}
                           {isTalking && (
                             <div className="flex justify-start">
                                <div className="px-6 py-4 rounded-2xl bg-black/40 border border-white/5 flex gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '200ms' }} />
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '400ms' }} />
                                </div>
                             </div>
                           )}
                        </div>

                        <div className="p-8 border-t border-white/5 bg-black/20">
                           <div className="relative group flex items-center gap-4">
                              <div className="relative flex-1">
                                 <textarea 
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 pr-20 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800 h-24 resize-none"
                                    placeholder="Neural Transmission: Describe work completed..."
                                    value={taskUserInput}
                                    onChange={(e) => setTaskUserInput(e.target.value)}
                                    onKeyDown={(e) => {
                                       if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          sendTaskMessage(taskUserInput);
                                          setTaskUserInput('');
                                       }
                                    }}
                                 />
                                 <button 
                                   onClick={() => {
                                      sendTaskMessage(taskUserInput);
                                      setTaskUserInput('');
                                   }}
                                   className="absolute right-4 bottom-4 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg"
                                 >
                                    <ChevronRight className="w-6 h-6" />
                                 </button>
                              </div>
                              <button 
                                onClick={toggleListening}
                                className={`p-8 rounded-2xl border transition-all ${isListening ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/40 animate-pulse' : 'bg-white/5 border-white/10 text-slate-500'}`}
                              >
                                 {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6" />}
                              </button>
                           </div>
                        </div>
                     </motion.div>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Course Completion Section */}
               <div className="mt-12 space-y-8">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Academic Progress Nodes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {courses.map(course => (
                        <div key={course.id} className="p-8 rounded-[3rem] bg-slate-900 border border-white/5 space-y-6 relative group overflow-hidden">
                           <div className="flex justify-between items-start">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${course.color} shadow-lg`}>
                                 <BookOpen className="w-6 h-6" />
                              </div>
                              {course.completed && (
                                 <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[8px] font-black text-green-500 uppercase tracking-widest">Completed</div>
                              )}
                           </div>
                           <div>
                              <h4 className="font-black text-white uppercase italic tracking-tighter text-lg">{course.title}</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{course.duration}</p>
                           </div>
                           <div className="space-y-2">
                              <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                                 <span>Protocol Sync</span>
                                 <span>{course.progress}%</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                              </div>
                           </div>
                           {!course.completed ? (
                              <button 
                                onClick={() => completeCourse(course.id)}
                                className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                              >
                                {course.progress < 100 ? 'Deep Dive' : 'Claim Sticker'}
                              </button>
                           ) : (
                              <button 
                                onClick={() => setSelectedCertificate(certificates.find(c => c.title === course.title))}
                                className="w-full py-4 rounded-xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
                              >
                                View Certificate
                              </button>
                           )}
                        </div>
                     ))}
                  </div>
               </div>

               {/* Certificate Modal */}
               <AnimatePresence>
                  {selectedCertificate && (
                     <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
                     >
                        <motion.div 
                           initial={{ scale: 0.9, y: 30 }}
                           animate={{ scale: 1, y: 0 }}
                           exit={{ scale: 0.9, y: 30 }}
                           className="w-full max-w-4xl aspect-[1.4/1] bg-white rounded-xl shadow-2xl relative overflow-hidden flex"
                        >
                           {/* Certificate Design */}
                           <div className="absolute inset-0 border-[20px] border-blue-600/10" />
                           <div className="absolute inset-[30px] border border-blue-600/50" />
                           
                           <div className="flex-1 flex flex-col items-center justify-center p-12 md:p-20 text-center relative">
                              <div className="mb-6 flex">
                                 <div className="p-4 rounded-2xl bg-blue-600 text-white">
                                    <Award className="w-12 h-12 md:w-16 md:h-16" />
                                 </div>
                              </div>
                              <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.8em] mb-4">Certificate of Mastery</h2>
                              <h3 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 md:mb-8 leading-none">
                                 {selectedCertificate.title}
                              </h3>
                              <p className="text-sm md:text-lg text-slate-500 font-serif italic mb-6 md:mb-10 max-w-md">This document certifies that the user has successfully synchronized with the neural protocols of the specified course.</p>
                              
                              <div className="grid grid-cols-3 gap-8 md:gap-20 w-full mb-10 md:mb-16">
                                 <div className="border-t border-slate-200 pt-4">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Completion Date</p>
                                    <p className="text-[10px] md:text-xs font-bold text-slate-900 uppercase">{selectedCertificate.date}</p>
                                 </div>
                                 <div className="border-t border-slate-200 pt-4">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Protocol Tier</p>
                                    <p className="text-[10px] md:text-xs font-bold text-slate-900 uppercase">Master Grade {selectedCertificate.grade}</p>
                                 </div>
                                 <div className="border-t border-slate-200 pt-4">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Authority Index</p>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png" className="h-6 md:h-8 mx-auto grayscale invert" alt="Signature" />
                                 </div>
                               </div>

                              <div className="absolute bottom-10 md:bottom-20 right-10 md:right-20">
                                 <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-double border-blue-600/20 flex flex-col items-center justify-center">
                                    <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-blue-600/40 mb-1" />
                                    <span className="text-[6px] font-black text-blue-600/40 uppercase tracking-widest">Neural Seal</span>
                                 </div>
                              </div>
                           </div>
                           
                           <button 
                              onClick={() => setSelectedCertificate(null)}
                              className="absolute top-4 md:top-8 right-4 md:right-8 p-3 rounded-full hover:bg-slate-100 text-slate-400 transition-all"
                           >
                              <LogOut className="w-6 h-6" />
                           </button>
                        </motion.div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         )}
         {activeTab === 'contest' && (
            <div className="space-y-12">
               {!isContestActive && !contestResult && (
                  <div className="max-w-6xl mx-auto space-y-12">
                     <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                        <div>
                           <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-tight">Neural Arenas</h2>
                           <p className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] italic">Select Your Combat Simulation</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl">
                           <button onClick={() => setIsPremium(false)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!isPremium ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Standard</button>
                           <button onClick={() => setIsPremium(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isPremium ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Premium</button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Local Hackathon */}
                        <div className="p-8 md:p-12 rounded-[4rem] bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/20 relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                           <div className="relative z-10">
                              <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl mb-8 group-hover:rotate-12 transition-transform">
                                 <Globe className="w-10 h-10" />
                              </div>
                              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">Local Hackathon</h3>
                              <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8 uppercase">A massive local convergence in {locationCoords ? 'Your Area' : 'Scanning...'} with 5,000+ neural agents competing for regional supremacy.</p>
                              
                              <div className="grid grid-cols-2 gap-4 mb-10">
                                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-xl font-black text-white italic tracking-tighter">5K</p>
                                    <p className="text-[8px] text-slate-500 font-black uppercase">Agents</p>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-xl font-black text-white italic tracking-tighter">60M</p>
                                    <p className="text-[8px] text-slate-500 font-black uppercase">Runtime</p>
                                 </div>
                              </div>

                              <button 
                                 onClick={startContest}
                                 className="w-full py-5 rounded-3xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-600/20"
                              >
                                 Enter Simulation
                              </button>
                           </div>
                        </div>

                        {/* Elite Challenge */}
                        <div className={`p-8 md:p-12 rounded-[4rem] border relative overflow-hidden group transition-all
                           ${isPremium ? 'bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/20' : 'bg-slate-900/40 border-white/5 grayscale pointer-events-none blur-[2px]'}`}>
                           {!isPremium && (
                              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
                                 <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-2xl animate-bounce">
                                    <Lock className="w-10 h-10" />
                                 </div>
                                 <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">Elite Arena Locked</h4>
                                 <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8">Premium Clearance Required</p>
                                 <button onClick={() => setIsPremium(true)} className="px-8 py-4 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:scale-110 transition-all">Upgrade Protocol</button>
                              </div>
                           )}
                           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                           <div className="relative z-10">
                              <div className="flex justify-between items-start mb-8">
                                 <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl group-hover:-rotate-12 transition-transform">
                                    <Star className="w-10 h-10" />
                                 </div>
                                 <div className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase italic tracking-widest">ELITE ONLY</span>
                                 </div>
                              </div>
                              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">Elite Challenge</h3>
                              <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8 uppercase">A restricted arena for the top 1% of coders. Extreme algorithmic puzzles and real-time elite competition.</p>
                              
                              <div className="grid grid-cols-2 gap-4 mb-10">
                                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-xl font-black text-white italic tracking-tighter">TOP 500</p>
                                    <p className="text-[8px] text-slate-500 font-black uppercase">Elite Agents</p>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-xl font-black text-white italic tracking-tighter">90M</p>
                                    <p className="text-[8px] text-slate-500 font-black uppercase">Runtime</p>
                                 </div>
                              </div>

                              <button 
                                 onClick={startContest}
                                 className="w-full py-5 rounded-3xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                              >
                                 Initiate Protocol
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 rounded-[3rem] bg-black/40 border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                           <Info className="w-5 h-5 text-blue-500" />
                           <h4 className="text-sm font-black text-white uppercase tracking-widest">Competition Protocol</h4>
                        </div>
                        <ul className="space-y-4">
                           {[
                              "Constant neural proctoring initialized via camera/microphone sync.",
                              "Two warnings issued upon loss of biometric link before immediate termination.",
                              "Questions cover Dynamic Programming, Advanced Trees, and Distributed Heuristics.",
                              "AI-powered deep analysis provided upon successful protocol conclusion."
                           ].map((rule, i) => (
                              <li key={i} className="flex gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                                 <span className="text-blue-500">{i + 1}.</span>
                                 {rule}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               )}

               {isContestActive && (
                  <div className="fixed inset-0 z-[500] bg-brand-bg flex flex-col md:flex-row overflow-hidden pb-16 md:pb-0">
                     {/* Transparent Proctoring Indicator Bar */}
                     <div className="absolute top-4 right-4 z-[600] flex items-center gap-3 bg-black/20 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full pointer-events-none">
                        <div className="flex items-center gap-2">
                           {camEnabled ? (
                              <Camera className="w-4 h-4 text-emerald-400" />
                           ) : (
                              <div className="relative">
                                 <Camera className="w-4 h-4 text-red-500 opacity-50" />
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-0.5 bg-red-500 rotate-45 transform" />
                                 </div>
                              </div>
                           )}
                           <span className={`text-[10px] font-black uppercase tracking-widest ${camEnabled ? 'text-emerald-400' : 'text-red-500'}`}>CAM</span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-2">
                           {micEnabled ? (
                              <Mic className="w-4 h-4 text-blue-400" />
                           ) : (
                              <div className="relative">
                                 <Mic className="w-4 h-4 text-red-500 opacity-50" />
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-0.5 bg-red-500 rotate-45 transform" />
                                 </div>
                              </div>
                           )}
                           <span className={`text-[10px] font-black uppercase tracking-widest ${micEnabled ? 'text-blue-400' : 'text-red-500'}`}>MIC</span>
                        </div>
                        <div className={`ml-2 w-2 h-2 rounded-full animate-pulse ${camEnabled && micEnabled ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                     </div>

                     <AnimatePresence>
                        {(!micEnabled || !camEnabled) && (
                           <motion.div 
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] w-[90%] max-w-xl"
                           >
                              <div className="bg-red-600/95 backdrop-blur-xl border border-red-500 p-4 md:p-6 rounded-3xl flex items-center justify-between shadow-2xl">
                                 <div className="flex items-center gap-4">
                                    <AlertTriangle className="w-6 h-6 text-white animate-pulse shrink-0" />
                                    <div>
                                       <p className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest">Biometric Link Lost</p>
                                       <p className="text-[10px] font-bold text-white/80 uppercase">Warning {proctoringWarnings}/2</p>
                                    </div>
                                 </div>
                                 <button onClick={() => { setCamEnabled(true); setMicEnabled(true); }} className="px-4 py-2 rounded-xl bg-white text-red-600 text-[10px] font-black uppercase">Enable</button>
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>

                     <div className="w-full md:w-80 bg-black/40 border-r border-white/5 flex flex-col pt-8 p-6 overflow-y-auto">
                        <div className="mb-8">
                           <h4 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1">DSA Master</h4>
                           <p className="text-blue-500 text-[8px] font-black uppercase tracking-widest italic">{locationCoords ? 'Local Node Active' : 'Global Sync'}</p>
                        </div>
                        
                        <div className="grid grid-cols-5 md:grid-cols-4 gap-2 mb-8">
                           {contestQuestions.map((q, i) => (
                              <button 
                                 key={q.id}
                                 onClick={() => setCurrentQuestionIndex(i)}
                                 className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-all border
                                    ${currentQuestionIndex === i ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 
                                      userAnswers[i] ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-white/5 border-white/10 text-slate-500'}`}
                              >
                                 {i + 1}
                              </button>
                           ))}
                        </div>

                        <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                           <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                              <div className="aspect-video bg-black/80 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                                 {camEnabled ? (
                                    <div className="w-full h-full bg-blue-500/10 flex flex-col items-center justify-center text-[8px] font-black text-blue-500 uppercase">
                                       <Camera className="w-4 h-4 mb-1" /> Verified
                                    </div>
                                 ) : (
                                    <CameraOff className="w-4 h-4 text-slate-800" />
                                 )}
                              </div>
                              <div className="flex justify-between items-center mt-3">
                                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Auditory: {micEnabled ? 'ON' : 'OFF'}</span>
                                 <button onClick={() => { setCamEnabled(true); setMicEnabled(true); }} className="text-[8px] font-black text-blue-500 uppercase uppercase">Sync</button>
                              </div>
                           </div>
                           <button onClick={submitContest} className="w-full py-3 rounded-xl bg-white text-black font-black text-[10px] uppercase">Submit Simulation</button>
                        </div>
                     </div>

                     <div className="flex-1 flex flex-col p-4 md:p-10 overflow-y-auto">
                        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 h-full flex flex-col">
                           <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-8">
                              <div className="flex justify-between items-center mb-6">
                                 <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{contestQuestions[currentQuestionIndex]?.title}</h3>
                                 <button 
                                    onClick={() => {
                                       const nextIndex = currentQuestionIndex < contestQuestions.length - 1 ? currentQuestionIndex + 1 : currentQuestionIndex;
                                       setCurrentQuestionIndex(nextIndex);
                                    }}
                                    className="px-6 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-600/10"
                                 >
                                    Sync Solution
                                 </button>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Link Expiry</p>
                                 <p className="text-xl font-black text-white italic">{Math.floor(contestTimer / 60)}:{(contestTimer % 60).toString().padStart(2, '0')}</p>
                              </div>
                           </div>

                           <div className="flex-grow space-y-8 scrollbar-hide">
                              <div className="flex gap-4">
                                 <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[8px] font-black uppercase">{contestQuestions[currentQuestionIndex]?.difficulty} Severity</span>
                                 <span className="px-3 py-1 bg-white/5 text-slate-500 rounded-full text-[8px] font-black uppercase">{contestQuestions[currentQuestionIndex]?.topic}</span>
                              </div>
                              <p className="text-slate-300 font-bold leading-relaxed">{contestQuestions[currentQuestionIndex]?.description}</p>
                              <textarea 
                                 className="w-full h-80 bg-black/60 border border-white/10 rounded-2xl p-6 text-blue-400 font-mono text-xs focus:border-blue-500/30 transition-all outline-none resize-none"
                                 placeholder="Enter cryptographic solution here..."
                                 value={userAnswers[currentQuestionIndex] || ''}
                                 onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: e.target.value }))}
                              />
                           </div>
                        </div>
                     </div>

                     <div className="hidden lg:flex w-80 bg-black/40 border-l border-white/5 flex-col p-6 overflow-y-auto">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Simulation Leaderboard</h4>
                        <div className="space-y-2">
                           {contestLeaderboard.map((p, i) => (
                              <div key={i} className={`p-3 rounded-xl flex items-center justify-between border ${i === 0 ? 'bg-blue-600/10 border-blue-500/20' : 'bg-white/5 border-white/5'}`}>
                                 <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black italic text-slate-700">0{i+1}</span>
                                    <span className="text-[10px] font-black text-white uppercase">{p.name}</span>
                                 </div>
                                 <span className="text-[10px] font-black text-blue-500">{p.solved}Q</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {contestResult && !isContestActive && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-20">
                     <div className="p-8 md:p-16 rounded-[4rem] bg-slate-900 border border-white/5 relative overflow-hidden">
                        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
                           <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-blue-600 flex items-center justify-center text-white text-5xl md:text-6xl font-black italic shadow-2xl">
                              #{contestResult.rank}
                           </div>
                           <div className="text-center md:text-left flex-grow">
                              {contestResult.terminated && (
                                  <div className="mb-6 p-6 rounded-3xl bg-red-500/10 border-2 border-red-500/20 text-red-500">
                                     <div className="flex items-center gap-3 mb-2">
                                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                                        <h3 className="text-sm font-black uppercase tracking-widest">Contest Terminated Protocol</h3>
                                     </div>
                                     <p className="text-[10px] uppercase font-bold italic tracking-wider leading-relaxed">Reason: {contestResult.reason || 'Integrity Violation detected during neural scan.'}</p>
                                  </div>
                                )}
                               <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-4">Neural Protocol Analysis</h2>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mt-8">
                                 <div><p className="text-[8px] text-slate-500 font-black mb-1 uppercase">Score</p><p className="text-xl font-black text-white uppercase">{contestResult.score}</p></div>
                                 <div><p className="text-[8px] text-slate-500 font-black mb-1 uppercase">Accuracy</p><p className="text-xl font-black text-white uppercase">{contestResult.accuracy}</p></div>
                                 <div><p className="text-[8px] text-slate-500 font-black mb-1 uppercase">Ranking</p><p className="text-xl font-black text-white uppercase">TOP {Math.ceil((contestResult.rank/5000)*100)}%</p></div>
                                 <div><p className="text-[8px] text-slate-500 font-black mb-1 uppercase">Students</p><p className="text-xl font-black text-white uppercase">5.2K</p></div>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {contestResult.analysis?.slice(0, 4).map((item: any, i: number) => (
                              <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-all">
                                 <div className="flex justify-between items-center mb-10">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Solution Analysis {i+1}</span>
                                    <span className={`text-[8px] font-black uppercase ${item.status === 'Correct' ? 'text-green-500' : 'text-red-500'}`}>{item.status}</span>
                                 </div>
                                 <div className="h-24 flex items-end gap-2 border-b border-white/5 pb-4 mb-6">
                                    <div className="flex-1 bg-blue-600 rounded-t-lg relative" style={{ height: `${(item.userTime/500)*100}%` }}>
                                       <span className="absolute -top-6 left-0 text-[8px] font-black text-white uppercase">YOU: {item.userTime}ms</span>
                                    </div>
                                    <div className="flex-1 bg-white/10 rounded-t-lg relative" style={{ height: `${(item.topperTime/500)*100}%` }}>
                                       <span className="absolute -top-6 left-0 text-[8px] font-black text-slate-500 uppercase">TOPPER: {item.topperTime}ms</span>
                                    </div>
                                 </div>
                                 <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-blue-500"><Sparkles className="w-3 h-3" /><span className="text-[8px] font-black uppercase">AI Guidance</span></div>
                                    <p className="text-[10px] text-slate-500 italic leading-relaxed">{item.aiSolution}</p>
                                 </div>
                              </div>
                           ))}
                        </div>

                        <div className="mt-16 p-12 md:p-16 rounded-[4rem] bg-indigo-600/5 border border-indigo-500/10 backdrop-blur-3xl">
                           <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
                              <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl"><BarChart3 className="w-8 h-8" /></div>
                              <div>
                                 <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">Deep Analysis</h3>
                                 <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest italic">Weakness Protocol Detected</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                              <div>
                                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Critical Weak Topics</h4>
                                 <div className="flex flex-wrap gap-2">
                                    {deepAnalysis?.weakTopics?.map((t: string) => <span key={t} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-lg">{t}</span>)}
                                 </div>
                              </div>
                              <div>
                                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Improvement Roadmap</h4>
                                 <p className="text-[10px] text-slate-300 font-bold italic leading-relaxed uppercase">{deepAnalysis?.improvementPlan}</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {deepAnalysis?.resources?.map((res, i) => (
                                 <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 group hover:border-indigo-500/40 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                       <div><h5 className="text-[10px] font-black text-white uppercase italic">{res.topic}</h5><p className="text-[8px] text-slate-500 font-bold uppercase">{res.subtitle}</p></div>
                                       <div className="flex gap-2">
                                          <a href={res.youtube} className="p-2 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"><Youtube className="w-3 h-3" /></a>
                                          <button className="p-2 rounded-lg bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all"><Sparkles className="w-3 h-3" /></button>
                                       </div>
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed">{res.notes}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               )}
           </div>
        )}
        {activeTab === 'settings' && (
           <div className="max-w-3xl space-y-8 pb-20">
              <div className="flex flex-col gap-2 mb-10">
                 <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Neural Configuration</h2>
                 <p className="text-slate-500 text-sm font-medium tracking-widest uppercase italic">Node: AJ-842 • Security Tier 1</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="glass p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 italic">Identity Sync</h3>
                    <div className="space-y-4">
                       <div>
                          <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Display Alias</label>
                          <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all" defaultValue="AJ.9" />
                       </div>
                       <div>
                          <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Neural Email</label>
                          <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all" defaultValue="aj.stable@nexus.ai" />
                       </div>
                    </div>
                 </div>

                 <div className="glass p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 italic">Security Protocols</h3>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                          <div>
                             <p className="text-xs font-bold text-white">2FA Validation</p>
                             <p className="text-[9px] text-slate-500 font-bold uppercase">Biometric Link</p>
                          </div>
                          <div className="w-10 h-5 bg-blue-600 rounded-full relative p-1 cursor-pointer">
                             <div className="w-3 h-3 bg-white rounded-full absolute right-1" />
                          </div>
                       </div>
                       <button className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
                          Decommission Node
                       </button>
                    </div>
                 </div>
              </div>

              <div className="glass p-8 rounded-[2.5rem] border border-white/10">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 italic">Preferences</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Night Mode', 'AI Ghosting', 'Global Indexing', 'Public Scan'].map(pref => (
                       <div key={pref} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-3 hover:border-blue-500/30 transition-all cursor-pointer group">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 group-hover:scale-125 transition-transform" />
                          <p className="text-[9px] font-black text-white uppercase tracking-widest text-center">{pref}</p>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end pt-8">
                 <button className="px-12 py-4 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:scale-105 transition-all active:scale-95">
                  Sync All Protocols
               </button>
            </div>
         </div>
      )}
          </motion.div>
        </AnimatePresence>

        {showDiagnosticTest && (
          <DiagnosticTest 
            userName={profile?.displayName || 'Student'} 
            field={profile?.field || 'Software Engineering'}
            onComplete={handleDiagnosticComplete} 
          />
        )}

        {/* Persistent AI Career Coach */}
        <div className="fixed bottom-8 right-8 z-[100]">
          <AnimatePresence>
            {isCoachOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="glass w-80 md:w-96 rounded-[2.5rem] border border-white/10 overflow-hidden mb-4 shadow-2xl flex flex-col h-[500px]"
              >
                <div className="p-6 bg-indigo-600 flex justify-between items-center text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-xs uppercase tracking-widest italic leading-none">AI Coach</p>
                      <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-widest mt-1">Ready for Sync</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCoachOpen(false)} className="text-white hover:rotate-90 transition-all font-bold text-xl">×</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/40 scrollbar-hide">
                  {coachChat.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`p-4 rounded-2xl text-[11px] font-medium leading-relaxed max-w-[85%] ${
                        msg.role === 'ai' ? 'bg-white/5 border border-white/5 text-slate-300 italic' : 'bg-indigo-600 text-white'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isCoachTyping && (
                    <div className="flex justify-start">
                      <div className="px-4 py-2 rounded-full bg-white/5 border border-white/5 flex gap-1.5 h-6 items-center">
                        <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce" />
                        <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[8px] text-indigo-400 font-black uppercase tracking-widest ml-2">Coach is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ask for advice..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCoachMessage((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCoachOpen(!isCoachOpen)}
            className="w-16 h-16 rounded-full bg-indigo-600 text-white shadow-2xl flex items-center justify-center relative overflow-hidden group shadow-indigo-600/40"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <BrainCircuit className={`w-8 h-8 relative z-10 transition-transform duration-500 ${isCoachOpen ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>
      </div>
    </main>
      <AnimatePresence>
        {isChangingDomain && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChangingDomain(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg glass p-10 rounded-[4rem] border border-white/10"
            >
               <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Domain <span className="text-blue-500">Shift</span></h2>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Recalibrating neural journey for Software Engineering sub-domains</p>
               
               <div className="space-y-4">
                  {[
                    { id: 'Data Analysis', name: 'Data Analysis', desc: 'Focus on neural data extraction and statistical synthesis.' },
                    { id: 'Cybersecurity', name: 'Cybersecurity', desc: 'Master defensive grid protocols and encryption nodes.' },
                    { id: 'Cloud Computing', name: 'Cloud Computing', desc: 'Architecting scalable distributed cloud clusters.' }
                  ].map(dom => (
                    <button 
                      key={dom.id}
                      onClick={() => setTargetDomain(dom.id)}
                      className={`w-full p-6 rounded-3xl border text-left transition-all group ${targetDomain === dom.id ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-600/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-lg font-black text-white italic uppercase">{dom.name}</span>
                         {targetDomain === dom.id && <CheckCircle2 className="w-5 h-5 text-white" />}
                       </div>
                       <p className={`text-[10px] font-medium leading-relaxed ${targetDomain === dom.id ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                         {dom.desc}
                       </p>
                    </button>
                  ))}
               </div>

               <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setIsChangingDomain(false)}
                    className="flex-1 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={!targetDomain || isUpdatingProfile}
                    onClick={() => handleDomainChange(targetDomain)}
                    className="flex-1 py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'Recalibrating...' : 'Initiate Shift'}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  </div>
);
}
