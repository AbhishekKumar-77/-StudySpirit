import React, { useState, useEffect } from 'react';
import { Search, Users, Briefcase, Calendar, TrendingUp, Star, Filter, MapPin, GraduationCap, ArrowRight, Download, Eye, Save, Plus, Sparkles, BrainCircuit } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_URL } from '../config';
import './Dashboard.css'; // Reuse some styles or add new ones

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

  useEffect(() => {
    fetchAnalytics();
    fetchStudents();
    fetchSavedCandidates();
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/career`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        // Filter jobs posted by this recruiter/company
        const companyName = user?.recruiterProfile?.companyName;
        setMyJobs(data.data.filter(j => j.company === companyName || j.source === 'StudySpirit'));
      }
    } catch (err) { console.error(err); }
  };

  const runReverseMatch = async (jobId) => {
    setIsAiLoading(true);
    setAiMatches({ jobId, results: [] });
    try {
      const res = await fetch(`${API_URL}/api/recruiter/jobs/${jobId}/reverse-match`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setAiMatches({ jobId, results: data.topMatches });
    } catch (err) { console.error(err); }
    setIsAiLoading(false);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/api/recruiter/analytics`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setAnalytics(data.analytics);
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ 
        query: searchQuery, 
        university: filters.university,
        skill: filters.skill,
        minScore: filters.minScore 
      });
      const res = await fetch(`${API_URL}/api/recruiter/students/search?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setStudents(data.students);
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  const fetchSavedCandidates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/recruiter/candidates/saved`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setSavedCandidates(data.savedCandidates);
    } catch (err) { console.error(err); }
  };

  const saveCandidate = async (candidateId) => {
    try {
      const res = await fetch(`${API_URL}/api/recruiter/candidates/save`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ candidateId })
      });
      const data = await res.json();
      if (data.success) {
        fetchSavedCandidates();
        alert('Candidate shortlisted!');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="dashboard-container recruiter-portal">
      {/* Sidebar / Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-logo">
          <span className="logo-icon">💼</span>
          <span className="logo-text">RecruiterHub</span>
        </div>
        <div className="nav-links">
          <button className={activeTab === 'explore' ? 'active' : ''} onClick={() => setActiveTab('explore')}>
            <Search size={20} /> <span>Explore Talent</span>
          </button>
          <button className={activeTab === 'saved' ? 'active' : ''} onClick={() => setActiveTab('saved')}>
            <Star size={20} /> <span>Shortlisted</span>
          </button>
          <button className={activeTab === 'jobs' ? 'active' : ''} onClick={() => setActiveTab('jobs')}>
            <Briefcase size={20} /> <span>Job Postings</span>
          </button>
          <button className={activeTab === 'drives' ? 'active' : ''} onClick={() => setActiveTab('drives')}>
            <Calendar size={20} /> <span>Campus Drives</span>
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="header-info">
            <h1>Welcome back, {user?.name}</h1>
            <p className="text-secondary">{user?.recruiterProfile?.companyName || 'Your Recruitment Dashboard'}</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <TrendingUp className="text-primary" size={24} />
              <div>
                <span className="stat-value">{analytics?.totalApplicants || 0}</span>
                <span className="stat-label">Total Applicants</span>
              </div>
            </div>
            <div className="stat-card">
              <Users className="text-success" size={24} />
              <div>
                <span className="stat-value">{analytics?.shortlistedCandidates || 0}</span>
                <span className="stat-label">Shortlisted</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Tabs */}
        {activeTab === 'explore' && (
          <section className="explore-section fade-in">
            <div className="search-filter-bar">
              <div className="search-input">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search students by name or course..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchStudents()}
                />
              </div>
              <div className="filter-group">
                <input 
                  type="text" 
                  placeholder="University" 
                  value={filters.university}
                  onChange={(e) => setFilters({...filters, university: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Skill (e.g. React)" 
                  value={filters.skill}
                  onChange={(e) => setFilters({...filters, skill: e.target.value})}
                />
                <button className="btn-primary" onClick={fetchStudents}>
                  <Filter size={18} /> Apply Filters
                </button>
              </div>
            </div>

            <div className="student-grid">
              {isLoading ? (
                <div className="loading-state">Finding the best talent...</div>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <div className="student-card premium-card" key={student._id}>
                    <div className="student-card-header">
                      <div className="student-avatar">{student.avatar || '👤'}</div>
                      <div className="student-meta">
                        <h3>{student.name}</h3>
                        <p><GraduationCap size={14} /> {student.university}</p>
                        <p><MapPin size={14} /> {student.course}</p>
                      </div>
                    </div>
                    <div className="student-skills">
                      {student.verifiedSkills?.slice(0, 3).map((s, i) => (
                        <span key={i} className="skill-tag">
                          {s.skillName} <small>{s.score}%</small>
                        </span>
                      ))}
                    </div>
                    <div className="student-stats">
                      <div className="stat">
                        <span>Consistency</span>
                        <strong>{student.consistencyScore}%</strong>
                      </div>
                      <div className="stat">
                        <span>AI Score</span>
                        <strong>{student.softSkillsProfile?.overallRating || 'N/A'}/10</strong>
                      </div>
                    </div>
                    <div className="student-actions">
                      <button className="btn-outline" onClick={() => window.open(`/profile/${student.userId}`, '_blank')}>
                        <Eye size={16} /> View Passport
                      </button>
                      <button className="btn-secondary" onClick={() => saveCandidate(student.userId)}>
                        <Save size={16} /> Shortlist
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No students found matching your criteria.</div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'jobs' && (
          <section className="jobs-section fade-in">
             <div className="section-header-row">
                <h2>Your Job Postings</h2>
                <button className="btn-primary" onClick={() => setIsPostingJob(true)}>
                   <Plus size={18} /> Post New Job
                </button>
             </div>

             <div className="jobs-grid">
                {myJobs.map((job) => (
                  <div key={job.id} className="job-recruiter-card premium-card">
                     <div className="job-header">
                        <h3>{job.title}</h3>
                        <span className="job-tag">{job.type}</span>
                     </div>
                     <p className="job-location"><MapPin size={14} /> {job.location}</p>
                     <div className="job-applicants-count">
                        <strong>{job.applicants?.length || 0}</strong> Applicants
                     </div>
                     <div className="job-actions-recruiter">
                        <button className="btn-ai" onClick={() => runReverseMatch(job.id)}>
                           <Sparkles size={16} /> AI Reverse Match
                        </button>
                        <button className="btn-outline">Manage Applicants</button>
                     </div>

                     {aiMatches.jobId === job.id && (
                       <div className="ai-results-dropdown fade-in">
                          <h4><BrainCircuit size={16} /> Top AI Recommendations</h4>
                          {isAiLoading ? (
                            <p className="text-xs italic">AI is scanning Skill Passports...</p>
                          ) : aiMatches.results.length > 0 ? (
                            aiMatches.results.map((res, i) => (
                              <div key={i} className="ai-match-item">
                                 <div className="match-info">
                                    <strong>{res.name}</strong>
                                    <span className="match-pct">{res.matchPercentage}% Match</span>
                                 </div>
                                 <p className="match-reason">{res.reason}</p>
                                 <button className="btn-mini" onClick={() => window.open(`/profile/${res.id}`, '_blank')}>View Profile</button>
                              </div>
                            ))
                          ) : <p className="text-xs">No matches found.</p>}
                       </div>
                     )}
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* Modal for posting job (simulated) */}
        {isPostingJob && (
          <div className="modal-overlay">
             <div className="modal-card">
                <h2>Post a New Opportunity</h2>
                <div className="modal-form">
                   <input type="text" placeholder="Job Title (e.g. React Developer)" />
                   <div className="form-row">
                      <select><option>Full-Time</option><option>Internship</option></select>
                      <input type="text" placeholder="Location" />
                   </div>
                   <input type="text" placeholder="Salary (e.g. 12-18 LPA)" />
                   <textarea placeholder="Job Description & Requirements"></textarea>
                   <div className="modal-actions">
                      <button className="btn-secondary" onClick={() => setIsPostingJob(false)}>Cancel</button>
                      <button className="btn-primary" onClick={() => { setIsPostingJob(false); alert('Job posted successfully! It is now live in CareerSprint.'); fetchMyJobs(); }}>Publish Listing</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <section className="saved-section fade-in">
             <h2>Shortlisted Candidates ({savedCandidates.length})</h2>
             <div className="candidate-list">
                {savedCandidates.map((c, i) => (
                  <div key={i} className="candidate-row premium-card">
                    <div className="candidate-info">
                       <span className="avatar">{c.candidate?.avatar || '👤'}</span>
                       <div>
                          <strong>{c.candidate?.name}</strong>
                          <p>{c.candidate?.university}</p>
                       </div>
                    </div>
                    <div className="candidate-meta">
                       <span>Saved on {new Date(c.savedAt).toLocaleDateString()}</span>
                    </div>
                    <button className="btn-primary" onClick={() => window.open(`/profile/${c.candidate?._id}`, '_blank')}>
                       View Profile <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
             </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default RecruiterDashboard;
