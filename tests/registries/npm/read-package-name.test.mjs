import { readPackageName } from '../../../src/registries/npm/read-package-name.mjs';

test('reads a package name when package metadata exists', () => { expect(readPackageName({ existsSync: () => true, readFileSync: () => '{"name":"demo"}' })).toBe('demo'); expect(readPackageName({ existsSync: () => true, readFileSync: () => '{}' })).toBeNull(); expect(readPackageName({ existsSync: () => false })).toBeNull(); });
