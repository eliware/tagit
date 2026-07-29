#!/usr/bin/env node
import { log as defaultLog, registerHandlers, registerSignals } from '@eliware/common';
import fsDefault from 'fs';
import { execSync as execSyncDefault } from 'child_process';
import { updateVersionFiles as updateVersionFilesDefault } from './src/updateVersionFiles.mjs';
import { gitOperations as gitOperationsDefault } from './src/gitOperations.mjs';

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

export async function runTagit(overrides) {
  const {
    fs, execSync, log, updateVersionFiles, gitOperations,
    registerHandlersFn, registerSignalsFn, exit,
  } = { ...defaultDependencies, ...overrides };
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
    const newVersion = await updateVersionFiles(fs, log);
    log.info(`Updated version to ${newVersion}`);
    gitOperations(execSync, fs, log, newVersion);
  } catch (error) {
    log.error(error);
    exit(1);
  }
}

export function isCli(argv) {
  return argv[1]?.endsWith('/tagit.mjs') ?? false;
}

// Keep imports safe for tests; execute only when used as the CLI.
/* istanbul ignore next */
if (isCli(process.argv)) {
  await runTagit(defaultDependencies);
}
