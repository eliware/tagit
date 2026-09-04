export const requiredRepositoryFiles = ['package.json', 'README.md', 'RELEASE_NOTES.md', '.github/workflows/nodejs.yml'];

export function findMissingRepositoryFiles(fs) {
  return requiredRepositoryFiles.filter(file => !fs.existsSync(file));
}

export function missingFileMessage(file) {
  return `BLOCKED: required repository file is missing: ${file}. Action: restore it and rerun tagit preflight.`;
}
