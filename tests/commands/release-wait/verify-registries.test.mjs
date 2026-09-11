import { jest } from '@jest/globals';
import { verifyRegistries } from '../../../src/commands/release-wait/verify-registries.mjs';
test('skips npm and GHCR when not applicable', async () => {
  await expect(
    verifyRegistries({
      fs: { existsSync: () => false },
      execFile: jest.fn(),
      log: { info: jest.fn() },
      repo: 'eliware/tagit',
      version: '1.0.0',
      release: {},
      packageName: null,
      isPrivate: true,
      maxPolls: 1,
      npmRetries: 1,
      pollMs: 1,
      npmRetryMs: 1,
      sleep: jest.fn(),
    }),
  ).resolves.toEqual({ npm: false, ghcr: false });
});

test('verifies a public npm package when it is visible', async () => {
  const execFile = jest.fn((command, args, options, callback) => callback(null, JSON.stringify('1.0.0'), ''));
  await expect(
    verifyRegistries({
      fs: { existsSync: () => false },
      execFile,
      log: { info: jest.fn(), debug: jest.fn() },
      repo: 'eliware/tagit',
      version: '1.0.0',
      release: {},
      packageName: '@eliware/demo',
      isPrivate: false,
      maxPolls: 1,
      npmRetries: 1,
      pollMs: 1,
      npmRetryMs: 1,
      sleep: jest.fn(),
    }),
  ).resolves.toEqual({ npm: true, ghcr: false });
});

test('verifies GHCR when the workflow publishes an image', async () => {
  const digest = `sha256:${'a'.repeat(64)}`;
  const execFile = jest.fn((command, args, options, callback) =>
    callback(null, JSON.stringify([{ name: digest, metadata: { container: { tags: ['v1.0.0'] } } }]), ''),
  );
  const fs = {
    existsSync: () => true,
    readdirSync: () => ['ci.yml'],
    readFileSync: () => 'image: ghcr.io/eliware/demo',
  };
  await expect(
    verifyRegistries({
      fs,
      execFile,
      log: { info: jest.fn(), debug: jest.fn() },
      repo: 'eliware/demo',
      version: '1.0.0',
      release: { imageDigest: digest },
      packageName: null,
      isPrivate: true,
      maxPolls: 1,
      npmRetries: 1,
      pollMs: 1,
      npmRetryMs: 1,
      sleep: jest.fn(),
    }),
  ).resolves.toEqual({ npm: false, ghcr: true, imageDigest: digest });
});

test('verifies GHCR without an expected digest', async () => {
  const execFile = jest.fn((command, args, options, callback) =>
    callback(null, JSON.stringify([{ metadata: { container: { tags: ['v1.0.0'] } } }]), ''),
  );
  const fs = {
    existsSync: () => true,
    readdirSync: () => ['ci.yml'],
    readFileSync: () => 'image: ghcr.io/eliware/demo',
  };
  await expect(
    verifyRegistries({
      fs,
      execFile,
      log: { info: jest.fn(), debug: jest.fn() },
      repo: 'eliware/demo',
      version: '1.0.0',
      release: {},
      packageName: null,
      isPrivate: true,
      maxPolls: 1,
      npmRetries: 1,
      pollMs: 1,
      npmRetryMs: 1,
      sleep: jest.fn(),
    }),
  ).resolves.toEqual({ npm: false, ghcr: true, imageDigest: null });
});
