export function mergeUpstream(execFileSync, upstreamBranch, message, log) {
  try {
    execFileSync('git', ['merge', upstreamBranch, '-m', message], { stdio: 'inherit' });
  } catch {
    log.log('Merge conflicts detected. Files needing attention:');
    execFileSync('git', ['diff', '--name-only', '--diff-filter=U'], { stdio: 'inherit' });
    return false;
  }
  return true;
}
