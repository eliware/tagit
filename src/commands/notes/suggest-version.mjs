import { readPackageVersion } from '../../versioning/read-package-version.mjs';
import { classifyChangeLevel } from '../../versioning/classify-change-level.mjs';
import { suggestNextVersion } from '../../versioning/suggest-next-version.mjs';
import { readNotesChangeInput } from './read-notes-change-input.mjs';
import { filterNotesFiles } from './filter-notes-files.mjs';

export function suggestVersion(fs, execFileSync) {
  const current = readPackageVersion(fs);
  const { latestTag, changedFiles, diff } = readNotesChangeInput(execFileSync);
  const files = filterNotesFiles(changedFiles);
  const { level, reason } = classifyChangeLevel(files, diff);
  return {
    current,
    latestTag,
    level,
    suggested: suggestNextVersion(current, level),
    filesConsidered: files.length,
    reason,
  };
}
