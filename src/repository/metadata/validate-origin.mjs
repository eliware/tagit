export function validateOrigin(execFileSync, packageData) {
  try {
    const remote = String(execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' })).trim();
    const repository = String(packageData.repository?.url ?? '')
      .replace(/^git\+/, '')
      .replace(/\.git$/, '')
      .replace(/\/$/, '');
    const normalizedRemote = remote
      .replace(/\.git$/, '')
      .replace(/\/$/, '')
      .replace(/^git@github\.com:/, 'https://github.com/');
    return repository === normalizedRemote
      ? []
      : [`BLOCKED: package.json repository URL ${repository} does not match origin ${normalizedRemote}.`];
  } catch {
    return ['BLOCKED: cannot read Git origin to verify package repository metadata.'];
  }
}
