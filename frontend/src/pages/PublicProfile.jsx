import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Github, Globe, Mail, MapPin, GraduationCap, 
  Award, Zap, BookOpen, Star, Code, Terminal, 
  Share2, Download, CheckCircle2, MessageCircle
} from 'lucide-react';
import { API_URL } from '../config';
import { getAvatarUrl, handleAvatarError } from '../utils/avatarHelper';
import './PublicProfile.css';

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/recruiter/profile/${id}`);
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
        } else {
          setError(data.error || 'Profile not found');
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) return <div className="loading-screen">Verifying Skill Passport...</div>;
  if (error) return <div className="error-screen">{error}</div>;

  const { user, verifiedSkills, softSkillsProfile, consistencyScore, completedProjects } = profile;

  return (
    <div className="public-profile-page">
      <div className="profile-container">
        {/* Left Column: Personal Info */}
        <aside className="profile-sidebar">
          <div className="profile-card main-info">
            <div className="profile-avatar-large">
              <img
                src={getAvatarUrl(user?.avatar)}
                alt={user?.name || 'User'}
                onError={handleAvatarError}
              />
            </div>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-role">{user.course}</p>
            <p className="profile-uni"><GraduationCap size={16} /> {user.university}</p>
            
            <div className="profile-badges">
              {user.stats?.streak >= 7 && <span className="badge-pill" title="7 Day Streak">🔥 Week Warrior</span>}
              {user.stats?.level >= 10 && <span className="badge-pill" title="Level 10">🛡️ Code Warrior</span>}
            </div>

            <div className="profile-socials">
              <button className="btn-icon"><Github size={20} /></button>
              <button className="btn-icon"><Globe size={20} /></button>
              <button className="btn-icon"><Mail size={20} /></button>
            </div>

            <hr className="divider" />

            <div className="profile-stats-mini">
              <div className="mini-stat">
                <span className="label">Streak</span>
                <span className="value">{user.stats?.streak || 0} Days</span>
              </div>
              <div className="mini-stat">
                <span className="label">XP</span>
                <span className="value">{user.stats?.xp || 0}</span>
              </div>
              <div className="mini-stat">
                <span className="label">Level</span>
                <span className="value">{user.stats?.level || 1}</span>
              </div>
            </div>

            <button className="btn-primary w-full mt-4" onClick={() => window.print()}>
              <Download size={18} /> Download Resume
            </button>
            <button className="btn-secondary w-full mt-2">
              <MessageCircle size={18} /> Contact {user.name.split(' ')[0]}
            </button>
          </div>
        </aside>

        {/* Right Column: Skills & Proof of Work */}
        <main className="profile-content">
          {/* Skill Passport Section */}
          <section className="profile-section">
            <div className="section-header">
              <div className="title-group">
                <Award className="text-primary" size={24} />
                <h2>Verified Skill Passport</h2>
              </div>
              <Share2 size={20} className="clickable" />
            </div>
            
            <div className="skills-grid">
              {verifiedSkills?.map((skill, idx) => (
                <div key={idx} className="skill-meter-card">
                   <div className="skill-info">
                      <span className="skill-name">{skill.skillName}</span>
                      <span className="skill-score">{skill.score}%</span>
                   </div>
                   <div className="meter-bg">
                      <div className="meter-fill" style={{ width: `${skill.score}%` }}></div>
                   </div>
                   <p className="skill-meta">Verified via {skill.verifiedBy}</p>
                </div>
              ))}
            </div>
          </section>

          {/* AI Insights Section */}
          <div className="content-row">
            <section className="profile-section flex-1">
              <div className="section-header">
                <div className="title-group">
                  <Zap className="text-warning" size={24} />
                  <h2>AI Soft Skills Profile</h2>
                </div>
              </div>
              <div className="soft-skills-card">
                 <div className="radar-placeholder">
                    {/* Placeholder for a chart, but we'll use bars for now */}
                    <div className="radar-bar">
                       <span>Communication</span>
                       <div className="bar-bg"><div className="bar-fill" style={{width: `${softSkillsProfile.communicationScore}%`}}></div></div>
                    </div>
                    <div className="radar-bar">
                       <span>Confidence</span>
                       <div className="bar-bg"><div className="bar-fill" style={{width: `${softSkillsProfile.confidenceScore}%`}}></div></div>
                    </div>
                    <div className="overall-rating">
                       <span className="rating-num">{softSkillsProfile.overallRating}</span>
                       <span className="rating-label">Overall Rating</span>
                    </div>
                 </div>
              </div>
            </section>

            <section className="profile-section flex-1">
              <div className="section-header">
                <div className="title-group">
                  <Terminal className="text-success" size={24} />
                  <h2>Coding Footprint</h2>
                </div>
              </div>
              <div className="github-activity-card">
                 <div className="github-stats">
                    <div className="g-stat">
                       <strong>{user.githubProfile?.publicRepos || 0}</strong>
                       <span>Repos</span>
                    </div>
                    <div className="g-stat">
                       <strong>{user.githubProfile?.followers || 0}</strong>
                       <span>Followers</span>
                    </div>
                 </div>
                 <p className="github-bio">{user.githubProfile?.bio || "Passionate developer solving real-world problems."}</p>
                 <div className="github-langs">
                    {user.githubProfile?.repositories?.slice(0, 4).map((r, i) => (
                       <span key={i} className="lang-tag">{r.language || 'Code'}</span>
                    ))}
                 </div>
              </div>
            </section>
          </div>

          {/* Projects / Proof of Work */}
          <section className="profile-section">
            <div className="section-header">
              <div className="title-group">
                <BookOpen className="text-info" size={24} />
                <h2>Verified Proof of Work</h2>
              </div>
            </div>
            <div className="projects-list">
               {completedProjects?.map((proj, idx) => (
                 <div key={idx} className="project-item">
                    <div className="project-status">
                       <CheckCircle2 className="text-success" size={20} />
                       <span className="verified-label">VERIFIED</span>
                    </div>
                    <div className="project-info">
                       <h3>{proj.title}</h3>
                       <p>{proj.description}</p>
                    </div>
                    <button className="btn-outline">View Code</button>
                 </div>
               ))}
               {(!completedProjects || completedProjects.length === 0) && (
                 <div className="empty-projects">
                    <p>No verified projects yet. Projects submitted in StudySpirit Lab appear here.</p>
                 </div>
               )}
            </div>
          </section>
        </main>
      </div>
      
      <footer className="profile-footer">
        <p>Verified by <strong>StudySpirit Proof-of-Work Protocol</strong></p>
        <p className="timestamp">Last Updated: {new Date(profile.updatedAt).toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default PublicProfile;
