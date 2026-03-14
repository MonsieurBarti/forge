'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const forgeToolsPath = path.resolve(__dirname, '..', 'forge', 'bin', 'forge-tools.cjs');

describe('forge-tools smoke test', () => {
  it('loads without error and prints help', () => {
    // Running forge-tools with no arguments should print help and exit 0.
    const output = execFileSync('node', [forgeToolsPath], {
      encoding: 'utf8',
      timeout: 10_000,
    });
    assert.ok(output.includes('Usage: forge-tools'), 'should print usage info');
  });
});
