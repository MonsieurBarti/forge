#!/usr/bin/env node
'use strict';

/**
 * index.cjs -- Entry point for forge-tools. Merges all domain modules and dispatches commands.
 */

const { forgeError } = require('./core.cjs');
const phaseCommands = require('./phase-commands.cjs');
const projectCommands = require('./project-commands.cjs');
const gitCommands = require('./git-commands.cjs');
const roadmapCommands = require('./roadmap-commands.cjs');

const commands = Object.assign(
  {},
  phaseCommands,
  projectCommands,
  gitCommands,
  roadmapCommands
);

const [command, ...args] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  console.log('Usage: forge-tools <command> [args]');
  console.log('\nCommands:');
  Object.keys(commands).forEach(cmd => console.log(`  ${cmd}`));
  process.exit(0);
}

if (!commands[command]) {
  forgeError('UNKNOWN_COMMAND', `Unknown command: ${command}`, `Available commands: ${Object.keys(commands).join(', ')}`, { command });
}

try {
  commands[command](args);
} catch (err) {
  forgeError('COMMAND_FAILED', `Error in ${command}: ${err.message}`, `Run: forge-tools ${command} --help or check arguments`, { command, error: err.message });
}
