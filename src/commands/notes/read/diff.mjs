export default function readNotesDiff(execFileSync, tag) {
  try {
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
      { encoding: "utf8", maxBuffer: 48000 },
    ).trim();
  } catch (error) {
    if (error.code !== "ENOBUFS" || !error.stdout) throw error;
    return error.stdout.toString().trim();
  }
}
