import { jest } from '@jest/globals';
import path from 'node:path';
import { resolvePins, updateGitOpsPins } from '../src/gitopsPins.mjs';

const digest = `sha256:${'a'.repeat(64)}`;

test('resolves exact source repository mappings', () => {
  const registry = { version: 1, pins: [{ sourceRepository: 'eliware/ask', image: 'ghcr.io/eliware/ask', overlay: 'apps/ask/base', files: ['apps/ask/base/deployment.yaml'] }] };
  expect(resolvePins(registry, 'eliware/ask')).toHaveLength(1);
  expect(() => resolvePins(registry, 'eliware/missing')).toThrow('No GitOps image-pin mapping');
  expect(() => resolvePins({ version: 2, pins: [] }, 'eliware/ask')).toThrow('Invalid GitOps image-pin registry');
  expect(() => resolvePins({ version: 1, pins: [{ sourceRepository: 'eliware/ask' }] }, 'eliware/ask'))
    .toThrow('Incomplete GitOps image-pin mapping');
});

test('updates only mapped image references and validates overlays', () => {
  const files = {
    '/gitops/apps/image-pins.json': JSON.stringify({ version: 1, pins: [{
      sourceRepository: 'eliware/ask', image: 'ghcr.io/eliware/ask', overlay: 'apps/ask/base', files: ['apps/ask/base/deployment.yaml'],
    }] }),
    '/gitops/apps/ask/base/deployment.yaml': 'image: ghcr.io/eliware/ask:1.1.6\nimage: busybox:1.36\n',
  };
  const normalize = file => file.replaceAll('\\', '/').replace(/^.:/, '');
  const fs = {
    readFileSync: jest.fn(file => files[normalize(file)]),
    writeFileSync: jest.fn((file, content) => { files[normalize(file)] = content; }),
  };
  const execSync = jest.fn();
  const result = updateGitOpsPins(fs, execSync, { info: jest.fn() }, {
    gitopsRoot: '/gitops', sourceRepository: 'eliware/ask', version: '1.1.7', digest,
  });

  expect(result.files).toEqual(['apps/ask/base/deployment.yaml']);
  expect(files['/gitops/apps/ask/base/deployment.yaml']).toContain(`ghcr.io/eliware/ask:v1.1.7@${digest}`);
  expect(files['/gitops/apps/ask/base/deployment.yaml']).toContain('busybox:1.36');
  expect(execSync).toHaveBeenCalledWith('kubectl kustomize .', { cwd: path.resolve('/gitops/apps/ask/base'), stdio: 'inherit' });
  const execFileSync = jest.fn();
  updateGitOpsPins(fs, execSync, { info: jest.fn() }, {
    gitopsRoot: '/gitops', sourceRepository: 'eliware/ask', version: '1.1.8', digest, execFileSync,
  });
  expect(execFileSync).toHaveBeenCalledWith('kubectl', ['kustomize', '.'], { cwd: path.resolve('/gitops/apps/ask/base'), stdio: 'inherit' });
});

test('supports dry-run and rejects unsafe or incomplete updates', () => {
  const registry = { version: 1, pins: [{ sourceRepository: 'eliware/ask', image: 'ghcr.io/eliware/ask', overlay: 'apps/ask/base', files: ['../secret'] }] };
  const fs = { readFileSync: jest.fn(() => JSON.stringify(registry)), writeFileSync: jest.fn() };
  expect(() => updateGitOpsPins(fs, jest.fn(), { info: jest.fn() }, {
    gitopsRoot: '/gitops', sourceRepository: 'eliware/ask', version: '1.1.7', digest,
  })).toThrow('Unsafe GitOps path');
  expect(() => updateGitOpsPins(fs, jest.fn(), { info: jest.fn() }, {
    gitopsRoot: '/gitops', sourceRepository: 'eliware/ask', version: '1.1', digest,
  })).toThrow('Invalid release version');
  expect(() => updateGitOpsPins(fs, jest.fn(), { info: jest.fn() }, {
    gitopsRoot: '/gitops', sourceRepository: 'eliware/ask', version: '1.1.7', digest: 'sha256:nope',
  })).toThrow('Invalid image digest');
  expect(() => updateGitOpsPins(fs, jest.fn(), { info: jest.fn() }, {
    gitopsRoot: '/gitops', sourceRepository: 'eliware/ask', version: '1.1.7', digest,
  })).toThrow('Unsafe GitOps path');
});

test('requires arguments and an existing mapped image', () => {
  expect(() => updateGitOpsPins()).toThrow('GitOps root and source repository are required');
  expect(() => updateGitOpsPins({ readFileSync: jest.fn() }, jest.fn(), { info: jest.fn() }, {}))
    .toThrow('GitOps root and source repository are required');
  expect(() => updateGitOpsPins({ readFileSync: jest.fn() }, jest.fn(), { info: jest.fn() }, {
    gitopsRoot: '/gitops', sourceRepository: 'eliware/ask', digest,
  })).toThrow('Invalid release version');
  expect(() => updateGitOpsPins({ readFileSync: jest.fn() }, jest.fn(), { info: jest.fn() }, {
    gitopsRoot: '/gitops', sourceRepository: 'eliware/ask', version: '1.1.7',
  })).toThrow('Invalid image digest');
  const registry = { version: 1, pins: [{ sourceRepository: 'eliware/ask', image: 'ghcr.io/eliware/ask', overlay: 'apps/ask/base', files: ['apps/ask/base/deployment.yaml'] }] };
  const fs = { readFileSync: jest.fn(file => file.endsWith('image-pins.json') ? JSON.stringify(registry) : 'image: ghcr.io/other/project:v1.0.0\n'), writeFileSync: jest.fn() };
  expect(() => updateGitOpsPins(fs, jest.fn(), { info: jest.fn() }, {
    gitopsRoot: '/gitops', sourceRepository: 'eliware/ask', version: '1.1.7', digest,
  })).toThrow('was not found');
});

test('does not rewrite an already current pin', () => {
  const registry = { version: 1, pins: [{ sourceRepository: 'eliware/ask', image: 'ghcr.io/eliware/ask', overlay: 'apps/ask/base', files: ['apps/ask/base/deployment.yaml'] }] };
  const fs = {
    readFileSync: jest.fn(file => file.endsWith('image-pins.json')
      ? JSON.stringify(registry) : `image: ghcr.io/eliware/ask:v1.1.7@${digest}\n`),
    writeFileSync: jest.fn(),
  };
  const execSync = jest.fn();
  expect(updateGitOpsPins(fs, execSync, { info: jest.fn() }, {
    gitopsRoot: '/gitops', sourceRepository: 'eliware/ask', version: '1.1.7', digest,
  })).toEqual({ pins: 1, files: [] });
  expect(fs.writeFileSync).not.toHaveBeenCalled();
});

test('dry-run reports changes without writing or validating', () => {
  const registry = { version: 1, pins: [{ sourceRepository: 'eliware/ask', image: 'ghcr.io/eliware/ask', overlay: 'apps/ask/base', files: ['apps/ask/base/deployment.yaml'] }] };
  const fs = {
    readFileSync: jest.fn(file => file.endsWith('image-pins.json')
      ? JSON.stringify(registry) : 'image: ghcr.io/eliware/ask:1.1.6\n'),
    writeFileSync: jest.fn(),
  };
  const execSync = jest.fn();
  expect(updateGitOpsPins(fs, execSync, { info: jest.fn() }, {
    gitopsRoot: '/gitops', sourceRepository: 'eliware/ask', version: '1.1.7', digest, dryRun: true,
  })).toEqual({ pins: 1, files: ['apps/ask/base/deployment.yaml'] });
  expect(fs.writeFileSync).not.toHaveBeenCalled();
  expect(execSync).not.toHaveBeenCalled();
});
