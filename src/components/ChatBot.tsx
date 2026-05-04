import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, User, Minus, Maximize2 } from 'lucide-react';
import { askGemini } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function ChatBot() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Tactical Synchronization Initialized. I am your Credo Specialist. Ready to analyze your career DNA?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide initial greeting after 8 seconds if not opened
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }] as [{ text: string }]
      }));

      const response = await askGemini(userMessage, history, language);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Neural synchronization error. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const CredoMascot = ({ className = "", animated = true }: { className?: string; animated?: boolean }) => (
    <motion.svg 
      viewBox="0 0 100 100" 
      className={`w-full h-full ${className}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      animate={animated ? { 
        y: [0, -4, 0],
      } : {}}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <defs>
        <linearGradient id="coachGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="glow-blue">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Hexagonal Base */}
      <path 
        d="M50 10L85 30V70L50 90L15 70V30L50 10Z" 
        stroke="url(#coachGradient)" 
        strokeWidth="2" 
        fill="rgba(59, 130, 246, 0.1)"
        filter="url(#glow-blue)"
      />

      {/* Inner Neural Core */}
      <motion.circle 
        cx="50" cy="50" r="15" 
        fill="url(#coachGradient)"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Orbiting Elements */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ originX: '50px', originY: '50px' }}
      >
        <circle cx="50" cy="25" r="3" fill="#3B82F6" />
        <circle cx="50" cy="75" r="3" fill="#8B5CF6" />
        <circle cx="25" cy="50" r="3" fill="#3B82F6" />
        <circle cx="75" cy="50" r="3" fill="#8B5CF6" />
      </motion.g>

      {/* Eye Scanners */}
      <rect x="40" y="45" width="20" height="2" rx="1" fill="white" opacity="0.8" />
    </motion.svg>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Greeting Bubble */}
      <AnimatePresence>
        {!isOpen && showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-8 mr-2 bg-[#0A0A0A] text-white px-6 py-3 rounded-2xl shadow-2xl relative border border-blue-500/30 font-black uppercase tracking-widest text-[10px] z-20 backdrop-blur-xl"
          >
            Tactical Sync Ready
            {/* Tooltip Arrow */}
            <div className="absolute bottom-[-10px] right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-blue-500/30" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '500px',
              width: '380px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col mb-4 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-blue-600/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 p-1">
                  <CredoMascot />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tighter">Credo Specialist</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Scout Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                <div 
                  ref={scrollRef}
                  className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide"
                >
                  {messages.map((m, i) => (
                    <div 
                      key={i} 
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center p-0.5 ${m.role === 'user' ? 'bg-slate-800' : 'bg-blue-600/20'}`}>
                          {m.role === 'user' ? <User className="w-4 h-4 text-slate-400" /> : <CredoMascot />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${
                          m.role === 'user' 
                          ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/10' 
                          : 'bg-white/5 text-slate-300 border border-white/5'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 p-0.5">
                          <CredoMascot />
                        </div>
                        <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-2 border border-white/5">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-white/5 bg-black/40">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="relative"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask Credo about your tactical DNA..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                    />
                    <button 
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-blue-600/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <p className="text-[9px] text-center text-slate-600 mt-2 font-black uppercase tracking-widest">
                    Neural Engine powered by Gemini 3 Flash
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        {!isOpen && (
          <motion.div 
            initial={{ y: 0 }}
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, -2, 2, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute -top-16 -left-8 w-20 h-20 pointer-events-none z-10"
          >
            <CredoMascot animated={true} />
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-50" />
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowGreeting(false);
          }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${
            isOpen 
            ? 'bg-slate-900 border border-white/10 text-white' 
            : 'bg-blue-600 text-white shadow-blue-600/40'
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </motion.button>
      </div>
    </div>
  );
}
