import { jest } from '@jest/globals';
import { suggestVersion } from '../src/versionSuggestion.mjs';

function fakeFs(version) {
  return { readFileSync: jest.fn(() => JSON.stringify({ version })) };
}

test('uses shell-free Git arguments when injected', () => {
  const execFileSync = jest.fn((executable, args) => args[0] === 'describe' ? 'v1.2.3' : 'README.md\n');
  expect(suggestVersion(jest.fn(), fakeFs('1.2.3'), execFileSync)).toMatchObject({ latestTag: 'v1.2.3', suggested: '1.2.4' });
  expect(execFileSync).toHaveBeenCalledWith('git', ['describe', '--tags', '--abbrev=0'], expect.any(Object));
});

test('suggests a patch for small changes and ignores generated files', () => {
  const exec = jest.fn(command => command.startsWith('git describe') ? 'v1.2.3' : 'package-lock.json\nREADME.md');
  expect(suggestVersion(exec, fakeFs('1.2.3'))).toMatchObject({ level: 'patch', suggested: '1.2.4', filesConsidered: 1 });
});

test('suggests a minor version for substantial implementation changes', () => {
  const exec = jest.fn(command => command.startsWith('git describe') ? 'v1.2.3' : command.startsWith('git diff --name')
    ? 'src/a.mjs\nsrc/b.mjs\nsrc/c.mjs\nsrc/d.mjs\nsrc/e.mjs' : '+'.repeat(250));
  expect(suggestVersion(exec, fakeFs('1.2.3'))).toMatchObject({ level: 'minor', suggested: '1.3.0' });
});

test('suggests a major version for explicit breaking indicators', () => {
  const exec = jest.fn(command => command.startsWith('git describe') ? 'v1.2.3' : command.startsWith('git diff --name')
    ? 'src/index.mjs' : '+ export function changed() {}');
  expect(suggestVersion(exec, fakeFs('1.2.3'))).toMatchObject({ level: 'major', suggested: '2.0.0' });
});

test('rejects an invalid current version', () => {
  expect(() => suggestVersion(jest.fn(), fakeFs('next'))).toThrow('invalid current version');
});
