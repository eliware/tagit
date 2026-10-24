export function readNotesCommits(execFileSync, tag) {
  return execFileSync("git", ["log", "--oneline", "--decorate", `${tag}..HEAD`], {
    encoding: "utf8",
  }).trim();
}
