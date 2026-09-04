export function resolveUpstreamBranch(execFileSync) {
  try {
    return execFileSync('git', ['symbolic-ref', '--short', 'refs/remotes/upstream/HEAD'], { encoding: 'utf8' }).trim() || 'upstream/main';
  } catch {
    return 'upstream/main';
  }
}
