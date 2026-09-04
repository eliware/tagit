export function parseSemver(version, label = 'version') {
  if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) throw new Error(`Invalid ${label}: ${version}`);
  return version.split('.').map(Number);
}
