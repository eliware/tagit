export function pushExistingCommits(execFileSync) {
  execFileSync('git', ['push'], { stdio: 'inherit' });
}
