import { readPackageName } from '../../registries/npm/read-package-name.mjs';

export function readPublicationTarget(fs) {
  const packageName = readPackageName(fs);
  if (!packageName) return { packageName: null, isPrivate: false };
  const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return { packageName, isPrivate: Boolean(packageData.private) };
}
