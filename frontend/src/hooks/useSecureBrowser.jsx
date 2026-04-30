/**
 * useSecureBrowser — StudySpirit Browser Integration Hook
 * =========================================================
 * Drop this hook into any exam page (Quiz.jsx, Exams.jsx, AIInterview.jsx, etc.)
 *
 * What it does:
 *  1. Detects if student is inside the StudySpirit Secure Browser (Electron app)
 *  2. If NOT inside the secure browser → shows a blocking gate page with download link
 *  3. If inside the secure browser → sends exam/student session to the Electron main process
 *  4. Listens for fullscreen-exit warnings from the main process and shows an overlay
 *  5. Intercepts Ctrl+V paste attempts and reports them to the main process
 *
 * Usage:
 *   import { useSecureBrowser } from '../hooks/useSecureBrowser';
 *
 *   const { isSecureBrowser, SecureBrowserGate, FullscreenWarning } = useSecureBrowser({
 *     examId: joinedQuiz?._id,
 *     studentId: user?._id,
 *     requireBrowser: joinedQuiz?.settings?.secureMode  // only enforce if teacher enabled it
 *   });
 *
 *   // In your render:
 *   if (isSecureBrowser === false && requireBrowser) return <SecureBrowserGate />;
 *   // ... rest of exam UI + <FullscreenWarning />
 */

import { useEffect, useState, useCallback } from 'react';

export function useSecureBrowser({ examId, studentId, requireBrowser = false } = {}) {
  // tri-state: null = checking, true = inside secure browser, false = regular browser
  const [isSecureBrowser, setIsSecureBrowser] = useState(null);
  const [fullscreenWarning, setFullscreenWarning] = useState(null); // { count }
  const [deviceId, setDeviceId] = useState(null);

  // ── Step 1: Detect if inside Electron secure browser ──────
  useEffect(() => {
    const ssb = window.studySpiritBrowser;
    const detected = !!(ssb && ssb.isBrowser === true);
    setIsSecureBrowser(detected);

    if (detected) {
      console.log('[SecureBrowser] ✅ StudySpirit Browser detected v' + ssb.version);

      // Get device ID for display / logging
      ssb.getDeviceId().then(id => {
        setDeviceId(id);
        console.log('[SecureBrowser] Device ID:', id?.slice(0, 12) + '...');
      }).catch(console.error);

      // Listen for fullscreen exit warnings from the Electron main process
      ssb.onFullscreenExitWarning((data) => {
        setFullscreenWarning(data);
        // Auto-clear warning after 5 seconds
        setTimeout(() => setFullscreenWarning(null), 5000);
      });

      // Listen for screenshot-blocked events
      ssb.onScreenshotBlocked(({ shortcut }) => {
        console.warn('[SecureBrowser] Screenshot blocked:', shortcut);
      });
    } else {
      console.log('[SecureBrowser] ⚠️  Regular browser detected. Secure browser required for formal exams.');
    }

    return () => {
      // Cleanup listeners when component unmounts
      if (window.studySpiritBrowser) {
        window.studySpiritBrowser.removeListener('fullscreen-exit-warning');
        window.studySpiritBrowser.removeListener('screenshot-blocked');
      }
    };
  }, []);

  // ── Step 2: Send exam session to Electron when exam starts ─
  useEffect(() => {
    if (isSecureBrowser && examId && studentId) {
      window.studySpiritBrowser.setExamSession(
        String(examId),
        String(studentId)
      );
      console.log('[SecureBrowser] Exam session set:', { examId, studentId });
    }
  }, [isSecureBrowser, examId, studentId]);

  // ── Step 3: Intercept paste attempts in exam mode ──────────
  useEffect(() => {
    if (!isSecureBrowser || !examId) return;

    const handlePaste = (e) => {
      // Allow paste inside Monaco code editor (coding questions need it)
      const target = e.target;
      const isInEditor = target && (
        target.closest?.('.monaco-editor') ||
        target.closest?.('[class*="monaco"]')
      );
      if (isInEditor) return;

      // Block and report
      e.preventDefault();
      window.studySpiritBrowser.reportClipboardAttempt();
    };

    document.addEventListener('paste', handlePaste, true);
    return () => document.removeEventListener('paste', handlePaste, true);
  }, [isSecureBrowser, examId]);

  // ── Gate Component: Blocks exam if not in secure browser ───
  const SecureBrowserGate = useCallback(() => {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1628 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif', color: '#fff',
        padding: '24px', textAlign: 'center'
      }}>
        {/* Shield Icon */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 0 60px rgba(124,58,237,0.5)'
        }}>
          <svg viewBox="0 0 24 24" width="52" height="52" fill="white">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
        </div>

        <h1 style={{
          fontSize: 32, fontWeight: 900, marginBottom: 12,
          background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Secure Browser Required
        </h1>

        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', maxWidth: 480, marginBottom: 8 }}>
          This exam requires the <strong style={{ color: '#a78bfa' }}>StudySpirit Secure Browser</strong> to
          prevent cheating and protect exam integrity — just like AMCAT.
        </p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 36, maxWidth: 400 }}>
          You cannot give this exam in a regular browser (Chrome, Firefox, Edge).
          Download and open StudySpirit Browser, then visit this page again.
        </p>

        {/* Features */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center'
        }}>
          {['🔒 Process Killer', '🖥️ Kiosk Fullscreen', '📋 Clipboard Guard', '🌐 Network Lock'].map(f => (
            <span key={f} style={{
              padding: '8px 16px',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 99, fontSize: 13, color: '#c4b5fd'
            }}>{f}</span>
          ))}
        </div>

        <a
          href="https://drive.google.com/file/d/1Vo0PKm3ZCFqbldnv1wGwDQgt2onQlE2k/view?usp=sharing"

          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '16px 40px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 18,
            textDecoration: 'none', boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          ⬇️ Download StudySpirit Browser
        </a>

        <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
          Free download · Windows &amp; Mac · Same as AMCAT secure browser
        </p>
      </div>
    );
  }, []);

  // ── Warning Overlay Component: Shown on fullscreen exit ────
  const FullscreenWarning = useCallback(() => {
    if (!fullscreenWarning) return null;

    return (
      <div style={{
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9998,
        background: 'rgba(239,68,68,0.95)',
        backdropFilter: 'blur(16px)',
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: 16, padding: '16px 32px',
        display: 'flex', alignItems: 'center', gap: 14,
        color: '#fff', fontFamily: 'system-ui, sans-serif',
        boxShadow: '0 8px 32px rgba(239,68,68,0.5)',
        animation: 'slideDown 0.3s ease-out',
        maxWidth: 520
      }}>
        <span style={{ fontSize: 28 }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>
            Fullscreen Exit Detected! ({fullscreenWarning.count} violation{fullscreenWarning.count > 1 ? 's' : ''})
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
            This has been logged. Stay in fullscreen to avoid exam termination.
          </div>
        </div>
      </div>
    );
  }, [fullscreenWarning]);

  return {
    isSecureBrowser,       // boolean | null
    deviceId,              // hardware fingerprint ID string
    fullscreenWarning,     // { count } | null
    SecureBrowserGate,     // Component — renders blocking gate if regular browser
    FullscreenWarning,     // Component — renders warning overlay on fullscreen exit
  };
}
