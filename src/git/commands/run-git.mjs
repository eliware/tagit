export function runGit(execFileSync, args, options = {}) {
  return execFileSync('git', args, options);
}
