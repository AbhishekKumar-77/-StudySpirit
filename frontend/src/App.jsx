import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeToggle from './components/ThemeToggle';

// ============== LAZY LOADED PAGES ==============
// Each page only downloads when the user navigates to it
// This reduces initial bundle size from ~800KB to ~50KB
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SoloMode = lazy(() => import('./pages/SoloMode'));
const GroupMode = lazy(() => import('./pages/GroupMode'));
const Planner = lazy(() => import('./pages/Planner'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Resources = lazy(() => import('./pages/Resources'));
const CodeSpirit = lazy(() => import('./pages/CodeSpirit'));
const CodeEditor = lazy(() => import('./pages/CodeEditor'));
const SoftSkills = lazy(() => import('./pages/SoftSkills'));
const DiscussVerse = lazy(() => import('./pages/DiscussVerse'));
const CareerSprint = lazy(() => import('./pages/CareerSprint'));
const AIInterview = lazy(() => import('./pages/AIInterview'));
const ProjectLab = lazy(() => import('./pages/ProjectLab'));
const EventsHub = lazy(() => import('./pages/EventsHub'));
const Certification = lazy(() => import('./pages/Certification'));
const Exams = lazy(() => import('./pages/Exams'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const TeacherToolkit = lazy(() => import('./pages/TeacherToolkit'));
const TeacherCodeSpirit = lazy(() => import('./pages/TeacherCodeSpirit'));
const CodeSpiritCreator = lazy(() => import('./pages/CodeSpiritCreator'));

// ============== GAMING LOADING SCREEN ==============
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#06080e',
    color: '#e6edf3',
    fontFamily: "'Orbitron', 'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Grid background */}
    <div style={{
      position: 'absolute', inset: 0, opacity: 0.05,
      backgroundImage: 'linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px)',
      backgroundSize: '40px 40px'
    }} />

    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
      {/* Spinner */}
      <div style={{
        width: 56, height: 56,
        border: '3px solid rgba(0,255,136,0.1)',
        borderTop: '3px solid #00ff88',
        borderRight: '3px solid #00d4ff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 20px',
        boxShadow: '0 0 20px rgba(0,255,136,0.3)'
      }} />

      {/* Loading text */}
      <p style={{
        fontSize: 11,
        opacity: 0.6,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#00ff88'
      }}>
        INITIALIZING...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <ThemeToggle />
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login/:role" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/solo-mode" element={<SoloMode />} />
              <Route path="/group-mode" element={<GroupMode />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/codespirit" element={<CodeSpirit />} />
              <Route path="/interview" element={<AIInterview />} />
              <Route path="/career" element={<CareerSprint />} />
              <Route path="/project-lab" element={<ProjectLab />} />
              <Route path="/project-lab/:projectId" element={<ProjectLab />} />
              <Route path="/events" element={<EventsHub />} />
              <Route path="/discuss" element={<DiscussVerse />} />
              <Route path="/certification" element={<Certification />} />
              <Route path="/soft-skills" element={<SoftSkills />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/code-editor" element={<CodeEditor />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/teacher-toolkit" element={<TeacherToolkit />} />
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher-codespirit" element={<TeacherCodeSpirit />} />
              <Route path="/codespirit-creator" element={<CodeSpiritCreator />} />
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
