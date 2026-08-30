import { jest } from '@jest/globals';
import { hasStrict100x4, processCommand, resolveExecutable, runPreflight, verifyLatestCi } from '../src/releaseChecks.mjs';

const isNodeNpm = (executable, args) => (executable === 'npm' || executable === 'npm.cmd' || executable === process.execPath && args.some(arg => arg.endsWith('npm-cli.js')));
const expectNpmCall = (mock, expectedArgs) => {
  expect(mock.mock.calls.some(([executable, args]) => isNodeNpm(executable, args) && expectedArgs.every(arg => args.includes(arg)))).toBe(true);
};

test('uses shell-free GitHub CLI arguments for CI inspection', () => {
  const execSync = jest.fn();
  const execFileSync = jest.fn((executable, args) => {
    if (args[1] === 'list') return JSON.stringify([{ databaseId: 7, status: 'completed', conclusion: 'success', headSha: 'abc', url: 'https://ci' }]);
    return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'Ubuntu', status: 'completed', conclusion: 'success' },
      { name: 'Windows', status: 'completed', conclusion: 'success' },
    ] });
  });
  expect(verifyLatestCi(execFileSync, { info: jest.fn() }, { headSha: 'abc', repository: 'eliware/tagit' }))
    .toMatchObject({ ubuntu: true, windows: true });
  expect(execFileSync).toHaveBeenCalledWith('gh', ['run', 'list', '--commit', 'abc', '--repo', 'eliware/tagit', '--limit', '20', '--json', 'databaseId,status,conclusion,headSha,url'], expect.any(Object));
});

test('resolves platform-specific npm executable names', () => {
  expect(resolveExecutable('npm', 'win32')).toBe('npm.cmd');
  expect(resolveExecutable('npm', 'linux')).toBe('npm');
  expect(resolveExecutable('git', 'win32')).toBe('git');
});

test('maps Windows npm checks through the Node npm CLI', () => {
  expect(processCommand('npm', ['test'], 'win32', 'C:\\node\\node.exe')).toEqual([
    'C:\\node\\node.exe',
    ['C:\\node\\node_modules\\npm\\bin\\npm-cli.js', 'test'],
  ]);
});

test('keeps non-Windows process commands unchanged', () => {
  expect(processCommand('npm', ['test'], 'linux', '/usr/bin/node')).toEqual([resolveExecutable('npm'), ['test']]);
});

test('strict preflight validates repository ownership gates', () => {
  const execSync = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'status') return '';
    if (executable === 'git' && args[0] === 'branch') return 'main';
    if (executable === 'git' && args[0] === 'ls-files') return 'package.json\nREADME.md\nRELEASE_NOTES.md';
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') return 'All files 100 100 100 100';
    return '';
  });
  const fs = { existsSync: jest.fn(() => true), readFileSync: jest.fn(() => JSON.stringify({ name: 'x', version: '1.0.0', description: 'x', license: 'MIT', scripts: { test: 'test' } })) };
  expect(runPreflight(execSync, fs, { info: jest.fn() }, { strictRepository: true })).toHaveProperty('test.passed', true);
});

test('strict preflight reports branch, required files, metadata, and tracked secrets', () => {
  const execSync = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'status') return '';
    if (executable === 'git' && args[0] === 'branch') return 'feature/x';
    if (executable === 'git' && args[0] === 'ls-files') return '.env\ncredentials.json';
    return isNodeNpm(executable, args) && args.at(-1) === 'test' ? 'All files 100 100 100 100' : '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() }, { strictRepository: true })).toThrow(/main[\s\S]*required repository file[\s\S]*metadata[\s\S]*secret-looking/);
});

test('strict preflight reports validation command and metadata failures', () => {
  const base = (executable, args) => {
    if (executable === 'git' && (args[0] === 'branch' || args[0] === 'ls-files')) throw new Error('inspection failed');
    return isNodeNpm(executable, args) && args.at(-1) === 'test' ? 'All files 100 100 100 100' : '';
  };
  const fs = { existsSync: jest.fn(() => false), readFileSync: jest.fn(() => '{bad') };
  expect(() => runPreflight(jest.fn(base), fs, { info: jest.fn() }, { strictRepository: true })).toThrow(/branch validation[\s\S]*package metadata validation[\s\S]*tracked-file validation/);
  const detached = jest.fn((executable, args) => isNodeNpm(executable, args) && args.at(-1) === 'test' ? 'All files 100 100 100 100' : '');
  expect(() => runPreflight(detached, { existsSync: jest.fn(() => true), readFileSync: jest.fn(() => JSON.stringify({ name: 'x', version: '1', description: 'x', license: 'MIT', scripts: { test: 'test' } })) }, { info: jest.fn() }, { strictRepository: true })).toThrow('detached');
});

test('detects strict 100x4 coverage', () => {
  expect(hasStrict100x4('All files     100     100     100     100')).toBe(true);
  expect(hasStrict100x4('All files                |     100 |      100 |     100 |     100 |')).toBe(true);
  expect(hasStrict100x4('All files      99     100     100     100')).toBe(false);
});

test('reports bounded and empty command output', () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') return 'x'.repeat(5000);
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('output truncated');
});

test('reports an empty output excerpt when a command exits unsuccessfully', () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') throw new Error('test failed');
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('Output: (no output captured)');
});

test('preflight runs clean-tree, test, lint, and audit gates', () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') return 'All files     100     100     100     100';
    return '';
  });
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'jest', audit: 'audit' } })),
  };
  const log = { info: jest.fn() };

  const result = runPreflight(execSync, fs, log);

  expect(result.test.passed).toBe(true);
  expectNpmCall(execSync, ['run', 'lint']);
  expectNpmCall(execSync, ['audit', '--omit=dev', '--audit-level=moderate']);
});

test('uses the injected shell-free runner for local checks', () => {
  const execSync = jest.fn(() => '');
  const execFileSync = jest.fn((executable, args) => args[0] === 'status' ? '' : 'All files | 100 | 100 | 100 | 100 |');
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  const result = runPreflight(execFileSync, fs, { info: jest.fn() });
  expect(result.test.passed).toBe(true);
  expectNpmCall(execFileSync, ['test']);
});

test('preflight rejects dirty trees before running package commands', () => {
  const execSync = jest.fn(() => ' M package.json\n');
  const fs = { existsSync: jest.fn(() => false) };

  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('uncommitted changes are present');
  expect(execSync).toHaveBeenCalledTimes(4);
});

test('preflight blocks CI evidence when the worktree is dirty', () => {
  const execSync = jest.fn((executable, args) => executable === 'git' && args[0] === 'status' ? ' M file.js\n' : '');
  const fs = { existsSync: jest.fn(() => false) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() }, { verifyCi: true }))
    .toThrow('uncommitted changes are present');
});

test('preflight honors an explicit 100x4 waiver and audit fallback', () => {
  const execSync = jest.fn((executable, args) => executable === 'git' && args[0] === 'status' ? '' : 'not 100x4');
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'jest' } })),
  };

  expect(runPreflight(execSync, fs, { info: jest.fn() }, { ignore100x4: true })).toHaveProperty('test.passed', true);
  expectNpmCall(execSync, ['test']);
  expectNpmCall(execSync, ['audit', '--omit=dev', '--audit-level=moderate']);
});

test('preflight blocks missing strict 100x4 coverage', () => {
  const execSync = jest.fn(() => '');
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'jest' } })),
  };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('100×4 coverage');
});

test('preflight reports command failures and allows template releases', () => {
  const fs = { existsSync: jest.fn(() => false) };
  const failingExec = jest.fn((executable, args) => isNodeNpm(executable, args) && args.at(-2) === 'run' && args.at(-1) === 'lint' ? (() => { throw { stdout: 'bad', stderr: 'lint' }; })() : '');
  expect(() => runPreflight(failingExec, fs, { info: jest.fn() })).toThrow('lint failed');
  expect(() => runPreflight(jest.fn(() => ''), { existsSync: jest.fn(() => true), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) }, { info: jest.fn() }))
    .toThrow('Preflight found 1 issue');
});

test('preflight supports projects without a test script', () => {
  const execSync = jest.fn(() => '');
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { audit: 'audit' } })),
  };
  expect(runPreflight(execSync, fs, { info: jest.fn() })).toHaveProperty('audit.passed', true);
});

test('preflight handles failures without captured output', () => {
  const execSync = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'status') return '';
    throw new Error('failed');
  });
  expect(() => runPreflight(execSync, { existsSync: jest.fn(() => false) }, { info: jest.fn() }))
    .toThrow('lint failed');
});

test('verifies a successful exact-head CI run on Ubuntu and Windows', () => {
  const execSync = jest.fn((executable, args) => {
    if (executable === 'gh' && args[0] === 'run' && args[1] === 'list') return JSON.stringify([
      { databaseId: 42, status: 'completed', conclusion: 'success', headSha: 'abc' },
    ]);
    return JSON.stringify({ headSha: 'abc', jobs: [
      { name: 'Test (ubuntu-latest)', status: 'completed', conclusion: 'success' },
      { name: 'Test (windows-latest)', status: 'completed', conclusion: 'success' },
    ] });
  });
  expect(verifyLatestCi(execSync, { info: jest.fn() }, { headSha: 'abc', repository: 'eliware/tagit' }))
    .toEqual({ runId: 42, headSha: 'abc', ubuntu: true, windows: true });
});

test('rejects missing, malformed, unsuccessful, stale, and incomplete CI evidence', () => {
  expect(() => verifyLatestCi(jest.fn(), { info: jest.fn() })).toThrow('commit SHA is required');
  expect(() => verifyLatestCi(jest.fn(() => '{bad'), { info: jest.fn() }, { headSha: 'abc' }))
    .toThrow('Unable to inspect');
  const noRun = jest.fn(() => '[]');
  expect(() => verifyLatestCi(noRun, { info: jest.fn() }, { headSha: 'abc' })).toThrow('No successful');
  const failedNoUrl = jest.fn(() => JSON.stringify([{ databaseId: 2, status: 'completed', conclusion: 'failure', headSha: 'abc' }]));
  expect(() => verifyLatestCi(failedNoUrl, { info: jest.fn() }, { headSha: 'abc' })).toThrow('No successful');
  const stale = jest.fn((executable, args) => executable === 'gh' && args[0] === 'run' && args[1] === 'list'
    ? JSON.stringify([{ databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'old' }])
    : '');
  expect(() => verifyLatestCi(stale, { info: jest.fn() }, { headSha: 'abc' })).toThrow('No successful');
  const incomplete = jest.fn((executable, args) => executable === 'gh' && args[0] === 'run' && args[1] === 'list'
    ? JSON.stringify([{ databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc', url: 'https://github.com/eliware/demo/actions/runs/1' }])
    : JSON.stringify({ headSha: 'abc', jobs: [{ name: 'Test (ubuntu-latest)', status: 'completed', conclusion: 'success', url: 'https://github.com/eliware/demo/actions/runs/1/jobs/1' }] }));
  expect(() => verifyLatestCi(incomplete, { info: jest.fn() }, { headSha: 'abc' })).toThrow('lacks passing');
  const noJobs = jest.fn((executable, args) => executable === 'gh' && args[0] === 'run' && args[1] === 'list'
    ? JSON.stringify([{ databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ headSha: 'abc' }));
  expect(() => verifyLatestCi(noJobs, { info: jest.fn() }, { headSha: 'abc' })).toThrow('lacks passing');
});

test('describes CI jobs when platform coverage is incomplete', () => {
  const execSync = jest.fn((executable, args) => executable === 'gh' && args[0] === 'run' && args[1] === 'list'
    ? JSON.stringify([{ databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ headSha: 'abc', jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }] }));
  expect(() => verifyLatestCi(execSync, { info: jest.fn() }, { headSha: 'abc' })).toThrow('Jobs:');
});

test('reports matching but unsuccessful CI runs', () => {
  const execSync = jest.fn((executable, args) => executable === 'gh' && args[0] === 'run' && args[1] === 'list'
    ? JSON.stringify([{ databaseId: 9, status: 'completed', conclusion: 'failure', headSha: 'abc', url: 'https://github.com/eliware/demo/actions/runs/9' }]) : '');
  expect(() => verifyLatestCi(execSync, { info: jest.fn() }, { headSha: 'abc' })).toThrow('run 9');
});

test('preflight verifies CI for the exact current HEAD', () => {
  const execSync = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'rev-parse') return 'abc';
    if (executable === 'gh' && args[1] === 'list') return JSON.stringify([{ databaseId: 42, status: 'completed', conclusion: 'success', headSha: 'abc' }]);
    if (executable === 'gh' && args[1] === 'view') return JSON.stringify({ headSha: 'abc', jobs: [
      { name: 'Ubuntu', status: 'completed', conclusion: 'success' },
      { name: 'Windows', status: 'completed', conclusion: 'success' },
    ] });
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') return 'All files     100     100     100     100';
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })) };
  expect(runPreflight(execSync, fs, { info: jest.fn() }, { verifyCi: true })).toHaveProperty('ci.ubuntu', true);
});

test('waits for an in-progress exact-head CI run', () => {
  let listed = 0;
  const execSync = jest.fn((executable, args) => {
    if (executable === 'gh' && args[1] === 'list') {
      listed += 1;
      return listed === 1
        ? JSON.stringify([{ databaseId: 7, status: 'in_progress', conclusion: '', headSha: 'abc', url: 'https://github.com/eliware/demo/actions/runs/7' }])
        : JSON.stringify([{ databaseId: 7, status: 'completed', conclusion: 'success', headSha: 'abc', url: 'https://github.com/eliware/demo/actions/runs/7' }]);
    }
    if (executable === 'gh' && args[1] === 'watch') return '';
    return JSON.stringify({ headSha: 'abc', jobs: [
      { name: 'Ubuntu', status: 'completed', conclusion: 'success' }, { name: 'Windows', status: 'completed', conclusion: 'success' },
    ] });
  });
  expect(verifyLatestCi(execSync, { info: jest.fn() }, { headSha: 'abc' })).toMatchObject({ runId: 7, ubuntu: true, windows: true });
  expect(execSync).toHaveBeenCalledWith('gh', ['run', 'watch', '7', '--exit-status', '--interval', '3'], expect.objectContaining({ timeout: 600000 }));
});

test('re-reads CI after a watch command reports failure', () => {
  let listed = 0;
  const execSync = jest.fn((executable, args) => {
    if (executable === 'gh' && args[1] === 'list') {
      listed += 1;
      return listed === 1
        ? JSON.stringify([{ databaseId: 8, status: 'in_progress', conclusion: '', headSha: 'abc' }])
        : JSON.stringify([{ databaseId: 8, status: 'completed', conclusion: 'failure', headSha: 'abc' }]);
    }
    if (executable === 'gh' && args[1] === 'watch') throw new Error('run failed');
    return '';
  });
  expect(() => verifyLatestCi(execSync, { info: jest.fn() }, { headSha: 'abc' })).toThrow('No successful');
});

test('preflight aggregates CI failures after local checks', () => {
  const execSync = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'rev-parse') return 'abc';
    if (executable === 'gh' && args[1] === 'list') throw new Error('network unavailable');
    return executable === 'npm.cmd' && args[0] === 'test' ? 'All files     100     100     100     100' : '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() }, { verifyCi: true })).toThrow('GitHub CI verification failed');
  expectNpmCall(execSync, ['run', 'lint']);
  expectNpmCall(execSync, ['audit', '--omit=dev', '--audit-level=moderate']);
});

test('preflight gives remediation for a failing test and missing coverage', () => {
  const failingTest = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') throw new Error('intentional test failure');
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(failingTest, fs, { info: jest.fn() })).toThrow(/test failed[\s\S]*fix the reported issue/);

  const missingCoverage = jest.fn(() => 'Tests passed without a coverage summary');
  expect(() => runPreflight(missingCoverage, fs, { info: jest.fn() })).toThrow(/100×4 coverage[\s\S]*add tests for the files/);
});

test('preflight reports hanging checks with timer guidance', () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') throw Object.assign(new Error('timed out'), { code: 'ETIMEDOUT' });
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow(/exceeded the 120-second limit[\s\S]*unset timers/);
});

test('preflight aggregates all blocking checks with next actions', () => {
  const execSync = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'status') return ' M package.json';
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') return 'Tests passed without coverage';
    throw new Error(`${executable} failed`);
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() }, { verifyCi: true })).toThrow(
    /uncommitted changes[\s\S]*commit and push[\s\S]*100×4 coverage[\s\S]*fix the reported issue/,
  );
});
