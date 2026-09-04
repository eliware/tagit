import { jest } from '@jest/globals';
import { runReleaseCommand } from '../../../src/commands/release/run-release.mjs';

const base = () => ({ options: { version: '1.2.3', dryRun: false }, fs: { existsSync: () => false }, execFileSync: jest.fn(), execFile: jest.fn(), log: { info: jest.fn() }, gitOperations: jest.fn(() => ({ commitSha: 'abc' })), verifyRelease: jest.fn() });
test('runs the tag operation and release verification', async () => {
  const deps = base();
  await runReleaseCommand(deps);
  expect(deps.gitOperations).toHaveBeenCalledWith(expect.anything(), deps.fs, deps.log, '1.2.3', { dryRun: false });
  expect(deps.verifyRelease).toHaveBeenCalledWith(expect.anything(), deps.fs, deps.log, expect.objectContaining({ version: '1.2.3', linksOnly: true }));
});
test('keeps dry-run and template releases non-mutating', async () => {
  const dry = base(); dry.options.dryRun = true;
  await runReleaseCommand(dry);
  expect(dry.gitOperations).not.toHaveBeenCalled();
  const template = base(); template.fs.existsSync = () => true;
  await runReleaseCommand(template);
  expect(template.gitOperations).not.toHaveBeenCalled();
});
test('blocks a package version mismatch', async () => {
  const deps = base(); deps.fs.existsSync = file => file === 'package.json'; deps.fs.readFileSync = () => JSON.stringify({ version: '9.9.9' });
  await expect(runReleaseCommand(deps)).rejects.toThrow('does not match');
});
