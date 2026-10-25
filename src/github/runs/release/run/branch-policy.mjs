export function selectReleaseRunBranches(tag) {
  return [tag, `refs/tags/${tag}`];
}
