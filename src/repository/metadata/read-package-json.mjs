export function readPackageJson(fs) {
  return JSON.parse(fs.readFileSync('package.json', 'utf8'));
}
