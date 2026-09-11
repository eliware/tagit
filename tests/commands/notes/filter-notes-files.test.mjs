import { filterNotesFiles } from '../../../src/commands/notes/filter-notes-files.mjs';

test('filters generated and empty paths while preserving source files', () => {
  expect(filterNotesFiles('coverage/report.json\nsrc/index.mjs\nnode_modules/pkg/index.mjs\n')).toEqual([
    'src/index.mjs',
  ]);
});
