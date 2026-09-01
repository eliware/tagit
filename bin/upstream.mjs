#!/usr/bin/env node
import { execFileSync as defaultExecFileSync } from 'node:child_process';

export function runUpstream(args = [], execFileSync = defaultExecFileSync, now = new Date(), log = console) {
  const message = args.length ? args.join(' ') : now.toISOString().replace('T', ' ').slice(0, 19);
  execFileSync('git', ['fetch', 'upstream'], { stdio: 'inherit' });
  try {
    execFileSync('git', ['merge', 'upstream/master', '-m', message], { stdio: 'inherit' });
  } catch {
    log.log('Merge conflicts detected. Files needing attention:');
    execFileSync('git', ['diff', '--name-only', '--diff-filter=U'], { stdio: 'inherit' });
    return false;
  }
  execFileSync('git', ['push'], { stdio: 'inherit' });
  return true;
}

export function isCli(argv) {
  return argv[1]?.endsWith('/upstream') || argv[1]?.endsWith('/upstream.mjs');
}
