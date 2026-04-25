'use strict';

/**
 * StudySpirit Browser - Preload Script
 * =====================================
 * Secure bridge between main process and the renderer (studyspirit.in website).
 * Uses contextBridge — ZERO raw Node.js APIs exposed to the web page.
 */

const { contextBridge, ipcRenderer } = require('electron');
const pkg = require('./package.json');

// ── Expose controlled API to renderer ─────────────────────
contextBridge.exposeInMainWorld('studySpiritBrowser', {

  // Identity — website can check this to confirm it's inside the secure app
  isBrowser: true,
  version: pkg.version,

  // Called by the website when a student enters an exam
  setExamSession: (examId, studentId) => {
    if (typeof examId !== 'string' || typeof studentId !== 'string') return;
    ipcRenderer.send('exam:set-session', { examId, studentId });
  },

  // Fetch the device fingerprint ID
  getDeviceId: () => ipcRenderer.invoke('device:get-id'),

  // Check if running inside a VM (extra layer from renderer side)
  checkVirtualMachine: () => ipcRenderer.invoke('device:check-vm'),

  // Report that user tried to paste something (website detects Ctrl+V)
  reportClipboardAttempt: () => ipcRenderer.send('exam:clipboard-attempt'),

  // Listen for fullscreen-exit warning events from main process
  onFullscreenExitWarning: (callback) => {
    ipcRenderer.on('exam:fullscreen-exit-warning', (_, data) => callback(data));
  },

  // Listen for screenshot-blocked events
  onScreenshotBlocked: (callback) => {
    ipcRenderer.on('exam:screenshot-blocked', (_, data) => callback(data));
  },

  // Cleanup listeners when no longer needed
  removeListener: (channel) => {
    ipcRenderer.removeAllListeners(`exam:${channel}`);
  }
});

// ── Block dangerous keyboard shortcuts in renderer context ─
window.addEventListener('keydown', (e) => {
  const blocked = [
    e.key === 'F12',                           // DevTools
    e.ctrlKey && e.shiftKey && e.key === 'I',  // DevTools
    e.ctrlKey && e.shiftKey && e.key === 'J',  // Console
    e.ctrlKey && e.shiftKey && e.key === 'C',  // Inspector
    e.ctrlKey && e.key === 'u',                // View source
    e.ctrlKey && e.key === 'U',
    e.ctrlKey && e.key === 'p',                // Print
    e.ctrlKey && e.key === 'P',
    e.ctrlKey && e.key === 's',                // Save
    e.ctrlKey && e.key === 'S',
  ];

  if (blocked.some(Boolean)) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
}, true);

// ── Block drag-and-drop (prevent dropping files into browser) ──
window.addEventListener('dragover', (e) => e.preventDefault(), false);
window.addEventListener('drop', (e) => e.preventDefault(), false);

console.log('[StudySpirit Preload] Secure bridge loaded v' + pkg.version);
