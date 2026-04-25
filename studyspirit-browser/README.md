# StudySpirit Browser 🛡️

A secure, locked-down exam browser for **studyspirit.in** — similar to AMCAT's secure browser.

---

## What It Does

When a student opens an exam (`/exam/*` URL), the app automatically:

| Feature | Details |
|---|---|
| ✅ Security Headers | Injects `X-StudySpirit-Browser` + token on all requests |
| ✅ Process Killer | Kills OBS, Zoom, AnyDesk, Teams, Discord, VNC, etc. |
| ✅ Kiosk Fullscreen | True fullscreen — cannot Alt+Tab or minimize |
| ✅ Screenshot Block | Blocks PrintScreen, Win+Shift+S, Mac screenshot keys |
| ✅ Clipboard Wipe | Clears clipboard on exam start; blocks paste attempts |
| ✅ Network Lockdown | Blocks all requests except studyspirit.in domains |
| ✅ Hardware Fingerprint | Unique device ID from CPU/RAM/OS — stored encrypted |
| ✅ VM Detection | Detects VMware, VirtualBox, Hyper-V, QEMU, Parallels |
| ✅ Heartbeat | Sends activity log every 30s to your backend |
| ✅ Session Report | Final violation report sent when exam ends |
| ✅ Auto Updater | Checks for updates from studyspirit.in/api/browser/latest |
| ✅ App Integrity | Verifies app hasn't been tampered with on launch |

---

## Project Structure

```
studyspirit-browser/
├── main.js          → Main process: window, exam lifecycle, IPC
├── preload.js       → Secure bridge: contextBridge API for website
├── lockdown.js      → Process killer + keyboard shortcut blocking
├── network.js       → Request interception (blocks non-allowed domains)
├── fingerprint.js   → Hardware fingerprint + VM detection
├── proctor.js       → Heartbeat, logging, session flags
├── splash.html      → Startup loading screen
├── assets/          → icon.ico, icon.icns, icon.png (add your icons here)
└── package.json     → Electron + electron-builder config
```

---

## Setup & Run

### Prerequisites
- Node.js 18+
- npm 9+

### Install
```bash
cd studyspirit-browser
npm install
```

### Run in Development
```bash
npm run dev
```

### Build Windows Installer (.exe)
```bash
npm run build:win
```
Output: `dist/StudySpirit Browser Setup 1.0.0.exe`

### Build Mac (.dmg)
```bash
npm run build:mac
```

> **Note:** Windows build requires Admin rights (for process killing).
> The installer is configured with `requireAdministrator` in the manifest.

---

## Website Integration

Your studyspirit.in website needs to:

### 1. Detect the Secure Browser
```javascript
if (window.studySpiritBrowser?.isBrowser) {
  // Running inside secure browser
  console.log('Secure browser v' + window.studySpiritBrowser.version);
} else {
  // Redirect to download page
  window.location.href = '/download-browser';
}
```

### 2. Send Exam Session Info (call this when exam page loads)
```javascript
window.studySpiritBrowser.setExamSession(examId, studentId);
```

### 3. Listen for Fullscreen Exit Warnings
```javascript
window.studySpiritBrowser.onFullscreenExitWarning(({ count }) => {
  showWarningOverlay(`Warning: You left fullscreen ${count} time(s). Exam may be flagged.`);
});
```

### 4. Backend Header Verification
On your `/exam/*` routes, check:
```javascript
if (req.headers['x-studyspirit-browser'] !== 'true' ||
    req.headers['x-studyspirit-token'] !== process.env.SS_BROWSER_TOKEN) {
  return res.status(403).json({ error: 'Access requires StudySpirit Browser' });
}
```

---

## Backend API Endpoints Required

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/device/register` | POST | Register device fingerprint |
| `/api/proctor/heartbeat` | POST | Receive 30s activity logs |
| `/api/proctor/log` | POST | Receive individual events |
| `/api/proctor/session-end` | POST | Receive final session report |
| `/api/browser/verify` | GET | App integrity check (return `{"valid": true}`) |
| `/api/browser/latest` | GET | Auto-updater feed URL |

---

## Configuration

### Change the Security Token
In `main.js` and `proctor.js`, update:
```javascript
const SECURITY_HEADERS = {
  'X-StudySpirit-Browser': 'true',
  'X-StudySpirit-Token': 'YOUR_SECRET_TOKEN_HERE'
};
```
Store the same token in your backend `.env` as `SS_BROWSER_TOKEN`.

### Add App Icons
Place your icons in `assets/`:
- `icon.ico` — Windows (256x256)
- `icon.icns` — Mac
- `icon.png` — General (512x512)

---

## Security Architecture

```
Student's PC
  └── StudySpirit Browser (Electron)
        ├── Main Process (Node.js)
        │     ├── Kills dangerous processes (taskkill)
        │     ├── Blocks system shortcuts (globalShortcut)
        │     ├── Intercepts network requests (webRequest API)
        │     ├── Generates hardware fingerprint
        │     └── Sends heartbeat to backend
        │
        ├── Preload Script (contextIsolation: true)
        │     └── Exposes safe API to website (no raw Node.js)
        │
        └── Renderer (studyspirit.in website)
              └── Calls window.studySpiritBrowser.* API
```

---

## Built With
- [Electron](https://www.electronjs.org/) v28
- [electron-builder](https://www.electron.build/) — Installer generation
- [electron-updater](https://www.electron.build/auto-update) — Auto updates
- [systeminformation](https://systeminformation.io/) — Hardware fingerprint
- [node-machine-id](https://github.com/automation-stack/node-machine-id) — Unique machine ID

---

*StudySpirit Browser — Making exam integrity possible. 🎓*
