import { formatDiffExcerpt } from "./format/diff-excerpt.mjs";
import { readNotesCommits } from "./read/commits.mjs";
import { readNotesDiff } from "./read/diff.mjs";
import { readNotesFiles } from "./read/files.mjs";

export function collectNotesChanges(execFileSync, tag) {
  const commits = readNotesCommits(execFileSync, tag);
  const files = readNotesFiles(execFileSync, tag);
  const diff = readNotesDiff(execFileSync, tag);
  return { commits, files, excerpt: formatDiffExcerpt(diff) };
}
