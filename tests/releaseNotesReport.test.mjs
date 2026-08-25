import { jest } from '@jest/globals';
import { buildNotesReport } from '../src/releaseNotesReport.mjs';

test('builds a bounded AI release-notes report from the latest tag', () => {
  const execSync = jest.fn(command => {
    if (command === 'git describe --tags --abbrev=0') return 'v2.0.0';
    if (command.startsWith('git diff --name-only')) return 'src/new.mjs\npackage-lock.json';
    if (command.startsWith('git diff --unified=0')) return '+export function newFeature() {}';
    if (command.startsWith('git log')) return 'abc123 Add feature';
    if (command.startsWith('git diff --name-status')) return 'A\tsrc/new.mjs';
    if (command.startsWith('git diff v2.0.0..HEAD')) return 'diff --git a/src/new.mjs b/src/new.mjs';
    return '';
  });
  const report = buildNotesReport(execSync, { readFileSync: () => JSON.stringify({ version: '2.0.0' }) });
  expect(report).toContain('Suggested release: 3.0.0 (major)');
  expect(report).toContain('AI ACTIONS');
  expect(report).toContain('RELEASE_NOTES.md');
});

test('handles empty change sections and truncates oversized diffs', () => {
  const execSync = jest.fn(command => {
    if (command === 'git describe --tags --abbrev=0') return 'v2.0.0';
    if (command.startsWith('git diff --name-only')) return '';
    if (command.startsWith('git diff --unified=0')) return '';
    if (command.startsWith('git log')) return '';
    if (command.startsWith('git diff --name-status')) return '';
    if (command.startsWith('git diff v2.0.0..HEAD')) return 'x'.repeat(13000);
    return '';
  });
  const report = buildNotesReport(execSync, { readFileSync: () => JSON.stringify({ version: '2.0.0' }) });
  expect(report).toContain('(none)');
  expect(report).toContain('diff truncated');
});

test('handles mixed empty and populated report sections', () => {
  const execSync = jest.fn(command => {
    if (command === 'git describe --tags --abbrev=0') return 'v2.0.0';
    if (command.startsWith('git diff --name-only')) return 'src/a.mjs';
    if (command.startsWith('git diff --unified=0')) return '';
    if (command.startsWith('git log')) return '';
    if (command.startsWith('git diff --name-status')) return 'M\tsrc/a.mjs';
    return '';
  });
  expect(buildNotesReport(execSync, { readFileSync: () => JSON.stringify({ version: '2.0.0' }) })).toContain('(none)');
});
