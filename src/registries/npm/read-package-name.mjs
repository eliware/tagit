export function readPackageName(fs) {
  if (!fs.existsSync('package.json')) return null;
  const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageData?.name ?? null;
}
