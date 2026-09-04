import { suggestVersion } from './suggest-version.mjs';
import { collectNotesChanges } from './collect-changes.mjs';
import { formatNotesReport } from './format-report.mjs';

export function buildNotesReport(fs, execFileSync) {
  const suggestion = suggestVersion(fs, execFileSync);
  return formatNotesReport(suggestion, collectNotesChanges(execFileSync, suggestion.latestTag));
}
