import { isReleaseVersion } from "../../../versioning/is-release-version.mjs";

export function resolveLatestReleaseTag(execFileSync) {
  const tag = execFileSync("git", ["describe", "--tags", "--abbrev=0"]).toString().trim();
  const version = tag.replace(/^v/, "");
  if (!isReleaseVersion(version))
    throw new Error(`Latest tag is not a semantic release tag: ${tag}`);
  const tagRef = `refs/tags/${tag}`;
  const tagObject = execFileSync("git", ["rev-parse", tagRef]).toString().trim();
  const commitSha = execFileSync("git", ["rev-list", "-n", "1", tagObject]).toString().trim();
  const confirmedTagObject = execFileSync("git", ["rev-parse", tagRef]).toString().trim();
  if (tagObject !== confirmedTagObject)
    throw new Error(`Latest tag ${tag} changed while it was being resolved.`);
  return { version, commitSha };
}
