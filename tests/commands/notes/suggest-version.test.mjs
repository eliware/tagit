import { jest } from '@jest/globals';
import { suggestVersion } from '../../../src/commands/notes/suggest-version.mjs';

function fakeFs(version) { return { readFileSync: jest.fn(() => JSON.stringify({ version })) }; }
function gitRunner(describe, files, diff) { return jest.fn((_executable, args) => args[0] === 'describe' ? describe : args[1] === '--name-only' ? files : diff); }
test('uses injected Git arguments and suggests a patch', () => {
  const exec = jest.fn((_executable, args) => args[0] === 'describe' ? 'v1.2.3' : 'README.md\n');
  expect(suggestVersion(fakeFs('1.2.3'), exec)).toMatchObject({ latestTag: 'v1.2.3', suggested: '1.2.4' });
  expect(exec).toHaveBeenCalledWith('git', ['describe', '--tags', '--abbrev=0'], expect.any(Object));
});
test('ignores generated files and classifies minor and major changes', () => {
  expect(suggestVersion(fakeFs('1.2.3'), gitRunner('v1.2.3', 'package-lock.json\nREADME.md', ''))).toMatchObject({ level: 'patch', filesConsidered: 1 });
  expect(suggestVersion(fakeFs('1.2.3'), gitRunner('v1.2.3', 'src/a.mjs\nsrc/b.mjs\nsrc/c.mjs\nsrc/d.mjs\nsrc/e.mjs', '+'.repeat(250)))).toMatchObject({ level: 'minor', suggested: '1.3.0' });
  expect(suggestVersion(fakeFs('1.2.3'), gitRunner('v1.2.3', 'src/index.mjs', '+ export function changed() {}'))).toMatchObject({ level: 'major', suggested: '2.0.0' });
});
test('rejects an invalid current version', () => {
  expect(() => suggestVersion(fakeFs('next'), jest.fn())).toThrow('invalid current version');
});
