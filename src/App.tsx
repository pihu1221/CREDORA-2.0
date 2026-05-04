/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ChatBot } from "./components/ChatBot";

import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { Navigate } from "react-router-dom";

// Lazy load pages for faster rendering
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const About = lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const Features = lazy(() => import("./pages/Features").then(m => ({ default: m.Features })));
const Mentorship = lazy(() => import("./pages/Mentorship").then(m => ({ default: m.Mentorship })));
const Login = lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Signup = lazy(() => import("./pages/Signup").then(m => ({ default: m.Signup })));
const Onboarding = lazy(() => import("./pages/Onboarding").then(m => ({ default: m.Onboarding })));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard").then(m => ({ default: m.StudentDashboard })));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard").then(m => ({ default: m.RecruiterDashboard })));
const LearningPortal = lazy(() => import("./pages/LearningPortal").then(m => ({ default: m.LearningPortal })));
const AITest = lazy(() => import("./pages/AITest").then(m => ({ default: m.AITest })));
const PremiumLab = lazy(() => import("./pages/PremiumLab").then(m => ({ default: m.PremiumLab })));
const Institutions = lazy(() => import("./pages/Institutions").then(m => ({ default: m.Institutions })));
const CodePractice = lazy(() => import("./pages/CodePractice").then(m => ({ default: m.CodePractice })));

function ProtectedRoute({ children, requireField = false }: { children: React.ReactNode, requireField?: boolean }) {
  const { isAuthenticated, profile, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // Use profile from Firestore if available, fallback to localStorage for migration
  const fieldSelected = profile?.careerField || localStorage.getItem('student_career_field');
  const diagnosticCompleted = profile?.diagnosticCompleted !== false && localStorage.getItem('credo_diagnostic_completed') !== 'false';
  
  if (requireField && (!fieldSelected || !diagnosticCompleted)) return <Navigate to="/onboarding" />;

  return <>{children}</>;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen font-sans transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900 text-white"><div className="animate-pulse flex items-center gap-4"><div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin"></div><span className="font-bold tracking-widest text-sm uppercase">Loading Instance...</span></div></div>}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute requireField><StudentDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute requireField><StudentDashboard /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute requireField><LearningPortal /></ProtectedRoute>} />
          <Route path="/ai-test" element={<ProtectedRoute requireField><AITest /></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute requireField><CodePractice /></ProtectedRoute>} />
          <Route path="/recruiter" element={<ProtectedRoute><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/premium-lab" element={<ProtectedRoute requireField><PremiumLab /></ProtectedRoute>} />
          <Route path="/institutions" element={<Institutions />} />
        </Routes>
        </Suspense>
      </main>
      {/* Footer ONLY on Home page or if not logged in */}
      {(isHomePage || !isAuthenticated) && <Footer />}
      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

