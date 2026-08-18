#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { runPreflight, waitForGitHubRun } from '../src/releaseChecks.mjs';

const args = process.argv.slice(2);
const runIdIndex = args.indexOf('--run-id');
const runId = runIdIndex === -1 ? null : args[runIdIndex + 1];
const ignore100x4 = args.includes('--ignore-100x4');

try {
  if (runId) {
    await waitForGitHubRun(execSync, console, { runId });
  } else {
    const result = runPreflight(execSync, fs, console, { ignore100x4 });
    console.log(JSON.stringify({ ok: true, checks: result }));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
