import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Database, Server, Star, Code, Terminal, Brain, Cloud, Shield, BrainCircuit, Target } from 'lucide-react';

interface StellarMapProps {
  profile?: any;
}

export function StellarMap({ profile }: StellarMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any | null>(null);
  const [isSequencing, setIsSequencing] = useState(false);

  // Trigger sequencing effect when opportunity changes
  const handleOpportunitySelect = (opp: any) => {
    if (selectedOpportunity?.id === opp.id) {
      setSelectedOpportunity(null);
      return;
    }
    setIsSequencing(true);
    setSelectedOpportunity(opp);
    setTimeout(() => setIsSequencing(false), 800);
  };

  // Use profile data if available, otherwise fallback to mocks
  const userSkillPoints = profile?.skillPoints || {};
  const userName = profile?.displayName || "ELIZA REED";
  const profileScore = profile?.onboardingScore ? (profile.onboardingScore * 2.5 + 40).toFixed(1) : "89.4";

  const opportunities = [
    { 
      id: 'google', 
      role: 'Senior Cloud Engineer', 
      company: 'Google', 
      skills: ['gcp1', 'gcp2', 'k8s', 'terraform'],
      match: 94
    },
    { 
      id: 'stripe', 
      role: 'DevOps Technical Lead', 
      company: 'Stripe', 
      skills: ['docker1', 'docker2', 'terraform', 'devops', 'aws'],
      match: 91
    },
    { 
      id: 'netflix', 
      role: 'SRE Manager', 
      company: 'Netflix', 
      skills: ['ml', 'k8s', 'python1', 'python2', 'aws'],
      match: 88
    }
  ];

  const nodes = [
    { id: 'ml', label: 'Machine Learning\n(Expert)', x: 30, y: 20, icon: Brain, color: 'text-cyan-400', level: userSkillPoints.ml || 85 },
    { id: 'k8s', label: 'Kubernetes', x: 38, y: 40, icon: Server, color: 'text-blue-400', level: userSkillPoints.k8s || 70 },
    { id: 'gcp1', label: 'Google Cloud', x: 25, y: 60, icon: Cloud, color: 'text-blue-500', level: userSkillPoints.gcp || 65 },
    { id: 'gcp2', label: 'Google Cloud', x: 32, y: 70, icon: Cloud, color: 'text-blue-400', level: userSkillPoints.gcp || 60 },
    { id: 'terraform', label: 'Terraform IaC\n(Active)', x: 45, y: 65, icon: Database, color: 'text-emerald-400', level: userSkillPoints.terraform || 90 },
    { id: 'docker1', label: 'Docker\n(Stable)', x: 50, y: 80, icon: Server, color: 'text-emerald-300', level: userSkillPoints.docker || 80 },
    { id: 'devops', label: 'DevOps Practices\n(Active)', x: 65, y: 75, icon: Network, color: 'text-emerald-400', level: userSkillPoints.devops || 75 },
    { id: 'python1', label: 'Python\n(Advanced)', x: 60, y: 45, icon: Terminal, color: 'text-emerald-300', level: userSkillPoints.python || 95 },
    { id: 'docker2', label: 'Docker\n(Stable)', x: 75, y: 48, icon: Server, color: 'text-emerald-300', level: userSkillPoints.docker || 65 },
    { id: 'aws', label: 'AWS Certified\nArchitect\n(Stable)', x: 62, y: 25, icon: Cloud, color: 'text-emerald-400', level: userSkillPoints.aws || 88 },
    { id: 'python2', label: 'Python\n(Advanced)', x: 50, y: 15, icon: Terminal, color: 'text-emerald-300', level: userSkillPoints.python || 82 },
  ];

  const connections = [
    ['ml', 'k8s'],
    ['k8s', 'gcp2'],
    ['gcp1', 'gcp2'],
    ['k8s', 'python1'],
    ['terraform', 'docker1'],
    ['docker1', 'devops'],
    ['devops', 'python1'],
    ['python1', 'docker2'],
    ['docker2', 'aws'],
    ['aws', 'python2'],
    ['python2', 'ml'],
    ['ml', 'python2'],
    ['terraform', 'k8s'],
    ['devops', 'docker1']
  ];

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#030712] text-white">
      {/* Deep Space Background / Nebula overlays */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1506703719100-a0f3a48c0f41?w=2000&q=80&fm=webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'hue-rotate(200deg) saturate(1.5)',
        }}
      />

      {/* Main Container */}
      <div className="absolute inset-0 p-8 pt-10">
        
        {/* Constellation Header */}
        <div className="absolute left-10 top-10 max-w-xs z-10">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-50 mb-2">Constellation</h2>
          <p className="text-xs text-emerald-200/60 leading-relaxed">
            The user star (milestones) form growing constellations and recovering developing skills.
          </p>
        </div>

        {/* Pathfinder Heading */}
        <div className="absolute left-1/2 top-10 -translate-x-1/2 z-10 text-center">
          <h1 className="text-3xl font-bold tracking-wider text-emerald-50">Pathfinder</h1>
        </div>

        {/* DNA Sequencing Panel */}
        <div className="absolute left-10 top-40 w-64 glass p-6 rounded-[2rem] border border-white/5 z-20 overflow-hidden group">
           <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
           <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 italic flex items-center gap-2">
              <BrainCircuit className={`w-3 h-3 ${isSequencing ? 'animate-spin' : ''}`} />
              {isSequencing ? 'Re-Sequencing DNA...' : 'Skill DNA Sequence'}
           </h4>
           <div className="space-y-4 relative">
              {(selectedOpportunity ? [
                { label: 'Role Alignment', val: `${selectedOpportunity.match}% Match`, status: 'OPTIMAL', color: 'text-emerald-400' },
                { label: 'Target Hash', val: `0x${selectedOpportunity.id.toUpperCase()}...${Math.random().toString(16).slice(2, 5).toUpperCase()}`, status: 'VERIFIED', color: 'text-blue-400' },
                { label: 'Neural Gap', val: `${(100 - selectedOpportunity.match).toFixed(1)}% Delta`, status: 'MAPPED', color: 'text-orange-400' },
                { label: 'Sequence IP', val: 'SECURE_NODE_7', status: 'STABLE', color: 'text-cyan-400' }
              ] : [
                { label: 'Logic Node', val: '0x3A2...FB1', status: 'SYNCHRONIZED', color: 'text-blue-400' },
                { label: 'Neural Mesh', val: '0x9D4...88C', status: 'ACTIVE', color: 'text-emerald-400' },
                { label: 'Quantum Opt', val: '0x11B...29E', status: 'REFINING', color: 'text-orange-400' },
                { label: 'Cloud Core', val: '0xEE4...AA2', status: 'STABLE', color: 'text-cyan-400' }
              ]).map((item, idx) => (
                <motion.div 
                  key={`${selectedOpportunity?.id || 'none'}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-1"
                >
                   <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-white/60 uppercase">{item.label}</span>
                      <span className={item.color}>{item.status}</span>
                   </div>
                   <div className="text-[10px] font-mono text-white/40 truncate">{item.val}</div>
                   <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isSequencing ? '0%' : '100%' }}
                        transition={{ duration: 1.5, delay: idx * 0.2 }}
                        className={`h-full ${item.color.replace('text-', 'bg-')}`} 
                      />
                   </div>
                </motion.div>
              ))}
           </div>
        </div>

        {/* Opportunities Heading */}
        <div className="absolute right-[20%] top-10 z-10 text-center">
          <h2 className="text-3xl font-bold tracking-wider text-emerald-50">Opportunities</h2>
        </div>

        {/* Skill Gaps Black Hole */}
        <div className="absolute bottom-10 left-10 w-80 h-64 z-10 cursor-pointer" onClick={() => setSelectedNode({ id: 'gap', label: 'Skill Gap Analysis\n(Incomplete)', color: 'text-orange-400', level: 25, icon: Target })}>
          <div className="absolute inset-0 bg-black rounded-full blur-[40px] opacity-90 scale-y-50 scale-x-[1.2]" />
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[60px] scale-y-[0.6] scale-x-[1.4]" />
          <h3 className="absolute bottom-10 left-10 text-3xl font-bold text-white z-20">Skill Gaps</h3>
          
          {/* Skill gaps floating around */}
          {[
            { label: 'Microservices Design', x: 20, y: 10, size: 'text-xs' },
            { label: 'Advanced Algorithms', x: 0, y: 40, size: 'text-xs' },
            { label: 'Golang Fundamentals', x: 10, y: 80, size: 'text-xs' }
          ].map((gap, i) => (
            <motion.div 
              key={i}
              className={`absolute flex items-center gap-2 ${gap.size} text-orange-200/80`}
              style={{ left: `${gap.x}px`, top: `${gap.y}px` }}
              animate={{ 
                x: [0, Math.random() * 20 - 10, 0],
                y: [0, Math.random() * 20 - 10, 0]
              }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
              {gap.label}
            </motion.div>
          ))}
        </div>

        {/* Top Navbar Simulation inside StellarMap */}
        <div className="absolute top-0 right-0 left-0 h-16 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-50">
           <div className="text-white font-black tracking-[0.2em] uppercase text-sm ml-0 lg:ml-4">
             CREDORA.AI
           </div>
           <div className="flex items-center gap-6">
              <span className="text-slate-300 text-xs font-bold tracking-widest uppercase">
                 User: <span className="text-white">{userName}</span> | Profile Score: <span className="text-blue-400">{profileScore}</span>
              </span>
              <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                 {userName.split(' ').map(n => n[0]).join('')}
              </button>
           </div>
        </div>

        {/* Opportunities Wormhole effect */}
        <div className="absolute top-20 right-10 w-96 h-auto min-h-[300px] z-10 pointer-events-none flex flex-col items-end gap-3 justify-center">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px]" />
          <div className="absolute right-[-100px] top-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-[50px] mix-blend-overlay" />
          
          {opportunities.map((opp, idx) => (
            <button
              key={opp.id}
              onClick={() => handleOpportunitySelect(opp)}
              className={`bg-[#0f172a]/80 backdrop-blur border px-4 py-2 rounded-full flex items-center gap-3 text-sm z-20 hover:border-emerald-400/50 cursor-pointer pointer-events-auto transition-all ${
                selectedOpportunity?.id === opp.id ? 'border-emerald-400 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400/30' : 'border-emerald-500/20'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${selectedOpportunity?.id === opp.id ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-800'}`} />
              <span className="font-semibold text-emerald-100">{opp.role}</span>
              <span className="text-emerald-400 font-mono">@ {opp.company}</span>
            </button>
          ))}
          
          <div className="bg-[#0f172a]/80 backdrop-blur border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-3 text-sm z-20 hover:border-emerald-400/50 cursor-pointer pointer-events-auto transition-colors">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>Lead AI Engineer (TechNova)</span>
            <span className="text-emerald-400 font-mono ml-2">- 94%</span>
          </div>
          <div className="bg-[#0f172a]/80 backdrop-blur border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-3 text-sm z-20 hover:border-emerald-400/50 cursor-pointer pointer-events-auto transition-colors transform -translate-x-4">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>Senior Cloud Architect (OmniCorp)</span>
            <span className="text-emerald-400 font-mono ml-2">- 91%</span>
          </div>
        </div>

        {/* Central Core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-80 h-80 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-blue-600 rounded-full blur-[100px] opacity-40 animate-pulse" />
          <div className="absolute inset-0 bg-emerald-400 rounded-full blur-[120px] opacity-30 mix-blend-screen" />
          
          {/* Skill DNA Helix Animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                animate={{
                  y: [Math.sin(i) * 60, Math.sin(i + Math.PI) * 60, Math.sin(i) * 60],
                  x: [Math.cos(i) * 60, Math.cos(i + Math.PI) * 60, Math.cos(i) * 60],
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`dna2-${i}`}
                className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                animate={{
                  y: [Math.sin(i + Math.PI) * 60, Math.sin(i) * 60, Math.sin(i + Math.PI) * 60],
                  x: [Math.cos(i + Math.PI) * 60, Math.cos(i) * 60, Math.cos(i + Math.PI) * 60],
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <div className="w-40 h-40 bg-black rounded-full flex items-center justify-center overflow-visible border-4 border-emerald-500/30 shadow-[0_0_100px_rgba(16,185,129,0.5)] relative">
            <div className="absolute inset-0 border border-blue-400 rounded-full animate-[spin_8s_linear_infinite] opacity-50 scale-125" />
            <div className="absolute inset-0 border border-emerald-400 rounded-full animate-[spin_12s_linear_infinite_reverse] opacity-50 scale-150" />
            <div className="text-center z-10">
              <motion.h3 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-xl font-bold text-white tracking-wider"
              >
                Credora
              </motion.h3>
              <p className="text-[10px] text-emerald-200 uppercase tracking-widest mt-1">Skill DNA Core</p>
            </div>
          </div>
        </div>

        {/* Network Graph SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
              <stop offset="50%" stopColor="rgba(16, 185, 129, 0.6)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.4)" />
            </linearGradient>
            <mask id="dashMask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
            </mask>
          </defs>
          {connections.map(([sourceId, targetId], i) => {
            const source = nodes.find(n => n.id === sourceId);
            const target = nodes.find(n => n.id === targetId);
            if (!source || !target) return null;
            
            const isHighlighted = selectedOpportunity?.skills.includes(sourceId) && selectedOpportunity?.skills.includes(targetId);
            
            return (
              <React.Fragment key={i}>
                <line
                  x1={`${source.x}%`}
                  y1={`${source.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke={isHighlighted ? "rgba(16, 185, 129, 0.6)" : "url(#lineGrad)"}
                  strokeWidth={isHighlighted ? "2" : "1"}
                  className={isHighlighted ? "opacity-80" : "opacity-30"}
                />
                {(isHighlighted || Math.random() > 0.7) && (
                  <motion.line
                    x1={`${source.x}%`}
                    y1={`${source.y}%`}
                    x2={`${target.x}%`}
                    y2={`${target.y}%`}
                    stroke={isHighlighted ? "rgba(52, 211, 153, 0.8)" : "rgba(16, 185, 129, 0.4)"}
                    strokeWidth={isHighlighted ? "3" : "2"}
                    strokeDasharray="4 12"
                    animate={{ strokeDashoffset: [-20, 0] }}
                    transition={{ duration: isHighlighted ? 1 : 2, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const isRelevant = selectedOpportunity?.skills.includes(node.id);
          const isDimmed = selectedOpportunity && !isRelevant;
          
          return (
            <div
              key={node.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer transition-all duration-500 ${
                isDimmed ? 'opacity-30 scale-90 blur-[1px]' : 'opacity-100 scale-100'
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(node)}
            >
              <div className={`relative flex items-center justify-center p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
                isRelevant ? 'border-emerald-400 bg-emerald-500/20 scale-125 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 
                hoveredNode === node.id ? 'bg-white/10 scale-125 border-white/20' : 'bg-[#0f172a]/50 border-white/10'
              }`}>
                <node.icon className={`w-4 h-4 ${isRelevant ? 'text-emerald-400' : node.color} group-hover:scale-110 transition-transform`} />
                
                {/* Glowing star effect */}
                <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${
                  isRelevant ? 'bg-emerald-400 opacity-80' :
                  node.color.includes('emerald') ? 'bg-emerald-400' : 
                  node.color.includes('cyan') ? 'bg-cyan-400' : 'bg-blue-400'
                }`} />
              </div>
              
              <div className={`mt-2 text-[11px] font-medium text-center leading-tight whitespace-pre-line px-2 py-1 rounded bg-black/60 border border-white/5 backdrop-blur shadow-xl transition-all duration-300 ${
                isRelevant ? 'text-emerald-300 border-emerald-500/30 opacity-100' :
                hoveredNode === node.id ? 'opacity-100 scale-110' : 'opacity-70'
              }`}>
                {node.label}
              </div>
            </div>
          );
        })}

        {/* Sub-orbits / concentric circles behind nodes */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] border border-white/10 rounded-full pointer-events-none transform -rotate-12 opacity-30" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] border border-emerald-500/10 rounded-full pointer-events-none transform rotate-12 opacity-30" />

        {/* DNA Sequence Log (Scrolling) */}
        <div className="absolute right-6 top-64 w-48 h-64 overflow-hidden pointer-events-none z-10 hidden xl:block">
           <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712] z-10" />
           <motion.div 
             animate={{ y: [-1000, 0] }}
             transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
             className="space-y-1 opacity-20"
           >
             {Array.from({ length: 100 }).map((_, i) => (
               <div key={i} className="font-mono text-[8px] text-emerald-400 whitespace-nowrap">
                 {Math.random().toString(36).substring(2, 15).toUpperCase()} 
                 <span className="text-blue-400">-{Math.floor(Math.random() * 100)}%</span>
               </div>
             ))}
           </motion.div>
        </div>

        {/* Floating Widgets - Code Lab */}
        <div className="absolute right-10 bottom-32 w-96 bg-[#0f172a]/90 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden shadow-2xl z-20">
          <div className="border-b border-white/10 px-4 py-2 flex items-center justify-between bg-black/40">
            <span className="text-xs text-white/70 font-medium">Code Lab (Practice Arena) | <span className="text-emerald-400">Score: 87%</span></span>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
          </div>
          <div className="py-2 overflow-x-auto text-[11px] font-mono leading-relaxed text-emerald-500/70 opacity-80" dangerouslySetInnerHTML={{ __html: `
            <div class="px-4 py-1 text-blue-300"># python optimization lab | data processing.py</div>
            <div class="px-4 py-1"><span class="text-pink-400">def</span> <span class="text-blue-300">data_in_multiprocessing</span>():</div>
            <div class="px-4 py-1 pl-8">process_pool = Pool(processes=4)</div>
            <div class="px-4 py-1 pl-8">python_multiprocessing(...)</div>
            <div class="px-4 py-1 pl-12"><span class="text-pink-400">if</span> __name__ == <span class="text-yellow-300">'__main__'</span>:</div>
            <div class="px-4 py-1 pl-16">main_multiprocessing(data_pool)</div>
            <div class="px-4 py-1 mt-2 text-white/50"># async I/O handling</div>
          `}} />
          <div className="bg-emerald-500/20 px-4 py-1 flex items-center gap-2 border-t border-emerald-500/20">
             <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
               <div className="h-full w-[87%] bg-emerald-400" />
             </div>
             <span className="text-[10px] text-emerald-400">87%</span>
          </div>
        </div>

        {/* Supernova Lab bottom right */}
        <div className="absolute right-10 bottom-6 bg-[#0f172a]/80 backdrop-blur border border-white/10 rounded-lg px-6 py-3 flex items-center gap-8 shadow-xl">
          <div>
             <h4 className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Supernova Lab</h4>
             <div className="flex items-end gap-2">
                <span className="text-xs text-white/70">Stats</span>
                <span className="text-xl font-bold font-mono text-white">
                  {selectedOpportunity ? `${(selectedOpportunity.match * 3.1).toFixed(3)}s` : '283.400s'}
                </span>
             </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1 mt-1 text-center font-bold">DNA Match</div>
            <div className="text-lg font-bold font-mono text-emerald-400 text-center">
              {selectedOpportunity ? `${selectedOpportunity.match}%` : '92%'}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1 mt-1 text-center font-bold">Readiness</div>
            <div className="text-lg font-bold font-mono text-cyan-400 text-center font-black">
              {selectedOpportunity ? `${(selectedOpportunity.match + 3)}%` : '97%'}
            </div>
          </div>
          <motion.div 
            animate={selectedOpportunity ? { rotate: [0, 360], scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedOpportunity ? 'bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-emerald-500/20'}`}
          >
             <Star className={`w-4 h-4 ${selectedOpportunity ? 'text-black fill-black' : 'text-emerald-400 fill-emerald-400'}`} />
          </motion.div>
        </div>

      </div>

      {/* Node Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[3rem] p-8 relative shadow-2xl shadow-blue-500/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-6 right-8">
                 <button onClick={() => setSelectedNode(null)} className="text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest transition-colors">Close</button>
              </div>

              <div className="flex items-center gap-6 mb-8">
                 <div className={`p-4 rounded-3xl bg-white/5 border border-white/10 ${selectedNode.color}`}>
                    <selectedNode.icon className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{selectedNode.label.split('\n')[0]}</h3>
                    <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-1">Status: {selectedNode.label.split('\n')[1] || '(Stable)'}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Knowledge Depth</p>
                    <p className="text-2xl font-bold text-white font-mono">{selectedNode.level}%</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Market Match</p>
                    <p className="text-2xl font-bold text-blue-400 font-mono">{(selectedNode.level * 0.9 + 5).toFixed(0)}%</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic opacity-60">Neural Pathway Insights</h4>
                 <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-500/10 text-[11px] text-blue-200 leading-relaxed font-medium">
                    This skill node is a primary component of your {profile?.careerField || 'Engineering'} fingerprint. Strengthening this core allows for better {selectedNode.label.split('\n')[0]} alignment with top-tier benchmarks at companies like Google and Stripe.
                 </div>
              </div>

              <button className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                 Optimize DNA Segment
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
