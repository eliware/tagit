export function readPackageName(fs) {
  if (!fs.existsSync('package.json')) return null;
  const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return typeof packageData?.name === 'string' ? packageData.name : null;
}
