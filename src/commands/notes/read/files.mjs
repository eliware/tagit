export function readNotesFiles(execFileSync, tag) {
  return execFileSync("git", ["diff", "--name-status", `${tag}..HEAD`, "--"], {
    encoding: "utf8",
  }).trim();
}
