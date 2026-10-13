export function resolveLatestReleaseTag(execFileSync) {
  const tag = execFileSync("git", ["describe", "--tags", "--abbrev=0"]).toString().trim();
  const version = tag.replace(/^v/, "");
  if (!/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(version))
    throw new Error(`Latest tag is not a semantic release tag: ${tag}`);
  const tagRef = `refs/tags/${tag}^{}`;
  const commitSha = execFileSync("git", ["rev-parse", tagRef]).toString().trim();
  const confirmedSha = execFileSync("git", ["rev-parse", tagRef]).toString().trim();
  if (commitSha !== confirmedSha)
    throw new Error(`Latest tag ${tag} changed while it was being resolved.`);
  return { version, commitSha };
}
