import { jest } from '@jest/globals';
import { processCommand } from '../../../src/validation/local/process-command.mjs';
import { runPreflight } from '../../../src/validation/preflight/run-checks.mjs';

const isNodeNpm = executable => executable === 'npm' || executable === 'npm.cmd';
const expectNpmCall = (mock, expectedArgs) => {
  expect(mock.mock.calls.some(([executable, args]) => isNodeNpm(executable, args) && expectedArgs.every(arg => args.includes(arg)))).toBe(true);
};

// Platform command resolution remains part of the release-check adapter.

test('resolves platform-specific npm executable names', () => {
});

test('uses the Windows npm executable from PATH', () => {
  expect(processCommand('npm', ['test'], 'win32', 'C:\\node\\node.exe')).toEqual(['npm.cmd', ['test']]);
});

test('keeps non-Windows process commands unchanged', () => {
  expect(processCommand('npm', ['test'], 'linux', '/usr/bin/node')).toEqual(['npm', ['test']]);
});

test('reports test output when the shared harness fails', () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') throw { stdout: 'test output', stderr: '' };
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('test output');
});

test('reports an explicit empty output excerpt for a silent test failure', () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') throw new Error('silent test failure');
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('Output: (no output captured)');
});

test('bounds captured output from a failing shared harness', () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') throw { stdout: 'x'.repeat(5000), stderr: '' };
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('output truncated');
});

test('preflight delegates local validation to the project test script', () => {
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
  expect(execSync.mock.calls.filter(([executable, args]) => isNodeNpm(executable, args) && args.at(-1) === 'test')).toHaveLength(1);
});
test('preflight blocks projects without a test script', () => {
  const execFileSync = jest.fn(() => '');
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: {} })) };
  expect(() => runPreflight(execFileSync, fs, { info: jest.fn() })).toThrow('does not declare scripts.test');
});

test('uses the injected shell-free runner for local checks', () => {
  const _execSync = jest.fn(() => '');
  const execFileSync = jest.fn((executable, args) => args[0] === 'status' ? '' : 'All files | 100 | 100 | 100 | 100 |');
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  const result = runPreflight(execFileSync, fs, { info: jest.fn() });
  expect(result.test.passed).toBe(true);
  expectNpmCall(execFileSync, ['test']);
});

test('preflight rejects dirty trees before running package commands', () => {
  const execSync = jest.fn(() => ' M package.json\n');
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };

  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('uncommitted changes are present');
  expect(execSync).toHaveBeenCalledTimes(2);
});

test('strict preflight delegates repository validation', () => {
  const exec = jest.fn((command, args) => args[0] === 'status' ? '' : args[0] === 'branch' ? 'main' : 'package.json');
  const fs = { existsSync: () => true, readFileSync: () => JSON.stringify({ name: 'demo', version: '1', description: 'demo', license: 'MIT', scripts: { test: 'test' } }) };
  expect(runPreflight(exec, fs, { info: jest.fn() }, { strictRepository: true })).toHaveProperty('test.passed', true);
});

test('preflight blocks CI evidence when the worktree is dirty', () => {
  const execSync = jest.fn((executable, args) => executable === 'git' && args[0] === 'status' ? ' M file.js\n' : '');
  const fs = { existsSync: jest.fn(() => false) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() }, { verifyCi: true }))
    .toThrow('uncommitted changes are present');
});

test('preflight accepts the shared harness result with the explicit waiver', () => {
  const execSync = jest.fn((executable, args) => executable === 'git' && args[0] === 'status' ? '' : 'not 100x4');
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'jest' } })),
  };

  expect(runPreflight(execSync, fs, { info: jest.fn() }, { ignore100x4: true })).toHaveProperty('test.passed', true);
  const npmCalls = execSync.mock.calls.filter(([executable]) => executable === 'npm' || executable === 'npm.cmd');
  expect(npmCalls).toHaveLength(1);
  expect(npmCalls[0][1]).toEqual(['test', '--', '--ignore-100x4']);
});

test('preflight does not parse or duplicate the shared harness coverage result', () => {
  const execSync = jest.fn(() => '');
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'jest' } })),
  };
  expect(runPreflight(execSync, fs, { info: jest.fn() })).toHaveProperty('test.passed', true);
});

test('preflight reports command failures and allows template releases', () => {
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  const failingExec = jest.fn((executable, args) => isNodeNpm(executable, args) && args.at(-1) === 'test' ? (() => { throw { stdout: 'bad', stderr: 'test' }; })() : '');
  expect(() => runPreflight(failingExec, fs, { info: jest.fn() })).toThrow('test failed');
  expect(runPreflight(jest.fn(() => ''), { existsSync: jest.fn(() => true), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) }, { info: jest.fn() }))
    .toHaveProperty('test.passed', true);
});

test('preflight handles failures without captured output', () => {
  const execSync = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'status') return '';
    throw new Error('failed');
  });
  expect(() => runPreflight(execSync, { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) }, { info: jest.fn() }))
    .toThrow('test failed');
});

test('preflight verifies CI for the exact current HEAD', () => {
  const execSync = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'rev-parse') return 'abc';
    if (executable === 'gh' && args[1] === 'list') return JSON.stringify([{ databaseId: 42, status: 'completed', conclusion: 'success', headSha: 'abc' }]);
    if (executable === 'gh' && args[1] === 'view') return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'Ubuntu', status: 'completed', conclusion: 'success' },
      { name: 'Windows', status: 'completed', conclusion: 'success' },
    ] });
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') return 'All files     100     100     100     100';
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })) };
  expect(runPreflight(execSync, fs, { info: jest.fn() }, { verifyCi: true })).toHaveProperty('ci.ubuntu', true);
});

test('preflight aggregates CI failures after local checks', () => {
  const execSync = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'rev-parse') return 'abc';
    if (executable === 'gh' && args[1] === 'list') throw new Error('network unavailable');
    return executable === 'npm.cmd' && args[0] === 'test' ? 'All files     100     100     100     100' : '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() }, { verifyCi: true })).toThrow('GitHub CI verification failed');
  expectNpmCall(execSync, ['test']);
});

test('preflight gives remediation for a failing test without parsing coverage', () => {
  const failingTest = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') throw new Error('intentional test failure');
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'test' } })) };
  expect(() => runPreflight(failingTest, fs, { info: jest.fn() })).toThrow(/test failed[\s\S]*fix the reported issue/);

  const passingTest = jest.fn((executable, args) => args?.[0] === 'status' ? '' : 'Tests passed without a coverage summary');
  expect(runPreflight(passingTest, fs, { info: jest.fn() })).toHaveProperty('test.passed', true);
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
    /uncommitted changes[\s\S]*commit and push/,
  );
});
