import { readRepositoryExceptions } from './read-exceptions.mjs';

export const requiredRepositoryFiles = [
  'package.json', 'README.md', 'AGENTS.md', 'RELEASE_NOTES.md', 'docs/', 'specs/',
  'examples/', '.env.example', '.github/workflows/nodejs.yml',
];

export function findMissingRepositoryFiles(fs) {
  const exceptions = readRepositoryExceptions(fs);
  const exists = file => {
    if (!fs.existsSync(file)) return false;
    if (!file.endsWith('/') || typeof fs.lstatSync !== 'function') return true;
    return fs.lstatSync(file).isDirectory();
  };
  return requiredRepositoryFiles.filter(file => !exceptions[file] && !exists(file));
}

export function missingFileMessage(file) {
  return `BLOCKED: required repository path is missing: ${file}. Action: restore it or add a documented entry for this exact path to .tagit-exceptions.json, then rerun tagit preflight.`;
}
