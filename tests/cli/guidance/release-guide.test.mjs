import { releaseGuide } from '../../../src/cli/guidance/release-guide.mjs';
test('documents tag-only release behavior', () => {
  expect(releaseGuide()).toContain('does not rewrite files or create commits');
  expect(releaseGuide()).toContain('pushes only the tag');
});
