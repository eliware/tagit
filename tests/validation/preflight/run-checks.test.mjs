import { jest } from '@jest/globals';
import { processCommand } from '../../../src/validation/local/process-command.mjs';
import { runPreflight } from '../../../src/validation/preflight/run-checks.mjs';

const isNodeNpm = (executable, args = []) => executable === 'npm' || executable === 'npm.cmd' || (executable === 'cmd.exe' && args.includes('npm.cmd'));
const expectNpmCall = (mock, expectedArgs) => {
  expect(mock.mock.calls.some(([executable, args]) => isNodeNpm(executable, args) && expectedArgs.every(arg => args.includes(arg)))).toBe(true);
};

// Platform command resolution remains part of the release-check adapter.

test('resolves platform-specific npm executable names', () => {
  expect(processCommand('npm', ['test'], 'win32', 'C:\\node\\node.exe')).toEqual(['cmd.exe', ['/d', '/s', '/c', 'npm.cmd', 'test']]);
});

test('uses the Windows npm executable from PATH', () => {
  expect(processCommand('npm', ['test'], 'win32', 'C:\\node\\node.exe')).toEqual(['cmd.exe', ['/d', '/s', '/c', 'npm.cmd', 'test']]);
});

test('keeps non-Windows process commands unchanged', () => {
  expect(processCommand('npm', ['test'], 'linux', '/usr/bin/node')).toEqual(['npm', ['test']]);
});

test('reports test output when the shared harness fails', () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') throw { stdout: 'test output', stderr: '' };
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('test output');
});

test('reports an explicit empty output excerpt for a silent test failure', () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') throw new Error('silent test failure');
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('Output: (no output captured)');
});

test('bounds captured output from a failing shared harness', () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') throw { stdout: 'x'.repeat(5000), stderr: '' };
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('output truncated');
});

test('preflight delegates local validation to the project test script', () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === 'test') return 'All files     100     100     100     100';
    return '';
  });
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test', audit: 'audit' } })),
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

test('preflight blocks a named project without the installed shared harness', () => {
  const fs = { existsSync: () => true, readFileSync: () => JSON.stringify({ name: 'demo', scripts: { test: 'eliware-test' } }) };
  expect(() => runPreflight(jest.fn(() => ''), fs, { info: jest.fn() })).toThrow('installed, non-linked @eliware/test');
});

test('uses the injected shell-free runner for local checks', () => {
  const _execSync = jest.fn(() => '');
  const execFileSync = jest.fn((executable, args) => args[0] === 'status' ? '' : 'All files | 100 | 100 | 100 | 100 |');
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })) };
  const result = runPreflight(execFileSync, fs, { info: jest.fn() });
  expect(result.test.passed).toBe(true);
  expectNpmCall(execFileSync, ['test']);
});

test('uses a shell-free Windows command wrapper for npm shims', () => {
  const execFileSync = jest.fn((executable, args) => args[0] === 'status' ? '' : 'passed');
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })) };
  runPreflight(execFileSync, fs, { info: jest.fn() });
  const npmCall = execFileSync.mock.calls.find(([executable, args]) => executable === 'cmd.exe' && args.includes('npm.cmd'));
  expect(npmCall?.[1]).toEqual(['/d', '/s', '/c', 'npm.cmd', 'test']);
});

test('preflight rejects dirty trees before running package commands', () => {
  const execSync = jest.fn(() => ' M package.json\n');
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })) };

  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('uncommitted changes are present');
  expect(execSync).toHaveBeenCalledTimes(2);
});

test('strict preflight delegates repository validation', () => {
  const workflow = "on:\n  push:\n    tags:\n      - 'v*'\npermissions:\n  contents: read\njobs:\n  build:\n    steps:\n      - uses: actions/checkout@v6\n      - run: npm ci\n      - run: npm test\n      - run: npm run lint\n      - run: npm run typecheck\n      - run: npm audit --omit=dev --audit-level=moderate\n      - run: npm run pack\n  publish:\n    needs: build\n    if: startsWith(github.ref, 'refs/tags/v')\n    permissions:\n      id-token: write";
  const pkg = { name: 'demo', version: '1.0.0', description: 'demo', keywords: ['demo'], author: 'Eli', repository: { url: 'https://github.com/eliware/demo' }, homepage: 'https://github.com/eliware/demo', license: 'MIT', engines: { node: '>=26' }, devDependencies: { '@eliware/test': '^3.0.0' }, scripts: { test: 'eliware-test', lint: 'eliware-test --lint' }, exports: { '.': './index.mjs' }, files: ['README.md', 'LICENSE', 'RELEASE_NOTES.md'], publishConfig: { access: 'public', provenance: true } };
  const exec = jest.fn((command, args) => args[0] === 'status' ? '' : args[0] === 'branch' ? 'main' : args[0] === 'remote' ? 'https://github.com/eliware/demo.git' : '');
  const fs = { existsSync: () => true, readFileSync: file => file === '.tagit-exceptions.json' ? '{"inapplicable":{}}' : file === 'RELEASE_NOTES.md' ? '## 1.0.0' : file === '.github/workflows/nodejs.yml' ? workflow : JSON.stringify(pkg) };
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
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })),
  };

  expect(runPreflight(execSync, fs, { info: jest.fn() }, { ignore100x4: true })).toHaveProperty('test.passed', true);
  const npmCalls = execSync.mock.calls.filter(([executable, args]) => isNodeNpm(executable, args));
  expect(npmCalls).toHaveLength(1);
  expect(npmCalls[0][1]).toEqual(['/d', '/s', '/c', 'npm.cmd', 'test', '--', '--ignore-100x4']);
});

test('preflight does not parse or duplicate the shared harness coverage result', () => {
  const execSync = jest.fn(() => '');
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })),
  };
  expect(runPreflight(execSync, fs, { info: jest.fn() })).toHaveProperty('test.passed', true);
});
