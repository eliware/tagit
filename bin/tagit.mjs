#!/usr/bin/env node
import { log as defaultLog, registerHandlers, registerSignals } from '@eliware/common';
import fsDefault from 'fs';
import { execSync as execSyncDefault } from 'child_process';
import path from 'path';
import { updateVersionFiles as updateVersionFilesDefault } from '../src/updateVersionFiles.mjs';
import { gitOperations as gitOperationsDefault } from '../src/gitOperations.mjs';
import { runPreflight as runPreflightDefault } from '../src/releaseChecks.mjs';

const defaultDependencies = {
  fs: fsDefault,
  execSync: execSyncDefault,
  log: defaultLog,
  updateVersionFiles: updateVersionFilesDefault,
  gitOperations: gitOperationsDefault,
  runPreflight: runPreflightDefault,
  registerHandlersFn: registerHandlers,
  registerSignalsFn: registerSignals,
  exit: process.exit,
};

export async function runTagit(overrides = {}, argv = []) {
  const {
    fs, execSync, log, updateVersionFiles, gitOperations, runPreflight,
    registerHandlersFn, registerSignalsFn, exit,
  } = { ...defaultDependencies, ...overrides };
  const options = parseOptions(argv);
  if (options.help || !options.command) {
    (overrides.output ?? console.log)(helpText());
    return;
  }
  registerHandlersFn({ log });
  registerSignalsFn({ log });

  try {
    if (options.command === 'release' && !options.version) {
      throw new Error('A specific release version is required. Use tagit release --version X.Y.Z.');
    }
    if (fs.existsSync('.notag')) {
      log.warn('.notag file detected — aborting tag/release process.');
      exit(0);
      return;
    }
  } catch (error) {
    log.error('Error checking for .notag file:', error);
    exit(1);
    return;
  }

  log.info('tagit Started');

  try {
    const preflight = runPreflight(execSync, fs, log, { verifyCi: true });
    if (options.command === 'preflight') {
      log.info('Preflight complete');
      (overrides.output ?? console.log)(JSON.stringify({ ok: true, checks: preflight }));
      return;
    }
    const newVersion = await updateVersionFiles(fs, log, { targetVersion: options.version });
    log.info(`Updated version to ${newVersion}`);
    gitOperations(execSync, fs, log, newVersion);
  } catch (error) {
    log.error(error);
    exit(1);
  }
}

export function isHelp(argv) {
  return argv.includes('--help') || argv.includes('-h');
}

export function getReleaseVersion(argv) {
  const index = argv.findIndex((argument) => argument === '--version');
  if (index === -1) return null;
  const value = argv[index + 1];
  if (!value || value.startsWith('-')) return null;
  if (!/^\d+\.\d+\.\d+$/.test(value)) throw new Error(`Invalid release version: ${value}`);
  return value;
}

export function parseOptions(argv) {
  const command = argv[0];
  if (command && command !== 'preflight' && command !== 'release') throw new Error(`Unknown command: ${command}`);
  return {
    command,
    help: isHelp(argv),
    version: command === 'release' ? getReleaseVersion(argv) : null,
  };
}

export function helpText() {
  return `Usage: tagit <command>\n\nCommands:\n  preflight                 Verify local gates and exact-HEAD Ubuntu/Windows CI\n  release --version X.Y.Z  Run preflight, then commit, tag, and push\n\nOptions:\n  -h, --help                Show this help\n  -v, --version             Show the installed tagit version`;
}

export function isCli(argv) {
  const executable = argv[1] ? path.basename(argv[1]) : '';
  return executable === 'tagit' || executable === 'tagit.mjs';
}

// Keep imports safe for tests; execute only when used as the CLI.
/* istanbul ignore next */
if (isCli(process.argv)) await runTagit(defaultDependencies, process.argv.slice(2));
