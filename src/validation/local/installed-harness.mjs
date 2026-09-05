export function hasInstalledSharedHarness(fs, packageData) {
  if (packageData.name === '@eliware/test' || !packageData.name) return true;
  if (!packageData.devDependencies?.['@eliware/test']) return false;
  const installedPath = 'node_modules/@eliware/test/package.json';
  return fs.existsSync(installedPath) && (typeof fs.lstatSync !== 'function' || !fs.lstatSync(installedPath).isSymbolicLink());
}
