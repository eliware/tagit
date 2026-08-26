#!/usr/bin/env node
import { execSync as defaultExecSync } from 'node:child_process';

export function runPush(args = [], execSync, now = new Date()) {
  execSync('git push', { stdio: 'inherit' });
}

export function isCli(argv) {
  return argv[1]?.endsWith('/push') || argv[1]?.endsWith('/push.mjs');
}
