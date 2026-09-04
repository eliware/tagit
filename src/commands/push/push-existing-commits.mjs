import { execFileSync as defaultExecFileSync } from 'node:child_process';

export function pushExistingCommits(execFileSync = defaultExecFileSync) {
  execFileSync('git', ['push'], { stdio: 'inherit' });
}
