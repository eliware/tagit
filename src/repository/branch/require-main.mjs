export function requireMain(branch) {
  return branch === "main"
    ? null
    : branch
      ? `BLOCKED: repository must use main. The current branch is ${branch}.`
      : "BLOCKED: repository is detached. Check out main.";
}
