import { parseSemver } from './parse-semver.mjs';

export function readPackageVersion(fs) {
  const current = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  try { parseSemver(current); } catch { throw new Error(`Cannot suggest a version from invalid current version: ${current}`); }
  return current;
}
