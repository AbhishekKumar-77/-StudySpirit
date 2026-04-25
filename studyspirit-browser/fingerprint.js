'use strict';

/**
 * StudySpirit Browser - Hardware Fingerprint Module
 * ==================================================
 * Handles: Device ID generation, VM detection, device registration/verification.
 * Uses systeminformation + node-machine-id + crypto (built-in).
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const https = require('https');

const SECURITY_HEADERS = {
  'X-StudySpirit-Browser': 'true',
  'X-StudySpirit-Token': 'SSB-2024-SECURE-TOKEN-XK9P2M7Q4N'
};

// Store device ID in app data directory
function getStorePath() {
  return path.join(app.getPath('userData'), 'device.dat');
}

// ── Generate Device ID ─────────────────────────────────────
async function generateDeviceId() {
  try {
    const si = require('systeminformation');
    const { machineId } = require('node-machine-id');

    const [cpu, mem, osInfo, uuid] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      machineId(true)
    ]);

    const raw = [
      cpu.manufacturer, cpu.brand, cpu.cores,
      Math.round(mem.total / (1024 ** 3)),  // RAM in GB
      osInfo.platform, osInfo.arch,
      uuid
    ].join('|');

    return crypto.createHash('sha256').update(raw).digest('hex');
  } catch (err) {
    console.error('[Fingerprint] generateDeviceId failed:', err.message);
    // Fallback: use machine-id only
    const { machineId } = require('node-machine-id');
    const mid = await machineId(true);
    return crypto.createHash('sha256').update(mid).digest('hex');
  }
}

// ── Get or Create Stored Device ID ─────────────────────────
async function getDeviceId() {
  const storePath = getStorePath();

  if (fs.existsSync(storePath)) {
    try {
      const encrypted = fs.readFileSync(storePath, 'utf8');
      const id = decrypt(encrypted);
      console.log('[Fingerprint] Loaded device ID from store.');
      return id;
    } catch {
      console.warn('[Fingerprint] Corrupt device store, regenerating...');
    }
  }

  const id = await generateDeviceId();
  fs.writeFileSync(storePath, encrypt(id), 'utf8');
  console.log('[Fingerprint] Generated & stored new device ID.');
  return id;
}

// ── Simple Encryption (AES-256-CBC) ───────────────────────
// Derive exactly 32 bytes from passphrase using SHA-256
const ENC_KEY = crypto.createHash('sha256')
  .update('StudySpirit2024SecureBrowserKey')
  .digest(); // Returns Buffer of exactly 32 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(16); // Random IV for each encrypt
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, iv);
  const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // Prepend IV to ciphertext
}

function decrypt(data) {
  const [ivHex, encrypted] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, iv);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

// ── Register Device with Backend ───────────────────────────
async function registerDevice(deviceId) {
  return new Promise(async (resolve) => {
    try {
      const si = require('systeminformation');
      const [cpu, mem, osInfo, graphics, networkInterfaces] = await Promise.all([
        si.cpu(), si.mem(), si.osInfo(), si.graphics(), si.networkInterfaces()
      ]);

      const macAddress = networkInterfaces && networkInterfaces[0]
        ? crypto.createHash('sha256').update(networkInterfaces[0].mac || '').digest('hex')
        : 'unknown';

      const payload = JSON.stringify({
        deviceId,
        fingerprint: {
          cpu: `${cpu.manufacturer} ${cpu.brand}`,
          ramGB: Math.round(mem.total / (1024 ** 3)),
          os: `${osInfo.distro} ${osInfo.release}`,
          arch: osInfo.arch,
          gpu: graphics.controllers?.[0]?.model || 'unknown',
          macAddressHash: macAddress
        }
      });

      const options = {
        hostname: 'studyspirit.in',
        path: '/api/proctor/device/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...SECURITY_HEADERS
        }
      };

      const req = https.request(options, (res) => {
        res.on('data', () => {});
        res.on('end', () => {
          console.log('[Fingerprint] Device registered with backend.');
          resolve(true);
        });
      });
      req.on('error', (err) => {
        console.error('[Fingerprint] Registration failed:', err.message);
        resolve(false);
      });
      req.setTimeout(8000, () => { req.destroy(); resolve(false); });
      req.write(payload);
      req.end();
    } catch (err) {
      console.error('[Fingerprint] registerDevice error:', err.message);
      resolve(false);
    }
  });
}

// ── Verify Device Matches Registered ───────────────────────
async function verifyDevice(deviceId) {
  // For now: device ID is generated deterministically from hardware,
  // so if it matches the stored one, it's the same device.
  // Backend verification can be added when your API is ready.
  const storedId = await getDeviceId();
  return storedId === deviceId;
}

// ── Virtual Machine Detection ───────────────────────────────
const VM_MAC_PREFIXES = [
  '00:0c:29', '00:50:56', '00:1c:14', // VMware
  '08:00:27', '0a:00:27',              // VirtualBox
  '00:15:5d',                          // Hyper-V
  '52:54:00',                          // QEMU/KVM
  '00:1a:4a',                          // Parallels
];

const VM_GPU_KEYWORDS = [
  'vmware', 'virtualbox', 'virtual', 'hyper-v',
  'qemu', 'parallels', 'svga', 'cirrus'
];

async function checkVirtualMachine() {
  try {
    const si = require('systeminformation');
    const [system, graphics, networkInterfaces] = await Promise.all([
      si.system(),
      si.graphics(),
      si.networkInterfaces()
    ]);

    // Check system manufacturer/model for VM strings
    const sysStr = `${system.manufacturer} ${system.model}`.toLowerCase();
    const vmSysKeywords = ['vmware', 'virtualbox', 'virtual machine', 'qemu', 'hyper-v', 'parallels', 'xen'];
    if (vmSysKeywords.some(k => sysStr.includes(k))) {
      console.warn('[Fingerprint] VM detected via system info:', sysStr);
      return true;
    }

    // Check GPU name
    const gpus = graphics.controllers || [];
    for (const gpu of gpus) {
      const gpuName = (gpu.model || '').toLowerCase();
      if (VM_GPU_KEYWORDS.some(k => gpuName.includes(k))) {
        console.warn('[Fingerprint] VM detected via GPU:', gpu.model);
        return true;
      }
    }

    // Check MAC address prefixes
    const ifaces = networkInterfaces || [];
    for (const iface of ifaces) {
      const mac = (iface.mac || '').toLowerCase();
      if (VM_MAC_PREFIXES.some(prefix => mac.startsWith(prefix))) {
        console.warn('[Fingerprint] VM detected via MAC prefix:', mac);
        return true;
      }
    }

    console.log('[Fingerprint] VM check passed — real device confirmed.');
    return false;
  } catch (err) {
    console.error('[Fingerprint] VM check error:', err.message);
    return false; // Don't block if check fails
  }
}

module.exports = {
  getDeviceId,
  generateDeviceId,
  registerDevice,
  verifyDevice,
  checkVirtualMachine
};
