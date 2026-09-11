import { jest } from '@jest/globals';
import { runReleaseCommand } from '../../../src/commands/release/run-release.mjs';
import { runTagit } from '../../../src/cli/application/run-tagit.mjs';
import packageData from '../../../package.json' with { type: 'json' };

const base = () => ({
  options: { version: '1.2.3', dryRun: false },
  fs: { existsSync: () => false },
  execFileSync: jest.fn(),
  execFile: jest.fn(),
  log: { info: jest.fn() },
  gitOperations: jest.fn(() => ({ commitSha: 'abc' })),
  verifyRelease: jest.fn(),
});

test('CLI release boundary forwards explicit version and waiver', async () => {
  const gitOperations = jest.fn();
  const runPreflight = jest.fn(() => ({ test: { passed: true } }));
  await runTagit(
    {
      gitOperations,
      runPreflight,
      verifyRelease: jest.fn(),
      log: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      registerHandlersFn: jest.fn(),
      registerSignalsFn: jest.fn(),
    },
    ['release', '--version', packageData.version, '--ignore-100x4'],
  );
  expect(runPreflight).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.objectContaining({ ignore100x4: true }),
  );
});

test('CLI release boundary blocks before git when preflight fails', async () => {
  const gitOperations = jest.fn();
  await expect(
    runTagit(
      {
        gitOperations,
        runPreflight: jest.fn(() => {
          throw new Error('preflight failed');
        }),
        log: { error: jest.fn() },
        exit: jest.fn(),
        registerHandlersFn: jest.fn(),
        registerSignalsFn: jest.fn(),
      },
      ['release', '--version', packageData.version],
    ),
  ).rejects.toThrow('preflight failed');
  expect(gitOperations).not.toHaveBeenCalled();
});
test('runs the tag operation and release verification', async () => {
  const deps = base();
  await runReleaseCommand(deps);
  expect(deps.gitOperations).toHaveBeenCalledWith(expect.anything(), deps.fs, deps.log, '1.2.3', { dryRun: false });
  expect(deps.verifyRelease).toHaveBeenCalledWith(
    expect.anything(),
    deps.fs,
    deps.log,
    expect.objectContaining({ version: '1.2.3', linksOnly: true }),
  );
});
test('keeps dry-run and template releases non-mutating', async () => {
  const dry = base();
  dry.options.dryRun = true;
  await runReleaseCommand(dry);
  expect(dry.gitOperations).not.toHaveBeenCalled();
  const template = base();
  template.fs.existsSync = () => true;
  await runReleaseCommand(template);
  expect(template.gitOperations).not.toHaveBeenCalled();
});
test('blocks a package version mismatch', async () => {
  const deps = base();
  deps.fs.existsSync = (file) => file === 'package.json';
  deps.fs.readFileSync = () => JSON.stringify({ version: '9.9.9' });
  await expect(runReleaseCommand(deps)).rejects.toThrow('does not match');
});
