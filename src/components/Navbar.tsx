import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Rocket, User, LogOut, Shield, ShieldOff, Sun, Moon, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import { usePremium } from "../hooks/usePremium";

import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

import { Logo } from "./Logo";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { isPremium, upgradeToPremium, resetPremium } = usePremium();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const togglePremium = () => {
    if (isPremium) {
      resetPremium();
    } else {
      upgradeToPremium();
    }
  };

  const navLinks = [
    { name: t('home'), path: "/" },
    { name: "Diagnostic", path: "/ai-test" },
    { name: "AI Code Lab", path: "/practice", highlight: true },
    { name: "Institutions", path: "/institutions" },
    { name: t('about'), path: "/about" },
    { name: t('features'), path: "/features" },
    { name: t('mentorship'), path: "/mentorship" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-bg/95 backdrop-blur-md border-b border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 relative">
          <div className="flex items-center">
            <Link to="/" className="group">
              <Logo size="md" />
            </Link>
          </div>

          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    link.highlight 
                    ? 'text-blue-500 font-black italic tracking-widest bg-blue-500/5 border border-blue-500/10' 
                    : 'text-slate-400 hover:text-blue-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              {(['EN', 'ES', 'ZH', 'HI', 'FR'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`hover:text-white transition-colors cursor-pointer ${language === lang ? 'text-blue-500 font-black' : ''}`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4 relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm italic shadow-lg shadow-blue-600/20 hover:scale-105 transition-all text-white focus:outline-none"
                >
                  AJ
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-full mt-4 w-56 glass rounded-2xl border border-white/10 py-3 z-50 shadow-2xl"
                      >
                        <div className="px-5 py-3 border-b border-white/5 mb-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic">Account Node</p>
                          <p className="text-sm font-bold text-white truncate">AJ-842 Stable</p>
                        </div>
                        <Link 
                          to="/dashboard" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-4 px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-500" /> Dashboard
                        </Link>
                        <Link 
                          to="/profile" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-4 px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <User className="w-4 h-4 text-indigo-500" /> Profile Details
                        </Link>
                        <div className="h-px bg-white/5 my-2 mx-4" />
                        <button 
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-4 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-slate-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-white/10"
                >
                  {t('getStarted')}
                </Link>
              </div>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden glass border-t border-white/5"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2 p-2">

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="text-center bg-white/5 text-white px-3 py-2 text-base font-medium rounded-md"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="text-center bg-white/10 text-white px-3 py-2 text-base font-medium rounded-md"
                    >
                      Profile Details
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                        navigate('/');
                      }}
                      className="text-center bg-red-500/10 text-red-500 px-3 py-2 rounded-md text-base font-medium"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="text-center text-gray-300 hover:text-white px-3 py-2 text-base font-medium rounded-md"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="text-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-base font-medium"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
