'use strict';

/**
 * StudySpirit Browser - Proctor Module
 * =====================================
 * Handles: Heartbeat (every 30s), session logging, activity flags,
 *          virtual camera detection, session end report.
 */

const https = require('https');

const HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 seconds
const API_BASE = 'https://studyspirit.in/api/proctor';

const SECURITY_HEADERS = {
  'X-StudySpirit-Browser': 'true',
  'X-StudySpirit-Token': 'SSB-2024-SECURE-TOKEN-XK9P2M7Q4N'
};

// ── Session Flags ──────────────────────────────────────────
let sessionFlags = {
  fullscreenExits: 0,
  appsKilled: [],
  screenshotAttempts: 0,
  clipboardAttempts: 0,
  networkBlockCount: 0,
  isVmDetected: false,
  isVirtualCamDetected: false
};

let heartbeatTimer = null;
let sessionGetters = null;

// ── Flag Mutators ──────────────────────────────────────────
function incrementFullscreenExits() { sessionFlags.fullscreenExits++; }
function incrementScreenshotAttempts() { sessionFlags.screenshotAttempts++; }
function incrementClipboardAttempts() { sessionFlags.clipboardAttempts++; }
function addKilledApp(appName) { sessionFlags.appsKilled.push(appName); }
function setVmDetected(val) { sessionFlags.isVmDetected = val; }
function setVirtualCamDetected(val) { sessionFlags.isVirtualCamDetected = val; }
function getSessionFlags() { return { ...sessionFlags }; }
function resetSessionFlags() {
  sessionFlags = {
    fullscreenExits: 0, appsKilled: [], screenshotAttempts: 0,
    clipboardAttempts: 0, networkBlockCount: 0,
    isVmDetected: false, isVirtualCamDetected: false
  };
}

// ── HTTP POST Helper ───────────────────────────────────────
function post(endpoint, payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const url = new URL(endpoint);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...SECURITY_HEADERS
      }
    };
    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', resolve);
    });
    req.on('error', (err) => {
      console.error(`[Proctor] POST failed (${endpoint}):`, err.message);
      resolve();
    });
    req.setTimeout(8000, () => { req.destroy(); resolve(); });
    req.write(body);
    req.end();
  });
}

// ── Heartbeat ─────────────────────────────────────────────
function startHeartbeat(getters) {
  sessionGetters = getters;
  heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
  console.log('[Proctor] Heartbeat started (every 30s).');
}

async function sendHeartbeat() {
  if (!sessionGetters) return;
  const payload = {
    examId: sessionGetters.getExamId(),
    studentId: sessionGetters.getStudentId(),
    deviceId: sessionGetters.getDeviceId(),
    timestamp: new Date().toISOString(),
    flags: sessionGetters.getFlags()
  };
  console.log('[Proctor] Sending heartbeat...');
  await post(`${API_BASE}/heartbeat`, payload);
}

async function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    // Send one final heartbeat
    await sendHeartbeat();
    sessionGetters = null;
    console.log('[Proctor] Heartbeat stopped.');
  }
}

// ── General Log ───────────────────────────────────────────
async function log(event, metadata = {}) {
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  console.log(`[Proctor] Log event: ${event}`, metadata);
  await post(`${API_BASE}/log`, payload);
}

// ── Session End ───────────────────────────────────────────
async function sendSessionEnd({ examId, studentId, deviceId }) {
  const payload = {
    examId, studentId, deviceId,
    timestamp: new Date().toISOString(),
    finalFlags: { ...sessionFlags }
  };
  console.log('[Proctor] Sending session end report...');
  await post(`${API_BASE}/session-end`, payload);
}

// ── Virtual Camera Detection ───────────────────────────────
const VIRTUAL_CAM_NAMES = [
  'obs virtual camera', 'manycam', 'splitcam',
  'snap camera', 'droidcam', 'epoccam',
  'virtual cam', 'xsplit', 'mmhmm'
];

async function checkVirtualCameras() {
  try {
    // This runs in main process — check via systeminformation
    const si = require('systeminformation');
    const devices = await si.usb();
    const audioDevices = await si.audio();

    const allDeviceNames = [
      ...devices.map(d => (d.name || '').toLowerCase()),
      ...audioDevices.map(d => (d.name || '').toLowerCase())
    ];

    const found = VIRTUAL_CAM_NAMES.find(vcam =>
      allDeviceNames.some(name => name.includes(vcam))
    );

    if (found) {
      console.warn(`[Proctor] Virtual camera detected: ${found}`);
      setVirtualCamDetected(true);
      return true;
    }
    return false;
  } catch (err) {
    console.error('[Proctor] Virtual cam check failed:', err.message);
    return false;
  }
}

module.exports = {
  startHeartbeat, stopHeartbeat, sendHeartbeat,
  sendSessionEnd, log,
  checkVirtualCameras,
  incrementFullscreenExits, incrementScreenshotAttempts,
  incrementClipboardAttempts, addKilledApp,
  setVmDetected, setVirtualCamDetected,
  getSessionFlags, resetSessionFlags
};
