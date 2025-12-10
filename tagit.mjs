#!/usr/bin/env node
import 'dotenv/config';
import { log, registerHandlers, registerSignals } from '@eliware/common';
import fs from 'fs';
import { execSync } from 'child_process';
import { updateVersionFiles } from './src/updateVersionFiles.mjs';
import { gitOperations } from './src/gitOperations.mjs';

(async () => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  // Register handlers/signals so logging and cleanup are available
  registerHandlers({ log });
  registerSignals({ log });

  // Early abort: if a .notag file exists in the repo root, stop the process.
  // This allows temporarily preventing tagging/commits without changing scripts.
  try {
    if (fs.existsSync('.notag')) {
      log.warn('.notag file detected — aborting tag/release process.');
      process.exit(0);
    }
  } catch (err) {
    log.error('Error checking for .notag file:', err);
    process.exit(1);
  }

  log.info('tagit Started');

  try {
    const newVersion = await updateVersionFiles(fs, log);
    log.info(`Updated version to ${newVersion}`);
    gitOperations(execSync, fs, log, newVersion);
  } catch (error) {
    log.error(error);
    process.exit(1);
  }
})();
