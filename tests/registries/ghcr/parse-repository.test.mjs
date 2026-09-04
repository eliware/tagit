import { parseGhcrRepository } from '../../../src/registries/ghcr/parse-repository.mjs';

test('splits a valid owner and image name', () => {
  expect(parseGhcrRepository('eliware/tagit')).toEqual(['eliware', 'tagit']);
});

test('rejects malformed repository names', () => {
  expect(() => parseGhcrRepository('tagit')).toThrow('Invalid GHCR repository');
  expect(() => parseGhcrRepository('eliware/')).toThrow('Invalid GHCR repository');
});
