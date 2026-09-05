import { validateReleaseInput } from '../../../src/commands/release-wait/validate-release-input.mjs';
test('accepts valid release input and polling settings', () => expect(() => validateReleaseInput('1.2.3', { commitSha: 'abc' }, 30, 30, 10000, 10000)).not.toThrow());
test('rejects invalid release input', () => expect(() => validateReleaseInput('bad', { commitSha: 'abc' }, 30, 30, 10000, 10000)).toThrow('version and commit SHA'));
