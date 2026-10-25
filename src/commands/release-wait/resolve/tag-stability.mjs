export function verifyReleaseTagStability(execFileSync, tag, tagObject) {
  const confirmedTagObject = execFileSync("git", ["rev-parse", `refs/tags/${tag}`])
    .toString()
    .trim();
  if (tagObject !== confirmedTagObject)
    throw new Error(`Latest tag ${tag} changed while it was being resolved.`);
  return confirmedTagObject;
}
