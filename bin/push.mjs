#!/usr/bin/env node
import { execFileSync as defaultExecFileSync } from 'node:child_process';

export function runPush(args = [], execFileSync = defaultExecFileSync, now = new Date()) {
  // The public tagit push command owns CI-link reporting; this low-level helper only pushes.
  execFileSync('git', ['push'], { stdio: 'inherit' });
}

export function isCli(argv) {
  return argv[1]?.endsWith('/push') || argv[1]?.endsWith('/push.mjs');
}
