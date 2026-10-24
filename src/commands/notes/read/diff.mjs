export function readNotesDiff(execFileSync, tag) {
  return execFileSync(
    "git",
    [
      "diff",
      `${tag}..HEAD`,
      "--",
      ".",
      ":!package-lock.json",
      ":!coverage",
      ":!node_modules",
      ":!**/.jest-result",
      ":!**/.jest.result",
    ],
    { encoding: "utf8" },
  ).trim();
}
