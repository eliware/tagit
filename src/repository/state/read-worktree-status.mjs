export function readWorktreeStatus(execFileSync) { return String(execFileSync('git', ['status', '--short', '--untracked-files=all'], { encoding: 'utf8' })).trim(); }
