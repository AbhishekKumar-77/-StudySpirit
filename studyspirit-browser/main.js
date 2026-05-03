'use strict';

/**
 * StudySpirit Browser - Main Process
 * ====================================
 * AMCAT-style full lockdown from launch:
 *  - Kiosk mode enabled immediately (no title bar, no close button)
 *  - All system shortcuts blocked globally on startup
 *  - Background process killer runs every 10 seconds
 *  - Environment check gate before exam starts
 *  - Zero tab switching, zero Alt+Tab, zero window switching
 */

const {
  app, BrowserWindow, session, ipcMain,
  globalShortcut, dialog, clipboard,
  powerSaveBlocker, screen
} = require('electron');
const path   = require('path');
const https  = require('https');
const { exec } = require('child_process');
const { autoUpdater } = require('electron-updater');

const lockdown    = require('./lockdown');
const network     = require('./network');
const fingerprint = require('./fingerprint');
const proctor     = require('./proctor');

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const BASE_URL     = 'https://studyspirit.in';
const EXAM_PATTERN = /^\/exam\//;
const IS_DEV       = process.argv.includes('--dev');

// How often to scan & kill dangerous processes (even outside exam)
const BACKGROUND_SCAN_INTERVAL_MS = 10_000; // 10 seconds

const SECURITY_HEADERS = {
  'X-StudySpirit-Browser': 'true',
  'X-StudySpirit-Token': 'SSB-2024-SECURE-TOKEN-XK9P2M7Q4N'
};

// ─────────────────────────────────────────────
// APP STATE
// ─────────────────────────────────────────────
let mainWindow         = null;
let splashWindow       = null;
let isExamMode         = false;
let powerBlockerId     = null;
let currentExamId      = null;
let currentStudentId   = null;
let deviceId           = null;
let bgScanTimer        = null;   // background process scanner
let envCheckPassed     = false;  // true after environment gate passes

// ─────────────────────────────────────────────
// SINGLE INSTANCE LOCK
// ─────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  dialog.showErrorBox('StudySpirit Browser', 'Already running. Check your taskbar.');
  app.quit();
}
app.on('second-instance', () => {
  if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
});

// ─────────────────────────────────────────────
// SPLASH WINDOW
// ─────────────────────────────────────────────
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480, height: 300,
    frame: false, alwaysOnTop: true,
    transparent: true, resizable: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.center();
}

// ─────────────────────────────────────────────
// MAIN WINDOW
// ─────────────────────────────────────────────
function createMainWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds; // use full screen bounds, not workArea

  mainWindow = new BrowserWindow({
    x: primaryDisplay.bounds.x,
    y: primaryDisplay.bounds.y,
    width, height,
    show: false,
    title: 'StudySpirit Secure Browser',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#0a0a1a',
    frame: false,           // ← Remove title bar / close/min/max buttons entirely
    resizable: false,       // ← Cannot resize
    movable: false,         // ← Cannot move the window
    minimizable: false,     // ← Cannot minimize
    maximizable: false,     // ← Cannot maximize (already fullscreen)
    closable: false,        // ← Close button disabled
    skipTaskbar: false,     // Keep in taskbar so it shows as running
    alwaysOnTop: true,      // ← Always on top of everything
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: IS_DEV
    }
  });

  // Block ALL new popups / window.open calls
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // Disable context menu always
  mainWindow.webContents.on('context-menu', (e) => e.preventDefault());

  // Prevent closing ALWAYS (only allowed via explicit exam-end flow)
  mainWindow.on('close', (e) => {
    e.preventDefault();
    if (isExamMode) {
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'Exam in Progress',
        message: 'Cannot close during an exam.',
        detail: 'Submit your exam first, or wait for it to end.',
        buttons: ['OK']
      });
    }
    // Outside exam mode: also prevent close to avoid students escaping the browser
    // Students must use the logout/exit flow provided in the app
  });

  // Handle fullscreen exit — re-enter kiosk immediately
  mainWindow.on('leave-full-screen', () => {
    mainWindow.setKiosk(true);  // snap back immediately
    if (isExamMode) handleFocusLoss('Fullscreen Exit');
  });

  // Handle ANY focus loss — grab focus back instantly
  mainWindow.on('blur', () => {
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.focus();
        mainWindow.setKiosk(true);
      }
    }, 50);
    if (isExamMode) handleFocusLoss('Window Focus Lost (Alt+Tab)');
  });

  // Setup network lockdown (filters during exam mode only)
  network.setup(
    mainWindow.webContents.session,
    [],
    () => isExamMode
  );

  // Inject security headers on all studyspirit.in requests
  setupSecurityHeaders(mainWindow.webContents.session);

  // Watch URL changes to detect exam start/end
  mainWindow.webContents.on('did-navigate', (_, url) => handleNavigation(url));
  mainWindow.webContents.on('did-navigate-in-page', (_, url) => handleNavigation(url));

  // Load the environment check page first, then redirect to BASE_URL
  mainWindow.loadURL(BASE_URL);

  // Inject a visual "Close Browser" button when outside of exam mode
  mainWindow.webContents.on('dom-ready', () => {
    if (!isExamMode && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.executeJavaScript(`
        if (!document.getElementById('ss-close-btn')) {
          const btn = document.createElement('button');
          btn.id = 'ss-close-btn';
          btn.innerHTML = '✕ Close Browser';
          btn.style.position = 'fixed';
          btn.style.top = '20px';
          btn.style.right = '20px';
          btn.style.zIndex = '2147483647'; // absolute top
          btn.style.padding = '10px 18px';
          btn.style.background = 'rgba(239, 68, 68, 0.95)';
          btn.style.color = 'white';
          btn.style.border = '1px solid rgba(255,255,255,0.3)';
          btn.style.borderRadius = '8px';
          btn.style.fontFamily = 'system-ui, sans-serif';
          btn.style.fontWeight = '800';
          btn.style.fontSize = '14px';
          btn.style.cursor = 'pointer';
          btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)';
          btn.style.backdropFilter = 'blur(4px)';
          btn.style.transition = 'all 0.2s ease';
          
          btn.onmouseover = () => { btn.style.background = '#dc2626'; btn.style.transform = 'scale(1.05)'; };
          btn.onmouseout  = () => { btn.style.background = 'rgba(239, 68, 68, 0.95)'; btn.style.transform = 'scale(1)'; };
          
          btn.onclick = () => {
            if (window.studySpiritBrowser && window.studySpiritBrowser.forceQuit) {
              window.studySpiritBrowser.forceQuit();
            }
          };
          
          document.documentElement.appendChild(btn);
        }
      `).catch(err => console.error('[StudySpirit] Failed to inject close button:', err));
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.destroy();
    // Immediately enter kiosk mode — AMCAT style: locked from the very first moment
    mainWindow.setKiosk(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    mainWindow.show();
    mainWindow.focus();
    if (!IS_DEV) mainWindow.setMenu(null);
  });
}

// ─────────────────────────────────────────────
// BACKGROUND PROCESS SCANNER (runs every 10s even outside exam)
// ─────────────────────────────────────────────
function startBackgroundProcessScanner() {
  // Run once immediately
  runBackgroundScan();
  // Then every 10 seconds
  bgScanTimer = setInterval(runBackgroundScan, BACKGROUND_SCAN_INTERVAL_MS);
  console.log('[StudySpirit] Background process scanner started (every 10s).');
}

async function runBackgroundScan() {
  try {
    const killed = await lockdown.killDangerousProcesses();
    
    // Double-check if any apps resisted the kill command (e.g. system services like TightVNC)
    const stillRunning = await lockdown.getRunningDangerousProcesses();

    if (stillRunning.length > 0) {
      if (isExamMode) {
        // Fatal security violation during exam
        proctor.log('background_kill_failed', { apps: stillRunning });
        dialog.showMessageBoxSync({
          type: 'error',
          title: 'StudySpirit — Security Violation',
          message: 'A forbidden background application was detected and could not be closed automatically.',
          detail: `Detected: ${stillRunning.join(', ')}\n\nYour session has been terminated to maintain exam integrity. You must uninstall this app to continue.`,
          buttons: ['Quit Browser']
        });
        app.exit(0);
      } else {
        // Just a warning outside of exam mode
        dialog.showMessageBox(mainWindow, {
          type: 'warning',
          title: 'StudySpirit — Environment Warning',
          message: 'A forbidden background application is running:',
          detail: `${stillRunning.join(', ')}\n\nYou will NOT be able to start an exam until this is uninstalled or closed.`,
          buttons: ['OK']
        });
      }
    } else if (killed.length > 0) {
      // Process was successfully killed automatically
      console.warn('[StudySpirit] Background scan successfully killed:', killed);
      if (isExamMode) {
        proctor.log('background_kill', { killed });
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('exam:app-killed', { killed });
        }
      }
    }
  } catch (err) {
    console.error('[StudySpirit] Background scan error:', err.message);
  }
}

function stopBackgroundProcessScanner() {
  if (bgScanTimer) {
    clearInterval(bgScanTimer);
    bgScanTimer = null;
    console.log('[StudySpirit] Background process scanner stopped.');
  }
}

// ─────────────────────────────────────────────
// SECURITY HEADER INJECTION
// ─────────────────────────────────────────────
function setupSecurityHeaders(ses) {
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.includes('studyspirit.in')) {
      callback({ requestHeaders: { ...details.requestHeaders, ...SECURITY_HEADERS } });
    } else {
      callback({ requestHeaders: details.requestHeaders });
    }
  });
}

// ─────────────────────────────────────────────
// URL NAVIGATION
// ─────────────────────────────────────────────
function handleNavigation(url) {
  // Navigation handling is no longer used for exam locking.
  // We strictly rely on the 'exam:set-session' IPC event from the React app.
}

// ─────────────────────────────────────────────
// EXAM MODE — ACTIVATE
// ─────────────────────────────────────────────
async function activateExamMode() {
  isExamMode = true;

  try {
    // 0. Remove the Close Browser button immediately
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.executeJavaScript(`
        const btn = document.getElementById('ss-close-btn');
        if (btn) btn.remove();
      `).catch(() => {});
    }

    // 1. Verify device
    const currentId = await fingerprint.getDeviceId();
    const valid = await fingerprint.verifyDevice(currentId);
    if (!valid) {
      isExamMode = false;
      return dialog.showErrorBox(
        'StudySpirit Browser — Device Mismatch',
        'This device is not registered for your account.\nContact support at studyspirit.in'
      );
    }

    // 2. Kill dangerous processes (final sweep before exam)
    const killed = await lockdown.killDangerousProcesses();
    if (killed.length > 0) {
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'StudySpirit — Exam Integrity Protected',
        message: 'Screen sharing/recording apps were detected and closed.',
        detail: `Closed:\n• ${killed.join('\n• ')}`,
        buttons: ['OK, Continue Exam']
      });
    }

    // 3. Kiosk is ALREADY active — reinforce it
    mainWindow.setKiosk(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    mainWindow.focus();

    // 4. Clear clipboard
    clipboard.clear();

    // 5. Prevent screen sleep
    if (powerBlockerId === null) {
      powerBlockerId = powerSaveBlocker.start('prevent-display-sleep');
    }

    // 6. Start heartbeat
    proctor.startHeartbeat({
      getExamId:    () => currentExamId,
      getStudentId: () => currentStudentId,
      getDeviceId:  () => deviceId,
      getFlags:     () => proctor.getSessionFlags()
    });

    // 7. Log exam start
    proctor.log('exam_start', { deviceId, examId: currentExamId });

    console.log('[StudySpirit] ✅ Exam lockdown ACTIVE (AMCAT-style).');
  } catch (err) {
    console.error('[StudySpirit] activateExamMode error:', err);
  }
}

// ─────────────────────────────────────────────
// EXAM MODE — DEACTIVATE
// ─────────────────────────────────────────────
async function deactivateExamMode() {
  isExamMode = false;

  try {
    // NOTE: In AMCAT style — kiosk mode stays ON even after exam ends.
    // The student remains locked inside the browser. Only the exam session is reset.
    // Kiosk is NOT disabled here. It was enabled on boot and stays on.

    // 1. Stop sleep prevention (power blocker only needed during exam)
    if (powerBlockerId !== null) {
      powerSaveBlocker.stop(powerBlockerId);
      powerBlockerId = null;
    }

    // 2. Stop heartbeat + send final report
    await proctor.stopHeartbeat();
    await proctor.sendSessionEnd({
      examId: currentExamId,
      studentId: currentStudentId,
      deviceId
    });

    // 3. Reset session state
    proctor.resetSessionFlags();
    network.resetBlockedCount();
    currentExamId    = null;
    currentStudentId = null;

    // 4. Restore global lockdown shortcuts (exam-specific proctor callbacks → boot-level silent blocks)
    lockdown.unregisterExamShortcutBlocks();

    // 5. Keep kiosk + alwaysOnTop alive — student is still inside the browser
    mainWindow.setKiosk(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    mainWindow.focus();

    console.log('[StudySpirit] ✅ Exam session ended. Browser still in lockdown (AMCAT-style).');
  } catch (err) {
    console.error('[StudySpirit] deactivateExamMode error:', err);
  }
}

// ─────────────────────────────────────────────
// SECURITY VIOLATION HANDLER (Focus Loss / Fullscreen Exit)
// ─────────────────────────────────────────────
function handleFocusLoss(reason) {
  proctor.incrementFullscreenExits();
  const count = proctor.getSessionFlags().fullscreenExits;
  console.warn(`[StudySpirit] Violation: ${reason}. Count: #${count}`);

  // Re-enter kiosk immediately
  mainWindow.setKiosk(true);
  mainWindow.focus();

  // Notify the website (shows overlay warning to student)
  mainWindow.webContents.send('exam:fullscreen-exit-warning', { count, reason });

  // Log the violation
  proctor.log('focus_loss', { count, reason });
}

// ─────────────────────────────────────────────
// IPC HANDLERS
// ─────────────────────────────────────────────
function setupIpcHandlers() {
  // Website sends exam/student IDs when student enters exam
  ipcMain.on('exam:set-session', (_, { examId, studentId }) => {
    currentExamId    = examId;
    currentStudentId = studentId;
    console.log(`[StudySpirit] IPC Session update: exam=${examId}, student=${studentId}`);
    
    if (examId && examId !== 'null') {
      if (!isExamMode) {
        console.log('[StudySpirit] IPC triggered lockdown activation.');
        activateExamMode();
      }
    } else {
      if (isExamMode) {
        console.log('[StudySpirit] IPC triggered lockdown deactivation.');
        deactivateExamMode();
      }
    }
  });

  // Force quit from the injected UI button (only allowed outside exam)
  ipcMain.on('app:force-quit', () => {
    if (!isExamMode) {
      console.log('[StudySpirit] Force quitting via UI button.');
      app.exit(0); // completely terminate the app
    }
  });

  // Renderer requests device ID
  ipcMain.handle('device:get-id', async () => fingerprint.getDeviceId());

  // Renderer requests VM status
  ipcMain.handle('device:check-vm', async () => fingerprint.checkVirtualMachine());

  // Student tried to paste during exam
  ipcMain.on('exam:clipboard-attempt', () => {
    proctor.incrementClipboardAttempts();
    clipboard.clear();
    proctor.log('clipboard_attempt', {});
  });
}

// ─────────────────────────────────────────────
// APP INTEGRITY CHECK
// ─────────────────────────────────────────────
async function checkAppIntegrity() {
  if (IS_DEV) {
    console.log('[StudySpirit] Dev mode — skipping integrity check.');
    return true;
  }
  return new Promise((resolve) => {
    const req = https.get(
      'https://studyspirit.in/api/browser/verify',
      { headers: SECURITY_HEADERS },
      (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            const { valid } = JSON.parse(data);
            resolve(valid !== false);
          } catch { resolve(true); }
        });
      }
    );
    req.on('error', () => resolve(true)); // Don't block if offline
    req.setTimeout(5000, () => { req.destroy(); resolve(true); });
  });
}

// ─────────────────────────────────────────────
// AUTO UPDATER
// ─────────────────────────────────────────────
function setupAutoUpdater() {
  if (IS_DEV) return;
  autoUpdater.setFeedURL({ provider: 'generic', url: 'https://studyspirit.in/api/browser/latest' });
  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info', title: 'Update Available',
      message: 'A new version is downloading and will install on next restart.',
      buttons: ['OK']
    });
  });
  autoUpdater.on('error', err => console.error('[Updater]', err.message));
}

// ─────────────────────────────────────────────
// APP LIFECYCLE
// ─────────────────────────────────────────────
app.whenReady().then(async () => {
  console.log('[StudySpirit] Starting — AMCAT-style lockdown browser...');

  // ── Step 1: Block ALL system shortcuts immediately, before window even opens
  lockdown.registerGlobalLockdownShortcuts();

  createSplashWindow();

  // ── Step 2: App integrity check
  const integrityOk = await checkAppIntegrity();
  if (!integrityOk) {
    if (splashWindow) splashWindow.destroy();
    dialog.showErrorBox(
      'StudySpirit Browser — Tampered App',
      'This app has been modified.\nPlease reinstall from studyspirit.in/download'
    );
    return app.quit();
  }

  // ── Step 3: VM check
  const isVM = await fingerprint.checkVirtualMachine();
  if (isVM) {
    if (splashWindow) splashWindow.destroy();
    dialog.showErrorBox(
      'StudySpirit Browser — Virtual Machine Detected',
      'Exams cannot be taken inside a virtual machine.\nPlease use a real physical device.'
    );
    return app.quit();
  }

  // ── Step 4: Kill dangerous processes BEFORE showing main window
  console.log('[StudySpirit] Running pre-launch environment check...');
  
  // Try to kill automatically first
  await lockdown.killDangerousProcesses();
  
  // Double-check if any survived
  const stillRunning = await lockdown.getRunningDangerousProcesses();
  if (stillRunning.length > 0) {
    if (splashWindow) splashWindow.destroy();
    
    dialog.showMessageBoxSync({
      type: 'error',
      title: 'StudySpirit Browser — Environment Check Failed',
      message: 'Forbidden Background Applications Detected',
      detail: 'The following applications are running in the background and violate exam security:\n\n' +
              stillRunning.map(app => `• ${app}`).join('\n') +
              '\n\nThe secure browser cannot automatically close them. You MUST manually CLOSE or UNINSTALL these applications from your computer before you can open StudySpirit.',
      buttons: ['Quit Browser']
    });
    
    return app.quit();
  }

  // ── Step 5: Register device fingerprint
  deviceId = await fingerprint.getDeviceId();
  await fingerprint.registerDevice(deviceId);

  // ── Step 6: Setup IPC + create main window (in kiosk mode from the start)
  setupIpcHandlers();
  createMainWindow();
  setupAutoUpdater();

  // ── Step 7: Start continuous background process scanner
  // Runs every 10 seconds — kills any banned apps that are opened after launch
  mainWindow.once('ready-to-show', () => {
    startBackgroundProcessScanner();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

app.on('before-quit', () => {
  stopBackgroundProcessScanner();
  globalShortcut.unregisterAll();
  if (powerBlockerId !== null) powerSaveBlocker.stop(powerBlockerId);
});

// Prevent accidental app quit via process signals
process.on('SIGTERM', () => console.warn('[StudySpirit] SIGTERM ignored — exam in progress.'));
process.on('SIGINT',  () => console.warn('[StudySpirit] SIGINT ignored — exam in progress.'));

process.on('uncaughtException', err => {
  console.error('[StudySpirit] Uncaught exception:', err);
});
