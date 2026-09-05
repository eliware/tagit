import { hasInstalledSharedHarness } from '../../../src/validation/local/installed-harness.mjs';
test('requires a real installed shared harness', () => { const fs = { existsSync: () => true, lstatSync: () => ({ isSymbolicLink: () => false }) }; expect(hasInstalledSharedHarness(fs, { name: 'demo', devDependencies: { '@eliware/test': '^4.0.0' } })).toBe(true); });
