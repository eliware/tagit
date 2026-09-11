const IGNORED = /(^|\/)(package-lock\.json|coverage|node_modules|\.jest-result|\.jest\.result)(\/|$)/i;

export function filterNotesFiles(changedFiles) {
  return changedFiles
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean)
    .filter((file) => !IGNORED.test(file));
}
