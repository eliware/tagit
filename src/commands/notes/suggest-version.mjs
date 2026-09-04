import { readPackageVersion } from '../../versioning/read-package-version.mjs';
import { classifyChangeLevel } from '../../versioning/classify-change-level.mjs';
import { suggestNextVersion } from '../../versioning/suggest-next-version.mjs';

const IGNORED = /(^|\/)(package-lock\.json|coverage|node_modules|\.jest-result|\.jest\.result)(\/|$)/i;

export function suggestVersion(fs, execFileSync) {
  const current = readPackageVersion(fs);
  const run = args => execFileSync('git', args, { encoding: 'utf8' });
  const latestTag = run(['describe', '--tags', '--abbrev=0']).trim();
  const files = run(['diff', '--name-only', `${latestTag}..HEAD`]).split(/\r?\n/).map(file => file.trim()).filter(Boolean).filter(file => !IGNORED.test(file));
  const diff = run(['diff', '--unified=0', `${latestTag}..HEAD`, '--', '.', ':!package-lock.json', ':!coverage', ':!node_modules']);
  const { level, reason } = classifyChangeLevel(files, diff);
  return { current, latestTag, level, suggested: suggestNextVersion(current, level), filesConsidered: files.length, reason };
}
