#!/usr/bin/env node
import { execSync as defaultExecSync } from 'node:child_process';

export function runPush(args = [], execSync, now = new Date()) {
  const message = args.length ? args.join(' ') : `Pushed ${now.toISOString().replace('T', ' ').slice(0, 19)}`;
  execSync('git add .', { stdio: 'inherit' });
  try {
    execSync('git diff --cached --quiet');
  } catch {
    execSync(`git commit -m ${JSON.stringify(message)}`, { stdio: 'inherit' });
  }
  execSync('git push', { stdio: 'inherit' });
}

export function isCli(argv) {
  return argv[1]?.endsWith('/push') || argv[1]?.endsWith('/push.mjs');
}

/* istanbul ignore next */
if (isCli(process.argv)) runPush(process.argv.slice(2), defaultExecSync);
