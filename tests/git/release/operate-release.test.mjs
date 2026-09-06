import { jest } from '@jest/globals';
import { gitOperations } from '../../../src/git/release/operate-release.mjs';

const log = () => ({ info: jest.fn(), error: jest.fn() });

test('dry-run is non-mutating and does not inspect or execute release commands', () => {
  const exec = jest.fn();
  const fs = { existsSync: jest.fn(), readFileSync: jest.fn() };
  const logger = log();
  expect(gitOperations(exec, fs, logger, '1.0.0', { dryRun: true })).toBeUndefined();
  expect(exec).not.toHaveBeenCalled();
  expect(fs.existsSync).not.toHaveBeenCalled();
  expect(logger.info).toHaveBeenCalledWith('Dry run complete: 1.0.0 was not released');
});

test('creates and pushes only the release tag', () => {
  const exec = jest.fn((executable, args) => {
    if (executable === 'git' && args.join(' ') === 'rev-parse HEAD') return 'abc123\n';
    if (executable === 'git' && args[0] === 'tag') return '';
    if (executable === 'git' && args[0] === 'ls-remote') return 'abc123\trefs/tags/v1.0.0\n';
    return '';
  });
  const logger = log();
  expect(gitOperations(exec, {}, logger, '1.0.0')).toEqual({ commitSha: 'abc123', tag: 'v1.0.0' });
  expect(exec).toHaveBeenCalledWith('git', ['tag', 'v1.0.0', 'abc123'], { stdio: 'inherit' });
  expect(exec).toHaveBeenCalledWith('git', ['push', 'origin', 'v1.0.0'], { stdio: 'inherit' });
  expect(
    exec.mock.calls.some(([, args]) => ['add', 'commit', 'push'].includes(args?.[0]) && args?.[0] !== 'push'),
  ).toBe(false);
  expect(exec.mock.calls.some(([, args]) => args?.[0] === 'push' && args?.[2] !== 'v1.0.0')).toBe(false);
});

test('reuses a tag already pointing at HEAD', () => {
  const exec = jest.fn((executable, args) => {
    if (executable === 'git' && args.join(' ') === 'rev-parse HEAD') return 'abc123\n';
    if (executable === 'git' && args.join(' ') === 'tag --list v1.0.0') return 'v1.0.0\n';
    if (executable === 'git' && args.join(' ') === 'rev-parse v1.0.0') return 'abc123\n';
    if (executable === 'git' && args[0] === 'ls-remote') return 'abc123\trefs/tags/v1.0.0\n';
    return '';
  });
  const logger = log();
  expect(gitOperations(exec, {}, logger, '1.0.0')).toEqual({ commitSha: 'abc123', tag: 'v1.0.0' });
  expect(exec).not.toHaveBeenCalledWith('git', ['tag', 'v1.0.0'], expect.anything());
});

test('rejects a tag that points at another commit', () => {
  const exec = jest.fn((executable, args) => {
    if (executable === 'git' && args.join(' ') === 'rev-parse HEAD') return 'abc123\n';
    if (executable === 'git' && args.join(' ') === 'tag --list v1.0.0') return 'v1.0.0\n';
    if (executable === 'git' && args.join(' ') === 'rev-parse v1.0.0') return 'def456\n';
    return '';
  });
  const logger = log();
  expect(() => gitOperations(exec, {}, logger, '1.0.0')).toThrow('already points to def456');
  expect(logger.error).toHaveBeenCalledWith('Release tag operation failed before remote side effects.');
});

test('rejects an existing tag with empty resolved output', () => {
  const exec = jest.fn((executable, args) => {
    if (executable === 'git' && args.join(' ') === 'rev-parse HEAD') return 'abc123\n';
    if (executable === 'git' && args.join(' ') === 'tag --list v1.0.0') return 'v1.0.0\n';
    if (executable === 'git' && args.join(' ') === 'rev-parse v1.0.0') return undefined;
    return '';
  });
  expect(() => gitOperations(exec, {}, log(), '1.0.0')).toThrow('Cannot verify existing release tag');
});

test('reports tag push failures after the remote operation begins', () => {
  const exec = jest.fn((executable, args) => {
    if (executable === 'git' && args.join(' ') === 'rev-parse HEAD') return 'abc123\n';
    if (executable === 'git' && args[0] === 'tag') return '';
    if (executable === 'git' && args[0] === 'push') throw new Error('push failed');
    return '';
  });
  const logger = log();
  expect(() => gitOperations(exec, {}, logger, '1.0.0')).toThrow('push failed');
  expect(logger.error).toHaveBeenCalledWith(
    'Tag push failed after remote side effects; local files were preserved for reconciliation.',
  );
});

test('rejects a remote tag that resolves to another commit', () => {
  const exec = jest.fn((executable, args) => {
    if (executable === 'git' && args.join(' ') === 'rev-parse HEAD') return 'abc123\n';
    if (executable === 'git' && args[0] === 'tag') return '';
    if (executable === 'git' && args[0] === 'ls-remote') return 'def456\trefs/tags/v1.0.0\n';
    return '';
  });
  expect(() => gitOperations(exec, {}, log(), '1.0.0')).toThrow('does not resolve to HEAD');
});

test('rejects an empty remote tag resolution', () => {
  const exec = jest.fn((executable, args) => {
    if (executable === 'git' && args.join(' ') === 'rev-parse HEAD') return 'abc123\n';
    if (executable === 'git' && args[0] === 'tag') return '';
    if (executable === 'git' && args[0] === 'ls-remote') return '';
    return '';
  });
  expect(() => gitOperations(exec, {}, log(), '1.0.0')).toThrow('does not resolve to HEAD');
});

test('rejects an undefined remote tag resolution', () => {
  const exec = jest.fn((executable, args) => {
    if (executable === 'git' && args.join(' ') === 'rev-parse HEAD') return 'abc123\n';
    if (executable === 'git' && args[0] === 'tag') return '';
    if (executable === 'git' && args[0] === 'ls-remote') return undefined;
    return '';
  });
  expect(() => gitOperations(exec, {}, log(), '1.0.0')).toThrow('does not resolve to HEAD');
});

test('uses the peeled commit for annotated remote tags', () => {
  const exec = jest.fn((executable, args) => {
    if (executable === 'git' && args.join(' ') === 'rev-parse HEAD') return 'abc123\n';
    if (executable === 'git' && args[0] === 'tag') return '';
    if (executable === 'git' && args[0] === 'ls-remote')
      return 'tagsha\trefs/tags/v1.0.0\nabc123\trefs/tags/v1.0.0^{}\n';
    return '';
  });
  expect(gitOperations(exec, {}, log(), '1.0.0')).toMatchObject({ commitSha: 'abc123', tag: 'v1.0.0' });
});

test('rejects an empty HEAD without creating or pushing a tag', () => {
  const exec = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'rev-parse' && args[1] === 'HEAD') return '';
    if (executable === 'git' && args[0] === 'rev-parse') return '';
    return '';
  });
  const logger = log();
  expect(() => gitOperations(exec, {}, logger, '1.0.0')).toThrow('valid current HEAD');
  expect(exec.mock.calls.some(([, args]) => args?.[0] === 'tag' || args?.[0] === 'push')).toBe(false);
});

test('rejects undefined HEAD output without creating or pushing a tag', () => {
  const exec = jest.fn((executable, args) => {
    if (executable === 'git' && args[0] === 'rev-parse') return undefined;
    return undefined;
  });
  expect(() => gitOperations(exec, {}, log(), '1.0.0')).toThrow('valid current HEAD');
});
