export function requireMain(branch) {
  return branch === 'main'
    ? null
    : branch
      ? `BLOCKED: repository must be on main; current branch is ${branch}.`
      : 'BLOCKED: repository is detached; check out main.';
}
