export function pushReleaseRefs(runGit, tag) {
  return runGit(["push", "--atomic", "origin", "HEAD:refs/heads/main", `refs/tags/${tag}`], {
    stdio: "inherit",
  });
}
