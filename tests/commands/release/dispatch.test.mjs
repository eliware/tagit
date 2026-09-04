import { jest } from '@jest/globals';
import { runReleaseCommand } from '../../../src/commands/release/dispatch.mjs';

const base = () => ({
  fs: { existsSync: jest.fn(() => false), readFileSync: jest.fn() },
  execFileSync: jest.fn(), execFile: jest.fn(), log: { info: jest.fn() },
  gitOperations: jest.fn(), runPreflight: jest.fn(() => ({ test: { passed: true } })), verifyRelease: jest.fn(),
});

test('requires an explicit release version', async () => {
  await expect(runReleaseCommand({ command: 'release', version: null }, base())).rejects.toThrow('specific release version');
});

test('coordinates preflight output', async () => {
  const deps = base();
  const output = jest.fn();
  await runReleaseCommand({ command: 'preflight', ignore100x4: false }, { ...deps, output });
  expect(output).toHaveBeenCalledWith(expect.stringContaining('"ok":true'));
});

test('coordinates latest-tag release wait', async () => {
  const deps = base();
  deps.execFileSync.mockImplementation((command, args) => args[0] === 'describe' ? 'v1.2.3' : 'abc');
  await runReleaseCommand({ command: 'release-wait', version: null }, deps);
  expect(deps.verifyRelease).toHaveBeenCalled();
});

test('rejects a latest tag that is not a semantic release', async () => {
  const deps = base();
  deps.execFileSync.mockReturnValue('v-next');
  await expect(runReleaseCommand({ command: 'release-wait', version: null }, deps)).rejects.toThrow('not a semantic release tag');
});

test('rejects a tag and commit that change during release-wait resolution', async () => {
  const deps = base();
  deps.execFileSync.mockImplementation((command, args) => args[0] === 'describe' ? 'v1.2.3' : args[0] === 'rev-list' ? 'abc' : 'def');
  await expect(runReleaseCommand({ command: 'release-wait', version: null }, deps)).rejects.toThrow('changed while');
});

test('runs the prepared release transaction and verifies its tag', async () => {
  const deps = base();
  deps.fs.existsSync.mockImplementation(file => file === 'package.json');
  deps.fs.readFileSync.mockReturnValue(JSON.stringify({ version: '1.2.3' }));
  deps.gitOperations.mockReturnValue({ commitSha: 'abc', tag: 'v1.2.3' });
  await runReleaseCommand({ command: 'release', version: '1.2.3' }, deps);
  expect(deps.gitOperations).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.anything(), '1.2.3', { dryRun: undefined });
  expect(deps.verifyRelease).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.anything(), expect.objectContaining({ version: '1.2.3', linksOnly: true }));
});

test('forwards dry-run to the release transaction boundary', async () => {
  const deps = base();
  deps.fs.existsSync.mockImplementation(file => file === 'package.json');
  deps.fs.readFileSync.mockReturnValue(JSON.stringify({ version: '1.2.3' }));
  await runReleaseCommand({ command: 'release', version: '1.2.3', dryRun: true }, deps);
  expect(deps.gitOperations).not.toHaveBeenCalled();
});

test('blocks a package version mismatch and skips tag creation', async () => {
  const deps = base();
  deps.fs.existsSync.mockImplementation(file => file === 'package.json');
  deps.fs.readFileSync.mockReturnValue(JSON.stringify({ version: '1.2.2' }));
  await expect(runReleaseCommand({ command: 'release', version: '1.2.3' }, deps)).rejects.toThrow('does not match');
  expect(deps.gitOperations).not.toHaveBeenCalled();
});

test('keeps template releases validation-only after strict preflight', async () => {
  const deps = base();
  deps.fs.existsSync.mockImplementation(file => file === '.notag');
  await runReleaseCommand({ command: 'release', version: '1.2.3' }, deps);
  expect(deps.gitOperations).not.toHaveBeenCalled();
  expect(deps.verifyRelease).not.toHaveBeenCalled();
});
