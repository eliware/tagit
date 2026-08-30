import { jest } from '@jest/globals';
import { buildNotesReport } from '../src/releaseNotesReport.mjs';

function gitRunner(outputs) {
  return jest.fn((executable, args) => {
    const key = args[0] === 'describe' ? 'describe' : args[0] === 'log' ? 'log' : args[0] === 'diff' && args[1] === '--name-only' ? 'name-only' : args[0] === 'diff' && args[1] === '--unified=0' ? 'unified' : args[0] === 'diff' && args[1] === '--name-status' ? 'name-status' : 'diff';
    return outputs[key] ?? '';
  });
}

test('uses shell-free Git arguments for notes when injected', () => {
  const execFileSync = jest.fn((executable, args) => args[0] === 'describe' ? 'v2.0.0' : '');
  const report = buildNotesReport({ readFileSync: () => JSON.stringify({ version: '2.0.0' }) }, execFileSync);
  expect(report).toContain('Range: v2.0.0..HEAD');
  expect(execFileSync).toHaveBeenCalledWith('git', expect.arrayContaining(['log']), expect.any(Object));
});

test('builds a bounded AI release-notes report from the latest tag', () => {
  const execFileSync = gitRunner({ describe: 'v2.0.0', 'name-only': 'src/new.mjs\npackage-lock.json', unified: '+export function newFeature() {}', log: 'abc123 Add feature', 'name-status': 'A\tsrc/new.mjs', diff: 'diff --git a/src/new.mjs b/src/new.mjs' });
  const report = buildNotesReport({ readFileSync: () => JSON.stringify({ version: '2.0.0' }) }, execFileSync);
  expect(report).toContain('Suggested release: 3.0.0 (major)');
  expect(report).toContain('AI ACTIONS');
  expect(report).toContain('RELEASE_NOTES.md');
});

test('handles empty change sections and truncates oversized diffs', () => {
  const execFileSync = gitRunner({ describe: 'v2.0.0', diff: 'x'.repeat(13000) });
  const report = buildNotesReport({ readFileSync: () => JSON.stringify({ version: '2.0.0' }) }, execFileSync);
  expect(report).toContain('(none)');
  expect(report).toContain('diff truncated');
});

test('handles mixed empty and populated report sections', () => {
  const execFileSync = gitRunner({ describe: 'v2.0.0', 'name-only': 'src/a.mjs', 'name-status': 'M\tsrc/a.mjs' });
  expect(buildNotesReport({ readFileSync: () => JSON.stringify({ version: '2.0.0' }) }, execFileSync)).toContain('(none)');
});
