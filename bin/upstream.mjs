#!/usr/bin/env node
import { execSync as defaultExecSync } from 'node:child_process';

export function runUpstream(args = [], execSync, now = new Date(), log = console) {
  const message = args.length ? args.join(' ') : now.toISOString().replace('T', ' ').slice(0, 19);
  execSync('git fetch upstream', { stdio: 'inherit' });
  try {
    execSync(`git merge upstream/master -m ${JSON.stringify(message)}`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    return true;
  } catch {
    log.log('Merge conflicts detected. Files needing attention:');
    execSync('git diff --name-only --diff-filter=U', { stdio: 'inherit' });
    return false;
  }
}

export function isCli(argv) {
  return argv[1]?.endsWith('/upstream') || argv[1]?.endsWith('/upstream.mjs');
}
