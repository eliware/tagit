export default function selectReleaseRunBranches(tag) {
  return [tag, `refs/tags/${tag}`];
}
