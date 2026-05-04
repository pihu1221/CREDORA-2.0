import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Briefcase, Search, Filter, Star, CheckCircle, Mail, 
  ChevronRight, TrendingUp, BarChart, Bell, LayoutDashboard,
  LogOut, PlusCircle, BadgeCheck, FileUp, FileText, BrainCircuit, Loader2, Send, BookOpen, Trophy, AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { CAREER_PATHS } from "../data/careerData";
import { dataService } from "../services/dataService";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export function RecruiterDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('candidates');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [generatedTest, setGeneratedTest] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [selectedField, setSelectedField] = useState<string>('All');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    triggerSearchLoading();
  };

  const handleScoreChange = (score: number) => {
    setMinScore(score);
    triggerSearchLoading();
  };

  const triggerSearchLoading = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 800);
  };

  const [realCandidates, setRealCandidates] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // In a real app, recruiters would search a dedicated 'candidates' index or collection.
    // For this demo, we'll fetch all users who have completed their diagnostic.
    const q = query(collection(db, "users"), where("diagnosticCompleted", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      setRealCandidates(snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        img: (doc.data().displayName || 'Student')[0].toUpperCase(),
        name: doc.data().displayName || 'Anonymous Candidate',
        role: doc.data().careerField || 'Software Engineer',
        score: doc.data().onboardingScore || 85,
        fieldMastery: `${doc.data().onboardingScore || 85}% Neural Sync`,
        skills: doc.data().skills || ["React", "AI Implementation"],
        status: "Available"
      })));
    });

    return () => unsub();
  }, [user]);

  const candidates = realCandidates.length > 0 ? realCandidates : [
    { id: 's1', name: "Jane Doe (Mock)", role: "Senior Frontend Lead", field: "Engineer", score: 98, fieldMastery: "99% Neural Sync", skills: ["React", "TypeScript", "Node.js"], status: "Ready to Interview", img: "J" }
  ];

  const handleContact = async (candidate: any) => {
    if (!user) return;
    
    try {
      await dataService.addDocument(`users/${candidate.id}/notifications`, {
        type: 'recruiter_interest',
        recruiter: 'Global Neural Systems',
        message: `A recruiter from Global Neural Systems is interested in your profile for a ${candidate.role} position.`,
        timestamp: new Date().toISOString(),
        read: false
      });
      alert(`Interaction synchronized: Notification sent to ${candidate.name}`);
    } catch (e) {
      console.error(e);
      alert("Error sending notification.");
    }
  };

  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [candidateBids, setCandidateBids] = useState<any[]>([
    { id: 1, company: 'Alpha Neural', basePay: '$160k', equity: '0.1%', status: 'pending' },
    { id: 2, company: 'CyberSystems', basePay: '$175k', equity: '0.05%', status: 'pending' },
  ]);

  const handleActionOnBid = (bidId: number, action: 'accept' | 'decline') => {
    setCandidateBids(prev => prev.map(b => b.id === bidId ? { ...b, status: action === 'accept' ? 'accepted' : 'declined' } : b));
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScore = c.score >= minScore;
    const matchesField = selectedField === 'All' || c.field === selectedField;
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.every(s => c.skills.some(cs => cs.toLowerCase().includes(s.toLowerCase())));
    return matchesSearch && matchesScore && matchesSkills && matchesField;
  });

  const jobs = [
    { title: "Senior React Developer", department: "Engineering", applicants: 45, matches: 12, status: "Active" },
    { title: "Product Designer", department: "Product", applicants: 28, matches: 5, status: "Draft" }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 hidden lg:flex flex-col p-6 fixed h-full pt-28">
        <div className="space-y-2 flex-grow overflow-y-auto">
           {[
             { id: 'overview', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview' },
             { id: 'candidates', icon: <Users className="w-5 h-5" />, label: 'Find Talent' },
             { id: 'assessments', icon: <FileText className="w-5 h-5" />, label: 'Neural Tests' },
             { id: 'jobs', icon: <Briefcase className="w-5 h-5" />, label: 'My Jobs' },
             { id: 'analytics', icon: <BarChart className="w-5 h-5" />, label: 'Hiring Pipeline' },
           ].map(item => (
             <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
             >
               {item.icon} {item.label}
             </button>
           ))}
        </div>
        
        <div className="pt-6 border-t border-white/5">
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

      {/* Main Content */}
      <main className="flex-grow lg:ml-64 p-6 md:p-10 pt-32 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
                <h1 className="text-3xl font-display font-bold text-white">Recruiter Hub</h1>
                <p className="text-gray-500 text-sm italic">You have 12 high-match candidates waiting for review.</p>
            </div>
            <div className="flex items-center gap-4">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all">
                    <PlusCircle className="w-5 h-5" /> Post a Job
                </button>
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center relative">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#050505]" />
                </div>
            </div>
        </div>

        {activeTab === 'assessments' && (
           <div className="space-y-8">
              <div className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                 <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                       <h2 className="text-3xl font-display font-bold text-white tracking-tight">Assessment AI Architect</h2>
                       <p className="text-gray-400 leading-relaxed max-w-lg italic">
                          Upload your existing question banks or job descriptions. Our Neural Engine will decompose the data to build adaptive, high-integrity assessments.
                       </p>
                       <div className="flex gap-4">
                          <div className="w-full max-w-xs p-1 rounded-2xl bg-white/5 border border-white/5 flex items-center">
                             <input 
                               type="file" 
                               id="paper-upload" 
                               className="hidden" 
                               onChange={() => {
                                 setIsUploading(true);
                                 setUploadStatus('analyzing');
                                 setTimeout(() => {
                                   setUploadStatus('complete');
                                   setIsUploading(false);
                                   setGeneratedTest({
                                     id: 'test-' + Date.now(),
                                     title: 'Senior Neural Engineer Benchmark',
                                     duration: '45 mins',
                                     questions: 15,
                                     difficulty: 'Expert'
                                   });
                                 }, 3000);
                               }}
                             />
                             <label htmlFor="paper-upload" className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition-all">
                                <FileUp className="w-5 h-5" /> Upload Question Bank
                             </label>
                          </div>
                       </div>
                    </div>

                    <div className="w-full md:w-80 h-80 rounded-[2rem] border border-white/5 bg-white/[0.02] flex items-center justify-center relative overflow-hidden group">
                       <AnimatePresence>
                          {uploadStatus === 'idle' && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-gray-500">
                                <BrainCircuit className="w-16 h-16 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Input</p>
                             </motion.div>
                          )}
                          {uploadStatus === 'analyzing' && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-indigo-400">
                                <Loader2 className="w-16 h-16 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Decompiling Data...</p>
                             </motion.div>
                          )}
                          {uploadStatus === 'complete' && (
                             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 text-green-500">
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                                   <CheckCircle className="w-10 h-10" />
                                </div>
                                <div className="text-center">
                                   <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">Architecture Ready</p>
                                   <p className="text-xs text-gray-400 italic">Test DNA Mapped Successfully</p>
                                </div>
                             </motion.div>
                          )}
                       </AnimatePresence>
                       <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                 </div>
              </div>

              {generatedTest && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-[2rem] border border-green-500/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
                             <FileText className="w-7 h-7 text-indigo-400" />
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-white mb-1">{generatedTest.title}</h3>
                             <div className="flex gap-4">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{generatedTest.questions} Mutations</span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{generatedTest.duration} Limit</span>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{generatedTest.difficulty} Protocol</span>
                             </div>
                          </div>
                       </div>
                       <button 
                         onClick={() => {
                           const notifications = JSON.parse(localStorage.getItem('credo_notifications') || '[]');
                           notifications.push({
                             id: Date.now(),
                             type: 'assessment_invite',
                             title: generatedTest.title,
                             recruiter: 'Global Neural Systems',
                             message: `You've been invited to take the ${generatedTest.title} assessment. This test was custom-architected based on recruiter requirements.`,
                             timestamp: new Date().toISOString(),
                             read: false,
                             isTest: true,
                             testId: generatedTest.id
                           });
                           localStorage.setItem('credo_notifications', JSON.stringify(notifications));
                           alert('Neural Broadcast Complete: Notifications sent to matched candidate pool.');
                           setGeneratedTest(null);
                           setUploadStatus('idle');
                         }}
                         className="px-8 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-lg shadow-green-600/20"
                       >
                          <Send className="w-4 h-4" /> Broadcast to Candidates
                       </button>
                    </div>
                 </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="glass p-8 rounded-[2rem] border border-white/5">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-6">Recent Assessments</h3>
                    <div className="space-y-4">
                       {[
                         { name: 'System Design Audit', date: 'Oct 12', completion: 84 },
                         { name: 'Typescript Mastery', date: 'Oct 09', completion: 92 },
                         { name: 'Algorithmic Speed-Run', date: 'Oct 05', completion: 76 }
                       ].map((test, i) => (
                         <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div>
                               <p className="text-white font-bold text-sm tracking-tight">{test.name}</p>
                               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{test.date}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-indigo-400 font-black text-sm">{test.completion}%</p>
                               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Avg Score</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="glass p-8 rounded-[2rem] border border-white/5 bg-indigo-600/[0.02]">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-6">Neural Analysis</h3>
                    <div className="space-y-6">
                       <p className="text-gray-400 text-sm italic leading-relaxed">
                          "Top candidates in your pipeline show a 15% higher completion rate on adaptive tests compared to static MCQs. Consider increasing difficulty for the React Lead role."
                       </p>
                       <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                             {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-white/10 border border-white/5" />)}
                          </div>
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">+12 Insights Applied</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'candidates' && (
           <div className="space-y-8">
              {/* Search & Advanced Filter */}
              <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by name or role..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                      />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Career Field</label>
                    <select 
                      value={selectedField}
                      onChange={(e) => {
                        setSelectedField(e.target.value);
                        triggerSearchLoading();
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 appearance-none"
                    >
                      <option value="All">All Disciplines</option>
                      <option value="Engineer">Engineer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Minimum DNA Score ({minScore})</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={minScore}
                      onChange={(e) => handleScoreChange(parseInt(e.target.value))}
                      className="w-full accent-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Skill Specifications (Enter to add)</label>
                    <input 
                      type="text" 
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && skillInput) {
                          setSelectedSkills([...selectedSkills, skillInput]);
                          setSkillInput('');
                          triggerSearchLoading();
                        }
                      }}
                      placeholder="e.g. React, Python"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedSkills.map(s => (
                        <span key={s} className="px-2 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-[10px] text-indigo-400 flex items-center gap-2">
                          {s}
                          <button onClick={() => {
                            setSelectedSkills(selectedSkills.filter(x => x !== s));
                            triggerSearchLoading();
                          }}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Table */}
              <div className="glass rounded-[2rem] border border-white/5 overflow-hidden relative">
                 <AnimatePresence>
                    {isSearching && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 bg-brand-bg/40 backdrop-blur-[2px] flex items-center justify-center"
                      >
                         <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
                            <Search className="w-4 h-4 text-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Neural Matching...</span>
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-white/5 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
                             <th className="px-8 py-5">Candidate</th>
                             <th className="px-8 py-5">Credora Score</th>
                             <th className="px-8 py-5">Top Skills</th>
                             <th className="px-8 py-5">Status</th>
                             <th className="px-8 py-5 text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {filteredCandidates.map((c, i) => (
                             <motion.tr 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={c.id} 
                                className="group hover:bg-white/[0.02] transition-colors"
                             >
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 border border-indigo-500/20">
                                         {c.img}
                                      </div>
                                      <div>
                                         <h4 className="font-bold text-white flex items-center gap-2 flex-wrap">
                                            {c.name} <BadgeCheck className="w-4 h-4 text-blue-500" />
                                            {c.proctoringAlert && (
                                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20">
                                                <AlertTriangle size={8} /> Integrity Alert
                                              </span>
                                            )}
                                            {c.balance > 0 && (
                                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                                                <Trophy size={8} /> Bounty Hunter
                                              </span>
                                            )}
                                         </h4>
                                         <p className="text-gray-500 text-xs font-medium">{c.role} {c.subDomain && `• ${c.subDomain}`}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-3">
                                      <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                         <div className="h-full bg-indigo-500" style={{ width: `${c.score}%` }} />
                                      </div>
                                      <span className="text-sm font-black text-indigo-400">{c.score}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex gap-2 flex-wrap">
                                      {c.skills.map(s => (
                                         <span key={s} className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            {s}
                                         </span>
                                      ))}
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${c.status === 'Ready to Interview' ? 'bg-green-500/10 text-green-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                      {c.status}
                                   </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                   <div className="flex justify-end gap-2">
                                      <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Shortlist">
                                         <Star className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleContact(c)}
                                        className="p-2 glass rounded-lg hover:bg-indigo-600 transition-colors text-gray-400 hover:text-white bg-indigo-600/20 border-indigo-600/30" 
                                        title="Contact"
                                      >
                                         <Mail className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                                      </button>
                                      <button 
                                        onClick={() => setSelectedCandidate(c)}
                                        className="p-2 glass rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="View Profile"
                                      >
                                         <ChevronRight className="w-4 h-4" />
                                      </button>
                                   </div>
                                </td>
                             </motion.tr>
                          ))}
                          {filteredCandidates.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-8 py-20 text-center text-gray-500 uppercase font-black text-[10px] tracking-[0.3em]">
                                No candidates match your specifications
                              </td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
                 <div className="p-6 bg-white/[0.01] text-center border-t border-white/5">
                    <button className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                       Load More Candidates
                    </button>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'overview' && (
           <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="glass p-8 rounded-[2rem] border border-white/5 bg-indigo-600/5 relative overflow-hidden group">
                   <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Latest Neural Syncs</h3>
                   <div className="space-y-3">
                     {[
                       { name: "Priya Sharma", level: "Final Year", field: "Software Engineer", score: 96 }
                     ].map((profile, i) => (
                       <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all">
                         <div>
                           <p className="text-white font-bold text-xs leading-none mb-1">{profile.name}</p>
                           <p className="text-[8px] text-slate-500 font-bold uppercase">{profile.field} • {profile.level}</p>
                         </div>
                         <div className="text-right">
                           <span className="text-indigo-400 font-black text-xs">{profile.score}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                   <button className="w-full mt-4 py-2 text-[8px] font-black uppercase text-slate-500 hover:text-white transition-all tracking-widest">View All New Profiles</button>
                 </div>

                <div className="glass p-8 rounded-[2rem] border border-white/5 bg-indigo-600/5 relative overflow-hidden group">
                   <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Course Blueprint Status</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xl uppercase italic leading-none">4 Master Domains</p>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">Verified Curriculums</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['Engineer'].map(f => (
                      <div key={f} className="flex justify-between items-center text-[10px] font-black p-2 bg-black/40 rounded-lg border border-white/5">
                        <span className="text-slate-400 uppercase italic">{f}</span>
                        <span className="text-green-500 uppercase">Live</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center text-center">
                   <p className="text-3xl font-black text-white italic tracking-tighter mb-2">1,500+</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] italic">Active Candidates</p>
                </div>

                <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center text-center">
                   <p className="text-3xl font-black text-indigo-500 italic tracking-tighter mb-2">92%</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] italic">Test Integrity Avg</p>
                </div>
              </div>

              {/* Course Detail for Recruiters */}
              <div className="glass p-10 rounded-[3rem] border border-white/5">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Verified Syllabus Audit</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase italic border-l border-white/10 pl-4 tracking-widest">Global Curriculum Mapping active</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(CAREER_PATHS).map(([key, path]) => (
                    <div key={key} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-default">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 italic leading-none">{key}</p>
                      <div className="space-y-3">
                        {path.topics.slice(0, 3).map(topic => (
                          <div key={topic.id} className="text-[9px] font-bold text-slate-400 uppercase italic flex items-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-slate-600" />
                             {topic.title}
                          </div>
                        ))}
                        <p className="text-[8px] text-slate-600 font-black italic mt-2 uppercase tracking-tighter">+{path.topics.length - 3} More Modules</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        )}

        {/* Analytics Section Preview */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
                 <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Efficiency Boost</h3>
              <p className="text-gray-500 text-sm">Your time-to-hire has decreased by <span className="text-green-500 font-bold">42%</span> since using Credora's Skill DNA filtering.</p>
           </div>
           <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Active Matches</h3>
                <p className="text-gray-500 text-sm">Currently <span className="text-indigo-500 font-bold">156</span> candidates meet your exact skill requirements across active jobs.</p>
           </div>
           <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Verified Only</h3>
                <p className="text-gray-500 text-sm">All candidates in your dashboard have <span className="text-purple-500 font-bold">100% verified</span> skill attributes.</p>
           </div>
        </section>
        </div>
      </main>

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass max-w-4xl w-full rounded-[3rem] border border-white/10 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-2xl text-indigo-400 border border-indigo-500/20">
                    {selectedCandidate.img}
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                      {selectedCandidate.name} <BadgeCheck className="w-5 h-5 text-blue-500" />
                    </h2>
                    <p className="text-gray-400 italic">{selectedCandidate.role} • Score: {selectedCandidate.score}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white transition-all"
                >
                  ×
                </button>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-6 italic">Active Bids & Invites</h3>
                  <div className="space-y-4">
                    {candidateBids.map(bid => (
                      <div key={bid.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-white uppercase italic">{bid.company}</p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            bid.status === 'accepted' ? 'bg-green-500/20 text-green-500' : 
                            bid.status === 'declined' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-gray-400'
                          }`}>
                            {bid.status}
                          </span>
                        </div>
                        <div className="flex gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <span>Base: {bid.basePay}</span>
                          <span>Equity: {bid.equity}</span>
                        </div>
                        {bid.status === 'pending' && (
                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={() => handleActionOnBid(bid.id, 'accept')}
                              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleActionOnBid(bid.id, 'decline')}
                              className="flex-1 py-2 bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-2 italic">Neural DNA Breakdown</h3>
                  <div className="p-6 rounded-2xl bg-indigo-600/5 border border-indigo-500/10">
                    <p className="text-xs text-gray-400 leading-relaxed italic mb-4">
                      "Candidate shows high synchronization in {selectedCandidate.field} nodes with peak performance in {selectedCandidate.skills.slice(0, 2).join(', ')}. Probability of technical alignment: 94%."
                    </p>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: '94%' }} />
                    </div>
                  </div>
                  <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-[0.2em] italic transition-all shadow-lg shadow-indigo-600/20">
                    Send Direct Invitation
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
