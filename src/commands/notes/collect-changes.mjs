import { formatDiffExcerpt } from "./format-diff-excerpt.mjs";

export function collectNotesChanges(execFileSync, tag) {
  // codescope ignore: separate Git queries keep the notes report fields independently bounded and readable.
  const command = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();
  const commits = command(["log", "--oneline", "--decorate", `${tag}..HEAD`]);
  const files = command(["diff", "--name-status", `${tag}..HEAD`, "--"]);
  const diff = command([
    "diff",
    `${tag}..HEAD`,
    "--",
    ".",
    ":!package-lock.json",
    ":!coverage",
    ":!node_modules",
    ":!**/.jest-result",
    ":!**/.jest.result",
  ]);
  return { commits, files, excerpt: formatDiffExcerpt(diff) };
}
