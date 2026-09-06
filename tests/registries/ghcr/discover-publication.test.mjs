import { publishesGhcr } from '../../../src/registries/ghcr/discover-publication.mjs';

test('detects GHCR declarations in workflow files', () => {
  const fs = {
    existsSync: () => true,
    readdirSync: () => ['ci.yml', 'notes.txt', 'other.yaml'],
    readFileSync: (file) => (file.endsWith('ci.yml') ? 'image: ghcr.io/eliware/demo' : 'name: test'),
  };
  expect(publishesGhcr(fs)).toBe(true);
});
test('does not infer GHCR publication from missing or unrelated workflows', () => {
  expect(publishesGhcr({ existsSync: () => false })).toBe(false);
  expect(
    publishesGhcr({ existsSync: () => true, readdirSync: () => ['ci.yml'], readFileSync: () => 'npm publish' }),
  ).toBe(false);
});
