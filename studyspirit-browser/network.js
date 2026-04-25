'use strict';

/**
 * StudySpirit Browser - Network Lockdown Module
 * ===============================================
 * Intercepts ALL network requests during exam mode.
 * Blocks anything not on the allowlist. Silently drops & logs blocked requests.
 */

let blockedCount = 0;

const ALLOWED_PATTERNS = [
  /^https:\/\/(www\.)?studyspirit\.in/,
  /^https:\/\/cdn\.studyspirit\.in/,
  /^https:\/\/api\.studyspirit\.in/,
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
];

/**
 * Setup network interception on the given session.
 * @param {Electron.Session} ses - The Electron session to intercept
 * @param {string[]} _allowedOrigins - Allowed origin list (used by ALLOWED_PATTERNS above)
 * @param {Function} isExamMode - Getter that returns true when exam is active
 */
function setup(ses, _allowedOrigins, isExamMode) {
  ses.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (details, callback) => {
    // Only enforce during exam mode
    if (!isExamMode()) {
      return callback({ cancel: false });
    }

    const url = details.url;

    // Allow if matches any allowed pattern
    const isAllowed = ALLOWED_PATTERNS.some(pattern => pattern.test(url));

    if (isAllowed) {
      return callback({ cancel: false });
    }

    // Block and log
    blockedCount++;
    console.warn(`[Network] BLOCKED (${blockedCount}): ${url}`);
    callback({ cancel: true });
  });

  console.log('[Network] Request interception active.');
}

function getBlockedCount() {
  return blockedCount;
}

function resetBlockedCount() {
  blockedCount = 0;
}

module.exports = { setup, getBlockedCount, resetBlockedCount };
