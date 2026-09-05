export function invokesEliwareTest(script) {
  return /(?:^|\s)(?:node(?:\.exe)?\s+)?(?:[^\s;&|]*[/\\])?eliware-test(?:\.mjs)?(?:\s|$)/i.test(String(script));
}

export function buildTestCheck(fs, { ignore100x4 = false, ignoreMonolithLimits = false } = {}) {
  if (!fs.existsSync('package.json')) return { missing: false, check: null };
  const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageData.scripts?.test) return { missing: true, check: null };
  const validScript = packageData.name === '@eliware/test'
    ? invokesEliwareTest(packageData.scripts.test)
    : String(packageData.scripts.test).trim() === 'eliware-test';
  if (!validScript || !hasInstalledSharedHarness(fs, packageData)) return { missing: false, invalid: true, check: null };
  const wrapperArguments = testWaiverArguments({ ignore100x4, ignoreMonolithLimits });
  return { missing: false, check: ['test', ['npm', ['test', ...wrapperArguments]]] };
}
import { hasInstalledSharedHarness } from './installed-harness.mjs';
import { testWaiverArguments } from './test-waiver-arguments.mjs';
