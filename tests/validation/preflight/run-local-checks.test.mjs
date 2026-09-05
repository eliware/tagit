import { jest } from '@jest/globals';
import { runLocalChecks } from '../../../src/validation/preflight/run-local-checks.mjs';

const fs = { existsSync: file => file === 'package.json' || file === 'node_modules/@eliware/test/package.json', readFileSync: () => JSON.stringify({ name: 'demo', scripts: { test: 'eliware-test' }, devDependencies: { '@eliware/test': '^4.0.0' } }) };
test('runs the declared shared test command', () => expect(runLocalChecks(jest.fn(), fs).results.test).toEqual({ passed: true }));
test('reports a failed local command', () => expect(runLocalChecks(() => { throw new Error('failed'); }, fs).failures.join('\n')).toContain('test failed'));

import { runPreflight } from '../../../src/validation/preflight/run-checks.mjs';
const isNodeNpm = (executable, args = []) => executable === 'npm' || executable === 'npm.cmd' || (executable === 'cmd.exe' && args.includes('npm.cmd'));
test('reports command failures and silent output', () => {
  const fail = jest.fn((executable, args) => isNodeNpm(executable, args) && args.at(-1) === 'test' ? (() => { throw { stdout: 'bad', stderr: 'test' }; })() : '');
  expect(() => runPreflight(fail, fs, { info: jest.fn() })).toThrow('test failed');
  const silent = jest.fn((executable, args) => isNodeNpm(executable, args) && args.at(-1) === 'test' ? (() => { throw new Error('failed'); })() : '');
  expect(() => runPreflight(silent, fs, { info: jest.fn() })).toThrow('test failed');
});

test('verifies exact-head CI and aggregates CI failures', () => {
  const pass = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'rev-parse') return 'abc';
    if (executable === 'gh' && args[1] === 'list') return JSON.stringify([{ databaseId: 42, status: 'completed', conclusion: 'success', headSha: 'abc' }]);
    if (executable === 'gh' && args[1] === 'view') return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [{ name: 'Ubuntu', status: 'completed', conclusion: 'success' }, { name: 'Windows', status: 'completed', conclusion: 'success' }] });
    return '';
  });
  expect(runPreflight(pass, fs, { info: jest.fn() }, { verifyCi: true })).toHaveProperty('ci.ubuntu', true);
  const fail = jest.fn((executable, args) => executable === 'gh' && args[1] === 'list' ? (() => { throw new Error('network unavailable'); })() : '');
  expect(() => runPreflight(fail, fs, { info: jest.fn() }, { verifyCi: true })).toThrow('GitHub CI verification failed');
});

test('reports timeout remediation and dirty-tree blockers', () => {
  const timeout = jest.fn((executable, args) => isNodeNpm(executable, args) && args.at(-1) === 'test' ? (() => { throw Object.assign(new Error('timed out'), { code: 'ETIMEDOUT' }); })() : '');
  expect(() => runPreflight(timeout, fs, { info: jest.fn() })).toThrow(/exceeded the 120-second limit/);
  const dirty = jest.fn((executable, args) => executable === 'git' && args[0] === 'status' ? ' M package.json' : '');
  expect(() => runPreflight(dirty, fs, { info: jest.fn() }, { verifyCi: true })).toThrow(/uncommitted changes[\s\S]*commit and push/);
});
