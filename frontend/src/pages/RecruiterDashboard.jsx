import React, { useState, useEffect } from 'react';
import { Search, Users, Briefcase, Calendar, TrendingUp, Star, Filter, MapPin, GraduationCap, ArrowRight, Eye, Plus, Sparkles, BrainCircuit, Building2, X, Loader2, DollarSign, FileText, Zap, ChevronDown, Globe, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';
import api from '../services/api';
import { getAvatarUrl, handleAvatarError } from '../utils/avatarHelper';
import './RecruiterDashboard.css';

const RecruiterDashboard = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('explore');
  const [students, setStudents] = useState([]);
  const [savedCandidates, setSavedCandidates] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ university: '', skill: '', minScore: '' });
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [aiMatches, setAiMatches] = useState({ jobId: null, results: [] });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [drives, setDrives] = useState([]);
  const [isCreatingDrive, setIsCreatingDrive] = useState(false);

  // Job form state
  const [jobForm, setJobForm] = useState({ title: '', type: 'job', location: '', salary: '', description: '', tags: '', requiredSkills: '' });
  // Drive form state
  const [driveForm, setDriveForm] = useState({ title: '', company: '', description: '', date: '', targetUniversities: '' });

  useEffect(() => {
    fetchAnalytics();
    fetchStudents();
    fetchSavedCandidates();
    fetchMyJobs();
    fetchDrives();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/recruiter/my-jobs');
      if (res.data.success) setMyJobs(res.data.jobs);
    } catch (err) {
      console.error('fetchMyJobs:', err);
      setMyJobs([]);
    }
  };

  const fetchDrives = async () => {
    try {
      const res = await api.get('/recruiter/drives');
      if (res.data.success) setDrives(res.data.drives);
    } catch (err) { console.error(err); setDrives([]); }
  };

  const runReverseMatch = async (jobId) => {
    setIsAiLoading(true);
    setAiMatches({ jobId, results: [] });
    try {
      const res = await api.get(`/recruiter/jobs/${jobId}/reverse-match`);
      if (res.data.success) setAiMatches({ jobId, results: res.data.topMatches });
    } catch (err) { console.error(err); }
    setIsAiLoading(false);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/recruiter/analytics');
      if (res.data.success) setAnalytics(res.data.analytics);
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ query: searchQuery, university: filters.university, skill: filters.skill, minScore: filters.minScore });
      const res = await api.get(`/recruiter/students/search?${params}`);
      if (res.data.success) setStudents(res.data.students);
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  const fetchSavedCandidates = async () => {
    try {
      const res = await api.get('/recruiter/candidates/saved');
      if (res.data.success) setSavedCandidates(res.data.savedCandidates);
    } catch (err) { console.error(err); }
  };

  const saveCandidate = async (candidateId) => {
    try {
      const res = await api.post('/recruiter/candidates/save', { candidateId });
      if (res.data.success) { fetchSavedCandidates(); alert('Candidate shortlisted!'); }
    } catch (err) { console.error(err); }
  };

  const handlePostJob = async () => {
    if (!jobForm.title || !jobForm.description) return alert('Title and description are required');
    try {
      const payload = {
        ...jobForm,
        tags: jobForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        requiredSkills: jobForm.requiredSkills.split(',').map(s => ({ skillName: s.trim() })).filter(s => s.skillName)
      };
      const res = await api.post('/recruiter/jobs', payload);
      if (res.data.success) {
        setIsPostingJob(false);
        setJobForm({ title: '', type: 'job', location: '', salary: '', description: '', tags: '', requiredSkills: '' });
        fetchMyJobs();
        fetchAnalytics();
        alert('Job posted successfully! It is now live in CareerSprint.');
      }
    } catch (err) { alert('Failed to post job: ' + (err.response?.data?.error || err.message)); }
  };

  const handleCreateDrive = async () => {
    if (!driveForm.title || !driveForm.date) return alert('Title and date are required');
    try {
      const payload = {
        ...driveForm,
        company: driveForm.company || user?.recruiterProfile?.companyName || 'StudySpirit Partner',
        targetUniversities: driveForm.targetUniversities.split(',').map(u => u.trim()).filter(Boolean)
      };
      const res = await api.post('/recruiter/drives', payload);
      if (res.data.success) {
        setIsCreatingDrive(false);
        setDriveForm({ title: '', company: '', description: '', date: '', targetUniversities: '' });
        fetchDrives();
        alert('Campus drive created!');
      }
    } catch (err) { alert('Failed: ' + (err.response?.data?.error || err.message)); }
  };

  const tabs = [
    { id: 'explore', label: 'Explore Talent', icon: Search },
    { id: 'saved', label: 'Shortlisted', icon: Star },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    { id: 'drives', label: 'Campus Drives', icon: Calendar },
  ];

  return (
    <div className="recruiter-root">
      {/* Sidebar */}
      <nav className="rec-sidebar">
        <div className="rec-brand">
          <div className="rec-brand-icon">💼</div>
          <div>
            <div className="rec-brand-name">RecruiterHub</div>
            <div className="rec-brand-sub">StudySpirit</div>
          </div>
        </div>
        <div className="rec-nav-list">
          {tabs.map(t => (
            <button key={t.id} className={`rec-nav-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <t.icon size={18} /> <span>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="rec-sidebar-user">
          <div>
            <div className="rec-user-name">{user?.name}</div>
            <div className="rec-user-role">{user?.recruiterProfile?.companyName || 'Recruiter'}</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="rec-main">
        {/* Header Stats */}
        <header className="rec-header">
          <div>
            <h1 className="rec-title">Welcome back, {user?.name}</h1>
            <p className="rec-subtitle">{user?.recruiterProfile?.companyName || 'Your Recruitment Dashboard'}</p>
          </div>
          <div className="rec-stats-row">
            <div className="rec-stat-box">
              <TrendingUp size={20} className="rec-stat-icon blue" />
              <div><span className="rec-stat-val">{analytics?.jobsPosted || 0}</span><span className="rec-stat-lbl">Jobs Posted</span></div>
            </div>
            <div className="rec-stat-box">
              <Users size={20} className="rec-stat-icon green" />
              <div><span className="rec-stat-val">{analytics?.totalApplicants || 0}</span><span className="rec-stat-lbl">Applicants</span></div>
            </div>
            <div className="rec-stat-box">
              <Star size={20} className="rec-stat-icon amber" />
              <div><span className="rec-stat-val">{analytics?.shortlistedCandidates || 0}</span><span className="rec-stat-lbl">Shortlisted</span></div>
            </div>
            <div className="rec-stat-box">
              <Calendar size={20} className="rec-stat-icon purple" />
              <div><span className="rec-stat-val">{analytics?.campusDrives || 0}</span><span className="rec-stat-lbl">Drives</span></div>
            </div>
          </div>
        </header>

        {/* ──── EXPLORE TAB ──── */}
        {activeTab === 'explore' && (
          <section className="rec-section fade-in">
            <div className="rec-search-bar">
              <div className="rec-search-field"><Search size={16} /><input type="text" placeholder="Search students by name or course..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchStudents()} /></div>
              <input type="text" placeholder="University" className="rec-filter-input" value={filters.university} onChange={e => setFilters({...filters, university: e.target.value})} />
              <input type="text" placeholder="Skill (e.g. React)" className="rec-filter-input" value={filters.skill} onChange={e => setFilters({...filters, skill: e.target.value})} />
              <button className="rec-btn primary" onClick={fetchStudents}><Filter size={14} /> Search</button>
            </div>
            <div className="rec-grid">
              {isLoading ? (
                <div className="rec-empty"><Loader2 size={32} className="spin" /><p>Finding the best talent...</p></div>
              ) : students.length > 0 ? students.map(s => (
                <div className="rec-card" key={s._id}>
                  <div className="rec-card-top">
                    <div className="rec-avatar">{s.avatar || '👤'}</div>
                    <div><h3>{s.name}</h3><p><GraduationCap size={12} /> {s.university}</p><p><MapPin size={12} /> {s.course}</p></div>
                  </div>
                  <div className="rec-skills">{s.verifiedSkills?.slice(0, 4).map((sk, i) => (<span key={i} className="rec-skill-tag">{sk.skillName} <small>{sk.score}%</small></span>))}</div>
                  <div className="rec-card-stats">
                    <div><span>Consistency</span><strong>{s.consistencyScore || 0}%</strong></div>
                    <div><span>AI Score</span><strong>{s.softSkillsProfile?.overallRating || 'N/A'}/10</strong></div>
                  </div>
                  <div className="rec-card-actions">
                    <button className="rec-btn outline" onClick={() => window.open(`/profile/${s.userId}`, '_blank')}><Eye size={14} /> Passport</button>
                    <button className="rec-btn accent" onClick={() => saveCandidate(s.userId)}><Star size={14} /> Shortlist</button>
                  </div>
                </div>
              )) : (
                <div className="rec-empty"><Search size={40} /><p>No students found matching your criteria.</p><p className="sub">Try searching with different filters</p></div>
              )}
            </div>
          </section>
        )}

        {/* ──── JOBS TAB ──── */}
        {activeTab === 'jobs' && (
          <section className="rec-section fade-in">
            <div className="rec-section-header">
              <h2><Briefcase size={20} /> Your Job Postings</h2>
              <button className="rec-btn primary" onClick={() => setIsPostingJob(true)}><Plus size={16} /> Post New Job</button>
            </div>
            <div className="rec-grid">
              {myJobs.length > 0 ? myJobs.map(job => (
                <div key={job.id || job._id} className="rec-card job-card">
                  <div className="rec-card-top">
                    <div className="rec-avatar job-avatar"><Briefcase size={20} /></div>
                    <div><h3>{job.title}</h3><p><Building2 size={12} /> {job.company}</p><p><MapPin size={12} /> {job.location || 'Remote'}</p></div>
                    <span className={`rec-type-badge ${job.type}`}>{job.type}</span>
                  </div>
                  {job.salary && <div className="rec-job-salary"><DollarSign size={12} /> {job.salary}</div>}
                  {job.description && <p className="rec-job-desc">{job.description.slice(0, 120)}...</p>}
                  <div className="rec-job-meta">
                    <span><Users size={12} /> {job.applicants?.length || 0} applicants</span>
                    <span><Globe size={12} /> {job.source}</span>
                  </div>
                  <div className="rec-card-actions">
                    <button className="rec-btn ai" onClick={() => runReverseMatch(job.id || job._id)}><Sparkles size={14} /> AI Match</button>
                    <button className="rec-btn outline">Applicants</button>
                  </div>
                  {aiMatches.jobId === (job.id || job._id) && (
                    <div className="rec-ai-panel fade-in">
                      <h4><BrainCircuit size={14} /> AI Recommendations</h4>
                      {isAiLoading ? <p className="rec-ai-loading"><Loader2 size={16} className="spin" /> Scanning Skill Passports...</p>
                       : aiMatches.results.length > 0 ? aiMatches.results.map((m, i) => (
                        <div key={i} className="rec-ai-match">
                          <div className="rec-ai-match-top"><strong>{m.name}</strong><span className="rec-match-pct">{m.matchPercentage}%</span></div>
                          <p>{m.reason}</p>
                          <button className="rec-btn outline small" onClick={() => window.open(`/profile/${m.id}`, '_blank')}>View Profile</button>
                        </div>
                      )) : <p className="rec-ai-empty">No matches found for this role yet.</p>}
                    </div>
                  )}
                </div>
              )) : (
                <div className="rec-empty"><Briefcase size={40} /><p>No jobs posted yet.</p><p className="sub">Click "Post New Job" to get started</p></div>
              )}
            </div>
          </section>
        )}

        {/* ──── SAVED TAB ──── */}
        {activeTab === 'saved' && (
          <section className="rec-section fade-in">
            <h2><Star size={20} /> Shortlisted Candidates ({savedCandidates.length})</h2>
            <div className="rec-list">
              {savedCandidates.length > 0 ? savedCandidates.map((c, i) => (
                <div key={i} className="rec-list-item">
                  <div className="rec-list-left">
                    <div className="rec-avatar sm">{c.candidate?.avatar || '👤'}</div>
                    <div><strong>{c.candidate?.name}</strong><p>{c.candidate?.university} · {c.candidate?.course}</p></div>
                  </div>
                  <span className="rec-list-date">Saved {new Date(c.savedAt).toLocaleDateString()}</span>
                  <button className="rec-btn primary small" onClick={() => window.open(`/profile/${c.candidate?._id}`, '_blank')}>View <ArrowRight size={14} /></button>
                </div>
              )) : (
                <div className="rec-empty"><Star size={40} /><p>No candidates shortlisted yet.</p><p className="sub">Explore talent and shortlist promising students</p></div>
              )}
            </div>
          </section>
        )}

        {/* ──── DRIVES TAB ──── */}
        {activeTab === 'drives' && (
          <section className="rec-section fade-in">
            <div className="rec-section-header">
              <h2><Calendar size={20} /> Campus Drives</h2>
              <button className="rec-btn primary" onClick={() => setIsCreatingDrive(true)}><Plus size={16} /> Schedule Drive</button>
            </div>
            <div className="rec-grid">
              {drives.length > 0 ? drives.map((d, i) => (
                <div key={i} className="rec-card drive-card">
                  <div className="rec-card-top">
                    <div className="rec-avatar drive-avatar"><Calendar size={20} /></div>
                    <div><h3>{d.title}</h3><p><Building2 size={12} /> {d.company}</p></div>
                    <span className={`rec-status-badge ${d.status}`}>{d.status}</span>
                  </div>
                  <p className="rec-drive-date">📅 {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  {d.targetUniversities?.length > 0 && <div className="rec-drive-unis">{d.targetUniversities.map((u, j) => <span key={j}>{u}</span>)}</div>}
                  <div className="rec-job-meta"><span><Users size={12} /> {d.applicants?.length || 0} applicants</span></div>
                </div>
              )) : (
                <div className="rec-empty"><Calendar size={40} /><p>No campus drives scheduled.</p><p className="sub">Schedule bulk assessments for universities</p></div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ──── POST JOB MODAL ──── */}
      {isPostingJob && (
        <div className="rec-modal-overlay" onClick={() => setIsPostingJob(false)}>
          <div className="rec-modal" onClick={e => e.stopPropagation()}>
            <div className="rec-modal-header"><h2>Post a New Opportunity</h2><button onClick={() => setIsPostingJob(false)}><X size={20} /></button></div>
            <div className="rec-modal-body">
              <label>Job Title *</label>
              <input type="text" placeholder="e.g. React Developer" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
              <div className="rec-modal-row">
                <div><label>Type</label><select value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}><option value="job">Full-Time</option><option value="internship">Internship</option><option value="hackathon">Hackathon</option></select></div>
                <div><label>Location</label><input type="text" placeholder="e.g. Bangalore, Remote" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} /></div>
              </div>
              <label>Salary / Stipend</label>
              <input type="text" placeholder="e.g. 12-18 LPA or ₹25k/month" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} />
              <label>Required Skills (comma-separated)</label>
              <input type="text" placeholder="e.g. React, Node.js, MongoDB" value={jobForm.requiredSkills} onChange={e => setJobForm({...jobForm, requiredSkills: e.target.value})} />
              <label>Tags (comma-separated)</label>
              <input type="text" placeholder="e.g. remote, startup, frontend" value={jobForm.tags} onChange={e => setJobForm({...jobForm, tags: e.target.value})} />
              <label>Description & Requirements *</label>
              <textarea rows={5} placeholder="Describe the role, responsibilities, and requirements..." value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
            </div>
            <div className="rec-modal-footer">
              <button className="rec-btn outline" onClick={() => setIsPostingJob(false)}>Cancel</button>
              <button className="rec-btn primary" onClick={handlePostJob}><Zap size={14} /> Publish Listing</button>
            </div>
          </div>
        </div>
      )}

      {/* ──── CREATE DRIVE MODAL ──── */}
      {isCreatingDrive && (
        <div className="rec-modal-overlay" onClick={() => setIsCreatingDrive(false)}>
          <div className="rec-modal" onClick={e => e.stopPropagation()}>
            <div className="rec-modal-header"><h2>Schedule Campus Drive</h2><button onClick={() => setIsCreatingDrive(false)}><X size={20} /></button></div>
            <div className="rec-modal-body">
              <label>Drive Title *</label>
              <input type="text" placeholder="e.g. Summer Internship Drive 2026" value={driveForm.title} onChange={e => setDriveForm({...driveForm, title: e.target.value})} />
              <label>Company Name</label>
              <input type="text" placeholder="Your company name" value={driveForm.company} onChange={e => setDriveForm({...driveForm, company: e.target.value})} />
              <label>Date *</label>
              <input type="date" value={driveForm.date} onChange={e => setDriveForm({...driveForm, date: e.target.value})} />
              <label>Target Universities (comma-separated)</label>
              <input type="text" placeholder="e.g. IIT Delhi, VIT Vellore, BITS Pilani" value={driveForm.targetUniversities} onChange={e => setDriveForm({...driveForm, targetUniversities: e.target.value})} />
              <label>Description</label>
              <textarea rows={4} placeholder="Drive details, eligibility criteria..." value={driveForm.description} onChange={e => setDriveForm({...driveForm, description: e.target.value})} />
            </div>
            <div className="rec-modal-footer">
              <button className="rec-btn outline" onClick={() => setIsCreatingDrive(false)}>Cancel</button>
              <button className="rec-btn primary" onClick={handleCreateDrive}><Calendar size={14} /> Create Drive</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
