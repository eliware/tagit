import { classifyChangeLevel } from '../../src/versioning/classify-change-level.mjs';

test('classifies breaking, substantial, and small changes', () => {
  expect(classifyChangeLevel(['README.md'], '+ BREAKING CHANGE')).toMatchObject({ level: 'major' });
  expect(classifyChangeLevel(['src/a.mjs'], '+ implementation')).toMatchObject({ level: 'minor' });
  expect(classifyChangeLevel(['README.md'], 'docs')).toMatchObject({ level: 'patch' });
});
