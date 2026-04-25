'use strict';

/**
 * StudySpirit Browser - Lockdown Module
 * =======================================
 * Handles:
 *   - Killing dangerous screen-sharing / recording processes
 *   - Blocking system-level keyboard shortcuts (screenshot, Alt+F4, etc.)
 *   - Re-enabling shortcuts after exam ends
 */

const { globalShortcut, dialog, clipboard } = require('electron');
const { exec } = require('child_process');
const proctor = require('./proctor');

// ── Processes to Kill During Exam ──────────────────────────
const DANGEROUS_PROCESSES = [
  // Screen Recording
  { name: 'obs64.exe',        label: 'OBS Studio' },
  { name: 'obs32.exe',        label: 'OBS Studio' },
  { name: 'obs.exe',          label: 'OBS Studio' },
  { name: 'ShareX.exe',       label: 'ShareX' },
  { name: 'Snagit32.exe',     label: 'Snagit' },
  { name: 'Snagit64.exe',     label: 'Snagit' },
  { name: 'Lightshot.exe',    label: 'Lightshot' },
  // Remote Desktop / Screen Sharing
  { name: 'anydesk.exe',      label: 'AnyDesk' },
  { name: 'TeamViewer.exe',   label: 'TeamViewer' },
  { name: 'TeamViewer_Service.exe', label: 'TeamViewer' },
  { name: 'chrrd.exe',        label: 'Chrome Remote Desktop' },
  { name: 'remoting_host.exe',label: 'Chrome Remote Desktop' },
  // Video Conferencing
  { name: 'Zoom.exe',         label: 'Zoom' },
  { name: 'Teams.exe',        label: 'Microsoft Teams' },
  { name: 'Discord.exe',      label: 'Discord' },
  // VNC
  { name: 'winvnc.exe',       label: 'VNC Server' },
  { name: 'tvnserver.exe',    label: 'TightVNC' },
  { name: 'UltraVNC.exe',     label: 'UltraVNC' },
];

// Partial-name matches (process names containing these strings)
const DANGEROUS_KEYWORDS = [
  'screencap', 'screenrecord', 'remote', 'vnc',
  'camtasia', 'fraps', 'bandicam', 'xsplit'
];

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

function registerExamShortcutBlocks(mainWindow) {
  let blockedCount = 0;

  // Block screenshot shortcuts
  for (const shortcut of SCREENSHOT_SHORTCUTS) {
    try {
      const registered = globalShortcut.register(shortcut, () => {
        clipboard.clear();
        proctor.incrementScreenshotAttempts();
        proctor.log('screenshot_attempt', { shortcut });
        mainWindow.webContents.send('exam:screenshot-blocked', { shortcut });
        console.warn(`[Lockdown] Screenshot attempt blocked: ${shortcut}`);
      });
      if (registered) blockedCount++;
    } catch (e) {
      // Some shortcuts may not be registerable on all platforms
    }
  }

  // Block system navigation shortcuts
  for (const shortcut of SYSTEM_SHORTCUTS) {
    try {
      globalShortcut.register(shortcut, () => {
        console.warn(`[Lockdown] System shortcut blocked: ${shortcut}`);
        // Silently block — no action
      });
    } catch (e) {
      // Skip unregisterable shortcuts
    }
  }

  console.log(`[Lockdown] Registered ${blockedCount} exam shortcut blocks.`);
}

function unregisterExamShortcutBlocks() {
  globalShortcut.unregisterAll();
  console.log('[Lockdown] All shortcut blocks removed. Normal keyboard restored.');
}

module.exports = {
  killDangerousProcesses,
  registerExamShortcutBlocks,
  unregisterExamShortcutBlocks
};
