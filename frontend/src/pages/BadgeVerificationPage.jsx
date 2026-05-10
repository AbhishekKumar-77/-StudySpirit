import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Award, Calendar, ShieldCheck, User, GraduationCap, ArrowRight, ExternalLink } from 'lucide-react';
import { API_URL } from '../config';
import './Dashboard.css';

const BadgeVerificationPage = () => {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/api/recruiter/verify/badge/${code}`);
        const json = await res.json();
        if (json.success) setData(json.verification);
        else setError(json.error || 'Badge not found');
      } catch (err) {
        setError('Verification service unavailable');
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, [code]);

  if (isLoading) return <div className="loading-screen">Authenticating Credential...</div>;
  if (error) return (
    <div className="error-screen">
       <div className="error-card">
          <ShieldCheck size={48} color="#ef4444" />
          <h1>Invalid Credential</h1>
          <p>The verification code <strong>{code}</strong> could not be verified by the StudySpirit Protocol.</p>
          <button className="btn-primary mt-4" onClick={() => window.location.href = '/'}>Back to Home</button>
       </div>
    </div>
  );

  return (
    <div className="verification-page">
      <div className="verification-card premium-card">
        <div className="v-header">
           <div className="v-logo">StudySpirit <span>Verified</span></div>
           <div className="v-badge-icon">{data.icon}</div>
        </div>

        <div className="v-content">
           <div className="v-status">
              <CheckCircle size={20} className="text-success" />
              <span>OFFICIALLY VERIFIED CREDENTIAL</span>
           </div>
           
           <h1 className="v-title">{data.name}</h1>
           <p className="v-issuer">Issued by StudySpirit Proctored Assessment Engine</p>

           <div className="v-grid">
              <div className="v-item">
                 <User size={18} />
                 <div>
                    <label>Earner</label>
                    <strong>{data.student?.name}</strong>
                 </div>
              </div>
              <div className="v-item">
                 <GraduationCap size={18} />
                 <div>
                    <label>Institution</label>
                    <strong>{data.student?.university}</strong>
                 </div>
              </div>
              <div className="v-item">
                 <Calendar size={18} />
                 <div>
                    <label>Issued Date</label>
                    <strong>{new Date(data.issuedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                 </div>
              </div>
              <div className="v-item">
                 <Award size={18} />
                 <div>
                    <label>Score Verified</label>
                    <strong>{data.score}/{data.totalScore} ({Math.round(data.score / data.totalScore * 100)}%)</strong>
                 </div>
              </div>
           </div>

           <div className="v-method">
              <h3>Verification Methodology</h3>
              <p>This badge was issued following the successful completion of a proctored technical examination. The assessment was delivered via the StudySpirit Secure Browser with AI-enabled behavior monitoring and environment lockdown.</p>
           </div>
        </div>

        <div className="v-footer">
           <div className="v-id">Verification ID: {data.verificationCode}</div>
           <button className="btn-outline" onClick={() => window.open(`/profile/${data.student?._id}`, '_blank')}>
              View Full Skill Passport <ExternalLink size={14} />
           </button>
        </div>
      </div>
      
      <div className="v-watermark">StudySpirit Verification Protocol v2.1</div>
    </div>
  );
};

export default BadgeVerificationPage;
