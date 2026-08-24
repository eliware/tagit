const IGNORED = /(^|\/)(package-lock\.json|coverage|node_modules|\.jest-result|\.jest\.result)(\/|$)/i;

function nextVersion(version, level) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (level === 'major') return `${major + 1}.0.0`;
  if (level === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function suggestVersion(execSync, fs) {
  const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const current = packageData.version;
  if (!/^\d+\.\d+\.\d+$/.test(current)) throw new Error(`Cannot suggest a version from invalid current version: ${current}`);
  const latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
  const files = execSync(`git diff --name-only ${latestTag}..HEAD`, { encoding: 'utf8' })
    .split(/\r?\n/).map(file => file.trim()).filter(Boolean).filter(file => !IGNORED.test(file));
  const diff = execSync(`git diff --unified=0 ${latestTag}..HEAD -- . ":!package-lock.json" ":!coverage" ":!node_modules"`, { encoding: 'utf8' });
  let level = 'patch';
  let reason = 'small or non-public changes';
  if (/(BREAKING CHANGE|\bBREAKING\b|^[+].*(export|exports)|^[+].*\"exports\"|^[+].*\"bin\")/mi.test(diff)) {
    level = 'major';
    reason = 'possible breaking public API or command change';
  } else if (files.length >= 5 || (diff.match(/^\+/gm) ?? []).length > 200 || /(^|\/)(src|bin)\//i.test(files.join('\n'))) {
    level = 'minor';
    reason = 'substantial implementation or public feature changes';
  }
  return { current, latestTag, level, suggested: nextVersion(current, level), filesConsidered: files.length, reason };
}
