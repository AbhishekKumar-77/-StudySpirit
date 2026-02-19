
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';

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
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// ============== LOADING FALLBACK ==============
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    color: 'white',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid rgba(255,255,255,0.1)',
        borderTop: '4px solid #818cf8',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 16px'
      }} />
      <p style={{ fontSize: 16, opacity: 0.8 }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
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
              <Route path="/code-editor" element={<CodeEditor />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
