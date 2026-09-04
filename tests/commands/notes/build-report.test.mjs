import { buildNotesReport } from '../../../src/commands/notes/build-report.mjs';

test('composes the notes suggestion, change collection, and formatter', () => {
  const exec = (_command, args) => args[0] === 'describe' ? 'v1.0.0' : args[0] === 'log' ? '' : '';
  const report = buildNotesReport({ readFileSync: () => JSON.stringify({ version: '1.0.0' }) }, exec);
  expect(report).toContain('TAGIT NOTES REPORT');
});
