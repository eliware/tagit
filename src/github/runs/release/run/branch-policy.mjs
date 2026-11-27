export default function selectReleaseRunBranches(tag) {
  return ["main", tag, `refs/tags/${tag}`];
}
