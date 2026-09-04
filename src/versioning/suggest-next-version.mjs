import { parseSemver } from './parse-semver.mjs';

export function suggestNextVersion(version, level) {
  const [major, minor, patch] = parseSemver(version);
  if (level === 'major') return `${major + 1}.0.0`;
  if (level === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}
