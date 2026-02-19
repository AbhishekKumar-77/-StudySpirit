# 🚀 StudySpirit — Production Readiness Plan
## Target: 1,000–5,000 Concurrent Users | Zero Crashes

---

## PHASE 1: DEAD CODE & JUNK CLEANUP
> Remove all files that serve no purpose, are backups, or were used for debugging.

### Files to DELETE from root:
| File | Reason |
|------|--------|
| `APPLICATION_READY.md` | Dev notes — not needed in production |
| `APPLICATION_STATUS.md` | Dev notes |
| `CHAT_AND_AVATAR_FIXED.md` | Dev notes |
| `CHAT_AND_AVATAR_FIXED_CONFIRMED.md` | Dev notes |
| `CHAT_BUG_FIX_EXPLANATION.md` | Dev notes |
| `FIX_GITHUB_LOGIN.md` | Dev notes |
| `FIX_MONGODB.md` | Dev notes |
| `FIX_SUMMARY.md` | Dev notes |
| `FULL_SYSTEM_FIX_REPORT.md` | Dev notes |
| `GITHUB_IMPLEMENTATION_SUMMARY.md` | Dev notes |
| `GITHUB_OAUTH_SETUP.md` | Dev notes |
| `GITHUB_SETUP_QUICKSTART.md` | Dev notes |
| `GITHUB_WORKING_PROOF.md` | Dev notes |
| `GROUPMODE_DEBUG.md` | Dev notes |
| `GROUPMODE_FIXES.md` | Dev notes |
| `GROUPMODE_FIX_REPORT.md` | Dev notes |
| `GROUPMODE_FIX_REPORT_V2.md` | Dev notes |
| `GROUP_MODE_ARCHITECTURE.md` | Dev notes |
| `GROUP_MODE_GUIDE.md` | Dev notes |
| `GROUP_MODE_QUICKSTART.md` | Dev notes |
| `GROUP_MODE_TESTING.md` | Dev notes |
| `LIVE_ROOMS_FIXED.md` | Dev notes |
| `REAL_GROUP_SYNC_ENABLED.md` | Dev notes |
| `RESTART_INSTRUCTIONS_V3.md` | Dev notes |
| `SESSION_SUMMARY.md` | Dev notes |
| `SKILL_TREE_FEATURE.md` | Dev notes |
| `SOLO_MODE_REDESIGN.md` | Dev notes |
| `STUDY_PLANNER_ENHANCEMENT.md` | Dev notes |
| `WEBRTC_GUIDE.md` | Dev notes |
| `WEBRTC_IMPLEMENTATION_SUMMARY.md` | Dev notes |
| `WEBRTC_QUICKSTART.md` | Dev notes |
| `fix_mongoose_crash_instructions.md` | Dev notes |
| `fix_chat_listener.ps1` | Debug script |

### Files to DELETE from backend:
| File | Reason |
|------|--------|
| `backend/debug.js` | Debug-only script |
| `backend/test-leetcode.js` | Test script |
| `backend/replace_function.py` | One-time refactor script |
| `backend/replace_planner.py` | One-time refactor script |
| `backend/controllers/soloController.backup.js` | Backup file (57KB of dead code) |

### Files to DELETE from frontend:
| File | Reason |
|------|--------|
| `frontend/src/pages/Quiz.jsx.backup` | Backup file (69KB of dead code) |
| `frontend/public/test-planner.html` | Test file, not used in app |

### Routes to REMOVE from App.jsx (Coming Soon placeholders — no backend):
| Route | Reason |
|-------|--------|
| `/chat-mentor` | No backend, no feature — just shows "Coming Soon" |
| `/institution` | No backend, no feature — just shows "Coming Soon" |
| `/analyzer` | No backend, no feature — just shows "Coming Soon" |
| Commented out `/mentorship` | Already commented out |

**Total dead code removed: ~130KB+**

---

## PHASE 2: BACKEND INFRASTRUCTURE (Critical for Scaling)

### 2.1 — Environment Configuration
- Create proper `.env.example` with all required variables
- Support `NODE_ENV` (development / production)
- Dynamic CORS origin based on environment
- Remove all hardcoded `localhost:5173` references

### 2.2 — Session Store (Fix crash data loss)
- Move sessions from in-memory to MongoDB using `connect-mongo` (already installed!)
- Sessions will survive server restarts

### 2.3 — Rate Limiting
- Install `express-rate-limit`
- Add global API rate limit: 100 requests/15min per IP
- Add strict limit on auth routes: 5 requests/15min per IP
- Add limit on AI/Groq routes: 10 requests/min per user

### 2.4 — Input Validation & Security Middleware
- Install `helmet` for security headers
- Install `express-mongo-sanitize` to prevent NoSQL injection
- Add request size limits
- Add proper error handling middleware (catch-all)

### 2.5 — Structured Error Handling
- Create centralized error handler middleware
- Remove all `console.log` / `console.error` from production
- Add proper HTTP status codes

### 2.6 — Socket.io State Management
- Move `onlineUsers`, `roomParticipants`, `webrtcRooms` from in-memory Map() to:
  - Option A: MongoDB (simpler, good for 1-5K users)
  - Option B: Redis (better for 5K+ users, needs Redis server)
- For your scale (1-5K), MongoDB with connect-mongo is sufficient

### 2.7 — Process Management
- Add PM2 configuration (`ecosystem.config.js`)
- Enable cluster mode (use all CPU cores)
- Add health check endpoint (`/api/health`)
- Add graceful shutdown handling

---

## PHASE 3: BACKEND CODE QUALITY

### 3.1 — Break up `index.js` (354 lines → modular)
- Extract Socket.io events to `sockets/index.js`
- Extract Socket.io group events to `sockets/groupEvents.js`
- Extract Socket.io room events to `sockets/roomEvents.js`
- Extract Socket.io WebRTC events to `sockets/webrtcEvents.js`
- Keep `index.js` as clean server setup only (~50 lines)

### 3.2 — Add proper middleware stack
```
middleware/
├── auth.js          (existing — enhance)
├── rateLimiter.js   (new)
├── errorHandler.js  (new)
├── validate.js      (new)
├── security.js      (new — helmet, sanitize)
```

### 3.3 — Add health & monitoring
```
routes/
├── healthRoutes.js  (new — /api/health)
```

---

## PHASE 4: FRONTEND OPTIMIZATION (Performance)

### 4.1 — Lazy Loading (Critical for mobile)
- All page components should use `React.lazy()` + `Suspense`
- This means the browser only downloads page code when user navigates there
- Right now ALL 19 pages (~800KB+ of JSX) load on first visit

### 4.2 — Remove dead "Coming Soon" routes
- Remove chat-mentor, institution, analyzer routes
- Remove commented-out mentorship route

---

## EXECUTION ORDER

| Step | What | Impact |
|------|------|--------|
| 1 | Delete all dead files (32 MD files, backup files, scripts) | Clean repo |
| 2 | Add environment config system | Deploy-ready |
| 3 | Fix session store (connect-mongo) | No data loss on restart |
| 4 | Add security middleware (helmet, rate-limit, sanitize) | Hack-proof |
| 5 | Add centralized error handling | No crashes |
| 6 | Extract Socket.io code from index.js | Maintainable |
| 7 | Add PM2 config + health checks | Production monitoring |
| 8 | Add React.lazy() loading | Fast page loads |
| 9 | Remove Coming Soon placeholder routes | Clean UX |

---

*Plan created: 2026-02-16*
*Target: Production deployment for 1,000-5,000 users*
