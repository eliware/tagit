export function requireExplicitReleaseVersion(options) {
  if (options.command === 'release' && !options.version)
    throw new Error('A specific release version is required. Use tagit release --version X.Y.Z.');
}
