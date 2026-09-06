export function readCurrentBranch(execFileSync) {
  return String(execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' })).trim();
}
