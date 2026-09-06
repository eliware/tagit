export function validateReleaseVersion(fs, packageData) {
  const heading = fs.readFileSync('RELEASE_NOTES.md', 'utf8').match(/^##\s+(?:\[)?(\d+\.\d+\.\d+)(?:\])?/m)?.[1];
  return heading === packageData.version
    ? []
    : [
        `BLOCKED: package.json version ${packageData.version} does not match the current RELEASE_NOTES.md heading ${heading ?? '(none)'}.`,
      ];
}
