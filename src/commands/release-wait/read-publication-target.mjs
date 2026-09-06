import { readPackageName } from '../../registries/npm/read-package-name.mjs';

export function readPublicationTarget(fs) {
  if (!fs.existsSync('package.json')) return { applicable: false, packageName: null, isPrivate: null };
  const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const packageName = readPackageName(fs);
  if (!packageName && !packageData.private)
    throw new Error('Public package.json must declare a name for npm publication verification.');
  if (!packageName) return { applicable: true, packageName: null, isPrivate: true };
  if (typeof packageName !== 'string' || !/^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(packageName))
    throw new Error('package.json name is invalid for publication verification.');
  return { applicable: true, packageName, isPrivate: Boolean(packageData.private) };
}
