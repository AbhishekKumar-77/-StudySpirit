'use strict';

/**
 * StudySpirit Browser - Lockdown Module
 * =======================================
 * AMCAT-style lockdown:
 *   - registerGlobalLockdownShortcuts(): blocks ALL shortcuts from app BOOT
 *   - killDangerousProcesses(): kills banned apps (runs every 10s in background)
 *   - registerExamShortcutBlocks(): kept for exam-mode extra enforcement
 */

const { app, globalShortcut, dialog, clipboard } = require('electron');
const { exec } = require('child_process');
const proctor = require('./proctor');

// ── Processes to Kill During Exam ──────────────────────────
const DANGEROUS_PROCESSES = [
  // Screen Recording
  { name: 'obs64.exe',              label: 'OBS Studio' },
  { name: 'obs32.exe',              label: 'OBS Studio' },
  { name: 'obs.exe',                label: 'OBS Studio' },
  { name: 'ShareX.exe',             label: 'ShareX' },
  { name: 'Snagit32.exe',           label: 'Snagit' },
  { name: 'Snagit64.exe',           label: 'Snagit' },
  { name: 'Lightshot.exe',          label: 'Lightshot' },
  // Remote Desktop / Screen Sharing
  { name: 'anydesk.exe',            label: 'AnyDesk' },
  { name: 'TeamViewer.exe',         label: 'TeamViewer' },
  { name: 'TeamViewer_Service.exe', label: 'TeamViewer' },
  { name: 'chrrd.exe',              label: 'Chrome Remote Desktop' },
  { name: 'remoting_host.exe',      label: 'Chrome Remote Desktop' },
  // Video Conferencing
  { name: 'Zoom.exe',               label: 'Zoom' },
  { name: 'Teams.exe',              label: 'Microsoft Teams' },
  { name: 'Discord.exe',            label: 'Discord' },
  // VNC
  { name: 'winvnc.exe',             label: 'VNC Server' },
  { name: 'tvnserver.exe',          label: 'TightVNC' },
  { name: 'UltraVNC.exe',           label: 'UltraVNC' },
  // Web Browsers (prevent looking up answers)
  { name: 'chrome.exe',             label: 'Google Chrome' },
  { name: 'firefox.exe',            label: 'Mozilla Firefox' },
  { name: 'msedge.exe',             label: 'Microsoft Edge' },
  { name: 'brave.exe',              label: 'Brave Browser' },
  { name: 'opera.exe',              label: 'Opera Browser' },
  // Task Manager (students try to kill the browser process)
  { name: 'Taskmgr.exe',            label: 'Task Manager' },
  // AI / Chat assistants
  { name: 'ChatGPT.exe',            label: 'ChatGPT App' },
  { name: 'claude.exe',             label: 'Claude App' },
  { name: 'copilot.exe',            label: 'Microsoft Copilot' },
  // Communication that can share screens
  { name: 'slack.exe',              label: 'Slack' },
  { name: 'skype.exe',              label: 'Skype' },
  { name: 'telegram.exe',           label: 'Telegram' },
  { name: 'whatsapp.exe',           label: 'WhatsApp' },
];

// Partial-name matches (process names containing these strings)
const DANGEROUS_KEYWORDS = [
  'screencap', 'screenrecord', 'remote', 'vnc',
  'camtasia', 'fraps', 'bandicam', 'xsplit',
  'teamviewer', 'anydesk', 'parsec', 'rustdesk'
];

// ── Detect Dangerous Processes ─────────────────────────────
async function getRunningDangerousProcesses() {
  return new Promise((resolve) => {
    exec('tasklist /fo csv /nh', (err, stdout) => {
      if (err) return resolve([]);

      const runningProcesses = stdout.split('\n')
        .map(line => line.replace(/"/g, '').split(',')[0]?.trim().toLowerCase())
        .filter(Boolean);

      const found = new Set();

      for (const proc of DANGEROUS_PROCESSES) {
        if (runningProcesses.includes(proc.name.toLowerCase())) {
          found.add(proc.label);
        }
      }

      for (const procName of runningProcesses) {
        for (const keyword of DANGEROUS_KEYWORDS) {
          if (procName.includes(keyword)) {
            // Capitalize keyword for better display
            found.add(procName);
          }
        }
      }

      resolve(Array.from(found));
    });
  });
}

// ── Kill Dangerous Processes ───────────────────────────────
async function killDangerousProcesses() {
  const killed = [];

  return new Promise((resolve) => {
    // Get all running processes on Windows
    exec('tasklist /fo csv /nh', async (err, stdout) => {
      if (err) {
        console.error('[Lockdown] Failed to list processes:', err.message);
        return resolve(killed);
      }

      const runningProcesses = stdout.split('\n')
        .map(line => line.replace(/"/g, '').split(',')[0]?.trim().toLowerCase())
        .filter(Boolean);

      const toKill = new Set();

      // Check exact process names
      for (const proc of DANGEROUS_PROCESSES) {
        if (runningProcesses.includes(proc.name.toLowerCase())) {
          toKill.add({ exe: proc.name, label: proc.label });
        }
      }

      // Check keyword matches
      for (const procName of runningProcesses) {
        for (const keyword of DANGEROUS_KEYWORDS) {
          if (procName.includes(keyword)) {
            toKill.add({ exe: procName, label: procName });
          }
        }
      }

      if (toKill.size === 0) {
        console.log('[Lockdown] No dangerous processes found.');
        return resolve(killed);
      }

      // Kill each one
      const killPromises = [...toKill].map(({ exe, label }) =>
        new Promise((res) => {
          exec(`taskkill /F /IM "${exe}"`, (killErr) => {
            if (!killErr) {
              killed.push(label);
              proctor.addKilledApp(label);
              console.log(`[Lockdown] Killed: ${label} (${exe})`);
            }
            res();
          });
        })
      );

      await Promise.all(killPromises);
      resolve(killed);
    });
  });
}

// ── Screenshot Key Interception ────────────────────────────
// These are blocked system-wide while exam is running
const SCREENSHOT_SHORTCUTS = [
  'PrintScreen',
  'Shift+PrintScreen',
  'Alt+PrintScreen',
  'Super+Shift+S',   // Win+Shift+S (Snipping Tool)
  'CommandOrControl+Shift+3', // Mac screenshot
  'CommandOrControl+Shift+4', // Mac screenshot
  'CommandOrControl+Shift+5', // Mac screenshot
];

// These shortcuts are blocked to prevent Alt+F4, task switching etc.
const SYSTEM_SHORTCUTS = [
  'Alt+F4',
  'Alt+Tab',
  'Super+Tab',       // Win+Tab
  'Super+D',         // Win+D (show desktop)
  'Super+L',         // Win+L (lock screen — allow kiosk to keep control)
  'Super+R',         // Win+R (run dialog)
  'Super+E',         // Win+E (file explorer)
  'Ctrl+Escape',     // Start menu
  'Super',           // Windows key alone
  'CommandOrControl+W',  // Close tab
  'CommandOrControl+N',  // New window
  'CommandOrControl+T',  // New tab
  'CommandOrControl+R',  // Reload (prevent accidental reload during exam)
  'F11',             // Fullscreen toggle (managed by app)
];

// ── Global Lockdown Shortcuts (runs from APP BOOT, not just exam mode) ─────
// These are the AMCAT-style blocks: the moment the browser opens, all
// system navigation, screenshot, and Alt+Tab shortcuts are disabled.
function registerGlobalLockdownShortcuts() {
  let blockedCount = 0;

  // Block screenshot shortcuts
  for (const shortcut of SCREENSHOT_SHORTCUTS) {
    try {
      const ok = globalShortcut.register(shortcut, () => {
        clipboard.clear();
        console.warn(`[Lockdown] Screenshot blocked at boot level: ${shortcut}`);
      });
      if (ok) blockedCount++;
    } catch (e) { /* skip */ }
  }

  // Block all system navigation shortcuts
  for (const shortcut of SYSTEM_SHORTCUTS) {
    try {
      globalShortcut.register(shortcut, () => {
        // Allow standard close shortcuts ONLY before the exam starts
        if (shortcut === 'Alt+F4' || shortcut === 'CommandOrControl+W') {
          console.log(`[Lockdown] ${shortcut} pressed outside exam — quitting app.`);
          app.exit(0);
          return;
        }
        console.warn(`[Lockdown] System shortcut blocked at boot level: ${shortcut}`);
      });
      blockedCount++;
    } catch (e) { /* skip */ }
  }

  console.log(`[Lockdown] ✅ Global lockdown active from boot — ${blockedCount} shortcuts blocked.`);
}

// ── Exam-mode shortcut blocks (reinforces boot-level blocks with proctor reporting)
function registerExamShortcutBlocks(mainWindow) {
  // In AMCAT style, shortcuts are already blocked at boot via registerGlobalLockdownShortcuts.
  // This function is kept for any exam-specific extra handling (e.g. proctor reporting).
  // The global blocks are already in place — just reinforce with exam-specific callbacks.
  globalShortcut.unregisterAll(); // clear boot-level registrations

  let blockedCount = 0;

  // Re-register screenshot shortcuts with proctor reporting
  for (const shortcut of SCREENSHOT_SHORTCUTS) {
    try {
      const registered = globalShortcut.register(shortcut, () => {
        clipboard.clear();
        proctor.incrementScreenshotAttempts();
        proctor.log('screenshot_attempt', { shortcut });
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('exam:screenshot-blocked', { shortcut });
        }
        console.warn(`[Lockdown] Screenshot attempt blocked (exam mode): ${shortcut}`);
      });
      if (registered) blockedCount++;
    } catch (e) { /* skip */ }
  }

  // Re-register system shortcuts
  for (const shortcut of SYSTEM_SHORTCUTS) {
    try {
      globalShortcut.register(shortcut, () => {
        console.warn(`[Lockdown] System shortcut blocked (exam mode): ${shortcut}`);
      });
    } catch (e) { /* skip */ }
  }

  console.log(`[Lockdown] Exam shortcut blocks active — ${blockedCount} screenshot blocks.`);
}

function unregisterExamShortcutBlocks() {
  globalShortcut.unregisterAll();
  // Restore global boot-level lockdown (we're out of exam but still in the browser)
  registerGlobalLockdownShortcuts();
  console.log('[Lockdown] Exam-mode blocks replaced by global lockdown.');
}

module.exports = {
  getRunningDangerousProcesses,
  killDangerousProcesses,
  registerGlobalLockdownShortcuts,
  registerExamShortcutBlocks,
  unregisterExamShortcutBlocks
};
