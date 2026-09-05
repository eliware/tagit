import { missingMetadataMessage, missingPackageMetadata } from '../../../src/repository/metadata/validate-package-metadata.mjs';

test('finds missing package metadata', () => {
  expect(missingPackageMetadata({ name: 'demo', license: 'MIT' })).toEqual(expect.arrayContaining(['version', 'description', 'keywords', 'author', 'repository', 'homepage', 'engines.node', 'scripts.test', 'scripts.lint', 'exports', 'files', 'publishConfig.access=public', 'publishConfig.provenance=true']));
  expect(missingMetadataMessage('version')).toContain('version');
});

test('accepts complete public package metadata', () => {
  expect(missingPackageMetadata({
    name: 'demo', version: '1.0.0', description: 'Demo', keywords: ['demo'], author: 'Eli',
    repository: { url: 'https://github.com/eliware/demo.git' }, homepage: 'https://github.com/eliware/demo',
    bugs: { url: 'https://github.com/eliware/demo/issues' }, license: 'MIT', engines: { node: '>=26' },
    scripts: { test: 'eliware-test', lint: 'eliware-test --lint' }, exports: { '.': './index.mjs' },
    files: ['README.md'], publishConfig: { access: 'public', provenance: true },
})).toEqual([]);
});

test('validates an optional bugs URL when supplied', () => {
  expect(missingPackageMetadata({ bugs: {} })).toContain('bugs.url');
});
