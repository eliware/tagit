export function buildTestCheck(fs, ignore100x4 = false) {
  if (!fs.existsSync('package.json')) return { missing: false, check: null };
  const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageData.scripts?.test) return { missing: true, check: null };
  return { missing: false, check: ['test', ['npm', ['test', ...(ignore100x4 ? ['--', '--ignore-100x4'] : [])]]] };
}
