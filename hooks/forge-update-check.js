#!/usr/bin/env node
'use strict';

/**
 * Forge update check hook.
 * Runs on SessionStart. Compares installed version against package.json
 * in the source repo (if accessible) and notifies if an update is available.
 *
 * Non-blocking -- always exits cleanly. Debounces to once per 24 hours.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const STATE_FILE = path.join(os.tmpdir(), 'forge-update-check.json');
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function main() {
  try {
    const input = await readStdin();
    // SessionStart hook -- input may be empty or JSON

    // Check if we should skip (debounce)
    let state = {};
    try {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch {
      // No state file yet
    }

    const now = Date.now();
    if (state.last_check && (now - state.last_check) < CHECK_INTERVAL_MS) {
      return; // Already checked recently
    }

    // Check if update check is disabled via bd kv
    try {
      const disabled = execFileSync('bd', ['kv', 'get', 'forge.update_check'], {
        encoding: 'utf8', timeout: 3000, stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
      if (disabled === 'false' || disabled === 'off' || disabled === '0') {
        return;
      }
    } catch {
      // Key not set -- default to enabled
    }

    // Get installed version from ~/.claude/forge/
    const installedPkgPath = path.join(os.homedir(), '.claude', 'forge', 'package.json');
    let installedVersion = null;
    try {
      const pkg = JSON.parse(fs.readFileSync(installedPkgPath, 'utf8'));
      installedVersion = pkg.version;
    } catch {
      // Not installed via package.json -- skip check
      return;
    }

    // Try to find source package.json (if we're in the forge repo)
    let sourceVersion = null;
    const candidates = [
      // Common locations relative to cwd
      path.join(process.cwd(), 'package.json'),
      // The forge source dir if it exists
      path.join(os.homedir(), 'gt', 'forge', 'package.json'),
    ];

    for (const candidate of candidates) {
      try {
        const pkg = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        if (pkg.name === 'forge') {
          sourceVersion = pkg.version;
          break;
        }
      } catch {
        continue;
      }
    }

    // Update state
    state.last_check = now;
    state.installed_version = installedVersion;
    state.source_version = sourceVersion;
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));

    // Compare versions if both available
    if (sourceVersion && installedVersion && sourceVersion !== installedVersion) {
      console.error(
        `[forge] Update available: ${installedVersion} -> ${sourceVersion}. ` +
        `Run: node install.js`
      );
    }
  } catch {
    // Hooks must never block -- fail silently
  }
}

function readStdin() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(''), 3000);
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => { clearTimeout(timeout); resolve(data); });
    process.stdin.on('error', () => { clearTimeout(timeout); resolve(''); });
  });
}

main();
