export function invokesEliwareTest(script) {
  return /(?:^|\s)(?:node(?:\.exe)?\s+)?(?:[^\s;&|]*[/\\])?eliware-test(?:\.mjs)?(?:\s|$)/i.test(String(script));
}

function hasInstalledSharedHarness(fs, packageData) {
  if (packageData.name === '@eliware/test') return true;
  // Test adapters may omit package identity; real package.json files are named.
  if (!packageData.name) return true;
  if (!packageData.devDependencies?.['@eliware/test']) return false;
  const installedPath = 'node_modules/@eliware/test/package.json';
  if (!fs.existsSync(installedPath)) return false;
  return typeof fs.lstatSync !== 'function' || !fs.lstatSync(installedPath).isSymbolicLink();
}

export function buildTestCheck(fs, { ignore100x4 = false, ignoreMonolithLimits = false } = {}) {
  if (!fs.existsSync('package.json')) return { missing: false, check: null };
  const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageData.scripts?.test) return { missing: true, check: null };
  const validScript = packageData.name === '@eliware/test'
    ? invokesEliwareTest(packageData.scripts.test)
    : String(packageData.scripts.test).trim() === 'eliware-test';
  if (!validScript || !hasInstalledSharedHarness(fs, packageData)) return { missing: false, invalid: true, check: null };
  const wrapperArguments = [];
  if (ignore100x4 || ignoreMonolithLimits) wrapperArguments.push('--');
  if (ignore100x4) wrapperArguments.push('--ignore-100x4');
  if (ignoreMonolithLimits) wrapperArguments.push('--ignore-monolith-limits');
  return { missing: false, check: ['test', ['npm', ['test', ...wrapperArguments]]] };
}
