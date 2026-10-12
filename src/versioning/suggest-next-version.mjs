import { parseSemver } from "./parse-semver.mjs";

export function suggestNextVersion(version, level) {
  const parts = parseSemver(version);
  const index = level === "major" ? 0 : level === "minor" ? 1 : 2;
  parts[index] += 1;
  if (!Number.isSafeInteger(parts[index])) throw new Error(`Invalid version increment: ${version}`);
  if (index === 0) return `${parts[0]}.0.0`;
  if (index === 1) return `${parts[0]}.${parts[1]}.0`;
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}
