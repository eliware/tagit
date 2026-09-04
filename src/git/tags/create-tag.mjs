export function createTag(runGit, tag, commitSha, options = {}) {
  return runGit(['tag', tag, commitSha], { stdio: 'inherit', ...options });
}
