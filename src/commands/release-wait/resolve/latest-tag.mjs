import isReleaseVersion from "../../../versioning/is-release-version.mjs";
import verifyReleaseTagStability from "./tag-stability.mjs";

export default function resolveLatestReleaseTag(execFileSync) {
  const tags = execFileSync("git", ["tag", "--merged", "HEAD", "--sort=-version:refname"])
    .toString()
    .split(/\r?\n/)
    .map((tag) => tag.trim())
    .filter(Boolean);
  const tag = tags.find((candidate) => isReleaseVersion(candidate.replace(/^v/, "")));
  if (!tag) throw new Error(`Latest tag is not a semantic release tag: ${tags[0] ?? "none"}`);
  const version = tag.replace(/^v/, "");
  const tagRef = `refs/tags/${tag}`;
  const tagObject = execFileSync("git", ["rev-parse", tagRef]).toString().trim();
  const commitSha = execFileSync("git", ["rev-list", "-n", "1", tagObject]).toString().trim();
  verifyReleaseTagStability(execFileSync, tag, tagObject);
  return { version, commitSha };
}
