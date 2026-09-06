import { validateOrigin } from '../../../src/repository/metadata/validate-origin.mjs';
test('normalizes GitHub origin URLs', () => {
  expect(
    validateOrigin(() => 'git@github.com:eliware/tagit.git', {
      repository: { url: 'https://github.com/eliware/tagit' },
    }),
  ).toEqual([]);
});
test('reports origin inspection failures', () => {
  expect(
    validateOrigin(
      () => {
        throw new Error('git unavailable');
      },
      { repository: { url: 'https://github.com/eliware/tagit' } },
    )[0],
  ).toContain('cannot read Git origin');
});
