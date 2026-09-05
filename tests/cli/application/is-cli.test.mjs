import { isCli } from '../../../src/cli/application/is-cli.mjs';
test('recognizes supported executable names', () => { expect(isCli(['node', 'tagit'])).toBe(true); expect(isCli(['node', 'tagit.mjs'])).toBe(true); expect(isCli(['node', 'other.mjs'])).toBe(false); });
