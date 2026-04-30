'use strict';

/**
 * StudySpirit Browser - Main Process
 * ====================================
 * Orchestrates all security modules.
 * Handles: Window management, URL monitoring (exam start/end),
 *          security header injection, IPC handlers, auto-updates.
 */

const {
  app, BrowserWindow, session, ipcMain,
  globalShortcut, dialog, clipboard,
  powerSaveBlocker, screen
} = require('electron');
const path   = require('path');
const https  = require('https');
const { autoUpdater } = require('electron-updater');

const lockdown    = require('./lockdown');
const network     = require('./network');
const fingerprint = require('./fingerprint');
const proctor     = require('./proctor');

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const BASE_URL     = 'https://studyspirit.in';
const EXAM_PATTERN = /^https:\/\/(www\.)?studyspirit\.in\/exam\//;
const IS_DEV       = process.argv.includes('--dev');

const SECURITY_HEADERS = {
  'X-StudySpirit-Browser': 'true',
  'X-StudySpirit-Token': 'SSB-2024-SECURE-TOKEN-XK9P2M7Q4N'
};

// ─────────────────────────────────────────────
// APP STATE
// ─────────────────────────────────────────────
let mainWindow       = null;
let splashWindow     = null;
let isExamMode       = false;
let powerBlockerId   = null;
let currentExamId    = null;
let currentStudentId = null;
let deviceId         = null;

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
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width, height,
    show: false,
    title: 'StudySpirit Browser',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#0a0a1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // SECURITY: isolate renderer context
      nodeIntegration: false,   // SECURITY: no Node.js in renderer
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: IS_DEV
    }
  });

  // Block new popups / window.open calls
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // Disable context menu in exam mode
  mainWindow.webContents.on('context-menu', (e) => {
    if (isExamMode) e.preventDefault();
  });

  // Prevent closing during exam
  mainWindow.on('close', (e) => {
    if (isExamMode) {
      e.preventDefault();
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'Exam in Progress',
        message: 'Cannot close during an exam.',
        detail: 'Submit your exam first, or wait for it to end.',
        buttons: ['OK']
      });
    }
  });

  // Handle accidental fullscreen exit
  mainWindow.on('leave-full-screen', () => {
    if (isExamMode) handleFocusLoss('Fullscreen Exit');
  });

  // Handle window losing focus (Alt+Tab, Task Switch)
  mainWindow.on('blur', () => {
    if (isExamMode) {
      handleFocusLoss('Window Focus Lost (Alt+Tab)');
      mainWindow.focus(); // Force focus back to exam
    }
  });

  // Setup network lockdown (filters during exam mode only)
  network.setup(
    mainWindow.webContents.session,
    [],
    () => isExamMode
  );

  // Inject security headers on all studyspirit.in requests
  setupSecurityHeaders(mainWindow.webContents.session);

  // Watch URL changes
  mainWindow.webContents.on('did-navigate', (_, url) => handleNavigation(url));
  mainWindow.webContents.on('did-navigate-in-page', (_, url) => handleNavigation(url));

  mainWindow.loadURL(BASE_URL);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.destroy();
    mainWindow.show();
    mainWindow.maximize();
    if (!IS_DEV) mainWindow.setMenu(null);
  });
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
// URL NAVIGATION — EXAM START / END DETECTION
// ─────────────────────────────────────────────
function handleNavigation(url) {
  const wasExam = isExamMode;
  const isExam  = EXAM_PATTERN.test(url);

  if (!wasExam && isExam) {
    console.log('[StudySpirit] Exam URL detected. Starting lockdown...');
    activateExamMode();
  } else if (wasExam && !isExam) {
    console.log('[StudySpirit] Left exam URL. Deactivating lockdown...');
    deactivateExamMode();
  }
}

// ─────────────────────────────────────────────
// EXAM MODE — ACTIVATE
// ─────────────────────────────────────────────
async function activateExamMode() {
  isExamMode = true;

  try {
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

    // 2. Kill dangerous processes
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

    // 3. Kiosk fullscreen
    mainWindow.setKiosk(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver');

    // 4. Block system keyboard shortcuts
    lockdown.registerExamShortcutBlocks(mainWindow);

    // 5. Clear clipboard
    clipboard.clear();

    // 6. Prevent screen sleep
    powerBlockerId = powerSaveBlocker.start('prevent-display-sleep');

    // 7. Start heartbeat
    proctor.startHeartbeat({
      getExamId:    () => currentExamId,
      getStudentId: () => currentStudentId,
      getDeviceId:  () => deviceId,
      getFlags:     () => proctor.getSessionFlags()
    });

    // 8. Log exam start
    proctor.log('exam_start', { deviceId, examId: currentExamId });

    console.log('[StudySpirit] ✅ Exam lockdown ACTIVE.');
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
    // 1. Exit kiosk
    mainWindow.setKiosk(false);
    mainWindow.setAlwaysOnTop(false);

    // 2. Restore keyboard shortcuts
    lockdown.unregisterExamShortcutBlocks();

    // 3. Stop sleep prevention
    if (powerBlockerId !== null) {
      powerSaveBlocker.stop(powerBlockerId);
      powerBlockerId = null;
    }

    // 4. Stop heartbeat + send final report
    await proctor.stopHeartbeat();
    await proctor.sendSessionEnd({
      examId: currentExamId,
      studentId: currentStudentId,
      deviceId
    });

    // 5. Reset session state
    proctor.resetSessionFlags();
    network.resetBlockedCount();
    currentExamId    = null;
    currentStudentId = null;

    console.log('[StudySpirit] ✅ Exam lockdown RELEASED. Normal browsing restored.');
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
    console.log(`[StudySpirit] Session: exam=${examId}, student=${studentId}`);
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
  console.log('[StudySpirit] Starting...');

  createSplashWindow();

  // App integrity
  const integrityOk = await checkAppIntegrity();
  if (!integrityOk) {
    if (splashWindow) splashWindow.destroy();
    dialog.showErrorBox(
      'StudySpirit Browser — Tampered App',
      'This app has been modified.\nPlease reinstall from studyspirit.in/download'
    );
    return app.quit();
  }

  // VM check
  const isVM = await fingerprint.checkVirtualMachine();
  if (isVM) {
    if (splashWindow) splashWindow.destroy();
    dialog.showErrorBox(
      'StudySpirit Browser — Virtual Machine Detected',
      'Exams cannot be taken inside a virtual machine.\nPlease use a real physical device.'
    );
    return app.quit();
  }

  // Register device fingerprint
  deviceId = await fingerprint.getDeviceId();
  await fingerprint.registerDevice(deviceId);

  // Setup IPC + window + updater
  setupIpcHandlers();
  createMainWindow();
  setupAutoUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

app.on('before-quit', () => {
  globalShortcut.unregisterAll();
  if (powerBlockerId !== null) powerSaveBlocker.stop(powerBlockerId);
});

process.on('uncaughtException', err => {
  console.error('[StudySpirit] Uncaught exception:', err);
});
