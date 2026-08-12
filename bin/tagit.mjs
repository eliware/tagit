#!/usr/bin/env node
import { log as defaultLog, registerHandlers, registerSignals } from '@eliware/common';
import fsDefault from 'fs';
import { execSync as execSyncDefault } from 'child_process';
import path from 'path';
import { updateVersionFiles as updateVersionFilesDefault } from '../src/updateVersionFiles.mjs';
import { gitOperations as gitOperationsDefault } from '../src/gitOperations.mjs';

const defaultDependencies = {
  fs: fsDefault,
  execSync: execSyncDefault,
  log: defaultLog,
  updateVersionFiles: updateVersionFilesDefault,
  gitOperations: gitOperationsDefault,
  registerHandlersFn: registerHandlers,
  registerSignalsFn: registerSignals,
  exit: process.exit,
};

export async function runTagit(overrides = {}, argv = []) {
  const {
    fs, execSync, log, updateVersionFiles, gitOperations,
    registerHandlersFn, registerSignalsFn, exit,
  } = { ...defaultDependencies, ...overrides };
  if (isHelp(argv)) {
    (overrides.output ?? console.log)(helpText());
    return;
  }
  const dryRun = isDryRun(argv);
  registerHandlersFn({ log });
  registerSignalsFn({ log });

  try {
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
    const newVersion = dryRun
      ? await updateVersionFiles(fs, log, { dryRun: true })
      : await updateVersionFiles(fs, log);
    log.info(`${dryRun ? 'Dry run: would update version to' : 'Updated version to'} ${newVersion}`);
    if (dryRun) {
      gitOperations(execSync, fs, log, newVersion, { dryRun: true });
    } else {
      gitOperations(execSync, fs, log, newVersion);
    }
  } catch (error) {
    log.error(error);
    exit(1);
  }
}

export function getVersion(fs = fsDefault) {
  const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  return packageJson.version;
}

export function isVersion(argv) {
  return argv.includes('--version') || argv.includes('-v');
}

export function isHelp(argv) {
  return argv.includes('--help') || argv.includes('-h');
}

export function isDryRun(argv) {
  return argv.includes('--dry-run');
}

export function helpText() {
  return `Usage: tagit [options]\n\nOptions:\n  --dry-run  Preview the next version and run checks without releasing\n  -h, --help Show this help\n  -v, --version Show the installed tagit version`;
}

export function isCli(argv) {
  const executable = argv[1] ? path.basename(argv[1]) : '';
  return executable === 'tagit' || executable === 'tagit.mjs';
}

// Keep imports safe for tests; execute only when used as the CLI.
/* istanbul ignore next */
if (isCli(process.argv)) {
  if (isVersion(process.argv)) {
    console.log(getVersion());
  } else {
    await runTagit(defaultDependencies, process.argv.slice(2));
  }
}
