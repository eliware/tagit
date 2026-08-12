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
  const options = parseOptions(argv);
  if (options.help || (!options.yes && !options.dryRun)) {
    (overrides.output ?? console.log)(helpText());
    return;
  }
  const dryRun = options.dryRun;
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
    const versionOptions = options.bumpVersion ? { targetVersion: options.bumpVersion } : {};
    const newVersion = dryRun
      ? await updateVersionFiles(fs, log, { dryRun: true, ...versionOptions })
      : options.bumpVersion
        ? await updateVersionFiles(fs, log, versionOptions)
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

export function isYes(argv) {
  return argv.includes('--yes') || argv.includes('-y');
}

export function getBumpVersion(argv) {
  const index = argv.findIndex((argument) => argument === '-b' || argument === '--bump');
  if (index === -1) return null;
  const value = argv[index + 1];
  if (!value || value.startsWith('-')) return null;
  if (!/^\d+(?:\.\d+)+$/.test(value)) {
    throw new Error(`Invalid bump version: ${value}`);
  }
  return value;
}

export function parseOptions(argv) {
  return {
    help: isHelp(argv),
    dryRun: isDryRun(argv),
    yes: isYes(argv),
    bumpVersion: getBumpVersion(argv),
  };
}

export function helpText() {
  return `Usage: tagit [options]\n\nOptions:\n  -y, --yes  Run the release (required for changes, commit, tag, and push)\n  --dry-run  Preview the next version and run checks without releasing\n  -b, --bump <version>  Use an explicit version; omit to auto-calculate\n  -h, --help Show this help\n  -v, --version Show the installed tagit version\n\nA bare tagit command displays this help.`;
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
  } else await runTagit(defaultDependencies, process.argv.slice(2));
}
