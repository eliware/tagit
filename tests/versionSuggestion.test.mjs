import { jest } from '@jest/globals';
import { suggestVersion } from '../src/versionSuggestion.mjs';

function fakeFs(version) {
  return { readFileSync: jest.fn(() => JSON.stringify({ version })) };
}

function gitRunner(describe, files, diff) {
  return jest.fn((executable, args) => args[0] === 'describe' ? describe : args[1] === '--name-only' ? files : diff);
}

test('uses shell-free Git arguments when injected', () => {
  const execFileSync = jest.fn((executable, args) => args[0] === 'describe' ? 'v1.2.3' : 'README.md\n');
  expect(suggestVersion(fakeFs('1.2.3'), execFileSync)).toMatchObject({ latestTag: 'v1.2.3', suggested: '1.2.4' });
  expect(execFileSync).toHaveBeenCalledWith('git', ['describe', '--tags', '--abbrev=0'], expect.any(Object));
});

test('suggests a patch for small changes and ignores generated files', () => {
  expect(suggestVersion(fakeFs('1.2.3'), gitRunner('v1.2.3', 'package-lock.json\nREADME.md', ''))).toMatchObject({ level: 'patch', suggested: '1.2.4', filesConsidered: 1 });
});

test('suggests a minor version for substantial implementation changes', () => {
  expect(suggestVersion(fakeFs('1.2.3'), gitRunner('v1.2.3', 'src/a.mjs\nsrc/b.mjs\nsrc/c.mjs\nsrc/d.mjs\nsrc/e.mjs', '+'.repeat(250)))).toMatchObject({ level: 'minor', suggested: '1.3.0' });
});

test('suggests a major version for explicit breaking indicators', () => {
  expect(suggestVersion(fakeFs('1.2.3'), gitRunner('v1.2.3', 'src/index.mjs', '+ export function changed() {}'))).toMatchObject({ level: 'major', suggested: '2.0.0' });
});

test('rejects an invalid current version', () => {
  expect(() => suggestVersion(fakeFs('next'), jest.fn())).toThrow('invalid current version');
});
