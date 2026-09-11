export function validatePackageReleaseVersion(fs, version) {
  if (!fs.existsSync('package.json')) return;
  const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageData.version !== version)
    throw new Error(`package.json version ${packageData.version} does not match --version ${version}.`);
}
