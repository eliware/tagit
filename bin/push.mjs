#!/usr/bin/env node
import { execFileSync as defaultExecFileSync } from 'node:child_process';

export function runPush(args = [], execFileSync, now = new Date()) {
  execFileSync('git', ['push'], { stdio: 'inherit' });
}

export function isCli(argv) {
  return argv[1]?.endsWith('/push') || argv[1]?.endsWith('/push.mjs');
}
