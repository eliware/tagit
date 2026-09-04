export function pushTag(runGit, tag, options = {}) {
  return runGit(['push', 'origin', tag], { stdio: 'inherit', ...options });
}
