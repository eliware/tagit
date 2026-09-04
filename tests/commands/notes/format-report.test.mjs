import { formatNotesReport } from '../../../src/commands/notes/format-report.mjs';

test('formats notes sections and empty values', () => {
  expect(formatNotesReport({ latestTag: 'v1.0.0', suggested: '1.1.0', level: 'minor', reason: 'feature' }, { commits: '', files: '', excerpt: '' })).toContain('(none)');
});
