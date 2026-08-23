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
  if (options.help || (!options.yes && !options.dryRun && !options.check)) {
    (overrides.output ?? console.log)(helpText());
    return;
  }
  const dryRun = options.dryRun;
  registerHandlersFn({ log });
  registerSignalsFn({ log });

  try {
    if (!options.check && !options.bumpVersion) {
      throw new Error('A specific release version is required. Use --bump X.Y.Z.');
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
    const preflight = runPreflight(execSync, fs, log, { ignore100x4: options.ignore100x4 });
    if (options.check) {
      log.info('Preflight complete');
      (overrides.output ?? console.log)(JSON.stringify({ ok: true, checks: preflight }));
      return;
    }
    const versionOptions = { targetVersion: options.bumpVersion };
    const newVersion = dryRun
      ? await updateVersionFiles(fs, log, { dryRun: true, ...versionOptions })
      : await updateVersionFiles(fs, log, versionOptions);
    log.info(`${dryRun ? 'Dry run: would update version to' : 'Updated version to'} ${newVersion}`);
    if (dryRun) {
      gitOperations(execSync, fs, log, newVersion, { dryRun: true, skipChecks: true });
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

export function isCheck(argv) {
  return argv.includes('--check');
}

export function isIgnore100x4(argv) {
  return argv.includes('--ignore-100x4');
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
    check: isCheck(argv),
    yes: isYes(argv),
    ignore100x4: isIgnore100x4(argv),
    bumpVersion: getBumpVersion(argv),
  };
}

export function helpText() {
  return `Usage: tagit [options]\n\nOptions:\n  -y, --yes  Run the release (required for changes, commit, tag, and push)\n  --check   Run preflight checks only\n  --dry-run  Run preflight and preview the release without changing files\n  --ignore-100x4  Explicitly waive strict 100x4 coverage\n  -b, --bump <version>  Use an explicit version; omit to auto-calculate\n  -h, --help Show this help\n  -v, --version Show the installed tagit version\n\nA bare tagit command displays this help.`;
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
